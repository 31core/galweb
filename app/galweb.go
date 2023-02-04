package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
)

var game GamePack

func HttpAPI(w http.ResponseWriter, r *http.Request) {
	path := strings.Split(r.URL.Path, "/")
	command := path[len(path)-1]
	/* Save game data */
	if command == "save" {
		if r.Method != "POST" {
			fmt.Fprint(w, "Method Error")
			return
		}
		err := os.WriteFile("./saves/"+r.PostFormValue("name"), []byte(r.PostFormValue("data")), os.ModePerm)
		if err != nil {
			fmt.Fprintf(w, "Failed while writing '%s'.", r.PostFormValue("name"))
			log.Printf("Failed while writing '%s'.", r.PostFormValue("name"))
		} else {
			fmt.Fprint(w, "OK")
		}
		return
	}
	/* Load game data */
	if command == "load" {
		data, err := os.ReadFile("./saves/" + r.URL.Query().Get("name"))
		if err != nil {
			fmt.Fprintf(w, "Failed while reading '%s'.", r.URL.Query().Get("name"))
			log.Printf("Failed while reading '%s'.", r.URL.Query().Get("name"))
		} else {
			fmt.Fprint(w, string(data))
		}
		return
	}
	if command == "get_config" {
		conf, err := game.GetConfig(r.URL.Query().Get("key"))
		if err != nil {
			log.Printf("\"%s\" is not defiened in package.json\n", r.URL.Query().Get("key"))
			fmt.Printf("\"%s\" is not defiened in package.json", r.URL.Query().Get("key"))
			w.WriteHeader(500)
			return
		}
		fmt.Fprint(w, conf)
		return
	}
	fmt.Fprintf(w, "ERROR: unkown api '%s'", command)
	log.Printf("ERROR: unkown api '%s'", command)
}

func HttpGame(w http.ResponseWriter, r *http.Request) {
	scene := r.URL.Query().Get("scene")
	/* redirect to entry */
	if scene == "" {
		entry, err := game.GetConfig("entry")
		if err != nil {
			log.Panicln("\"entry\" is not defiened in package.json")
			fmt.Fprintln(w, "\"entry\" is not defiened in package.json")
			w.WriteHeader(500)
			return
		}
		w.Header().Set("Location", "/game?scene="+entry)
		w.WriteHeader(302)
	}
	game_html, _ := os.ReadFile(fmt.Sprintf("%s/game.html", config["resource_root"]))
	fmt.Fprint(w, string(game_html))
}

func HttpResource(w http.ResponseWriter, r *http.Request) {
	path := strings.Split(r.URL.Path, "/")
	data, err := os.ReadFile(fmt.Sprintf("%s/%s", config["resource_root"], path[len(path)-1]))

	if err != nil {
		log.Printf("No such file: resource/%s\n", path[len(path)-1])
		w.WriteHeader(404)
		return
	}

	content_type := DetectContentTypeByType(path[len(path)-1])
	if content_type == "application/octect-stream" {
		content_type = http.DetectContentType(data)
	}
	w.Header().Set("Content-Type", content_type)
	fmt.Fprint(w, string(data))
}

func HttpData(w http.ResponseWriter, r *http.Request) {
	path := ""
	for _, str := range strings.Split(r.URL.Path, "/") {
		path += fmt.Sprintf("%s/", str)
	}
	path = path[1 : len(path)-1]

	data, err := game.GetFile(path)

	if err != nil {
		log.Printf("No such file: %s\n", path)
		w.WriteHeader(404)
		return
	}

	content_type := DetectContentTypeByType(path)
	if content_type == "application/octect-stream" {
		content_type = http.DetectContentType(data)
	}
	w.Header().Set("Content-Type", content_type)
	fmt.Fprint(w, string(data))
}

func HttScript(w http.ResponseWriter, r *http.Request) {
	path := strings.Split(r.URL.Path, "/")
	data, err := game.GetFile(fmt.Sprintf("scripts/%s.gws", path[len(path)-1]))

	if err != nil {
		log.Printf("No such file: scripts/%s.gws\n", path[len(path)-1])
		w.WriteHeader(404)
		return
	}

	fmt.Fprint(w, string(data))
}

func HttpIcon(w http.ResponseWriter, r *http.Request) {
	icon, err := game.GetConfig("icon")
	if err != nil {
		fmt.Fprint(w, "\"icon\" is not defined in package.json")
		log.Println("\"icon\" is not defined in package.json")
		w.WriteHeader(500)
		return
	}
	data, err := game.GetFile("data/" + icon)
	if err != nil {
		log.Printf("No such icon: %s\n", icon)
		w.WriteHeader(404)
		return
	}
	w.Header().Set("Content-Type", http.DetectContentType(data))
	fmt.Fprint(w, string(data))
}

func main() {
	if len(os.Args) < 2 || os.Args[1] == "help" {
		fmt.Println(`Usage: ./galweb [command] [args]...
options:
run [game pack]
build [source directory] [game_pack]`)
		return
	}
	if os.Args[1] == "run" {
		game.Open(os.Args[2])
		LoadConfig()
		DefaultConfig()

		if _, err := os.Stat("./saves"); os.IsNotExist(err) {
			os.Mkdir("./saves", os.ModePerm)
		}

		log.Printf("Server is running on %s:%s\n", config["host"], config["port"])

		http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
			data, _ := os.ReadFile(fmt.Sprintf("%s/main.html", config["resource_root"]))
			html := string(data)
			fmt.Fprint(w, string(html))
		})
		http.HandleFunc("/game", HttpGame)
		http.HandleFunc("/api/", HttpAPI)
		http.HandleFunc("/resource/", HttpResource)
		http.HandleFunc("/data/", HttpData)
		http.HandleFunc("/script/", HttScript)
		http.HandleFunc("/save", func(w http.ResponseWriter, r *http.Request) {
			data, _ := os.ReadFile(fmt.Sprintf("%s/save.html", config["resource_root"]))
			fmt.Fprint(w, string(data))
		})
		http.HandleFunc("/load", func(w http.ResponseWriter, r *http.Request) {
			data, _ := os.ReadFile(fmt.Sprintf("%s/load.html", config["resource_root"]))
			fmt.Fprint(w, string(data))
		})
		http.HandleFunc("/favicon.ico", HttpIcon)
		http.ListenAndServe(fmt.Sprintf("%s:%s", config["host"], config["port"]), nil)
	}
	if os.Args[1] == "build" {
		BuildGamePack(os.Args[2], os.Args[3])
	}
}

package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings"
)

var game GamePack

func HttpIndex(w http.ResponseWriter, r *http.Request) {
	data, _ := ioutil.ReadFile(fmt.Sprintf("%s/main.html", config["resource_root"]))
	html := string(data)
	fmt.Fprint(w, string(html))
}

func HttpAPI(w http.ResponseWriter, r *http.Request) {
	path := strings.Split(r.URL.Path, "/")
	command := path[len(path)-1]
	/* Save game data */
	if command == "save" {
		if r.Method != "POST" {
			fmt.Fprint(w, "Method Error")
			return
		}
		err := ioutil.WriteFile("./saves/"+r.PostFormValue("name"), []byte(r.PostFormValue("data")), os.ModePerm)
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
		data, err := ioutil.ReadFile("./saves/" + r.URL.Query().Get("name"))
		if err != nil {
			fmt.Fprintf(w, "Failed while reading '%s'.", r.URL.Query().Get("name"))
			log.Printf("Failed while reading '%s'.", r.URL.Query().Get("name"))
		} else {
			fmt.Fprint(w, string(data))
		}
		return
	}
	if command == "get_config" {
		fmt.Fprint(w, game.GetConfig(r.URL.Query().Get("key")))
		return
	}
	fmt.Fprintf(w, "ERROR: unkown api '%s'", command)
	log.Printf("ERROR: unkown api '%s'", command)
}

func HttpGame(w http.ResponseWriter, r *http.Request) {
	scene := r.URL.Query().Get("scene")
	/* 重定向到entry */
	if scene == "" {
		w.Header().Set("Location", "/game?scene="+game.GetConfig("entry"))
		w.WriteHeader(302)
	}
	_html, _ := ioutil.ReadFile(fmt.Sprintf("%s/game.html", config["resource_root"]))
	_game_data, _ := game.GetFile(fmt.Sprintf("scripts/%s.gws", scene))
	/* 替换game_data */
	_game_data = []byte(strings.ReplaceAll(string(_game_data), "\\", "\\\\")) // \ -> \\
	_game_data = []byte(strings.ReplaceAll(string(_game_data), "\"", "\\\"")) // " -> \"
	_game_data = []byte(strings.ReplaceAll(string(_game_data), "\r\n", "\n")) // CRLF -> LF
	_game_data = []byte(strings.ReplaceAll(string(_game_data), "\r", "\n"))   // CR -> LF
	game_data_list := strings.Split(string(_game_data), "\n")
	game_data := "[\n"
	i := 0
	for {
		if i == len(game_data_list) {
			game_data = game_data[:len(game_data)-1] //delete ','
			break
		}
		if game_data_list[i] == "" {
			i++
			continue
		}
		game_data = fmt.Sprintf("%s\n\"%s\",", game_data, game_data_list[i])
		i++
	}
	game_data = fmt.Sprintf("%s\n%s", game_data, "]")
	/* game_data: [
		"x",
		"x"
	] */
	html := strings.ReplaceAll(string(_html), "{game_data}", game_data)
	fmt.Fprint(w, html)
}

func HttpResource(w http.ResponseWriter, r *http.Request) {
	path := strings.Split(r.URL.Path, "/")
	data, err := ioutil.ReadFile(fmt.Sprintf("%s/%s", config["resource_root"], path[len(path)-1]))

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
	path := strings.Split(r.URL.Path, "/")
	data, err := game.GetFile(fmt.Sprintf("data/%s", path[len(path)-1]))

	if err != nil {
		log.Printf("No such file: data/%s\n", path[len(path)-1])
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

func HttpSave(w http.ResponseWriter, r *http.Request) {
	data, _ := ioutil.ReadFile(fmt.Sprintf("%s/save.html", config["resource_root"]))
	fmt.Fprint(w, string(data))
}

func HttpLoad(w http.ResponseWriter, r *http.Request) {
	data, _ := ioutil.ReadFile(fmt.Sprintf("%s/load.html", config["resource_root"]))
	fmt.Fprint(w, string(data))
}

func HttpIcon(w http.ResponseWriter, r *http.Request) {
	data, err := game.GetFile("data/" + game.GetConfig("icon"))
	if err != nil {
		log.Printf("No such icon: %s\n", game.GetConfig("icon"))
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

		log.Printf("Server is running on %s:%s\n", config["host"], config["port"])

		http.HandleFunc("/", HttpIndex)
		http.HandleFunc("/game", HttpGame)
		http.HandleFunc("/api/", HttpAPI)
		http.HandleFunc("/resource/", HttpResource)
		http.HandleFunc("/data/", HttpData)
		http.HandleFunc("/save", HttpSave)
		http.HandleFunc("/load", HttpLoad)
		http.HandleFunc("/favicon.ico", HttpIcon)
		http.ListenAndServe(fmt.Sprintf("%s:%s", config["host"], config["port"]), nil)
	}
	if os.Args[1] == "build" {
		BuildGamePack(os.Args[2], os.Args[3])
	}
}

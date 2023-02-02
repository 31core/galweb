var game_data;
fetch("/script/" + get_url_arg("scene")).then((res) => {
	return res.text()
}).then((data) => {
	game_data = data;
	game_data = game_data.replaceAll("\r\n", "\n");
	game_data = game_data.split("\n");
	/* 恢复状态 */
	if(get_url_arg("step") != "") {
		step = Number.parseInt(get_url_arg("step"));
	}
	fastward();
	if(current_background != "") {
		set_background(current_background);
	}
	if(current_music != "") {
		play_sound(current_music);
	}
	on_click();
});

var speed;
get_config("text-speed").then((data) => {
	speed = Number.parseInt(data);
});

var music;
var current_background = "";
var current_music = "";
var events_disabled = false;

var timers: number[] = [];
var figures: HTMLImageElement[] = [];

var dialog_info = {
	"character": "",
	"saying": ""
};

function script_parse(str: string) {
	str = str.replaceAll(/ +/g, " ");
	str = str.replaceAll("\\n", "\n");

	var lis: string[] = [];
	var last = 0;
	for(var i = 1; i < str.length; i++) {
		if(str[i] == " " && str[i - 1] != "\\") {
			lis.push(str.slice(last, i));
			last = i + 1;
		}
	}
	lis.push(str.slice(last, str.length));

	for(var i = 0; i < lis.length; i++) {
		lis[i] = lis[i].replaceAll("\\ ", " ");
	}
	return lis;
}

/* Set dialog text */
function dialog(character: string, saying: string) {
	saying = saying.replaceAll("\n", "<br>");
	document.getElementById("character").innerHTML = character;
	document.getElementById("dialog-text").innerHTML = saying;
}

/* execute script */
function execute(code: string) {
	var instructions = script_parse(code);
	/* set dialog text */
	if(instructions[0] == "say") {
		var len = 0;
		var saying = get_code_arg(code, 0);
		var character;
		if(instructions.length == 2) {
			character = "";
			dialog_info["character"] = "";
		}
		else if(instructions.length == 3) {
			character = instructions[2];
			dialog_info["character"] = instructions[2];
		}
		for(var i = 0; i < saying.length; i++) {
			timers.push(setTimeout(() => {
				timers = timers.slice(1);
				dialog(character, saying.slice(0, len + 1));
				len++;
			}, speed * i));
		}
		dialog_info["saying"] = instructions[1];
	}
	/* switch to the next scene */
	else if(instructions[0] == "scene") {
		location.assign("/game?scene=" + instructions[1]);
	}
	/* change background image */
	else if(instructions[0] == "background") {
		var opacity = 10;
		var background = document.getElementById("background");
		var time = 0;
		for(; time < 10; time++) {
			setTimeout(() => {
				background.setAttribute("style", "opacity: " + (10 * opacity).toString() + "%;");
				opacity--;
			},
			time * 15);
		}
		time++;
		setTimeout(() => {
			set_background(instructions[1]);
		},
		time * 10);
		time++
		for(; time < 23; time++) {
			setTimeout(() => {
				background.setAttribute("style", "opacity: " + (10 * opacity).toString() + "%;");
				opacity++;
			},
			time * 15);
		}
	}
	else if(instructions[0] == "play-sound") {
		play_sound(instructions[1])
	}
	else if(instructions[0] == "stop-sound") {
		stop_sound();
	}
	/* 添加人物立绘 */
	else if(instructions[0] == "figure") {
		var figures_div = document.getElementById("figures");
		var figure = document.createElement("img");
		figures.push(figure);

		figure.setAttribute("src", "/data/" + instructions[1]);

		if(figures.length > 3) {
			console.log("Warning: It's not a goot idea to add more than 3 figures.");
		}

		for(var i = 0; i < figures.length; i++) {
			figures[i].setAttribute("style", `position: absolute;
				top: 10%;
				left: ` + ((100 / figures.length) * i + 10).toString() + `%;
				height: 80%;`);
		}
		figures_div.appendChild(figure);
	}
	else if(instructions[0] == "clean-figure") {
		for(let i = 0; i < figures.length; i++) {
			figures[i].remove();
		}
		figures = [];
	}
	else if(instructions[0] == "choice") {
		events_disabled = true;
		var branch = {};
		var choice = [];
		document.getElementById("branch").removeAttribute("hidden");
		for(var i = 1; i < instructions.length; i++) {
			choice.push(document.createElement("a"));
			choice[i - 1].innerHTML = instructions[i].split(":")[0];

			choice[i - 1].setAttribute("class", "button");
			choice[i - 1].setAttribute("href", "/game?scene=" + instructions[i].split(":")[1]);
			choice[i - 1].setAttribute("style", `text-decoration:none;
				position:absolute;
				left: 5%;
				top: ` + (20 * i).toString() + `%;
				width: 85%`);

			document.getElementById("branch").appendChild(choice[i - 1]);
		}
	}
}
/* get code type */
function get_code_type(code: string) {
	return script_parse(code)[0];
}
/* get code args */
function get_code_arg(code: string, num: number) {
	return script_parse(code)[num + 1];
}

/* Set title */
function set_title(title: string) {
	document.getElementById("title").innerHTML = title;
}
/* Set background image */
function set_background(filename: string) {
	current_background = filename;
	document.getElementById("background").setAttribute("src", "/data/" + filename);
}

function play_sound(filename: string) {
	current_music = filename;
	music = new Audio("/data/" + filename);
	music.loop = true;
	music.play();
}

function stop_sound() {
	current_music = "";
	music.pause();
}

/* 通过step获取现在的状态 */
function fastward() {
	for(var i = 0; i < step; i++) {
		if(get_code_type(game_data[i]) == "background") {
			current_background = get_code_arg(game_data[i], 0);
		}
		else if(get_code_type(game_data[i]) == "play-sound") {
			current_music = get_code_arg(game_data[i], 0);
		}
	}
}
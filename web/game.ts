var game_data: string[];
fetch("/script/" + get_url_arg("scene")).then((res) => {
	return res.text()
}).then((data) => {
	data = data.replaceAll("\r\n", "\n");
	game_data = data.split("\n");
	/* restore */
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

var speed: number;
get_config("text-speed").then((data) => {
	speed = Number.parseInt(data);
});

var music: HTMLAudioElement;
var current_background: string;
var current_music: string;
var events_disabled = false;

var timers: number[];
var figures: HTMLImageElement[];

var dialog_info = {
	"character": "",
	"saying": ""
};

function script_parse(str: string): string[] {
	str = str.replaceAll(/ +/g, " ");
	str = str.replaceAll("\\n", "\n");

	let lis: string[];
	let last = 0;
	for(let i = 1; i < str.length; i++) {
		if(str[i] == " " && str[i - 1] != "\\") {
			lis.push(str.slice(last, i));
			last = i + 1;
		}
	}
	lis.push(str.slice(last, str.length));

	for(let i = 0; i < lis.length; i++) {
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
	let instructions = script_parse(code);
	/* set dialog text */
	if(instructions[0] == "say") {
		let len = 0;
		let saying = get_code_arg(code, 0);
		let character: string;
		if(instructions.length == 2) {
			character = "";
			dialog_info["character"] = "";
		}
		else if(instructions.length == 3) {
			character = instructions[2];
			dialog_info["character"] = instructions[2];
		}
		for(let i = 0; i < saying.length; i++) {
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
		let background = document.getElementById("background");
		background.setAttribute("style", "animation: background_disappearing 0.5s;");
		background.addEventListener("animationend", () => {
			set_background(instructions[1]);
			background.setAttribute("style", "animation: background_appearing 0.5s;");
		});
	}
	else if(instructions[0] == "play-sound") {
		play_sound(instructions[1])
	}
	else if(instructions[0] == "stop-sound") {
		stop_sound();
	}
	/* 添加人物立绘 */
	else if(instructions[0] == "figure") {
		let figures_div = document.getElementById("figures");
		let figure = document.createElement("img");
		figures.push(figure);

		figure.setAttribute("src", "/data/" + instructions[1]);

		if(figures.length > 3) {
			console.log("Warning: It's not a goot idea to add more than 3 figures.");
		}

		for(let i = 0; i < figures.length; i++) {
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
		let choice: HTMLAnchorElement[];
		document.getElementById("branch").removeAttribute("hidden");
		for(let i = 1; i < instructions.length; i++) {
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
	for(let i = 0; i < step; i++) {
		if(get_code_type(game_data[i]) == "background") {
			current_background = get_code_arg(game_data[i], 0);
		}
		else if(get_code_type(game_data[i]) == "play-sound") {
			current_music = get_code_arg(game_data[i], 0);
		}
	}
}
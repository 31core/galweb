var code_list: Code[] = [];
fetch("/script/" + get_url_arg("scene")).then((res) => {
	return res.text()
}).then((data) => {
	data = data.replaceAll("\r\n", "\n");
	data = data.replaceAll(/ +/g, " ");
	data = data.replaceAll("\\n", "\n");
	let lines = data.split("\n");
	for(let i = 0; i < lines.length; i++) {
		code_list.push(new Code(lines[i]));
	}
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
var current_background: string = "";
var current_music: string = "";
var events_disabled: boolean = false;

var timers: number[] = [];
var figures: HTMLImageElement[] = [];

var dialog_info = {
	"character": "",
	"saying": ""
};

class Code {
	type: string;
	args: string[];
	constructor(code: string) {
		this.type = code.split(" ")[0];
		this.args = code.split(" ").slice(1);
	}
}



/* Set dialog text */
function dialog(character: string, saying: string) {
	let len: number = 0;
	dialog_info["character"] = character;
	for(let i = 0; i < saying.length; i++) {
		timers.push(setTimeout(() => {
			timers = timers.slice(1);
			saying = saying.replaceAll("\n", "<br>");
			document.getElementById("character").innerHTML = character;
			document.getElementById("dialog-text").innerHTML = saying.slice(0, len + 1);
			len++;
		}, speed * i));
	}
	dialog_info["saying"] = saying;
	
}

/* execute script */
function execute(code: Code) {
	/* set dialog text */
	if(code.type == "say") {
		if(code.args.length == 1) {
			dialog("", code.args[0]);
		}
		else if(code.args.length == 2) {
			dialog(code.args[1], code.args[0]);
		}
	}
	/* switch to the next scene */
	else if(code.type == "scene") {
		location.assign("/game?scene=" + code.args[0]);
	}
	/* change background image */
	else if(code.type == "background") {
		let background = document.getElementById("background");
		background.setAttribute("style", "animation: background_disappearing 0.5s;");
		background.addEventListener("animationend", () => {
			set_background(code.args[0]);
			background.setAttribute("style", "animation: background_appearing 0.5s;");
		});
	}
	else if(code.type == "play-sound") {
		play_sound(code.args[0])
	}
	else if(code.type == "stop-sound") {
		stop_sound();
	}
	/* 添加人物立绘 */
	else if(code.type == "figure") {
		let figures_div = document.getElementById("figures");
		let figure = document.createElement("img");
		figures.push(figure);

		figure.setAttribute("src", "/data/" + code.args[0]);

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
	else if(code.type == "clean-figure") {
		for(let i = 0; i < figures.length; i++) {
			figures[i].remove();
		}
		figures = [];
	}
	else if(code.type == "choice") {
		events_disabled = true;
		let choice: HTMLAnchorElement[];
		document.getElementById("branch").removeAttribute("hidden");
		for(let i = 0; i < code.args.length; i++) {
			choice.push(document.createElement("a"));
			choice[i - 1].innerHTML = code.args[i].split(":")[0];

			choice[i - 1].setAttribute("class", "button");
			choice[i - 1].setAttribute("href", "/game?scene=" + code.args[i].split(":")[1]);
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
function get_code_type(code_str: string) {
	let code: Code = new Code(code_str);
	return code.type;
}
/* get code args */
function get_code_arg(code_str: string, idx: number) {
	let code: Code = new Code(code_str);
	return code.args[idx];
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
		if(code_list[i].type == "background") {
			current_background = code_list[i].args[0];
		}
		else if(code_list[i].type == "play-sound") {
			current_music = code_list[i].args[0];
		}
	}
}
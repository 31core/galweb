var speed = Number.parseInt(get_config("text-speed"));
var music;
var current_background = "";
var current_music = "";
var events_disabled = false;

var timers = [];
var figures = [];

/* 设置对话框 */
function dialog(character, saying) {
	document.getElementById("character").innerHTML = character;
	document.getElementById("dialog-text").innerHTML = saying;
}

/* 执行script代码 */
function execute(code) {
	var instructions = code.split(" ");
	/* 设置对话框 */
	if(instructions[0] == "say") {
		var len = 0;
		var saying = code.split(" ")[1];
		var character;
		if(instructions.length == 2) {
			character = "";
		}
		else if(instructions.length == 3) {
			character = instructions[2];
		}
		for(var i = 0; i < saying.length; i++) {
			timers.push(setTimeout(() => {
				timers = timers.slice(1);
				dialog(character, saying.slice(0, len + 1));
				len++;
			}, speed * i));
		}
	}
	/* 切换到新的场景 */
	else if(instructions[0] == "scene") {
		location.assign("/game?scene=" + instructions[1]);
	}
	/* 替换背景 */
	else if(instructions[0] == "background") {
		var opacity = 10;
		var background = document.getElementById("background");
		var time = 0;
		for(; time < 10; time++) {
			setTimeout(() => {
				background.setAttribute("style", "opacity: " + (10 * opacity).toString() + "%;");
				opacity--;
			},
			time * 10);
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
			time * 10);
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
		for(var i = 0; i < figures.length; i++) {
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

function get_code_type(code) {
	return code.split(" ")[0];
}
/* Set title */
function set_title(title) {
	document.getElementsByTagName("title")[0].innerHTML = get_config("title");
}
/* Set background image */
function set_background(filename) {
	current_background = filename;
	document.getElementById("background").src = "/data/" + filename;
}

function play_sound(filename) {
	current_music = filename;
	music = new Audio("/data/" + filename);
	music.loop = true;
	music.play();
}

function stop_sound() {
	current_music = "";
	music.pause();
}

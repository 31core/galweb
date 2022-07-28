var speed = Number.parseInt(get_config("text-speed"));
var music;
var current_background = "";
var current_music = "";

var timers = [];

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
		set_background(instructions[1]);
	}
	else if(instructions[0] == "play-sound") {
		play_sound(instructions[1])
	}
	else if(instructions[0] == "stop-sound") {
		stop_sound();
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

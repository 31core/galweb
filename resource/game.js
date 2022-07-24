var speed = Number.parseInt(get_config("text-speed"));
var music

/* 设置对话框 */
function dialog(character, saying) {
	document.getElementById("character").innerHTML = character;
	document.getElementById("dialog-text").innerHTML = saying;
}

/* 执行script代码 */
function execute(code) {
	instructions = code.split(" ")
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
			setTimeout(() => {
				dialog(character, saying.slice(0, len + 1));
				len++;
			}, speed * i);
		}
	}
	/* 切换到新的场景 */
	else if(instructions[0] == "scene") {
		location.assign("/game?scene=" + instructions[1]);
	}
	/* 替换背景 */
	else if(instructions[0] == "background") {
		document.getElementsByTagName("body")[0].style.background = "url('data/" + instructions[1] + "')";
	}
	else if(instructions[0] == "play-sound") {
		music = new Audio("data/" + instructions[1]);
		music.loop = true;
		music.play();
	}
	else if(instructions[0] == "stop-sound") {
		music.pause();
	}
}

function get_code_type(code) {
	return code.split(" ")[0];
}
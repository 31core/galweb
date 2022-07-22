function dialog(character, saying) {
	document.getElementById("character").innerHTML = character;
	document.getElementById("dialog-text").innerHTML = saying;
}

function execute(code) {
	instructions = code.split(" ")
	/* 设置对话框 */
	if(instructions[0] == "say") {
		if(instructions.length == 2) {
			dialog("", code.split(" ")[1]);
		}
		else if(instructions.length == 3) {
			dialog(instructions[2], instructions[1]);
		}
	}
	/* 切换到新的场景 */
	else if(instructions[0] == "scene") {
		location.assign("/game?scene=" + instructions[1]);
	}
	/* 替换背景 */
	else if(instructions[0] == "background") {
		document.getElementById("body").style.background = "url('resource/" + instructions[1] + "')";
	}
}

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
			}, 100 * i);
		}
	}
	/* 切换到新的场景 */
	else if(instructions[0] == "scene") {
		location.assign("/game?scene=" + instructions[1]);
	}
	/* 替换背景 */
	else if(instructions[0] == "background") {
		document.getElementById("body").style.background = "url('data/" + instructions[1] + "')";
	}
}

function get_code_type(code) {
	return code.split(" ")[0];
}
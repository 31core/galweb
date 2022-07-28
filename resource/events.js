var step = 0;

function on_click() {
	/* 如果文字还没显示完全则显全 */
	if(timers.length != 0) {
		var saying = game_data[step - 1].split(" ")[1];
		var character;
		if(game_data[step - 1].split(" ").length == 2) {
			character = "";
		}
		else if(game_data[step - 1].split(" ").length == 3) {
			character = game_data[step - 1].split(" ")[2];
		}
		dialog(character, saying);
		/* 取消之前的计时器 */
		for(var i = 0; i < timers.length; i++) {
			clearTimeout(timers[i]);
		}
		timers = [];
		return;
	}
	save("autosave", JSON.stringify({"step": step.toString(), 
		"scene": get_url_arg("scene"), 
		"background": current_background,
		"music": current_music}));
	execute(game_data[step]);
	step++;
	if(get_code_type(game_data[step - 1]) != "say") {
		execute(game_data[step]);
		step++;
	}
}

function on_keydown() {
	if(window.event.keyCode == 13 ||
		window.event.keyCode == 32) {
		on_click();
	}
}

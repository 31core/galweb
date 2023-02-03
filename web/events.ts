var step = 0;

function on_click() {
	if(events_disabled) {
		return;
	}
	/* 如果文字还没显示完全则显全 */
	if(timers.length != 0) {
		let saying = game_data[step - 1].split(" ")[1];
		let character: string;
		if(game_data[step - 1].split(" ").length == 2) {
			character = "";
		}
		else if(game_data[step - 1].split(" ").length == 3) {
			character = game_data[step - 1].split(" ")[2];
		}
		dialog(character, saying);
		/* 取消之前的计时器 */
		for(let i = 0; i < timers.length; i++) {
			clearTimeout(timers[i]);
		}
		timers = [];
		return;
	}
	/* 自动存档 */
	save("autosave", JSON.stringify({"step": step.toString(), 
		"scene": get_url_arg("scene")}));
	execute(game_data[step]);
	step++;
	if(get_code_type(game_data[step - 1]) != "say" &&
		get_code_type(game_data[step - 1]) != "choice") {
		on_click();
	}
}

function on_keydown(event: KeyboardEvent) {
	if(events_disabled) {
		return;
	}
	if(event.key == "Enter" ||
	event.key == " ") {
		on_click();
	}
}

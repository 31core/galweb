var step: number = 0;

function on_click() {
	if(events_disabled) {
		return;
	}
	/* 如果文字还没显示完全则显全 */
	if(timers.length > 0) {
		let saying = code_list[step - 1].args[0];
		let character: string;
		if(code_list[step - 1].args.length == 1) {
			character = "";
		}
		else if(code_list[step - 1].args.length == 2) {
			character = code_list[step - 1].args[1];
		}
		/* cancel active timers */
		for(let i = 0; i < timers.length; i++) {
			clearTimeout(timers[i]);
		}
		set_dialog(character, saying);
		timers = [];
		return;
	}
	/* 自动存档 */
	save("autosave", JSON.stringify({"step": step.toString(), 
		"scene": get_url_arg("scene")}));
	execute(code_list[step]);
	step++;

	if(code_list[step - 1].type != "say" &&
		code_list[step - 1].type != "choice") {
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

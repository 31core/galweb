var step = 0;

function on_click() {
	execute(game_data[step]);
	step++;
	if(get_code_type(game_data[step - 1]) != "say") {
		execute(game_data[step]);
		step++;
	}
}

function on_keydown() {
	if(window.event.keyCode == 32) {
		on_click();
	}
}

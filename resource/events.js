var step = 0;
function on_click() {
	execute(game_data[step]);
	step++;
	if(get_code_type(game_data[step - 1]) == "background") {
		execute(game_data[step]);
		step++;
	}
}

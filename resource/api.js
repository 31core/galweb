/* Save game data */
function save(name, data) {
	data = data.replaceAll("%", "%25");
	data = data.replaceAll("&", "%26");

	var req = new XMLHttpRequest();
	req.open("POST", "/api/save", true);
	req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	req.send("name=" + name + "&data=" + data);
}

/* Load game data */
function load(name) {
	var req = new XMLHttpRequest();
	req.open("GET", "/api/load?name=" + name, false);
	req.send();
	return req.responseText;
}
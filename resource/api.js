/* Save game data */
function save(name, data) {
	data = data.replaceAll("%", "%25");
	data = data.replaceAll("&", "%26");

	let req = new XMLHttpRequest();
	req.open("POST", "/api/save", true);
	req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	req.send("name=" + name + "&data=" + data);
}

/* Load game data */
async function load(name) {
	let res = await fetch("/api/load?name=" + name);
	return res.text();
}

/* 获取配置信息 */
async function get_config(key) {
	let res = await fetch("/api/get_config?key=" + key);
	return res.text();
}

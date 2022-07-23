function save(name, data) {
	var req = new XMLHttpRequest()
	req.open("POST", "/api/save", true)
	req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
	req.send("name=" + name + "&data=" + data)
}

function get_url_arg(key) {
	args = location.search.slice(1).split("&");
	for(var i = 0; i < args.length; i++) {
		if(args[i].split("=")[0] == key) {
			return args[i].split("=")[1];
		}
	}
}

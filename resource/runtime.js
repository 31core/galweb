function get_url_arg(key) {
	args = location.search.slice(1).split("&");
	for(var i = 0; i < args.length; i++) {
		if(args[i].split("=")[0] == key) {
			return args[i].split("=")[1];
		}
	}
}
/* js map -> key1=val1&key2=val2 */
function encode_url_arg(dict) {
	var arg = "";
	for(var i in dict) {
		arg += i + "=" + dict[i] + "&";
	}
	arg = arg.slice(0, -1);
	return arg;
}

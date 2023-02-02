function get_url_arg(key: string): string {
	let args = location.search.slice(1).split("&");
	for(let i = 0; i < args.length; i++) {
		if(args[i].split("=")[0] == key) {
			return decodeURIComponent(args[i].split("=")[1]);
		}
	}
	return "";
}
/* js map -> key1=val1&key2=val2 */
function encode_url_arg(dict: object): string {
	let arg = "";
	for(let i in dict) {
		arg += i + "=" + dict[i] + "&";
	}
	arg = arg.slice(0, -1);
	return arg;
}

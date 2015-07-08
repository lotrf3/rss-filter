function build() {
	var form = document.forms["builder"]
    var url = encodeURIComponent(form["url"].value);
	var path = encodeURIComponent(form["path"].value);
	var query = form["query"].value;
	var result = window.location.hostname + "/url/" + url + "/" + path + "?" + query;
	form["result"].value = result;
}
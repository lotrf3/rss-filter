function build() {
	var form = document.forms["builder"]
    var url = encodeURIComponent(form["url"].value);
	var path = encodeURIComponent(form["path"].value);
	var query = encodeURIComponent(form["query"].value);
	var result = window.location.hostname + "/filter?url=" + url + "&path=" + path + "&q=" + query;
	form["result"].value = result;
}
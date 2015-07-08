var xml2js = require('xml2js');
var express = require('express');
var request = require('request');
var app = express();

function filter(obj, query){
	if (typeof query == "object") {
		for(var property in query)
			if (query.hasOwnProperty(property)) {
				if(query instanceof Array){
					if(filter(obj, query[property]))
						return true;
				} else {
					if(filter(obj[property], query[property]))
						return true;
				}
			}
	}else{
		obj = obj[0];
		var regexp = new RegExp(query, "i");
		if(obj.match(regexp))
			return true;
	}
	return false;
}

app.get('/url/:url/:path', function(req, res){
  request(req.params.url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
		var parser = new xml2js.Parser();
		parser.parseString(body, function(err, result){
		
			var path = req.params.path.split('.');
			var xml = result;
			for(var i=0; i <path.length; i++){
				if(xml.hasOwnProperty(path[i]))
					xml = xml[path[i]];
				else
					res.send("ERROR");
			}
			console.log(req.query);
			for(var i=0; i<xml.length; i++){
				if(filter(xml[i],req.query)){
					xml.splice(i,1);
					i--;
				}
			}
			var builder = new xml2js.Builder();
			res.set('Content-Type', 'text/xml');
			res.send(builder.buildObject(result));
		});
    }
  })
});
app.listen(3000, function(){});

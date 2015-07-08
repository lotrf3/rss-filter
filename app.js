var xml2js = require('xml2js');
var express = require('express');
var request = require('request');
var app = express();

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

app.use(express.static('public'));

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
			if(err)
				res.status(400).send({ error: 'Bad XML/RSS URL' });
			else{
				try{
					var path = req.params.path.split('.');
					var xml = result;
					for(var i=0; i <path.length; i++){
						if(xml.hasOwnProperty(path[i]))
							xml = xml[path[i]];
						else
							res.status(400).send({ error: 'Bad path' });
					}
					for(var i=0; i<xml.length; i++){
						if(filter(xml[i],req.query)){
							xml.splice(i,1);
							i--;
						}
					}
					var builder = new xml2js.Builder();
					res.set('Content-Type', 'text/xml');
					res.send(builder.buildObject(result));
				} catch (err){
					res.status(500).send({ error: 'Oops, server error' });
				}
			}
		});
    }
	else
		res.status(500).send({ error: 'Oops, server error' });
  })
});
app.listen(server_port, server_ip_address, function(){});

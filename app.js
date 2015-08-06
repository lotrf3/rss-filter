var xml2js = require('xml2js');
var express = require('express');
var request = require('request');
var app = express();

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

app.use(express.static('public'));


function is(obj, query){
	var term = query[0].split('.');
	for(var i in term)
		obj = obj[term[i]];
	var regexp = new RegExp(query[1], "i");
	if(obj.match(regexp))
		return true;
	else
		return false;
}

function filter(obj, query){

	if (typeof query == "object") {
		if (query.is){
			return is(obj, query.is);
		}
		else if (query.isnot){
			return !is(obj, query.isnot);
		}
		else if (query.and){
			for(var i in query.and){
				if(!filter(obj, query.and[i]))
					return false;
			}
			return true;
		}
		else if (query.or){
			for(var i in query.or){
				if(filter(obj, query.or[i]))
					return true;
			}
			return false;
		}
		else
			throw "Invalid query JSON";
	}else{
		throw "Bad query";
	}
}

app.get('/filter', function(req, res){
  request(req.query.url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
		var parser = new xml2js.Parser();
		parser.parseString(body, function(err, result){
			if(err)
				res.status(400).send({ error: 'Bad XML/RSS URL' });
			else{
				try{
					var path = req.query.path.split('.');
					var xml = result;
					for(var i=0; i <path.length; i++){
						if(xml.hasOwnProperty(path[i]))
							xml = xml[path[i]];
						else
							res.status(400).send({ error: 'Bad path' });
					}
					for(var i=0; i<xml.length; i++){
						if(filter(xml[i],JSON.parse(req.query.q))){
							xml.splice(i,1);
							i--;
						}
					}
					var builder = new xml2js.Builder();
					res.set('Content-Type', 'text/xml');
					res.send(builder.buildObject(result));
				} catch (err){
					res.status(500).send({ error: err });
				}
			}
		});
    }
	else
		res.status(500).send({ error: 'Oops, server error' });
  });
});
app.listen(server_port, server_ip_address, function(){});

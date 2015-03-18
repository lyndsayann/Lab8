var express = require('express');
var https = require('https');
var http = require('http');
var fs = require('fs');
var url = require('url');
var bodyParser = require('body-parser');
var basicAuth = require('basic-auth-connect');
var app = express();
app.use(bodyParser.json());
var options = {
    host: '127.0.0.1',
    key: fs.readFileSync('ssl/server.key'),
    cert: fs.readFileSync('ssl/server.crt')
};
var auth = basicAuth(function(user, pass) {
    return((user ==='cs360')&&(pass === 'test'));
});
http.createServer(app).listen(80);
https.createServer(options, app).listen(443);
app.get('/', function (req, res) {
	res.send("Get Index");
});
app.use('/', express.static('./html', {maxAge: 60*60*1000}));
app.get('/getcity', function (req, res) {
    	console.log("In getcity route");
	console.log("In REST Service");
	var urlObj = url.parse(req.url,true,false);
	console.log("URL path "+urlObj.pathname);
	console.log("URL search "+urlObj.search);
	console.log("URL query "+urlObj.query["q"]);
	fs.readFile('cities.dat.txt', function (err, data) {
                if(err) throw err;
		var myRe = new RegExp("^"+urlObj.query["q"]);
                console.log(myRe);
		cities = data.toString().split("\n");
  		for(var i = 0; i < cities.length; i++) {
    			var result = cities[i].search(myRe);
    			if(result != -1) {
      				console.log(cities[i]);
    			}
  		}
		var jsonresult = [];
      		for(var i = 0; i < cities.length; i++) {
        		var result = cities[i].search(myRe); 
        		if(result != -1) {
          			console.log(cities[i]);
          			jsonresult.push({city:cities[i]});
        		}	 
      		}	   
      		console.log(jsonresult);
		console.log(JSON.stringify(jsonresult));
		res.writeHead(200);
		res.end(JSON.stringify(jsonresult));
        });
   // res.json([{city:"Price"},{city:"Provo"}]);
  });
app.get('/comment', function (req, res) {
	console.log("In comment route");
	var MongoClient = require('mongodb').MongoClient;
      	MongoClient.connect("mongodb://localhost/weather", function(err, db) {
        	if(err) throw err;
        	db.collection("comments", function(err, comments){
          		if(err) throw err;
          		comments.find(function(err, items){
            			items.toArray(function(err, itemArr){
              				console.log("Document Array: ");
              				console.log(itemArr);
					//res.writeHead(200);
              				//res.end(JSON.stringify(itemArr));
              				res.json(itemArr);
            			});
          		});
        	});
      	});
/*	resarray = [ { Name: 'Mickey', Comment: 'Hello',
        _id: '54f53d5ebf89e6100c2180da' },
      { Name: 'Mark', Comment: 'This is a comment',
        _id: '54f53e21801a52330c04be8a' }
      ]
    	res.json(resarray);*/
});
app.post('/comment', auth, function (req, res) {
    	console.log("In POST comment route");
	

/*	var jsonData = "";

      	req.on('data', function (chunk) {
        	jsonData += chunk;
      	});
      	req.on('end', function () {
        	var reqObj = JSON.parse(jsonData);
        	console.log(reqObj);
        	console.log("Name: "+reqObj.Name);
        	console.log("Comment: "+reqObj.Comment);

		var MongoClient = require('mongodb').MongoClient;
                MongoClient.connect("mongodb://localhost/weather", function(err, db) {
                	if(err) throw err;
                	db.collection('comments').insert(reqObj,function(err, records) {
                		console.log("Record added as "+records[0]._id);
                	});
 		});
*/	
	
    	console.log(req.body);
    	//console.log(req);
    	console.log(req.body.Name);
    	console.log(req.body.Comment);

	 var MongoClient = require('mongodb').MongoClient;
         MongoClient.connect("mongodb://localhost/weather", function(err, db) {
         	if(err) throw err;
                db.collection('comments').insert(req.body,function(err, records) {
                	console.log("Record added as "+records[0]._id+"added?"+records[0]);
                 });
	});
	console.log(req.user);
    	console.log("Remote User");
    	console.log(req.remoteUser);
	res.status(200);
//	res.writeHead(200);
    	res.end();
 //	});
});

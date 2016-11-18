var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var config = require('./config');

var app = express();//build an express app

app.use(bodyParser.json());//middleware to handle request bodies
app.use(express.static('public'));//static middleware to serve static assets

//create function responsible for both the connection to the database
//and the running of the HTTP server
var runServer = function(callback) {
	//use Mongoose to connect to the database using the URL from config.js
	mongoose.connect(config.DATABASE_URL, function(err) {
		if(err && callback) {
			return callback(err);
		}
		//listen for new connections on the configured port
		app.listen(config.PORT, function() {
			console.log('Listening on http://localhost:' + config.PORT);
			//call an optional callback function to signal
			//that everything is up and running
			if(callback) {
				callback();
			}
		});
	});
};

//useful trick for making this file both executable and a module
if(require.main === module) {
	//if script is run directly (via node server.js), then
	//the runServer fxn will be called
	//BUT if file is included from somewhere else (i.e. require('./server')), 
	//then the fxn won't be called allowing the server
	//to be started at a different point.
	runServer(function(err) {
		if(err) {
			console.error(err);
		}
	});
}

exports.app = app;
exports.runServer = runServer;

var Item = require('./models/item');

//fetch a list of all items from database using Item.find
//and return them as JSON
//READ - GET
app.get('/items', function(req, res) {
	Item.find(function(err, items) {
		if(err) {
			return res.status(500).json({
				message: 'Internal Server Error'
			});
		}
		res.json(items);
	});
});			

//CREATE - POST new item using Item.create
app.post('/items', function(req, res) {
	Item.create({
		//take item from request body and return a 201
		//Created status
		name: req.body.name
	}, function(err, item) {
		if(err) {
			//if error w/ database, return a 500 error w/
			//a JSON error message to indicate something
			//has gone wrong
			return res.status(500).json({
				message: 'Internal Server Error'
			});
		}
		res.status(201).json(item);
	});
});


app.put('/items/:id', function(req, res) {
	Item.findOneAndUpdate({_id:req.params.id}, {name: req.body.name}, function(err, item) {
		if(err) {
			res.send(err);
			return;
		}
		res.json({ message: 'Updated shopping list'});
		res.status(200).json(item);
	});
});	


//DELETE - DEL
app.delete('/items/:id', function(req, res) {
	Item.findOneAndRemove({_id:req.params.id}, function(err, item) {
		if(err) {
			console.error('Could not delete item!', item);
			return;
		}
		console.log('Item ',item.id,'successfully deleted!');
		res.sendStatus(200);
	});
});


//Add a catch-all endpoint which will serve a 404
//message if neither of the endpoints were hit by
//a request
app.use('*', function(req, res) {
	res.status(404).json({
		message: 'Not Found'
	});
});

// app.use('*', function(req, res) {
// 	res.status(404).json({
// 		message: 'Not Found'
// 	});
// });

//UPDATE - PUT
// app.put('/items/:id', function(req, res) {
// 	Item.findOneAndUpdate(req.params.id, function(err, item) {
// 			if(err) {
// 				return res.status(500).json({
// 					message: 'Internal Server Error'
// 				});
// 			}	
// 			res.status(201).json(item);
// 			item.name = req.body.name;
// 			item.save = function(err) {
// 				if(err) {
// 					res.send(err);
// 				}
// 				res.json({
// 					message: 'Item was successfully updated!'
// 				});
// 			};
// 		});
// 	});




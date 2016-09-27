'use strict';
var express = require('express');
var app = express();
var morgan = require('morgan');
var nunjucks = require('nunjucks');
var makesRouter = require('./routes');
var wikiRouter = require('./routes/wiki.js')
var authorsRouter = require('./routes/users.js')
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var bodyParser = require('body-parser');
var models = require('./models');
//var socketio = require('socket.io');



// templating boilerplate setup
app.engine('html', nunjucks.render); // how to render html templates
app.set('view engine', 'html'); // what file extension do our templates have
var env = nunjucks.configure('views', { noCache: true }); // where to find the views, caching off



// and then include these two lines of code to add the extension:
var AutoEscapeExtension = require("nunjucks-autoescape")(nunjucks);
env.addExtension('AutoEscapeExtension', new AutoEscapeExtension(env));
// logging middleware
app.use('/', makesRouter);
app.use('/wiki/', wikiRouter);
app.use('/users/', authorsRouter);
app.use(morgan('dev'));

// body parsing middleware
app.use(bodyParser.urlencoded({ extended: true })); // for HTML form submits
app.use(bodyParser.json()); // would be for AJAX requests


// start the server
models.User.sync({})//force: true --> rebuilt db
	.then(function () {
		    return models.Page.sync({})
	})
.then(function () {
	    app.listen(1337, function () {
		            console.log('Server is listening on port 1337!');
			        });
})
.catch(console.error);

app.use(express.static(path.join(__dirname, '/public')));

// modular routing that uses io inside it
app.use('/', makesRouter);

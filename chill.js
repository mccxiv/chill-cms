#!/usr/bin/env node

var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var apiRouter = require('./lib/apiRouter.js');
var status = require('./lib/statusMiddleware.js');
var uploads = require('./lib/uploadMiddlewares.js');
var authentication = require('./lib/authenticationMiddlewares.js');

var app = express();
var args = {port: getPortArg()};
var port = args.port || process.env.PORT || 4600;

app.listen(port);
app.use(bodyParser.json());
app.use(session({
	secret: 'tall gels',
	resave: false,
	saveUninitialized: false
}));

app.use('/', express.static(path.resolve(__dirname, 'static')));
app.use('/', express.static(path.resolve(process.cwd(), 'public')));
app.use('/files', express.static(path.resolve(process.cwd(), 'files')));
app.use('/chill/api', apiRouter);
app.post('/chill/login', authentication.postLogin);
app.post('/chill/admins', authentication.postAdmins);
app.get('/chill/uploads', requireAuthentication, uploads.getUploads);
app.post('/chill/uploads', requireAuthentication, uploads.postUpload);
app.delete('/chill/uploads/:filename', requireAuthentication, uploads.deleteUpload);
app.get('/chill/status', status);

function requireAuthentication(req, res, next) {
	if (req.session.admin) next();
	else res.status(403).end();
}

function getPortArg() {
	for (var i = 0; i < process.argv.length; i++) {
		var val = process.argv[i];
		if (startsWith(val, '--port=')) return val.substring(7);
		else if (startsWith(val, '-p=')) return val.substring(3);
	}
}

function startsWith(string, beginsWith) {
	return string.indexOf(beginsWith) === 0;
}

console.log('Chill CMS is now running on port '+port+' ...');
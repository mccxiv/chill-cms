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
var args = {port: getPortArg(), site: getSiteArg()};
var port = args.port || process.env.PORT || 80;
var site = path.resolve(args.site || 'public');

app.listen(port);
app.use(bodyParser.json());
app.use(session({
	secret: 'tall gels',
	resave: false,
	saveUninitialized: false
}));

app.use('/', express.static(path.resolve(__dirname, 'static')));
app.use('/', express.static(site));
app.use('/files', express.static(path.resolve(process.cwd(), 'files')));
app.use('/chill/api', apiRouter);
app.post('/chill/login', authentication.postLogin);
app.post('/chill/admins', authentication.postAdmins);
app.get('/chill/uploads', requireAuthentication, uploads.getUploads);
app.post('/chill/uploads', requireAuthentication, uploads.postUpload);
app.delete('/chill/uploads/:filename', requireAuthentication, uploads.deleteUpload);
app.get('/chill/status', status);

/* Anything else, serve index.html for pretty URLs */
// TODO this should be an option
app.all('/*', function(req, res) {
	res.sendFile('index.html', {root: site});
});

function requireAuthentication(req, res, next) {
	if (req.session.admin) next();
	else res.status(403).end();
}

function getPortArg() {
	return parseArg('--port') || parseArg('-p');
}

function getSiteArg() {
	return parseArg('--site') || parseArg('-s');
}

/**
 * Checks process.argv for one beginning with arg+'='
 * @param {string} arg
 */
function parseArg(arg) {
	for (var i = 0; i < process.argv.length; i++) {
		var val = process.argv[i];
		if (startsWith(val, arg+'=')) return val.substring(arg.length+1);
	}
}

function startsWith(string, beginsWith) {
	return string.indexOf(beginsWith) === 0;
}

console.log('Chill CMS is now running...');
console.log('- port: '+port);
console.log('- static files: '+site);
console.log('- site data: '+process.cwd());
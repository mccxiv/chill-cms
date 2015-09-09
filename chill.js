#!/usr/bin/env node

var path = require('path');
var lowdb = require('lowdb');
var express = require('express');
var udb = require('underscore-db');
var bcrypt = require('bcrypt-nodejs');
var bodyParser = require('body-parser');
var session = require('express-session');

var app = express();
var router = express.Router();
var sitedb = lowdb('./site-database.json', {async: false});
var chilldb = lowdb('./chill-database.json', {async: false});
var installing = false;
var typeOfId = 'string'; // Currently only supports strings


init();

function init() {
	app.listen(80);
	addDatabaseMixins();
	maybeEnterInstallationMode();
	addMiddlewares();
	serveStaticStuff();
	handleAuthentication();
	handleStatus();
	denyUnauthenticatedApiWrites(); // Must run before api handlers!
	enforceIdType();
	handleApiGet();
	handleApiPost();
	handleApiPut();
	handleApiDelete();
}

function addDatabaseMixins() {
	sitedb._.mixin(udb);
	chilldb._.mixin(udb);
}

function maybeEnterInstallationMode() {
	var admins = chilldb('admins');
	if (admins.size() < 1) {
		console.log('No admin accounts found. Entering Installation mode.');
		console.log('Visit /setup to create an account.');
		installing = true;
	}
}

function addMiddlewares() {
	app.use(bodyParser.json());
	app.use(session({
		secret: 'tall gels',
		resave: false,
		saveUninitialized: false
	}));
	app.use('/api', router);
}

function serveStaticStuff() {
	app.use(express.static(path.resolve(__dirname, 'static/')));
	app.use(express.static(path.resolve(process.cwd(), 'public/')));
}

function handleAuthentication() {
	app.post('/chill/admins', function (req, res) {
		var admins = chilldb('admins');
		var username = req.body.username;
		var password = req.body.password;
		if (!installing) res.status(403).end();
		else if (!username || !password) res.status(400).end();
		else {
			var entry = {username: username, password: bcrypt.hashSync(password)};
			var current = admins.findWhere({username: username});
			if (current) admins.updateWhere({username: username}, entry);
			else admins.insert(entry);
			installing = false;
			res.json({});
		}
	});

	app.post('/chill/login', function (req, res) {
		var admins = chilldb('admins');
		var username = req.body.username;
		var password = req.body.password;
		if (!username || !password) res.status(400).end();
		else {
			var admin = admins.findWhere({username: username});
			if (!admin) res.status(403).end();
			else {
				bcrypt.compare(password, admin.password, function (err, result) {
					if (err || !result) res.status(403).end();
					else {
						req.session.admin = true;
						res.json({});
					}
				});
			}
		}
	});
}

function handleStatus() {
	app.get('/chill/status', function (req, res) {
		res.json({
			admin: req.session.admin,
			installed: !installing
		});
	});
}

function denyUnauthenticatedApiWrites() {
	router.use(function (req, res, next) {
		if (req.method === 'GET' || req.session.admin) next();
		else res.status(403).end();
	});
}

function enforceIdType() {
	router.use(function(req, res, next) {
		if (req.body.id === undefined || typeof req.body.id === typeOfId) next();
		else res.status(400).send('id must be a '+typeOfId);
	});
}

function handleApiGet() {
	router.get('/:resource', function (req, res) {
		res.json(sitedb(req.params.resource));
		console.log('Route /:resource | r: ' + req.params.resource);
	});

	router.get('/:resource/:id', function (req, res) {
		var id = toIntIfValid(req.params.id);
		var result = sitedb(req.params.resource).getById(id);
		if (result) res.json(result);
		else res.status(404).end();
		console.log('Route /:resource/:id | r: ' + req.params.resource + ' id: ' + id);
	});
}

function handleApiPost() {
	router.post('/:resource', function (req, res) {
		var resources = sitedb(req.params.resource);
		var id = toIntIfValid(req.body.id);
		if (id !== undefined && resources.getById(id)) res.status(409).end();
		else {
			resources.insert(req.body);
			res.json({});
		}
		console.log('Route /:resource | r: ' + req.params.resource + ' id: ' + id);
	});
}

function handleApiPut() {
	router.put('/:resource', function (req, res) {
		console.log('PUT /:resource | r: ' + req.params.resource + ' id: ' + req.body.id);
		var resources = sitedb(req.params.resource);
		var result = resources.updateById(req.body.id, req.body);
		if (result) res.json({});
		else res.status(404).end();
	});
}

function handleApiDelete() {
	router.delete('/:resource/:id', function (req, res) {
		var resources = sitedb(req.params.resource);
		var id = toIntIfValid(req.params.id);
		var result = resources.removeById(id);
		if (result) res.json({});
		else res.status(404).end();
		console.log('DELETE /:resource/:id | r: ' + req.params.resource + ' id: ' + id);
	});
}

function toIntIfValid(input) {
	return isInteger(input) ? parseInt(input) : input;
}

function isInteger(input) {
	var regex = /^(0|[1-9][0-9]*)$/;
	return regex.test(input);
}
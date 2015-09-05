var express = require('express');
var lowdb = require('lowdb');
var bodyParser = require('body-parser');
var udb = require('underscore-db');
var session = require('express-session');
var path = require('path');

var app = express();
var cmsdb = lowdb('./db.json');
var userdb = lowdb('./users.json');
var installing = false;
var server = app.listen(80);

init();

function init() {
  addDatabaseMixins();
  maybeEnterInstallationMode();
  addMiddlewares();
  serveStaticStuff();
  denyUnauthenticatedWrites(); // Must run before handlers!
  handleGet();
  handlePost();
  handlePut();
  handleDelete();
}

function addDatabaseMixins() {
  cmsdb._.mixin(udb);
  cmsdb._.mixin(udb);
}

function maybeEnterInstallationMode() {
  var admins = userdb('admins');
  if (!Array.isArray(admins) || admins.size() < 1) {
    console.log('No admin accounts found. Entering Installation mode.');
    console.log('Visit /install to create an account.');
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
}

function serveStaticStuff() {
  app.use(express.static(path.resolve(__dirname, 'static/')));
  app.use(express.static(path.resolve(process.cwd(), 'public/')));
}

function denyUnauthenticatedWrites() {
  app.use(function(req, res, next) {
    if (req.method === 'GET' || req.session.user) next();
    else res.status(403).end();
  });
}

function handleGet() {
  app.get('/:resource', function(req, res) {
    res.json(cmsdb(req.params.resource));
    console.log('Route /:resource | r: '+req.params.resource);
  });

  app.get('/:resource/:id', function(req, res) {
    var result = cmsdb(req.params.resource).getById(req.params.id);
    if (result) res.json(result);
    else res.status(404).end();
    console.log('Route /:resource/:id | r: '+req.params.resource+' id: '+req.params.id);
  });
}

function handlePost() {
  app.post('/:resource', function(req, res) {
    var resources = cmsdb(req.params.resource);
    var id = toIntIfValid(req.body.id);
    if (id !== undefined && resources.getById(id)) res.status(409).end();
    else {
      resources.insert(req.body);
      res.end();
    }
    console.log('Route /:resource | r: '+req.params.resource+' id: '+id);
  });
}

function handlePut() {
  app.put('/:resource', function(req, res) {
    var resources = cmsdb(req.params.resource);
    var result = resources.updateById(req.body.id, req.body);
    if (result) res.end();
    else res.status(404).end();
    console.log('PUT /:resource | r: '+req.params.resource+' id: '+req.body.id);
  });
}

function handleDelete() {
  app.delete('/:resource/:id', function(req, res) {
    var resources = cmsdb(req.params.resource);
    var id = toIntIfValid(req.params.id);
    var result = resources.removeById(id);
    if (result) res.end();
    else res.status(404).end();
    console.log('DELETE /:resource/:id | r: '+req.params.resource+' id: '+id);
  });
}

function toIntIfValid(input) {
  return isInteger(input)? parseInt(input) : input;
}

function isInteger(input) {
  var regex = /^(0|[1-9][0-9]*)$/;
  return regex.test(input);
}
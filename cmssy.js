var express = require('express');
var lowdb = require('lowdb');
var udb = require('underscore-db');
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
  serveStaticStuff();
  handleGet();
}

function addDatabaseMixins() {
  cmsdb._.mixin(udb);
  cmsdb._.mixin(udb);
}

function handleGet() {
  app.get('/:resource/:id?', function(req, res, next) {
    var resourceName = req.params.resource;
    var id = parseInt(req.params.id);
    var resources = cmsdb(resourceName);
    var result;

    console.log('Route /:resource/:id? | resource: '+resourceName+', id: '+id);

    result = isNaN(id)? resources : resources.getById(id);
    if (result) res.json(result);
    else res.status(404).end();
  });
}

function serveStaticStuff() {
  app.use(express.static(path.resolve(__dirname, 'static/')));
  app.use(express.static(path.resolve(process.cwd(), 'public/')));
}

function maybeEnterInstallationMode() {
  var admins = userdb('admins');
  if (!Array.isArray(admins) || admins.size() < 1) {
    console.log('No admin accounts found. Entering Installation mode.');
    console.log('Visit /install to create an account.');
    installing = true;
  }
}
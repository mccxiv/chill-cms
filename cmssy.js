var express = require('express');
var lowdb = require('lowdb');
var path = require('path');

var app = express();
var cmsdb = lowdb('./db.json');
var userdb = lowdb('./users.json');
var installing = false;
var server = app.listen(80);

init();

function init() {
  maybeEnterInstallationMode();
  serveStaticStuff();
}

function serveStaticStuff() {
  app.use(express.static(path.resolve(__dirname, 'static/')));
  app.use(express.static(path.resolve(process.cwd(), 'public/')));
}

function maybeEnterInstallationMode() {
  var admins = userdb('admins');
  if (!Array.isArray(admins) || admins.length < 1) {
    console.log('Entering Installation mode because there are no admin accounts.');
    console.log('Visit /install to create an account.');
    installing = true;
  }
}
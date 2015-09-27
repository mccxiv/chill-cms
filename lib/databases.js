var path = require('path');
var lowdb = require('lowdb');
var udb = require('underscore-db');
var sitedb = lowdb(path.resolve(process.cwd(), 'site-database.json'), {async: false});
var chilldb = lowdb(path.resolve(process.cwd(), 'chill-database.json'), {async: false});

sitedb._.mixin(udb);
chilldb._.mixin(udb);

module.exports = {
	site: sitedb,
	chill: chilldb
};
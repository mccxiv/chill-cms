var sitedb = require('./databases.js').site;
var typeOfId = 'string';
var router = require('express').Router();

denyUnauthenticatedApiWrites();
enforceIdType();
handleApiGet();
handleApiPost();
handleApiPut();
handleApiDelete();

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
		var result = sitedb(req.params.resource).getById(req.params.id);
		if (result) res.json(result);
		else res.status(404).end();
		console.log('Route /:resource/:id | r: ' + req.params.resource + ' id: ' + req.params.id);
	});
}

function handleApiPost() {
	router.post('/:resource', function (req, res) {
		var resources = sitedb(req.params.resource);
		if (req.params.id !== undefined && resources.getById(req.params.id)) res.status(409).end();
		else {
			resources.insert(req.body);
			res.json({});
		}
		console.log('Route /:resource | r: ' + req.params.resource + ' id: ' + req.params.id);
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
		var result = resources.removeById(req.params.id);
		if (result) res.json({});
		else res.status(404).end();
		console.log('DELETE /:resource/:id | r: ' + req.params.resource + ' id: ' + req.params.id);
	});
}

module.exports = router;
var multiparty = require('multiparty');
var fs = require('fs');
var path = require('path');

var FILES_DIR = './files';

function handleGet(req, res) {
	fs.readdir(FILES_DIR, function(err, files) {
		res.json(files);
	});
}

function handlePost(req, res) {
	fs.mkdir(FILES_DIR, function() {
		var form = new multiparty.Form({autoFiles: true, uploadDir: FILES_DIR});
		form.parse(req, function(err, fields, files) {
			if (err) console.log(err);
			else {
				files.files.forEach(function(file) {
					if (!file.size) fs.unlink(file.path);
					else try {fs.renameSync(file.path, path.resolve(FILES_DIR, file.originalFilename));}
					catch (e) {console.log('Unable to rename uploaded file', e);}
				});
			}
		});
		res.redirect('back');
	});
}

function handleDelete(req, res) {
	fs.unlink(path.resolve(FILES_DIR, req.params.filename), function(err) {
		if (err) res.status(500).end();
		else res.json({});
	});
}

module.exports = {
	getUploads: handleGet,
	postUpload: handlePost,
	deleteUpload: handleDelete
};
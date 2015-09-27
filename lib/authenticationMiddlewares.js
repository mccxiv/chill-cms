var chilldb = require('./databases.js').chill;
var bcrypt = require('bcrypt-nodejs');


function handlePostLogin(req, res) {
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
}

function handlePostAdmins(req, res) {
	var admins = chilldb('admins');
	var username = req.body.username;
	var password = req.body.password;
	if (adminExists()) res.status(403).end();
	else if (!username || !password) res.status(400).end();
	else {
		var entry = {username: username, password: bcrypt.hashSync(password)};
		var current = admins.findWhere({username: username});
		if (current) admins.updateWhere({username: username}, entry);
		else admins.insert(entry);
		res.json({});
	}
}

function adminExists() {
	return chilldb('admins').size();
}

module.exports = {
	postLogin: handlePostLogin,
	postAdmins: handlePostAdmins
};
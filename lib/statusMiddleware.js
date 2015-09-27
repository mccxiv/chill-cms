var chilldb = require('./databases.js').chill;

module.exports = function(req, res) {
	res.json({
		admin: !!req.session.admin,
		installed: !!chilldb('admins').size()
	});
};
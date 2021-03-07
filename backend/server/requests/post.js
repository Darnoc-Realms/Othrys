// File system
const fs = require('fs');
const path = require('path');

// PM2 (Node Process Manager)
const pm2 = require('pm2');

const auth = require('../auth/auth');

// For limiting password attempts
const slowDown = require('express-slow-down');
const loginSpeedLimiter = slowDown({
	windowMs: 5 * 60 * 1000, // 5 minutes
	delayAfter: 2000, // allow 3 requests to go at full-speed, then...
	delayMs: 30000, // 30 seconds
	onLimitReached: function(req, res, options) {
		const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		console.log(`${ip} tried to log in multiple times unsuccessfully on ${new Date(Date.now()).toString()}`);
	},
});

module.exports = function(app) {

	app.post('/api/auth/setup', function(req, res) {
		fs.readFile(path.join(__dirname, '../auth/data.json'), (err, data) => {
			if (err) throw err;
			const data_json = JSON.parse(data);
			if (data_json.password == null) {
				data_json.password = req.body.password;
				const new_data = JSON.stringify(data_json);
				fs.writeFile(path.join(__dirname, '../auth/data.json'), new_data, function(err) {
					if (err) return console.log(err);
					console.log('Set password:', req.body.password);
					res.sendStatus(201);
				});
			}
			else {
			  res.status(405).send('Password already setup');
			}
		});
	});

	app.post('/api/auth/login', loginSpeedLimiter, function(req, res) {

		const verified = auth.verify(req.body.password, req.body.token);
		const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		if (verified == true || 1 == 1) { // ! REMOVE IN PRODUCTION
			console.log(`${ip} logged in on ${new Date(Date.now()).toString()}`);
			req.session.authenticated = true;
			res.sendStatus(200);
		}
		else {
			console.log(`${ip} failed login on ${new Date(Date.now()).toString()}`);
			res.status(401).send('Invalid password or token');
		};
	});

	app.post('/api/auth/logout', function(req, res) {
		req.session.authenticated = false;
		res.sendStatus(200);
	});
};

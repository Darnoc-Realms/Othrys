// File system
const fs = require('fs');
const path = require('path');

// PM2 (Node Process Manager)
const pm2 = require('pm2');

// Configuration
const { processes, server } = require('../../config.json');

const auth = require('../auth/auth');

const Screen = require('../../minecraft/screen');
const minecraft_instance = new Screen('minecraft', server.scripts);

// For limiting password attempts
const slowDown = require('express-slow-down');
const loginSpeedLimiter = slowDown({
	windowMs: 5 * 60 * 1000, // 5 minutes
	delayAfter: 3, // allow 3 requests to go at full-speed, then...
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
			if (data_json.username == null) {
				data_json.username = req.body.username;
				const new_data = JSON.stringify(data_json);
				fs.writeFile(path.join(__dirname, '../auth/data.json'), new_data, function(err) {
					if (err) return console.log(err);
					console.log('Set username:', req.body.username);
					res.sendStatus(201);
				});
			}
			else {
			  res.status(405).send('Username already setup');
			}
		});
	});

	app.post('/api/auth/login', loginSpeedLimiter, function(req, res) {

		const verified = auth.verify(req.body.username, req.body.token);
		if (verified == true) {
			const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
			console.log(`${ip} logged in on ${new Date(Date.now()).toString()}`);
			req.session.authenticated = true;
			res.sendStatus(200);
		}
		else {
			res.status(401).send('Invalid username or token');
		};
	});

	app.post('/server/command', function(req, res) {
		if (req.session.authenticated) {
			const command = (req.query.command.includes('/') ? req.query.command : '/' + req.query.command);
			minecraft_instance.command(command);
			res.redirect('/');
		}
		else {
			res.redirect('/?message=red:Lacking permissions');
		};
	});

	app.post('/server/:action', function(req, res) {
		if (req.session.authenticated) {
			switch (req.params.action) {
			case 'start':
				minecraft_instance.start();
				break;
			case 'restart':
				minecraft_instance.command('/stop');
				setTimeout(function() {
					minecraft_instance.start();
				}, 4000);
			}
			res.redirect('/?message=green:Success!');
		}
		else {
			res.redirect('/?message=red:Lacking permissions');
		};
	});

	app.post('/processes/:action', function(req, res) {
		if (req.session.authenticated) {
			switch (req.params.action) {
			case 'start':
				const index = processes.findIndex(x => x.name == req.query.name);
				pm2.start({
					name: processes[index].name,
					script: processes[index].path,
					max_memory_restart : '100M',
				}, function(err, apps) {
					pm2.disconnect();
					if (err) throw err;
				});
				break;
			case 'stop':
				pm2.stop(req.query.name, (err, proc) => {
					if (err) throw err;
				});
				break;
			case 'restart':
				pm2.restart(req.query.name, (err, proc) => {
					if (err) throw err;
				});
			}
		}
		else {
			res.redirect('/?message=red:Lacking permissions');
		};
	});

	app.post('/api/system/:action', function(req, res) {
		if (req.session.authenticated) {
			switch (req.params.action) {
			case 'shutdown':
				console.log('would be shutting down');
				break;
			case 'restart':
				console.log('would be restarting');
				break;
			}
			res.send('Success!');
		}
		else {
			res.status(401);
			res.send('Lacking permissions');
		};
	});
};

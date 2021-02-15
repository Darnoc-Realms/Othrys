// File system
const fs = require('fs');
const path = require('path');

// PM2 (Node Process Manager)
const pm2 = require('pm2');

// Configuration
const { processes, server } = require('../../config.json');

// To execute commands
const { exec } = require('child_process');

// System information to read memory, cpu, and temp stats
const si = require('systeminformation');

// operating system utility module for system uptime, memory, cpus
const osu = require('node-os-utils');
const cpu = osu.cpu;
const mem = osu.mem;

module.exports = function(app) {
	// Index
	app.get('/', function(req, res) {
		// AUTH OVERRIDE FOR DEVELOPMENT
		// req.session.authenticated = true;
		// DISABLE FOR PRODUCTION

		if (req.session.authenticated) {
			pm2.list((err, list) => {
				list.forEach(function(item, index) {
					processes[index].state =
            item.pm2_env.status.charAt(0).toUpperCase() +
            item.pm2_env.status.slice(1);
				});
				cpu.usage().then(cpu_usage => {
					mem.used().then(mem_usage => {
						si.cpuTemperature().then(temp => {
							res.render('pages/panel', {
								processes,
								server,
								cpu_usage,
								mem_usage,
								temp,
							});
						});
					});
				});
			});
		}
		else {
			fs.readFile(path.join(__dirname, '../auth/data.json'), (err, data) => {
				if (err) throw err;
				const data_json = JSON.parse(data);
				if (data_json.username) {
					res.render('pages/login');
				}
				else {
					const qr_code = data_json.twofactor.qr;
					res.render('pages/setup', { qr_code });
				}
			});
		}
	});

	// APIs
	app.get('/api/server', function(req, res) {
		if (req.session.authenticated) {
			res.json(server);
		}
		else {
			res.json('Lacking authentication');
		}
	});

	app.get('/api/log', function(req, res) {
		if (req.session.authenticated) {
			exec('screen -r minecraft -X colon "logfile flush 0^M"', () => {
				 setTimeout(function() {
					 fs.readFile('minecraft/live.log', 'utf8', function(err, log) {
						 res.json(log);
						 exec('screen -r minecraft -X colon "logfile flush 5^M"');
					 });
				 }, 800);
			});
		}
		else {
			res.json('Lacking authentication');
		}
	});

	app.get('/api/processes', function(req, res) {
		if (req.session.authenticated) {
			pm2.list((err, list) => {
				list.forEach(function(item, index) {
					processes[index].state =
					item.pm2_env.status.charAt(0).toUpperCase() +
					item.pm2_env.status.slice(1);
				});
				res.json(processes);
			});
		}
		else {
			res.json('Lacking authentication');
		}
	});

	app.get('/api/system', function(req, res) {
		if (req.session.authenticated) {
			cpu.usage().then(cpu_usage => {
				mem.used().then(mem_usage => {
					si.cpuTemperature().then(temp => {
						const system = {
							cpu_usage: cpu_usage,
							mem_usage: mem_usage,
							temp: temp,
						};
						res.json(system);
					});
				});
			});
		}
		else {
			res.json('Lacking authentication');
		}
	});

	app.get('/logout', function(req, res) {
		req.session.authenticated = false;
		res.redirect('/?message=yellow:Successful logout!');
	});
};

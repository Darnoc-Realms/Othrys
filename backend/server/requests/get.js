// File system
const fs = require('fs');
const path = require('path');

// PM2 (Node Process Manager)
const pm2 = require('pm2');

// To execute commands
const { exec } = require('child_process');

// System information to read memory, cpu, and temp stats
const si = require('systeminformation');

// operating system utility module for system uptime, memory, cpus
const osu = require('node-os-utils');
const cpu = osu.cpu;
const mem = osu.mem;

module.exports = function(app) {

	app.get('/api/system/stats', function(req, res) {
		if (req.session.authenticated) {
			cpu.usage().then(cpu_usage => {
				mem.used().then(mem_usage => {
					si.cpuTemperature().then(temp => {
						const system = {
							cpu: Math.round(cpu_usage * 10) / 10,
							memory: [Math.round(mem_usage.usedMemMb / 100) / 10, Math.round(mem_usage.totalMemMb / 100) / 10],
							temperature: Math.round(temp.main * 10) / 10,
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

	app.get('/api/auth/status', function(req, res) {
		if (req.session.authenticated) {
			res.json([true, 'logged in']);
		}
		else {
			fs.readFile(path.join(__dirname, '../auth/data.json'), (err, data) => {
				if (err) throw err;
				const data_json = JSON.parse(data);
				if (data_json.password != null) {
					res.json([false, 'login']);
				}
				else {
					res.json([false, 'setup']);
				}
			});
		}
	});

	app.get('/api/auth/setup_qr', function(req, res) {
		fs.readFile(path.join(__dirname, '../auth/data.json'), (err, data) => {
			if (err) throw err;
			const data_json = JSON.parse(data);
			if (data_json.password == null) {
				res.json(data_json.twofactor.qr);
			}
			else {
				res.status(405).send('Password already setup');
			}
		});
	});
};

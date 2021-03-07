// File system
const fs = require('fs');

const auth = require('../auth/auth');

const uuid = require('uuid-1345'); // for hash

// Socket.io
const io = require('socket.io')(3000, {
	cors: {
		origin: 'http://localhost:8080',
		methods: ['GET', 'POST'],
		credentials: true,
	},
});
module.exports = io;

const socket_tokens = [];

io.on('connection', function(socket) {
	socket.on('check', function(data) {
		if (socket_tokens.includes(data.socket_token)) {
			socket.join('authenticated');
			socket.emit('authenticated');
		}
	}),
	socket.on('login', function(data) {
		const verified = auth.verify(data.username, data.token);
		if (verified == true || 1 == 1) {
			// ! REMOVE IN PRODUCTION
			socket.join('authenticated');
			const socket_token = uuid.v4();
			socket_tokens.push(socket_token);
			socket.emit('authenticated', { socket_token: socket_token });
		}
	});
	socket.on('catchup', function() {
		if (socket.rooms.has('authenticated')) {
			fs.readFile('./config/processes.json', (err, file) => {
				if (err) throw err;
				const processes = JSON.parse(file);
				Object.keys(processes).forEach((id) => {
					fs.readFile(
						'./store/processes/' + id + '.txt',
						function(err, store) {
							if (err) throw err;
							const catchup_lines = store.toString().split('\n');
							socket.emit('new_lines', { id: id, lines: catchup_lines });
						},
					);
				});
			});
		}
	});
	socket.on('sessions', () => {
		if (socket.rooms.has('authenticated')) {
			fs.readFile('./config/processes.json', (err, file) => {
				if (err) throw err;
				const processes = JSON.parse(file);
				const keys = Object.keys(processes);
				keys.forEach((id) => {
					socket.emit('new_session', {
						id: id,
						name: processes[id].name,
						total: keys.length,
					});
				});
			});
		}
	});
	socket.on('logout', function() {
		if (socket.rooms.has('authenticated')) {
			socket.leave('authenticated');
		}
	});
	socket.on('command', function(data) {
		if (socket.rooms.has('authenticated')) {
			const processes = require('./processes');
			processes.loaded[data.id].sendCommand(data.command);
		}
	});
});

// File system
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

const pty = require('node-pty');

const ansi_to_html = require('ansi-to-html');
const ansiConverter = new ansi_to_html({
	newline: true,
	escapeXML: true,
});

const uuid = require('uuid-1345'); // for hash

const io = require('./socket.js'); // to send client output


class Process {
	constructor(options) {
		this.id = options.id;
		this.store = path.join(__dirname, '../../store/processes/' + this.id + '.txt');
		this.pty = pty.spawn('ksh', [], {
			name: 'xterm-color',
			cols: 155,
			rows: 25,
			cwd: process.env.HOME,
			env: process.env,
		});
		this.previousCommand = '';
		this.clearStore();
		this.dataEvent();
	}

	clearStore() {
		fs.writeFile(this.store, '', (err) => { if (err) throw err; });
	}

	dataEvent() {
		this.pty.on('data', (data) => {
			data = ansiConverter.toHtml(data).trim();
			data = data.replace(/^<br\/>|<br\/>$/, '');
			data = data.replace(/<br\/>\$$/, '');
			data = data.replace(/\t/g, '&nbsp;&nbsp;&nbsp');
			if (data != '<br/>' && data != '' && data != '$') {
				const lines = data.split('<br/>');
				lines.forEach(line => {
					const new_line = (line == this.previousCommand) ? '$ ' + line : line;
					io.to('authenticated').emit('new_lines', { id: this.id, lines: [new_line] });
					fs.appendFile(this.store, '\n' + new_line, function(err) {
						if (err) throw err;
					});
				});
			}
		});
	}

	sendCommand(command) {
		this.pty.write(command + '\r');
		this.previousCommand = command;
	}
}

const loaded = {};

function initialLoad() {
	rimraf(path.join(__dirname, '../../store/processes/*.txt'), function() {
		fs.readFile(path.join(__dirname, '../../config/processes.json'), function(err, data) {
			if (err) throw err;
			if (data != '') {
				data = JSON.parse(data);
				Object.keys(data).forEach((id) => {
					loaded[id] = new Process({ id: id, scripts: data[id].scripts });
				});
			}
			else {
				fs.writeFile(path.join(__dirname, '../../config/processes.json'), '{}', (err) => {
					if (err) throw err;
				});
			}
		});
	});
}

function newProcess(name, scripts) {
	/* scrips: {
		start: 'path/to/file.sh', // required
		custom_update: 'path/to/file.sh', // optional
	   } */
	fs.readFile(path.join(__dirname, '../../config/processes.json'), function(err, data) {
		if (err) throw err;
		data = JSON.parse(data);
		const new_process = {
			id: uuid.v4(),
			name,
			scripts,
		};
		data[new_process.id] = new_process;
		fs.writeFile(path.join(__dirname, '../../config/processes.json'), JSON.stringify(data), (err) => {
			if (err) throw err;
			loaded[new_process.id] = new Process({ id: new_process.id, scripts: new_process.scripts });
		});
	});
}

function test() {
	console.log('hello there');
}

module.exports = { initialLoad, newProcess, loaded, test };
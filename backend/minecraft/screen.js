// To execute commands
const { exec } = require('child_process');

const fs = require('fs');

class Screen {
	constructor(name, scripts) {
		this.name = name;
		this.scripts = scripts;
	}

	start() {
		fs.writeFileSync(`${__dirname}/live.log`, '');
		exec(`screen -L -Logfile "${__dirname}/live.log" -dmS ${this.name} bash ${this.scripts.start}`, (error, stdout, stderr) => {
			if (error) {
				console.log(`error: ${error.message}`);
				return;
			}
			if (stderr) {
				console.log(`stderr: ${stderr}`);
				return;
			}
		});
	}

	stop() {
		exec(`screen -XS ${this.name} quit`, (error, stdout, stderr) => {
			if (error) {
				console.log(`error: ${error.message}`);
				return;
			}
			if (stderr) {
				console.log(`stderr: ${stderr}`);
				return;
			}
		});
	}

	command(command) {
		exec(`bash "${this.scripts.command}" "${command}"`, (error, stdout, stderr) => {
			if (error) {
				console.log(`error: ${error.message}`);
				return;
			}
			if (stderr) {
				console.log(`stderr: ${stderr}`);
				return;
			}
		});
	}
}

module.exports = Screen;

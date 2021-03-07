const twofactor = require('node-2fa');
// File system
const fs = require('fs');
const path = require('path');

// 1 genetate secret if not known before
function generate_secret() {
	fs.exists(path.join(__dirname, 'data.json'), (exists) => {
		if (exists) {
			console.info('\x1b[32m%s\x1b[0m', 'Login at http://localhost:8080');
		}
		else {
			const new_secret = twofactor.generateSecret({ name: 'DRNC Panel' });
			const data = JSON.stringify({ password: null, twofactor: new_secret });
			fs.writeFile(path.join(__dirname, 'data.json'), data, function(err) {
				if (err) return console.log(err);
				console.info('\x1b[33m%s\x1b[0m', 'Set up a password and password at http://localhost:8080');
			});
		}
	});
}

// 2 show qr keycode

function verify(password, token) {
	const data = fs.readFileSync(path.join(__dirname, 'data.json'));
	const data_json = JSON.parse(data);
	const delta = twofactor.verifyToken(data_json.twofactor.secret, token, 0.5);
	if (delta) {
		if (delta.delta == 0.5) {
			return true;
		}
		else {
			return false;
		}
	}
}

// 3

module.exports = { generate_secret, verify };

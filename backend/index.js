// File system
const fs = require('fs');

// PM2 (Node Process Manager)
const pm2 = require('pm2');

// Generate Secret
const auth = require('./server/auth/auth');
auth.generate_secret();

// Express
const express = require('express');
const app = express();
const uuid = require('uuid-1345'); // for hash
const session = require('express-session');
const sessionMiddleware = session({
	resave: false,
	saveUninitialized: false,
	unset: 'destroy',
	 secret: uuid.v4(),
	 cookie: {
		 maxAge: 60 * 1000 * 60 * 24,
		 secure: false, // change to true in production
		 httpOnly: false,
	 },
});
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true,
}));

const cors = require('cors');
app.use(cors({
	origin: [
	  'http://localhost:8080',
	  'https://localhost:8080',
	  'http://localhost:8899',
	  'http://127.0.0.1:5500',
	],
	credentials: true,
	exposedHeaders: ['set-cookie'],
}));
// app.enable('trust proxy');

app.use(sessionMiddleware);

// Routes
require('./server/requests/get')(app);
require('./server/requests/post')(app);

const processes = require('./server/loaders/processes');
processes.initialLoad();

/*

// Start PM2 sessions for each Node process in config
pm2.connect(function(err) {
	if (err) {
		console.error(err);
		process.exit(2);
	}

	processes.forEach(function(process) {
		pm2.start({
			name: process.name,
			script: process.path,
			max_memory_restart : '100M',
		}, function(err, apps) {
			// Disconnects from PM2
			pm2.disconnect();
			if (err) throw err;
		});
	});

});

*/


app.listen(8899);
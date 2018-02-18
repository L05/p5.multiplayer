let clients = [];
let screens	= [];

// setup express web server and listen on port 3000
let express = require('express');
let app = express();
let server = app.listen(3000);

app.use(express.static('public'));

console.log("My socket server is running");

// start socket.io
let socket = require('socket.io');

// connect it to the web server
let io = socket(server);

// setup a connectino event
io.sockets.on('connection', newConnection);

function newConnection(socket) {
	clients.push(socket.id);
	console.log('\n' + socket.id + 'has connected!');
	console.log('number of clients: ' + clients.length);

	// Add a screen client if it requests to join.
	socket.on('join', function (data) {
		socket.join(data.name);
		screens.push(socket.id);
		console.log('screen added.\tnumber of screens: ' + screens.length);
	})

	// Handle client disconnects.
	socket.on('disconnect', function () {
		console.log('\n' + socket.id + ' has been disconnected!');
		io.sockets.in('screen').emit('clientDisconnect', {id: socket.id});
		// Remove from client array
		let i = clients.indexOf(socket.id);
		clients.splice(i, 1);
		console.log('number of clients: ' + clients.length);

		// If screen, remove the screens array.
		for (let i = 0; i < screens.length; i++) {
			if (socket.id == screens[i]) {
				i = screens.indexOf(socket.id);
				screens.splice(i, 1);
				console.log('screen removed.\tnumber of screens: ' + screens.length);
			}
		}
	})

	// Handle client connects.
	socket.on('clientConnect', rerouteConnect);

	function rerouteConnect(data) {
		// send it back out
		// socket.broadcast.emit('mouse', data); // does not include the client that sent the message
		// io.sockets.emit('mouse', data); // would include client that sent the message

		console.log('clientConnect message received from ' + socket.id + ' with color: (' + data.r + ', ' + data.g + ', ' + data.b + ')');
		io.sockets.in('screen').emit('clientConnect', {id: socket.id, r: data.r, g: data.g, b: data.b});
	}

	// If mobile client rotation data is received...
	socket.on('rotation', rerouteRotation);

	function rerouteRotation(data) {
		io.sockets.in('screen').emit('rotation', {id: socket.id, rotX: data.rotX, rotY: data.rotY, rotZ: data.rotZ});
	}

	// If mobile client trackPad data is received...
	socket.on('trackPad', rerouteTrackPad);

	function rerouteTrackPad(data) {
		io.sockets.in('screen').emit('trackPad', {id: socket.id, padX: data.padX, padY: data.padY});
	}
}

let clients = [];
let screens	= [];

// setup express web server and listen on port 3000
let express = require('express');
let app = express();
let port=Number(process.env.PORT || 3000);
let server = app.listen(port);

app.use(express.static('public'));

console.log("My socket server is running on port " + port);

// start socket.io
let socket = require('socket.io');

// connect it to the web server
let io = socket(server);

// setup a connection event
io.sockets.on('connection', newConnection);

function newConnection(socket) {

	console.log('\n' + socket.id + 'has connected!');
	socket.emit('id', socket.id);

	// Add a screen client if it requests to join.
	socket.on('join', function (data) {
		// add new socket to respective room (i.e. clients or screens)
		socket.join(data.name);

		if (data.name == 'client') {
			// add client socket id to clients list
			clients.push(socket.id);
			console.log('client added.\tnumber of clients: ' + clients.length);

			// add client to its own room
			socket.join(socket.id);
		} else if (data.name == 'screen') {
			// add screen socket id to screens list
			screens.push(socket.id);
			console.log('screen added.\tnumber of screens: ' + screens.length);
		} else {
			console.log('warning: data type not recognized.')
		}

	})

	// Handle client disconnects.
	socket.on('disconnect', function () {
		console.log('\n' + socket.id + ' has been disconnected!');
		io.sockets.in('screen').emit('clientDisconnect', {id: socket.id});

		if (clients.includes(socket.id)) {
			// If client, remove from clients array.
			let i = clients.indexOf(socket.id);
			clients.splice(i, 1);
			console.log('number of clients: ' + clients.length);
		} else if (screens.includes(socket.id)) {
			// If screen, remove the screens array.
			for (let i = 0; i < screens.length; i++) {
				if (socket.id == screens[i]) {
					i = screens.indexOf(socket.id);
					screens.splice(i, 1);
					console.log('screen removed.\tnumber of screens: ' + screens.length);
				}
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

	socket.on('mode', rerouteMode);

	function rerouteMode(data) {
		io.sockets.in('screen').emit('mode', {id: socket.id, mode: data.mode});
		console.log(socket.id + ": " + data.mode);
	}

	socket.on('echoMode', rerouteEchoMode);

	function rerouteEchoMode(data) {
		io.sockets.in(data.id).emit('mode', {mode: data.mode});
		console.log("Sending mode echo {" + data.mode + "} to client " + data.id);
	}

}

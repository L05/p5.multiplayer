let velScale	= 0.25;
let socket;
let game;
let useRotation = false;

//

function setup () {
	createCanvas(windowWidth, windowHeight);
	background(51);

	socket = io.connect(serverIp + ':' + serverPort);
	socket.emit('join', {name: 'screen'});

	socket.on('clientConnect', handleConnect);
	socket.on('rotation', processRotation);
	socket.on('trackPad', processTrackPad);
	socket.on('clientDisconnect', handleDisconnect);

	game = new Game();
}

function draw () {
	background(15);
	game.printPlayerIds(5, 20);

	// console.log(game.colliders.length);
	// game.colliders.collide(game.colliders);

	for (id in game.players) {
		game.players[id].debug = mouseIsPressed;
	}

	game.checkBounds();
	drawSprites();
	printFps();
}


// Socket event handlers

function processRotation (data) {
	velScale	= 0.25;

	if (useRotation) {
		game.setVelocity(data.id, data.rotY*velScale, data.rotX*velScale);
	}

	// console.log(data.id + ': {' +
	// 	data.rotX + ',' +
	// 	data.rotY + ',' +
	// 	data.rotZ + '}');
}

function processTrackPad (data) {
	velScale	= 10;

	if (!useRotation) {
		game.setVelocity(data.id, data.padX*velScale, -data.padY*velScale);
	}

	// console.log(data.id + ': {' +
	// 	data.padX + ',' +
	// 	data.padY + '}');
}

function handleConnect (data) {
	console.log(data.id + ' has connected.');

	if (!game.checkId(data.id)) {
		game.add(data.id,
			random(0.25*width, 0.75*width),
			random(0.25*height, 0.75*height),
			60, 60,
			data.r*255,
			data.g*255,
			data.b*255
		);
	}
}

function handleDisconnect (data) {
	if (game.checkId(data.id)) {
		game.remove(data.id);
	}
}

//

function printFps () {
	push();
		fill(255);
		text(int(frameRate()), width - 50, 20);
	pop();
}


// Game

class Game {
	constructor () {
		this.players	= {};
		this.numPlayers	= 0;
		this.colliders	= new Group();
	}

	add (id_, x_, y_, w_, h_, r_, g_, b_) {
		this.players[id_] = createSprite(x_, y_, w_, h_);
		this.players[id_].shapeColor = color(r_, g_, b_);
		this.players[id_].setCollider("rectangle", 0, 0, w_, h_);
		this.players[id_].scale = 1;
		this.players[id_].mass = 1;
		this.colliders.add(this.players[id_]);
		this.numPlayers++;
	}

	remove (id_) {
		this.colliders.remove(this.players[id_]);
		this.players[id_].remove();
		delete this.players[id_];
		this.numPlayers--;
	}

	checkId (id_) {
		if (id_ in this.players) { return true; }
		else { return false; }
	}

	printPlayerIds (x_, y_) {
		let x = x_;

		push();
			noStroke();
			fill(255);
			textSize(16);
			text("# players: " + this.numPlayers, x, y_);

			let y = y_ + 16;
			fill(200);
			for (let id in this.players) {
				text(id, x, y);
				y += 16;
			}

		pop();
	}

	setVelocity(id_, velx_, vely_) {
		// console.log(id_ + ": " + velx_ + ", " + vely_);
		this.players[id_].velocity.x = velx_;
		this.players[id_].velocity.y = vely_;
	}

	checkBounds() {
		for (let id in this.players) {

			if (this.players[id].position.x < 0) {
				this.players[id].position.x = 1;
			}

			if (this.players[id].position.x > width) {
				this.players[id].position.x = width - 1;
			}

			if (this.players[id].position.y < 0) {
				this.players[id].position.y = 1;
			}

			if (this.players[id].position.y > height) {
				this.players[id].position.y = height - 1;
			}
		}
	}
}

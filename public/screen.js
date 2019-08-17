let serverIp      = 'https://p5cc-play.herokuapp.com';  // Server IP address
//let serverIp      = '127.0.0.1';  // Server IP address
let serverPort    = '3000';                 // Server port

let velScale	= 10;
let socket;
let roomId = null;
let game;
let useRotation = false;
let debug = true;
//

function setup () {
  createCanvas(windowWidth, windowHeight);
  background(51);

  socket = io.connect(serverIp + ':' + serverPort);
  socket.emit('join', {name: 'screen'});

  socket.on('roomId', receiveRoomId);
  socket.on('clientConnect', handleConnect);
  socket.on('clientDisconnect', handleDisconnect);
  socket.on('reroute', processReroute);  

  game = new Game();
}

function draw () {
  background(15);
  if (roomId == null) {
    push();
      fill(200);
      textSize(20);
      textAlign(CENTER, CENTER);
      text("Awaiting room ID...", windowWidth/2, windowHeight/2);
      pop();
    return;
  }

  game.printPlayerIds(5, 20);
  
  for (id in game.players) {
      game.players[id].debug = mouseIsPressed;
  }

  push();
    fill(255);
    textSize(20);
    text("room ID: " + roomId, 10, height-30);
  pop();

  game.checkBounds();
  drawSprites();
  printFps();
}


// Socket event handlers
function receiveRoomId (data) {
  if (data.roomId != null) {
    roomId = data.roomId;
  } else {
    console.log("No roomId received.");
  }
}

function processReroute (data) {
  if ("joystickX" in data) {
    processJoystick(data);
  }
  else if ("button" in data) {
    processButton(data);
  }
//  console.log(data);
}

function processJoystick (data) {
  
  game.setVelocity(data.id, data.joystickX*velScale, -data.joystickY*velScale);

  if (debug) {
    console.log(data.id + ': {' +
                data.joystickX + ',' +
                data.joystickY + '}');
  }
}

function processButton (data) {
  game.players[data.id].val = data.button;
  
  if (debug) {
    console.log(data.id + ': ' +
                data.button);
  }
}

// Connection handlers
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
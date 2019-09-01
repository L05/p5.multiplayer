// Socket Network Settings
// const serverIp      = 'https://p5cc-play.herokuapp.com';
// const serverIp      = '192.168.1.131';
const serverIp      = '127.0.0.1'
const serverPort    = '3000';
let socket;
let hostConnected = false;

// Game settings
const velScale	= 10;
const debug = true;
let game;
let roomId = null;

function setup () {
  createCanvas(windowWidth, windowHeight);
  processUrl();

  // socket = io.connect(serverIp);
  socket = io.connect(serverIp + ':' + serverPort);
  socket.emit('join', {name: 'host', roomId: roomId});

  socket.on('hostConnect', onHostConnect);
  socket.on('clientConnect', handleConnect);
  socket.on('clientDisconnect', handleDisconnect);
  socket.on('receiveData', receiveData);  
  
  game = new Game(width, height);
}

function processUrl() {
  const parameters = location.search.substring(1).split("&");

  const temp = parameters[0].split("=");
  roomId = unescape(temp[1]);
  
  console.log("id: " + roomId);
}

function draw () {
  background(15);
  if (!hostConnected) {
    push();
      fill(200);
      textSize(20);
      textAlign(CENTER, CENTER);
      text("Awaiting connection...", windowWidth/2, windowHeight/2);
      pop();
    return;
  }

  game.printPlayerIds(5, 20);

  push();
    fill(255);
    textSize(50);
    // text("room ID: " + roomId, 10, height-30);
    text(serverIp+"/?="+roomId, 10, height-50);
  pop();

  game.checkBounds();
  drawSprites();
  printFps();
}


// Socket event handlers
function onHostConnect (data) {
  console.log("Host connected to server.");
  hostConnected = true;
  
  if (roomId === null || roomId === 'undefined') {
    roomId = data.roomId;
  }
}

function receiveData (data) {
  if ("joystickX" in data) {
    processJoystick(data);
  }
  else if ("button" in data) {
    processButton(data);
  }
  else if ("r" in data) {
    game.setColor(data.id, data.r*255, data.g*255, data.b*255);
  }
  // console.log(data);
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
            60, 60
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
  constructor (w, h) {
    this.w          = w;
    this.h          = h;
    this.players	= {};
    this.numPlayers	= 0;
    this.id         = 0;
    this.colliders	= new Group();
    
  }

  add (id, x, y, w, h) {
    this.players[id] = createSprite(x, y, w, h);
    this.players[id].id = "p"+this.id;
    this.players[id].setCollider("rectangle", 0, 0, w, h);
    this.players[id].color = color(255, 255, 255);
    this.players[id].shapeColor = color(255, 255, 255);
    this.players[id].scale = 1;
    this.players[id].mass = 1;
    this.colliders.add(this.players[id]);
    print(this.players[id].id + " added.");
    this.id++;
    this.numPlayers++;
  }

  setColor (id, r, g, b) {
    this.players[id].color = color(r, g, b);
    this.players[id].shapeColor = color(r, g, b);

    print(this.players[id].id + " color added.");
  }

  remove (id) {
      this.colliders.remove(this.players[id]);
      this.players[id].remove();
      delete this.players[id];
      this.numPlayers--;
  }

  checkId (id) {
      if (id in this.players) { return true; }
      else { return false; }
  }

  printPlayerIds (x, y) {
      push();
          noStroke();
          fill(255);
          textSize(16);
          text("# players: " + this.numPlayers, x, y);

          y = y + 16;
          fill(200);
          for (let id in this.players) {
              text(this.players[id].id, x, y);
              y += 16;
          }

      pop();
  }

  setVelocity(id, velx, vely) {
      // console.log(id + ": " + velx + ", " + vely);
      this.players[id].velocity.x = velx;
      this.players[id].velocity.y = vely;
  }

  checkBounds() {
      for (let id in this.players) {

          if (this.players[id].position.x < 0) {
              this.players[id].position.x = this.w - 1;
          }

          if (this.players[id].position.x > this.w) {
              this.players[id].position.x = 1;
          }

          if (this.players[id].position.y < 0) {
              this.players[id].position.y = this.h - 1;
          }

          if (this.players[id].position.y > this.h) {
              this.players[id].position.y = 1;
          }
      }
  }
}
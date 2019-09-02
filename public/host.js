/*
p5.multiplayer - HOST

This 'host' sketch is intended to be run in desktop browsers. 
It connects to a node server via socket.io, from which it receives
rerouted input data from all connected 'clients'.

Navigate to the project's 'public' directory.
Run http-server -c-1 to start server. This will default to port 8080.
Run http-server -c-1 -p80 to start server on open port 80.

*/

////////////
// Network Settings
// const serverIp      = 'https://yourservername.herokuapp.com';
const serverIp      = '127.0.0.1';
const serverPort    = '3000';
const local         = true;   // true if running locally, false
                              // if running on remote server

// Global variables here. ---->

const velScale	= 10;
const debug = true;
let game;

// <----

function setup () {
  createCanvas(windowWidth, windowHeight);

  setupHost();

  // Host/Game setup here. ---->
  
  game = new Game(width, height);

  // <----
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw () {
  background(15);

  if(isHostConnected(display=true)) {
    // Host/Game draw here. --->

    // Display player IDs in top left corner
    game.printPlayerIds(5, 20);

    // Check game bounds and draw sprites
    game.checkBounds();
    drawSprites();

    // <----

    // Display server address
    displayAddress();
  }
}

function onClientConnect (data) {
  // Client connect logic here. --->
  console.log(data.id + ' has connected.');

  if (!game.checkId(data.id)) {
    game.add(data.id,
            random(0.25*width, 0.75*width),
            random(0.25*height, 0.75*height),
            60, 60
    );
  }

  // <----
}

function onClientDisconnect (data) {
  // Client disconnect logic here. --->

  if (game.checkId(data.id)) {
    game.remove(data.id);
  }

  // <----
}

function onReceiveData (data) {
  // Input data processing here. --->
  console.log(data);

  if (data.type === 'joystick') {
    processJoystick(data);
  }
  else if (data.type === 'button') {
    processButton(data);
  }
  else if (data.type === 'playerColor') {
    game.setColor(data.id, data.r*255, data.g*255, data.b*255);
  }

  // <----

  /* Example:
     if (data.type === 'myDataType') {
       processMyData(data);
     }

     Use `data.type` to get the message type sent by client.
  */
}

////////////
// Input processing
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

////////////
// Game
// This simple placeholder game makes use of p5.play
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
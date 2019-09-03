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
// const serverIp      = 'https://yourprojectname.glitch.me';
const serverIp      = '127.0.0.1';
const serverPort    = '3000';
const local         = true;   // true if running locally, false
                              // if running on remote server

// Global variables here. ---->

const velScale	= 10;
const debug = true;
let game;

// <----

function preload() {
  setupHost();
}

function setup () {
  createCanvas(windowWidth, windowHeight);

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

    // Update and draw game objects
    game.draw();

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

// This is included for testing purposes to demonstrate that
// messages can be sent from a host back to all connected clients
function mousePressed() {
  sendData('timestamp', { timestamp: millis() });
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

  game.createRipple(data.id, 300, 1000);
  
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
    this.ripples    = new Ripples();
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

  draw() {
    this.checkBounds();
    this.ripples.draw();
    drawSprites();
  }

  createRipple(id, r, duration) {
    this.ripples.add(
      this.players[id].position.x, 
      this.players[id].position.y, 
      r, 
      duration, 
      this.players[id].color);
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

// A simple pair of classes for generating ripples
class Ripples {
  constructor() {
    this.ripples = [];
  }

  add(x, y, r, duration, rcolor) {
    this.ripples.push(new Ripple(x, y, r, duration, rcolor));
  }

  draw() {
    for (let i = 0; i < this.ripples.length; i++) {
      // Draw each ripple in the array
      if(this.ripples[i].draw()) {
        // If the ripple is finished (returns true), remove it
        this.ripples.splice(i, 1);
      }
    }
  }
}

class Ripple {
  constructor(x, y, r, duration, rcolor) {
    this.x = x;
    this.y = y;
    this.r = r;

    // If rcolor is not defined, default to white
    if (rcolor == null) {
      rcolor = color(255);
    }

    this.stroke = rcolor;
    this.strokeWeight = 3;

    this.duration = duration;   // in milliseconds
    this.startTime = millis();
    this.endTime = this.startTime + this.duration;
  }

  draw() {
    let progress = (this.endTime - millis())/this.duration;
    let r = this.r*(1 - progress);

    push();
      stroke(red(this.stroke), 
             green(this.stroke), 
             blue(this.stroke), 
             255*progress);
      strokeWeight(this.strokeWeight);
      fill(0, 0);
      ellipse(this.x, this.y, r);
    pop();

    if (millis() > this.endTime) {
      return true;
    }

    return false;
  }
}
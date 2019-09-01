/*
Author:	L05
Date:	2019.08.31

This 'host' sketch is intended to be run in desktop browsers. 
It connects to a node server via socket.io, from which it receives
rerouted input data from all connected 'clients'.

Navigate to the project's 'public' directory.
Run http-server -c-1 to start server. This will default to port 8080.
Run http-server -c-1 -p80 to start server on open port 80.

*/

////////////
// Socket Network Settings
// const serverIp      = 'https://yourservername.herokuapp.com';
const serverIp      = '127.0.0.1';
const serverPort    = '3000';
const local         = true;   // true if running locally, false
                              // if running on remote server
let socket;
let hostConnected   = false;
let roomId          = null;

////////////////////////////////////////
////////////////////////////////////////

////////////
// Setup
function setup () {
  createCanvas(windowWidth, windowHeight);
  processUrl();

  // Put your own host setup logic here. ---->

  
  // <----

  let addr = serverIp;
  if (local) { addr = serverIp + ':' + serverPort; }
  socket = io.connect(addr);

  socket.emit('join', {name: 'host', roomId: roomId});

  socket.on('hostConnect', onHostConnect);
  socket.on('clientConnect', onClientConnect);
  socket.on('clientDisconnect', onClientDisconnect);
  socket.on('receiveData', onReceiveData);
}

////////////
// Process URL
// Used to process the room ID. In order to specify a room ID,
// include ?=uniqueName, where uniqueName is replaced with the 
// desired unique room ID.
function processUrl() {
  const parameters = location.search.substring(1).split("&");

  const temp = parameters[0].split("=");
  roomId = unescape(temp[1]);

  console.log("id: " + roomId);
}

////////////
// Draw loop
function draw () {
  background(15);

  // Display message if host is not yet connected
  displayConnectStatus();

  // Put your game code here. --->


  // <----

  // Display server address in bottom left corner
  displayAddress();  
}

////////////
// Socket event handlers
function onHostConnect (data) {
  console.log("Host connected to server.");
  hostConnected = true;
  
  if (roomId === null || roomId === 'undefined') {
    roomId = data.roomId;
  }
}

function onClientConnect (data) {
  // Put your own client connect logic here. --->
  console.log(data.id + ' has connected.');


  // <----
}

function onClientDisconnect (data) {
  // Put your own client disconnect logic here. --->
  console.log(data.id + ' has disconnected.');


  // <----
}

function onReceiveData (data) {
  // Put your own data processing logic here. --->
  

  console.log(data);

  // <---
  // Example:
  // if (data.type === 'joystick') {
  //   processJoystick(data);
  // }
}

////////////
// HUD Displays

// Displays connection status
function displayConnectStatus() {
  if (!hostConnected) {
    push();
      fill(200);
      textSize(20);
      textAlign(CENTER, CENTER);
      text("Awaiting connection...", windowWidth/2, windowHeight/2);
      pop();
    return;
  }
}

// Displays server address in lower left of screen
function displayAddress() {
  push();
    fill(255);
    textSize(50);
    text(serverIp+"/?="+roomId, 10, height-50);
  pop();
}

// Displays framerate
function displayFps () {
  push();
    fill(255);
    text(int(frameRate()), width - 50, 20);
  pop();
}


/*
Author:	L05
Date:	2019.08.31

This 'client' sketch is intended to be run in either mobile or 
desktop browsers. It sends a basic joystick and button input data 
to a node server via socket.io. This data is then rerouted to a 
'host' sketch, which displays all connected 'clients'.

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

// Initialize Network related variables
let roomId = null;
let waiting = true;
let connected = false;
let id = null;

////////////////////////////////////////
////////////////////////////////////////


////////////
// Setup
function setup() {
  createCanvas(windowWidth, windowHeight);
  processUrl();
  
  // Put your own client setup logic here. ---->


  // <----

  // Socket.io - open a connection to the web server on specified port
  let addr = serverIp;
  if (local) { addr = serverIp + ':' + serverPort; }
  socket = io.connect(addr);

  socket.emit('join', {name: 'client', roomId: roomId});

  socket.on('id', function(data) {
    id = data;
    console.log("id: " + id);
  });

  socket.on('found', function(data) {
    connected = data.status;
    waiting = false;
    console.log("connected: " + connected);
  })
  
  socket.emit('clientConnect', {
    roomId: roomId
  });

  // You can send any initial setup data to your host here.
  // Example: 
  // sendData({
  //   type: 'playerColor', 
  //   r: red(playerColor)/255,
  //   g: green(playerColor)/255,
  //   b: blue(playerColor)/255
  // });
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

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

////////////
// Draw loop
function draw() {
  background(0);

  if (waiting) {
    displayWaiting();
    return;
  } 
  else if (!connected) {
    displayInstructions();
    return;
  }
  else {
    // Put your client code here. ---->


    // <----
  }
}

////////////
// Send data to server
function sendData(data) {
  // print data to console
  console.log('Sending: ' + data);

  data.roomId = roomId;
  
  // Send rotation data to server
  socket.emit('sendData', data);
}

////////////
// HUD Displays

// Displays a message while attempting connection
function displayWaiting() {
  push();
    fill(200);
    textAlign(CENTER, CENTER);
    textSize(20);
    text("Attempting connection...", width/2, height/2-10);
  pop();
}

// Displays a message instructing player to look at host screen 
// for correct link.
function displayInstructions() {
  push();
    fill(200);
    textAlign(CENTER, CENTER);
    textSize(20);
    text("Please enter the link at the", width/2, height/2-10);
    text("bottom of the host screen.", width/2, height/2+10);
  pop();
}

////////////////////////////////////////
////////////////////////////////////////

/// Add these lines below sketch to prevent scrolling on mobile
function touchMoved() {
  // do some stuff
  return false;
}
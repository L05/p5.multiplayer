/*
p5.multiplayer - CLIENT

This 'client' sketch is intended to be run in either mobile or 
desktop browsers. It sends a basic joystick and button input data 
to a node server via socket.io. This data is then rerouted to a 
'host' sketch, which displays all connected 'clients'.

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

// <----

function setup() {
  createCanvas(windowWidth, windowHeight);

  setupClient();

  // Client setup here. ---->

  // <----

  // Send any initial setup data to your host here.
  /* 
    Example: 
    sendData('myDataType', { 
      val1: 0,
      val2: 128,
      val3: true
    });

     Use `type` to classify message types for host.
  */
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(0);

  if(isClientConnected(display=true)) {
    // Client draw here. ---->


    // <----
  }
}

/// Add these lines below sketch to prevent scrolling on mobile
function touchMoved() {
  // do some stuff
  return false;
}
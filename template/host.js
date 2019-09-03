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

// <----

function preload() {
  setupHost();
}

function setup () {
  createCanvas(windowWidth, windowHeight);

  // Host/Game setup here. ---->

  
  // <----
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw () {
  background(15);

  if(isHostConnected(display=true)) {
    // Host/Game draw here. --->


    // <----

    // Display server address
    displayAddress();
  }
}

function onClientConnect (data) {
  // Client connect logic here. --->
  console.log(data.id + ' has connected.');

  // <----
}

function onClientDisconnect (data) {
  // Client disconnect logic here. --->
  console.log(data.id + ' has disconnected.');

  // <----
}

function onReceiveData (data) {
  // Input data processing here. --->
  console.log(data);
  
  // <---

  /* Example:
     if (data.type === 'myDataType') {
       processMyData(data);
     }

     Use `data.type` to get the message type sent by client.
  */

}

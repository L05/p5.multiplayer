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
// const serverIp      = 'https://yourprojectname.glitch.me';
const serverIp      = '127.0.0.1';
const serverPort    = '3000';
const local         = true;   // true if running locally, false
                              // if running on remote server

// Global variables here. ---->

// Initialize GUI related variables
let gui         = null;
let button      = null;
let joystick    = null;
let joystickRes = 4;
let thisJ       = {x: 0, y: 0};
let prevJ       = {x: 0, y: 0};

// Initialize Game related variables
let playerColor;
let playerColorDim;

// <----

function preload() {
  setupClient();
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Client setup here. ---->
  
  gui = createGui();

  setPlayerColors();
  setupUI();

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
  sendData('playerColor', { 
    r: red(playerColor)/255,
    g: green(playerColor)/255,
    b: blue(playerColor)/255
  });
} 

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(0);

  if(isClientConnected(display=true)) {
    // Client draw here. ---->

    drawGui();

    // <---
  }
}

// Messages can be sent from a host to all connected clients
function onReceiveData (data) {
  // Input data processing here. --->

  if (data.type === 'timestamp') {
    print(data.timestamp);
  }

  // <----

  /* Example:
     if (data.type === 'myDataType') {
       processMyData(data);
     }

     Use `data.type` to get the message type sent by host.
  */
}

////////////
// GUI setup
function setPlayerColors() {
  let hue = random(0, 360);
  colorMode(HSB);
  playerColor = color(hue, 100, 100);
  playerColorDim = color(hue, 100, 75);
  colorMode(RGB);
}

function setupUI() {
  // Temp variables for calculating GUI object positions
  let jX, jY, jW, jH, bX, bY, bW, bH;
  
  // Rudimentary calculation based on portrait or landscape 
  if (width < height) {
    jX = 0.05*width;
    jY = 0.05*height;
    jW = 0.9*width;
    jH = 0.9*width;
    
    bX = 0.05*windowWidth;
    bY = 0.75*windowHeight;
    bW = 0.9*windowWidth;
    bH = 0.2*windowHeight;
  }
  else {
    jX = 0.05*width;
    jY = 0.05*height;
    jW = 0.9*height;
    jH = 0.9*height;
    
    bX = 0.75*windowWidth;
    bY = 0.05*windowHeight;
    bW = 0.2*windowWidth;
    bH = 0.9*windowHeight;
  }
  
  // Create joystick and button, stylize with player colors
  joystick = createJoystick("Joystick", jX, jY, jW, jH);
  joystick.setStyle({
    handleRadius:     joystick.w*0.2, 
    fillBg:           color(0), 
    fillBgHover:      color(0), 
    fillBgActive:     color(0), 
    strokeBg:         playerColor, 
    strokeBgHover:    playerColor, 
    strokeBgActive:   playerColor, 
    fillHandle:       playerColorDim, 
    fillHandleHover:  playerColorDim, 
    fillHandleActive: playerColor,
    strokeHandleHover:  color(255),
    strokeHandleActive: color(255)
  });
  joystick.onChange = onJoystickChange;
  
  button = createButton("Interact", bX, bY, bW, bH);
  button.setStyle({
    textSize: 40,
    fillBg: playerColorDim,
    fillBgHover: playerColorDim,
    fillBgActive: playerColor
  });
  button.onPress = onButtonPress;
}

////////////
// Input processing
function onJoystickChange() {  
  thisJ.x = floor(joystick.val.x*joystickRes)/joystickRes;
  thisJ.y = floor(joystick.val.y*joystickRes)/joystickRes;
  
  if (thisJ.x != prevJ.x || thisJ.y != prevJ.y) {
    let data = {
      joystickX: thisJ.x,
      joystickY: thisJ.y
    }
    sendData('joystick', data);
  }
  
  prevJ.x = thisJ.x;
  prevJ.y = thisJ.y;
}

function onButtonPress() {
  let data = {
    button: button.val
  }
  
  sendData('button', data);
}

/// Add these lines below sketch to prevent scrolling on mobile
function touchMoved() {
  // do some stuff
  return false;
}
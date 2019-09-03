// Initialize Network related variables
let socket;
let roomId          = null;
let waiting         = true;
let connected       = false;
let id              = null;
let screenConnected   = false;


////////////
// SETUP

function setupController() {
  _processUrl();

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
}

function setupScreen() {
  _processUrl();

  let addr = serverIp;
  if (local) { addr = serverIp + ':' + serverPort; }
  socket = io.connect(addr);

  socket.emit('join', {name: 'host', roomId: roomId});

  socket.on('hostConnect', onScreenConnect);
  socket.on('clientConnect', onClientConnect);
  socket.on('clientDisconnect', onControllerDisconnect);
  socket.on('receiveData', onReceiveData);
}

function onScreenConnect (data) {
  console.log("Host connected to server.");
  screenConnected = true;
  
  if (roomId === null || roomId === 'undefined') {
    roomId = data.roomId;
  }
}

// Process URL
// Used to process the room ID. In order to specify a room ID,
// include ?=uniqueName, where uniqueName is replaced with the 
// desired unique room ID.
function _processUrl() {
  const parameters = location.search.substring(1).split("&");

  const temp = parameters[0].split("=");
  roomId = unescape(temp[1]);

  console.log("id: " + roomId);
}


////////////
// MESSAGING

// Send data from client to host via server
function sendData(datatype, data) {
  data.type   = datatype;
  data.roomId = roomId;

  // print data to console
  console.log('Sending: ' + data);
  
  // Send rotation data to server
  socket.emit('sendData', data);
}


////////////
// FLOW CONTROL

function isClientConnected(display=false) {
  if (waiting) {
    if (display) { _displayWaiting(); }
    return false;
  } 
  else if (!connected) {
    if (display) { _displayInstructions(); }
    return false;
  }

  return true;
}

function isScreenConnected(display=false) {
  if (!screenConnected) {
    if (display) { _displayWaiting(); }
    return false;
  }
  return true;
}


////////////
// ONSCREEN DISPLAY

// Displays a message while attempting connection
function _displayWaiting() {
  push();
    fill(200);
    textAlign(CENTER, CENTER);
    textSize(20);
    text("Attempting connection...", width/2, height/2-10);
  pop();
}
  
// Displays a message instructing player to look at host screen 
// for correct link.
function _displayInstructions() {
  push();
    fill(200);
    textAlign(CENTER, CENTER);
    textSize(20);
    text("Please enter the link at the", width/2, height/2-10);
    text("bottom of the host screen.", width/2, height/2+10);
  pop();
}

// Displays server address in lower left of screen
function displayAddress() {
  push();
    fill(255);
    textSize(50);
    text(serverIp+"/?="+roomId, 10, height-50);
  pop();
}

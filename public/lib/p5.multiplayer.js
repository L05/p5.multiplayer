////////////
// COMMON

// Initialize Network related variables
let socket;
let roomId          = null;
let id              = null;

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

// Send data from client to host via server
function sendData(datatype, data) {
  data.type   = datatype;
  data.roomId = roomId;
  
  socket.emit('sendData', data);
}

// Displays a message while attempting connection
function _displayWaiting() {
  push();
    fill(200);
    textAlign(CENTER, CENTER);
    textSize(20);
    text("Attempting connection...", width/2, height/2-10);
  pop();
}

////////////
// HOST

// Initialize Network related variables
let hostConnected   = false;

function setupHost() {
  _processUrl();

  let addr = serverIp;
  if (local) { addr = serverIp + ':' + serverPort; }
  socket = io.connect(addr);

  socket.emit('join', {name: 'host', roomId: roomId});

  socket.on('id', function(data) {
    id = data;
    console.log("id: " + id);
  });

  socket.on('hostConnect', onHostConnect);
  socket.on('clientConnect', onClientConnect);
  socket.on('clientDisconnect', onClientDisconnect);
  socket.on('receiveData', onReceiveData);
}

function isHostConnected(display=false) {
  if (!hostConnected) {
    if (display) { _displayWaiting(); }
    return false;
  }
  return true;
}

function onHostConnect (data) {
  console.log("Host connected to server.");
  hostConnected = true;
  
  if (roomId === null || roomId === 'undefined') {
    roomId = data.roomId;
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

////////////
// CLIENT

// Initialize Network related variables
let waiting         = true;
let connected       = false;

function setupClient() {
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

  socket.on('receiveData', onReceiveData);
}

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

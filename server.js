// Create arrays for tracking hosts and clients
let hosts   = [];
let clients = [];

////////////
// Setup express web server and listen on port 3000
let express = require('express');
let app = express();
let port=Number(process.env.PORT || 3000);
let server = app.listen(port);

app.use(express.static('public'));
console.log("My socket server is running on port " + port);

////////////
// Start socket.io
let socket = require('socket.io');

// Connect it to the web server
let io = socket(server);

////////////
// Setup a connection
io.sockets.on('connection', newConnection);
function newConnection(socket) {

  console.log('\n' + socket.id + ' is attempting connection...');
  socket.emit('id', socket.id);

  //// Process a request to join.
  socket.on('join', function (data) {

    // If request is from a client...
    if (data.name == 'client') {
      
      console.log("Verifying client...");

      // If the roomId field is not null
      if (data.roomId != null) {
        
        // Search all existing roomIds for a match
        console.log("Searching for existing room ID...");
        
        let found = false;
        for (let i = 0; i < hosts.length; i++) {
          if(hosts[i].roomId == data.roomId) {
            socket.join(data.name);

            let clientData = {
              id: socket.id,
              roomId: data.roomId
            }

            // Add client socket ID and room ID to clients list
            clients.push(clientData);

            // Add client to its own room and to host by room ID
            socket.join(socket.id);
            socket.join(data.roomId);
            console.log('Client added to room '+data.roomId+'.\tNumber of clients: ' + clients.length);
            found = true;

            // Send match confirmation back to client
            socket.emit("found", {status: true});
            break;
          }
        }

        if (!found) {
          // Notify client of failure to match
          socket.emit("found", {status: false});
        }
      }
    } else if (data.name == 'host') {
      // If the attempted connection is from a host, store the data
      let roomId = null;

      if (data.roomId === null || data.roomId === 'undefined') {
        roomId = makeIdFromList();
      }
      else {
        roomId = data.roomId;
      }

      let hostData = {
        id: socket.id,
        roomId: roomId
      }

      // Add host socket ID and room ID to hosts list
      hosts.push(hostData);

      // TODO: Check for valid room ID. If not valid, create random room ID.

      // Add host to "host" room and to its own room by room ID.
      socket.join(data.name);
      socket.join(hostData.roomId);

      // Send room ID back to host
      socket.emit("hostConnect", hostData);

      console.log('Host added with room ID of ' + hostData.roomId + '.\tNumber of hosts: ' + hosts.length);
    } else {
      console.log('warning: data type not recognized.')
    }
  })

  //// Process client disconnects.
  socket.on('disconnect', function () {
    console.log('\n' + socket.id + ' has been disconnected!');

    let endpoint = searchId(socket.id, clients);
    if (endpoint != null) {
      clients.splice(endpoint.index, 1);
      console.log('Client removed.\tNumber of clients: ' + clients.length);

      // Notify hosts that client has disconnected.
      io.sockets.in('host').emit('clientDisconnect', {id: socket.id});
    } else {
      endpoint = searchId(socket.id, hosts);

      if (endpoint != null) {
        console.log('Host with ID ' + hosts[endpoint.index].roomId + ' removed.\tHumber of hosts: ' + hosts.length);
        hosts.splice(endpoint.index, 1);
      }
    }
  })

  //// Process client connects.
  socket.on('clientConnect', onClientConnect);

  function onClientConnect(data) {
    // Get host by room ID
    let host = searchRoomId(data.roomId, hosts);

    if (host != null) {
      console.log('clientConnect message received from ' + socket.id + ' for room ' + data.roomId + ".");
      io.sockets.in(data.roomId).emit('clientConnect', {id: socket.id, roomId: data.roomId});
    }
  }
  
  //// Reroute data sent from client to host
  socket.on('sendData', sendData);

  function sendData(data) {
    let host = searchRoomId(data.roomId, hosts);

    let packet = {...data};
    packet.id = socket.id;

    if (host != null) {
      io.sockets.in(data.roomId).emit('receiveData', packet);
    }
  }
}

////////////
// Utility Functions
function searchId(id_, array_) {
  for (let i = 0; i < array_.length; i++) {
    if (array_[i].id == id_) {
      return {
        item: array_[i],
        index: i
      };
    }
  }
}

function searchRoomId(roomId_, array_) {
  for (let i = 0; i < array_.length; i++) {
    if (array_[i].roomId == roomId_) {
      return {
        item: array_[i],
        index: i
      };
    }
  }
}

////////////
// Gemstone room ID generator
const roomNames =
   ["agate",
    "amber",
    "amethyst",
    "barite",
    "beryl",
    "bloodstone",
    "coral",
    "crystal",
    "diamond",
    "emerald",
    "fluorite",
    "garnet",
    "goldstone",
    "jade",
    "jasper",
    "moonstone",
    "onyx",
    "opal",
    "pearl",
    "peridot",
    "quahog",
    "quartz",
    "ruby",
    "sapphire",
    "sardonyx",
    "sunstone",
    "tigereye",
    "topaz",
    "turquoise",
    "zircon"]

const roomIds = randomNoRepeats(roomNames);

function randomNoRepeats(array) {
  let copy = array.slice(0);
  return function() {
    if (copy.length < 1) { copy = array.slice(0); }
    let index = Math.floor(Math.random() * copy.length);
    let item = copy[index];
    copy.splice(index, 1);
    return {id: item, length: copy.length};
  };
}

function makeIdFromList() {
  for (let i = 0; i < roomNames.length; i++) {
    let text = roomIds().id;
    let room = searchRoomId(text, hosts);
    if (room == null) {
      return text;
    }
  }
  console.log(hosts.length + " hosts detected. No names available.");
  return null;
}

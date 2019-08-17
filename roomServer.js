let clients = [];
let screens  = [];

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

let roomIds = randomNoRepeats(roomNames);

console.log(roomIds().id);


// setup express web server and listen on port 3000
let express = require('express');
let app = express();
let port=Number(process.env.PORT || 3000);
let server = app.listen(port);

app.use(express.static('public'));

console.log("My socket server is running on port " + port);

// start socket.io
let socket = require('socket.io');

// connect it to the web server
let io = socket(server);

// setup a connection event
io.sockets.on('connection', newConnection);

function newConnection(socket) {

  console.log('\n' + socket.id + ' is attempting connection...');
  socket.emit('id', socket.id);

  // Add a client if it requests to join.
  socket.on('join', function (data) {

    if (data.name == 'client') {
      // Add all clients to "client" room.
      console.log("verifying client...");


      // If the roomId field is not null
      if (data.roomId != null) {
        console.log("searching for existing roomId...");
        // Search all existing roomIds for a match
        let found = false;
        for (let i = 0; i < screens.length; i++) {
          if(screens[i].roomId == data.roomId) {
            socket.join(data.name);

            let clientData = {
              id: socket.id,
              roomId: data.roomId
            }

            // add client socket id to clients list
            clients.push(clientData);

            // add client to its own room and to screen room
            socket.join(socket.id);
            socket.join(data.roomId);
            console.log('client added to room '+data.roomId+'.\tnumber of clients: ' + clients.length);
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
    } else if (data.name == 'screen') {
      // generate screen roomId
      let screenData = {
        id: socket.id,
        roomId: makeIdFromList()
      }

      // add screen socket id to screens list
      screens.push(screenData);

      // Add screen to its own room with roomId and to "screen" room.
      socket.join(data.name);
      socket.join(screenData.roomId);

      // Send roomId back to screen
      socket.emit("roomId", screenData);

      console.log('screen added with id ' + screenData.roomId + '.\tnumber of screens: ' + screens.length);
    } else {
      console.log('warning: data type not recognized.')
    }

  })

  // Handle client disconnects.
  socket.on('disconnect', function () {
    console.log('\n' + socket.id + ' has been disconnected!');
    io.sockets.in('screen').emit('clientDisconnect', {id: socket.id});

    let client = searchId(socket.id, clients);
    if (client != null) {
      clients.splice(client.index, 1);
      console.log('client removed. number of clients: ' + clients.length);
    } else {
      client = searchId(socket.id, screens);

      if (client != null) {
        console.log('screen with id ' + screens[client.index].roomId + ' removed.\tnumber of screens: ' + screens.length);
        screens.splice(client.index, 1);

      }
    }

    // if (clients.includes(socket.id)) {
    //   // If client, remove from clients array.
    //   let i = clients.indexOf(socket.id);
    //   clients.splice(i, 1);
    //   console.log('client removed. number of clients: ' + clients.length);
    // } else if (screens.includes(socket.id)) {
    //   // If screen, remove the screens array.
    //   for (let i = 0; i < screens.length; i++) {
    //     if (socket.id == screens[i].id) {
    //       i = screens.indexOf(socket.id);
    //       screens.splice(i, 1);
    //       console.log('screen removed.\tnumber of screens: ' + screens.length);
    //     }
    //   }
    // }
  })

  // Handle client connects.
  socket.on('clientConnect', rerouteConnect);

  function rerouteConnect(data) {
    // send it back out
    // socket.broadcast.emit('mouse', data); // does not include the client that sent the message
    // io.sockets.emit('mouse', data); // would include client that sent the message

    let client = searchRoomId(data.roomId, clients);

    if (client != null) {
      console.log('clientConnect message received from ' + socket.id + ' with color: (' + data.r + ', ' + data.g + ', ' + data.b + ')');
      io.sockets.in(data.roomId).emit('clientConnect', {id: socket.id, roomId: data.roomId, r: data.r, g: data.g, b: data.b});
    }
  }
  
  socket.on('reroute', rerouteData);

  function rerouteData(data) {
    let client = searchRoomId(data.roomId, clients);

    let packet = {...data};
    packet.id = socket.id;
    console.log(packet);

    if (client != null) {
      io.sockets.in(data.roomId).emit('reroute', packet);
    }
  }
}

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

function makeId() {
  let text = "";
  // let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

  for (let i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

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
    let room = searchRoomId(text, screens);
    if (room == null) {
      return text;
    }
  }
  console.log(screens.length + " screens detected. No names available.");
  return null;
}

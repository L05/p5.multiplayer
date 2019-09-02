[Home](../README.md) | [Reference]() | [Development Notes](NOTES.md)

# Reference

[Client](#client)
* [setupClient()](#setupclient)
* [sendData()](#senddata-client)
* [isClientConnected()](#isclientconnected)
* [Callbacks](#client-callbacks)
    * [onReceiveData()](#onreceivedata-client)

[Host](#host)
* [setupHost()](#setuphost)
* [sendData()](#senddata-host)
* [isHostConnected()](#ishostconnected)
* [displayAddress()](#displayaddress)
* [Callbacks](#host-callbacks)
    * [onClientConnect()](#onclientconnect)
    * [onClientDisconnect()](#onclientdisconnect)
    * [onReceiveData()](#onreceivedata-host)

-----

## Client

-----

#### setupClient()
[[Back to top]](#reference)

##### Example
```javascript
// Network settings
const serverIp      = '127.0.0.1';
const serverPort    = '3000';
const local         = true;   // true if running locally, false
                              // if running on remote server

function setup() {
  createCanvas(windowWidth, windowHeight);

  setupClient();
}
```
##### Description
Sets up client to connect to server and send messages to host.

##### Syntax
```javascript
setupClient()
```

##### Parameters
`None`

##### Returns
`None`

-----

#### sendData() - *Client*
[[Back to top]](#reference)

##### Example
```javascript
sendData('playerColor', {
  r: red(playerColor)/255,
  g: green(playerColor)/255,
  b: blue(playerColor)/255
});
```
```javascript
let myData = {
    val1: 0,
    val2: 128,
    val3: true
}

sendData('myDataType', myData);
```
##### Description
Sends JavaScript object message of specified data type from client to host.

##### Syntax
```javascript
sendData(datatype, data)
```

##### Parameters
`datatype` String: data type of message
`data` Object: a JavaScript object containing user-defined values

##### Returns
`None`

-----

#### isClientConnected()
[[Back to top]](#reference)

##### Example
```javascript
function draw() {
  background(0);

  if(isClientConnected(display=true)) {
    // Client draw here. ---->


    // <----
  }
}
```
##### Description
Checks to see if the client is successfully connected to the server and returns Boolean result. If `display=true`, connectivity support instructions are displayed on the screen.

##### Syntax
```javascript
isClientConnected(display)
```

##### Parameters
`display` Boolean: displays connectivity support instructions if `true` (default is `false`)

##### Returns
Boolean: `true` if client is connected, `false` otherwise

-----

### Client Callbacks
User-defined callbacks for handling data received from hosts. These **must** be present in your `index.js` sketch.

-----

#### onReceiveData() - *Client*
[[Back to top]](#reference)

##### Example
```javascript
function onReceiveData (data) {
  // Input data processing here. --->
  console.log(data);
  
  // <---

  /* Example:
     if (data.type === 'myDataType') {
       processMyData(data);
     }

     Use `data.type` to get the message type sent by host.
  */

}
```
##### Description
Callback for when data is received from a host. Must be defined in `index.js` sketch. `data` parameter provides all data sent from host and always includes:
* `.id` String: unique ID of host
* `.type` String: data type of message

##### Syntax
```javascript
onReceiveData (data)
```

##### Parameters
`data` Object: contains all data sent from client

##### Returns
`None`

-----

## Host

-----

#### setupHost()
[[Back to top]](#reference)

##### Example
```javascript
// Network settings
const serverIp      = '127.0.0.1';
const serverPort    = '3000';
const local         = true;   // true if running locally, false
                              // if running on remote server

function setup() {
  createCanvas(windowWidth, windowHeight);

  setupHost();
}
```
##### Description
Sets up host to connect to server and receive messages from clients.

##### Syntax
```javascript
setupHost()
```

##### Parameters
`None`

##### Returns
`None`

-----

#### sendData() - *Host*
[[Back to top]](#reference)

##### Example
```javascript
function mousePressed() {
  sendData('timestamp', { timestamp: millis() });
}
```
```javascript
let myData = {
    val1: 0,
    val2: 128,
    val3: true
}

sendData('myDataType', myData);
```
##### Description
Sends JavaScript object message of specified data type from host to all connected clients.

##### Syntax
```javascript
sendData(datatype, data)
```

##### Parameters
`datatype` String: data type of message
`data` Object: a JavaScript object containing user-defined values

##### Returns
`None`

-----

#### isHostConnected()
[[Back to top]](#reference)

##### Example
```javascript
function draw () {
  background(15);

  if(isHostConnected(display=true)) {
    // Host/Game draw here. --->


    // <----

    // Display server address
    displayAddress();
  }
}
```
##### Description
Checks to see if the host is successfully connected to the server and returns Boolean result. If `display=true`, connectivity status is displayed on the screen.

##### Syntax
```javascript
isHostConnected(display)
```

##### Parameters
`display` Boolean: displays connectivity status if `true` (default is `false`)

##### Returns
Boolean: `true` if host is connected, `false` otherwise

-----

#### displayAddress()
[[Back to top]](#reference)

##### Example
```javascript
function draw () {
  background(15);

  if(isHostConnected(display=true)) {
    // Host/Game draw here. --->


    // <----

    // Display server address
    displayAddress();
  }
}
```
##### Description
Displays the server address in the lower left of the canvas.

##### Syntax
```javascript
displayAddress()
```

##### Parameters
`None`

##### Returns
`None`

-----

### Host Callbacks
User-defined callbacks for handling client connections and disconnections and data received from clients. These **must** be present in your `host.js` sketch.

-----

#### onClientConnect()
[[Back to top]](#reference)

##### Example
```javascript
function onClientConnect (data) {
  // Client connect logic here. --->
  print(data.id + ' has connected.');

  // <----
}
```
##### Description
Callback for when new client connects to server. Must be defined in `host.js` sketch. `data` parameter provides: 
* `.id` String: unique ID of client

##### Syntax
```javascript
onClientConnect (data)
```

##### Parameters
`data` Object: contains client connection data

##### Returns
`None`

-----

#### onClientDisconnect()
[[Back to top]](#reference)

##### Example
```javascript
function onClientDisconnect (data) {
  // Client connect logic here. --->
  print(data.id + ' has disconnected.');

  // <----
}
```
##### Description
Callback for when client disconnects from server. Must be defined in `host.js` sketch. `data` parameter provides: 
* `.id` String: unique ID of client

##### Syntax
```javascript
onClientDisconnect (data)
```

##### Parameters
`data` Object: contains client connection data

##### Returns
`None`

-----

#### onReceiveData() - *Host*
[[Back to top]](#reference)

##### Example
```javascript
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
```
##### Description
Callback for when data is received from a client. Must be defined in `host.js` sketch. `data` parameter provides all data sent from client and always includes:
* `.id` String: unique ID of client
* `.type` String: data type of message

##### Syntax
```javascript
onReceiveData (data)
```

##### Parameters
`data` Object: contains all data sent from client

##### Returns
`None`

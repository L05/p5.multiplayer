/*
Author:	L05
Date:	2017.10.03

This sketch is intended to be run on mobile.
It sends the rotation data of the device to a node server
via socket.io.

Configure network, UI, and debug settings in settings.js.

Run http-server -c-1 to start server. This will default to port 8080.
Run http-server -c-1 -p80 to start server on open port 80.

*/

// Initialize variables
let rotation;

const sendInterval 		= 100;					// in milliseconds
let lastRotationSent;
let lastTrackPadSent;

let socket;
let isTouching				= false;
let isRotating				= false;
let b_trackPad;
let b_octoPad;
let playerColor;
// let b_reset, 			// buttons
// let b_transmit;

////////////////////////////////////////
////////////////////////////////////////

// Setup
function setup() {
	createCanvas(windowWidth, windowHeight);

	colorMode(HSB);
	playerColor = color(random(0,360), 100, 100);
	colorMode(RGB);

	// background(51);
	background(playerColor);
	textSize(16);

	if (rotationMode) { rotation = new Rotation(); }

	// Create buttons
	switch (touchMode) {
		case 0:
			b_trackPad = new TrackPad(0.5*windowWidth, 0.5*windowHeight, 0.9*windowWidth, 0.9*windowWidth);
			break;
		case 1:
			b_octoPad = new OctoPad(0.5*windowWidth, 0.5*windowHeight, 0.9*windowWidth, 0.9*windowWidth);
			break;
	}


	// b_transmit	= new ToggleButton(0.25*windowWidth, 0.90*windowHeight, 100, 50, 'transmit');
	// b_reset			= new MomentaryButton(0.75*windowWidth, 0.90*windowHeight, 100, 50, 'resetZ');

	// Open a connection to the web server on port 3000
	socket = io.connect(serverIp + ':' + serverPort);
	socket.emit('clientConnect', {
		 r: red(playerColor)/255,
		 g: green(playerColor)/255,
		 b: blue(playerColor)/255
	 	});

	// Initialize rotation and set threshold for device
	if (rotationMode) {
		rotation.initRotation();
		rotation.setRotationThreshold(0.05);

		// Send initial rotation value.
		sendRotation(0, 0, 0);
	}

	lastRotationSent = millis();
}

// Draw loop
function draw() {
	background(playerColor);

	// ROTATION (Accelerometer)
	if (rotationMode) {
		// Print the device's rotation values.
		rotation.update();

		if (debug) { printRotation(); }

		// If device is not flat, send rotation data.
		if (!rotation.isFlat()) {
			if (millis() - lastRotationSent > sendInterval) {
				sendRotation(rotation.get().x, rotation.get().y, rotation.get().z);
				lastRotationSent = millis();
			}

			isRotating = true
			// background(100);
		}
		// Else if device is flat, send a zero and stop.

		else if (rotation.isFlat() && isRotating) {
			if (millis() - lastRotationSent > sendInterval) {
				sendRotation(0, 0, 0);
				lastRotationSent = millis();
				isRotating = false;
			}
		}
		// else { background(51); }
	}

	switch (touchMode) {
		case 0:
			// TRACK PAD
			if (b_trackPad.isTouched()) {
				sendTrackPad(b_trackPad.out().x, b_trackPad.out().y);
			}

			push();
				b_trackPad.display();
			pop();
			break;
		case 1:
			push();
				b_octoPad.display();
			pop();
			break;
	}


	// push();
	//
	// 	// b_transmit.display();
	// 	// b_reset.display();
	// pop();

	textAlign(LEFT,BASELINE);

	// fill(255);
	// text(b_trackPad.direction.x.toFixed(2) + ', ' + b_trackPad.direction.y.toFixed(2) + '\t' + b_trackPad.pdirection.x.toFixed(2) + ', ' + b_trackPad.pdirection.y.toFixed(2), 5, height-10);

	// if (debug) {
	// 	Print green if device is transmitting, red otherwise
	// 	push();
	// 		if (isTransmitting) { fill(0, 255, 0); }
	// 		else { fill(128, 0, 0); }
	// 		text("isTransmitting", 10, 80);
	// 	pop();
  //
	// 	Print touch data
	// 	fill(255);
	// 	text(b_trackPad.getDirectionX() + ', ' + b_trackPad.getDirectionY(), 10, 96);
	// 	for (i = 0; i < touches.length; i++) {
	// 		text(touches[i].x + ', ' + touches[i].y, 10, 96+16*i);
	// 	}
	// }
}

////////////////////////////////////////
////////////////////////////////////////

function touchStarted() {
	isTouching = true;

	switch (touchMode) {
		case 0:
			b_trackPad.checkTouched();
			break;
		case 1:
			if (b_octoPad.checkTouched()) {
				sendTrackPad(b_octoPad.out().x, b_octoPad.out().y);
			}
			break;
	}

	// b_transmit.checkTouched();

	// If button touched, set rotOffsetZ
	// if (b_reset.checkTouched()) {
	// 	rotation.rotOffsetZ = rotationZ;
	// }
}

function touchEnded() {
	isTouching = false;

	switch (touchMode) {
		case 0:
			if(!b_trackPad.checkTouched()) {
				sendTrackPad(0, 0);
			}
			break;
		case 1:
			if (b_octoPad.checkTouched()) {
				sendTrackPad(b_octoPad.out().x, b_octoPad.out().y);
			} else {
				sendTrackPad(0, 0);
			}
			break;
	}

	// b_reset.checkTouched();
	// b_transmit.checkTouched();
}

function touchMoved() {
	switch (touchMode) {
		case 0:
			b_trackPad.checkTouched();
			break;
		case 1:
			b_octoPad.checkTouched()
			if (b_octoPad.checkChanged()) {
				sendTrackPad(b_octoPad.out().x, b_octoPad.out().y);
			}
			break;
	}

	// if (b_reset.checkTouched()) {
	// 	rotation.rotOffsetZ = rotationZ;
	// }

	return false;
}

////////////////////////////////////////
////////////////////////////////////////

function sendTrackPad(padX_, padY_) {
	// print rotation data to console
  console.log('Sending: ' +
		padX_ + ',' +	padY_
	);

  // Prepare rotation data
  let data = {
    padX: padX_,
    padY: padY_
  }

  // Send rotation data to server
  socket.emit('trackPad', data);
}

// Sends rotation data to server
function sendRotation(rotX_, rotY_, rotZ_) {
  // print rotation data to console
  console.log('Sending: ' +
		rotX_.toFixed(4) + ',' +
		rotY_.toFixed(4) + ',' +
		rotZ_.toFixed(4));

  // Prepare rotation data
  let data = {
    rotX: rotX_,
    rotY: rotY_,
    rotZ: rotZ_
  }

  // Send rotation data to server
  socket.emit('rotation', data);
}

// Print rotation data to screen.
function printRotation() {
  noStroke();

  // If rotation is over threshold, print in white,
  // otherwise print in dark red.
  if (rotation.isChangingX()) { fill(255);}
  else { fill(128,0,0); }
  text("rotX:\t" + rotation.get().x.toFixed(8), 10, 16);

  if (rotation.isChangingY()) { fill(255);}
  else { fill(128,0,0); }
  text("rotY:\t" + rotation.get().y.toFixed(8), 10, 32);

  if (rotation.isChangingZ()) { fill(255);}
  else { fill(128,0,0); }
  text("rotZ:\t" + rotation.get().z.toFixed(8), 10, 48);
}

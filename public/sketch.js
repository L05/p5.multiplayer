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

const sendInterval 		= 100;					// in milliseconds

let myFont;
let instructionsImg1;
let instructionsImg2;

let socket;
let isTouching				= false;
let isAttached				= true;
let b_segTrackPad;
let b_mode;
let b_start;
let playerColor;
let playerColorDim;
let id = null;
let playing = false;
let page = 0;

let p_deviceOrientation = "portrait";

////////////////////////////////////////
////////////////////////////////////////

// Preload
function preload() {
	// myFont = loadFont('data/CONSOLA.TTF');
	myFont = loadFont('data/msyi.ttf');
	instructionsImg1 = loadImage('data/Instructions_1.png');
	instructionsImg2 = loadImage('data/Instructions_2.png');
}

// Setup
function setup() {
	createCanvas(windowWidth, windowHeight);

	textFont(myFont);


	let hue = random(0, 360);

	colorMode(HSB);
	playerColor = color(hue, 100, 100);
	playerColorDim = color(hue, 100, 75);
	colorMode(RGB);

	// background(51);
	background(0);
	textSize(16);

	// Create buttons
	b_segTrackPad = new SegmentedTrackPad(
		padDimensionsP[0]*windowWidth,
		padDimensionsP[1]*windowHeight,
		padDimensionsP[2]*windowWidth,
		padDimensionsP[2]*windowWidth,
		segResolution);
	b_segTrackPad.fillOn					= color(16);
	b_segTrackPad.fillOff					= color(16);
	b_segTrackPad.fillFingerOn		= playerColor;
	b_segTrackPad.fillFingerOff		= playerColorDim;
	b_segTrackPad.fingerMode 			= SQUARE;
	b_segTrackPad.fingerAlwaysOn	= true;
	b_segTrackPad.setRound(25);

	b_mode = new MomentaryButton(
		0.50*windowWidth,
		0.85*windowHeight,
		0.9*windowWidth,
		0.2*windowHeight,
		'gather');
	b_mode.fillOn 	= playerColor;
	b_mode.fillOff	= playerColorDim;
	b_mode.setRound(0.075*windowWidth);

	b_start = new MomentaryButton(
		0.50*windowWidth,
		0.9*windowHeight,
		0.9*windowWidth,
		0.1*windowHeight,
		'next');
	b_start.fillOn 		= color(32);
	b_start.fillOff		= color(0);
	b_start.labelColor	= color(255);
	b_start.strokeWeight = 2;
	b_start.stroke				= color(127);
	b_start.setRound(25);

	// Socket.io
		// Open a connection to the web server on port 3000
		socket = io.connect(serverIp + ':' + serverPort);
		socket.emit('join', {name: 'client'});
		socket.on('id', function(data) {
			id = data;
			console.log("id: " + id);
		});

		socket.on('mode', function(data) {
			isAttached = (data.mode == "true");
			console.log("mode: " + isAttached);

			if (isAttached) {
				b_mode.setLabel("gather");
			} else {
				b_mode.setLabel("guide");
			}
		});

		// socket.emit('clientConnect', {
		// 	 r: red(playerColor)/255,
		// 	 g: green(playerColor)/255,
		// 	 b: blue(playerColor)/255
		//  	});
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

////////////
// Draw loop
function draw() {
	background(0);

	if (playing) {
		// Check to see if orientation has changed.
		if (p_deviceOrientation != deviceOrientation) {
			orientationChanged();
			p_deviceOrientation = deviceOrientation;
		}

		push();
			// Main one used.
			b_segTrackPad.display();
			b_mode.display();
		pop();

		if (isAttached) {
			let targetRadius = 0;
			if (deviceOrientation == "portrait") {
				targetRadius = padDimensionsP[2]*windowWidth*0.4;
			} else {
				targetRadius = padDimensionsL[2]*windowHeight*0.4;
			}

			push();
				stroke(200);
				noFill();
				ellipse(
					b_segTrackPad.center.x,
					b_segTrackPad.center.y,
					targetRadius
					);
			pop();
		}
	} else if (page == 0) {
		push();
			let w = windowWidth;
			let h = windowWidth*1.15;
			if (deviceOrientation == "landscape") {
				w = windowHeight;
				h = windowHeight*1.15;
				translate(windowWidth, 0);
				rotate(PI/2)
			}

			image(instructionsImg1, 0, 0, w, h);
			textAlign(CENTER, CENTER);
			b_start.display();
		pop();
	} else {
		push();
		let w = windowWidth;
		let h = windowWidth*1.15;
		if (deviceOrientation == "landscape") {
			w = windowHeight;
			h = windowHeight*1.15;
			translate(windowWidth, 0);
			rotate(PI/2)
		}

		image(instructionsImg2, 0, 0, w, h);
			textAlign(CENTER, CENTER);
			b_start.display();
		pop();
	}

	textAlign(LEFT,BASELINE);
}

////////////////////////////////////////
////////////////////////////////////////

function orientationChanged() {
	// console.log("deviceOrientation: " + deviceOrientation + ",\twindowWidth: " + windowWidth + ",\twindowheight: " + windowHeight);

	if (deviceOrientation == "portrait") {
		b_segTrackPad.setDimensions(
			padDimensionsP[0]*windowWidth,
			padDimensionsP[1]*windowHeight,
			padDimensionsP[2]*windowWidth,
			padDimensionsP[2]*windowWidth);

		b_mode.setDimensions(
			0.5*windowWidth,
			0.875*windowHeight,
			0.9*windowWidth,
			0.2*windowWidth);
	} else {
		b_segTrackPad.setDimensions(
			padDimensionsL[0]*windowWidth,
			padDimensionsL[1]*windowHeight,
			padDimensionsL[2]*windowHeight,
			padDimensionsL[2]*windowHeight);

		b_mode.setDimensions(
			0.15*windowWidth,
			0.50*windowHeight,
			0.4*windowHeight,
			0.9*windowHeight);
	}
}

function touchStarted() {
	isTouching = true;

	if (b_segTrackPad.checkTouched()) {
		sendTrackPad(b_segTrackPad.out().x, b_segTrackPad.out().y);
	}

	if (b_mode.checkTouched()) {
		// sendModeToggle(b_mode.getState()); // Toggle
		sendModeMomentary();
	}

	if (b_start.checkTouched()) {
		if (page < 1) {
			page++;
			b_start.setLabel('play');
		} else {
			playing = true;
			socket.emit('clientConnect', {
				 r: red(playerColor)/255,
				 g: green(playerColor)/255,
				 b: blue(playerColor)/255
			 	});
		}
	}
}

function touchEnded() {
	isTouching = false;

	if (b_segTrackPad.checkTouched()) {
		sendTrackPad(b_segTrackPad.out().x, b_segTrackPad.out().y);
	} else {
		sendTrackPad(0, 0);
	}

	// if (b_mode.checkTouched()) {
	// 	sendModeToggle(b_mode.getState()); // Toggle
	// }

	b_mode.checkTouched() // Momentary
	b_start.checkTouched();
}

function touchMoved() {

	b_segTrackPad.checkTouched();
	if (b_segTrackPad.checkChanged()) {
		sendTrackPad(b_segTrackPad.out().x, b_segTrackPad.out().y);
	}

	// b_mode.checkTouched() // Momentary

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
  const data = {
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
  const data = {
    rotX: rotX_,
    rotY: rotY_,
    rotZ: rotZ_
  }

  // Send rotation data to server
  socket.emit('rotation', data);
	// socket.in('screen').emit('rotation', data);
}

function sendModeToggle(mode_) {
	// print mode to console
	console.log('Sending: ' + mode_);

	// prepare mode data
	const data = {
		mode: mode_
	}

	socket.emit('mode', data);
}

function sendModeMomentary(_) {
	// print mode to console
	console.log('Sending mode pulse.');

	// prepare mode data
	const data = {
		mode: 'pulse'
	}

	socket.emit('mode', data);
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

// Requires utilities.js.

////////////////////////////////////////
////////////// TRACK PAD ///////////////
////////////////////////////////////////

class TrackPad {
	constructor(x_, y_, width_, height_) {
		this.x						= x_;
		this.y						= y_;
		this.width				= width_;
		this.height				= height_;

		this.center				= createVector(x_, y_);
		this.finger				= createVector(x_, y_);
		this.fingerRadius	= 0.2*width_;
		this.direction		= createVector(0, 0);
		this.pdirection		= createVector(0, 0);

		// this.deadZone			= 0;

		this.fillOff			= color(63, 63, 63, 255);
		this.fillOn				= color(127, 127, 127, 255);
		this.fillFinger		= color(255, 255);
		this.stroke				= color(0, 0, 0, 255);
		this.strokeWeight = 4;

		this.touched			= false;
		this.threshold		= 0.0;
		this.sending		= false;
	}

	display() {
		push();
			stroke(this.stroke);
			strokeWeight(this.strokeWeight);

			// Draw trackPad
			if (this.touched) {
				fill(this.fillOn);
			} else {
				fill(this.fillOff);
			}

			rectMode(CENTER);
			rect(this.x, this.y, this.width, this.height, this.round);

			// Draw finger guide
			if (this.touched) {
				noStroke();
				fill(this.fillFinger);
				ellipse(this.finger.x, this.finger.y, this.fingerRadius);
			}
		pop();
	}

	checkTouched() {
		this.touched	= false;

		for (let i = 0; i < touches.length; i++) {
			if (touches[i].x > this.x-this.width/2 && touches[i].x < this.x+this.width/2 &&
				touches[i].y > this.y-this.height/2 && touches[i].y < this.y+this.height/2 && !this.touched) {
				this.touched 			= true;

				this.direction.x 	= -(this.center.x - touches[i].x)/(this.width/2);
				this.direction.y 	= (this.center.y - touches[i].y)/(this.height/2);

				this.finger.x			= touches[i].x;
				this.finger.y			= touches[i].y;

				// if (abs(this.direction.x - this.pdirection.x) > this.threshold ||
				// 		abs(this.direction.y - this.pdirection.y) > this.threshold) {
				// 	this.sending	= true;
				// } else {
				// 	this.sending = false;
				// }
			}
		}

		return this.touched;
	}

	isTouched() {
		return this.touched;
	}

	isSending() {
		// if (this.direction.x == this.pdirection.x &&
		// 		this.direction.y == this.pdirection.y) {
		// 	this.sending	= false;
		// } else {
		// 	this.sending = true;
		// 	this.pdirection.x	= this.direction.x;
		// 	this.pdirection.y	= this.direction.y;
		// }
    //
		return this.sending;
	}

	out() {


		// this.pdirection.x	= this.direction.x;
		// this.pdirection.y	= this.direction.y;

		return this.direction;
	}

	setFingerRadius(fingerRadius_) {
		this.fingerRadius = fingerRadius_;
	}
}

////////////////////////////////////////
/////////////// QUAD PAD ///////////////
////////////////////////////////////////

class QuadPad {
	constructor(x_, y_, width_, height_) {
		this.x						= x_;
		this.y						= y_;
		this.width				= width_;
		this.height				= height_;
		this.center				= createVector(x_ + width_/2, y_ + height_/2)
		this.direction		= createVector(0, 0);
		this.fillOff			= color(200, 200, 200, 255);
		this.fillOn				= color(0, 255, 0, 255);
		this.stroke				= color(0, 0, 0, 255);
		this.strokeWeight = 4;
		this.touched			= false;
		this.buttons 			= [0, 0, 0, 0];

		// Set directional buttons' triangle points
		this.buttonPoints	= []
		this.buttonPoints[0] = [x_, y_, x_, y_ + height_, this.center.x, this.center.y];
		this.buttonPoints[1] = [x_ + width_, y_, x_ + width_, y_ + height_, this.center.x, this.center.y];
		this.buttonPoints[2] = [x_, y_, x_ + width_, y_, this.center.x, this.center.y];
		this.buttonPoints[3] = [x_, y_ + height_, x_ + width_, y_ + height_, this.center.x, this.center.y];
	}

	display() {
		push();
			stroke(this.stroke);
			strokeWeight(this.strokeWeight);

			for (let i = 0; i < 4; i++) {
				if (this.buttons[i] == 1) {
					fill(this.fillOn);
				} else {
					fill(this.fillOff);
				}

				triangle(this.buttonPoints[i][0], this.buttonPoints[i][1],
					this.buttonPoints[i][2], this.buttonPoints[i][3],
					this.buttonPoints[i][4], this.buttonPoints[i][5]);
			}

		pop();
	}

	// Check to see if pad is touched. Set value for each direction button.
	checkTouched() {
		this.buttons = [0, 0, 0, 0];
		this.touched = false;


		for (let i = 0; i < touches.length; i++) {
			for (let j = 0; j < 4; j++) {
				if (isInsideTriangle(touches[i].x, touches[i].y,
						this.buttonPoints[j][0], this.buttonPoints[j][1],
						this.buttonPoints[j][2], this.buttonPoints[j][3],
						this.buttonPoints[j][4], this.buttonPoints[j][5]
						)) {
					this.buttons[j] = 1;
					this.touched 	= true;
				}
			}
		}

		this.direction.x = this.buttons[0] - this.buttons[1];	// calculate x direction
		this.direction.y = this.buttons[2] - this.buttons[3];	// calculate y direction

		return this.touched;
	}

	// Return direction based on registered touches.
	getDirection() {
		return this.direction;
	}
}

////////////////////////////////////////
/////////// MOMENTARY BUTTON ///////////
////////////////////////////////////////

class MomentaryButton {
	constructor(x_, y_, width_, height_, label_) {
		this.x						= x_;
		this.y						= y_;
		this.width				= width_;
		this.height				= height_;
		this.round				= 0;
		this.fillOff			= color(200, 200, 200, 255);
		this.fillOn				= color(0, 255, 0, 255);
		this.stroke				= color(0, 0, 0, 255);
		this.strokeWeight	= 4;
		this.touched			= false;
		this.label				= label_;
		this.labelColor		= color(0, 0, 0, 255);
		this.textSize			= 24;
	}

	display() {
		push();
			stroke(this.stroke);
			strokeWeight(this.strokeWeight);

			if (this.touched) {
				fill(this.fillOn);
			} else {
				fill(this.fillOff);
			}

			rectMode(CENTER);
			rect(this.x, this.y, this.width, this.height, this.round);

			noStroke();
			textAlign(CENTER,CENTER);
			fill(this.labelColor);
			textSize(this.textSize);
			text(this.label, this.x, this.y);
		pop();
	}

	checkTouched() {
		this.touched = false;

		for (i = 0; i < touches.length; i++) {
			if (touches[i].x > this.x-this.width/2 && touches[i].x < this.x+this.width/2 &&
				touches[i].y > this.y-this.height/2 && touches[i].y < this.y+this.height/2) {
				this.touched = true;
			}
		}

		return this.touched;
	}

	setRound(round_) {
		this.round = round_;
	}

	setLabel(label_) {
		this.label = label_;
	}
}

////////////////////////////////////////
/////////// TOGGLE BUTTON ///////////
////////////////////////////////////////

class ToggleButton {
	constructor(x_, y_, width_, height_, label_) {
		this.x						= x_;
		this.y						= y_;
		this.width				= width_;
		this.height				= height_;
		this.round				= 0;
		this.fillOff			= color(200, 200, 200, 255);
		this.fillOn				= color(0, 255, 0, 255);
		this.stroke				= color(0, 0, 0, 255);
		this.strokeWeight	= 4;
		this.touched			= false;
		this.label				= label_;
		this.labelColor		= color(0, 0, 0, 255);
		this.state				= false;
		this.textSize			= 24;
	}

	display() {
		push();
			stroke(this.stroke);
			strokeWeight(this.strokeWeight);

			if (this.state) {
				fill(this.fillOn);
			} else {
				fill(this.fillOff);
			}

			rectMode(CENTER);
			rect(this.x, this.y, this.width, this.height, this.round);

			noStroke();
			textAlign(CENTER,CENTER);
			fill(this.labelColor);
			textSize(this.textSize);
			text(this.label, this.x, this.y);
		pop();
	}

	checkTouched() {
		this.touched = false;

		for (i = 0; i < touches.length; i++) {
			if (touches[i].x > this.x-this.width/2 && touches[i].x < this.x+this.width/2 &&
				touches[i].y > this.y-this.height/2 && touches[i].y < this.y+this.height/2) {
				this.touched = true;

				if (this.state) {
					this.state = false;
				} else {
					this.state = true;
				}
			}
		}

		return this.touched;
	}

	getState() {
		return this.state;
	}

	setRound(round_) {
		this.round = round_;
	}

	setLabel(label_) {
		this.label = label_;
	}
}

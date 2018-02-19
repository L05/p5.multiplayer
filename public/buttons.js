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
			}
		}

		return this.touched;
	}

	isTouched() {
		return this.touched;
	}

	out() {
		return this.direction;
	}

	setFingerRadius(fingerRadius_) {
		this.fingerRadius = fingerRadius_;
	}
}

////////////////////////////////////////
///////// SEGMENTED TRACK PAD //////////
////////////////////////////////////////

class SegmentedTrackPad {
	constructor(x_, y_, width_, height_, resolution_) {
		this.x						= x_;
		this.y						= y_;
		this.width				= width_;
		this.height				= height_;
		this.divs					= 2*resolution_;

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
		this.changed			= false;
		this.threshold		= 0.0;
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

			strokeWeight(1);
			for (let i = 1; i <= this.divs; i++) {
				line(this.x-this.width/2+i*this.width/(this.divs+1), this.y-this.height/2, this.x-this.width/2+i*this.width/(this.divs+1), this.y+this.height/2);
				line(this.x-this.width/2, this.y-this.height/2+i*this.height/(this.divs+1), this.x+this.width/2, this.y-this.height/2+i*this.height/(this.divs+1));
			}


			strokeWeight(this.strokeWeight);

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

				this.direction.x = floor(this.direction.x*this.divs)/this.divs;
				this.direction.y = floor(this.direction.y*this.divs)/this.divs;

				this.finger.x			= touches[i].x;
				this.finger.y			= touches[i].y;
			}
		}

		// Check to see if input has changed.
		if (this.direction.x != this.pdirection.x ||
				this.direction.y != this.pdirection.y) {
			this.changed = true;
		} else {
			this.changed = false;
		}

		this.pdirection.x = this.direction.x;
		this.pdirection.y = this.direction.y;

		return this.touched;
	}

	isTouched() {
		return this.touched;
	}

	// Returns whether or not input has changed as boolean.
	checkChanged() {
		return this.changed;
	}

	out() {
		return this.direction;
	}

	setFingerRadius(fingerRadius_) {
		this.fingerRadius = fingerRadius_;
	}
}

////////////////////////////////////////
/////////////// OCTO PAD ///////////////
////////////////////////////////////////
/*
	Buttons:
	0 = Top
	1 = Top-Right
	2 = Right
	3 = Bottom-Right
	4 = Bottom
	5 = Bottom-Left
	6 = Left
	7 = Top-Left
*/

class OctoPad {
	constructor(x_, y_, width_, height_) {
		this.x						= x_;
		this.y						= y_;
		this.width				= width_;
		this.height				= height_;
		this.direction		= createVector(0, 0);
		this.pdirection		= createVector(0, 0);
		this.fillOff			= color(200, 200, 200, 255);
		this.fillOn				= color(0, 255, 0, 255);
		this.stroke				= color(0, 0, 0, 255);
		this.strokeWeight = 4;
		this.touched			= false;
		this.changed			= false;
		this.buttons 			= [0, 0, 0, 0, 0, 0, 0, 0];

		this.buttonCenters	= [];
		this.buttonCenters[0]	= [x_, y_ - height_*(1/3)];
		this.buttonCenters[1]	= [x_ + width_*(1/3), y_ - height_*(1/3)];
		this.buttonCenters[2]	= [x_ + width_*(1/3), y_];
		this.buttonCenters[3]	= [x_ + width_*(1/3), y_ + height_*(1/3)];
		this.buttonCenters[4]	= [x_, y_ + height_*(1/3)];
		this.buttonCenters[5]	= [x_ - width_*(1/3), y_ + height_*(1/3)];
		this.buttonCenters[6]	= [x_ - width_*(1/3), y_];
		this.buttonCenters[7]	= [x_ - width_*(1/3), y_ - height_*(1/3)];
	}

	display() {
		push();
			rectMode(CENTER);
			stroke(this.stroke);
			strokeWeight(this.strokeWeight);

			// Draw buttons.
			for (let i = 0; i < 8; i++) {
				if (this.buttons[i] == 1) {
					fill(this.fillOn);
				} else {
					fill(this.fillOff);
				}

				rect(this.buttonCenters[i][0], this.buttonCenters[i][1], this.width/3, this.height/3);

				// Draw arrows.
				fill(0);
				push();
					translate(this.buttonCenters[i][0], this.buttonCenters[i][1]);
					rotate(i*PI/4);
					triangle(0, -10, -10, 10, 10, 10);
				pop();
			}
		pop();
	}

	// Check to see if pad is touched and returns boolean.
	// Set value for each direction button.
	checkTouched() {
		this.buttons = [0, 0, 0, 0, 0, 0, 0, 0];
		this.touched = false;

		// Check each button.
		for (let i = 0; i < touches.length; i++) {
			for (let j = 0; j < 8; j++) {
				if (touches[i].x >= (this.buttonCenters[j][0] - this.width/6) &&
						touches[i].x <= (this.buttonCenters[j][0] + this.width/6) &&
						touches[i].y >= (this.buttonCenters[j][1] - this.height/6) &&
						touches[i].y <= (this.buttonCenters[j][1] + this.height/6)) {
					this.buttons[j] = 1;
					this.touched 		= true;
				}
			}
		}

		// calculate x direction
		this.direction.x 	= this.buttons[1] + this.buttons[2] + this.buttons[3] -
												this.buttons[5] - this.buttons[6] - this.buttons[7];
		// calculate y direction
		this.direction.y 	= this.buttons[0] + this.buttons[1] + this.buttons[7] -
												this.buttons[3] - this.buttons[4] - this.buttons[5];

		this.direction.normalize();

		// Check to see if input has changed.
		if (this.direction.x != this.pdirection.x ||
				this.direction.y != this.pdirection.y) {
			this.changed = true;
		} else {
			this.changed = false;
		}

		this.pdirection.x = this.direction.x;
		this.pdirection.y = this.direction.y;

		return this.touched;
	}

	// Returns whether or not input has changed as boolean.
	checkChanged() {
		return this.changed;
	}

	// Return direction based on registered touches.
	out() {
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

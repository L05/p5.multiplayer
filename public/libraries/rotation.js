////////////////////////////////////////
////////////////////////////////////////

// Requires utilities.js.

class Rotation {
  constructor() {
    this.rot                = createVector(0, 0, 0);
    this.rotX               = 0;
    this.rotY               = 0;
    this.rotZ               = 0;
    this.offsetZ         = 0;
    this.rotZRef            = 0;
    this.rotationThreshold  = 0;
    this.debug              = false;
  }

  setDebug(debug) {
    this.debug = debug;
  }

  // Initialize rotation variables
  initRotation() {
  	this.rot.x = rotationX;
  	this.rot.y = rotationY;
  	this.rot.z = cycle(rotationZ - this.offsetZ, 0, 360);
  }

  update() {
    this.rot.x = rotationX;
    this.rot.y = rotationY;
    this.rot.z = cycle(rotationZ - this.offsetZ, 0, 360);
  }

  // Getters for retrieving rotation
  get() {
    return this.rot;
  }

  // Check if change in rotation is above threshold in all three axes.
  isChanging() {
  	if (this.checkX() || this.checkY() || this.checkZ()) {
  		return true;
  	} else {
  		return false;
  	}
  }

  isChangingX() {
  	if (abs(rotationX-pRotationX)>this.rotationThreshold) {
  		return true;
  	} else {
  		return false;
  	}
  }

  isChangingY() {
  	if (abs(rotationY-pRotationY)>this.rotationThreshold) {
  		return true;
  	} else {
  		return false;
  	}
  }

  isChangingZ() {
  	if (abs(rotationZ-pRotationZ)>this.rotationThreshold) {
  		return true;
  	} else {
  		return false;
  	}
  }

  // Check to see if device is laying flat
  isFlat() {
    if (rotationX < 1 && rotationX > -1 && rotationY < 1 && rotationY > -1) {
      return true;
    } else {
      return false;
    }
  }

  // Set the rotation threshold
  setRotationThreshold(threshold) {
  	this.rotationThreshold = threshold;
  }
}

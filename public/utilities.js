// Function that is similar to clamp but loops between a min and max value
function cycle(value, minimum, maximum) {
	const difference = maximum - minimum;

	if (value > maximum) {
		return (value - maximum) % difference + minimum;
	} else if (value < minimum) {
		return maximum - (minimum - value) % difference;
	} else {
		return value;
	}
}

// A utility function to calculate area of triangle
// formed by (x1, y1) (x2, y2) and (x3, y3)
function triangleArea(x1, y1, x2, y2, x3, y3) {
  return abs((x1*(y2-y3) + x2*(y3-y1) + x3*(y1-y2))/2.0);
}

// A function to check whether point P(x, y) inside
// the triangle formed by A(x1, y1), B(x2, y2) and C(x3, y3)
function isInsideTriangle(x, y, x1, y1, x2, y2, x3, y3) {
  /* Calculate area of triangle ABC */
  const A   = triangleArea (x1, y1, x2, y2, x3, y3);

  /* Calculate area of triangle PBC */
  const A1  = triangleArea (x, y, x2, y2, x3, y3);

  /* Calculate area of triangle PAC */
  const A2  = triangleArea (x1, y1, x, y, x3, y3);

  /* Calculate area of triangle PAB */
  const A3  = triangleArea (x1, y1, x2, y2, x, y);

  /* Check if sum of A1, A2 and A3 is same as A */
  return (A == A1 + A2 + A3);
}

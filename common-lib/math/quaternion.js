"use strict";

/**
 * quaternion's in the form of [x, y, z, w]
 *
 *
 */
var quaternion = {
    add: numeric.add,
    addeq: numeric.addeq,
    dot: numeric.dot,
    magnitude: numeric.norm2,
    magnitudeSquared: numeric.norm2Squared,
    negate: numeric.negV,
    scale: numeric.mulVS
};

quaternion.conjugate = function(q) {
    return [-q[0], -q[1], -q[2], q[3]];
};

quaternion.normalize = function(q) {
    var s = numeric.norm2(q);
    return numeric.divVS(q, s);
};

/**
 * Multiply two quaternion's - not a commutative operation
 * @param   {Vector4} q0 
 * @param   {Vector4} q1 
 * @returns {Vector4}
 */
quaternion.concat = function(q0, q1) {
    var x0 = q0[0], y0 = q0[1], z0 = q0[2], w0 = q0[3],
        x1 = q1[0], y1 = q1[1], z1 = q1[2], w1 = q1[3],
        result = new Array(4);

    result[0] = w0 * x1 + x0 * w1 + y0 * z1 - z0 * y1;
    result[1] = w0 * y1 - x0 * z1 + y0 * w1 + z0 * x1;
    result[2] = w0 * z1 + x0 * y1 - y0 * x1 + z0 * w1;
    result[3] = w0 * w1 - x0 * x1 - y0 * y1 - z0 * z1;
    return result;
};

/**
 * Rotation can be represented by a vector and an angle of revolution about that vector.
 * @param   {Number} angle rotation in radians
 * @param   {Vector3} axis axis to rotate around
 * @returns {Vector4} quaternion expressiong the rotation about the axis
 */
quaternion.fromAngleAxis = function(angle, axis) {
    var halfAngle = 0.5 * angle,
        sin = Math.sin(halfAngle);

    axis = quaternion.normalize(axis);
    return quaternion.normalize([sin * axis[0], sin * axis[1], sin * axis[2], Math.cos(halfAngle)]);
};

quaternion.toAngleAxis = function(q) {
  // http://www.euclideanspace.com/maths/geometry/rotations/conversions/quaternionToAngle/index.htm
  if( q[3] > 1 ) q = quaternion.normalize(q);
  var w = q[3];
  var angle = 2 * Math.acos( w );
  var s = Math.sqrt( 1 - (w * w) );
  var axis;
  if( Math.abs(angle) < 1e-4 )
    axis = [0,0,1];
  else if ( Math.abs(Math.PI - angle) < 1e-4 )
    axis = [ q[0], q[1], q[2] ];
  else
    axis = [q[0]/s,q[1]/s,q[2]/s];
            
  return {angle: angle, axis: axis};
};

/**
 * Calcuates the quaternion which will rotate 'from' to 'to'
 * @param   {[[Type]]} from [[Description]]
 * @param   {[[Type]]} to   [[Description]]
 * @returns {Array}    [[Description]]
 */
quaternion.fromToRotation = function(from, to) {
  var dot, q, s, invs
  from = numeric.divVS(from, numeric.norm2(from))
  to = numeric.divVS(to, numeric.norm2(to))
  dot = numeric.dot(from, to)
  if (dot > 1.0 - 1e-6) {
    return [0, 0, 0, 1]
  } else if (dot < -(1.0 - 1e-6)) {
    return quaternion.fromAngleAxis(Math.PI, [0, 0, 1])
  } else {
    q = new Array(4)
    s = Math.sqrt(2 * (1 + dot))
    invs = 1 / s
    q[0] = (from[1] * to[2] - from[2] * to[1]) * invs
    q[1] = (from[2] * to[0] - from[0] * to[2]) * invs
    q[2] = (from[0] * to[1] - from[1] * to[0]) * invs
    q[3] = 0.5 * s
    return quaternion.normalize(q)
  }
}

quaternion.fromVector = function(vec) {
    return [vec[0], vec[1], vec[2], 0];
};

quaternion.toVector = function(q) {
  return [q[0], q[1], q[2]];
}

quaternion.rotate = function(q, vector) {
    var p = quaternion.fromVector(vector);
    return quaternion.toVector(quaternion.concat(quaternion.concat(q, p), quaternion.conjugate(q)));
};

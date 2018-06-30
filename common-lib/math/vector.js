/**
 * Vector Math
 */
var vector = {
  add: numeric.add,
  addeq: numeric.addeq,
  dot: numeric.dot,
  magnitude: numeric.norm2,
  magnitudeSquared: numeric.norm2Squared,
  negate: numeric.negV,
  scale: numeric.mulVS,
  sub: numeric.sub,
  subeq: numeric.subeq,
  cross: function cross(a, b){
    if( a.length == 3 )
      return [
        a[1]*b[2]-a[2]*b[1],
        a[2]*b[0]-a[0]*b[2],
        a[0]*b[1]-a[1]*b[0]
      ];
    
    if( a.length == 2 )
      return [0, 0,a[0]*b[1]-a[1]*b[0]];
    else
      throw new Error("Cross product only supported for Vector2 and Vector3");
  },
  normalize: function(v) {
    return numeric.divVS(v,numeric.norm2(v));
  },
  /**
   * Computes the angle between two vectors. If normal is given it is used
   * to calculate the sign of the angle. If normal is not given the angle
   * is always positive.
   * @param   {vector} a      vector
   * @param   {vector} b      vector
   * @param   {vector} normal vector which is considered to be in the 'up' direction
   * @returns {Number} angle between vectors
   */
  angleBetween: function(a,b,normal){
    var dot = numeric.dot(a,b);
    var cross = vector.cross(a,b);
    var a = Math.atan2( numeric.norm2(cross), dot )
    if( normal ) {
      if( numeric.dot(normal, cross) < 0 ) a = -a;
    }
    return a;
  },
  rotateZ: function rotateZ( v, angle, asDeg ){
    if( asDeg ) angle *= Math.PI/180;
    var c = Math.cos(angle), s = Math.sin(angle);
    var v2 = v.slice(0);
    v2[0]=v[0]*c-v[1]*s;
    v2[1]=v[0]*s+v[1]*c;
    return v2;
  },
  testParallel: function( v1, v2 ){
    return vector.magnitude( vector.cross( v1, v2 ) ) == 0;
  },
  
};
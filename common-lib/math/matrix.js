var matrix = {};
(function(ns){
  "use strict";

  function zeroize(v){return v>ep||v<-ep?v:0}
  function zeroizeV(v){
    var i,b,l=v.length;
    var a=new Array(l);
    for(i=0;i<l;++i){b=v[i];a[i]=b>ep||b<-ep?b:0}
    return a;
  }
  
  var slice = Array.prototype.slice
  var cos = Math.cos;
  var sin = Math.sin;
  var PI = Math.PI;
  var D2R = PI/180;
  var MM = numeric.dotMMsmall;
  var ident = numeric.identity;
  var ep = 1e-12;  // numeric.epsilon;
  
  ns.inverse = ns.inv = numeric.inv;
  ns.identity = numeric.identity;
  ns.mul = MM;
  
  /**
   * Applys the given transformation to the point.
   * @param   {matrix} m transformation matrix
   * @param   {Array} v point or vector
   * @returns {Array} transformed point or vector
   */
  ns.transformPoint = function transformPoint( m, v ) {
    var k = m.length, l = k - 1;
    if(!Array.isArray(v))v=slice.call(arguments,1);
    else v=v.slice(0,l);
    for( var i = v.length; i < l; ++i ) v[i] = 0;
    v[l] = 1;
    
    var ret = zeroizeV(numeric.dotMV(m,v));
    ret.x = ret[0];
    ret.y = ret[1];
    ret.z = m.length > 3 ? ret[2] : 0;
    ret.w = ret[l];
    ret.length = l;
    return ret;
  }
  
  /**
   * Adds a translation to the given matrix
   * @param   {matrix} m transformation matrix
   * @param   {Number} x 
   * @param   {Number} y 
   * @param   {Number} z 
   * @returns {matrix} matrix with translation applied
   */
  ns.translate = function translate( m, x, y, z ){
    var k = m.length;
    var t = ident( k );
    --k;
    for( var i = 0; i < k; ++i ) {
      t[i][k] = arguments[i + 1] || 0;
    }
    return MM( m, t );
  };
  
  ns.new_translation3=function(x,y){return [[1,0,x||0],[0,1,y||0],[0,0,1]]}
  ns.new_translation4=function(x,y,z){return [[1,0,0,x||0],[0,1,0,y||0],[0,0,1,z||0],[0,0,0,1]]}
  
  ns.rotateX = function rotateX( m, angle, asDeg ){
    if( asDeg ) angle *= D2R;
    var k = m.length;
    if( k < 4 ) throw new Error( "Matrix must be at least 4x4" );
    var r = ident( k );
    var c = zeroize(cos(angle)), s = zeroize(sin(angle));
    r[1][1] = c;
    r[1][2] = s;
    r[2][1] = -s;
    r[2][2] = c;
    return MM( m, r );
  };
  
  ns.rotateY = function rotateY( m, angle, asDeg ){
    if( asDeg ) angle *= D2R;
    var k = m.length;
    if( k < 4 ) throw new Error( "Matrix must be at least 4x4" );
    var r = ident( k );
    var c = zeroize(cos(angle)), s = zeroize(sin(angle));
    r[0][0] = c;
    r[0][2] = -s;
    r[2][0] = s;
    r[2][2] = c;
    return MM( m, r );
  };
  
  ns.rotateZ = ns.rotate = function rotateZ( m, angle, asDeg ){
    if( asDeg ) angle *= D2R;
    var k = m.length;
    if( k < 3 ) throw new Error( "Matrix must be at least 3x3" );
    var r = ident( k );
    var c = zeroize(cos(angle)), s = zeroize(sin(angle));
    r[0][0] = c;
    r[0][1] = s;
    r[1][0] = -s;
    r[1][1] = c;
    return MM( m, r );
  };
  ns.new_rotation3 = function(angle, asDeg){
    if(asDeg)angle*=D2R;
    var c = zeroize(cos(angle)), s = zeroize(sin(angle));
    return [[c,s,0],[-s,c,0],[0,0,1]];
  }
  ns.new_rotation4 = function(angle, asDeg){
    if( asDeg ) angle *= D2R;
    var c = zeroize(cos(angle)), s = zeroize(sin(angle));
    return [[c,s,0,0],[-s,c,0,0],[0,0,1,0],[0,0,0,1]];
  }
  
  ns.scale = function scale(m){
    var k = m.length;
    var s = ident( k );
    --k;
    for( var i = 0; i < k; ++i ) {
      s[i][i] = arguments[i + 1] || 0;
    }
    return MM( m, s );
  };
  
  
  ns.fromQuaternion = function fromQuaternion(q) {
    q = quaternion.normalize(q);
    var m = [new Array(4), new Array(4), new Array(4), new Array(4)];
    var xx=q[0]*q[0],
        xy=q[0]*q[1],
        xz=q[0]*q[2],
        xw=q[0]*q[3],
        yy=q[1]*q[1],
        yz=q[1]*q[2],
        yw=q[1]*q[3],
        zz=q[2]*q[2],
        zw=q[2]*q[3];

    m[0][0] = zeroize(1 - 2 * ( yy + zz ));
    m[0][1] = zeroize(    2 * ( xy - zw ));
    m[0][2] = zeroize(    2 * ( xz + yw ));

    m[1][0] = zeroize(    2 * ( xy + zw ));
    m[1][1] = zeroize(1 - 2 * ( xx + zz ));
    m[1][2] = zeroize(    2 * ( yz - xw ));

    m[2][0] = zeroize(    2 * ( xz - yw ));
    m[2][1] = zeroize(    2 * ( yz + xw ));
    m[2][2] = zeroize(1 - 2 * ( xx + yy ));

    m[0][3]=m[1][3]=m[2][3]=m[3][0]=m[3][1]=m[3][2]=0;
    m[3][3]=1;

    return m;
  };
  
  ns.rotatationToZPlane = function rotatationToZPlane( v1, v2 ){
    v1 = vector.normalize(v1);
    v2 = vector.normalize(v2);
    var c = vector.cross(v1,v2);
    var n = [0,0,1];
    if( numeric.dot(n,c) < 0 ) n[2] = -1;  // Make sure we dont flip the Z plane upside down
    var q = quaternion.fromToRotation(c, n);
    //console.warn( c );
    //var aa = quaternion.toAngleAxis( q );
    //console.warn( aa, aa.angle * 180 / Math.PI );
    return matrix.fromQuaternion(q);
  };
})(matrix);
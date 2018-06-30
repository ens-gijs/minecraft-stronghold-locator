/**
 * intersection of 3D lines
 * @param   {[[Type]]} p1 [[Description]]
 * @param   {[[Type]]} v1 [[Description]]
 * @param   {[[Type]]} p2 [[Description]]
 * @param   {[[Type]]} v2 [[Description]]
 * @returns {Array}    [[Description]]
 */
function intersection_of_lines( p1, v1, p2, v2 ){
  // http://mathforum.org/library/drmath/view/62814.html
  // a (V1 X V2) = (P2 - P1) X V2
  // L1 = P1 + a V1

  var left = vector.cross( v1, v2 );
  var right = vector.cross( vector.sub( p2, p1 ), v2 );

  //if( !vector.testParallel( left, right ) )
  //  throw new Error("Not Parallel");
    //return [NaN, NaN, NaN];
  
  var a = vector.magnitude(right) / vector.magnitude(left);
  return vector.add( p1, vector.scale( v1, a ) );
}

function intersection_infinite_ray_circle_2d( center, radius, ray_p, ray_v ) {
  var v = ray_v;
  var p1 = ray_p;
  var p2 = vector.sub( ray_p, v );

  var dx = p2[0] - p1[0];
  var dy = p2[1] - p1[1];
  var dr = Math.sqrt( dx*dx + dy*dy );
  var dr2 = dr * dr;
  var D = p1[0] * p2[1] - p2[0] * p1[1];

  var incidence = radius * radius * dr2 - D * D;

  if( incidence >= 0 ){
      var k = Math.sqrt( incidence );
      var xx = (dy < 0 ? -1 : 1) * dx * k;
      var yy = Math.abs(dy) * k;
    
      var x1 = (D * dy + xx) / dr2;
      var y1 = (-D * dx + yy) / dr2;
      var p1 = [x1 + center[0], y1 + center[1]];
      if( incidence == 0 ) //tangent
        return [p1];
      if( incidence > 0 ) { //secant
        var x2 = (D * dy - xx) / dr2;
        var y2 = (-D * dx - yy) / dr2;
        var p2 = [x2 + center[0], y2 + center[1]];
        return [p1, p2];
      }
  }
  return [];
}

function intersection_directed_ray_circle_2d( center, radius, ray_p, ray_v ) {
  var points = intersection_infinite_ray_circle_2d( center, radius, ray_p, ray_v );
  var points_out = [];
  for(var i in points){
    if( vector.dot( vector.sub( points[i], ray_p ), ray_v ) > 0 )
      points_out.push( points[i] );
  }
  return points_out;
}
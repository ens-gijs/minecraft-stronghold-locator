"use strict";
var ross = ross || {};
ross.drawing = ross.drawing || {};

(function(ns){

var PI = Math.PI;
var HALF_PI = PI/2;
var TWO_PI = (2*PI);
var rad2deg = 180/PI;
var deg2rad = PI/180;
var nearOneLo  =  0.999999999999;
var nearOneHi  =  1.000000000001;
var nearZeroLo = -0.000000000001;
var nearZeroHi =  0.000000000001;

function assert( truth, info ){
	if(!truth)
		console.trace("ASSERT FAILED ", info );
}

function isAbsNearOne( x ){
	if( x < 0 ) x *= -1;
	return x >= nearOneLo && x <= nearOneHi;
}

function isNearZero( x ){
	return x >= nearZeroLo && x <= nearZeroHi;
}
function aboutEqual( l, r ) {
	var x = r - l;
	return x >= nearZeroLo && x <= nearZeroHi;
}

function clearArray( array, length ){
	array.length = length;
	for( var i = 0; i < length; i ++ ) {
		array[i] = 0;
	}
	return array;
}

function rotate( angle, center ) {
	if(!center) center = {x:0,y:0};
	var x = this.x - center.x;
	var y = this.y - center.y;
	var cos = Math.cos(angle);
	var sin = Math.sin(angle)
	this.x = (x * cos - y * sin) + center.x;
	this.y = (x * sin + y * cos) + center.y;
	return this;
}
function rotateDeg( angle, center ) {
	return this.rotate( angle * deg2rad, center );
}

function translate( dx, dy ) {
	if( typeof(dx) === "object" ){
		this.x += dx.x;
		this.y += dx.y;
	} else {
		this.x += dx;
		this.y += dy;
	}
	return this;
}
function untranslate( dx, dy ) {
	if( typeof(dx) === "object" ){
		this.x -= dx.x;
		this.y -= dx.y;
	} else {
		this.x -= dx;
		this.y -= dy;
	}
	return this;
}

function Point( x, y ){
	if( typeof(x) === 'object' ){
		this.x = x.x;
		this.y = x.y;
	} else {
		this.x = x || 0;
		this.y = y || 0;
	}
}
Point.prototype = {
	translate: translate,
	untranslate: untranslate,
	add: function add(x,y){return this.copy().translate(x,y)},
	sub: function sub(x,y){return this.copy().untranslate(x,y)},
	flipX: function( mp, mp_y ){
		if( typeof(mp) != 'objet' ) mp = new Point(mp, mp_y);
		var p = this.copy();
		p.x = (mp.x - p.x) + mp.x;
		return p;
	},
	flipY: function( mp, mp_y ){
		if( typeof(mp) != 'objet' ) mp = new Point(mp, mp_y);
		var p = this.copy();
		p.y = (mp.y - p.y) + mp.y;
		return p;
	},
	rotate: rotate,
	rotateDeg: rotateDeg,
	distanceTo: function distanceTo( other ){
		var dx = this.x - other.x;
		var dy = this.y - other.y;
		var len = Math.sqrt( dx * dx + dy * dy );
		if( len <= nearZeroHi ) len = 0;
		return len;
	},
	/** can be used to sort the distances between a set of points */
	squareSumTo: function distanceTo( other ){
		var dx = this.x - other.x;
		var dy = this.y - other.y;
		return dx * dx + dy * dy;
	},
	copy: function copy(){
		return new Point(this);
	},
	vectorTo: function vectorTo( other ){
		return new Vector( other.x - this.x, other.y - this.y );
	},
	vectorFrom: function vectorFrom( other ){
		return new Vector( this.x - other.x, this.y - other.y );
	},
	dot: function dot( other ) {
		return this.x * other.x + this.y * other.y;
	},
	cross: function cross( other ) {
		return this.x * other.y - this.y * other.x;
	},
	sum: function sum( other ) {
		return (other.x - this.x) * (other.y + this.y);
	},
	equals: function equals( other ){
		return aboutEqual(this.x, other.x) && aboutEqual(this.y, other.y);
	},
	compareTo: function compareTo( other ){
		if( aboutEqual(this.x, other.x) ){
			return aboutEqual(this.y, other.y) ? 0 : this.y - other.y;
		}
		return this.x - other.x;
	},
	toString: function toString(){
		return '(' + this.x + ', ' + this.y + ')';
	},
	draw: function draw( canvas, style, scale ){
		scale = scale || 1;
		canvas.save();
		if( style ){
			canvas.strokeStyle = style;
			canvas.fillStyle = style;
		}
		
		canvas.translate( this.x, this.y );
		canvas.rotate( PI/4 );
		canvas.beginPath();
		canvas.moveTo( -3*scale, 0 );
		canvas.lineTo( 3*scale, 0 );
		canvas.moveTo( 0, -3*scale );
		canvas.lineTo( 0, 3*scale );
		canvas.closePath();
		canvas.stroke();
		canvas.beginPath();
		canvas.arc( 0, 0, 1*scale, -PI, PI );
		//canvas.fill();
		canvas.stroke();
		canvas.restore();
	}
};
/** computes the angle ABC */
Point.angleBetweenPoints = function angleBetweenPoints( a, b, c ) {
	var ab = a.vectorTo( b );
	var cb = c.vectorTo( b );
	var dot = ab.dot( cb );
	var cross = ab.cross( cb );
	return Math.atan2( cross, dot );
}




function Vector( x, y ){
	if( typeof(x) === 'object' ){
		if( y === undefined ) {
			this.x = x.x;
			this.y = x.y;
		} else {
			this.x = y.x - x.x;
			this.y = y.y - x.y;
		}
	} else {
		this.x = x || 0;
		this.y = y || 0;
	}
}
Vector.prototype = {
	translate: translate,
	untranslate: untranslate,
	add: function add(x,y){return this.copy().translate(x,y)},
	sub: function sub(x,y){return this.copy().untranslate(x,y)},
	flipX: function(){
		var v = this.copy();
		v.x *= -1;
		return v;
	},
	flipY: function(){
		var v = this.copy();
		v.y *= -1;
		return v;
	},
	scale: function scale( scaler ) {
		this.x *= scaler;
		this.y *= scaler;
		return this;
	},
	get length() {
		var len = Math.sqrt( this.x * this.x + this.y * this.y );
		if( len <= nearZeroHi ) len = 0;
		return len;
	},
	set length( newLen ) {
		this.scale( newLen/this.length );
		return newLen;
	},
	get normal() {
		var l = this.length;
		return new Vector( this.x/l, this.y/l );
	},
	get slope() {
		return this.y / this.x;
	},
	get isVertical(){
		return isNearZero(this.x);
	},
	dot: function dot( other ) {
		return this.x * other.x + this.y * other.y;
	},
	cross: function cross( other ) {
		return this.x * other.y - this.y * other.x
	},
	get angle(){
		return Math.atan2( this.y,this.x );
	},
	get angleDeg(){
		return Math.atan2( this.y,this.x ) * rad2deg; 
	},
	angleTo: function angleTo( other ) {
		return this.angle - other.angle;
	},
	rotate: function rotate( angle ) {
		var x = this.x;
		var y = this.y;
		var cos = Math.cos(angle);
		var sin = Math.sin(angle)
		this.x = (x * cos - y * sin);
		this.y = (x * sin + y * cos);
		return this;
	},
	rotateDeg: rotateDeg,
	/** is at right angle to*/
	isOrthogonalTo: function( other ){
		return this.dot(other) === 0;
	},
	isParallelTo: function( other ){
		if( this.x === 0 ) return other.x === 0;
		if( this.y === 0 ) return other.y === 0;
	
		return this.x/other.x == this.y/other.y;
	},
	copy: function copy(){
		return new Vector(this);
	},
	equals: function equals( other ){
		return aboutEqual(this.x, other.x) && aboutEqual(this.y, other.y);
	},
	compareTo: function compareTo( other ){
		if( aboutEqual(this.x, other.x) ){
			return aboutEqual(this.y, other.y) ? 0 : this.y - other.y;
		}
		return this.x - other.x;
	},
	toString: function toString(){
		return '{' + this.x + ', ' + this.y + '}';
	},
	drawAt: function drawAt( canvas, point, arrowSize, style ){
		if( typeof(arrowSize) == 'string' ){
			var t = arrowSize;
			arrowSize = style;
			style = t;
		}
		canvas.save();
		if( style ) canvas.strokeStyle = style;
		var arrow_w = arrowSize || 3;
		canvas.translate( point.x, point.y );
		canvas.rotate( this.angle );
		canvas.beginPath();
		canvas.moveTo( 0, 0 );
		canvas.translate( this.length, 0 );
		canvas.lineTo( 0, 0 );
		canvas.lineTo( -arrow_w, arrow_w );
		canvas.moveTo( 0, 0 );
		canvas.lineTo( -arrow_w, -arrow_w );
		canvas.closePath();
		canvas.stroke();
		canvas.restore();
	}
};



function Shape(){
}
Shape.prototype = {
	get isShape() {return true;},
	get typeofshape() {return "";},
	get center() {throw new Error( "center not implemented" );},
	get length(){throw new Error( "length not implemented" );},
	rotate: function( angle, center ){throw new Error( "rotate() not implemented" );},
	rotateDeg: function( angle, center ){return this.rotate( angle * deg2rad, center );},
	translate: function( x, y ){throw new Error( "translate() not implemented" );},
	flipX: function( mp, mp_y ){throw new Error( "flipX() not implemented" );},
	flipY: function( mp, mp_y ){throw new Error( "flipY() not implemented" );},
	offset: function( distance ){throw new Error( "offset() not implemented" );},
	intersection: function( other ){throw new Error( "intersection() not implemented" );},
	union: function( other ){throw new Error( "union() not implemented" );},
	drawPath: function( canvas ){throw new Error( "drawPath() not implemented" );},
	isPointOnShape: function isPointOnShape( point, y ) {throw new Error( "isPointOnShape() not implemented" );},
}

/**
 * Intersections of 1D shapes are points
 * There may be more than one intersection
 * Intersections may be contacting or non-contacting (where contacting means point exists on both shapes)
 * Parallel lines have no intersection - unless they are exactly aligned then the intersection(s) 
 *   are that of the overlapping, or nearest, line endpoints
 */
function shape1DIntersection( other ){
	//http://math.stackexchange.com/questions/256100/how-can-i-find-the-points-at-which-two-circles-intersect
	//http://math.stackexchange.com/questions/39561/finding-the-intersecting-points-on-two-circles
	//http://www.geometrictools.com/Documentation/IntersectionLine2Circle2.pdf
	if( !other.isShape ) throw new Error("cannot compute shape intersection with non-shape");
	var shapeEvalOrder = ["ray", "line", "arc"];
	var linetypes = ["line", "ray"];
	
	var thisOrd = shapeEvalOrder.indexOf( this.typeofshape );
	var otherOrd = shapeEvalOrder.indexOf( other.typeofshape );
	if( thisOrd < 0 || otherOrd < 0 ) {
		throw new Error( "I don't know how to compute the intersection of " 
		+ this.typeofshape + " and " + other.typeofshape );
	}
	
	var a, b;
	if( thisOrd <= otherOrd ) {
		a = this;
		b = other;
	} else {
		b = this;
		a = other;
	}
	
	var result = {both:[], one:[], none:[]};
	var candidates = [];
	
	if( a.typeofshape == 'line' && b.typeofshape == 'line' ) {
		if(  a.p1.equals( b.p1 ) && a.p2.equals( b.p2 ) || a.p1.equals( b.p2 ) && a.p2.equals( b.p1 ) ) {
			candidates.push( a.p1.copy() );
			candidates.push( a.p2.copy() );
		}
	}
	
	if( candidates.length == 0 ) {
		if( linetypes.indexOf( a.typeofshape ) >= 0 ) {
			if( linetypes.indexOf( b.typeofshape ) >= 0 ){
				var va = a.asVector;
				var vb = b.asVector;
				if( va.isParallelTo( vb ) ){
					if( va.x == 0 && a.p1.x == b.p1.x || //vertical
						va.y == 0 && a.p1.y == b.p1.y || //horizontal
						a.yintercept == b.yintercept
					){ //aligned
						if( b.isPointOnShape( a.p1 ) )
							candidates.push( a.p1.copy() );
							
						if( a.typeofshape == 'line' && b.isPointOnShape( a.p2 ) )
							candidates.push( a.p2.copy() );
							
						if( candidates.length < 2 && a.isPointOnShape( b.p1 ) )
							candidates.push( b.p1.copy() );
							
						if( candidates.length < 2 && b.typeofshape == 'line' && a.isPointOnShape( b.p2 ) )
							candidates.push( b.p2.copy() );
							
						//lines do not overlap, find nearest endpoints
						if( a.typeofshape == 'line' && b.typeofshape == 'line' && candidates.length == 0 ) {
							var options = [];
							options.push( {d: a.p1.squareSumTo(b.p1), p1: a.p1, p2: b.p1} );
							options.push( {d: a.p1.squareSumTo(b.p2), p1: a.p1, p2: b.p2} );
							options.push( {d: a.p2.squareSumTo(b.p1), p1: a.p2, p2: b.p1} );
							options.push( {d: a.p2.squareSumTo(b.p2), p1: a.p2, p2: b.p2} );
							
							options.sort( function( l, r ){
								return l.d - r.d;
							} );
							candidates.push( options[0].p1, options[0].p2 );
						}
					}
				} else { //non-parallel lines
					var x,y;
					if( va.isVertical ) {
						x = a.p1.x;
						y = b.slope * x + b.yintercept;
					} else if( vb.isVertical ){
						x = b.p1.x;
						y = a.slope * x + a.yintercept;
					} else {
						x = (a.yintercept - b.yintercept) / (b.slope - a.slope);
						y = a.slope * x + a.yintercept;
					}
					var p = new Point( x, y );
					candidates.push( p );
				}
			
			} else if ( b.typeofshape === "arc" ){ // line-arc
				var p1x = a.p1.x - b.center.x;
				var p1y = a.p1.y - b.center.y;
				var p2x, p2y;
				
				if( a.typeofshape == 'line' ) {
					p2x = a.p2.x - b.center.x;
					p2y = a.p2.y - b.center.y;
				} else if ( a.typeofshape == 'ray' ) {
					var v = a.asVector.copy();
					v.length = a.p1.distanceTo( b.center ) + 3 * b.radius;
					var virtualp2 = a.p1.copy().translate( v );
					p2x = virtualp2.x - b.center.x;
					p2y = virtualp2.y - b.center.y;
				}
				
				var dx = p2x - p1x;
				var dy = p2y - p1y;
				var dr = Math.sqrt( dx*dx + dy*dy );
				var dr2 = dr * dr;
				var D = p1x * p2y - p2x * p1y;
				
				var incidence = b.radius * b.radius * dr2 - D * D;
				
				if( incidence >= 0 ){
					var k = Math.sqrt( incidence );
					var xx = (dy < 0 ? -1 : 1) * dx * k;
					var x1 = (D * dy + xx) / dr2;
					var x2 = (D * dy - xx) / dr2;
					
					var yy = Math.abs(dy) * k;
					var y1 = (-D * dx + yy) / dr2;
					var y2 = (-D * dx - yy) / dr2;
					var p1 = new Point( x1 + b.center.x, y1 + b.center.y );
					var p2 = new Point( x2 + b.center.x, y2 + b.center.y );
					if( incidence == 0 ) //tangent
						candidates = [p1];
					if( incidence > 0 ) //secant
						candidates = [p1, p2];
				}
			} else {
				throw new Error( "Intersection between " + a.typeofshape + " and " + b.typeofshape + " is not yet supported" );
			}
		} else if( a.typeofshape === "arc" ) {
			if( b.typeofshape === "arc" ){
				var ra = a.radius;
				var rb = b.radius;
				var centerDist = a.center.distanceTo( b.center );
				var u = Math.abs(ra - rb);
				var w = ra + rb;
				//console.log( u + " < " + centerDist + " < " + w );
				
				if( aboutEqual( centerDist, w ) ) { // each circle is outside the other but touching at one point
					//console.log( "each circle is outside the other but touching at one point" );
					var v = a.center.vectorTo( b.center );
					v.length = a.radius;
					var p = a.center.copy().translate( v );
					candidates.push( p );
						
				} else if( aboutEqual( centerDist, u ) ) { // circle are nested but touching at one point
					//console.log( "circle are nested but touching at one point" );
					var v,p;
					if( ra > rb ) {
						v = a.center.vectorTo( b.center );
						v.length = ra;
						p = a.center.copy().translate( v );
					} else {
						v = b.center.vectorTo( a.center );
						v.length = rb;
						p = b.center.copy().translate( v );
					}
					candidates.push( p );
						
				} else if ( u < centerDist && centerDist < w ) { //2 contact points
					//console.log( "circle are touching 2 points" );
					// To simplify the math we will use circle A's center point as origin and 
					// rotate circle b center to be on the X-Axis.
					// Then we will rotate the result points and translate them back
					var cb = b.center.copy().translate( -a.center.x, -a.center.y );
					var rotation = new Vector( cb ).angle;
					cb.rotate( -rotation );
					
					var d = cb.x; //this is now simply the distance between the centers
					var d2 = d*d;
					var r2 = rb*rb;
					var R2 = ra*ra;
					var k = (d2 - r2 + R2);
					var y2 = (4*d2 * R2 - k*k) / (4*d2);
					var y = Math.sqrt( y2 );
					var x = Math.sqrt( R2 - y2 );
					
					var points = [new Point(x, y), new Point( x, -y)];
					if( points[0].equals( points[1] ) ) points.pop();
					
					while( points.length ){
						var p = points.pop();
						p.rotate( rotation );
						p.translate( a.center );
						candidates.push( p );
					}
				} else {
					//console.log( "circle are NOT touching" );
				}
			} else {
				throw new Error( "Intersection between " + a.typeofshape + " and " + b.typeofshape + " is not yet supported" );
			}
		} else {
			throw new Error( "Intersection between " + a.typeofshape + " and " + b.typeofshape + " is not yet supported" );
		}
	}
	
	//return only a single point if both points are the same
	if( candidates.length == 2 && candidates[0].equals( candidates[1] ) ) {
		candidates.pop();
	}
	
	var accepted = [];
	while( candidates.length ){
		var p = candidates.pop();
		var accept = p.x < 1000000 && p.y < 1000000 && p.x > -1000000 && p.y > -1000000;
		for( var i = 0; accept && i < accepted.length; i ++ ) {
			if( accepted[i].equals( p ) ){
				accept = false;
				break;
			}
		}
		
		if( accept ) {
			accepted.push( p );
			
			var ona = a.isPointOnShape( p );
			var onb = b.isPointOnShape( p );
			
			if( ona && onb )
				result.both.push( p );
			else if ( ona || onb )
				result.one.push( p );
			else
				result.none.push( p );
		}
	}
	return result;
}














function Ray( a, b, c, d ){
	this.p1 = null;
	var dir_ = 0;
	var dirVector_ = null;
	
    this.__defineGetter__("direction", function(){ return dir_; });
	/** bound to the range of -PI <= n <= PI */
	this.__defineSetter__("direction", function(d){
		d = d % TWO_PI;
		if( d > PI ) d -= TWO_PI;
		if( d < -PI ) d += TWO_PI;
		dir_ = d;
		dirVector_ = null;
		return dir_;
	});
	this.__defineGetter__("asVector", function(){
		if( dirVector_ == null ){
			dirVector_ = new Vector(1,0);
			dirVector_.rotate( dir_ );
		}
		return dirVector_;
	});
	
	if( a instanceof Ray ){
		this.p1 = a.p1.copy();
		this.direction = a.direction;
	} else if ( typeof(a) === 'object' ) {
		this.p1 = new Point(a);
		if ( b instanceof Vector ){
			this.direction = b.angle;
		} else if ( !isNaN(b) ){
			this.direction = b;
		} else if( typeof(b) === 'object' ){
			this.direction = this.p1.vectorTo( b ).angle;
		}
	} else if ( !isNaN(a) && !isNaN(b) && !isNaN(c) && !isNaN(d) ) {
		this.p1 = new Point( a, b );
		this.direction = this.p1.vectorTo( new Point( c, d ) ).angle;
	} else if ( !isNaN(a) && !isNaN(b) ) {
		this.p1 = new Point( a, b );
		this.direction = c || 0;
	} else if ( a != undefined || b != undefined || c != undefined || d != undefined ) {
		throw new Error("bad arguments passed to Ray constructor");
	}
}
Ray.prototype = {
	get isShape() {return true;},
	get typeofshape() {return "ray";},
	get center() {throw new Error( "center not supported" );},
	get length(){ return Infinity; },
	rotate: function( angle, center ){this.asVector.rotate(angle,center); this.direction = this.asVector.angle;},
	rotateDeg: function( angle, center ){return this.rotate( angle * deg2rad, center );},
	translate: function( x, y ){ this.p1.translate( x, y ); return this;},
	flipX: function( mp, mp_y ){throw new Error( "flipX() not implemented" );},
	flipY: function( mp, mp_y ){throw new Error( "flipY() not implemented" );},
	offset: function( distance ){throw new Error( "offset() not supported" );},
	intersection: shape1DIntersection,
	union: function( other ){throw new Error( "union() not implemented" );},
	drawPath: function( canvas, draw_length ){
		canvas.moveTo( this.p1.x, this.p1.y );
		//canvas.arc( this.p1.x, this.p1.y, 1, 0, TWO_PI );
		//canvas.moveTo( this.p1.x, this.p1.y );
		var v = this.asVector.copy();
		v.length = draw_length || 100000; //arbitrary number
		//console.log(v);
		canvas.lineTo( this.p1.x + v.x, this.p1.y + v.y );
	},
	draw: function( canvas, style, draw_length ){
		canvas.save();
		canvas.strokeStyle = style || 'salmon';
		canvas.beginPath();
		this.drawPath( canvas, draw_length );
		canvas.stroke();
		canvas.restore();
	},
	isPointOnShape: function isPointOnShape( point, y ) {
		if( typeof(point) !== 'object' ) {
			point = new Point( point, y );
		}
		if( aboutEqual(this.p1.x, point.x) && aboutEqual(this.p1.y, point.y) )
		{
			return true;
		}
		var vtest = this.p1.vectorTo( point );
		if( aboutEqual( Math.abs(this.direction), PI ) ) {
			return aboutEqual(Math.abs(vtest.angle), PI);
		} else {
			return aboutEqual(vtest.angle, this.direction);
		}
	},
	
	get angle(){ return this.direction; },
	get angleDeg(){ return this.direction * rad2deg; },
	get directionDeg(){ return this.direction * rad2deg; },
	set directionDeg(val){ return this.direction(val * deg2rad) * rad2deg;},
	copy: function copy(){ return new Ray( this ); },
	
	get yintercept() { return this.p1.y - this.slope * this.p1.x; },
	get slope() { return this.asVector.slope; },
	
	pointAtDistance: function( d ) {
		var v = this.asVector.copy();
		v.length = d;
		return new Point( this.p1.x + v.x, this.p1.y + v.y );
	},
}




function LineSegment( p1_x1, p2_y1, x2, y2 ){
	if( p1_x1 instanceof LineSegment ){
		this.p1 = new Point(p1_x1.p1);
		this.p2 = new Point(p1_x1.p2);
	} else if( typeof(p1_x1) == 'object' ){
		this.p1 = new Point(p1_x1);
		this.p2 = new Point(p2_y1);
	} else {
		this.p1 = new Point(p1_x1, p2_y1);
		this.p2 = new Point(x2, y2);
	}
}
LineSegment.prototype = {
	get isShape() {return true;},
	get typeofshape() {return "line";},
	copy: function copy(){
		return new LineSegment(this);
	},
	get midPoint(){
		var p = new Point();
		p.x = (this.p1.x + this.p2.x) / 2;
		p.y = (this.p1.y + this.p2.y) / 2;
		//p.x = (this.p1.x > this.p2.x ? this.p1.x - this.p2.x : this.p2.x - this.p1.x) / 2;
		//p.y = (this.p1.y > this.p2.y ? this.p1.y - this.p2.y : this.p2.y - this.p1.y) / 2;
		return p;
	},
	breakAt: function breakAt( points, y ){
		if( !(points instanceof Array) ){
			if( !(points instanceof Point) ) {
				points = [new Point( points, y )];
			} else {
				points = [points];
			}
		}
		
		var p1 = this.p1.copy();
		var p2 = this.p2.copy();
		var pointsOut = [ p1 ];
		for( var i = 0; i < points.length; i ++ ) {
			var p = points[i];
			if( !p.equals(p1) && !p.equals(p2) && this.isPointOnShape( p ) ){
				pointsOut.push( new Point( p ) );
			}
		}
		
		pointsOut.sort(function(l,r){
			return p1.squareSumTo(l) - p1.squareSumTo(r);
		});
		
		pointsOut.unshift( p1 );
		pointsOut.push( p2 );
		//console.log(pointsOut);
		var linesOut = [];
		for( var i = 1; i < pointsOut.length; i ++ ) {
			var newLine = new LineSegment( pointsOut[i-1], pointsOut[i] );
			if( newLine.length > 0 ) linesOut.push( newLine );
		}
		//console.log(linesOut);
		return linesOut;
	},
	get length(){
		return this.p1.distanceTo( this.p2 );
	},
	rotate: function( angle, center ){
		this.p1.rotate( angle, center );
		this.p2.rotate( angle, center );
		return this;
	},
	rotateDeg: function( angleDeg, center ){
		return this.rotate( angle * deg2rad, center );
	},
	translate: function translate( p_x, y ){
		this.p1.translate( p_x, y );
		this.p2.translate( p_x, y );
	},
	flipX: function( mp, mp_y ){
		if( typeof(mp) != 'objet' ) mp = new Point(mp, mp_y);
		return new LineSegment( this.p1.flipX(mp), this.p2.flipX(mp) );
	},
	flipY: function( mp, mp_y ){
		if( typeof(mp) != 'objet' ) mp = new Point(mp, mp_y);
		return new LineSegment( this.p1.flipY(mp), this.p2.flipY(mp) );
	},
	offset: function offset( distance ){
		var norm = this.normal;
		norm.length = distance;
		return new LineSegment( new Point(this.p1).translate(norm), new Point(this.p2).translate(norm) );
	},
	extrude: function extrude( distance ){
		var l1 = this.copy();
		var l3 = this.offset( distance ).reverse();
		var l2 = new LineSegment( l1.p2, l3.p1 );
		var l4 = new LineSegment( l3.p2, l1.p1 );
		return new Shape2D( [l1,l2,l3,l4] );
	},
	reverse: function reverse(){
		var temp = this.p1;
		this.p1 = this.p2;
		this.p2 = temp;
		return this;
	},
	intersection: shape1DIntersection,
	union: function( other ){
		throw new Error( "union() not implemented" );
	},
	drawPath: function drawPath( canvas ){
		canvas.lineTo(this.p1.x, this.p1.y);
		canvas.lineTo(this.p2.x, this.p2.y);
		return this;
	},
	draw: function draw( canvas, style ){
		canvas.save();
		if( style ) canvas.strokeStyle = style;
		canvas.beginPath();
		canvas.moveTo(this.p1.x, this.p1.y);
		this.drawPath( canvas );
		canvas.closePath();
		canvas.stroke();
		canvas.restore();
		return this;
	},
	get asVector(){
		return this.p1.vectorTo( this.p2 );
	},
    get normal(){
        return this.asVector.rotateDeg( 90 ).normal;
    },
	isPointOnShape: function isPointOnShape( point, y ){
		if( typeof(point) !== 'object' ) {
			point = new Point( point, y );
		}
		if( aboutEqual(this.p1.x, point.x) && 
			aboutEqual(this.p1.y, point.y) || 
			aboutEqual(this.p2.x, point.x) && 
			aboutEqual(this.p2.y, point.y) )
		{
			return true;
		}
		var vline = this.p1.vectorTo( this.p2 );
		var vtest = this.p1.vectorTo( point );
		var vlineA = vline.angle;
		var result;
		if( aboutEqual( Math.abs(vlineA), PI ) ) {
			result = aboutEqual(Math.abs(vtest.angle), PI);
		} else {
			result = aboutEqual(vtest.angle, vlineA);
		}
		
		return result && vtest.length <= vline.length + nearZeroHi;
	},
	/** will return +/- Infinity for vertical lines */
	get slope() {
		return (this.p2.y - this.p1.y) / (this.p2.x - this.p1.x);
	},
	/** will return +/- Infinity for vertical lines */
	get yintercept(){
		// y = mx + b
		// b = y - mx
		return this.p1.y - this.slope * this.p1.x;
	},
	equals: function equals(other){
		if( !(other instanceof LineSegment) ) return false;
		return this.p1.equals(other.p1) && this.p2.equals(other.p2) ||
			this.p2.equals(other.p1) && this.p1.equals(other.p2)
	}
};

/**
 *
 * NOTICE: here anticlockwise is WRT canvas cor'd system (0,0) TOP left to (w,h) bottom right
 * when working in Cartesian cor'd system where (0,0) BOT left this value is visually inverted
 *
 *
 */
function Arc(x, y, radius, startAngle, endAngle, anticlockwise){
	this.center = new Point(x,y);
	this.radius = radius;
	this.startAngle = startAngle;
	this.endAngle = endAngle;
	this.anticlockwise = !!anticlockwise;
}
Arc.prototype = {
	get isShape() {return true;},
	get typeofshape() {return "arc";},
	get midPoint(){
		var p = this.p1.copy();
		var a = this.arcAngle / 2;
		if( this.anticlockwise ) a *= -1;
		p.rotate( a, this.center );
		return p;
	},
	flipX: function( mp, mp_y ){
		if( typeof(mp) != 'objet' ) mp = new Point(mp, mp_y);
		return Arc.fromPointVectorPairs( this.p1.flipX(mp), this.v1.flipX(), this.p2.flipX(mp), this.v2.flipX() ).reverse();
	},
	flipY: function( mp, mp_y ){
		if( typeof(mp) != 'objet' ) mp = new Point(mp, mp_y);
		return Arc.fromPointVectorPairs( this.p1.flipY(mp), this.v1.flipY(), this.p2.flipY(mp), this.v2.flipY() ).reverse();
	},
	offset: function offset( distance ){
		var r = this.radius + distance;
		if( r < 0 ) r = 0;
		var a = new Arc(this.center.x, this.center.y, r, this.startAngle, this.endAngle, this.anticlockwise);
		return a;
	},
	extrude: function extrude( distance ){
		var a1 = this.copy();
		var a2 = a1.offset( distance ).reverse();
		var l1 = new LineSegment( a1.p2, a2.p1 );
		var l2 = new LineSegment( a2.p2, a1.p1 );
		return new Shape2D( [a1,l1,a2,l2] );
	},
	breakAt: function breakAt( points, y ){
		if( !(points instanceof Array) ){
			if( !(points instanceof Point) ) {
				points = [new Point( points, y )];
			} else {
				points = [points];
			}
		}
		
		var p1 = this.p1.copy();
		var p2 = this.p2.copy();
		
		var pointsOut = [];
		for( var i = 0; i < points.length; i ++ ) {
			var p = points[i];
			if( !p.equals(p1) && !p.equals(p2) && this.isPointOnShape( p ) ){
				pointsOut.push( new Point( p ) );
			}
		}
		var dbg = '';
		for( var i = 0; i < pointsOut.length; i ++ ) {
			if( dbg.length > 0 ) dbg += ', ';
			dbg += pointsOut[i].toString();
		}
		//console.log( "Initial  : " + dbg, this );
		
		var minA;
		if( this.anticlockwise ){
			minA = this.endAngle;
		} else {
			minA = this.startAngle;
		}
		var c = this.center;
		function arcAngleTo(p){
			if( p.__arcA === undefined ) {
				var a = c.vectorTo(p).angle;
				var arcA = (a - minA) % TWO_PI;
				if( arcA < 0 ) arcA += TWO_PI;
				p.__arcA = arcA
			}
			return p.__arcA;
		}
		
		pointsOut.sort(function(l,r){
			return arcAngleTo(l) - arcAngleTo(r);
		});
		
		pointsOut.unshift( p1 );
		pointsOut.push( p2 );
		/*if( pointsOut.length > 0 ){
			if( !pointsOut[0].equals( p1 ) )
				pointsOut.unshift( p1 );
			if( !pointsOut[pointsOut.length - 1].equals( p2 ) )
				pointsOut.push( p2 );
		} else {
			pointsOut = [p1, p2];
		}*/
		
		var dbg = '';
		for( var i = 0; i < pointsOut.length; i ++ ) {
			if( dbg.length > 0 ) dbg += ', ';
			dbg += pointsOut[i].toString();
		}
		//console.log( "P1: " + p1.toString() + " P2: " + p2.toString() );
		//console.log( "POST FINL: " + dbg );
		
		
		var arcsOut = [];
		for( var i = 1; i < pointsOut.length; i ++ ) {
			var s = c.vectorTo(pointsOut[i-1]).angle;
			var e = c.vectorTo(pointsOut[i]).angle;
			var newArc = new Arc( c.x, c.y, this.radius, s, e, this.anticlockwise );
			if( newArc.length > 0 ) arcsOut.push( newArc );
		}
		//console.log(this, arcsOut);
		return arcsOut;
	},
	/** computes the quadrant points which occur on this arc */
	get quadrants(){
		var quads = [];
		var p, r = this.radius;
		p = this.center.add( r, 0 );
		if( this.isPointOnShape( p ) ) quads.push( p );
		p = this.center.add( 0, r );
		if( this.isPointOnShape( p ) ) quads.push( p );
		p = this.center.add( -r, 0 );
		if( this.isPointOnShape( p ) ) quads.push( p );
		p = this.center.add( 0, -r );
		if( this.isPointOnShape( p ) ) quads.push( p );
		
		return quads;
	},
	translate: function translate( x, y ){
		this.center.translate( x, y );
	},
	rotate: function rotate( angle, center ) {
		if(!center) center = {x:0,y:0};
		this.center.rotate( angle, center );
		this.startAngle += angle;
		this.endAngle += angle;
		return this;
	},
	rotateDeg: function( angle, center ){
		return this.rotate( angle * deg2rad, center );
	},
	reverse: function reverse(){
		var temp = this.startAngle;
		this.startAngle = this.endAngle;
		this.endAngle = temp;
		this.anticlockwise = !this.anticlockwise;
		return this;
	},
	get inversionOf(){
		//TODO: find a better way to do this - this is just a quick and dirty solution
		var inv = Arc.fromPointVectorPairs(this.p2,this.v1,this.p1,this.v2);
		inv.anticlockwise = !this.anticlockwise;
		inv.reverse();
		return inv;
	},
	get p1(){
		var v = new Vector(this.radius ,0);
		v.rotate( this.startAngle );
		var p = this.center.copy().translate(v);
		if( isNearZero(p.x) ) p.x = 0;
		if( isNearZero(p.y) ) p.y = 0;
		return p;
	},
	get p2(){
		var v = new Vector(this.radius ,0);
		v.rotate( this.endAngle );
		var p = this.center.copy().translate(v);
		if( isNearZero(p.x) ) p.x = 0;
		if( isNearZero(p.y) ) p.y = 0;
		return p;
	},
	get v1(){
		return new Vector(this.radius ,0).rotate( this.startAngle + (this.anticlockwise ? -HALF_PI : HALF_PI) );
	},
	get v2(){
		return new Vector(this.radius ,0).rotate( this.endAngle + (this.anticlockwise ? -HALF_PI : HALF_PI) );
	},
	drawPath: function drawPath( canvas ){
		canvas.arc(this.center.x, this.center.y, this.radius, this.startAngle, this.endAngle, this.anticlockwise);
		return this;
	},
	draw: function draw( canvas, style ){
		canvas.save();
		if( style ) canvas.strokeStyle = style;
		canvas.beginPath();
		this.drawPath(canvas);
		canvas.stroke();
		canvas.restore();
		return this;
	},
	intersection: shape1DIntersection,
	/** the absolute value of the angle of this arc - from 0 to 2PI */
	get arcAngle(){
		var min, max;
		if( this.anticlockwise ){
			min = this.endAngle;
			max = this.startAngle;
		} else {
			max = this.endAngle;
			min = this.startAngle;
		}
		var arcA = (max - min);
		if( arcA <= -TWO_PI || arcA >= TWO_PI ) arcA = TWO_PI;
		else arcA %= TWO_PI;
		
		if( arcA < nearZeroLo ) arcA += TWO_PI;
		else if( isNearZero( arcA ) ) {
			if( aboutEqual( min, max ) ) arcA = 0;
			else arcA = TWO_PI;
		}
		return arcA;
	},
	get length(){
		var len = this.arcAngle * this.radius;
		if( len <= nearZeroHi ) len = 0;
		return len;
	},
	get area(){
		// arcA <= 180
		// r >= 0
		var r = this.radius;
		var arcA = this.arcAngle;
		var area = r * r / 2 *  (arcA - Math.sin( arcA ));
		return isNearZero( area ) ? 0 : area;
	},
	isPointOnShape: function isPointOnShape( point, y  ) {
		if( typeof(point) !== 'object' ) {
			point = new Point( point, y );
		}
		var vcp = this.center.vectorTo( point );
		if( !isNearZero(vcp.length - this.radius) ) return false;
		
		var min, max;
		if( this.anticlockwise ){
			min = this.endAngle;
			max = this.startAngle;
		} else {
			max = this.endAngle;
			min = this.startAngle;
		}
		var limit = (max - min) % TWO_PI;
		var test = (vcp.angle - min) % TWO_PI;
		
		if( limit <= 0 ) limit += TWO_PI;
		if( test < 0 ) test += TWO_PI;
		limit += nearZeroHi;
		
		return test <= limit;
	},
	copy: function copy(){
		return new Arc( this.center.x, this.center.y, this.radius, this.startAngle, this.endAngle, this.anticlockwise );
	},
	equals: function equals(other){
		if( !(other instanceof Arc) ) return false;
		if( !aboutEqual(this.radius, other.radius) ) return false;
		if( !this.center.equals( other.center ) ) return false;
		var tp1 = this.p1;
		var tp2 = this.p2;
		var op1 = other.p1;
		var op2 = other.p2;
		if( tp1.equals(op1) && tp2.equals(op2) ){
			return this.anticlockwise == other.anticlockwise;
		}
		if( tp2.equals(op1) && tp1.equals(op2) ) {
			return this.anticlockwise != other.anticlockwise;
		}
		return false;
	}
};
Arc.fromPointVectorPairs = function( p1, v1, p2, v2 ){
	if( v1.isParallelTo(v2) ) {
		//throw new Error("Parallel vectors may not be used to create an arc (at this time)");
		return null;
	}
	//var test = v1.normal.add(v2.normal).length;
	//if( test < 0.00001 || test > 1.99999 ) {
	//	console.log( v1, v2, v1.isParallelTo(v2) );
	//	throw new Error("Vectors are too aligned to be used to create an arc");
	//}
	var v1p = v1.normal.rotateDeg(90);
	var v2p = v2.normal.rotateDeg(90);
	var x,y;
	
	if( v1p.isVertical ) {
		var s2 = v2p.slope;
		var b2 = p2.y - s2 * p2.x;
		x = p1.x;
		y = s2 * x + b2;
	} else if( v2p.isVertical ){
		var s1 = v1p.slope;
		var b1 = p1.y - s1 * p1.x;
		x = p2.x;
		y = s1 * x + b1;
	} else {
		var s1 = v1p.slope;
		var s2 = v2p.slope;
		
		// y = mx + b
		// b = y - mx
		var b1 = p1.y - s1 * p1.x;
		var b2 = p2.y - s2 * p2.x;
		// m2*x + b2 = m1*x + b1
		// m2*x + b2 - m1*x = + b1
		// m2*x - m1*x = b1 - b2
		
		//center x,y
		x = (b1 - b2) / (s2 - s1);
		y = s2 * x + b2;
	}
	var r = new LineSegment(x, y, p1.x, p1.y).length;
	var startAngle = Math.atan2(p2.y-y,p2.x-x);
	var endAngle   = Math.atan2(p1.y-y,p1.x-x);
	var a = new Arc(x, y, r, startAngle, endAngle, endAngle < startAngle);
	return a;
}

function cross3(o, a, b) {
	return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}
/**
 * The convex hull is much like putting a rubber band around the shape
 *
 *
 *
 * @returns Array of points in CW order in canvas coordinators (CCW in Cartesian)
 */
function Shape2D_computeConvexHull() {
	
	var points = this.asPolygon.slice(0); //copy points
	points.sort(function(a,b){return a.compareTo(b)});
 
	var lower = [];
	for (var i = 0; i < points.length; i++) {
		while (lower.length >= 2 && cross3(lower[lower.length - 2], lower[lower.length - 1], points[i]) <= 0) {
			lower.pop();
		}
		lower.push(points[i]);
	}

	var upper = [];
	for (var i = points.length - 1; i >= 0; i--) {
		while (upper.length >= 2 && cross3(upper[upper.length - 2], upper[upper.length - 1], points[i]) <= 0) {
			upper.pop();
		}
		upper.push(points[i]);
	}

	upper.pop();
	lower.pop();
	return lower.concat(upper);
}

// polygons are composed of only strait lines and are closed shapes
// shape segments must be ordered
//
// this polygon will completely enclose the Shape (taking care of convex and concave arcs)
function Shape2D_computeAsPolygon(){
	var points = [];
	var cw = !this.isAnticlockwise;
	for( var ss = this.segments, sl = this.segments.length, i = 0; i < sl; i ++ ){
		var s = ss[i];
		if( s.typeofshape == 'line' ) {
			points.push( s.p1 );
		} else if( s.typeofshape == 'arc' ) {
			//break arcs on quadrants to provide accurate bounding box dimensions 
			var qauds = s.quadrants;
			var arcs = qauds.length > 0 ? s.breakAt( qauds ) : [s];
			for( var j = 0; j < arcs.length; j ++ ) {
				var arc = arcs[j];
				var convex;
				if( cross3( arc.p1, arc.midPoint, arc.p2 ) > 0 ){
					convex = cw;
				} else {
					convex = !cw;
				}
				//console.log( "CONVEX", convex );
				points.push( arc.p1 );
				if(!convex) {
					points.push( arc.midPoint );
				} else {
					var ray1 = new Ray( arc.p1, arc.v1 );
					var ray2 = new Ray( arc.p2, arc.v2.scale(-1) );
					var p = ray1.intersection( ray2 ).both[0];
					
					points.push( p );
				}
			}
		} else {
			throw new Error('Unsported shape type');
		}
	}
	return points;
}

/**
 * the absolute value of the signed area is the area
 * the sign of the area indicates the winding direction of the shape
 *  negative indicates CCW (in Cartesian cords / CW in canvas cords)
 *  positive indicates CW (in Cartesian cords / CCW in canvas cords)
 */
function Sape2D_computeSignedArea(){
	var p1,p2,area = 0,segmentArea;
	for( var s, ss = this.segments, sl = ss.length, i = 0; i < sl; i ++ ){
		s = ss[i];
		
		if( s.typeofshape == 'arc' ){
			var qauds = s.quadrants;
			var arcs = qauds.length > 0 ? s.breakAt( qauds ) : [s];
			for( var j = 0; j < arcs.length; j ++ ) {
				var arc = arcs[j];
				
				// compute area under chord
				p1 = arc.p1;
				p2 = arc.p2;
				segmentArea = (p2.x - p1.x) * (p2.y + p1.y);
				segmentArea /= 2;
				if( isNearZero( segmentArea ) ) segmentArea = 0;
				
				// determine if we need to add or subtract arc area
				var arcArea = arc.area;
				var midY = (p1.y + p2.y) / 2;
				if( midY < arc.center.y ) arcArea *= -1; //midY will never be eq to center.y because we are dealing with at most 1/4 of a circle
				if( p1.x > p2.x ) arcArea *= -1;
				segmentArea += arcArea;
				
				area += segmentArea;
			}
		} else {
			p1 = s.p1;
			p2 = s.p2;
			segmentArea = (p2.x - p1.x) * (p2.y + p1.y);
			segmentArea /= 2;
				if( isNearZero( segmentArea ) ) segmentArea = 0;
			area += segmentArea;
		}
	}
	return area;
}

/**
 *
 * Following any change to the segment list, or its members, invalidate should be called
 *
 */
function Shape2D( segments, cutouts ){
	if( segments instanceof Shape2D ){
		var other = segments;
		this.segments = [];
		this.cutouts = [];
		
		for( var i = 0; i < other.segments.length; i ++ ) {
			this.segments.push( other.segments[i].copy() );
		}
		for( var i = 0; i < other.cutouts.length; i ++ ) {
			this.cutouts.push( other.cutouts[i].copy() );
		}
	} else {
		this.segments = segments;
		if( !cutouts ) this.cutouts = [];
		else if( cutouts instanceof Array ) this.cutouts = cutouts;
		else if( cutouts instanceof Shape2D ) this.cutouts = [cutouts];
		else throw new Error("Invalid value for argument: cutouts");
	}
	
	var signedArea_ = null;
	var area_ = null;
	var center_ = null;
	var boundingBox_ = null;
	var length_ = null;
	var convexhull_ = null;
	var asPolygon_ = null;
	

	
	this.invalidate = function invalidate(){
		signedArea_ = null;
		area_ = null;
		center_ = null;
		boundingBox_ = null;
		length_ = null;
		convexhull_ = null;
		asPolygon_ = null;
	};
	
	
	
    this.__defineGetter__("length", function(){
		if ( !length_ ) {
			length_ = 0;
			for( var ss = this.segments, sl = ss.length, i = 0; i < sl; i ++ ){
				length_ += ss[i].length;
			};
		}
		
		return length_;
	});
	
	function computeBbAndCenter(){
		var hull = this.convexHull;
		var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
		var sumx = 0, sumy = 0;
		for( var pl = hull.length, i = 0; i < pl; i ++ ) {
			var p = hull[i];
			var x = p.x;
			var y = p.y;
			sumx += x;
			sumy += y;
			if( x < minX ) minX = x;
			if( y < minY ) minY = y;
			if( x > maxX ) maxX = x;
			if( y > maxY ) maxY = y;
		}
		boundingBox_ = new BoundingBox( minX, minY, maxX, maxY );
		center_ = new Point( sumx / pl, sumy / pl );
	}
	
    this.__defineGetter__("boundingBox", function(){
		if( boundingBox_ === null ){
			computeBbAndCenter.call( this );
		}
		
		return boundingBox_;
	});
	
    this.__defineGetter__("center", function(){
		if( center_ === null ){
			computeBbAndCenter.call( this );
		}
		
		return center_;
	});
	
    this.__defineGetter__("convexHull", function(){
		if( convexhull_ === null ) {
			convexhull_ = Shape2D_computeConvexHull.call(this);
		}
		return convexhull_;
	});
	
    this.__defineGetter__("asPolygon", function(){
		if( asPolygon_ === null ) {
			asPolygon_ = Shape2D_computeAsPolygon.call(this);
		}
		return asPolygon_;
	});
	
	
    this.__defineGetter__("area", function(){
		if( signedArea_ === null || area_ === null ) {
			signedArea_ = Sape2D_computeSignedArea.call(this);
			area_ = Math.abs( signedArea_ );
		}
		return area_;
	});
	/** returned value is WRT canvas coordinate system (invert for Cartesian) */
    this.__defineGetter__("isAnticlockwise", function(){
		if( signedArea_ === null ) {
			signedArea_ = Sape2D_computeSignedArea.call(this);
		}
		return signedArea_ > 0;
	});
}
Shape2D.prototype = {
	copy: function copy(){
		return new Shape2D(this);
	},
	get isShape() {return true;},
	get typeofshape() {return "2d";},
	rotate: function( angle, center ){
		this.invalidate();
		for( var ss = this.segments, sl = ss.length, i = 0; i < sl; i ++ ){
			ss[i].rotate( angle, center );
		};
		return this;
	},
	rotateDeg: function( angle, center ){
		return this.rotate( angle * deg2rad, center );
	},
	translate: function( x, y ){
		//console.log("translate Shape2D", this, x, y);
		this.invalidate();
		for( var ss = this.segments, sl = ss.length, i = 0; i < sl; i ++ ){
			var s = ss[i];
			var p1a = s.p1.copy();
			var p2a = s.p2.copy();
			//console.log(i, ss[i])
			ss[i].translate( x, y );
			//console.log( "  p1: (" + p1a.x + ', ' + p1a.y + ') -> (' + s.p1.x + ', ' + s.p1.y + ')' );
			//console.log( "  p2: (" + p2a.x + ', ' + p2a.y + ') -> (' + s.p2.x + ', ' + s.p2.y + ')' );
		};
		return this;
	},
	flipX: function( mp, mp_y ){
		var flippedSegs = [],
			flippedCutouts = [];
		if( typeof(mp) != 'objet' ) mp = new Point(mp, mp_y);
		for( var ss = this.segments, sl = ss.length, i = 0; i < sl; i ++ ){
			flippedSegs.push( ss[i].flipX( mp ) );
		}
		for( var cos = this.cutouts, cl = cos.length, i = 0; i < cl; i ++ ){
			flippedCutouts.push( cos[i].flipX( mp ) );
		}
		return new Shape2D( flippedSegs, flippedCutouts );
	},
	flipY: function( mp, mp_y ){
		var flippedSegs = [],
			flippedCutouts = [];
		if( typeof(mp) != 'objet' ) mp = new Point(mp, mp_y);
		for( var ss = this.segments, sl = ss.length, i = 0; i < sl; i ++ ){
			flippedSegs.push( ss[i].flipY( mp ) );
		}
		for( var cos = this.cutouts, cl = cos.length, i = 0; i < cl; i ++ ){
			flippedCutouts.push( cos[i].flipY( mp ) );
		}
		return new Shape2D( flippedSegs, flippedCutouts );
	},
	offset: function( distance ){throw new Error( "offset() not implemented" );},
	intersectionPoints: function( other ){
		var result = {both:[], one:[], none:[]};
		var accepted = [];
		var allBoth = [];
		var allOne = [];
		var allNone = [];
		
		function concat( to, from ){
			for( var i = 0; i < from.length; i ++ ) {
				to.push(from[i]);
			}
		}
		
		function accept( points, out ){
			for( var j = 0; j < points.length; j ++ ) {
				var p = points[j];
				var accept = true;
				for( var i = 0; i < accepted.length; i ++ ) {
					if( accepted[i].equals( p ) ){
						accept = false;
						break;
					}
				}
				
				if( accept ) {
					accepted.push(p);
					out.push(p);
				}
			}
		}
		
		if( other.isShape ) {
			if( other.typeofshape == "2d" ){
				for( var sA = this.segments, slA = sA.length, i = 0; i < slA; i ++ ){
					var s = sA[i];
					for( var sB = other.segments, slB = sB.length, j = 0; j < slB; j ++ ){
						var r = s.intersection( sB[j] );
						concat(allBoth,r.both);
						concat(allOne, r.one);
						concat(allNone,r.none);
					}
				}
			} else {
				for( var sA = this.segments, slA = sA.length, i = 0; i < slA; i ++ ){
					var s = sA[i];
					var r = s.intersection( other );
					concat(allBoth,r.both);
					concat(allOne, r.one);
					concat(allNone,r.none);
				}
			}
		}
		accept(allBoth, result.both);
		accept(allOne, result.one);
		accept(allNone, result.none);
		
		//result.both  = allBoth;
		//result.one   = allOne;
		//result.none  = allNone;
		
		return result;	
	},
	intersection: function( other ){
		
	},
	union: function( other ){
		var DEBUG_UNION = this.debug_union;
		
		if( other.typeofshape != "2d" ) throw new Error("can only union 2D parts (cannot union 2D with 1D)");
		
		var crossings = this.intersectionPoints( other ).both;
		if( crossings.length == 0 ) return null;
		var newSegments = [];
		var clippedSegments = [];
		
		function shatterForUnion( left, right ) {
			for( var ss = left.segments, sl = ss.length, i = 0; i < sl; i ++ ){
				var s = ss[i];
				var segs = s.breakAt( crossings ); //breakAt returns new segments
				var segSumLengths = 0;
				for( var j = 0; j < segs.length; j ++ ){
					var seg = segs[j];
					segSumLengths += seg.length
					var mid = seg.midPoint;
					if( !right.isPointInsideShape( mid ) ){
						newSegments.push( seg );
					} else {
						clippedSegments.push( seg );
					}
				}
				assert( aboutEqual( segSumLengths, s.length ), ["broken segment lengths > initial segment length", crossings, s.copy(), segs] );
			}
		}
		shatterForUnion( this, other );
		shatterForUnion( other, this );
		if( DEBUG_UNION ) {
			console.log( "shattered newSegments", newSegments.slice(0) );
			console.log( "shattered clippedSegments", clippedSegments.slice(0) );
		}
		
		if( DEBUG_UNION ) {
			canvas.save()
			canvas.strokeStyle = 'rgba(255,0,0,.5)';
			canvas.lineWidth = 7;
			for( var i = 0; i < clippedSegments.length; i ++ ){
				canvas.beginPath();
				clippedSegments[i].drawPath(canvas);
				canvas.stroke();
				canvas.beginPath();
				var p = clippedSegments[i].p1;
				canvas.arc(p.x,p.y,2,-PI, PI);
				canvas.stroke();
			}
			
			
			canvas.strokeStyle = 'rgba(255,0,255,1)';
			canvas.lineWidth = 3;
			for( var i = 0; i < newSegments.length; i ++ ){
				canvas.beginPath();
				newSegments[i].drawPath(canvas);
				canvas.stroke();
				canvas.beginPath();
				var p = newSegments[i].p1;
				canvas.arc(p.x,p.y,2,-PI, PI);
				canvas.stroke();
			}
			
			canvas.restore();
		}
		
		//
		// May be generally useful to build a shape from unordered segments beginning here
		//
		
		// identify identical line segments and remove them BOTH
		// this deletes lines which were the butting points between two shapes
		// this is actually too greedy but by keeping track of the segments
		// removed (dups) we can pull from them to close the shape later
		var newSegmentFlags = [];
		newSegmentFlags.length = newSegments.length;
		var newSegmentsB = [];// will contain only non-repeated segments
		var dups = []; //will contain unique, repeated, segments
		//var dups2 = []; // catches all previously tagged-as-dups (for core debugging)
		for( var ss = newSegments, sl = ss.length, i = 0; i < sl; i ++ ){
			if( !newSegmentFlags[i] ) {
				var l = ss[i];
				var dupFound = false;
				for(  j = i + 1; j < sl; j ++ ){
					var r = ss[j];
					if( l.equals(r) ) {
						dupFound = true;
						newSegmentFlags[j] = 1;
					}
				}
				if( dupFound ){
					newSegmentFlags[i] = 1;
					dups.push(l);
				} else {
					newSegmentsB.push(l);
				}
			}
			//else dups2.push(ss[i]);
			
		}
		newSegments = newSegmentsB;
		if( DEBUG_UNION ) {
			console.log( "de-duped newSegments", newSegments.slice(0) );
			console.log( "dup segments", dups.slice(0) );
		}
		
		//
		//order segments to create a path
		//
		function extractChain( primary, primaryFlags, secondary, secondaryFlags, chainNum ) {
			if( DEBUG_UNION ) console.log( '[' + chainNum + ']\r\nPF: ' + primaryFlags.join(', ') + '\r\nSF: ' + secondaryFlags.join(', ') );
			chainNum = chainNum || 1;
			var closed = false;
			var chain = [];
			var goal;
			var seeking;
			
			for( var len = primary.length, i = 0; i < len; i ++ ) {
				if( !primaryFlags[i] ) {
					var s = primary[i];
					primaryFlags[i] = chainNum;
					chain.push( s );
					goal = s.p1;
					seeking = s.p2;
					break;
				}
			}
			if(!seeking) {
				if( DEBUG_UNION ) console.log( 'QED' );
				return null;
			}
			if( DEBUG_UNION ) console.log( 'GOAL: ' + goal.toString() );
			if( DEBUG_UNION ) console.log( '  ' + goal.toString() + ' -> ' + seeking.toString() + ' ' + chain[0].typeofshape );
			
			function advance( segments, flags, flipped ){
				if( segments.length == 0 ) return false;
				var makingProgress = false;
				//console.log( '!advance! ' + flags.join(', ') );
				for( var sl = segments.length, i = 0; i < sl; i ++ ) {
					if( !flags[i] ) {
						var s = segments[i];
						var take = false;
						if( seeking.equals( s.p1 ) ){
							take = true;
						} else if ( seeking.equals( s.p2 ) ){
							s.reverse();
							take = true;
						}
						if( take ) {
							if( DEBUG_UNION ) console.log( '  ' + s.p1.toString() + ' -> ' + s.p2.toString() + ' ' + s.typeofshape  );
							seeking = s.p2;
							if( !flipped ) chain.push( s );
							else {
								s.reverse();
								chain.unshift( s );
							}
							flags[i] = chainNum;
							makingProgress = true;
							
							if( seeking.equals( goal ) ) {
								closed = true;
								break;
							}
						}
					}
				}
				
				// be greedy, try from the other end
				/*if( !makingProgress && !flipped ) {
					var temp = goal;
					goal = seeking;
					seeking = temp;
					if( DEBUG_UNION ) console.log( 'FLIPPING - NEW GOAL: ' + goal.toString() + ' SEEKING: ' + seeking.toString() );
					return advance( segments, flags, true );
				}*/
				return makingProgress;
			}
			
			while( !closed && (
				advance( primary, primaryFlags ) ||
				advance( secondary, secondaryFlags ) ||
				advance( primary, primaryFlags, true ) ||
				advance( secondary, secondaryFlags, true )
				) ){}

			
			if( DEBUG_UNION ) console.log( 
				'[' + chainNum + '] ' + (closed ? 'CLOSED' : 'OPEN') + 
				'\r\nPF: ' + primaryFlags.join(', ') + 
				'\r\nSF: ' + secondaryFlags.join(', ') 
			);
			if( chain.length > 0 )
				return {chain:chain,closed:closed,chainNum:chainNum};
			else
				return null;
		}
		
		
		if( DEBUG_UNION ) {
			console.log( '[SEGMENTS-UNIQ]' );
			for( var i = 0; i < newSegments.length; i ++ ) {
				var s = newSegments[i];
				console.log( '  ' + i + '. ' + s.typeofshape + ' ' + s.p1.toString() + ' -> ' + s.p2.toString() );
			}
			
			console.log( '[SEGMENTS-DUPS]' );
			for( var i = 0; i < dups.length; i ++ ) {
				var s = dups[i];
				console.log( '  ' + i + '. ' + s.typeofshape + ' ' + s.p1.toString() + ' -> ' + s.p2.toString() );
			}
		}
			
		
		//Flags indicate that a segment has been used, and by which chainNum
		var newSegmentFlags = clearArray([], newSegments.length);
		var dupsFlags = clearArray([], dups.length);
		var openChains = [];
		var closedChains = [];
		var i = 0;
		var chain;
		do{
			chain = extractChain( newSegments, newSegmentFlags, dups, dupsFlags, ++i );
			if( chain ) {
				if( chain.closed ) closedChains.push( chain );
				else openChains.push( chain );
			}
		}while(chain);
		
		//find chains hiding in the dups list
		do{
			chain = extractChain( dups, dupsFlags, [], [], ++i );
			if( chain ) {
				if( chain.closed ) closedChains.push( chain );
				else openChains.push( chain );
			}
		}while(chain);
		
		
		//TODO: optimize chains of closed shapes
		
		// find cutouts
		var isCutoutFlags = clearArray([], closedChains.length);
		for( var i = 0; i < closedChains.length; i ++ ) {
			var ichain = closedChains[i];
			var ipoint = ichain.chain[0].p1;
			var ishape = ichain.shape = ichain.shape || new Shape2D(ichain.chain);
			ichain.shape = ishape;
			for( var j = i+1; j < closedChains.length; j ++ ) {
				var jchain = closedChains[j];
				var jpoint = jchain.chain[0].p1;
				var jshape = jchain.shape = jchain.shape || new Shape2D(jchain.chain);
				
				if( ishape.isPointInsideShape( jpoint ) ) {
					ishape.cutouts.push( jshape );
					isCutoutFlags[j] = 1;
				} else if( jshape.isPointInsideShape( ipoint ) ) {
					jshape.cutouts.push( ishape );
					isCutoutFlags[i] = 1;
				} else {
					console.log( "UNION: how did we get multiple CLOSED shapes which do not contain one another?", ishape, jshape );
				}
			}
		}
		
		//console.log(closedChains, isCutoutFlags);
		var finalUnionResults = [];
		for( var i = 0; i < closedChains.length; i ++ ) {
			if( !isCutoutFlags[i] ) finalUnionResults.push( closedChains[i].shape );
		}
		
		if( finalUnionResults.length > 1 ) console.log("Somehow we have more than one closed shape as the product of UNION", finalUnionResults );
		
		//TODO: deal with unions of shapes which already have cutouts:
		// subtract cutout areas from top-level union shape (to affect any border geometry and populate cutouts list)
		
		//return [newSegments, clippedSegments, dups]; //, dups2];	
		if( DEBUG_UNION ) {
			console.log( {closedChains:closedChains, openChains:openChains, newSegments:newSegments, newSegmentFlags:newSegmentFlags, dups:dups, dupsFlags:dupsFlags, clippedSegments:clippedSegments } );
				
			/*canvas.save()
			canvas.strokeStyle = 'rgba(255,0,0,1)';
			canvas.lineWidth = 1;
			for( var i = 0; i < clippedSegments.length; i ++ ){
				canvas.beginPath();
				clippedSegments[i].drawPath(canvas);
				canvas.stroke();
				canvas.beginPath();
				var p = clippedSegments[i].p1;
				canvas.arc(p.x,p.y,2,-PI, PI);
				canvas.stroke();
			}
			canvas.restore();*/
		}
		
		return finalUnionResults[0];
	},
	drawPath: function( canvas ){
		var start = this.segments[0].p1;
		canvas.moveTo( start.x, start.y );
		for( var ss = this.segments, sl = ss.length, i = 0; i < sl; i ++ ){
			var s = ss[i];
			s.drawPath(canvas);
		}
	},
	draw: function draw( canvas ){
		canvas.beginPath();
		this.drawPath( canvas );
		canvas.closePath();
		canvas.stroke();
		return this;
	},
	drawHull: function drawHull( canvas ) {
		canvas.beginPath()
		var hull = this.convexHull;
		canvas.moveTo( hull[0].x, hull[0].y );
		for( var i = 1; i < hull.length; i ++ ){
			canvas.lineTo(hull[i].x, hull[i].y );
		}
		canvas.closePath();
		canvas.stroke();
	},
	drawAsPolygon: function drawAsPolygon( canvas ) {
		canvas.beginPath()
		var poly = this.asPolygon;
		canvas.moveTo( poly[0].x, poly[0].y );
		for( var i = 1; i < poly.length; i ++ ){
			canvas.lineTo(poly[i].x, poly[i].y );
		}
		canvas.closePath();
		canvas.stroke();
	},
	isPointOnShape: function isPointOnShape( point, y  ) {
		var count = 0;
		for( var ss = this.segments, sl = ss.length, i = 0; i < sl; i ++ ){
			if( ss[i].isPointOnShape( point, y ) )
				return true;
		};
		return false;
	},
	isPointInsideShape: function isPointInsideShape( point, y  ) {
		if( typeof(point) !== 'object' ) {
			point = new Point( point, y );
		}
		var ray = new Ray( point, this.center );
		ray.rotate(PI);
		var contacts = this.intersectionPoints( ray );
		//remove contact points which match the given point
		//- if a point is ON the shape it is not IN the shape
		var count = 0;
		var both = contacts.both;
		for( var i = 0; i < both.length; i ++ ){
			if( !point.equals( both[i] ) ) count++;
		}
		var result = count % 2 == 1;
		if( this.debug_isPointInsideShape ) {
			console.log( "isPointInsideShape", result, point, contacts, ray );
			//DEBUG drawing
			ray.draw(canvas, (result ? 'lime' : 'lightblue'));
			cp.drawIntersecionMarkers( contacts, true, false, false );
		}
		return result;
	},
	toString: function toString(){
		var str = 'SEGMENTS\n';
		for( var i = 0; i < this.segments.length; i ++ ) {
			var s = this.segments[i];
			str += '  ' + s.typeofshape + ' ' + s.p1.toString() + ' -> ' + s.p2.toString() + '\n';
		}
		for( var j = 0; j < this.cutouts.length; j ++ ) {
			str += 'CUTOUT[' + j + ']\n';
			var cutout = this.cutouts[j];
			for( var i = 0; i < cutout.length; i ++ ) {
				var s = cutout[i];
				str += '  ' + s.typeofshape + ' ' + s.p1.toString() + ' -> ' + s.p2.toString() + '\n';
			}
		}
		return str;
	},
}

function BoundingBox(a,b,c,d){
	this.p1 = null;
	this.p2 = null;
	
	if ( typeof(a) === 'object' ) {
		this.p1 = new Point(a);
		this.p2 = new Point(b);
	} else if ( !isNaN(a) && !isNaN(b) && !isNaN(c) && !isNaN(d) ) {
		this.p1 = new Point( a, b );
		this.p2 = new Point( c, d );
	} else if ( a != undefined || b != undefined || c != undefined || d != undefined ) {
		throw new Error("bad arguments passed to BoundingBox constructor");
	}
	//if( this.p1.x >= this.p2.x || this.p1.y >= this.p2.y )
	//	throw new Error("Invalid bounding box");
}
BoundingBox.prototype = {
	isPointInsideShape: function isPointInsideShape( x, y ){
		if ( typeof(point) == 'object' ){
			x = point.x;
			y = point.y;
		}
		
		return this.p1.x <= x && this.p2.x >= x && this.p1.y <= y && this.p2.y >= y;
	},
	get area(){
		return (this.p2.x - this.p1.x) * (this.p2.y - this.p1.y);
	},
	get w(){ return this.p2.x - this.p1.x; },
	get h(){ return this.p2.y - this.p1.y; },
	draw: function draw( canvas ){
		canvas.save();
		canvas.strokeRect(this.p1.x, this.p1.y, this.w, this.h);
		canvas.restore();
	}
}
ns.Point = Point;
ns.Vector = Vector;
ns.LineSegment = LineSegment;
ns.Arc = Arc;
ns.Ray = Ray;

ns.Shape2D = Shape2D;
ns.BoundingBox = BoundingBox;

ns.radians = function(degrees){return deg2rad * degrees};
ns.degrees = function(radians){return rad2deg * radians};
})(ross.drawing);
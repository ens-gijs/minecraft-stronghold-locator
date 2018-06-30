core.namespace( 'ross.drawing', function(ns) {
/**
 *
 *
 * mode of 0 gives Cartesian behavior (0,0 at center)
 * mode of 1 gives 'canvas' behavior (0,0 at top left)
 * mode of 2 gives 'canvas' behavior (0,0 at center)
 */
function CoordinatePlane( canvas, mode ){
	var mode_ = 0;
	var zoom_ = 1;
	computeDim.call(this);
	
	function computeDim(){
		if( mode_ == 0 ){
			this.xMin =  (-canvas.width  / 2 - 1) / zoom_|0;
			this.xMax =  ( canvas.width  / 2 + 1) / zoom_|0;
			this.yMin =  (-canvas.height / 2 - 1) / zoom_|0;
			this.yMax =  ( canvas.height / 2 + 1) / zoom_|0;
		} else if( mode_ == 1 ) {
			this.xMin = 0;
			this.xMax =  canvas.width/ zoom_;
			this.yMin = 0;
			this.yMax =  canvas.height/ zoom_;
		} else if( mode_ == 2 ){
			this.xMin =  (-canvas.width  / 2 - 1) / zoom_|0;
			this.xMax =  ( canvas.width  / 2 + 1) / zoom_|0;
			this.yMin =  (-canvas.height / 2 - 1) / zoom_|0;
			this.yMax =  ( canvas.height / 2 + 1) / zoom_|0;
		}
	}
	
    this.__defineGetter__("mode", function(){
		return mode_;
	});
	this.__defineSetter__("mode", function(value){
		mode_ = value;
		computeDim.call(this);
		this.clear();
	});
	this.canvas_ = canvas;
	this.mode = mode || 0;
	
	this.__defineGetter__("zoom", function(){
		return zoom_;
	});
	this.__defineSetter__("zoom", function(value){
		zoom_ = value;
		computeDim.call(this);
		this.clear();
		return zoom_;
	});
	
}
CoordinatePlane.prototype = {
	get width(){
		return this.xMax - this.xMin;
	},
	get height(){
		return this.yMax - this.yMin;
	},
	clear: function clear(){
		var c = this.canvas_;
		c.resetTransform();
		c.translate(0.5,0.5);
		if( this.mode == 0 ) {
			c.translate( this.width / 2 |0, this.height/2 |0 );
			c.scale(this.zoom,-this.zoom);
		} else if( this.mode == 1 ) {
			c.scale(this.zoom,this.zoom);
		} else  if( this.mode == 2 ) {
			c.translate( this.width / 2 |0, this.height/2 |0 );
			c.scale(this.zoom, this.zoom);
		} 
		c.lineWidth = 1;
		c.fillStyle = 'darkgray';
		c.strokeStyle = 'black';
		
		c.save();
		c.beginPath();
		c.fillStyle = "rgb(250,250,250)";
		c.rect(this.xMin, this.yMin, this.width, this.height);
		c.fill();
		
		// draw Axis lines
		c.strokeStyle = "rgba(0,0,0,0.15)";
		c.moveTo(this.xMin, 0);
		c.lineTo(this.xMax, 0);
		c.moveTo(0, this.yMin);
		c.lineTo(0, this.yMax);
		c.stroke();
		
		c.beginPath();
		c.strokeStyle = "rgba(0,0,0,0.10)";
		for( var x = this.xMin - (this.xMin%10); x < this.xMax; x += 10 ) {
			if( x != 0 ) {
				c.moveTo(x, 3);
				c.lineTo(x, -3);
			}
			c.moveTo(x+5, 1);
			c.lineTo(x+5, -1);
			if( x % 100 == 0 ){
				c.moveTo(x, this.yMax);
				c.lineTo(x, this.yMin);
			}
		}
		
		for( var y = this.yMin - (this.yMin%10); y < this.yMax; y += 10 ) {
			if( y != 0 ) {
				c.moveTo(3, y);
				c.lineTo(-3, y);
			}
			c.moveTo(1, y+5);
			c.lineTo(-1, y+5);
			if( y % 100 == 0 ){
				c.moveTo(this.xMax,y);
				c.lineTo(this.xMin,y);
			}
		}
		c.stroke();
		
		c.beginPath();
		c.restore();
		
		c.strokeStyle = "rgba(0,0,0,0.60)";
	},
	drawIntersecionMarkers: function( contacts, both, one, none ) {
		if( both === undefined ) both = true;
		if( one === undefined ) one = true;
		if( none === undefined ) none = true;
		
		var canvas = this.canvas_;
		canvas.save();
		if( both ){
			canvas.strokeStyle = "rgba(0,100,0,0.2)";
			for( var i = 0; i < contacts.both.length; i++ ){
				var c = contacts.both[i];
				canvas.beginPath();
				canvas.arc(c.x, c.y, 3, 0, 2*Math.PI);
				canvas.stroke();
			}
		}
		if( one ) {
			canvas.strokeStyle = "rgba(0,0,200,0.2)";
			for( var i = 0; i < contacts.one.length; i++ ){
				var c = contacts.one[i];
				canvas.beginPath();
				canvas.arc(c.x, c.y, 3, 0, 2*Math.PI);
				canvas.stroke();
			}
		}
		if( none ) {
			canvas.strokeStyle = "rgba(200,0,0,0.2)";
			for( var i = 0; i < contacts.none.length; i++ ){
				var c = contacts.none[i];
				canvas.beginPath();
				canvas.arc(c.x, c.y, 3, 0, 2*Math.PI);
				canvas.stroke();
			}
		}
		canvas.restore();
	}
}

ns.CoordinatePlane = CoordinatePlane;
});
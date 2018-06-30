// Requires:
//   jQuery
//   core.Observable

core.namespace( 'ross.drawing.canvas_helpers', function(ns){
  "use strict";

  /**
   * [[Description]]
   * @param   {Object} ctx [[Description]]
   * @returns {Object} [[Description]]
   */
  function track_transforms( ctx ) {
    if( ctx.transformedPoint ) return;

    var xform = matrix.identity(3);
		
		// x-scale specifically
		// y-scale would use c and d and shortcut if c was zero.
		ctx.getScale = function(){
			var a=xform[0][0],b=xform[1][0];
			if(!b)return a;
			return Math.sqrt(a * a + b * b);
		};
		
		// sets UNIFORM scale preserving screen centering.
		ctx.setScale = function(s){
			var os = ctx.getScale();
			var c = ctx.getCenter();
			var f = s / os;
			if(f !== 1) {
				ctx.translate(c.x, c.y);
				ctx.scale(f, f);
				ctx.translate(-c.x, -c.y);
				canvas_ctx.scale_changed_event.trigger(s, os);
			}
		}

		
		// center coords in WORLD space.
		ctx.getCenter = function(){
			return ctx.transformedPoint(ctx.width/2, ctx.height/2);
		}
		
		// sets the point in WORLD space to the center of the canvas
		ctx.setCenter = function(x, y){
			var c = ctx.getCenter();
			ctx.translate(c.x, c.y);
			ctx.translate(-x, -y);
		};
		
		// Bounding BOX (4 cornners) in WORLD space in clockwise order.
		// if the canvas is not rotated then the bounding cornners will be
		// in positions 0, 2
		ctx.getViewBounds = function(){
			return [
			  ctx.transformedPoint(0, 0),
			  ctx.transformedPoint(ctx.width, 0),
			  ctx.transformedPoint(ctx.width, ctx.height),
			  ctx.transformedPoint(0, ctx.height)
			];
		}
		
    ctx.getTransform = function(){
      var t = xform;
			// remember canvas matricies are layed out as:
			// a c e
			// b d f
			// 0 0 1
      return {
        a: t[0][0],
        b: t[1][0],
        c: t[0][1],
        d: t[1][1],
        e: t[0][2],
        f: t[1][2],
      }; 
    };
		
		ctx.identity = function(){
			ctx.setTransformMatrix(matrix.identity(3));
		}
		
    ctx.getTransformMatrix = function(){
      return xform;
    };
    ctx.setTransformMatrix = function(m){
      xform = matrix.translate(m,0,0)
      ctx._syncTransforms();
    };
    
    var savedTransforms = [];
    var save = ctx.save;
    ctx.save = function(){
      savedTransforms.push(matrix.translate(xform,0,0));
      return save.call(ctx);
    };
    var restore = ctx.restore;
    ctx.restore = function(){
      xform = savedTransforms.pop();
      var ret = restore.call(ctx);
      ctx._syncTransforms();
      return ret;
    };

    var scale = ctx.scale;
    ctx.scale = function(sx,sy){
			if(sy===undefined)sy=sx;
      xform = matrix.scale(xform,sx,sy);
      var r=scale.call(ctx,sx,sy);
			return r;
    };
    var rotate = ctx.rotate;
    ctx.rotate = function(radians){
      xform = matrix.rotate(xform,radians);
      return rotate.call(ctx,radians);
    };
    var translate = ctx.translate;
    ctx.translate = function(dx,dy){
      xform = matrix.translate(xform,dx,dy);
      return translate.call(ctx,dx,dy);
    };
    var transform = ctx.transform;
    ctx.transform = function(a,b,c,d,e,f){
      var m2 = matrix.identity(3);
      m2[0][0] = a;
      m2[1][0] = b;
      m2[0][1] = c;
      m2[1][1] = d;
      m2[0][2] = e;
      m2[1][2] = f;
      xform = matrix.multiply(xform,m2);
      return transform.call(ctx,a,b,c,d,e,f);
    };
    var setTransform = ctx.setTransform;
    ctx.setTransform = function(a,b,c,d,e,f){
			var m2 = matrix.identity(3);
			if(typeof(a) == 'object'){
				m2[0][0] = a.a;
				m2[1][0] = a.b;
				m2[0][1] = a.c;
				m2[1][1] = a.d;
				m2[0][2] = a.e;
				m2[1][2] = a.f;
				xform = m2;
				return setTransform.call(ctx,a,b,c,d,e,f);
			} else {
				m2[0][0] = a;
				m2[1][0] = b;
				m2[0][1] = c;
				m2[1][1] = d;
				m2[0][2] = e;
				m2[1][2] = f;
				xform = m2;
				return setTransform.call(ctx,a,b,c,d,e,f);
			}
    };
    
		// Maps from screen to world cords.
    ctx.transformedPoint = function(x,y){
      var mi = matrix.inverse(xform);
      return matrix.transformPoint(mi, x, y);
    }
		
		// Maps from world to screen cords.
		ctx.untransformedPoint = function(x,y){
			return matrix.transformPoint(xform, x, y);
		};
		// logic for doing the same if NOT using this helper
		// let svg = document.createElementNS("http://www.w3.org/2000/svg",'svg');
		// let pt = svg.createSVGPoint();
		// let xform = ctx.getTransform();
		// pt.x=x; pt.y=y;
		// return pt.matrixTransform(xform);
    
    ctx._syncTransforms = function() {
      var t = ctx.getTransform();
      setTransform.call(ctx, t.a, t.b, t.c, t.d, t.e, t.f);
    }
  }
  
  /**
   * Enables mouse wheel zooming and mouse drag panning.
   *
   * Based on: http://phrogz.net/tmp/canvas_zoom_to_cursor.html
   * @param   {Object}   canvas_dom
   * @param   {Object}   canvas_ctx
   * @param   {Function} redraw  callback to redraw when needed
   */
  function enable_mouse_zoom( canvas_dom, canvas_ctx, redraw, options ){
		const default_options = {
			// Left button=1,
			// Right button=2
			// Middle (wheel) button=4
			// 4th button (typically, "Browser Back" button)=8
			// 5th button (typically, "Browser Forward" button)=16. 
			pan_with_mouse_button_mask: 0x05,
			prevent_browser_scroll_on_pan_with_mouse: true,
			// Scaling step/factor. Must be NE 1.0
			scale_factor: 1.1,
			min_scale: 0.000001,
			max_scale: 100,
		};
		options = $.extend(true, {}, default_options, options);
    track_transforms( canvas_ctx );
    var redraw_ = redraw;
    var lastX=canvas_dom.width/2, lastY=canvas_dom.height/2;
    var dragStart;
		
		if(options.prevent_browser_scroll_on_pan_with_mouse){
			let mouse_over_canvas = false;
			
			$('body').mousedown(function(evt){
				if(evt.button === 1 && mouse_over_canvas)
					return false;
			});
			
			// TODO: this might misbehave if the canvans element has childern,
			// not sure if mouseover/mouseout or mouseenter/mouseleave should be used.
			// https://developer.mozilla.org/en-US/docs/Web/Events
			$(canvas_dom).mouseover(function(evt){
				mouse_over_canvas = true;
			}).mouseout(function(evt){
				mouse_over_canvas = false;
			});
		}
		
		// TODO: move fire custom events to initCanvas.		
		function fireEvent(handler, evt){
			if(handler.hasSubscribers()){
				var x = evt.offsetX || (evt.pageX - canvas_dom.offsetLeft);
				var y = evt.offsetY || (evt.pageY - canvas_dom.offsetTop);
				handler.trigger(
					canvas_ctx.transformedPoint(x,y),
					{
						button: evt.button,
						wheelDelta: evt.wheelDelta,
						ctrlKey: evt.ctrlKey,
						shiftKey: evt.shiftKey,
						altKey: evt.altKey,
						metaKey: evt.metaKey,  // windows key
						detail: evt.detail  // A count of consecutive clicks that happened in a short amount of time, incremented by one.
					}
				);
			}
		}
		
		canvas_dom.addEventListener('click',function(evt){
			var pt = canvas_ctx.transformedPoint(lastX,lastY);
			fireEvent(canvas_ctx.mouseclick_event, evt);
    },false);
		canvas_dom.addEventListener('dblclick',function(evt){
			var pt = canvas_ctx.transformedPoint(lastX,lastY);
			fireEvent(canvas_ctx.mousedblclick_event, evt);
    },false);
		
    canvas_dom.addEventListener('mousedown',function(evt){
			if(evt.buttons & options.pan_with_mouse_button_mask){
				lastX = evt.offsetX || (evt.pageX - canvas_dom.offsetLeft);
				lastY = evt.offsetY || (evt.pageY - canvas_dom.offsetTop);
				dragStart = canvas_ctx.transformedPoint(lastX,lastY);
			}
			fireEvent(canvas_ctx.mousedown_event, evt);
    },false);
    canvas_dom.addEventListener('mousemove',function(evt){
      lastX = evt.offsetX || (evt.pageX - canvas_dom.offsetLeft);
      lastY = evt.offsetY || (evt.pageY - canvas_dom.offsetTop);
			var pt = canvas_ctx.transformedPoint(lastX,lastY);
      if (dragStart && (evt.buttons & options.pan_with_mouse_button_mask)){
        canvas_ctx.translate(pt.x-dragStart.x,pt.y-dragStart.y);
        canvas_ctx._syncTransforms();
        if( redraw_ ) redraw_();
      } else {
				dragStart = null;
			}
			fireEvent(canvas_ctx.mousemove_event, evt);
    },false);
    canvas_dom.addEventListener('mouseup',function(evt){
			if(evt.buttons & options.pan_with_mouse_button_mask){
				dragStart = null;
			}
			fireEvent(canvas_ctx.mouseup_event, evt);
    },false);

    const scaleFactor = options.scale_factor;
    var zoom = function(clicks){
			var current_scale = canvas_ctx.getScale();
      var pt = canvas_ctx.transformedPoint(lastX,lastY);
      canvas_ctx.translate(pt.x,pt.y);
      var factor = Math.pow(scaleFactor,clicks);
			//console.log(factor);
			if(factor * current_scale > options.max_scale) {
				factor = options.max_scale / current_scale;
				//console.log('max scale hit, scale before clamping', current_scale);
			} else if(factor * current_scale < options.min_scale) {
				factor = options.min_scale / current_scale;
				//console.log('min scale hit, scale before clamping', current_scale);
			}
      canvas_ctx.scale(factor,factor);
      canvas_ctx.translate(-pt.x,-pt.y);
      canvas_ctx._syncTransforms();
			canvas_ctx.scale_changed_event.trigger(canvas_ctx.getScale(), current_scale);
      if( redraw_ ) redraw_();
    }

    var handleScroll = function(evt){
      var delta = evt.wheelDelta ? evt.wheelDelta/40 : evt.detail ? -evt.detail : 0;
      if (delta) zoom(delta);
			fireEvent(canvas_ctx.mousewheel_event, evt);
      return evt.preventDefault() && false;
    };
    canvas_dom.addEventListener('DOMMouseScroll',handleScroll,false);
    canvas_dom.addEventListener('mousewheel',handleScroll,false);
  }
	
  function initCanvas( selector, draw_handler, options ) {
    const default_options = {
			enable_mouse_zoom: true,
			default_scale: 1,
			flip_x: false,
			flip_y: true,
			center_zero_zero: true,
			enable_responsive_resize: true,
			mouse_zoom_options: {}
		};
		options = $.extend(true, {}, default_options, options);
		var $canvas = $(selector).first();
	
		var canvas_dom = $canvas.get(0);
		var canvas_ctx = canvas_dom.getContext("2d");
		canvas_ctx.redraw = draw_handler;
		
		// gives canvas_ctx the ability to directly control the width and height of the canvas area.
		Object.defineProperty(canvas_ctx, 'height', {
			get: function() {return canvas_dom.height;},
			set: function(v){canvas_dom.height = v;}
		});
		Object.defineProperty(canvas_ctx, 'width', {
			get: function() {return canvas_dom.width;},
			set: function(v){canvas_dom.width = v;}
		});
		
		// Ensures the canvas dom element has the width and height properties defined
		// - else they default to 300x150 reguardless of the actually element "size".
		canvas_ctx.width = $canvas.width();
		canvas_ctx.height = $canvas.height();
		
		if(options.enable_responsive_resize) {
			$( window ).resize(function() {
				var w = $canvas.width() |0;
				var h = $canvas.height() |0;
				if(canvas_ctx.width != w || canvas_ctx.height != h){
					canvas_ctx.width = w;
					canvas_ctx.height = h;
					canvas_ctx.redraw();
				}
			});
		}
		
		
		canvas_ctx.mousemove_event = new core.Observable(canvas_ctx);
		canvas_ctx.mouseup_event = new core.Observable(canvas_ctx);
		canvas_ctx.mousedown_event = new core.Observable(canvas_ctx);
		canvas_ctx.mouseclick_event = new core.Observable(canvas_ctx);
		canvas_ctx.mousedblclick_event = new core.Observable(canvas_ctx);
		canvas_ctx.mousewheel_event = new core.Observable(canvas_ctx);
		
		canvas_ctx.scale_changed_event = new core.Observable(canvas_ctx);
		
		
		if(options.enable_mouse_zoom)
			enable_mouse_zoom( canvas_dom, canvas_ctx, draw_handler, options.mouse_zoom_options );
		else
			track_transforms(canvas_ctx);
		
		canvas_ctx.resetTransforms = function(do_redraw){
			var s = options.default_scale || 1;
			canvas_ctx.identity();
			if(options.center_zero_zero)
				canvas_ctx.translate( (canvas_ctx.width / 2|0) + 0.5, (canvas_ctx.height / 2|0) + 0.5 );
			canvas_ctx.scale((options.flip_x ? -s : s),(options.flip_y ? -s : s));
			if(do_redraw) canvas_ctx.redraw();
		};
		
		canvas_ctx.resetTransforms();
		
		// Bind canvas_ctx operation variants for which position is specified in world cords and
		// sizes / orientation is specified in screen space.
		
		// text 
		var fillText = canvas_ctx.fillText;
		canvas_ctx.fillText2 = function( text, x_world, y_world, x_screen_offset, y_screen_offset ) {
			var xy = canvas_ctx.untransformedPoint(x_world, y_world);
			canvas_ctx.save();
			canvas_ctx.identity();
			fillText.call(canvas_ctx, text, xy.x + (x_screen_offset || 0), xy.y + (y_screen_offset || 0));
			canvas_ctx.restore();
		};

		var strokeText = canvas_ctx.strokeText;
		canvas_ctx.strokeText2 = function( text, x_world, y_world, x_screen_offset, y_screen_offset ) {
			var xy = canvas_ctx.untransformedPoint(x_world, y_world);
			canvas_ctx.save();
			canvas_ctx.identity();
			strokeText.call(canvas_ctx, text, xy.x + (x_screen_offset || 0), xy.y + (y_screen_offset || 0));
			canvas_ctx.restore();
		};

		var arc = canvas_ctx.arc;
		canvas_ctx.arc2 = function(x_world, y_world, radius_screen, startAngle, endAngle, counterclockwise) {
			var xy = canvas_ctx.untransformedPoint(x_world, y_world);
			canvas_ctx.save();
			canvas_ctx.identity();
			arc.call( canvas_ctx, xy.x, xy.y, radius_screen, startAngle, endAngle, counterclockwise );
			canvas_ctx.restore();
		};

		canvas_ctx.circle = function( x, y, radius ) {
			arc.call( canvas_ctx, x, y, radius, 0, Math.PI * 2 );
		};

		canvas_ctx.circle2 = function( x_world, y_world, radius_screen ) {
			var xy = canvas_ctx.untransformedPoint(x_world, y_world);
			canvas_ctx.save();
			canvas_ctx.identity();
			arc.call( canvas_ctx, xy.x, xy.y, radius_screen, 0, Math.PI * 2 );
			canvas_ctx.restore();
		};

		var rect = canvas_ctx.rect;
		canvas_ctx.rect2 = function(x_center_world, y_center_world, w_screen, h_screen) {
			var xy = canvas_ctx.untransformedPoint(x_center_world, y_center_world);
			canvas_ctx.save();
			canvas_ctx.identity();
			return rect.call( canvas_ctx, xy.x - w/2, xy.y - h/2, w_screen, h_screen );
			canvas_ctx.restore();
		}; 

//    canvas_ctx.untransformLength = function( l ){
//      var zero = canvas_ctx.untransformedPoint(0, 0);
//      var xy = canvas_ctx.untransformedPoint(l, 0);
//      xy.x -= zero.x;
//      xy.y -= zero.y;
//      var k;
//      if( xy.y == 0 ) k = xy.x;
//      else k = Math.sqrt( xy.x * xy.x + xy.y * xy.y );
//      return k;
//    }
		function transformLength( l ){
			return l / canvas_ctx.getScale();
		}
		// var z = canvas_ctx.transformedPoint(0, 0);
		// var p = canvas_ctx.transformedPoint(l, 0);
		// return new ross.drawing.Point(z).distanceTo(p);

		var stroke = canvas_ctx.stroke;
		canvas_ctx.stroke = function() {
			var lo = canvas_ctx.lineWidth;
			var l = transformLength( canvas_ctx.lineWidth );
			if( l < 0 ) l = -l;
			canvas_ctx.lineWidth = l;
			stroke.call(canvas_ctx);
			canvas_ctx.lineWidth = lo;
		};
		canvas_ctx.strokeAtScale = function() {
			stroke.call(canvas_ctx);
		};

		canvas_ctx.clear = function(fill_color, border_width, border_color){
			canvas_ctx.save();
			canvas_ctx.identity();
			if(fill_color){
				canvas_ctx.fillStyle = fill_color;
				canvas_ctx.fillRect(0,0,canvas_ctx.width, canvas_ctx.height);
			}else{
				canvas_ctx.clearRect(0,0,canvas_ctx.width, canvas_ctx.height);
			}
			if(border_width){
				canvas_ctx.lineWidth = border_width;
				if(border_color) canvas_ctx.strokeStyle = border_color;
				var h = border_width / 2.0;
				canvas_ctx.strokeRect(h, h, canvas_ctx.width - border_width, canvas_ctx.height - border_width);
			}
			canvas_ctx.restore();
		};
		
		return canvas_ctx;
	}
	
	ns.initCanvas = initCanvas;
  ns.enable_mouse_zoom = enable_mouse_zoom;
  ns.track_transforms = track_transforms;
//  ns.trap_transforms = trap_transforms;


});


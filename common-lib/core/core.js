"use strict";


function namespace( name, members ) {
  var parts = name.split('.');
  var ns = window; // using 'this' results in odd behavior frankly
  for( var i = 0, len = parts.length; i < len; i ++ ) {
    var part = parts[i];
    if ( !ns[part] ) ns[part] = {};
    ns = ns[part];
  }

  if ( typeof( members ) == "function" ) {
    members( ns );
  } else {
    for (var prop in members) ns[prop] = members[prop];
  }
  return ns;
}

namespace( "core", {namespace: namespace} );

(function() {
  /**
   * Defines or retrieves a deeply named object on some existing object (or window).
   * Can be used to create 'namespaces'.
   * The given name is traversed over the given object (or window) and empty objects are
   * created/attached as needed.
   *
   * @param name {string} '.' separated string of namespace parts. E.g. "com.amazon.foo"
   * @param parent {?Object} object to use as the name root, if not given window is used.
   * @returns deepest (right-most) object created/referenced via name
   */
  core.dim = function( name, parent ) {
    var parts = name.split('.');
    var cur = parent || window;

    for(var i = 0, len = parts.length; i < len; i++) {
      var part = parts[i];
      cur = cur[part] = cur[part] || {};
    }

    return cur;
  };

  /**
   * given a list of javascript file names this function will inject 'script' tags into
   * the document for each.
   *
   * @param includes {Array.<string>} list of javascript file names
   * @root {?string} prepended to each of the given file names
   * @reload {?bool}
   */
  core.include = function( includes, root, reload ) {
    if ( !root ) root = "";
    reload = !!reload;
    //document.write("<h1>" + document.location + "</h1>");
    for( var i = 0, len = includes.length; i < len; i ++ ) {
      var file = root + includes[i];
      if( !__includedFileNames[file] || reload ) {
        __includedFileNames[file] = 1;
        document.write('<script type="text/javascript" src="' + file + '"></script>');
      }
    }
  };
  var __includedFileNames = {};
  
  /**
   * retrieves the sub OBJECT specified by the path, without modifying
   * or creating any object along the way. If there is a gap in the path created by
   * a null, undefined, or non-object type then undefined is returned.
   *
   * @param obj {Object} object to traverse
   * @param path ({Array,<string>|string)} may be a '.' separated string or an array of strings
   */
  core.traverse = function( obj, path ) {
    if ( typeof(path) == "string" ) path = path.split('.');
    var cursor = obj;
    if( !path ) return obj;
    if ( typeof(cursor) != 'object' ) return undefined;
    
    for( var i = 0, len = path.length; i < len ; i ++ ) {
      var part = path[i];
      if ( typeof(cursor[part]) === 'undefined' ) return undefined;
      cursor = cursor[part];
    }
    
    return cursor;
  };
  
  
  /**
   * Copy all of the properties in the source objects over to the destination
   * object. It's in-order, to the last source will override properties of the
   * same name in previous arguments.
   *
   * Supports getters and setters too!
   *
   * <p>Modified and taken from underscore.js</p>
   * 
   * @public
   * @memberOf core
   * @param obj object to extend
   * @param [params...] objects to extend with
   * @returns obj given (modified)
   */
  core.extend = function extend( obj ) {
    for( var i = 1, len = arguments.length; i < len; i ++ ) {
      var source = arguments[i];
      for (var prop in source) {
        var g = source.__lookupGetter__(prop),
          s = source.__lookupSetter__(prop);
        
        if ( g || s ) {
          if ( g )
            obj.__defineGetter__(prop, g);
          if ( s )
            obj.__defineSetter__(prop, s);
         } else
            obj[prop] = source[prop];
      }
    }
    return obj;
  };
  
  /**
   * use to extend a class, supports only single inheritance.
   * 
   * @param {Function} child  type to extend
   * @param {Function} parent type being extended
   * @param {?Object}  props  Additional properties to include
   */
  core.extendType = function extendType( child, parent, props ) {
    var ctor = child.prototype.constructor;
    extend( child.prototype, parent.prototype, props );
    Object.defineProperty(child.prototype, 'constructor', { value: ctor, enumerable: false });
    child._super = parent;
    child._superproto = parent.prototype;
  };
  
  
  //================================================================================================
  // TYPE EXTENSIONS
  //================================================================================================
  /**
   * computes a hash code for strings
   * the value -1 is reserved for empty strings (or uncomputed hash codes)
   *
   * hashing algorithm ported from python 2.7 code
   */
  String.prototype.hashCode = function() {
    var len = this.length;
    if ( len == 0 ) return -1;
    
    var x = this.charCodeAt(0) << 7;
    for ( var i = 0; i < len; i++ )
    {
      x = ( 1000003 * x ) ^ this.charCodeAt(i);
    }
    x ^= len;
    if ( x == -1 )
      x = -2;
        
    return x;
  };

})();
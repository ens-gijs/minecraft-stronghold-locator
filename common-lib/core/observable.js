core.dim('core');

(function(){
  /**
   * @class
   * @param owner {?object} the owner is provided in the event object which is 
   * passed to each listener as the 'sender'. Normally this value should be
   * 'this'.
   */
  core.Observable = function( owner ) {
    this.subscribers_ = [];
    this.owner_ = owner;
    return;
  }

  /**
   * subscribes as an observer to this Event
   * 
   * @param target {?object} invocation target (becomes the 'this' inside of the
   * called method).
   * @param method {function} callback which will be invoked
   * @param token {?any} optional token which will be included in the event 
   * argument passed to the callback method.
   */
  core.Observable.prototype.subscribe = function( target, method, token ) {
    if ( typeof ( method ) != "function" )
      throw new Error("The method argument must be a function and is required. Did you forget to supply a 'target'?" );
      
    this.subscribers_.push( {
      target: target,
      method: method,
      token: token
    } );
    return;
  };

  /**
   * unsubscribes an observer from this Event
   * If only a target is passed all subscriptions owned by that target are 
   * removed. If only a method is passed then all subscriptions without a
   * target with this method are removed.
   *
   * Calling this function without either a target or a method has no effect.
   *
   * @param {?object} target same instance as the target used to call subscribe
   * @param {function} method same instance as the method used to call subscribe
   */
  core.Observable.prototype.unsubscribe = function( target, method ) {
    var result = [];
    
    if ( !!target && !!method ) {
      for( var i = 0, len = this.subscribers_.length; i < len; i ++ ) {
        var o = this.subscribers_[i];
        if ( o.target != target || o.method != method )
          result.push( o );
      }
    } else if ( !!target ) {
      for( var i = 0, len = this.subscribers_.length; i < len; i ++ ) {
        var o = this.subscribers_[i];
        if ( o.target != target )
          result.push( o );
      }
    } else if ( !target && !!method ) {
      for( var i = 0, len = this.subscribers_.length; i < len; i ++ ) {
        var o = this.subscribers_[i];
        if ( !!o.target || o.method != method )
          result.push( o );
      }
    } else if ( !target && !method ) {
      result = this.subscribers_;
    }
    this.subscribers_ = result;
    return;
  };

  /**
   * @private
   */
  core.Observable.prototype.unsubscribeOne_ = function( observerEntry ) {
    var result = [];
    // this function must not mutate the original array, it must create a new one!
    for( var i = 0, len = this.subscribers_.length; i < len; i ++ ) {
      if ( this.subscribers_[i] != observerEntry ) result.push( this.subscribers_[i] );
    }
    this.subscribers_ = result;
    return;
  };
 
	core.Observable.prototype.hasSubscribers = function(){
		return this.subscribers_.length > 0;
	}

  /**
   * Notifies all subscribed observers.
   * Any arguments passed are forwarded to any observers and an event details
   * argument is created and appended to the list of arguments that is passed.
   * The event details object has the structure 
   *   sender:{object}  - the object this Event is bound to
   *   event: {Event}   - this event instance
   *   token: {any}     - the token that was passed to subscribe
   *   unsubscribe: {function} - helper function which takes no arguments and
   *                             will unsubscribe this observer callback.
   *
   * risk: mutation of the event args by targets of invocation.
   *
   * @param ... all arguments will be forwarded to each observer
   */
  core.Observable.prototype.trigger = function() {
		if(!this.hasSubscribers()) return;
		
    var args = [];
    for( var i = 0, len = arguments.length; i < len; i ++ ) {
      args.push( arguments[i] );
    }
    var eventDetails = {};
    args.push( eventDetails );
    
    var ss = this.subscribers_;
    for( var i = 0, len = ss.length; i < len; i ++ ) {
      var o = ss[i];
      
      var this_ = this;
      eventDetails.sender = this.owner_;
      eventDetails.event = this;
      eventDetails.token = o.token;
      eventDetails.unsubscribe = function(){
        this_.unsubscribeOne_( o );
      };
      o.method.apply( o.target, args );
    }
    return;
  };
})();
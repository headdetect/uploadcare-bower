/*
 * Uploadcare (1.5.0)
 * Date: 2014-12-12 19:17:03 +0000
 * Rev: 7a0db2e01a
 */
;(function(uploadcare, SCRIPT_BASE){(function() {
  window.uploadcare || (window.uploadcare = {});

  uploadcare.namespace = function(path, fn) {
    var first, part, parts, rest, target, _i, _len;
    parts = path.split('.');
    first = parts[0];
    rest = parts.slice(1);
    if (first === 'uploadcare') {
      target = uploadcare;
    } else {
      window[first] || (window[first] = {});
      target = window[first];
    }
    for (_i = 0, _len = rest.length; _i < _len; _i++) {
      part = rest[_i];
      target[part] || (target[part] = {});
      target = target[part];
    }
    return fn(target);
  };

  uploadcare.expose = function(key, value) {
    var last, part, parts, source, target, _i, _len;
    parts = key.split('.');
    last = parts.pop();
    target = window.uploadcare;
    source = uploadcare;
    for (_i = 0, _len = parts.length; _i < _len; _i++) {
      part = parts[_i];
      target[part] || (target[part] = {});
      target = target[part];
      source = source != null ? source[part] : void 0;
    }
    return target[last] = value || source[last];
  };

}).call(this);
// from https://github.com/kossnocorp/role

!function($){
  function rewriteSelector(context, name, argPos){
    var original = context[name];

    if (!original) return;

    context[name] = function(){
      arguments[argPos] = arguments[argPos].replace(/@([\w\u00c0-\uFFFF\-]+)/g, '[role~="$1"]');
      return original.apply(context, arguments);
    };

    $.extend(context[name], original);
  }

  rewriteSelector($, 'find', 0);
  rewriteSelector($, 'multiFilter', 0);
  rewriteSelector($.find, 'matchesSelector', 1);
  rewriteSelector($.find, 'matches', 0);

  function parse(roleString, without){
    var role, result = [], roles = $.trim(roleString).split(/\s+/);

    for(var i=0; i<roles.length; i++) {
      role = roles[i];
      if (!~$.inArray(role, result) && (!without || !~$.inArray(role, without)))
        result.push(role);
    }

    return result;
  };

  $.extend($.fn, {
    roles: function(){ return parse(this.attr('role')); },

    hasRole: function(roleName){
      var roles = parse(roleName);
      for(var i=0;i<roles.length;i++)
        if (!this.is('@'+roles[i])) return false;

      return true;
    },

    addRole: function(roleName){
      if (this.hasRole(roleName)) return this;

      return this.each(function(_, element){
        var $el = $(element);
        $el.attr('role', parse($el.attr('role') + ' ' + roleName).join(' '));
      });
    },

    removeRole: function(roleName){
      if (!this.hasRole(roleName)) return this;

      return this.each(function(_, element){
        var $el = $(element);
        $el.attr('role', parse($el.attr('role'), parse(roleName)).join(' '));
      });
    },

    toggleRole: function(roleName){
      var roles = parse(roleName);
      for(var i=0;i<roles.length;i++)
        this[this.hasRole(roles[i]) ? 'removeRole' : 'addRole'].call(this, roles[i]);
      return this;
    }
  });
}(jQuery)
;
// from https://github.com/jaubourg/ajaxHooks/blob/master/src/xdr.js

if ( window.XDomainRequest ) {
	jQuery.ajaxTransport(function( s ) {
		if ( s.crossDomain && s.async ) {
			if ( s.timeout ) {
				s.xdrTimeout = s.timeout;
				delete s.timeout;
			}
			var xdr;
			return {
				send: function( _, complete ) {
					function callback( status, statusText, responses, responseHeaders ) {
						xdr.onload = xdr.onerror = xdr.ontimeout = function() {};
						xdr = undefined;
						complete( status, statusText, responses, responseHeaders );
					}
					xdr = new XDomainRequest();
					xdr.onload = function() {
						callback( 200, "OK", { text: xdr.responseText }, "Content-Type: " + xdr.contentType );
					};
					xdr.onerror = function() {
						callback( 404, "Not Found" );
					};
					xdr.onprogress = function() {};
					xdr.ontimeout = function() {
						callback( 0, "timeout" );
					};
					xdr.timeout = s.xdrTimeout || Number.MAX_VALUE;
					xdr.open( s.type, s.url.replace(/^https?:/, '') );
					xdr.send( ( s.hasContent && s.data ) || null );
				},
				abort: function() {
					if ( xdr ) {
						xdr.onerror = function() {};
						xdr.abort();
					}
				}
			};
		}
	});
}
;
// from https://github.com/homm/jquery-ordering

(function($) {
	function nearestFinder (targets) {
		this.targets = targets;
		this.last = null;
		this.update();
	}
	nearestFinder.prototype = {
		update: function() {
			var rows = {};

			this.targets.each(function(i) {
				var offset = $(this).offset();
				if ( ! (offset.top in rows)) {
					rows[offset.top] = [];
				}
				rows[offset.top].push([offset.left + this.offsetWidth/2, this]);
			});

			this.rows = rows;
		},

		find: function(x, y) {
			var minDistance = Infinity;
			var rows = this.rows;
			var nearestRow, top, nearest;

			for (top in rows) {
				var distance = Math.abs(top - y);
				if (distance < minDistance) {
					minDistance = distance;
					nearestRow = rows[top];
				}
			}

			minDistance = Math.abs(nearestRow[0][0] - x);
			nearest = nearestRow[0][1];
			for (var i = 1; i < nearestRow.length; i++) {
				var distance = Math.abs(nearestRow[i][0] - x);
				if (distance < minDistance) {
					minDistance = distance;
					nearest = nearestRow[i][1];
				}
			}

			return nearest;
		},

		findNotLast: function(x, y) {
			var nearest = this.find(x, y);

			if (this.last && nearest && this.last == nearest) {
				return null;
			}

			return this.last = nearest;
		}
	};


	$.fn.extend({
		moveable: function(o) {
			o = $.extend({
				distance: 4,
				anyButton: false,
				axis: false,
				zIndex: 1000,
				start: $.noop,
				move: $.noop,
				finish: $.noop,
				items: null,
				keepFake: false,
				touch: true
			}, o);

			function fixTouch(e) {
			  if ( ! o.touch) {
			    return;
			  }
				var touch, s;
				s = e.originalEvent.touches;
				if (s && s.length) {
					touch = s[0];
				} else {
					s = e.originalEvent.changedTouches;
					if (s && s.length) {
						touch = s[0];
					} else {
						return;
					}
				}
				e.pageX = touch.pageX;
				e.pageY = touch.pageY;
				e.which = 1;
			}

			this.on('mousedown.moveable touchstart.movable', o.items, null, function(eDown) {
				fixTouch(eDown);

				if ( ! o.anyButton && eDown.which != 1) {
					return;
				}
				eDown.preventDefault();

				var dragged = false;
				var $dragged = $(this);
				var $fake = false;
				var originalPos = $dragged.position();  // offset parent

				originalPos.top += $dragged.offsetParent().scrollTop();
				originalPos.left += $dragged.offsetParent().scrollLeft();

				$(document).on('mousemove.moveable touchmove.movable', function(eMove) {
					fixTouch(eMove);

					if ( ! dragged && (Math.abs(eMove.pageX - eDown.pageX) > o.distance || Math.abs(eMove.pageY - eDown.pageY) > o.distance)) {
						dragged = true;
						$fake = $dragged.clone()
							.css({position: 'absolute', zIndex: o.zIndex,
							      width: $dragged.width()})
							.appendTo($dragged.offsetParent());
						o.start({
							event: eMove,
							dragged: $dragged,
							fake: $fake
						});
					}

					if ( ! dragged) {
						return;
					}
					eMove.preventDefault();

					var dx = o.axis == 'y' ? 0 : eMove.pageX - eDown.pageX;
					var dy = o.axis == 'x' ? 0 : eMove.pageY - eDown.pageY;
					$fake.css({left: dx + originalPos.left, top: dy + originalPos.top});
					o.move({
						event: eMove,
						dragged: $dragged,
						fake: $fake,
						dx: dx,
						dy: dy
					});
				});

				$(document).on('mouseup.moveable touchend.movable touchcancel.movable touchleave.movable', function(eUp) {
					fixTouch(eUp);

					$(document).off('mousemove.moveable touchmove.movable');
					$(document).off('mouseup.moveable touchend.movable touchcancel.movable touchleave.movable');

					if ( ! dragged) {
						return;
					}
					eUp.preventDefault();

					var dx = eUp.pageX - eDown.pageX;
					var dy = eUp.pageY - eDown.pageY;
					dragged = false;
					o.finish({
						event: eUp,
						dragged: $dragged,
						fake: $fake,
						dx: dx,
						dy: dy
					});
					if ( ! o.keepFake) {
						$fake.remove();
					}
				});
			});
		},

		sortable: function(o) {
			var oMovable = $.extend({
				items: '>*'
			}, o);
			var o = $.extend({
				checkBounds: function () {return true;},
				start: $.noop,
				attach: $.noop,
				move: $.noop,
				finish: $.noop
			}, o);
			var finder;
			var initialNext = false;
			var parent = this;

			oMovable.start = function(info) {
				o.start(info);
				finder = new nearestFinder(parent.find(oMovable.items));
				initialNext = info.dragged.next();
			};

			oMovable.move = function(info) {
				info.nearest = null;

				if (o.checkBounds(info)) {
					var offset = info.fake.offset();
					var nearest = finder.findNotLast(
						offset.left + info.dragged.width() / 2, offset.top);
					info.nearest = $(nearest);

					if (nearest && nearest != info.dragged[0]) {
						if (info.dragged.nextAll().filter(nearest).length > 0) {
							info.dragged.insertAfter(nearest);
						} else {
							info.dragged.insertBefore(nearest);
						}
						o.attach(info);
						finder.last = null;
						finder.update();
					}
				} else if (finder.last !== null) {
					finder.last = null;
					if (initialNext.length) {
						info.dragged.insertBefore(initialNext);
					} else {
						info.dragged.parent().append(info.dragged);
					}
					o.attach(info);
					finder.update();
				}

				o.move(info);
			};

			oMovable.finish = function(info) {
				var offset = info.fake.offset();
				info.nearest = null;
				if (o.checkBounds(info)) {
					info.nearest = $(finder.find(
						offset.left + info.dragged.width() / 2, offset.top));
				}
				o.finish(info);
				finder = null;
			};

			return this.moveable(oMovable);
		}
	});
})(jQuery);
(function() {
  uploadcare.jQuery = jQuery;

}).call(this);
// changed:
//   Pusher.dependency_suffix = '.min'; (was '')
//   window.WEB_SOCKET_SWF_LOCATION = "https://s3.amazonaws.com/uploadcare-static/WebSocketMainInsecure.swf"

/*!
 * Pusher JavaScript Library v1.12.2
 * http://pusherapp.com/
 *
 * Copyright 2011, Pusher
 * Released under the MIT licence.
 */


;(function() {
  var Pusher, _require;

;(function() {
  if (Function.prototype.scopedTo === undefined) {
    Function.prototype.scopedTo = function(context, args) {
      var f = this;
      return function() {
        return f.apply(context, Array.prototype.slice.call(args || [])
                       .concat(Array.prototype.slice.call(arguments)));
      };
    };
  }

  Pusher = function(app_key, options) {
    this.options = options || {};
    this.key = app_key;
    this.channels = new Pusher.Channels();
    this.global_emitter = new Pusher.EventsDispatcher()

    var self = this;

    this.checkAppKey();

    this.connection = new Pusher.Connection(this.key, this.options);

    // Setup / teardown connection
    this.connection
      .bind('connected', function() {
        self.subscribeAll();
      })
      .bind('message', function(params) {
        var internal = (params.event.indexOf('pusher_internal:') === 0);
        if (params.channel) {
          var channel;
          if (channel = self.channel(params.channel)) {
            channel.emit(params.event, params.data);
          }
        }
        // Emit globaly [deprecated]
        if (!internal) self.global_emitter.emit(params.event, params.data);
      })
      .bind('disconnected', function() {
        self.channels.disconnect();
      })
      .bind('error', function(err) {
        Pusher.warn('Error', err);
      });

    Pusher.instances.push(this);

    if (Pusher.isReady) self.connect();
  };
  Pusher.instances = [];
  Pusher.prototype = {
    channel: function(name) {
      return this.channels.find(name);
    },

    connect: function() {
      this.connection.connect();
    },

    disconnect: function() {
      this.connection.disconnect();
    },

    bind: function(event_name, callback) {
      this.global_emitter.bind(event_name, callback);
      return this;
    },

    bind_all: function(callback) {
      this.global_emitter.bind_all(callback);
      return this;
    },

    subscribeAll: function() {
      var channel;
      for (channelName in this.channels.channels) {
        if (this.channels.channels.hasOwnProperty(channelName)) {
          this.subscribe(channelName);
        }
      }
    },

    subscribe: function(channel_name) {
      var self = this;
      var channel = this.channels.add(channel_name, this);

      if (this.connection.state === 'connected') {
        channel.authorize(this.connection.socket_id, this.options, function(err, data) {
          if (err) {
            channel.emit('pusher:subscription_error', data);
          } else {
            self.send_event('pusher:subscribe', {
              channel: channel_name,
              auth: data.auth,
              channel_data: data.channel_data
            });
          }
        });
      }
      return channel;
    },

    unsubscribe: function(channel_name) {
      this.channels.remove(channel_name);
      if (this.connection.state === 'connected') {
        this.send_event('pusher:unsubscribe', {
          channel: channel_name
        });
      }
    },

    send_event: function(event_name, data, channel) {
      return this.connection.send_event(event_name, data, channel);
    },

    checkAppKey: function() {
      if(this.key === null || this.key === undefined) {
        Pusher.warn('Warning', 'You must pass your app key when you instantiate Pusher.');
      }
    }
  };

  Pusher.Util = {
    extend: function extend(target, extensions) {
      for (var property in extensions) {
        if (extensions[property] && extensions[property].constructor &&
            extensions[property].constructor === Object) {
          target[property] = extend(target[property] || {}, extensions[property]);
        } else {
          target[property] = extensions[property];
        }
      }
      return target;
    },

    stringify: function stringify() {
      var m = ["Pusher"]
      for (var i = 0; i < arguments.length; i++){
        if (typeof arguments[i] === "string") {
          m.push(arguments[i])
        } else {
          if (window['JSON'] == undefined) {
            m.push(arguments[i].toString());
          } else {
            m.push(JSON.stringify(arguments[i]))
          }
        }
      };
      return m.join(" : ")
    },

    arrayIndexOf: function(array, item) { // MSIE doesn't have array.indexOf
      var nativeIndexOf = Array.prototype.indexOf;
      if (array == null) return -1;
      if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
      for (i = 0, l = array.length; i < l; i++) if (array[i] === item) return i;
      return -1;
    }
  };

  // To receive log output provide a Pusher.log function, for example
  // Pusher.log = function(m){console.log(m)}
  Pusher.debug = function() {
    if (!Pusher.log) return
    Pusher.log(Pusher.Util.stringify.apply(this, arguments))
  }
  Pusher.warn = function() {
    if (window.console && window.console.warn) {
      window.console.warn(Pusher.Util.stringify.apply(this, arguments));
    } else {
      if (!Pusher.log) return
      Pusher.log(Pusher.Util.stringify.apply(this, arguments));
    }
  };

  // Pusher defaults
  Pusher.VERSION = '1.12.2';

  Pusher.host = 'ws.pusherapp.com';
  Pusher.ws_port = 80;
  Pusher.wss_port = 443;
  Pusher.channel_auth_endpoint = '/pusher/auth';
  Pusher.cdn_http = 'http://js.pusher.com/'
  Pusher.cdn_https = 'https://d3dy5gmtp8yhk7.cloudfront.net/'
  Pusher.dependency_suffix = '.min';
  Pusher.channel_auth_transport = 'ajax';
  Pusher.activity_timeout = 120000;
  Pusher.pong_timeout = 30000;

  Pusher.isReady = false;
  Pusher.ready = function() {
    Pusher.isReady = true;
    for (var i = 0, l = Pusher.instances.length; i < l; i++) {
      Pusher.instances[i].connect();
    }
  };

})();

;(function() {
/* Abstract event binding
Example:

    var MyEventEmitter = function(){};
    MyEventEmitter.prototype = new Pusher.EventsDispatcher;

    var emitter = new MyEventEmitter();

    // Bind to single event
    emitter.bind('foo_event', function(data){ alert(data)} );

    // Bind to all
    emitter.bind_all(function(eventName, data){ alert(data) });

--------------------------------------------------------*/

  function CallbackRegistry() {
    this._callbacks = {};
  };

  CallbackRegistry.prototype.get = function(eventName) {
    return this._callbacks[this._prefix(eventName)];
  };

  CallbackRegistry.prototype.add = function(eventName, callback) {
    var prefixedEventName = this._prefix(eventName);
    this._callbacks[prefixedEventName] = this._callbacks[prefixedEventName] || [];
    this._callbacks[prefixedEventName].push(callback);
  };

  CallbackRegistry.prototype.remove = function(eventName, callback) {
    if(this.get(eventName)) {
      var index = Pusher.Util.arrayIndexOf(this.get(eventName), callback);
      this._callbacks[this._prefix(eventName)].splice(index, 1);
    }
  };

  CallbackRegistry.prototype._prefix = function(eventName) {
    return "_" + eventName;
  };


  function EventsDispatcher(failThrough) {
    this.callbacks = new CallbackRegistry();
    this.global_callbacks = [];
    // Run this function when dispatching an event when no callbacks defined
    this.failThrough = failThrough;
  }

  EventsDispatcher.prototype.bind = function(eventName, callback) {
    this.callbacks.add(eventName, callback);
    return this;// chainable
  };

  EventsDispatcher.prototype.unbind = function(eventName, callback) {
    this.callbacks.remove(eventName, callback);
    return this;
  };

  EventsDispatcher.prototype.emit = function(eventName, data) {
    // Global callbacks
    for (var i = 0; i < this.global_callbacks.length; i++) {
      this.global_callbacks[i](eventName, data);
    }

    // Event callbacks
    var callbacks = this.callbacks.get(eventName);
    if (callbacks) {
      for (var i = 0; i < callbacks.length; i++) {
        callbacks[i](data);
      }
    } else if (this.failThrough) {
      this.failThrough(eventName, data)
    }

    return this;
  };

  EventsDispatcher.prototype.bind_all = function(callback) {
    this.global_callbacks.push(callback);
    return this;
  };

  Pusher.EventsDispatcher = EventsDispatcher;
})();

;(function() {
  /*-----------------------------------------------
    Helpers:
  -----------------------------------------------*/

  function capitalize(str) {
    return str.substr(0, 1).toUpperCase() + str.substr(1);
  }


  function safeCall(method, obj, data) {
    if (obj[method] !== undefined) {
      obj[method](data);
    }
  }

  /*-----------------------------------------------
    The State Machine
  -----------------------------------------------*/
  function Machine(initialState, transitions, stateActions) {
    Pusher.EventsDispatcher.call(this);

    this.state = undefined;
    this.errors = [];

    // functions for each state
    this.stateActions = stateActions;

    // set up the transitions
    this.transitions = transitions;

    this.transition(initialState);
  };

  Machine.prototype.transition = function(nextState, data) {
    var prevState = this.state;
    var stateCallbacks = this.stateActions;

    if (prevState && (Pusher.Util.arrayIndexOf(this.transitions[prevState], nextState) == -1)) {
      this.emit('invalid_transition_attempt', {
        oldState: prevState,
        newState: nextState
      });

      throw new Error('Invalid transition [' + prevState + ' to ' + nextState + ']');
    }

    // exit
    safeCall(prevState + 'Exit', stateCallbacks, data);

    // tween
    safeCall(prevState + 'To' + capitalize(nextState), stateCallbacks, data);

    // pre
    safeCall(nextState + 'Pre', stateCallbacks, data);

    // change state:
    this.state = nextState;

    // handy to bind to
    this.emit('state_change', {
      oldState: prevState,
      newState: nextState
    });

    // Post:
    safeCall(nextState + 'Post', stateCallbacks, data);
  };

  Machine.prototype.is = function(state) {
    return this.state === state;
  };

  Machine.prototype.isNot = function(state) {
    return this.state !== state;
  };

  Pusher.Util.extend(Machine.prototype, Pusher.EventsDispatcher.prototype);

  Pusher.Machine = Machine;
})();

;(function() {
  /*
    A little bauble to interface with window.navigator.onLine,
    window.ononline and window.onoffline.  Easier to mock.
  */

  var NetInfo = function() {
    var self = this;
    Pusher.EventsDispatcher.call(this);
    // This is okay, as IE doesn't support this stuff anyway.
    if (window.addEventListener !== undefined) {
      window.addEventListener("online", function() {
        self.emit('online', null);
      }, false);
      window.addEventListener("offline", function() {
        self.emit('offline', null);
      }, false);
    }
  };

  // Offline means definitely offline (no connection to router).
  // Inverse does NOT mean definitely online (only currently supported in Safari
  // and even there only means the device has a connection to the router).
  NetInfo.prototype.isOnLine = function() {
    if (window.navigator.onLine === undefined) {
      return true;
    } else {
      return window.navigator.onLine;
    }
  };

  Pusher.Util.extend(NetInfo.prototype, Pusher.EventsDispatcher.prototype);

  Pusher.NetInfo = NetInfo;
})();

;(function() {
  var machineTransitions = {
    'initialized': ['waiting', 'failed'],
    'waiting': ['connecting', 'permanentlyClosed'],
    'connecting': ['open', 'permanentlyClosing', 'impermanentlyClosing', 'waiting'],
    'open': ['connected', 'permanentlyClosing', 'impermanentlyClosing', 'waiting'],
    'connected': ['permanentlyClosing', 'waiting'],
    'impermanentlyClosing': ['waiting', 'permanentlyClosing'],
    'permanentlyClosing': ['permanentlyClosed'],
    'permanentlyClosed': ['waiting', 'failed'],
    'failed': ['permanentlyClosed']
  };


  // Amount to add to time between connection attemtpts per failed attempt.
  var UNSUCCESSFUL_CONNECTION_ATTEMPT_ADDITIONAL_WAIT = 2000;
  var UNSUCCESSFUL_OPEN_ATTEMPT_ADDITIONAL_TIMEOUT = 2000;
  var UNSUCCESSFUL_CONNECTED_ATTEMPT_ADDITIONAL_TIMEOUT = 2000;

  var MAX_CONNECTION_ATTEMPT_WAIT = 5 * UNSUCCESSFUL_CONNECTION_ATTEMPT_ADDITIONAL_WAIT;
  var MAX_OPEN_ATTEMPT_TIMEOUT = 5 * UNSUCCESSFUL_OPEN_ATTEMPT_ADDITIONAL_TIMEOUT;
  var MAX_CONNECTED_ATTEMPT_TIMEOUT = 5 * UNSUCCESSFUL_CONNECTED_ATTEMPT_ADDITIONAL_TIMEOUT;

  function resetConnectionParameters(connection) {
    connection.connectionWait = 0;

    if (Pusher.TransportType === 'flash') {
      // Flash needs a bit more time
      connection.openTimeout = 5000;
    } else {
      connection.openTimeout = 2000;
    }
    connection.connectedTimeout = 2000;
    connection.connectionSecure = connection.compulsorySecure;
    connection.connectionAttempts = 0;
  }

  function Connection(key, options) {
    var self = this;

    Pusher.EventsDispatcher.call(this);

    this.options = Pusher.Util.extend({encrypted: false}, options);

    this.netInfo = new Pusher.NetInfo();

    this.netInfo.bind('online', function(){
      if (self._machine.is('waiting')) {
        self._machine.transition('connecting');
        updateState('connecting');
      }
    });

    this.netInfo.bind('offline', function() {
      if (self._machine.is('connected')) {
        // These are for Chrome 15, which ends up
        // having two sockets hanging around.
        self.socket.onclose = undefined;
        self.socket.onmessage = undefined;
        self.socket.onerror = undefined;
        self.socket.onopen = undefined;

        self.socket.close();
        self.socket = undefined;
        self._machine.transition('waiting');
      }
    });

    // define the state machine that runs the connection
    this._machine = new Pusher.Machine('initialized', machineTransitions, {
      initializedPre: function() {
        self.compulsorySecure = self.options.encrypted;

        self.key = key;
        self.socket = null;
        self.socket_id = null;

        self.state = 'initialized';
      },

      waitingPre: function() {
        if (self.connectionWait > 0) {
          self.emit('connecting_in', self.connectionWait);
        }

        if (self.netInfo.isOnLine() && self.connectionAttempts <= 4) {
          updateState('connecting');
        } else {
          updateState('unavailable');
        }

        // When in the unavailable state we attempt to connect, but don't
        // broadcast that fact
        if (self.netInfo.isOnLine()) {
          self._waitingTimer = setTimeout(function() {
            self._machine.transition('connecting');
          }, connectionDelay());
        }
      },

      waitingExit: function() {
        clearTimeout(self._waitingTimer);
      },

      connectingPre: function() {
        // Case that a user manages to get to the connecting
        // state even when offline.
        if (self.netInfo.isOnLine() === false) {
          self._machine.transition('waiting');
          updateState('unavailable');

          return;
        }

        var url = formatURL(self.key, self.connectionSecure);
        Pusher.debug('Connecting', url);
        self.socket = new Pusher.Transport(url);
        // now that the socket connection attempt has been started,
        // set up the callbacks fired by the socket for different outcomes
        self.socket.onopen = ws_onopen;
        self.socket.onclose = transitionToWaiting;
        self.socket.onerror = ws_onError;

        // allow time to get ws_onOpen, otherwise close socket and try again
        self._connectingTimer = setTimeout(TransitionToImpermanentlyClosing, self.openTimeout);
      },

      connectingExit: function() {
        clearTimeout(self._connectingTimer);
        self.socket.onopen = undefined; // unbind to avoid open events that are no longer relevant
      },

      connectingToWaiting: function() {
        updateConnectionParameters();

        // FUTURE: update only ssl
      },

      connectingToImpermanentlyClosing: function() {
        updateConnectionParameters();

        // FUTURE: update only timeout
      },

      openPre: function() {
        self.socket.onmessage = ws_onMessageOpen;
        self.socket.onerror = ws_onError;
        self.socket.onclose = transitionToWaiting;

        // allow time to get connected-to-Pusher message, otherwise close socket, try again
        self._openTimer = setTimeout(TransitionToImpermanentlyClosing, self.connectedTimeout);
      },

      openExit: function() {
        clearTimeout(self._openTimer);
        self.socket.onmessage = undefined; // unbind to avoid messages that are no longer relevant
      },

      openToWaiting: function() {
        updateConnectionParameters();
      },

      openToImpermanentlyClosing: function() {
        updateConnectionParameters();
      },

      connectedPre: function(socket_id) {
        self.socket_id = socket_id;

        self.socket.onmessage = ws_onMessageConnected;
        self.socket.onerror = ws_onError;
        self.socket.onclose = transitionToWaiting;

        resetConnectionParameters(self);
        self.connectedAt = new Date().getTime();

        resetActivityCheck();
      },

      connectedPost: function() {
        updateState('connected');
      },

      connectedExit: function() {
        stopActivityCheck();
        updateState('disconnected');
      },

      impermanentlyClosingPost: function() {
        if (self.socket) {
          self.socket.onclose = transitionToWaiting;
          self.socket.close();
        }
      },

      permanentlyClosingPost: function() {
        if (self.socket) {
          self.socket.onclose = function() {
            resetConnectionParameters(self);
            self._machine.transition('permanentlyClosed');
          };

          self.socket.close();
        } else {
          resetConnectionParameters(self);
          self._machine.transition('permanentlyClosed');
        }
      },

      failedPre: function() {
        updateState('failed');
        Pusher.debug('WebSockets are not available in this browser.');
      },

      permanentlyClosedPost: function() {
        updateState('disconnected');
      }
    });

    /*-----------------------------------------------
      -----------------------------------------------*/

    function updateConnectionParameters() {
      if (self.connectionWait < MAX_CONNECTION_ATTEMPT_WAIT) {
        self.connectionWait += UNSUCCESSFUL_CONNECTION_ATTEMPT_ADDITIONAL_WAIT;
      }

      if (self.openTimeout < MAX_OPEN_ATTEMPT_TIMEOUT) {
        self.openTimeout += UNSUCCESSFUL_OPEN_ATTEMPT_ADDITIONAL_TIMEOUT;
      }

      if (self.connectedTimeout < MAX_CONNECTED_ATTEMPT_TIMEOUT) {
        self.connectedTimeout += UNSUCCESSFUL_CONNECTED_ATTEMPT_ADDITIONAL_TIMEOUT;
      }

      if (self.compulsorySecure !== true) {
        self.connectionSecure = !self.connectionSecure;
      }

      self.connectionAttempts++;
    }

    function formatURL(key, isSecure) {
      var port = Pusher.ws_port;
      var protocol = 'ws://';

      // Always connect with SSL if the current page has
      // been loaded via HTTPS.
      //
      // FUTURE: Always connect using SSL.
      //
      if (isSecure || document.location.protocol === 'https:') {
        port = Pusher.wss_port;
        protocol = 'wss://';
      }

      var flash = (Pusher.TransportType === "flash") ? "true" : "false";

      return protocol + Pusher.host + ':' + port + '/app/' + key + '?protocol=5&client=js'
        + '&version=' + Pusher.VERSION
        + '&flash=' + flash;
    }

    // callback for close and retry.  Used on timeouts.
    function TransitionToImpermanentlyClosing() {
      self._machine.transition('impermanentlyClosing');
    }

    function resetActivityCheck() {
      if (self._activityTimer) { clearTimeout(self._activityTimer); }
      // Send ping after inactivity
      self._activityTimer = setTimeout(function() {
        self.send_event('pusher:ping', {})
        // Wait for pong response
        self._activityTimer = setTimeout(function() {
          self.socket.close();
        }, (self.options.pong_timeout || Pusher.pong_timeout))
      }, (self.options.activity_timeout || Pusher.activity_timeout))
    }

    function stopActivityCheck() {
      if (self._activityTimer) { clearTimeout(self._activityTimer); }
    }

    // Returns the delay before the next connection attempt should be made
    //
    // This function guards against attempting to connect more frequently than
    // once every second
    //
    function connectionDelay() {
      var delay = self.connectionWait;
      if (delay === 0) {
        if (self.connectedAt) {
          var t = 1000;
          var connectedFor = new Date().getTime() - self.connectedAt;
          if (connectedFor < t) {
            delay = t - connectedFor;
          }
        }
      }
      return delay;
    }

    /*-----------------------------------------------
      WebSocket Callbacks
      -----------------------------------------------*/

    // no-op, as we only care when we get pusher:connection_established
    function ws_onopen() {
      self._machine.transition('open');
    };

    function handleCloseCode(code, message) {
      // first inform the end-developer of this error
      self.emit('error', {type: 'PusherError', data: {code: code, message: message}});

      if (code === 4000) {
        // SSL only app
        self.compulsorySecure = true;
        self.connectionSecure = true;
        self.options.encrypted = true;

        TransitionToImpermanentlyClosing();
      } else if (code < 4100) {
        // Permentently close connection
        self._machine.transition('permanentlyClosing')
      } else if (code < 4200) {
        // Backoff before reconnecting
        self.connectionWait = 1000;
        self._machine.transition('waiting')
      } else if (code < 4300) {
        // Reconnect immediately
        TransitionToImpermanentlyClosing();
      } else {
        // Unknown error
        self._machine.transition('permanentlyClosing')
      }
    }

    function ws_onMessageOpen(event) {
      var params = parseWebSocketEvent(event);
      if (params !== undefined) {
        if (params.event === 'pusher:connection_established') {
          self._machine.transition('connected', params.data.socket_id);
        } else if (params.event === 'pusher:error') {
          handleCloseCode(params.data.code, params.data.message)
        }
      }
    }

    function ws_onMessageConnected(event) {
      resetActivityCheck();

      var params = parseWebSocketEvent(event);
      if (params !== undefined) {
        Pusher.debug('Event recd', params);

        switch (params.event) {
          case 'pusher:error':
            self.emit('error', {type: 'PusherError', data: params.data});
            break;
          case 'pusher:ping':
            self.send_event('pusher:pong', {})
            break;
        }

        self.emit('message', params);
      }
    }


    /**
     * Parses an event from the WebSocket to get
     * the JSON payload that we require
     *
     * @param {MessageEvent} event  The event from the WebSocket.onmessage handler.
    **/
    function parseWebSocketEvent(event) {
      try {
        var params = JSON.parse(event.data);

        if (typeof params.data === 'string') {
          try {
            params.data = JSON.parse(params.data);
          } catch (e) {
            if (!(e instanceof SyntaxError)) {
              throw e;
            }
          }
        }

        return params;
      } catch (e) {
        self.emit('error', {type: 'MessageParseError', error: e, data: event.data});
      }
    }

    function transitionToWaiting() {
      self._machine.transition('waiting');
    }

    function ws_onError(error) {
      // just emit error to user - socket will already be closed by browser
      self.emit('error', { type: 'WebSocketError', error: error });
    }

    // Updates the public state information exposed by connection
    //
    // This is distinct from the internal state information used by _machine
    // to manage the connection
    //
    function updateState(newState, data) {
      var prevState = self.state;
      self.state = newState;

      // Only emit when the state changes
      if (prevState !== newState) {
        Pusher.debug('State changed', prevState + ' -> ' + newState);
        self.emit('state_change', {previous: prevState, current: newState});
        self.emit(newState, data);
      }
    }
  };

  Connection.prototype.connect = function() {
    // no WebSockets
    if (!this._machine.is('failed') && !Pusher.Transport) {
      this._machine.transition('failed');
    }
    // initial open of connection
    else if(this._machine.is('initialized')) {
      resetConnectionParameters(this);
      this._machine.transition('waiting');
    }
    // user skipping connection wait
    else if (this._machine.is('waiting') && this.netInfo.isOnLine() === true) {
      this._machine.transition('connecting');
    }
    // user re-opening connection after closing it
    else if(this._machine.is("permanentlyClosed")) {
      resetConnectionParameters(this);
      this._machine.transition('waiting');
    }
  };

  Connection.prototype.send = function(data) {
    if (this._machine.is('connected')) {
      // Workaround for MobileSafari bug (see https://gist.github.com/2052006)
      var self = this;
      setTimeout(function() {
        self.socket.send(data);
      }, 0);
      return true;
    } else {
      return false;
    }
  };

  Connection.prototype.send_event = function(event_name, data, channel) {
    var payload = {
      event: event_name,
      data: data
    };
    if (channel) payload['channel'] = channel;

    Pusher.debug('Event sent', payload);
    return this.send(JSON.stringify(payload));
  }

  Connection.prototype.disconnect = function() {
    if (this._machine.is('permanentlyClosed')) return;

    if (this._machine.is('waiting') || this._machine.is('failed')) {
      this._machine.transition('permanentlyClosed');
    } else {
      this._machine.transition('permanentlyClosing');
    }
  };

  Pusher.Util.extend(Connection.prototype, Pusher.EventsDispatcher.prototype);
  Pusher.Connection = Connection;
})();

;(function() {
  Pusher.Channels = function() {
    this.channels = {};
  };

  Pusher.Channels.prototype = {
    add: function(channel_name, pusher) {
      var existing_channel = this.find(channel_name);
      if (!existing_channel) {
        var channel = Pusher.Channel.factory(channel_name, pusher);
        this.channels[channel_name] = channel;
        return channel;
      } else {
        return existing_channel;
      }
    },

    find: function(channel_name) {
      return this.channels[channel_name];
    },

    remove: function(channel_name) {
      delete this.channels[channel_name];
    },

    disconnect: function () {
      for(var channel_name in this.channels){
        this.channels[channel_name].disconnect()
      }
    }
  };

  Pusher.Channel = function(channel_name, pusher) {
    var self = this;
    Pusher.EventsDispatcher.call(this, function(event_name, event_data) {
      Pusher.debug('No callbacks on ' + channel_name + ' for ' + event_name);
    });

    this.pusher = pusher;
    this.name = channel_name;
    this.subscribed = false;

    this.bind('pusher_internal:subscription_succeeded', function(data) {
      self.onSubscriptionSucceeded(data);
    });
  };

  Pusher.Channel.prototype = {
    // inheritable constructor
    init: function() {},
    disconnect: function() {
      this.subscribed = false;
      this.emit("pusher_internal:disconnected");
    },

    onSubscriptionSucceeded: function(data) {
      this.subscribed = true;
      this.emit('pusher:subscription_succeeded');
    },

    authorize: function(socketId, options, callback){
      return callback(false, {}); // normal channels don't require auth
    },

    trigger: function(event, data) {
      return this.pusher.send_event(event, data, this.name);
    }
  };

  Pusher.Util.extend(Pusher.Channel.prototype, Pusher.EventsDispatcher.prototype);

  Pusher.Channel.PrivateChannel = {
    authorize: function(socketId, options, callback){
      var self = this;
      var authorizer = new Pusher.Channel.Authorizer(this, Pusher.channel_auth_transport, options);
      return authorizer.authorize(socketId, function(err, authData) {
        if(!err) {
          self.emit('pusher_internal:authorized', authData);
        }

        callback(err, authData);
      });
    }
  };

  Pusher.Channel.PresenceChannel = {
    init: function(){
      this.members = new Members(this); // leeches off channel events
    },

    onSubscriptionSucceeded: function(data) {
      this.subscribed = true;
      // We override this because we want the Members obj to be responsible for
      // emitting the pusher:subscription_succeeded.  It will do this after it has done its work.
    }
  };

  var Members = function(channel) {
    var self = this;

    var reset = function() {
      this._members_map = {};
      this.count = 0;
      this.me = null;
    };
    reset.call(this);

    channel.bind('pusher_internal:authorized', function(authorizedData) {
      var channelData = JSON.parse(authorizedData.channel_data);
      channel.bind("pusher_internal:subscription_succeeded", function(subscriptionData) {
        self._members_map = subscriptionData.presence.hash;
        self.count = subscriptionData.presence.count;
        self.me = self.get(channelData.user_id);
        channel.emit('pusher:subscription_succeeded', self);
      });
    });

    channel.bind('pusher_internal:member_added', function(data) {
      if(self.get(data.user_id) === null) { // only incr if user_id does not already exist
        self.count++;
      }

      self._members_map[data.user_id] = data.user_info;
      channel.emit('pusher:member_added', self.get(data.user_id));
    });

    channel.bind('pusher_internal:member_removed', function(data) {
      var member = self.get(data.user_id);
      if(member) {
        delete self._members_map[data.user_id];
        self.count--;
        channel.emit('pusher:member_removed', member);
      }
    });

    channel.bind('pusher_internal:disconnected', function() {
      reset.call(self);
    });
  };

  Members.prototype = {
    each: function(callback) {
      for(var i in this._members_map) {
        callback(this.get(i));
      }
    },

    get: function(user_id) {
      if (this._members_map.hasOwnProperty(user_id)) { // have heard of this user user_id
        return {
          id: user_id,
          info: this._members_map[user_id]
        }
      } else { // have never heard of this user
        return null;
      }
    }
  };

  Pusher.Channel.factory = function(channel_name, pusher){
    var channel = new Pusher.Channel(channel_name, pusher);
    if (channel_name.indexOf('private-') === 0) {
      Pusher.Util.extend(channel, Pusher.Channel.PrivateChannel);
    } else if (channel_name.indexOf('presence-') === 0) {
      Pusher.Util.extend(channel, Pusher.Channel.PrivateChannel);
      Pusher.Util.extend(channel, Pusher.Channel.PresenceChannel);
    };
    channel.init();
    return channel;
  };
})();

;(function() {
  Pusher.Channel.Authorizer = function(channel, type, options) {
    this.channel = channel;
    this.type = type;

    this.authOptions = (options || {}).auth || {};
  };

  Pusher.Channel.Authorizer.prototype = {
    composeQuery: function(socketId) {
      var query = '&socket_id=' + encodeURIComponent(socketId)
        + '&channel_name=' + encodeURIComponent(this.channel.name);

      for(var i in this.authOptions.params) {
        query += "&" + encodeURIComponent(i) + "=" + encodeURIComponent(this.authOptions.params[i]);
      }

      return query;
    },

    authorize: function(socketId, callback) {
      return Pusher.authorizers[this.type].call(this, socketId, callback);
    }
  };


  Pusher.auth_callbacks = {};
  Pusher.authorizers = {
    ajax: function(socketId, callback){
      var self = this, xhr;

      if (Pusher.XHR) {
        xhr = new Pusher.XHR();
      } else {
        xhr = (window.XMLHttpRequest ? new window.XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP"));
      }

      xhr.open("POST", Pusher.channel_auth_endpoint, true);

      // add request headers
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
      for(var headerName in this.authOptions.headers) {
        xhr.setRequestHeader(headerName, this.authOptions.headers[headerName]);
      }

      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            var data, parsed = false;

            try {
              data = JSON.parse(xhr.responseText);
              parsed = true;
            } catch (e) {
              callback(true, 'JSON returned from webapp was invalid, yet status code was 200. Data was: ' + xhr.responseText);
            }

            if (parsed) { // prevents double execution.
              callback(false, data);
            }
          } else {
            Pusher.warn("Couldn't get auth info from your webapp", xhr.status);
            callback(true, xhr.status);
          }
        }
      };

      xhr.send(this.composeQuery(socketId));
      return xhr;
    },

    jsonp: function(socketId, callback){
      if(this.authOptions.headers !== undefined) {
        Pusher.warn("Warn", "To send headers with the auth request, you must use AJAX, rather than JSONP.");
      }

      var script = document.createElement("script");
      // Hacked wrapper.
      Pusher.auth_callbacks[this.channel.name] = function(data) {
        callback(false, data);
      };

      var callback_name = "Pusher.auth_callbacks['" + this.channel.name + "']";
      script.src = Pusher.channel_auth_endpoint
        + '?callback='
        + encodeURIComponent(callback_name)
        + this.composeQuery(socketId);

      var head = document.getElementsByTagName("head")[0] || document.documentElement;
      head.insertBefore( script, head.firstChild );
    }
  };
})();

// _require(dependencies, callback) takes an array of dependency urls and a
// callback to call when all the dependecies have finished loading
var _require = (function() {
  function handleScriptLoaded(elem, callback) {
    if (document.addEventListener) {
      elem.addEventListener('load', callback, false);
    } else {
      elem.attachEvent('onreadystatechange', function () {
        if (elem.readyState == 'loaded' || elem.readyState == 'complete') {
          callback();
        }
      });
    }
  }

  function addScript(src, callback) {
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.setAttribute('src', src);
    script.setAttribute("type","text/javascript");
    script.setAttribute('async', true);

    handleScriptLoaded(script, function() {
      callback();
    });

    head.appendChild(script);
  }

  return function(deps, callback) {
    var deps_loaded = 0;
    for (var i = 0; i < deps.length; i++) {
      addScript(deps[i], function() {
        if (deps.length == ++deps_loaded) {
          // This setTimeout is a workaround for an Opera issue
          setTimeout(callback, 0);
        }
      });
    }
  }
})();

;(function() {
  // Support Firefox versions which prefix WebSocket
  if (!window['WebSocket'] && window['MozWebSocket']) {
    window['WebSocket'] = window['MozWebSocket']
  }

  if (window['WebSocket']) {
    Pusher.Transport = window['WebSocket'];
    Pusher.TransportType = 'native';
  }

  var cdn = (document.location.protocol == 'http:') ? Pusher.cdn_http : Pusher.cdn_https;
  var root = cdn + Pusher.VERSION;
  var deps = [];

  if (!window['JSON']) {
    deps.push(root + '/json2' + Pusher.dependency_suffix + '.js');
  }
  if (!window['WebSocket']) {
    // We manually initialize web-socket-js to iron out cross browser issues
    window.WEB_SOCKET_DISABLE_AUTO_INITIALIZATION = true;
    deps.push(root + '/flashfallback' + Pusher.dependency_suffix + '.js');
  }

  var initialize = function() {
    if (window['WebSocket']) {
      // Initialize function in the case that we have native WebSocket support
      return function() {
        Pusher.ready();
      }
    } else {
      // Initialize function for fallback case
      return function() {
        if (window['WebSocket']) {
          // window['WebSocket'] is a flash emulation of WebSocket
          Pusher.Transport = window['WebSocket'];
          Pusher.TransportType = 'flash';

          // window.WEB_SOCKET_SWF_LOCATION = root + "/WebSocketMain.swf";
          window.WEB_SOCKET_SWF_LOCATION = "https://s3.amazonaws.com/uploadcare-static/WebSocketMainInsecure.swf"
          WebSocket.__addTask(function() {
            Pusher.ready();
          })
          WebSocket.__initialize();
        } else {
          // Flash must not be installed
          Pusher.Transport = null;
          Pusher.TransportType = 'none';
          Pusher.ready();
        }
      }
    }
  }();

  // Allows calling a function when the document body is available
  var ondocumentbody = function(callback) {
    var load_body = function() {
      document.body ? callback() : setTimeout(load_body, 0);
    }
    load_body();
  };

  var initializeOnDocumentBody = function() {
    ondocumentbody(initialize);
  }

  if (deps.length > 0) {
    _require(deps, initializeOnDocumentBody);
  } else {
    initializeOnDocumentBody();
  }
})();


this.Pusher = Pusher;

}).call(uploadcare);
(function() {


}).call(this);
(function() {
  uploadcare.namespace('uploadcare.utils.abilities', function(ns) {
    ns.fileAPI = !!(window.File && window.FileList && window.FileReader);
    ns.sendFileAPI = !!(window.FormData && ns.fileAPI);
    ns.blob = (function() {
      try {
        return !!new Blob;
      } catch (_error) {
        return false;
      }
    })();
    ns.dragAndDrop = (function() {
      var el;
      el = document.createElement("div");
      return ("draggable" in el) || ("ondragstart" in el && "ondrop" in el);
    })();
    ns.canvas = (function() {
      var el;
      el = document.createElement("canvas");
      return !!(el.getContext && el.getContext('2d'));
    })();
    return ns.fileDragAndDrop = ns.fileAPI && ns.dragAndDrop;
  });

}).call(this);
(function() {
  uploadcare.namespace('uploadcare.utils.pusher', function(ns) {
    var hasOwners, pusherInstance, pusherWrapped, pushers, releasePusher, updateConnection;
    pushers = {};
    ns.getPusher = function(key, owner) {
      if (!(key in pushers)) {
        pushers[key] = {
          instance: null,
          owners: {}
        };
      }
      if (!pushers[key].owners[owner]) {
        pushers[key].owners[owner] = true;
      }
      updateConnection(key);
      return pusherWrapped(key, owner);
    };
    releasePusher = function(key, owner) {
      if (!pushers[key].owners[owner]) {
        return;
      }
      pushers[key].owners[owner] = false;
      return updateConnection(key);
    };
    hasOwners = function(key) {
      var owner;
      return ((function() {
        var _results;
        _results = [];
        for (owner in pushers[key].owners) {
          if (pushers[key].owners[owner]) {
            _results.push(owner);
          }
        }
        return _results;
      })()).length > 0;
    };
    updateConnection = function(key) {
      var instance;
      instance = pusherInstance(key);
      if (hasOwners(key)) {
        return instance.connect();
      } else {
        return setTimeout((function() {
          if (!hasOwners(key)) {
            return instance.disconnect();
          }
        }), 5000);
      }
    };
    pusherInstance = function(key) {
      var _ref;
      if (((_ref = pushers[key]) != null ? _ref.instance : void 0) != null) {
        return pushers[key].instance;
      }
      return pushers[key].instance = new uploadcare.Pusher(key);
    };
    return pusherWrapped = function(key, owner) {
      var Wrapped;
      Wrapped = function() {
        this.owner = owner;
        this.release = function() {
          return releasePusher(key, owner);
        };
        return this;
      };
      Wrapped.prototype = pusherInstance(key);
      return new Wrapped();
    };
  });

}).call(this);
(function() {
  var $, namespace,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __slice = [].slice;

  namespace = uploadcare.namespace, $ = uploadcare.jQuery;

  namespace('uploadcare.utils', function(utils) {
    var _ref;
    utils.Collection = (function() {
      function Collection(items) {
        var item, _i, _len;
        if (items == null) {
          items = [];
        }
        this.onAdd = $.Callbacks();
        this.onRemove = $.Callbacks();
        this.onReplaced = $.Callbacks();
        this.onSorted = $.Callbacks();
        this.__items = [];
        for (_i = 0, _len = items.length; _i < _len; _i++) {
          item = items[_i];
          this.add(item);
        }
      }

      Collection.prototype.add = function(item) {
        this.__items.push(item);
        return this.onAdd.fire(item);
      };

      Collection.prototype.remove = function(item) {
        if (utils.remove(this.__items, item)) {
          return this.onRemove.fire(item);
        }
      };

      Collection.prototype.clear = function() {
        var item, _i, _len, _ref, _results;
        _ref = this.get();
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          _results.push(this.remove(item));
        }
        return _results;
      };

      Collection.prototype.replace = function(oldItem, newItem) {
        var i, item, _i, _len, _ref, _results;
        if (oldItem !== newItem) {
          _ref = this.__items;
          _results = [];
          for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
            item = _ref[i];
            if (item === oldItem) {
              _results.push(this.__replace(oldItem, newItem, i));
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        }
      };

      Collection.prototype.__replace = function(oldItem, newItem, i) {
        this.__items[i] = newItem;
        return this.onReplaced.fire(oldItem, newItem, i);
      };

      Collection.prototype.sort = function(comparator) {
        this.__items.sort(comparator);
        return this.onSorted.fire();
      };

      Collection.prototype.get = function(index) {
        if (index != null) {
          return this.__items[index];
        } else {
          return this.__items.slice(0);
        }
      };

      Collection.prototype.length = function() {
        return this.__items.length;
      };

      return Collection;

    })();
    utils.UniqCollection = (function(_super) {
      __extends(UniqCollection, _super);

      function UniqCollection() {
        _ref = UniqCollection.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      UniqCollection.prototype.add = function(item) {
        if (__indexOf.call(this.__items, item) >= 0) {
          return;
        }
        return UniqCollection.__super__.add.apply(this, arguments);
      };

      UniqCollection.prototype.__replace = function(oldItem, newItem, i) {
        if (__indexOf.call(this.__items, newItem) >= 0) {
          return this.remove(oldItem);
        } else {
          return UniqCollection.__super__.__replace.apply(this, arguments);
        }
      };

      return UniqCollection;

    })(utils.Collection);
    return utils.CollectionOfPromises = (function(_super) {
      __extends(CollectionOfPromises, _super);

      function CollectionOfPromises() {
        this.onAnyDone = $.Callbacks();
        this.onAnyFail = $.Callbacks();
        this.onAnyProgress = $.Callbacks();
        this.onAnyProgress.add(function(item, firstArgument) {
          return $(item).data('lastProgress', firstArgument);
        });
        CollectionOfPromises.__super__.constructor.apply(this, arguments);
      }

      CollectionOfPromises.prototype.lastProgresses = function() {
        var item, _i, _len, _ref1, _results;
        _ref1 = this.__items;
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          item = _ref1[_i];
          _results.push($(item).data('lastProgress'));
        }
        return _results;
      };

      CollectionOfPromises.prototype.add = function(item) {
        if (!(item && item.done && item.fail && item.then)) {
          return;
        }
        CollectionOfPromises.__super__.add.apply(this, arguments);
        return this.__watchItem(item);
      };

      CollectionOfPromises.prototype.__watchItem = function(item) {
        var handler,
          _this = this;
        handler = function(callbacks) {
          return function() {
            var args;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            if (__indexOf.call(_this.__items, item) >= 0) {
              args.unshift(item);
              return callbacks.fire.apply(callbacks, args);
            }
          };
        };
        return item.then(handler(this.onAnyDone), handler(this.onAnyFail), handler(this.onAnyProgress));
      };

      CollectionOfPromises.prototype.__replace = function(oldItem, newItem, i) {
        if (!(newItem && newItem.done && newItem.fail && newItem.then)) {
          return this.remove(oldItem);
        } else {
          CollectionOfPromises.__super__.__replace.apply(this, arguments);
          return this.__watchItem(newItem);
        }
      };

      return CollectionOfPromises;

    })(utils.UniqCollection);
  });

}).call(this);
(function() {
  var namespace;

  namespace = uploadcare.namespace;

  namespace('uploadcare.utils', function(ns) {
    var common, messages;
    ns.log = function(msg) {
      if (window.console && console.log) {
        return console.log(msg);
      } else {

      }
    };
    ns.warn = function(msg) {
      if (window.console && console.warn) {
        return console.warn(msg);
      } else {
        return ns.log("Warning: " + msg);
      }
    };
    messages = {};
    ns.warnOnce = function(msg) {
      if (messages[msg] == null) {
        messages[msg] = true;
        return ns.warn(msg);
      }
    };
    common = {
      autostore: "You have enabled autostore in the widget, but not on the server.\nTo use autostore, make sure it's enabled in project settings.\n\nhttps://uploadcare.com/accounts/settings/",
      publicKey: "Global public key not set. Uploads may not work!\nAdd this to the <head> tag to set your key:\n\n<script>\nUPLOADCARE_PUBLIC_KEY = 'your_public_key';\n</script>"
    };
    return ns.commonWarning = function(name) {
      if (common[name] != null) {
        return ns.warnOnce(common[name]);
      }
    };
  });

}).call(this);
(function() {
  var $, namespace,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  namespace = uploadcare.namespace, $ = uploadcare.jQuery;

  namespace('uploadcare.utils', function(ns) {
    ns.unique = function(arr) {
      var item, result, _i, _len;
      result = [];
      for (_i = 0, _len = arr.length; _i < _len; _i++) {
        item = arr[_i];
        if (__indexOf.call(result, item) < 0) {
          result.push(item);
        }
      }
      return result;
    };
    ns.imageLoader = function(src) {
      var def;
      def = $.Deferred();
      $(new Image).on('load', def.resolve).on('error', def.reject).attr('src', src);
      return def.promise();
    };
    ns.defer = function(fn) {
      return setTimeout(fn, 0);
    };
    ns.gcd = function(a, b) {
      var c;
      while (b) {
        c = a % b;
        a = b;
        b = c;
      }
      return a;
    };
    ns.once = function(fn) {
      var called, result;
      called = false;
      result = null;
      return function() {
        if (!called) {
          result = fn.apply(this, arguments);
          called = true;
        }
        return result;
      };
    };
    ns.wrapToPromise = function(value) {
      return $.Deferred().resolve(value).promise();
    };
    ns.remove = function(array, item) {
      var index;
      index = $.inArray(item, array);
      if (index !== -1) {
        array.splice(index, 1);
        return true;
      } else {
        return false;
      }
    };
    ns.then = function(pr, doneFilter, failFilter, progressFilter) {
      var compose, df;
      df = $.Deferred();
      compose = function(fn1, fn2) {
        if (fn1 && fn2) {
          return function() {
            return fn2.call(this, fn1.apply(this, arguments));
          };
        } else {
          return fn1 || fn2;
        }
      };
      pr.then(compose(doneFilter, df.resolve), compose(failFilter, df.reject), compose(progressFilter, df.notify));
      return df.promise();
    };
    ns.bindAll = function(source, methods) {
      var target;
      target = {};
      $.each(methods, function(i, method) {
        var fn;
        fn = source[method];
        if ($.isFunction(fn)) {
          return target[method] = function() {
            var result;
            result = fn.apply(source, arguments);
            if (result === source) {
              return target;
            } else {
              return result;
            }
          };
        } else {
          return target[method] = fn;
        }
      });
      return target;
    };
    ns.upperCase = function(s) {
      return s.replace(/-/g, '_').toUpperCase();
    };
    ns.publicCallbacks = function(callbacks) {
      var result;
      result = callbacks.add;
      result.add = callbacks.add;
      result.remove = callbacks.remove;
      return result;
    };
    ns.uuid = function() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r, v;
        r = Math.random() * 16 | 0;
        v = c === 'x' ? r : r & 3 | 8;
        return v.toString(16);
      });
    };
    ns.splitUrlRegex = /^(?:([^:\/?#]+):)?(?:\/\/([^\/?\#]*))?([^?\#]*)\??([^\#]*)\#?(.*)$/;
    ns.uuidRegex = /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i;
    ns.groupIdRegex = new RegExp("" + ns.uuidRegex.source + "~[0-9]+", 'i');
    ns.cdnUrlRegex = new RegExp("^/?(" + ns.uuidRegex.source + ")(?:/(-/(?:[^/]+/)+)?([^/]*))?$", 'i');
    ns.splitCdnUrl = function(url) {
      return ns.cdnUrlRegex.exec(ns.splitUrlRegex.exec(url)[3]);
    };
    ns.escapeRegExp = function(str) {
      return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    };
    ns.globRegexp = function(str, flags) {
      var parts;
      if (flags == null) {
        flags = 'i';
      }
      parts = $.map(str.split('*'), ns.escapeRegExp);
      return new RegExp("^" + parts.join('.+') + "$", flags);
    };
    ns.normalizeUrl = function(url) {
      var parts, scheme;
      scheme = document.location.protocol;
      if (scheme !== 'http:') {
        scheme = 'https:';
      }
      parts = url.match(/^([^:/?#]+:)?\/?(\/)?/);
      if (!parts[1]) {
        if (parts[2]) {
          url = "" + scheme + url;
        } else if (!parts[0]) {
          url = "" + scheme + "//" + url;
        }
      }
      return url.replace(/\/+$/, '');
    };
    ns.fitText = function(text, max) {
      var head, tail;
      if (text.length > max) {
        head = Math.ceil((max - 3) / 2);
        tail = Math.floor((max - 3) / 2);
        return text.slice(0, head) + '...' + text.slice(-tail);
      } else {
        return text;
      }
    };
    ns.fitSizeInCdnLimit = function(objSize) {
      return ns.fitSize(objSize, [2048, 2048]);
    };
    ns.fitSize = function(objSize, boxSize, upscale) {
      var heightRation, widthRatio;
      if (objSize[0] > boxSize[0] || objSize[1] > boxSize[1] || upscale) {
        widthRatio = boxSize[0] / objSize[0];
        heightRation = boxSize[1] / objSize[1];
        if (!boxSize[0] || (boxSize[1] && widthRatio > heightRation)) {
          return [Math.round(heightRation * objSize[0]), boxSize[1]];
        } else {
          return [boxSize[0], Math.round(widthRatio * objSize[1])];
        }
      } else {
        return objSize.slice();
      }
    };
    ns.fileInput = function(container, settings, fn) {
      var accept, input, run;
      input = null;
      accept = settings.inputAcceptTypes;
      if (accept === '') {
        accept = settings.imagesOnly ? 'image/*' : null;
      }
      (run = function() {
        input = (settings.multiple ? $('<input type="file" multiple>') : $('<input type="file">')).attr('accept', accept).css({
          position: 'absolute',
          top: 0,
          opacity: 0,
          margin: 0,
          padding: 0,
          width: 'auto',
          height: 'auto',
          cursor: container.css('cursor')
        }).on('change', function() {
          fn(this);
          $(this).hide();
          return run();
        });
        return container.append(input);
      })();
      return container.css({
        position: 'relative',
        overflow: 'hidden'
      }).mousemove(function(e) {
        var left, top, width, _ref;
        _ref = $(this).offset(), left = _ref.left, top = _ref.top;
        width = input.width();
        return input.css({
          left: e.pageX - left - width + 10,
          top: e.pageY - top - 10
        });
      });
    };
    ns.fileSelectDialog = function(container, settings, fn) {
      var accept;
      accept = settings.inputAcceptTypes;
      if (accept === '') {
        accept = settings.imagesOnly ? 'image/*' : null;
      }
      return (settings.multiple ? $('<input type="file" multiple>') : $('<input type="file">')).attr('accept', accept).css({
        position: 'fixed',
        bottom: 0,
        opacity: 0
      }).on('change', function() {
        fn(this);
        return $(this).remove();
      }).appendTo(container).focus().click().hide();
    };
    ns.fileSizeLabels = 'B KB MB GB TB PB EB ZB YB'.split(' ');
    ns.readableFileSize = function(value, onNaN, prefix, postfix) {
      var digits, fixedTo, i, threshold;
      if (onNaN == null) {
        onNaN = '';
      }
      if (prefix == null) {
        prefix = '';
      }
      if (postfix == null) {
        postfix = '';
      }
      value = parseInt(value, 10);
      if (isNaN(value)) {
        return onNaN;
      }
      digits = 2;
      i = 0;
      threshold = 1000 - 5 * Math.pow(10, 2 - Math.max(digits, 3));
      while (value > threshold && i < ns.fileSizeLabels.length - 1) {
        i++;
        value /= 1024;
      }
      value += 0.000000000000001;
      fixedTo = Math.max(0, digits - Math.floor(value).toFixed(0).length);
      value = Number(value.toFixed(fixedTo));
      return "" + prefix + value + " " + ns.fileSizeLabels[i] + postfix;
    };
    ns.imagePath = function(name) {
      return uploadcare.settings.common().scriptBase + '/images/' + name;
    };
    ns.ajaxDefaults = {
      dataType: 'json',
      crossDomain: true,
      cache: false
    };
    ns.jsonp = function(url, type, data) {
      if ($.isPlainObject(type)) {
        data = type;
        type = 'GET';
      }
      return $.ajax($.extend({
        url: url,
        type: type,
        data: data
      }, ns.ajaxDefaults)).then(function(data) {
        var text;
        if (data.error) {
          text = data.error.content || data.error;
          ns.warn("JSONP error: " + text + " while loading " + url);
          return $.Deferred().reject(text);
        } else {
          return data;
        }
      }, function(_, textStatus, errorThrown) {
        var text;
        text = "" + textStatus + " (" + errorThrown + ")";
        ns.warn("JSONP unexpected error: " + text + " while loading " + url);
        return text;
      });
    };
    ns.plugin = function(fn) {
      return fn(uploadcare);
    };
    return ns.canvasToBlob = function(canvas, type, quality, callback) {
      var arr, binStr, dataURL, i, _i, _ref;
      if (HTMLCanvasElement.prototype.toBlob) {
        return canvas.toBlob(callback, type, quality);
      }
      dataURL = canvas.toDataURL(type, quality);
      dataURL = dataURL.split(',');
      binStr = atob(dataURL[1]);
      arr = new Uint8Array(binStr.length);
      for (i = _i = 0, _ref = binStr.length; _i < _ref; i = _i += 1) {
        arr[i] = binStr.charCodeAt(i);
      }
      return callback(new Blob([arr], {
        type: /:(.+\/.+);/.exec(dataURL[0])[1]
      }));
    };
  });

}).call(this);
(function() {
  var $, expose, namespace, utils,
    __hasProp = {}.hasOwnProperty,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  expose = uploadcare.expose, namespace = uploadcare.namespace, utils = uploadcare.utils, $ = uploadcare.jQuery;

  namespace('uploadcare.settings', function(ns) {
    var arrayOptions, defaults, flagOptions, intOptions, key, normalize, parseCrop, presets, publicDefaults, str2arr, urlOptions, value, waitForSettingsCb;
    defaults = {
      'live': true,
      'manual-start': false,
      'locale': null,
      'locale-pluralize': null,
      'locale-translations': null,
      'system-dialog': false,
      'crop': 'disabled',
      'preview-step': false,
      'images-only': false,
      'clearable': false,
      'multiple': false,
      'multiple-max': 0,
      'multiple-min': 1,
      'path-value': false,
      'tabs': 'file camera url facebook gdrive dropbox instagram evernote flickr skydrive',
      'preferred-types': '',
      'input-accept-types': '',
      'autostore': false,
      'public-key': null,
      'pusher-key': '79ae88bd931ea68464d9',
      'cdn-base': 'http://www.ucarecdn.com',
      'url-base': 'https://upload.uploadcare.com',
      'social-base': 'https://social.uploadcare.com',
      'script-base': typeof SCRIPT_BASE !== "undefined" && SCRIPT_BASE !== null ? SCRIPT_BASE : ''
    };
    presets = {
      'tabs': {
        all: 'file camera url facebook gdrive dropbox instagram evernote flickr skydrive box vk',
        "default": defaults.tabs
      }
    };
    str2arr = function(value) {
      if (!$.isArray(value)) {
        value = $.trim(value);
        value = value ? value.split(' ') : [];
      }
      return value;
    };
    arrayOptions = function(settings, keys) {
      var item, key, source, value, _i, _j, _len, _len1;
      for (_i = 0, _len = keys.length; _i < _len; _i++) {
        key = keys[_i];
        value = source = str2arr(settings[key]);
        if (presets.hasOwnProperty(key)) {
          value = [];
          for (_j = 0, _len1 = source.length; _j < _len1; _j++) {
            item = source[_j];
            if (presets[key].hasOwnProperty(item)) {
              value = value.concat(str2arr(presets[key][item]));
            } else {
              value.push(item);
            }
          }
        }
        settings[key] = utils.unique(value);
      }
      return settings;
    };
    urlOptions = function(settings, keys) {
      var key, _i, _len;
      for (_i = 0, _len = keys.length; _i < _len; _i++) {
        key = keys[_i];
        if (settings[key] != null) {
          settings[key] = utils.normalizeUrl(settings[key]);
        }
      }
      return settings;
    };
    flagOptions = function(settings, keys) {
      var key, value, _i, _len;
      for (_i = 0, _len = keys.length; _i < _len; _i++) {
        key = keys[_i];
        if (!(settings[key] != null)) {
          continue;
        }
        value = settings[key];
        if ($.type(value) === 'string') {
          value = $.trim(value).toLowerCase();
          settings[key] = !(value === 'false' || value === 'disabled');
        } else {
          settings[key] = !!value;
        }
      }
      return settings;
    };
    intOptions = function(settings, keys) {
      var key, _i, _len;
      for (_i = 0, _len = keys.length; _i < _len; _i++) {
        key = keys[_i];
        if (settings[key] != null) {
          settings[key] = parseInt(settings[key]);
        }
      }
      return settings;
    };
    parseCrop = function(val) {
      var ratio, reRatio;
      reRatio = /^([0-9]+)([x:])([0-9]+)\s*(|upscale|minimum)$/i;
      ratio = reRatio.exec($.trim(val.toLowerCase())) || [];
      return {
        downscale: ratio[2] === 'x',
        upscale: !!ratio[4],
        notLess: ratio[4] === 'minimum',
        preferedSize: ratio.length ? [+ratio[1], +ratio[3]] : void 0
      };
    };
    normalize = function(settings) {
      arrayOptions(settings, ['tabs', 'preferredTypes']);
      urlOptions(settings, ['cdnBase', 'socialBase', 'urlBase', 'scriptBase']);
      flagOptions(settings, ['autostore', 'imagesOnly', 'multiple', 'clearable', 'pathValue', 'previewStep', 'systemDialog']);
      intOptions(settings, ['multipleMax', 'multipleMin']);
      if (!$.isArray(settings.crop)) {
        if (/^(disabled?|false|null)$/i.test(settings.crop) || settings.multiple) {
          settings.crop = false;
        } else if ($.isPlainObject(settings.crop)) {
          settings.crop = [settings.crop];
        } else {
          settings.crop = $.map(settings.crop.split(','), parseCrop);
        }
      }
      if (settings.crop || settings.multiple) {
        settings.previewStep = true;
      }
      if (settings.crop) {
        settings.pathValue = true;
      }
      if (!utils.abilities.sendFileAPI) {
        settings.systemDialog = false;
      }
      if (settings.validators) {
        settings.validators = settings.validators.slice();
      }
      return settings;
    };
    publicDefaults = {};
    for (key in defaults) {
      if (!__hasProp.call(defaults, key)) continue;
      value = defaults[key];
      publicDefaults[$.camelCase(key)] = value;
    }
    expose('defaults', publicDefaults);
    ns.globals = utils.once(function() {
      var fallback, values;
      values = {};
      for (key in defaults) {
        if (!__hasProp.call(defaults, key)) continue;
        fallback = defaults[key];
        value = window["UPLOADCARE_" + (utils.upperCase(key))];
        values[$.camelCase(key)] = value !== void 0 ? value : fallback;
      }
      if (!values.publicKey) {
        utils.commonWarning('publicKey');
      }
      return normalize(values);
    });
    ns.common = utils.once(function(settings) {
      var result;
      result = normalize($.extend({}, ns.globals(), settings || {}));
      waitForSettingsCb.fire(result);
      return result;
    });
    ns.build = function(settings) {
      return normalize($.extend({}, ns.common(), settings || {}));
    };
    waitForSettingsCb = $.Callbacks("once memory");
    ns.waitForSettings = function(settings, fn) {
      return waitForSettingsCb.add(function(common) {
        return fn(normalize($.extend({}, common, settings || {})));
      });
    };
    ns.CssCollector = (function() {
      function CssCollector() {
        this.urls = [];
        this.styles = [];
      }

      CssCollector.prototype.addUrl = function(url) {
        if (!/^https?:\/\//i.test(url)) {
          throw new Error('Embedded urls should be absolute. ' + url);
        }
        if (__indexOf.call(this.urls, url) < 0) {
          return this.urls.push(url);
        }
      };

      CssCollector.prototype.addStyle = function(style) {
        return this.styles.push(style);
      };

      return CssCollector;

    })();
    return uploadcare.tabsCss = new ns.CssCollector;
  });

}).call(this);
(function() {
  uploadcare.namespace('uploadcare.locale.translations', function(ns) {
    return ns.da = {
      uploading: 'Uploader... Vent venligst.',
      loadingInfo: 'Henter information...',
      errors: {
        "default": 'Fejl',
        baddata: 'Forkert værdi',
        size: 'Filen er for stor',
        upload: 'Kan ikke uploade / sende fil',
        user: 'Upload fortrudt',
        info: 'Kan ikke hente information',
        image: 'Kun billeder er tilladt',
        createGroup: 'Kan ikke oprette fil gruppe',
        deleted: 'Filen blev slettet'
      },
      draghere: 'Drop en fil her',
      file: {
        one: '%1 fil',
        other: '%1 filer'
      },
      buttons: {
        cancel: 'Annuller',
        remove: 'Fjern',
        choose: {
          files: {
            one: 'Vælg en fil',
            other: 'Vælg filer'
          },
          images: {
            one: 'Vælg et billede',
            other: 'Vælg billeder'
          }
        }
      },
      dialog: {
        done: 'Færdig',
        showFiles: 'Vis filer',
        tabs: {
          names: {
            preview: 'Vis',
            file: 'Komputer',
            gdrive: 'Google Drev',
            url: 'Direkte link'
          },
          file: {
            drag: 'Drop en fil her',
            nodrop: 'Hent filer fra din komputer',
            or: 'eller',
            button: 'Hent fil fra din komputer',
            also: 'Du kan også hente fra'
          },
          url: {
            title: 'Filer fra en Web adresse',
            line1: 'Vælg en fil fra en web adresse.',
            line2: 'Skriv bare linket til filen.',
            input: 'Indsæt link her...',
            button: 'Upload / Send'
          },
          preview: {
            unknownName: 'ukendt',
            change: 'Annuller',
            back: 'Tilbage',
            done: 'Fortsæt',
            unknown: {
              title: 'Uploader / sender... Vent for at se mere.',
              done: 'Fortsæt uden at vente på resultat'
            },
            regular: {
              title: 'Tilføje fil?',
              line1: 'Du er ved at tilføje filen ovenfor.',
              line2: 'Venligst accepter.'
            },
            image: {
              title: 'Tilføj billede?',
              change: 'Annuller'
            },
            crop: {
              title: 'Beskær og tilføj dette billede',
              done: 'Udfør'
            },
            error: {
              "default": {
                title: 'Hov!',
                text: 'Noget gik galt under upload.',
                back: 'Venligst prøv igen'
              },
              image: {
                title: 'Du kan kun vælge billeder.',
                text: 'Prøv igen med en billedfil.',
                back: 'Vælg billede'
              },
              size: {
                title: 'Den fil du valgte, er desværre større end tilladt.',
                text: 'Venligst prøv med en mindre fil.'
              },
              loadImage: {
                title: 'Fejl',
                text: 'Kan ikke åbne billede'
              }
            },
            multiple: {
              title: 'Du har valgt %files% filer',
              question: 'Vil du tilføje alle disse filer?',
              tooManyFiles: 'Du har valgt for mange filer. %max% er maximum.',
              tooFewFiles: 'Du har valgt %files% filer. Men du skal vælge mindst %min%.',
              clear: 'Fjern alle',
              done: 'Fortsæt'
            }
          }
        },
        footer: {
          text: 'Uploader gemmer og behandler filer ved hjælp af'
        }
      }
    };
  });

  uploadcare.namespace('uploadcare.locale.pluralize', function(ns) {
    return ns.da = function(n) {
      if (n === 1) {
        return 'one';
      }
      return 'other';
    };
  });

}).call(this);
(function() {
  uploadcare.namespace('uploadcare.locale.translations', function(ns) {
    return ns.de = {
      uploading: 'Hochladen... Bitte warten.',
      loadingInfo: 'Laden der Informationen...',
      errors: {
        "default": 'Error',
        baddata: 'Falscher Wert',
        size: 'Datei zu groß',
        upload: 'Kann nicht hochgeladen werden',
        user: 'Hochladen abgebrochen',
        info: 'Informationen können nicht geladen werden',
        image: 'Nur Bilder sind erlaubt',
        createGroup: 'Datei-Gruppe kann nicht erstellt werden',
        deleted: 'Datei wurde gelöscht'
      },
      draghere: 'Ziehen Sie eine Datei hier hinein',
      file: {
        one: '%1 Datei',
        other: '%1 Dateien'
      },
      buttons: {
        cancel: 'Abbrechen',
        remove: 'Löschen',
        choose: {
          files: {
            one: 'Wählen Sie eine Datei',
            other: 'Wählen Sie die Dateien'
          },
          images: {
            one: 'Wählen Sie ein Bild',
            other: 'Wählen Sie Bilder'
          }
        }
      },
      dialog: {
        done: 'Fertig',
        showFiles: 'Dateien anzeigen',
        tabs: {
          names: {
            preview: 'Vorschau',
            file: 'Lokale Dateien',
            facebook: 'Facebook',
            dropbox: 'Dropbox',
            gdrive: 'Google Drive',
            instagram: 'Instagram',
            vk: 'VK',
            evernote: 'Evernote',
            box: 'Box',
            skydrive: 'OneDrive',
            flickr: 'Flickr',
            url: 'Web-Links'
          },
          file: {
            drag: 'Ziehen Sie eine Datei hier hinein',
            nodrop: 'Laden Sie Dateien von Ihrem PC hoch',
            cloudsTip: 'Cloud Speicher<br>und soziale Dienste',
            or: 'oder',
            button: 'Wählen Sie eine lokale Datei',
            also: 'Sie köhnen es auch wählen von'
          },
          url: {
            title: 'Dateien vom Web',
            line1: 'Holen Sie sich irgendeine Datei vom Web.',
            line2: 'Geben Sie einfach den Link an.',
            input: 'Bitte geben Sie den Link hier an...',
            button: 'Hochladen'
          },
          preview: {
            unknownName: 'nicht bekannt',
            change: 'Abbrechen',
            back: 'Zurück',
            done: 'Hinzufügen',
            unknown: {
              title: 'Hochladen... Bitte warten Sie auf die Vorschau.',
              done: 'Vorschau überspringen und Datei annehmen'
            },
            regular: {
              title: 'Diese Datei hinzufügen?',
              line1: 'Diese Datei wird nun hinzugefügt.',
              line2: 'Bitte bestätigen Sie.'
            },
            image: {
              title: 'Dieses Bild hinzufügen?',
              change: 'Abbrechen'
            },
            crop: {
              title: 'Dieses Bild beschneiden und hinzufügen',
              done: 'Fertig',
              free: 'frei'
            },
            error: {
              "default": {
                title: 'Oops!',
                text: 'Etwas ist während dem Hochladen schief gelaufen.',
                back: 'Bitte versuchen Sie es erneut'
              },
              image: {
                title: 'Nur Bilder sind akzeptiert.',
                text: 'Bitte veruschen Sie es erneut mit einer anderen Datei.',
                back: 'Bild wählen'
              },
              size: {
                title: 'Die gewählte Datei überschreitet das Limit.',
                text: 'Bitte veruschen Sie es erneut mit einer anderen Datei.'
              },
              loadImage: {
                title: 'Fehler',
                text: 'Das Bild kann nicht geladen werden'
              }
            },
            multiple: {
              title: 'Sie haben %files% Dateien gewählt',
              question: 'Möchten Sie all diese Datein hinzufügen?',
              tooManyFiles: 'Sie haben zu viele Dateien gewählt. %max% ist das Maximum.',
              tooFewFiles: 'Sie haben %files% Dateien. Es sind mindestens %min% nötig.',
              clear: 'Alle löschen',
              done: 'Fertig'
            }
          }
        },
        footer: {
          text: 'Hochladen, Speichern und Verarbeitung der Dateien durch',
          link: 'Uploadcare.com'
        }
      }
    };
  });

  uploadcare.namespace('uploadcare.locale.pluralize', function(ns) {
    return ns.de = function(n) {
      if (n === 1) {
        return 'one';
      }
      return 'other';
    };
  });

}).call(this);
(function() {
  uploadcare.namespace('uploadcare.locale.translations', function(ns) {
    return ns.en = {
      uploading: 'Uploading... Please wait.',
      loadingInfo: 'Loading info...',
      errors: {
        "default": 'Error',
        baddata: 'Incorrect value',
        size: 'File too big',
        upload: 'Can’t upload',
        user: 'Upload canceled',
        info: 'Can’t load info',
        image: 'Only images allowed',
        createGroup: 'Can’t create file group',
        deleted: 'File was deleted'
      },
      draghere: 'Drop a file here',
      file: {
        one: '%1 file',
        other: '%1 files'
      },
      buttons: {
        cancel: 'Cancel',
        remove: 'Remove',
        choose: {
          files: {
            one: 'Choose a file',
            other: 'Choose files'
          },
          images: {
            one: 'Choose an image',
            other: 'Choose images'
          }
        }
      },
      dialog: {
        done: 'Done',
        showFiles: 'Show files',
        tabs: {
          names: {
            preview: 'Preview',
            file: 'Local Files',
            facebook: 'Facebook',
            dropbox: 'Dropbox',
            gdrive: 'Google Drive',
            instagram: 'Instagram',
            vk: 'VK',
            evernote: 'Evernote',
            box: 'Box',
            skydrive: 'OneDrive',
            flickr: 'Flickr',
            url: 'Arbitrary Links',
            camera: 'Camera'
          },
          file: {
            drag: 'Drop a file here',
            nodrop: 'Upload files from your computer',
            cloudsTip: 'Cloud storages<br>and social services',
            or: 'or',
            button: 'Choose a local file',
            also: 'You can also choose it from'
          },
          url: {
            title: 'Files from the Web',
            line1: 'Grab any file off the web.',
            line2: 'Just provide the link.',
            input: 'Paste your link here...',
            button: 'Upload'
          },
          camera: {
            capture: 'Take a photo',
            mirror: 'Mirror',
            retry: 'Request permissions again',
            pleaseAllow: {
              title: 'Please allow access to your camera',
              text: 'You have been prompted to allow camera access from this site. ' + 'In order to take pictures with your camera you must approve this request.'
            },
            notFound: {
              title: 'No camera detected',
              text: 'Looks like you have no camera connected to this device.'
            }
          },
          preview: {
            unknownName: 'unknown',
            change: 'Cancel',
            back: 'Back',
            done: 'Add',
            unknown: {
              title: 'Uploading... Please wait for a preview.',
              done: 'Skip preview and accept'
            },
            regular: {
              title: 'Add this file?',
              line1: 'You are about to add the file above.',
              line2: 'Please confirm.'
            },
            image: {
              title: 'Add this image?',
              change: 'Cancel'
            },
            crop: {
              title: 'Crop and add this image',
              done: 'Done',
              free: 'free'
            },
            error: {
              "default": {
                title: 'Oops!',
                text: 'Something went wrong during the upload.',
                back: 'Please try again'
              },
              image: {
                title: 'Only image files are accepted.',
                text: 'Please try again with another file.',
                back: 'Choose image'
              },
              size: {
                title: 'The file you selected exceeds the limit.',
                text: 'Please try again with another file.'
              },
              loadImage: {
                title: 'Error',
                text: 'Can’t load image'
              }
            },
            multiple: {
              title: 'You’ve chosen %files%',
              question: 'Do you want to add all of these files?',
              tooManyFiles: 'You’ve chosen too many files. %max% is maximum.',
              tooFewFiles: 'You’ve chosen %files%. At least %min% required.',
              clear: 'Remove all',
              done: 'Done'
            }
          }
        },
        footer: {
          text: 'Uploading, storing and processing files by',
          link: 'Uploadcare.com'
        }
      }
    };
  });

  uploadcare.namespace('uploadcare.locale.pluralize', function(ns) {
    return ns.en = function(n) {
      if (n === 1) {
        return 'one';
      }
      return 'other';
    };
  });

}).call(this);
(function() {
  uploadcare.namespace('uploadcare.locale.translations', function(ns) {
    return ns.es = {
      uploading: 'Subiendo... Por favor espere.',
      loadingInfo: 'Cargando Información...',
      errors: {
        "default": 'Error',
        baddata: 'Valor incorrecto',
        size: 'Demasiado grande',
        upload: 'No se ha podido subir',
        user: 'Subida cancelada',
        info: 'No se pudo cargar la información',
        image: 'Sólo se permiten imagenes'
      },
      draghere: 'Arrastra los archivos hasta aquí',
      file: {
        one: '%1 archivo',
        other: '%1 archivos'
      },
      buttons: {
        cancel: 'Cancelar',
        remove: 'Eliminar'
      },
      dialog: {
        tabs: {
          names: {
            preview: 'Avance',
            file: 'Computadora',
            url: 'Una dirección cualquiera'
          },
          file: {
            drag: 'Arrastra una archivo aquí',
            nodrop: 'Sube fotos desde tu computadora',
            or: 'o',
            button: 'Elige un archivo desde tu computadora',
            also: 'Tambien puedes seleccionarlo de'
          },
          url: {
            title: 'Archivos de la web',
            line1: 'Selecciona cualquier archivo de la web.',
            line2: 'Sólo danos el link.',
            input: 'Copia tu link aquí...',
            button: 'Subir'
          },
          preview: {
            unknownName: 'desconocido',
            change: 'Cancelar',
            back: 'Atras',
            done: 'Subir',
            unknown: {
              title: 'Subiendo. Por favor espera para una vista previa.',
              done: 'Saltar vista previa y aceptar'
            },
            regular: {
              title: '¿Quieres subir este archivo?',
              line1: 'Estás por subir el archivo de arriba.',
              line2: 'Confirma por favor.'
            },
            image: {
              title: '¿Quieres subir esta imagen?',
              change: 'Cancelar'
            },
            crop: {
              title: 'Cortar y subir esta imagen',
              done: 'Listo'
            },
            error: {
              "default": {
                title: 'La subida falló',
                line1: 'Algo salio mal durante la subida.',
                line2: 'Por favor, trata de nuevo.'
              },
              image: {
                title: 'Sólo imagenes',
                line1: 'Sólo se aceptan archivos de imagenes.',
                line2: 'Por favor, trata de nuevo con otro archivo.'
              },
              size: {
                title: 'Límite de tamaño',
                line1: 'El archivo que has seleccinado sobrepasa el límite de los 100MB.',
                line2: 'Por favor trata de nuevo con otro archivo.'
              },
              loadImage: {
                title: 'Error',
                text: 'No se pudo cargar la imangen'
              }
            }
          }
        },
        footer: {
          text: 'Los archivos ha sido subidos, gestionados y procesados por'
        }
      }
    };
  });

  uploadcare.namespace('uploadcare.locale.pluralize', function(ns) {
    return ns.es = function(n) {
      if (n === 1) {
        return 'one';
      }
      return 'other';
    };
  });

}).call(this);
(function() {
  uploadcare.namespace('uploadcare.locale.translations', function(ns) {
    return ns.fr = {
      uploading: 'Envoi en cours... Merci de patientier.',
      loadingInfo: 'Chargement des informations...',
      errors: {
        "default": 'Erreur',
        baddata: 'Valeur incorrecte',
        size: 'Fichier trop volumineux',
        upload: 'Envoi impossible',
        user: 'Envoi annulé',
        info: 'Impossible de charger les informations',
        image: 'Seules les images sont autorisées',
        createGroup: 'Création d\'1 groupe impossible',
        deleted: 'Le fichier a été supprimé'
      },
      draghere: 'Glissez-déposez un fichier ici',
      file: {
        one: '%1 fichier',
        other: '%1 fichiers'
      },
      buttons: {
        cancel: 'Annuler',
        remove: 'Supprimer',
        choose: {
          files: {
            one: 'Sélectionner un fichier',
            other: 'Sélectionner des fichiers'
          },
          images: {
            one: 'Sélectionner une image',
            other: 'Sélectionner des images'
          }
        }
      },
      dialog: {
        done: 'Terminer',
        showFiles: 'Voir les fichiers',
        tabs: {
          names: {
            preview: 'Avant-première',
            file: 'Fichier en local',
            url: 'Une adresse web'
          },
          file: {
            drag: 'Glissez-déposez un fichier ici',
            nodrop: 'Envoyez des fichiers depuis votre ordinateur',
            cloudsTip: 'Stockage sur le cloud<br>et réseaux sociaux',
            or: 'ou',
            button: 'Choisir un fichier local',
            also: 'Vous pouvez également le sélectionner depuis'
          },
          url: {
            title: 'Fichiers depuis le Web',
            line1: 'Prenez n\'importe quel fichier depuis un site web.',
            line2: 'Saisissez simplement son adresse.',
            input: 'Collez le lien ici...',
            button: 'Envoi'
          },
          preview: {
            unknownName: 'inconnu',
            change: 'Annuler',
            back: 'Retour',
            done: 'Ajouter',
            unknown: {
              title: 'Envoi en cours... Merci de patientier pour prévisualiser.',
              done: 'Passer la prévisualisation et accepter'
            },
            regular: {
              title: 'Ajouter ce fichier ?',
              line1: 'Vous êtes sur le point d\'ajouter le fichier ci-dessus.',
              line2: 'Merci de confirmer.'
            },
            image: {
              title: 'Ajouter cette image ?',
              change: 'Annuler'
            },
            crop: {
              title: 'Recadrer et ajouter cette image',
              done: 'Terminer',
              free: 'libre'
            },
            error: {
              "default": {
                title: 'Oups!',
                text: 'Quelque chose n\'a pas fonctionné pendant l\'envoi.',
                back: 'Merci de bien vouloir recommencer'
              },
              image: {
                title: 'Seules les images sont acceptées.',
                text: 'Merci de bien vouloir recommencer avec un autre fichier.',
                back: 'Choisir une image'
              },
              size: {
                title: 'Le fichier sélectionné est trop volumineux.',
                text: 'Merci de bien vouloir recommencer avec un autre fichier.'
              },
              loadImage: {
                title: 'Erreur',
                text: 'Impossible de charger l\'image'
              }
            },
            multiple: {
              title: 'Vous avez choisi %files%',
              question: 'Voulez vous ajouter tous ces fichiers ?',
              clear: 'Tout retirer',
              done: 'Terminer'
            }
          }
        },
        footer: {
          text: 'Envoi, stockage et traitement des fichiers par'
        }
      }
    };
  });

  uploadcare.namespace('uploadcare.locale.pluralize', function(ns) {
    return ns.fr = function(n) {
      if (n === 1) {
        return 'one';
      }
      return 'other';
    };
  });

}).call(this);
(function() {
  uploadcare.namespace('uploadcare.locale.translations', function(ns) {
    return ns.he = {
      uploading: 'טוען... אנא המתן.',
      loadingInfo: 'טוען מידע...',
      errors: {
        "default": 'שגיאה',
        baddata: 'ערך שגוי',
        size: 'קובץ גדול מידי',
        upload: 'לא ניתן להעלות',
        user: 'העלאה בוטלה',
        info: 'לא ניתן לטעון מידע',
        image: 'ניתן להעלות רק תמונות',
        createGroup: 'לא ניתן ליצור קבוצה',
        deleted: 'הקובץ נמחק'
      },
      draghere: 'שחרר כאן קובץ',
      file: {
        one: 'קובץ %1',
        other: '%1 קבצים'
      },
      buttons: {
        cancel: 'ביטול',
        remove: 'הסר',
        choose: {
          files: {
            one: 'בחר קובץ',
            other: 'בחר קבצים'
          },
          images: {
            one: 'בחר תמונה',
            other: 'בחר תמונות'
          }
        }
      },
      dialog: {
        done: 'סיום',
        showFiles: 'הצג קבצים',
        tabs: {
          names: {
            facebook: 'פייסבוק',
            dropbox: 'דרופבוקס',
            gdrive: 'כונן גוגל',
            instagram: 'אינסטגרם',
            url: 'לינק מהאינטרנט'
          },
          file: {
            drag: 'שחרר כאן קובץ',
            nodrop: 'העלה קבצים מהמחשב',
            or: 'או',
            button: 'בחר קובץ מהמחשב',
            also: 'ניתן לבחור גם מ'
          },
          url: {
            title: 'קובץ מהאינטרנט',
            line1: 'גרור קובץ מהאינטרנט',
            line2: 'ספק את כתובת הקובץ',
            input: 'הדבק את כתובת הקובץ...',
            button: 'העלה'
          },
          preview: {
            unknownName: 'לא ידוע',
            change: 'ביטול',
            back: 'חזרה',
            done: 'הוסף',
            unknown: {
              title: 'מעלה... נא המתן לתצוגה מקדימה.',
              done: 'דלג על תצוגה מקדימה'
            },
            regular: {
              title: 'להוסיף קובץ זה?',
              line1: 'קובץ זה יועלה',
              line2: 'נא אשר.'
            },
            image: {
              title: 'להוסיף תמונה זו?',
              change: 'ביטול'
            },
            crop: {
              title: 'חתוך והוסף תמונה זו',
              done: 'סיום'
            },
            error: {
              "default": {
                title: 'אופס!',
                text: 'משהו השתבש בזמן ההעלאה.',
                back: 'נא נסה שוב'
              },
              image: {
                title: 'ניתן לקבל רק קבצי תמונות.',
                text: 'נא נסה שוב עם קובץ אחר.',
                back: 'בחר תמונה'
              },
              size: {
                title: 'הקובץ שבחרת חורג מהגבול.',
                text: 'נא נסה שוב עם קובץ אחר.'
              },
              loadImage: {
                title: 'שגיאה',
                text: 'טעינת התמונה נכשלה'
              }
            },
            multiple: {
              title: 'בחרת %files%',
              question: 'אתה מעוניין להוסיף את כל הקבצים האלו?',
              tooManyFiles: 'בחרת יותר מידי קבצים. יש לבחור מקסימום %max% קבצים.',
              tooFewFiles: 'בחרת %files%. יש לבחור לפחות %min%.',
              clear: 'הסר הכל',
              done: 'סיום'
            }
          }
        },
        footer: {
          text: 'העלאה, מיון ועיבוד קבצים על ידי'
        }
      }
    };
  });

  uploadcare.namespace('uploadcare.locale.pluralize', function(ns) {
    return ns.he = function(n) {
      if (n === 1) {
        return 'one';
      }
      return 'other';
    };
  });

}).call(this);
(function() {
  uploadcare.namespace('uploadcare.locale.translations', function(ns) {
    return ns.ja = {
      uploading: 'アップロードしています… 完了までお待ち下さい。',
      loadingInfo: '読み込み中…',
      errors: {
        "default": 'エラー',
        baddata: '間違った値',
        size: 'ファイルが大きすぎます',
        upload: 'アップロードできませんでした',
        user: 'アップロードがキャンセルされました',
        info: '読み込みに失敗しました',
        image: 'アップロードできるのは画像ファイルのみです',
        createGroup: 'グループの作成に失敗しました',
        deleted: '削除されたファイルです'
      },
      draghere: 'ここにファイルをドロップ',
      file: {
        other: '%1ファイル'
      },
      buttons: {
        cancel: 'キャンセル',
        remove: '削除',
        choose: {
          files: {
            one: 'ファイルを選択',
            other: 'ファイルを選択'
          },
          images: {
            one: '画像を選択',
            other: '画像を選択'
          }
        }
      },
      dialog: {
        done: '完了',
        showFiles: 'ファイルを表示',
        tabs: {
          names: {
            preview: 'プレビュー',
            file: 'ローカルファイル',
            facebook: 'Facebook',
            dropbox: 'Dropbox',
            gdrive: 'Google Drive',
            instagram: 'Instagram',
            vk: 'VK',
            evernote: 'Evernote',
            box: 'Box',
            skydrive: 'OneDrive',
            flickr: 'Flickr',
            url: 'URLを直接入力'
          },
          file: {
            drag: 'ここにファイルをドロップ',
            nodrop: 'ファイルを選択してアップロード',
            cloudsTip: 'クラウドストレージ<br>およびソーシャルサービス',
            or: 'もしくは',
            button: 'ローカルのファイルを選択',
            also: '次からも選択可能です：'
          },
          url: {
            title: 'ウェブ上のファイル',
            line1: 'ウェブ上からファイルを取得します。',
            line2: 'URLを入力してください。',
            input: 'ここにURLを貼り付けしてください…',
            button: 'アップロード'
          },
          preview: {
            unknownName: '不明なファイル',
            change: 'キャンセル',
            back: '戻る',
            done: '追加',
            unknown: {
              title: 'アップロードしています… プレビューの表示をお待ちください。',
              done: 'プレビューの確認をスキップして完了'
            },
            regular: {
              title: 'このファイルを追加しますか？',
              line1: 'こちらのファイルを追加しようとしています。',
              line2: '確認してください。'
            },
            image: {
              title: 'この画像を追加しますか？',
              change: 'キャンセル'
            },
            crop: {
              title: '画像の切り取りと追加',
              done: '完了',
              free: 'リセット'
            },
            error: {
              "default": {
                title: '失敗しました',
                text: 'アップロード中に不明なエラーが発生しました。',
                back: 'もう一度お試し下さい'
              },
              image: {
                title: '画像ファイルのみ許可されています',
                text: '他のファイルで再度お試し下さい。',
                back: '画像を選択'
              },
              size: {
                title: 'ファイルサイズが大きすぎます。',
                text: '他のファイルで再度お試し下さい。'
              },
              loadImage: {
                title: 'エラー',
                text: '画像のロードに失敗しました。'
              }
            },
            multiple: {
              title: '%files%つのファイルを選択中',
              question: 'これら全てのファイルを追加しますか？',
              tooManyFiles: '選択ファイルが多すぎます。%max%つ以下にしてください。',
              tooFewFiles: '選択ファイルが少なすぎます。%files%つ選択中です。少なくとも%min%つ選択してください。',
              clear: '全て削除',
              done: '完了'
            }
          }
        },
        footer: {
          text: '画像のアップロード、保存および加工の提供：',
          link: 'Uploadcare.com'
        }
      }
    };
  });

  uploadcare.namespace('uploadcare.locale.pluralize', function(ns) {
    return ns.ja = function(n) {
      return 'other';
    };
  });

}).call(this);
(function() {
  uploadcare.namespace('uploadcare.locale.translations', function(ns) {
    return ns.lv = {
      uploading: 'Augšupielādē... Lūdzu, gaidiet.',
      errors: {
        "default": 'Kļūda',
        image: 'Atļauti tikai attēli'
      },
      draghere: 'Velciet failus šeit',
      file: {
        zero: '%1 failu',
        one: '%1 fails',
        other: '%1 faili'
      },
      buttons: {
        cancel: 'Atcelt',
        remove: 'Dzēst'
      },
      dialog: {
        title: 'Ielādēt jebko no jebkurienes',
        poweredby: 'Darbināts ar',
        support: {
          images: 'Attēli',
          audio: 'Audio',
          video: 'Video',
          documents: 'Dokumenti'
        },
        tabs: {
          file: {
            title: 'Mans dators',
            line1: 'Paņemiet jebkuru failu no jūsu datora.',
            line2: 'Izvēlēties ar dialogu vai ievelciet iekšā.',
            button: 'Meklēt failus'
          },
          url: {
            title: 'Faili no tīmekļa',
            line1: 'Paņemiet jebkuru failu no tīmekļa.',
            line2: 'Tikai uzrādiet linku.',
            input: 'Ielīmējiet linku šeit...',
            button: 'Ielādēt'
          }
        }
      }
    };
  });

  uploadcare.namespace('uploadcare.locale.pluralize', function(ns) {
    return ns.lv = function(n) {
      if (n === 0) {
        return 'zero';
      }
      if ((n % 10 === 1) && (n % 100 !== 11)) {
        return 'one';
      }
      return 'other';
    };
  });

}).call(this);
(function() {
  uploadcare.namespace('uploadcare.locale.translations', function(ns) {
    return ns.nb = {
      uploading: 'Laster opp... Vennligst vent.',
      loadingInfo: 'Laster inn info...',
      errors: {
        "default": 'Feil',
        baddata: 'Ugyldig verdi',
        size: 'Filen er for stor',
        upload: 'Kan ikke laste opp',
        user: 'Opplasting avbrutt',
        info: 'Kan ikke laste inn info',
        image: 'Kun bilder er tillatt',
        createGroup: 'Kan ikke opprette filgruppe',
        deleted: 'Filen er slettet'
      },
      draghere: 'Dra en fil hit',
      file: {
        one: '%1 fil',
        other: '%1 filer'
      },
      buttons: {
        cancel: 'Avbryt',
        remove: 'Fjern',
        choose: {
          files: {
            one: 'Velg en fil',
            other: 'Velg filer'
          },
          images: {
            one: 'Velg et bilde',
            other: 'Velg bilder'
          }
        }
      },
      dialog: {
        done: 'Ferdig',
        showFiles: 'Vis filer',
        tabs: {
          names: {
            preview: 'Forhåndsvising',
            file: 'Lokale filer',
            facebook: 'Facebook',
            dropbox: 'Dropbox',
            gdrive: 'Google Disk',
            instagram: 'Instagram',
            vk: 'VK',
            evernote: 'Evernote',
            box: 'Box',
            skydrive: 'OneDrive',
            flickr: 'Flickr',
            url: 'Direktelink'
          },
          file: {
            drag: 'Dra og slipp en fil her',
            nodrop: 'Last opp filer fra datamaskinen',
            cloudsTip: 'Skylagring<br>og sosiale tjenester',
            or: 'eller',
            button: 'Velg en lokal fil',
            also: 'Du kan også velge det fra'
          },
          url: {
            title: 'Filer fra internett',
            line1: 'Velg hvilken som helst fil fra internett.',
            line2: 'Bare gi oss linken.',
            input: 'Lim inn linken her...',
            button: 'Last opp'
          },
          preview: {
            unknownName: 'ukjent',
            change: 'Avbryt',
            back: 'Tilbake',
            done: 'Legg til',
            unknown: {
              title: 'Laster opp... Vennligst vent på forhåndsvisning.',
              done: 'Hopp over forhåndsvisning og godkjenn'
            },
            regular: {
              title: 'Legge til denne filen?',
              line1: 'Filen legges nå til.',
              line2: 'Vennligst bekreft.'
            },
            image: {
              title: 'Legge til dette bildet?',
              change: 'Avbryt'
            },
            crop: {
              title: 'Kutt og legg til dette bildet',
              done: 'Ferdig',
              free: 'frigjør'
            },
            error: {
              "default": {
                title: 'Ops!',
                text: 'Noe gikk galt under opplastingen.',
                back: 'Vennligst prøv igjen'
              },
              image: {
                title: 'Kun bilder er akseptert.',
                text: 'Prøv igjen med en annen fil.',
                back: 'Velg bilde'
              },
              size: {
                title: 'Den valgte filen overskrider tilatt størrelse.',
                text: 'Vennligst prøv igjen med en annen fil.'
              },
              loadImage: {
                title: 'Feil',
                text: 'Kan ikke laste bildet'
              }
            },
            multiple: {
              title: 'Du har valgt %files%',
              question: 'Ønsker du å legge til alle filene?',
              tooManyFiles: 'Du har valgt for mange filer. %max% er maksimum.',
              tooFewFiles: 'Du har valgt %files%. Minimum %min% er påkrevd.',
              clear: 'Fjern alle',
              done: 'Ferdig'
            }
          }
        },
        footer: {
          text: 'Laster opp, lagrer og prosesserer filer med'
        }
      }
    };
  });

  uploadcare.namespace('uploadcare.locale.pluralize', function(ns) {
    return ns.nb = function(n) {
      if (n === 1) {
        return 'one';
      }
      return 'other';
    };
  });

}).call(this);
(function() {
  uploadcare.namespace('uploadcare.locale.translations', function(ns) {
    return ns.nl = {
      uploading: 'Uploaden... Even geduld.',
      loadingInfo: 'Laden informatie...',
      errors: {
        "default": 'Fout',
        baddata: 'Ongeldige waarde',
        size: 'Bestand is te groot',
        upload: 'Kan niet uploaden',
        user: 'Upload geannulleerd',
        info: 'Kan informatie niet laden',
        image: 'Alleen afbeeldingen toegestaan',
        createGroup: 'Kan bestandsgroep niet maken',
        deleted: 'Bestand is verwijderd'
      },
      draghere: 'Drop hier een bestand',
      file: {
        one: '%1 bestand',
        other: '%1 bestanden'
      },
      buttons: {
        cancel: 'Annuleren',
        remove: 'Verwijderen',
        choose: {
          files: {
            one: 'Kies een bestand',
            other: 'Kies bestanden'
          },
          images: {
            one: 'Kies een afbeelding',
            other: 'Kies afbeeldingen'
          }
        }
      },
      dialog: {
        done: 'Klaar',
        showFiles: 'Toon bestanden',
        tabs: {
          names: {
            preview: 'Voorvertoning',
            file: 'Computer',
            url: 'Directe links'
          },
          file: {
            drag: 'Drop een bestand hier',
            nodrop: 'Upload bestanden van je computer',
            or: 'of',
            button: 'Selecteer een bestand van je computer',
            also: 'Je kan ook selecteren van'
          },
          url: {
            title: 'Bestanden van het web',
            line1: 'Selecteer een bestand van het web.',
            line2: 'Voer de link in.',
            input: 'Plak de link hier...',
            button: 'Upload'
          },
          preview: {
            unknownName: 'onbekend',
            change: 'Annuleren',
            back: 'Terug',
            done: 'Toevoegen',
            unknown: {
              title: 'Uploaden... Wacht op de voorvertoning.',
              done: 'Voorvertoning overslaan an accepteren'
            },
            regular: {
              title: 'Dit bestand toevoegen?',
              line1: 'Je staat op het punt bovenstaand bestand toe te voegen.',
              line2: 'Bevestig.'
            },
            image: {
              title: 'Voeg deze afbeelding toe?',
              change: 'Annuleren'
            },
            crop: {
              title: 'Afbeelding bijknippen en toevoegen',
              done: 'Klaar'
            },
            error: {
              "default": {
                title: 'Oeps!',
                text: 'Er is een fout opgetreden tijdens het uploaden.',
                back: 'Probeer het nog eens'
              },
              image: {
                title: 'Alleen afbeeldingen worden geaccepteerd.',
                text: 'Probeer het nog eens met een andere bestand.',
                back: 'Selecteer afbeelding'
              },
              size: {
                title: 'Het geselecteerd bestand is groter dan de limiet.',
                text: 'Probeer het nog eens met een andere bestand.'
              },
              loadImage: {
                title: 'Fout',
                text: 'Kan afbeelding niet laden'
              }
            },
            multiple: {
              title: 'U heeft de volgende bestanden geselecteerd %files%',
              question: 'Wilt u al deze bestanden toevoegen?',
              tooManyFiles: 'U heeft teveel bestanden geselecteerd. %max% is het maximum.',
              tooFewFiles: 'U heeft de volgende bestanden geselecteerd %files%. Minimaal %min% is verplicht.',
              clear: 'Verwijder alle bestanden',
              done: 'Klaar'
            }
          }
        },
        footer: {
          text: 'Uploaden, opslaan en verwerken bestanden door'
        }
      }
    };
  });

  uploadcare.namespace('uploadcare.locale.pluralize', function(ns) {
    return ns.nl = function(n) {
      if (n === 1) {
        return 'one';
      }
      return 'other';
    };
  });

}).call(this);
(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  uploadcare.namespace('uploadcare.locale.translations', function(ns) {
    return ns.pl = {
      uploading: 'Przesyłanie... Proszę czekać.',
      errors: {
        "default": 'Błąd'
      },
      draghere: 'Upuść plik tutaj',
      buttons: {
        cancel: 'Anuluj',
        remove: 'Usuń'
      },
      dialog: {
        tabs: {
          file: {
            title: 'Mój komputer'
          },
          url: {
            title: 'Pliki z sieci'
          }
        }
      }
    };
  });

  uploadcare.namespace('uploadcare.locale.pluralize', function(ns) {
    return ns.pl = function(n) {
      var _ref, _ref1, _ref2, _ref3;
      if (n === 1) {
        return 'one';
      }
      if ((_ref = n % 10, __indexOf.call([2, 3, 4], _ref) >= 0) && (_ref1 = n % 100, __indexOf.call([12, 13, 14], _ref1) < 0)) {
        return 'few';
      }
      if ((n !== 1) && ((_ref2 = n % 10, __indexOf.call([2, 3, 4], _ref2) < 0) || (_ref3 = n % 100, __indexOf.call([12, 13, 14], _ref3) >= 0))) {
        return 'many';
      }
      return 'other';
    };
  });

}).call(this);
(function() {
  uploadcare.namespace('uploadcare.locale.translations', function(ns) {
    return ns.pt = {
      uploading: 'Fazendo upload... Aguarde.',
      loadingInfo: 'Carregando informações...',
      errors: {
        "default": 'Erro',
        baddata: 'Valor incorreto',
        size: 'Arquivo muito grande',
        upload: 'Não foi possível fazer o upload',
        user: 'Upload cancelado',
        info: 'Não foi possível carregar as informações',
        image: 'Apenas imagens são permitidas',
        createGroup: 'Não foi possível criar o grupo de arquivos',
        deleted: 'O arquivo foi excluído'
      },
      draghere: 'Arraste um arquivo para cá',
      file: {
        one: '%1 arquivo',
        other: '%1 arquivos'
      },
      buttons: {
        cancel: 'Cancelar',
        remove: 'Excluir',
        choose: {
          files: {
            one: 'Escolha um arquivo',
            other: 'Escolha arquivos'
          },
          images: {
            one: 'Escolha um imagem',
            other: 'Escolha imagens'
          }
        }
      },
      dialog: {
        done: 'OK',
        showFiles: 'Mostrar arquivos',
        tabs: {
          names: {
            preview: 'Pré-estréia',
            file: 'Computador',
            url: 'Link da web'
          },
          file: {
            drag: 'Arraste um arquivo para cá',
            nodrop: 'Faça upload de arquivos do seu computador',
            or: 'ou',
            button: 'Escolha um arquivo do computador',
            also: 'Você também pode escolher arquivos de'
          },
          url: {
            title: 'Arquivos da web',
            line1: 'Faça upload de qualquer arquivo da web.',
            line2: 'Apenas informe o link.',
            input: 'Cole seu link aqui...',
            button: 'Upload'
          },
          preview: {
            unknownName: 'desconhecido',
            change: 'Cancelar',
            back: 'Voltar',
            done: 'Adicionar',
            unknown: {
              title: 'Fazendo upload... Aguarde o preview.',
              done: 'Pular preview e aceitar'
            },
            regular: {
              title: 'Adicionar esse arquivo?',
              line1: 'Você está prestes a adicionar o arquivo acima.',
              line2: 'Por favor, confirme.'
            },
            image: {
              title: 'Adicionar essa imagem?',
              change: 'Cancelar'
            },
            crop: {
              title: 'Cortar e adicionar essa imagem',
              done: 'OK',
              free: 'livre'
            },
            error: {
              "default": {
                title: 'Oops!',
                text: 'Alguma coisa deu errado durante o upload.',
                back: 'Por favor, tente novamente'
              },
              image: {
                title: 'Apenas arquivos de imagem são aceitos.',
                text: 'Por favor, tente novamente com outro arquivo.',
                back: 'Escolher a imagem'
              },
              size: {
                title: 'O arquivo que você escolheu excede o limite.',
                text: 'Por favor, tente novamente com outro arquivo.'
              },
              loadImage: {
                title: 'Erro',
                text: 'Não foi possível carregar a imagem'
              }
            },
            multiple: {
              title: 'Você escolheu',
              question: 'Você quer adicionar todos esses arquivos?',
              clear: 'Excluir todos',
              done: 'OK'
            }
          }
        },
        footer: {
          text: 'Upload, armazenamento e processamento dos arquivos feito por'
        }
      }
    };
  });

  uploadcare.namespace('uploadcare.locale.pluralize', function(ns) {
    return ns.pt = function(n) {
      if (n === 1) {
        return 'one';
      }
      return 'other';
    };
  });

}).call(this);
(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  uploadcare.namespace('uploadcare.locale.translations', function(ns) {
    return ns.ru = {
      uploading: 'Идет загрузка',
      loadingInfo: 'Загрузка информации...',
      errors: {
        "default": 'Ошибка',
        baddata: 'Некорректные данные',
        size: 'Слишком большой файл',
        upload: 'Ошибка при загрузке',
        user: 'Загрузка прервана',
        info: 'Ошибка при загрузке информации',
        image: 'Разрешены только изображения',
        createGroup: 'Не удалось создать группу файлов',
        deleted: 'Файл удалён'
      },
      draghere: 'Перетащите файл сюда',
      file: {
        one: '%1 файл',
        few: '%1 файла',
        many: '%1 файлов',
        other: '%1 файла'
      },
      buttons: {
        cancel: 'Отмена',
        remove: 'Удалить',
        choose: {
          files: {
            one: 'Выбрать файл',
            other: 'Выбрать файлы'
          },
          images: {
            one: 'Выбрать изображение',
            other: 'Выбрать изображения'
          }
        }
      },
      dialog: {
        done: 'Готово',
        showFiles: 'Показать файлы',
        tabs: {
          names: {
            preview: 'Предпросмотр',
            file: 'Локальные файлы',
            vk: 'ВКонтакте',
            url: 'Произвольная ссылка',
            camera: 'Камера'
          },
          file: {
            drag: 'Перетащите файл сюда',
            nodrop: 'Загрузка файлов с вашего компьютера',
            cloudsTip: 'Облачные хранилища<br>и социальные сервисы',
            or: 'или',
            button: 'Выберите локальный файл',
            also: 'Вы также можете загрузить файлы, используя:'
          },
          url: {
            title: 'Файлы с других сайтов',
            line1: 'Загрузите любой файл из сети.',
            line2: '',
            input: 'Укажите здесь ссылку...',
            button: 'Загрузить'
          },
          camera: {
            capture: 'Сделать снимок',
            mirror: 'Отразить',
            retry: 'Повторно запросить разрешение',
            pleaseAllow: {
              title: 'Пожалуйста, разрешите доступ к камере',
              text: 'Для того, чтобы сделать снимок, мы запросили разрешение ' + 'на доступ к камере с этого сайта.'
            },
            notFound: {
              title: 'Камера не найдена',
              text: 'Скорее всего камера не подключена или не настроена.'
            }
          },
          preview: {
            unknownName: 'неизвестно',
            change: 'Отмена',
            back: 'Назад',
            done: 'Добавить',
            unknown: {
              title: 'Загрузка... Пожалуйста подождите.',
              done: 'Пропустить предварительный просмотр'
            },
            regular: {
              title: 'Загрузить этот файл?',
              line1: 'Вы собираетесь добавить этот файл:',
              line2: 'Пожалуйста, подтвердите.'
            },
            image: {
              title: 'Добавить это изображение?',
              change: 'Отмена'
            },
            crop: {
              title: 'Обрезать и добавить это изображение',
              done: 'Готово',
              free: 'произв.'
            },
            error: {
              "default": {
                title: 'Ой!',
                text: 'Что-то пошло не так во время загрузки.',
                back: 'Пожалуйста, попробуйте ещё раз'
              },
              image: {
                title: 'Можно загружать только изображения.',
                text: 'Попробуйте загрузить другой файл.',
                back: 'Выберите изображение'
              },
              size: {
                title: 'Размер выбранного файла превышает лимит.',
                text: 'Попробуйте загрузить другой файл.'
              },
              loadImage: {
                title: 'Ошибка',
                text: 'Изображение не удалось загрузить'
              }
            },
            multiple: {
              title: 'Вы выбрали %files%',
              question: 'Вы хотите добавить все эти файлы?',
              tooManyFiles: 'Вы выбрали слишком много файлов. %max% максимум.',
              tooFewFiles: 'Вы выбрали %files%. Нужно не меньше %min%.',
              clear: 'Удалить все',
              done: 'Готово'
            }
          }
        },
        footer: {
          text: 'Для загрузки, хранения и обработки файлов используется'
        }
      }
    };
  });

  uploadcare.namespace('uploadcare.locale.pluralize', function(ns) {
    return ns.ru = function(n) {
      var _ref, _ref1, _ref2, _ref3;
      if ((n % 10 === 1) && (n % 100 !== 11)) {
        return 'one';
      }
      if ((_ref = n % 10, __indexOf.call([2, 3, 4], _ref) >= 0) && (_ref1 = n % 100, __indexOf.call([12, 13, 14], _ref1) < 0)) {
        return 'few';
      }
      if ((n % 10 === 0) || (_ref2 = n % 10, __indexOf.call([5, 6, 7, 8, 9], _ref2) >= 0) || (_ref3 = n % 100, __indexOf.call([11, 12, 13, 14], _ref3) >= 0)) {
        return 'many';
      }
      return 'other';
    };
  });

}).call(this);
(function() {
  uploadcare.namespace('uploadcare.locale.translations', function(ns) {
    return ns.tr = {
      uploading: 'Yükleniyor... Lütfen bekleyin.',
      loadingInfo: 'Bilgiler yükleniyor...',
      errors: {
        "default": 'Hata',
        baddata: 'Geçersiz değer',
        size: 'Dosya çok büyük',
        upload: 'Yüklenemedi',
        user: 'Yükleme iptal edildi',
        info: 'Bilgiler getirilemedi',
        image: 'Sadece resim dosyası yüklenebilir',
        createGroup: 'Dosya grubu yaratılamıyor',
        deleted: 'Dosya silinmiş'
      },
      draghere: 'Buraya bir dosya bırakın',
      file: {
        other: '%1 dosya'
      },
      buttons: {
        cancel: 'İptal',
        remove: 'Kaldır',
        choose: {
          files: {
            one: 'Dosya Seçin',
            other: 'Dosya Seçin'
          },
          images: {
            one: 'Resim Dosyası Seçin',
            other: 'Resim Dosyası Seçin'
          }
        }
      },
      dialog: {
        done: 'Bitti',
        showFiles: 'Dosyaları Göster',
        tabs: {
          names: {
            preview: 'Önizleme',
            file: 'Bilgisayar',
            url: 'Dış Bağlantılar'
          },
          file: {
            drag: 'Braya bir dosya bakın',
            nodrop: 'Bilgisayarınızdan dosya yükleyin',
            or: 'or',
            button: 'Bilgisayardan bir dosya seç',
            also: 'Diğer yükleme seçenekleri'
          },
          url: {
            title: 'Webden dosyalar',
            line1: 'Webden herhangi bir dosya seçin.',
            line2: 'Dosya bağlantısını sağlayın.',
            input: 'Bağlantınızı buraya yapıştırın...',
            button: 'Yükle'
          },
          preview: {
            unknownName: 'bilinmeyen',
            change: 'İptal',
            back: 'Geri',
            done: 'Ekle',
            unknown: {
              title: 'Yükleniyor... Önizleme için lütfen bekleyin.',
              done: 'Önizlemeyi geç ve kabul et'
            },
            regular: {
              title: 'Bu dosya eklensin mi?',
              line1: 'Yukarıdaki dosyayı eklemek üzeresiniz.',
              line2: 'Lütfen onaylayın.'
            },
            image: {
              title: 'Bu görsel eklensin mi?',
              change: 'İptal'
            },
            crop: {
              title: 'Bu görseli kes ve ekle',
              done: 'Bitti'
            },
            error: {
              "default": {
                title: 'Aman!',
                text: 'Yükleme sırasında bir hata oluştu.',
                back: 'Lütfen tekrar deneyin.'
              },
              image: {
                title: 'Sadece resim dosyaları kabul edilmektedir.',
                text: 'Lütfen başka bir dosya ile tekrar deneyin.',
                back: 'Resim dosyası seç'
              },
              size: {
                title: 'Seçtiğiniz dosya limitleri aşıyor.',
                text: 'Lütfen başka bir dosya ile tekrar deneyin.'
              },
              loadImage: {
                title: 'Hata',
                text: 'Resim dosyası yüklenemedi'
              }
            },
            multiple: {
              title: '%files% dosya seçtiniz',
              question: 'Bu dosyaların hepsini eklemek istiyor musunuz?',
              tooManyFiles: 'Fazla sayıda dosya seçtiniz, en fazla %max% dosya olabilir.',
              tooFewFiles: '%files% dosya seçtiniz, en az %min% dosya olmalıdır.',
              clear: 'Hepsini kaldır',
              done: 'Bitti'
            }
          }
        },
        footer: {
          text: 'Dosya yükleme, saklama ve işleme servisi'
        }
      }
    };
  });

  uploadcare.namespace('uploadcare.locale.pluralize', function(ns) {
    return ns.tr = function(n) {
      return 'other';
    };
  });

}).call(this);
(function() {
  uploadcare.namespace('uploadcare.locale.translations', function(ns) {
    return ns.zh = {
      uploading: '上传中...请等待',
      loadingInfo: '正在读取信息...',
      errors: {
        "default": '错误',
        baddata: '错误数据',
        size: '文件太大',
        upload: '无法上传',
        user: '上传被取消',
        info: '无法读取信息',
        image: '只允许图形文件',
        createGroup: '无法建立文件组',
        deleted: '文件已被删除'
      },
      draghere: '拖放文件到这里',
      file: {
        other: '%1 个文件'
      },
      buttons: {
        cancel: '取消',
        remove: '删除'
      },
      dialog: {
        done: '完成',
        showFiles: '显示文件',
        tabs: {
          names: {
            url: '任意图片链接'
          },
          file: {
            drag: '拖放文件到这里',
            nodrop: '从你的电脑中上传',
            or: '或者',
            button: '从电脑中选取文件',
            also: '你也可以选自'
          },
          url: {
            title: '来自互联网的文件',
            line1: '从互联网选取文件',
            line2: '只需提供链接',
            input: '将链接拷贝至此...',
            button: '上传'
          },
          preview: {
            unknownName: '未知',
            change: '取消',
            back: '返回',
            done: '添加',
            unknown: {
              title: '上传中...请等待预览',
              done: '跳过预览，直接接受'
            },
            regular: {
              title: '添加这个文件?',
              line1: '你将添加上面的文件。',
              line2: '请确认。'
            },
            image: {
              title: '添加这个图片?',
              change: '取消'
            },
            crop: {
              title: '剪裁并添加这个图片',
              done: '完成'
            },
            error: {
              "default": {
                title: '错误!',
                text: '上传过程中出错。',
                back: '请重试'
              },
              image: {
                title: '只允许上传图片文件。',
                text: '请选择其他文件重新上传。',
                back: '选择图片'
              },
              size: {
                title: '你选取的文件超过了100MB的上限',
                text: '请用另一个文件再试一次。'
              },
              loadImage: {
                title: '错误',
                text: '无法读取图片'
              }
            },
            multiple: {
              title: '你已经选择 %files%',
              question: '你要添加所有文件吗？',
              tooManyFiles: '你选了太多的文件. 最多可选择%max%. 请删除一些。',
              clear: '清空',
              done: '完成'
            }
          }
        },
        footer: {
          text: '为您提供文件上传、存储和编辑功能。 Copyright ©'
        }
      }
    };
  });

  uploadcare.namespace('uploadcare.locale.pluralize', function(ns) {
    return ns.zh = function() {
      return 'other';
    };
  });

}).call(this);
(function() {
  var $, namespace, s, utils;

  namespace = uploadcare.namespace, utils = uploadcare.utils, s = uploadcare.settings, $ = uploadcare.jQuery;

  namespace('uploadcare.locale', function(ns) {
    var build, defaultLang, defaults, translate, _build;
    defaultLang = 'en';
    defaults = {
      lang: defaultLang,
      translations: ns.translations[defaultLang],
      pluralize: ns.pluralize[defaultLang]
    };
    _build = function(settings) {
      var lang, pluralize, translations;
      lang = settings.locale || defaults.lang;
      translations = $.extend(true, {}, ns.translations[lang], settings.localeTranslations);
      pluralize = $.isFunction(settings.localePluralize) ? settings.localePluralize : ns.pluralize[lang];
      return {
        lang: lang,
        translations: translations,
        pluralize: pluralize
      };
    };
    build = utils.once(function() {
      return _build(s.build());
    });
    ns.rebuild = function(settings) {
      var result;
      result = _build(s.build(settings));
      return build = function() {
        return result;
      };
    };
    translate = function(key, node) {
      var path, subkey, _i, _len;
      path = key.split('.');
      for (_i = 0, _len = path.length; _i < _len; _i++) {
        subkey = path[_i];
        if (node == null) {
          return null;
        }
        node = node[subkey];
      }
      return node;
    };
    return ns.t = function(key, n) {
      var locale, value, _ref;
      locale = build();
      value = translate(key, locale.translations);
      if ((value == null) && locale.lang !== defaults.lang) {
        locale = defaults;
        value = translate(key, locale.translations);
      }
      if (n != null) {
        if (locale.pluralize != null) {
          value = ((_ref = value[locale.pluralize(n)]) != null ? _ref.replace('%1', n) : void 0) || n;
        } else {
          value = '';
        }
      }
      return value || '';
    };
  });

}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["uploadcare/templates/circle-text"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="uploadcare-widget-circle-back">\n  <div class="uploadcare-widget-circle-text" role="uploadcare-circle-text"></div>\n</div>\n');}return __p.join('');};
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["uploadcare/templates/dialog"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="uploadcare-dialog uploadcare-responsive-panel"><!--\n--><div class="uploadcare-dialog-inner-wrap">\n    <div class="uploadcare-dialog-close">×</div>\n    <div class="uploadcare-dialog-placeholder"></div>\n  </div>\n</div>\n');}return __p.join('');};
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["uploadcare/templates/panel"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="uploadcare-dialog-panel">\n  <div class="uploadcare-dialog-tabs"></div>\n</div>\n<div class="uploadcare-dialog-footer">\n  ',(''+ t('dialog.footer.text') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\n  <a href="https://uploadcare.com/" target="_blank">',(''+ t('dialog.footer.link') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</a>\n</div>\n');}return __p.join('');};
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["uploadcare/templates/source-tab-base"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div \n  class="uploadcare-dialog-source-base-wrap" \n  role="uploadcare-dialog-source-base-wrap"\n></div>\n\n<div class="uploadcare-dialog-inner-footer uploadcare-dialog-source-base-footer">\n  <div class="uploadcare-dialog-button"\n       role="uploadcare-dialog-source-base-show-files">\n    ',(''+ t('dialog.showFiles') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\n    <div class="uploadcare-dialog-source-base-counter"></div>\n  </div>\n  <div\n    class="uploadcare-dialog-button-success" \n    role="uploadcare-dialog-source-base-done">',(''+ t('dialog.done') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\n  <div \n    class="uploadcare-dialog-inner-footer-text"\n    role="uploadcare-dialog-source-base-footer-text"\n  ></div>\n</div>\n');}return __p.join('');};
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["uploadcare/templates/styles"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('\n\n\n\n\n\n\n.uploadcare-dialog-tab:before,.uploadcare-dialog-tab:hover:before,.uploadcare-dialog-disabled-tab:hover:before{background-image:url("',  utils.imagePath('tab-icons.png') ,'");background-size:50px}.uploadcare-dialog-tab_current:before,.uploadcare-dialog-tab_current:hover:before{background-image:url("',  utils.imagePath('tab-icons-active.png') ,'");background-size:50px}.uploadcare-crop-widget .jcrop-vline,.uploadcare-crop-widget .jcrop-hline{background-image:url(data:image/gif;base64,R0lGODlhCAAIAPABAAAAAKqqqiH/C05FVFNDQVBFMi4wAwEAAAAh+QQJCgABACwAAAAACAAIAAACDYQRGadrzVRMB9FZ5SwAIfkECQoAAQAsAAAAAAgACAAAAg8MDqGYaudeW9ChyOyltQAAIfkECQoAAQAsAAAAAAgACAAAAg9MgGCXm+rQYtC0WGl9oQAAIfkECQoAAQAsAAAAAAgACAAAAg+MgWCRernaYmjCWLF7qAAAIfkECQoAAQAsAAAAAAgACAAAAg2MAwmna81UTAfRWeUsACH5BAkKAAEALAAAAAAIAAgAAAIPRB6gmGrnXlvQocjspbUAACH5BAkKAAEALAAAAAAIAAgAAAIPBIJhl5vq0GLQtFhpfaAAACH5BAUKAAEALAAAAAAIAAgAAAIPhINhkHq52mJowlixe6gAADs=)}.uploadcare-dialog-file-sources:before{background-image:url("',  utils.imagePath('arrow.png') ,'")}.uploadcare-dpm-file-remove{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAQAAAAngNWGAAABM0lEQVQoz5VTvW7CMBC2kHivQsjrZGRjaB6lXWCJbWScIT8PYN0GQ7s6FUUKL8CA2suR2C4FlfqkyL77cuf7/B1jbp3GdmIW1VIVKq9ezMI+ncbs92omNeeQgYQ1msQdh5o30x+g82ibCAysr4yDgG1yHjngLhkyXVuXeZcMRSNJMI4mAwinGl2siaiFWncOAW/QgO4vwCGHD/QI2tca27LxEDrAF7QE5fg94ungfrMxM89ZXyqnYAsbtG53RM/lKhmYlJUr6XrUPbQlmHY8SChXTBUhHRsCXfKGdKmCKe2PApQDKmokAJavD5b2zei+hTvNDPQI+HR5PD3C0+MJf4c95vCE79ETEI5POPvzCWf/EwXJbH5XZvNAZqSh6U3hRjc0jqMQmxRHoVRltTSpjcNR+AZwwvykEau0BgAAAABJRU5ErkJggg==)}.uploadcare-dpm-file-error:before{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAABIklEQVR42q3Vv2rCUBTHcaEQH825TdLl9hl0FsFdV7s5uXSpb+DoEziV6JCgATdR02D9E09/R64KF3NPbQx84BJOvgRyuSktK5VbHHiFDwhhCwl86Xu+nimZbsWeYQIkmMCLLfgELaA7tfSzRlCISVEz6AEV5J2DDszyBtNGg7L5/CSt123BGBwOKqA8WRzT+cqmU+kt3zj4aQ0myTW4WEjBPgcj29B+NLoE98OhFIw4+GMb2vR6l+Cm25WCWw6ubUPftRrR8XiSVKt/CgZADxKJH2XlurQbDBivxY8ibpu02SR98VrcNuLGXitFh/GYDkHAa2ljlznIfKCCfPNwaBeItfOOr84/Yu/m8WVy7zhgPfHE1hxQ0IcQdlqo76m8X8Avwkyxg4iIuCEAAAAASUVORK5CYII=)}.uploadcare-dpm-file-preview{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAQAAAAngNWGAAABD0lEQVQoFQXBPa5OARQF0LXPvfKS9wo/hegMQUzEJESiUIpOoxOlRKJDIgqVUZiNqPGdba0AAPLj48Mn/8ApgEcPOAGArx/uPVvrEFVRA04A+PTu+vk1BlSwLuAE4Pubvy+vHGAFxABOgC+v/ryO24oYUVUDGODzi+PtjfuuXBBUxG8XASd8e3rz/o5rY60YwVjXKAj8/HXrblDFIAKCehxOOHcxCggWUTHghJYqIqIigoqCEyCKEcXFgAjghCAWi1EDIlgwABWxoIhYaxUMsIo4BEHBRR1ggMMogoqq4jCAgVo1VhGMgFjACQUjCKIqIigYqKiLILiogFULBkbUWhSDqKpYMFAFwaJGUVUH+A8ToG9OM8KqQQAAAABJRU5ErkJggg==)}.uploadcare-dialog-error-tab-illustration{background-image:url("',  utils.imagePath('error-default.png') ,'")}.uploadcare-dialog-camera-holder .uploadcare-dialog-error-tab-illustration,.uploadcare-dialog-error-tab-image .uploadcare-dialog-error-tab-illustration{background-image:url("',  utils.imagePath('error-image.png') ,'")}.uploadcare-dialog{background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQIHWMw/AQAAVcBJCiBozgAAAAASUVORK5CYII=);background:rgba(48,48,48,0.7)}@media(-webkit-min-device-pixel-ratio:1.5),(min-resolution:144dpi){.uploadcare-dialog-tab:before,.uploadcare-dialog-tab:hover:before,.uploadcare-dialog-disabled-tab:hover:before{background-image:url("',  utils.imagePath('tab-icons@2x.png') ,'")}.uploadcare-dialog-tab_current:before,.uploadcare-dialog-tab_current:hover:before{background-image:url("',  utils.imagePath('tab-icons-active@2x.png') ,'")}}html.uploadcare-dialog-opened{overflow:hidden}.uploadcare-dialog{font-family:"Helvetica Neue",Helvetica,Arial,"Lucida Grande",sans-serif;position:fixed;top:0;left:0;width:100%;height:100%;z-index:10000;overflow:auto;white-space:nowrap;text-align:center}.uploadcare-dialog:before{display:inline-block;vertical-align:middle;content:\'\';height:100%;position:static;width:0}.uploadcare-dialog *{margin:0;padding:0}.uploadcare-dialog .uploadcare-dialog-panel{border-radius:8px;-webkit-box-shadow:0 1px 2px rgba(0,0,0,0.35);-moz-box-shadow:0 1px 2px rgba(0,0,0,0.35);box-shadow:0 1px 2px rgba(0,0,0,0.35)}.uploadcare-dialog{-webkit-transition:opacity .25s cubic-bezier(0.05,0.7,0.25,1);-moz-transition:opacity .25s cubic-bezier(0.05,0.7,0.25,1);transition:opacity .25s cubic-bezier(0.05,0.7,0.25,1);opacity:0}.uploadcare-dialog .uploadcare-dialog-inner-wrap{-webkit-transition:-webkit-transform .25s cubic-bezier(0.05,0.7,0.25,1);-moz-transition:-moz-transform .25s cubic-bezier(0.05,0.7,0.25,1);transition:transform .25s cubic-bezier(0.05,0.7,0.25,1);-webkit-transform:scale(0.8);-moz-transform:scale(0.8);transform:scale(0.8);-webkit-transform-origin:50% 100%;-moz-transform-origin:50% 100%;transform-origin:50% 100%}.uploadcare-dialog.uploadcare-active{opacity:1}.uploadcare-dialog.uploadcare-active .uploadcare-dialog-inner-wrap{-webkit-transform:none;-moz-transform:none;transform:none}.uploadcare-dialog-inner-wrap{display:inline-block;vertical-align:middle;white-space:normal;text-align:left;-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;position:relative;width:100%;min-width:760px;max-width:944px;padding:0 33px 0 11px}.uploadcare-dialog-close{width:33px;height:33px;line-height:33px;font-size:29.7px;font-weight:bold;color:#fff;cursor:pointer;position:absolute;text-align:center;right:0}.uploadcare-dialog-panel{overflow:hidden;position:relative;background:#efefef;font-weight:normal}.uploadcare-dialog-tabs{-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;width:75px;height:616px;float:left;background:#dee0e1;border-right:1px solid #c5cace}.uploadcare-dialog-tab{-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;height:56px;position:relative;border-bottom:1px solid #c5cace;cursor:pointer}.uploadcare-dialog-tab .uploadcare-dialog-icon,.uploadcare-dialog-tab:before{-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;position:absolute;top:50%;left:50%;display:inline-block;width:50px;height:50px;margin:-25px;opacity:.66}.uploadcare-dialog-tab:before{content:\'\'}.uploadcare-dialog-tab:hover{background-color:#e5e7e8}.uploadcare-dialog-tab:hover .uploadcare-dialog-icon{opacity:1}.uploadcare-dialog-tab:hover:before{opacity:1}.uploadcare-dialog-tab_current{margin-right:-1px;border-right:1px solid #efefef}.uploadcare-dialog-tab_current,.uploadcare-dialog-tab_current:hover{background-color:#efefef}.uploadcare-dialog-tab_current .uploadcare-dialog-icon{opacity:1}.uploadcare-dialog-tab_current:before{opacity:1}.uploadcare-dialog-tab_hidden{display:none!important}.uploadcare-dialog-disabled-tab{cursor:default}.uploadcare-dialog-disabled-tab:hover{background-color:#dee0e1}.uploadcare-dialog-tab-preview .uploadcare-widget-circle{padding:10px}.uploadcare-dialog-tab-preview .uploadcare-widget-circle--canvas{color:#828689;border-color:#bfbfbf}.uploadcare-dialog-tab-preview.uploadcare-dialog-tab_current .uploadcare-widget-circle--canvas{color:#d0bf26;border-color:#e1e5e7}.uploadcare-dialog-tab-preview:before{display:none}.uploadcare-dialog-tab-file:before{background-position:0 -50px}.uploadcare-dialog-tab-url:before{background-position:0 -100px}.uploadcare-dialog-tab-facebook:before{background-position:0 -150px}.uploadcare-dialog-tab-dropbox:before{background-position:0 -200px}.uploadcare-dialog-tab-gdrive:before{background-position:0 -250px}.uploadcare-dialog-tab-instagram:before{background-position:0 -300px}.uploadcare-dialog-tab-vk:before{background-position:0 -350px}.uploadcare-dialog-tab-evernote:before{background-position:0 -400px}.uploadcare-dialog-tab-box:before{background-position:0 -450px}.uploadcare-dialog-tab-skydrive:before{background-position:0 -500px}.uploadcare-dialog-tab-flickr:before{background-position:0 -550px}.uploadcare-dialog-tab-camera:before{background-position:0 -600px}.uploadcare-dialog-tabs-panel{position:relative;display:none;-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;margin-left:75px;height:616px;line-height:22px;font-size:16px;color:#000}.uploadcare-dialog-tabs-panel .uploadcare-dialog-input{-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;width:100%;height:44px;margin-bottom:22px;padding:11px 12.5px;font-family:inherit;font-size:16px;border:1px solid #c5cace;background:#fff;color:#000}.uploadcare-dialog-tabs-panel_current{display:block}.uploadcare-pre{white-space:pre;font-family:monospace;margin:22px auto;padding:22px 25px;background-color:#fff;border:1px solid #c5cace;border-radius:3px;text-align:left;font-size:15px;line-height:22px}.uploadcare-dialog-footer{font-size:13px;line-height:1.4em;text-align:center;color:#ddd;margin:15px}.uploadcare-dialog .uploadcare-dialog-footer a{color:#c2c2c2;text-decoration:none}.uploadcare-dialog .uploadcare-dialog-footer a:hover{text-decoration:underline}.uploadcare-dialog-title{font-size:22px;line-height:1;margin-bottom:22px}.uploadcare-dialog-title.uploadcare-error{color:red}.uploadcare-dialog-title2{font-size:20px;line-height:1;padding-bottom:11px}.uploadcare-dialog-big-title{font-size:40px;font-weight:bold;line-height:1em;margin-bottom:50px}.uploadcare-dialog-label{font-size:15px;line-height:25px;margin-bottom:12.5px;word-wrap:break-word}.uploadcare-dialog-large-text{font-size:20px;font-weight:normal;line-height:1.5em}.uploadcare-dialog-large-text .uploadcare-pre{display:inline-block;font-size:18px}.uploadcare-dialog-section{margin-bottom:22px}.uploadcare-dialog-normal-text{font-size:13px;color:#545454}.uploadcare-dialog-button{display:inline-block;font-size:13px;line-height:30px;padding:0 12.5px;margin-right:.5em;border:solid 1px;border-radius:3px;cursor:pointer;color:#444}.uploadcare-dialog-button,.uploadcare-dialog-button[disabled]:active,.uploadcare-dialog-button.uploadcare-disabled-el:active,.uploadcare-dialog-button[disabled]:hover,.uploadcare-dialog-button.uploadcare-disabled-el:hover{background:#f3f3f3;background:-webkit-linear-gradient(#f5f5f5,#f1f1f1);background:-moz-linear-gradient(#f5f5f5,#f1f1f1);background:linear-gradient(#f5f5f5,#f1f1f1);-webkit-box-shadow:none;-moz-box-shadow:none;box-shadow:none;border-color:#dcdcdc}.uploadcare-dialog-button:hover{background:#f8f8f8;background:-webkit-linear-gradient(#fbfbfb,#f6f6f6);background:-moz-linear-gradient(#fbfbfb,#f6f6f6);background:linear-gradient(#fbfbfb,#f6f6f6);-webkit-box-shadow:inset 0 -1px 3px rgba(0,0,0,0.05);-moz-box-shadow:inset 0 -1px 3px rgba(0,0,0,0.05);box-shadow:inset 0 -1px 3px rgba(0,0,0,0.05)}.uploadcare-dialog-button:active{background:#f3f3f3;background:-webkit-linear-gradient(#f5f5f5,#f1f1f1);background:-moz-linear-gradient(#f5f5f5,#f1f1f1);background:linear-gradient(#f5f5f5,#f1f1f1);-webkit-box-shadow:inset 0 2px 2px rgba(0,0,0,0.05);-moz-box-shadow:inset 0 2px 2px rgba(0,0,0,0.05);box-shadow:inset 0 2px 2px rgba(0,0,0,0.05)}.uploadcare-dialog-button[disabled],.uploadcare-dialog-button.uploadcare-disabled-el{cursor:default;opacity:.6}.uploadcare-dialog-button:active,.uploadcare-dialog-button:hover{border-color:#cbcbcb}.uploadcare-dialog-button-success{display:inline-block;font-size:13px;line-height:30px;padding:0 12.5px;margin-right:.5em;border:solid 1px;border-radius:3px;cursor:pointer;color:#fff}.uploadcare-dialog-button-success,.uploadcare-dialog-button-success[disabled]:active,.uploadcare-dialog-button-success.uploadcare-disabled-el:active,.uploadcare-dialog-button-success[disabled]:hover,.uploadcare-dialog-button-success.uploadcare-disabled-el:hover{background:#3786eb;background:-webkit-linear-gradient(#3b8df7,#347fdf);background:-moz-linear-gradient(#3b8df7,#347fdf);background:linear-gradient(#3b8df7,#347fdf);-webkit-box-shadow:none;-moz-box-shadow:none;box-shadow:none;border-color:#266fcb}.uploadcare-dialog-button-success:hover{background:#3279d6;background:-webkit-linear-gradient(#3986ea,#2c6dc2);background:-moz-linear-gradient(#3986ea,#2c6dc2);background:linear-gradient(#3986ea,#2c6dc2);-webkit-box-shadow:inset 0 -1px 3px rgba(0,0,0,0.05);-moz-box-shadow:inset 0 -1px 3px rgba(0,0,0,0.05);box-shadow:inset 0 -1px 3px rgba(0,0,0,0.05)}.uploadcare-dialog-button-success:active{background:#3177d3;background:-webkit-linear-gradient(#3680e1,#2c6fc5);background:-moz-linear-gradient(#3680e1,#2c6fc5);background:linear-gradient(#3680e1,#2c6fc5);-webkit-box-shadow:inset 0 2px 2px rgba(0,0,0,0.05);-moz-box-shadow:inset 0 2px 2px rgba(0,0,0,0.05);box-shadow:inset 0 2px 2px rgba(0,0,0,0.05)}.uploadcare-dialog-button-success[disabled],.uploadcare-dialog-button-success.uploadcare-disabled-el{cursor:default;opacity:.6}.uploadcare-dialog-button-success:active,.uploadcare-dialog-button-success:hover{border-color:#266eca #1f62b7 #1753a1}.uploadcare-dialog-button-success:hover{-webkit-box-shadow:inset 0 -1px 3px rgba(22,82,160,0.5);-moz-box-shadow:inset 0 -1px 3px rgba(22,82,160,0.5);box-shadow:inset 0 -1px 3px rgba(22,82,160,0.5)}.uploadcare-dialog-button-success:active{-webkit-box-shadow:inset 0 1px 3px rgba(22,82,160,0.4);-moz-box-shadow:inset 0 1px 3px rgba(22,82,160,0.4);box-shadow:inset 0 1px 3px rgba(22,82,160,0.4)}.uploadcare-dialog-big-button{border-radius:100px;font-size:20px;font-weight:normal;letter-spacing:1px;color:white;line-height:33px;border:solid 1px #276fcb;text-shadow:0 -1px #2a7ce5;display:inline-block;padding:16.5px 2em;cursor:pointer;-webkit-box-shadow:inset 0 -2px #1f66c1;-moz-box-shadow:inset 0 -2px #1f66c1;box-shadow:inset 0 -2px #1f66c1;background:#458dee;background:-webkit-linear-gradient(#4892f6,#4289e6);background:-moz-linear-gradient(#4892f6,#4289e6);background:linear-gradient(#4892f6,#4289e6)}.uploadcare-dialog-big-button:hover{-webkit-box-shadow:inset 0 -2px #1652a0;-moz-box-shadow:inset 0 -2px #1652a0;box-shadow:inset 0 -2px #1652a0;background:#3279d6;background:-webkit-linear-gradient(#3986eb,#2c6dc2);background:-moz-linear-gradient(#3986eb,#2c6dc2);background:linear-gradient(#3986eb,#2c6dc2)}.uploadcare-dialog-big-button:active{-webkit-box-shadow:inset 0 2px #2561b9;-moz-box-shadow:inset 0 2px #2561b9;box-shadow:inset 0 2px #2561b9;background:#2c6ec3;background:-webkit-linear-gradient(#2c6ec3,#2c6ec3);background:-moz-linear-gradient(#2c6ec3,#2c6ec3);background:linear-gradient(#2c6ec3,#2c6ec3)}.uploadcare-dialog-preview-image-wrap{white-space:nowrap;text-align:center;width:100%;height:462px}.uploadcare-dialog-preview-image-wrap:before{display:inline-block;vertical-align:middle;content:\'\';height:100%;position:static;width:0}.uploadcare-dialog-preview-image{display:inline-block;vertical-align:middle;white-space:normal;max-width:100%;max-height:100%}.uploadcare-dialog-preview--with-sizes .uploadcare-dialog-preview-image-wrap{height:422px}.uploadcare-dialog-inner-footer{-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;background:#fff3be;border-top:1px solid #efe2a9;height:66px;padding:17px 25px 0}.uploadcare-dialog-inner-footer .uploadcare-dialog-button-success{float:right}.uploadcare-dialog-inner-footer .uploadcare-dialog-button{float:left}.uploadcare-dialog-inner-footer .uploadcare-dialog-button-success,.uploadcare-dialog-inner-footer .uploadcare-dialog-button{min-width:100px;text-align:center;margin-right:0}.uploadcare-dialog-inner-footer .uploadcare-error{color:red}.uploadcare-dialog-inner-footer-text{text-align:center;color:#85732c;font-size:15px;line-height:32px}.uploadcare-dialog-message-center{text-align:center;padding-top:110px}.uploadcare-dialog-preview-center{text-align:center;padding-top:176px}.uploadcare-dialog-preview-circle{width:66px;height:66px;display:inline-block;margin-bottom:22px}.uploadcare-dialog-error-tab-wrap{height:100%;text-align:center;white-space:nowrap}.uploadcare-dialog-error-tab-wrap:before{display:inline-block;vertical-align:middle;content:\'\';height:100%;position:static;width:0}.uploadcare-dialog-error-tab-wrap .uploadcare-dialog-title{margin-bottom:12px}.uploadcare-dialog-error-tab-wrap .uploadcare-dialog-normal-text{margin-bottom:38px}.uploadcare-dialog-error-tab-wrap .uploadcare-dialog-button-success{margin:0}.uploadcare-dialog-error-tab-wrap2{display:inline-block;vertical-align:middle;white-space:normal;margin-top:-22px}.uploadcare-dialog-error-tab-illustration{display:inline-block;width:170px;height:120px;background-position:center;background-repeat:no-repeat;margin-bottom:38px}.uploadcare-if-draganddrop{display:none}.uploadcare-draganddrop .uploadcare-if-no-draganddrop{display:none}.uploadcare-draganddrop .uploadcare-if-draganddrop{display:block}.uploadcare-draganddrop .uploadcare-dialog-file-drop-area{border:dashed 3px #c5cacd;background:rgba(255,255,255,0.64)}.uploadcare-draganddrop .uploadcare-dialog-file-title{color:#dee0e1;text-shadow:0 1px white;margin-top:0}.uploadcare-dialog-file-drop-area{width:100%;height:100%;-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;border:none;text-align:center;border-radius:3px;padding-top:70px}.uploadcare-dialog-file-drop-area .uploadcare-dialog-big-button{margin-top:11px;margin-bottom:55px}.uploadcare-dialog-file-title{font-size:40px;line-height:1;color:black;font-weight:bold;margin:66px 0}.uploadcare-dialog-file-or{font-size:13px;color:#8f9498;margin-bottom:33px}.uploadcare-dialog-file-sources{position:relative;display:inline-block;padding:0 80px 0 100px;line-height:2em}.uploadcare-dialog-file-sources:before{background-repeat:no-repeat;content:\'\';display:block;position:absolute;width:67px;height:44px;padding:0;top:-30px;left:10px}.uploadcare-dialog-file-source{display:inline;font-size:15px;margin-right:.2em;cursor:pointer;font-weight:300;white-space:nowrap}.uploadcare-dialog-file-source:after{content:\'\\00B7\';color:#b7babc;margin-left:.5em}.uploadcare-dialog-file-source:last-child:after{display:none}.uploadcare-dragging .uploadcare-dialog-file-or,.uploadcare-dragging .uploadcare-dialog-file-sources,.uploadcare-dragging .uploadcare-dialog-file-drop-area .uploadcare-dialog-big-button{display:none}.uploadcare-dragging .uploadcare-dialog-file-drop-area{background-color:#f0f0f0;border-color:#b3b5b6;padding-top:264px}.uploadcare-dragging .uploadcare-dialog-file-title{color:#707478}.uploadcare-dragging.uploadcare-dialog-file-drop-area{background-color:#f2f7fe;border-color:#438ae7}.uploadcare-dragging.uploadcare-dialog-file-drop-area .uploadcare-dialog-file-title{color:#438ae7}.uploadcare-dialog-camera-holder{white-space:nowrap;text-align:center;height:528px}.uploadcare-dialog-camera-holder:before{display:inline-block;vertical-align:middle;content:\'\';height:100%;position:static;width:0}.uploadcare-dialog-camera-holder .uploadcare-dialog-normal-text{margin-bottom:38px}.uploadcare-dialog-multiple .uploadcare-dialog-camera-holder{height:462px}.uploadcare-dialog-camera-video{display:inline-block;vertical-align:middle;white-space:normal;display:none;max-width:100%;max-height:528px;transition:transform .8s cubic-bezier(0.23,1,0.32,1);-webkit-transition:-webkit-transform .8s cubic-bezier(0.23,1,0.32,1)}.uploadcare-dialog-multiple .uploadcare-dialog-camera-video{max-height:462px}.uploadcare-dialog-camera--mirrored{transform:scale(-1,1);-webkit-transform:scale(-1,1)}.uploadcare-dialog-camera-message{display:inline-block;vertical-align:middle;white-space:normal;display:none;max-width:450px}.uploadcare-dialog-camera-controls{margin-top:17px;text-align:center}.uploadcare-dialog-camera-mirror{position:absolute;margin-right:0;right:25px}.uploadcare-dialog-camera-capture,.uploadcare-dialog-camera-retry,.uploadcare-dialog-camera-mirror{display:none}.uploadcare-dialog-camera-requested .uploadcare-dialog-camera-message{display:inline-block}.uploadcare-dialog-camera-not-found{display:none}.uploadcare-dialog-camera-not-founded .uploadcare-dialog-camera-please-allow{display:none}.uploadcare-dialog-camera-not-founded .uploadcare-dialog-camera-not-found{display:block}.uploadcare-dialog-camera-denied .uploadcare-dialog-camera-retry{display:inline-block}.uploadcare-dialog-camera-ready .uploadcare-dialog-camera-video,.uploadcare-dialog-camera-ready .uploadcare-dialog-camera-capture,.uploadcare-dialog-camera-ready .uploadcare-dialog-camera-mirror{display:inline-block}.uploadcare-dpm-file-list{height:484px;overflow:auto;margin:0 -25px -22px 0}.uploadcare-dpm-file-item{border-top:1px solid #e3e3e3;border-bottom:1px solid #e3e3e3;margin-bottom:-1px;display:table;table-layout:fixed;width:100%;padding:10px 0;min-height:20px;font-size:13px;line-height:1.2}.uploadcare-dpm-file-item>*{-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;display:table-cell;vertical-align:middle;padding-right:20px}.uploadcare-dpm-file-item:last-child{margin-bottom:0}.uploadcare-dpm-file-item:hover{background:#ececec}.uploadcare-dpm-file-item:hover .uploadcare-dpm-file-remove{display:inline-block}.uploadcare-dpm-uploaded .uploadcare-dpm-file-progressbar-wrap{display:none}.uploadcare-dpm-error .uploadcare-dpm-file-error{display:table-cell}.uploadcare-dpm-error .uploadcare-dpm-file-size,.uploadcare-dpm-error .uploadcare-dpm-file-progressbar-wrap{display:none}.uploadcare-dpm-file-preview,.uploadcare-dpm-file-error:before{content:\'\';display:inline-block;width:20px;height:20px;margin:-3.5px .7em -3.5px 0}.uploadcare-dpm-file-preview-wrap{width:45px;display:table-cell;text-align:center;line-height:0;padding-right:10px}.uploadcare-dpm-file-preview{margin:0}.uploadcare-dpm-file-name{width:100%;word-wrap:break-word}.uploadcare-dpm-file-size{width:3.5em;text-align:left}.uploadcare-dpm-file-progressbar-wrap{width:80px}.uploadcare-dpm-file-progressbar{width:100%;height:8px;background:#e0e0e0;border-radius:100px}.uploadcare-dpm-file-progressbar-value{height:100%;background:#d6b849;border-radius:100px}.uploadcare-dpm-file-error{width:200px;display:none;color:#f5444b}.uploadcare-dpm-file-remove-wrap{width:20px;text-align:right;line-height:0}.uploadcare-dpm-file-remove{display:none;width:20px;height:20px;cursor:pointer}.uploadcare-dialog-source-base-wrap{height:616px;-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box}.uploadcare-dialog-multiple .uploadcare-dialog-source-base-wrap{height:550px}.uploadcare-dialog-padding{padding:22px 25px}.uploadcare-dialog-remote-iframe-wrap{overflow:auto;-webkit-overflow-scrolling:touch}.uploadcare-dialog-remote-iframe{display:block;width:100%;height:100%;border:0;opacity:0}.uploadcare-dialog-source-base-footer{display:none}.uploadcare-dialog-multiple .uploadcare-dialog-source-base-footer{display:block}.uploadcare-dialog-source-base-counter{display:none}.uploadcare-if-mobile{display:none}@media screen and (max-width:600px){.uploadcare-dialog-opened{overflow:visible!important;position:static!important;width:auto!important;height:auto!important;min-width:0!important;background:#efefef!important}body.uploadcare-dialog-opened>:not(.uploadcare-dialog){display:none!important}.uploadcare-if-mobile{display:block}.uploadcare-if-no-mobile{display:none}.uploadcare-dialog{position:absolute;overflow:visible;-webkit-text-size-adjust:100%}.uploadcare-dialog:before{display:none}.uploadcare-dialog-inner-wrap{padding:0;min-width:310px;height:100%}.uploadcare-dialog-close{position:fixed;z-index:2;color:#000;width:50px;height:50px;line-height:45px}.uploadcare-dialog-footer{display:none}.uploadcare-responsive-panel .uploadcare-dialog-panel{overflow:visible;height:100%;border-radius:0;-webkit-box-shadow:none;-moz-box-shadow:none;box-shadow:none}.uploadcare-responsive-panel .uploadcare-dialog-tabs-panel{padding:50px 0 0;margin:0;height:100%}.uploadcare-responsive-panel .uploadcare-dialog-source-base-wrap{height:auto}.uploadcare-responsive-panel .uploadcare-dialog-remote-iframe-wrap{overflow:visible;height:100%}.uploadcare-responsive-panel .uploadcare-dialog-padding{padding:22px 15px}.uploadcare-responsive-panel .uploadcare-dialog-preview-image-wrap{height:auto;padding-bottom:50px}.uploadcare-responsive-panel .uploadcare-dialog-preview-image{max-height:450px}.uploadcare-responsive-panel .uploadcare-dpm-file-list{height:auto;margin:0 -15px 0 0}.uploadcare-responsive-panel .uploadcare-dpm-file-item>*{padding-right:10px}.uploadcare-responsive-panel .uploadcare-dpm-file-progressbar-wrap{width:40px}.uploadcare-responsive-panel .uploadcare-dpm-file-remove{display:inline-block}.uploadcare-responsive-panel .uploadcare-dialog-file-sources,.uploadcare-responsive-panel .uploadcare-dialog-file-or{display:none}.uploadcare-responsive-panel .uploadcare-dialog-file-title{display:none}.uploadcare-responsive-panel .uploadcare-dialog-file-drop-area{padding-top:0;border:0;background:transparent}.uploadcare-responsive-panel .uploadcare-dialog-big-button{margin:110px 0 0}.uploadcare-responsive-panel .uploadcare-clouds-tip{color:#909498;font-size:.75em;line-height:1.4;text-align:left;padding:10px 0 0 50px}.uploadcare-responsive-panel .uploadcare-clouds-tip:before{background-image:url("',  utils.imagePath('arrow.png') ,'");background-repeat:no-repeat;background-size:51px 33px;content:\'\';position:absolute;margin:-20px -36px;display:block;width:28px;height:30px}.uploadcare-responsive-panel .uploadcare-dialog-camera-holder{height:auto}.uploadcare-responsive-panel .uploadcare-dialog-camera-mirror{right:15px}.uploadcare-responsive-panel .uploadcare-dialog-inner-footer{position:fixed;left:0;bottom:0;width:100%;min-width:310px;height:50px;padding:9px 15px 0;background:rgba(255,243,190,0.95)}.uploadcare-responsive-panel .uploadcare-dialog-inner-footer-text{display:none}.uploadcare-responsive-panel .uploadcare-dialog-source-base-counter{display:inline}.uploadcare-responsive-panel .uploadcare-dialog-multiple .uploadcare-dialog-remote-iframe-wrap:after{content:\'\';display:block;height:50px}.uploadcare-responsive-panel .uploadcare-dialog-multiple .uploadcare-dialog-source-base-wrap{padding-bottom:50px}.uploadcare-responsive-panel .uploadcare-dialog-multiple .uploadcare-dialog-padding{padding-bottom:72px}.uploadcare-responsive-panel .uploadcare-dialog-tabs{position:fixed;top:0;left:0;width:100%;min-width:310px;height:auto;float:none;z-index:1;background:transparent}.uploadcare-responsive-panel .uploadcare-dialog-tab{display:none;height:50px;white-space:nowrap;background:#dee0e1}.uploadcare-responsive-panel .uploadcare-dialog-tab .uploadcare-dialog-icon,.uploadcare-responsive-panel .uploadcare-dialog-tab:before{position:static;margin:0 6px;vertical-align:middle;opacity:1}.uploadcare-responsive-panel .uploadcare-dialog-tab_current{display:block;background:rgba(239,239,239,0.95)}.uploadcare-responsive-panel .uploadcare-dialog-tab:after{content:attr(title);font-size:20px;vertical-align:middle}.uploadcare-responsive-panel .uploadcare-dialog-opened-tabs .uploadcare-dialog-tabs-panel_current{display:none}.uploadcare-responsive-panel .uploadcare-dialog-opened-tabs .uploadcare-dialog-tabs{position:relative;z-index:3}.uploadcare-responsive-panel .uploadcare-dialog-opened-tabs .uploadcare-dialog-tab{display:block}.uploadcare-responsive-panel .uploadcare-dialog-opened-tabs .uploadcare-dialog-tab_current{background:#efefef}.uploadcare-responsive-panel .uploadcare-dialog-panel:not(.uploadcare-dialog-opened-tabs) .uploadcare-dialog-tab_current{text-align:center}.uploadcare-responsive-panel .uploadcare-dialog-panel:not(.uploadcare-dialog-opened-tabs) .uploadcare-dialog-tab_current:after{content:\'\';position:absolute;top:16px;left:14px;display:block;width:22px;height:18px;background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAOCAQAAAD+6Ta3AAAARklEQVR4Ae3SsRFEIQhAwW1IR2s3s6zTGUN+AxdK5tucAIBmOuKSY2pQbHHZVhgiweAnEixW1uC0VdSU41Xo19+te73+9AGOg1FzTMH13gAAAABJRU5ErkJggg==);background-size:22px}.uploadcare-responsive-panel .uploadcare-crop-sizes{top:-50px;margin-top:15px}.uploadcare-responsive-panel .uploadcare-crop-size{margin:0 10px}}.uploadcare-crop-widget.jcrop-holder{direction:ltr;text-align:left;z-index:0}.uploadcare-crop-widget .jcrop-vline,.uploadcare-crop-widget .jcrop-hline{background-color:white;background-position:top left;background-repeat:repeat;font-size:0;position:absolute}.uploadcare-crop-widget .jcrop-vline{height:100%;width:1px!important}.uploadcare-crop-widget .jcrop-hline{height:1px!important;width:100%}.uploadcare-crop-widget .jcrop-vline.right{right:0}.uploadcare-crop-widget .jcrop-hline.bottom{bottom:0}.uploadcare-crop-widget .jcrop-handle{background-color:#333;border:1px #eee solid;font-size:1px}.uploadcare-crop-widget .jcrop-tracker{height:100%;width:100%;-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none;-webkit-user-select:none}.uploadcare-crop-widget .jcrop-handle.ord-n{left:50%;margin-left:-4px;margin-top:-4px;top:0}.uploadcare-crop-widget .jcrop-handle.ord-s{bottom:0;left:50%;margin-bottom:-4px;margin-left:-4px}.uploadcare-crop-widget .jcrop-handle.ord-e{margin-right:-4px;margin-top:-4px;right:0;top:50%}.uploadcare-crop-widget .jcrop-handle.ord-w{left:0;margin-left:-4px;margin-top:-4px;top:50%}.uploadcare-crop-widget .jcrop-handle.ord-nw{left:0;margin-left:-4px;margin-top:-4px;top:0}.uploadcare-crop-widget .jcrop-handle.ord-ne{margin-right:-4px;margin-top:-4px;right:0;top:0}.uploadcare-crop-widget .jcrop-handle.ord-se{bottom:0;margin-bottom:-4px;margin-right:-4px;right:0}.uploadcare-crop-widget .jcrop-handle.ord-sw{bottom:0;left:0;margin-bottom:-4px;margin-left:-4px}.uploadcare-crop-widget .jcrop-dragbar.ord-n,.uploadcare-crop-widget .jcrop-dragbar.ord-s{height:7px;width:100%}.uploadcare-crop-widget .jcrop-dragbar.ord-e,.uploadcare-crop-widget .jcrop-dragbar.ord-w{height:100%;width:7px}.uploadcare-crop-widget .jcrop-dragbar.ord-n{margin-top:-4px}.uploadcare-crop-widget .jcrop-dragbar.ord-s{bottom:0;margin-bottom:-4px}.uploadcare-crop-widget .jcrop-dragbar.ord-e{margin-right:-4px;right:0}.uploadcare-crop-widget .jcrop-dragbar.ord-w{margin-left:-4px}.uploadcare-crop-widget .jcrop-light .jcrop-vline,.uploadcare-crop-widget .jcrop-light .jcrop-hline{background:#FFF;filter:Alpha(opacity=70)!important;opacity:.7!important}.uploadcare-crop-widget .jcrop-light .jcrop-handle{-moz-border-radius:3px;-webkit-border-radius:3px;background-color:#000;border-color:#FFF;border-radius:3px}.uploadcare-crop-widget .jcrop-dark .jcrop-vline,.uploadcare-crop-widget .jcrop-dark .jcrop-hline{background:#000;filter:Alpha(opacity=70)!important;opacity:.7!important}.uploadcare-crop-widget .jcrop-dark .jcrop-handle{-moz-border-radius:3px;-webkit-border-radius:3px;background-color:#FFF;border-color:#000;border-radius:3px}.uploadcare-crop-widget.jcrop-holder img,.uploadcare-crop-widget img.jcrop-preview{max-width:none}.uploadcare-crop-widget{display:inline-block;vertical-align:middle;white-space:normal}.uploadcare-crop-widget .jcrop-handle:before{content:\'\';display:block;width:26px;height:26px;margin:-9px}.uploadcare-crop-widget>div:first-child{-webkit-transform:translateZ(0)}.uploadcare-crop-widget>img{filter:url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\'><filter id=\'grayscale\'><feColorMatrix type=\'saturate\' values=\'.5\'/></filter></svg>#grayscale");-webkit-filter:grayscale(50%)}.uploadcare-crop-sizes{display:none;visibility:hidden;position:relative;top:11px;text-align:center}.uploadcare-dialog-preview--with-sizes .uploadcare-crop-sizes{display:block}.uploadcare-dialog-preview--loaded .uploadcare-crop-sizes{visibility:visible}.uploadcare-crop-size{position:relative;display:inline-block;width:40px;height:40px;line-height:40px;margin:0 20px;font-size:.55em;cursor:pointer;color:#444}.uploadcare-crop-size div{-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;width:40px;height:30px;display:inline-block;vertical-align:middle;border:1px solid #ccc}.uploadcare-crop-size:after{content:attr(data-caption);position:absolute;top:1px;left:0;width:100%;text-align:center;margin:0}.uploadcare-crop-size--current div{background:white}.uploadcare-widget{position:relative;display:inline-block;vertical-align:baseline;line-height:2;white-space:nowrap}.uploadcare-widget-status-ready .uploadcare-widget-button-open,.uploadcare-widget-status-started .uploadcare-widget-status,.uploadcare-widget-status-started .uploadcare-widget-text,.uploadcare-widget-status-started .uploadcare-widget-button-cancel,.uploadcare-widget-status-loaded .uploadcare-widget-text,.uploadcare-widget-status-loaded .uploadcare-widget-button-remove,.uploadcare-widget-status-error .uploadcare-widget-text,.uploadcare-widget-status-error .uploadcare-widget-button-open{display:inline-block!important}.uploadcare-widget-status{display:none!important;width:1.8em;height:1.8em;margin:-1em 0;margin-right:1ex;line-height:0;vertical-align:middle}.uploadcare-widget-circle--text .uploadcare-widget-circle-back{width:100%;height:100%;display:table;white-space:normal}.uploadcare-widget-circle--text .uploadcare-widget-circle-text{display:table-cell;vertical-align:middle;text-align:center;font-size:60%;line-height:1}.uploadcare-widget-circle--canvas{color:#d0bf26;border-color:#e1e5e7}.uploadcare-widget-circle--canvas canvas{width:100%;height:100%}.uploadcare-widget-text{display:none!important;margin-right:1ex}.uploadcare-widget-file-name{display:inline}.uploadcare-link,.uploadcare-link:link,.uploadcare-link:visited{cursor:pointer;color:#1a85ad;text-decoration:none;border-bottom:1px dotted #1a85ad;border-color:-moz-initial;border-color:initial}.uploadcare-link:hover,.uploadcare-link:active{color:#176e8f}.uploadcare-widget-button{display:none!important;color:white;padding:.4em .6em;line-height:1;margin:-1em 0;margin-right:.5ex;border-radius:.25em;background:#c3c3c3;cursor:default}.uploadcare-widget-button:hover{background:#b3b3b3}.uploadcare-widget-button-open{padding:.5em .8em;background:#18a5d0}.uploadcare-widget-button-open:hover{background:#0094c0}.uploadcare-widget-dragndrop-area{-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;display:none;position:absolute;top:50%;margin-top:-1.3em;left:-1em;padding:0 1em;line-height:2.6;min-width:100%;text-align:center;background-color:#f0f0f0;color:#707478;border:1px dashed #b3b5b6;border-radius:100px}.uploadcare-widget.uploadcare-dragging .uploadcare-widget-dragndrop-area{background-color:#f2f7fe;border-color:#438ae7;color:#438ae7}.uploadcare-dragging .uploadcare-widget-dragndrop-area{display:block}.uploadcare-dialog-opened .uploadcare-widget-dragndrop-area{display:none}\n');}return __p.join('');};
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["uploadcare/templates/tab-camera"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="uploadcare-dialog-camera-holder"><!--\n  --><video class="uploadcare-dialog-camera-video uploadcare-dialog-camera--mirrored"></video><!--\n  --><div class="uploadcare-dialog-camera-message">\n    <div class="uploadcare-dialog-error-tab-illustration"></div>\n\n    <div class="uploadcare-dialog-title uploadcare-dialog-camera-please-allow">\n      ',(''+ t('dialog.tabs.camera.pleaseAllow.title') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\n    </div>\n    <div class="uploadcare-dialog-normal-text uploadcare-dialog-camera-please-allow">\n      ',(''+ t('dialog.tabs.camera.pleaseAllow.text') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\n    </div>\n\n    <div class="uploadcare-dialog-title uploadcare-dialog-camera-not-found">\n      ',(''+ t('dialog.tabs.camera.notFound.title') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\n    </div>\n    <div class="uploadcare-dialog-normal-text uploadcare-dialog-camera-not-found">\n      ',(''+ t('dialog.tabs.camera.notFound.text') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\n    </div>\n\n    <div class="uploadcare-dialog-camera-retry uploadcare-dialog-button">\n      ',(''+ t('dialog.tabs.camera.retry') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\n    </div>\n  </div><!--\n--></div>\n<div class="uploadcare-dialog-camera-controls">\n  <div class="uploadcare-dialog-camera-mirror uploadcare-dialog-button">\n    ',(''+ t('dialog.tabs.camera.mirror') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\n  </div>\n  <div class="uploadcare-dialog-camera-capture uploadcare-dialog-button-success">\n    ',(''+ t('dialog.tabs.camera.capture') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\n  </div>\n</div>\n');}return __p.join('');};
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["uploadcare/templates/tab-file"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="uploadcare-dialog-file-drop-area" role="uploadcare-drop-area">\n  <div class="uploadcare-dialog-file-title uploadcare-if-draganddrop">\n    ',(''+ t('dialog.tabs.file.drag') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\n  </div>\n  <div class="uploadcare-dialog-file-title uploadcare-if-no-draganddrop">\n    ',(''+ t('dialog.tabs.file.nodrop') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\n  </div>\n  <div class="uploadcare-dialog-file-or uploadcare-if-draganddrop">\n    ',(''+ t('dialog.tabs.file.or') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\n  </div>\n  <div class="uploadcare-clouds-tip uploadcare-if-mobile">\n    ',  t('dialog.tabs.file.cloudsTip') ,'\n  </div>\n  <div class="uploadcare-dialog-big-button" role="uploadcare-dialog-browse-file">\n    ',(''+ t('dialog.tabs.file.button') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\n  </div>\n  ');  if (tabs.length > 1) { ; __p.push('\n    <div class="uploadcare-dialog-file-or">\n      ',(''+ t('dialog.tabs.file.also') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\n    </div>\n    <div class="uploadcare-dialog-file-sources">\n      ');  for (var i = 0; i < tabs.length; i++) {
          var tab = tabs[i];
          if (tab == 'file') continue; ; __p.push('\n        <div\n          class="uploadcare-dialog-file-source"\n          role="uploadcare-dialog-switch-tab"\n          data-tab="',(''+ tab ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'"\n        >',(''+ t('dialog.tabs.names.' + tab) ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\n      ');  } ; __p.push('\n    </div>\n  ');  } ; __p.push('\n</div>\n');}return __p.join('');};
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["uploadcare/templates/tab-preview-error"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="uploadcare-dialog-error-tab-wrap uloadcare-dialog-error-tab-',(''+ error ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'"><!--\n  --><div class="uploadcare-dialog-error-tab-wrap2">\n\n    <div class="uploadcare-dialog-error-tab-illustration"></div>\n\n    <div class="uploadcare-dialog-title">',(''+
        t('dialog.tabs.preview.error.'+error+'.title') || t('dialog.tabs.preview.error.default.title')
      ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\n\n    <div class="uploadcare-dialog-normal-text">',(''+ 
        t('dialog.tabs.preview.error.'+error+'.text') || t('dialog.tabs.preview.error.default.text') 
      ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\n\n    <div class="uploadcare-dialog-button-success" \n      role="uploadcare-dialog-preview-back">',(''+ 
          t('dialog.tabs.preview.error.'+error+'.back') || t('dialog.tabs.preview.error.default.back') 
      ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\n\n  </div>\n</div>\n');}return __p.join('');};
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["uploadcare/templates/tab-preview-image"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="uploadcare-dialog-padding" role="uploadcare-dialog-preview-root">\n  <div class="uploadcare-dialog-title" role="uploadcare-dialog-preview-title">\n    ',(''+ t('dialog.tabs.preview.image.title') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\n  </div>\n\n  <div class="uploadcare-dialog-preview-image-wrap"><!--\n      1162x684 is 1.5 size of conteiner\n    --><img\n      src="',(''+ file.originalUrl ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'-/preview/1162x684/-/setfill/efefef/-/format/jpeg/-/progressive/yes/"\n      title="',(''+ (file.name || "") ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'"\n      alt="',(''+ (file.name || "") ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'"\n      role="uploadcare-dialog-preview-image"\n      class="uploadcare-dialog-preview-image"\n    />\n  </div>\n\n  <div class="uploadcare-crop-sizes" role="uploadcare-dialog-preview-crop-sizes">\n    <div class="uploadcare-crop-size" data-caption="free"><div></div></div>\n  </div>\n</div>\n\n<div class="uploadcare-dialog-inner-footer">\n  <div \n    class="uploadcare-dialog-button" \n    role="uploadcare-dialog-preview-back">',(''+ t('dialog.tabs.preview.image.change') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\n  <div \n    class="uploadcare-dialog-button-success"\n    role="uploadcare-dialog-preview-done">',(''+ t('dialog.tabs.preview.done') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\n</div>\n');}return __p.join('');};
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["uploadcare/templates/tab-preview-multiple-file"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div role="uploadcare-dpm-file-item" class="uploadcare-dpm-file-item">\n  <div class="uploadcare-dpm-file-preview-wrap" role="uploadcare-dpm-file-preview-wrap">\n    <div class="uploadcare-dpm-file-preview"></div>\n  </div>\n  <div role="uploadcare-dpm-file-name" class="uploadcare-dpm-file-name">\n    ',(''+ t('dialog.tabs.preview.unknownName') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\n  </div>\n  <div class="uploadcare-dpm-file-progressbar-wrap">\n    <div class="uploadcare-dpm-file-progressbar">\n      <div\n        role="uploadcare-dpm-file-progressbar-value"\n        class="uploadcare-dpm-file-progressbar-value"\n      ></div>\n    </div>\n  </div>\n  <div role="uploadcare-dpm-file-size" class="uploadcare-dpm-file-size"></div>\n  <div role="uploadcare-dpm-file-error" class="uploadcare-dpm-file-error"></div>\n  <div class="uploadcare-dpm-file-remove-wrap">\n    <div role="uploadcare-dpm-file-remove" class="uploadcare-dpm-file-remove"></div>\n  </div>\n</div>\n');}return __p.join('');};
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["uploadcare/templates/tab-preview-multiple"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="uploadcare-dialog-padding">\n  <div class="uploadcare-dialog-title uploadcare-if-no-mobile" role="uploadcare-dpm-title"></div>\n  <div class="uploadcare-dialog-title uploadcare-if-mobile" role="uploadcare-dpm-mobile-title"></div>\n\n  <div role="uploadcare-dpm-file-list" class="uploadcare-dpm-file-list"></div>\n</div>\n\n<div class="uploadcare-dialog-inner-footer">\n  <div \n    class="uploadcare-dialog-button" \n    role="uploadcare-dialog-preview-back">',(''+ t('dialog.tabs.preview.multiple.clear') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\n  <div \n    class="uploadcare-dialog-button-success" \n    role="uploadcare-dialog-preview-done">',(''+ t('dialog.tabs.preview.multiple.done') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\n  <div class="uploadcare-dialog-inner-footer-text" role="uploadcare-dpm-footer-text"></div>\n</div>\n');}return __p.join('');};
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["uploadcare/templates/tab-preview-regular"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="uploadcare-dialog-padding">\n  <div class="uploadcare-dialog-title">',(''+ t('dialog.tabs.preview.regular.title') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\n\n  <div class="uploadcare-dialog-label">\n    ',(''+ (file.name || t('dialog.tabs.preview.unknownName')) ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'',(''+
        utils.readableFileSize(file.size, '', ', ') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\n  </div>\n\n  <div class="uploadcare-dialog-section uploadcare-dialog-normal-text">\n    ',(''+ t('dialog.tabs.preview.regular.line1') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'<br/>\n    ',(''+ t('dialog.tabs.preview.regular.line2') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\n  </div>\n\n  <div\n    class="uploadcare-dialog-button-success"\n    role="uploadcare-dialog-preview-done">',(''+ t('dialog.tabs.preview.done') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\n  <div\n    class="uploadcare-dialog-button"\n    role="uploadcare-dialog-preview-back">',(''+ t('dialog.tabs.preview.change') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\n</div>\n');}return __p.join('');};
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["uploadcare/templates/tab-preview-unknown"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="uploadcare-dialog-padding">\n\n  <div class="uploadcare-dialog-title">',(''+ t('dialog.tabs.preview.unknown.title') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\n\n  <div class="uploadcare-dialog-label">\n    ',(''+ (file.name || "") ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'',(''+
        utils.readableFileSize(file.size, '', ', ') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\n  </div>\n\n  <div\n    class="uploadcare-dialog-button-success"\n    role="uploadcare-dialog-preview-done">',(''+ t('dialog.tabs.preview.unknown.done') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\n</div>\n');}return __p.join('');};
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["uploadcare/templates/tab-url"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="uploadcare-dialog-title">',(''+ t('dialog.tabs.url.title') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\n<div class="uploadcare-dialog-section uploadcare-dialog-normal-text">\n  <div>',(''+ t('dialog.tabs.url.line1') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\n  <div>',(''+ t('dialog.tabs.url.line2') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\n</div>\n<form role="uploadcare-dialog-url-form">\n  <input type="text" class="uploadcare-dialog-input" role="uploadcare-dialog-url-input" placeholder="',(''+ t('dialog.tabs.url.input') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'">\n  <button class="uploadcare-dialog-button" type="submit" role="uploadcare-dialog-url-submit">',(''+ t('dialog.tabs.url.button') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</button>\n</form>\n');}return __p.join('');};
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["uploadcare/templates/tab-welcome"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="uploadcare-dialog-message-center">\n  <div class="uploadcare-dialog-big-title">Hello!</div>\n  <div class="uploadcare-dialog-large-text">\n    <div>Your <a class="uploadcare-link" href="https://uploadcare.com/dashboard/">public key</a> is not set.</div>\n    <div>Add this to the &lt;head&gt; tag to start uploading files:</div>\n    <div class="uploadcare-pre">&lt;script&gt;\nUPLOADCARE_PUBLIC_KEY = \'your_public_key\';\n&lt;/script&gt;</div>\n  </div>\n</div>\n');}return __p.join('');};
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["uploadcare/templates/widget-button"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div\n  class="uploadcare-widget-button uploadcare-widget-button-',  name ,'"\n>',(''+ caption ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\n');}return __p.join('');};
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["uploadcare/templates/widget-file-name"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div\n  role="uploadcare-widget-file-name"\n  class="uploadcare-widget-file-name uploadcare-link">',(''+ utils.fitText(name, 20) ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>,\n',(''+ utils.readableFileSize(size) ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\n');}return __p.join('');};
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["uploadcare/templates/widget"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="uploadcare-widget">\n  <div class="uploadcare-widget-dragndrop-area" role="uploadcare-drop-area">\n    ',(''+ t('draghere') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\n  </div><div role="uploadcare-widget-status" class="uploadcare-widget-status">\n  </div><div role="uploadcare-widget-text" class="uploadcare-widget-text">\n</div></div>\n');}return __p.join('');};
}).call(this);
(function() {
  var $, locale, namespace, utils;

  namespace = uploadcare.namespace, locale = uploadcare.locale, utils = uploadcare.utils, $ = uploadcare.jQuery;

  namespace('uploadcare.templates', function(ns) {
    return ns.tpl = function(key, ctx) {
      var fn;
      if (ctx == null) {
        ctx = {};
      }
      fn = JST["uploadcare/templates/" + key];
      if (fn != null) {
        return fn($.extend({
          t: locale.t,
          utils: utils
        }, ctx));
      } else {
        return '';
      }
    };
  });

}).call(this);
(function() {
  var $, tpl;

  $ = uploadcare.jQuery;

  tpl = uploadcare.templates.tpl;

  uploadcare.settings.waitForSettings(null, function() {
    var css, style;
    css = tpl('styles');
    style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    if (style.styleSheet != null) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
    return $('head').prepend(style);
  });

}).call(this);
/**
 * jquery.Jcrop.js v0.9.10
 * jQuery Image Cropping Plugin - released under MIT License 
 * Author: Kelly Hallman <khallman@gmail.com>
 * http://github.com/tapmodo/Jcrop
 * Copyright (c) 2008-2012 Tapmodo Interactive LLC {{{
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 *
 * }}}
 */


(function ($) {

  $.Jcrop = function (obj, opt) {
    var options = $.extend({}, $.Jcrop.defaults),
        docOffset, lastcurs;

    // Internal Methods {{{
    function px(n) {
      return Math.round(n) + 'px';
    }
    function cssClass(cl) {
      return options.baseClass + '-' + cl;
    }
    function supportsColorFade() {
      return $.fx.step.hasOwnProperty('backgroundColor');
    }
    function getPos(obj) //{{{
    {
      var pos = $(obj).offset();
      return [pos.left, pos.top];
    }
    //}}}
    function mouseAbs(e) //{{{
    {
      return [(e.pageX - docOffset[0]), (e.pageY - docOffset[1])];
    }
    //}}}
    function setOptions(opt) //{{{
    {
      if (typeof(opt) !== 'object') opt = {};
      options = $.extend(options, opt);

      $.each(['onChange','onSelect','onRelease','onDblClick'],function(i,e) {
        if (typeof(options[e]) !== 'function') options[e] = function () {};
      });
    }
    //}}}
    function startDragMode(mode, pos) //{{{
    {
      docOffset = getPos($img);
      Tracker.setCursor(mode === 'move' ? mode : mode + '-resize');

      if (mode === 'move') {
        return Tracker.activateHandlers(createMover(pos), doneSelect);
      }

      var fc = Coords.getFixed();
      var opp = oppLockCorner(mode);
      var opc = Coords.getCorner(oppLockCorner(opp));

      Coords.setPressed(Coords.getCorner(opp));
      Coords.setCurrent(opc);

      Tracker.activateHandlers(dragmodeHandler(mode, fc), doneSelect);
    }
    //}}}
    function dragmodeHandler(mode, f) //{{{
    {
      return function (pos) {
        if (!options.aspectRatio) {
          switch (mode) {
          case 'e':
            pos[1] = f.y2;
            break;
          case 'w':
            pos[1] = f.y2;
            break;
          case 'n':
            pos[0] = f.x2;
            break;
          case 's':
            pos[0] = f.x2;
            break;
          }
        } else {
          switch (mode) {
          case 'e':
            pos[1] = f.y + 1;
            break;
          case 'w':
            pos[1] = f.y + 1;
            break;
          case 'n':
            pos[0] = f.x + 1;
            break;
          case 's':
            pos[0] = f.x + 1;
            break;
          }
        }
        Coords.setCurrent(pos);
        Selection.update();
      };
    }
    //}}}
    function createMover(pos) //{{{
    {
      var lloc = pos;
      KeyManager.watchKeys();

      return function (pos) {
        Coords.moveOffset([pos[0] - lloc[0], pos[1] - lloc[1]]);
        lloc = pos;

        Selection.update();
      };
    }
    //}}}
    function oppLockCorner(ord) //{{{
    {
      switch (ord) {
      case 'n':
        return 'sw';
      case 's':
        return 'nw';
      case 'e':
        return 'nw';
      case 'w':
        return 'ne';
      case 'ne':
        return 'sw';
      case 'nw':
        return 'se';
      case 'se':
        return 'nw';
      case 'sw':
        return 'ne';
      }
    }
    //}}}
    function createDragger(ord) //{{{
    {
      return function (e) {
        if (options.disabled) {
          return false;
        }
        if ((ord === 'move') && !options.allowMove) {
          return false;
        }
        
        // Fix position of crop area when dragged the very first time.
        // Necessary when crop image is in a hidden element when page is loaded.
        docOffset = getPos($img);

        btndown = true;
        startDragMode(ord, mouseAbs(e));
        e.stopPropagation();
        e.preventDefault();
        return false;
      };
    }
    //}}}
    function presize($obj, w, h) //{{{
    {
      var nw = $obj.width(),
          nh = $obj.height();
      if ((nw > w) && w > 0) {
        nw = w;
        nh = (w / $obj.width()) * $obj.height();
      }
      if ((nh > h) && h > 0) {
        nh = h;
        nw = (h / $obj.height()) * $obj.width();
      }
      xscale = $obj.width() / nw;
      yscale = $obj.height() / nh;
      $obj.width(nw).height(nh);
    }
    //}}}
    function unscale(c) //{{{
    {
      return {
        x: c.x * xscale,
        y: c.y * yscale,
        x2: c.x2 * xscale,
        y2: c.y2 * yscale,
        w: c.w * xscale,
        h: c.h * yscale
      };
    }
    //}}}
    function doneSelect(pos) //{{{
    {
      var c = Coords.getFixed();
      if ((c.w > options.minSelect[0]) && (c.h > options.minSelect[1])) {
        Selection.enableHandles();
        Selection.done();
      } else {
        Selection.release();
      }
    }
    //}}}
    function selectDrag(pos) //{{{
    {
      Coords.setCurrent(pos);
      Selection.update();
    }
    //}}}
    function newTracker() //{{{
    {
      var trk = $('<div></div>').addClass(cssClass('tracker'));
      trk.css({
        opacity: 0,
        backgroundColor: 'white'
      });
      return trk;
    }
    //}}}

    // }}}
    // Initialization {{{
    // Sanitize some options {{{
    if (typeof(obj) !== 'object') {
      obj = $(obj)[0];
    }
    if (typeof(opt) !== 'object') {
      opt = {};
    }
    // }}}
    setOptions(opt);
    // Initialize some jQuery objects {{{
    // The values are SET on the image(s) for the interface
    // If the original image has any of these set, they will be reset
    // However, if you destroy() the Jcrop instance the original image's
    // character in the DOM will be as you left it.
    var img_css = {
      border: 'none',
      visibility: 'visible',
      margin: 0,
      padding: 0,
      position: 'absolute',
      top: 0,
      left: 0
    };

    var $origimg = $(obj),
      img_mode = true;

    if (obj.tagName == 'IMG') {
      // Fix size of crop image.
      // Necessary when crop image is within a hidden element when page is loaded.
      if ($origimg[0].width != 0 && $origimg[0].height != 0) {
        // Obtain dimensions from contained img element.
        $origimg.width($origimg[0].width);
        $origimg.height($origimg[0].height);
      } else {
        // Obtain dimensions from temporary image in case the original is not loaded yet (e.g. IE 7.0). 
        var tempImage = new Image();
        tempImage.src = $origimg[0].src;
        $origimg.width(tempImage.width);
        $origimg.height(tempImage.height);
      } 

      var $img = $origimg.clone().removeAttr('id').css(img_css).show();

      $img.width($origimg.width());
      $img.height($origimg.height());
      $origimg.after($img).hide();

    } else {
      $img = $origimg.css(img_css).show();
      img_mode = false;
      if (options.shade === null) { options.shade = true; }
    }

    presize($img, options.boxWidth, options.boxHeight);

    var boundx = $img.width(),
        boundy = $img.height(),

        $div = $('<div />').width(boundx).height(boundy).addClass(cssClass('holder')).css({
          position: 'relative',
          backgroundColor: options.bgColor
        }).insertAfter($origimg).append($img);

    if (options.addClass) {
      $div.addClass(options.addClass);
    }

    var $img2 = $('<div />'),

        $img_holder = $('<div />') 
        .width('100%').height('100%').css({
          zIndex: 310,
          position: 'absolute',
          overflow: 'hidden'
        }),

        $hdl_holder = $('<div />') 
        .width('100%').height('100%').css('zIndex', 320), 

        $sel = $('<div />') 
        .css({
          position: 'absolute',
          zIndex: 600
        }).dblclick(function(){
          var c = Coords.getFixed();
          options.onDblClick.call(api,c);
        }).insertBefore($img).append($img_holder, $hdl_holder); 

    if (img_mode) {

      $img2 = $('<img />')
          .attr('src', $img.attr('src')).css(img_css).width(boundx).height(boundy),

      $img_holder.append($img2);

    }

    var bound = options.boundary;
    var $trk = newTracker().width(boundx + (bound * 2)).height(boundy + (bound * 2)).css({
      position: 'absolute',
      top: px(-bound),
      left: px(-bound),
      zIndex: 290
    });

    /* }}} */
    // Set more variables {{{
    var bgcolor = options.bgColor,
        bgopacity = options.bgOpacity,
        xlimit, ylimit, xmin, ymin, xscale, yscale, enabled = true,
        btndown, animating, shift_down;

    docOffset = getPos($img);
    // }}}
    // }}}
    // Internal Modules {{{
    // Touch Module {{{ 
    var Touch = (function () {
      // Touch support detection function adapted (under MIT License)
      // from code by Jeffrey Sambells - http://github.com/iamamused/
      function hasTouchSupport() {
        var support = {},
            events = ['touchstart', 'touchmove', 'touchend'],
            el = document.createElement('div'), i;

        try {
          for(i=0; i<events.length; i++) {
            var eventName = events[i];
            eventName = 'on' + eventName;
            var isSupported = (eventName in el);
            if (!isSupported) {
              el.setAttribute(eventName, 'return;');
              isSupported = typeof el[eventName] == 'function';
            }
            support[events[i]] = isSupported;
          }
          return support.touchstart && support.touchend && support.touchmove;
        }
        catch(err) {
          return false;
        }
      }

      function detectSupport() {
        if ((options.touchSupport === true) || (options.touchSupport === false)) return options.touchSupport;
          else return hasTouchSupport();
      }
      return {
        createDragger: function (ord) {
          return function (e) {
            e.pageX = e.originalEvent.changedTouches[0].pageX;
            e.pageY = e.originalEvent.changedTouches[0].pageY;
            if (options.disabled) {
              return false;
            }
            if ((ord === 'move') && !options.allowMove) {
              return false;
            }
            btndown = true;
            startDragMode(ord, mouseAbs(e));
            e.stopPropagation();
            e.preventDefault();
            return false;
          };
        },
        isSupported: hasTouchSupport,
        support: detectSupport()
      };
    }());
    // }}}
    // Coords Module {{{
    var Coords = (function () {
      var x1 = 0,
          y1 = 0,
          x2 = 0,
          y2 = 0,
          ox, oy;

      function setPressed(pos) //{{{
      {
        pos = rebound(pos);
        x2 = x1 = pos[0];
        y2 = y1 = pos[1];
      }
      //}}}
      function setCurrent(pos) //{{{
      {
        pos = rebound(pos);
        ox = pos[0] - x2;
        oy = pos[1] - y2;
        x2 = pos[0];
        y2 = pos[1];
      }
      //}}}
      function getOffset() //{{{
      {
        return [ox, oy];
      }
      //}}}
      function moveOffset(offset) //{{{
      {
        var ox = offset[0],
            oy = offset[1];

        if (0 > x1 + ox) {
          ox -= ox + x1;
        }
        if (0 > y1 + oy) {
          oy -= oy + y1;
        }

        if (boundy < y2 + oy) {
          oy += boundy - (y2 + oy);
        }
        if (boundx < x2 + ox) {
          ox += boundx - (x2 + ox);
        }

        x1 += ox;
        x2 += ox;
        y1 += oy;
        y2 += oy;
      }
      //}}}
      function getCorner(ord) //{{{
      {
        var c = getFixed();
        switch (ord) {
        case 'ne':
          return [c.x2, c.y];
        case 'nw':
          return [c.x, c.y];
        case 'se':
          return [c.x2, c.y2];
        case 'sw':
          return [c.x, c.y2];
        }
      }
      //}}}
      function getFixed() //{{{
      {
        if (!options.aspectRatio) {
          return getRect();
        }
        // This function could use some optimization I think...
        var aspect = options.aspectRatio,
            min_x = options.minSize[0] / xscale,
            
            
            //min_y = options.minSize[1]/yscale,
            max_x = options.maxSize[0] / xscale,
            max_y = options.maxSize[1] / yscale,
            rw = x2 - x1,
            rh = y2 - y1,
            rwa = Math.abs(rw),
            rha = Math.abs(rh),
            real_ratio = rwa / rha,
            xx, yy, w, h;

        if (max_x === 0) {
          max_x = boundx * 10;
        }
        if (max_y === 0) {
          max_y = boundy * 10;
        }
        if (real_ratio < aspect) {
          yy = y2;
          w = rha * aspect;
          xx = rw < 0 ? x1 - w : w + x1;

          if (xx < 0) {
            xx = 0;
            h = Math.abs((xx - x1) / aspect);
            yy = rh < 0 ? y1 - h : h + y1;
          } else if (xx > boundx) {
            xx = boundx;
            h = Math.abs((xx - x1) / aspect);
            yy = rh < 0 ? y1 - h : h + y1;
          }
        } else {
          xx = x2;
          h = rwa / aspect;
          yy = rh < 0 ? y1 - h : y1 + h;
          if (yy < 0) {
            yy = 0;
            w = Math.abs((yy - y1) * aspect);
            xx = rw < 0 ? x1 - w : w + x1;
          } else if (yy > boundy) {
            yy = boundy;
            w = Math.abs(yy - y1) * aspect;
            xx = rw < 0 ? x1 - w : w + x1;
          }
        }

        // Magic %-)
        if (xx > x1) { // right side
          if (xx - x1 < min_x) {
            xx = x1 + min_x;
          } else if (xx - x1 > max_x) {
            xx = x1 + max_x;
          }
          if (yy > y1) {
            yy = y1 + (xx - x1) / aspect;
          } else {
            yy = y1 - (xx - x1) / aspect;
          }
        } else if (xx < x1) { // left side
          if (x1 - xx < min_x) {
            xx = x1 - min_x;
          } else if (x1 - xx > max_x) {
            xx = x1 - max_x;
          }
          if (yy > y1) {
            yy = y1 + (x1 - xx) / aspect;
          } else {
            yy = y1 - (x1 - xx) / aspect;
          }
        }

        if (xx < 0) {
          x1 -= xx;
          xx = 0;
        } else if (xx > boundx) {
          x1 -= xx - boundx;
          xx = boundx;
        }

        if (yy < 0) {
          y1 -= yy;
          yy = 0;
        } else if (yy > boundy) {
          y1 -= yy - boundy;
          yy = boundy;
        }

        return makeObj(flipCoords(x1, y1, xx, yy));
      }
      //}}}
      function rebound(p) //{{{
      {
        if (p[0] < 0) {
          p[0] = 0;
        }
        if (p[1] < 0) {
          p[1] = 0;
        }

        if (p[0] > boundx) {
          p[0] = boundx;
        }
        if (p[1] > boundy) {
          p[1] = boundy;
        }

        return [p[0], p[1]];
      }
      //}}}
      function flipCoords(x1, y1, x2, y2) //{{{
      {
        var xa = x1,
            xb = x2,
            ya = y1,
            yb = y2;
        if (x2 < x1) {
          xa = x2;
          xb = x1;
        }
        if (y2 < y1) {
          ya = y2;
          yb = y1;
        }
        return [xa, ya, xb, yb];
      }
      //}}}
      function getRect() //{{{
      {
        var xsize = x2 - x1,
            ysize = y2 - y1,
            delta;

        if (xlimit && (Math.abs(xsize) > xlimit)) {
          x2 = (xsize > 0) ? (x1 + xlimit) : (x1 - xlimit);
        }
        if (ylimit && (Math.abs(ysize) > ylimit)) {
          y2 = (ysize > 0) ? (y1 + ylimit) : (y1 - ylimit);
        }

        if (ymin / yscale && (Math.abs(ysize) < ymin / yscale)) {
          y2 = (ysize > 0) ? (y1 + ymin / yscale) : (y1 - ymin / yscale);
        }
        if (xmin / xscale && (Math.abs(xsize) < xmin / xscale)) {
          x2 = (xsize > 0) ? (x1 + xmin / xscale) : (x1 - xmin / xscale);
        }

        if (x1 < 0) {
          x2 -= x1;
          x1 -= x1;
        }
        if (y1 < 0) {
          y2 -= y1;
          y1 -= y1;
        }
        if (x2 < 0) {
          x1 -= x2;
          x2 -= x2;
        }
        if (y2 < 0) {
          y1 -= y2;
          y2 -= y2;
        }
        if (x2 > boundx) {
          delta = x2 - boundx;
          x1 -= delta;
          x2 -= delta;
        }
        if (y2 > boundy) {
          delta = y2 - boundy;
          y1 -= delta;
          y2 -= delta;
        }
        if (x1 > boundx) {
          delta = x1 - boundy;
          y2 -= delta;
          y1 -= delta;
        }
        if (y1 > boundy) {
          delta = y1 - boundy;
          y2 -= delta;
          y1 -= delta;
        }

        return makeObj(flipCoords(x1, y1, x2, y2));
      }
      //}}}
      function makeObj(a) //{{{
      {
        return {
          x: a[0],
          y: a[1],
          x2: a[2],
          y2: a[3],
          w: a[2] - a[0],
          h: a[3] - a[1]
        };
      }
      //}}}

      return {
        flipCoords: flipCoords,
        setPressed: setPressed,
        setCurrent: setCurrent,
        getOffset: getOffset,
        moveOffset: moveOffset,
        getCorner: getCorner,
        getFixed: getFixed
      };
    }());

    //}}}
    // Shade Module {{{
    var Shade = (function() {
      var enabled = false,
          holder = $('<div />').css({
            position: 'absolute',
            zIndex: 240,
            opacity: 0
          }),
          shades = {
            top: createShade(),
            left: createShade().height(boundy),
            right: createShade().height(boundy),
            bottom: createShade()
          };

      function resizeShades(w,h) {
        shades.left.css({ height: px(h) });
        shades.right.css({ height: px(h) });
      }
      function updateAuto()
      {
        return updateShade(Coords.getFixed());
      }
      function updateShade(c)
      {
        shades.top.css({
          left: px(c.x),
          width: px(c.w),
          height: px(c.y)
        });
        shades.bottom.css({
          top: px(c.y2),
          left: px(c.x),
          width: px(c.w),
          height: px(boundy-c.y2)
        });
        shades.right.css({
          left: px(c.x2),
          width: px(boundx-c.x2)
        });
        shades.left.css({
          width: px(c.x)
        });
      }
      function createShade() {
        return $('<div />').css({
          position: 'absolute',
          backgroundColor: options.shadeColor||options.bgColor
        }).appendTo(holder);
      }
      function enableShade() {
        if (!enabled) {
          enabled = true;
          holder.insertBefore($img);
          updateAuto();
          Selection.setBgOpacity(1,0,1);
          $img2.hide();

          setBgColor(options.shadeColor||options.bgColor,1);
          if (Selection.isAwake())
          {
            setOpacity(options.bgOpacity,1);
          }
            else setOpacity(1,1);
        }
      }
      function setBgColor(color,now) {
        colorChangeMacro(getShades(),color,now);
      }
      function disableShade() {
        if (enabled) {
          holder.remove();
          $img2.show();
          enabled = false;
          if (Selection.isAwake()) {
            Selection.setBgOpacity(options.bgOpacity,1,1);
          } else {
            Selection.setBgOpacity(1,1,1);
            Selection.disableHandles();
          }
          colorChangeMacro($div,0,1);
        }
      }
      function setOpacity(opacity,now) {
        if (enabled) {
          if (options.bgFade && !now) {
            holder.animate({
              opacity: 1-opacity
            },{
              queue: false,
              duration: options.fadeTime
            });
          }
          else holder.css({opacity:1-opacity});
        }
      }
      function refreshAll() {
        options.shade ? enableShade() : disableShade();
        if (Selection.isAwake()) setOpacity(options.bgOpacity);
      }
      function getShades() {
        return holder.children();
      }

      return {
        update: updateAuto,
        updateRaw: updateShade,
        getShades: getShades,
        setBgColor: setBgColor,
        enable: enableShade,
        disable: disableShade,
        resize: resizeShades,
        refresh: refreshAll,
        opacity: setOpacity
      };
    }());
    // }}}
    // Selection Module {{{
    var Selection = (function () {
      var awake,
          hdep = 370,
          borders = {},
          handle = {},
          dragbar = {},
          seehandles = false;

      // Private Methods
      function insertBorder(type) //{{{
      {
        var jq = $('<div />').css({
          position: 'absolute',
          opacity: options.borderOpacity
        }).addClass(cssClass(type));
        $img_holder.append(jq);
        return jq;
      }
      //}}}
      function dragDiv(ord, zi) //{{{
      {
        var jq = $('<div />').mousedown(createDragger(ord)).css({
          cursor: ord + '-resize',
          position: 'absolute',
          zIndex: zi
        }).addClass('ord-'+ord);

        if (Touch.support) {
          jq.bind('touchstart.jcrop', Touch.createDragger(ord));
        }

        $hdl_holder.append(jq);
        return jq;
      }
      //}}}
      function insertHandle(ord) //{{{
      {
        var hs = options.handleSize;
        return dragDiv(ord, hdep++).css({
          opacity: options.handleOpacity
        }).width(hs).height(hs).addClass(cssClass('handle'));
      }
      //}}}
      function insertDragbar(ord) //{{{
      {
        return dragDiv(ord, hdep++).addClass('jcrop-dragbar');
      }
      //}}}
      function createDragbars(li) //{{{
      {
        var i;
        for (i = 0; i < li.length; i++) {
          dragbar[li[i]] = insertDragbar(li[i]);
        }
      }
      //}}}
      function createBorders(li) //{{{
      {
        var cl,i;
        for (i = 0; i < li.length; i++) {
          switch(li[i]){
            case'n': cl='hline'; break;
            case's': cl='hline bottom'; break;
            case'e': cl='vline right'; break;
            case'w': cl='vline'; break;
          }
          borders[li[i]] = insertBorder(cl);
        }
      }
      //}}}
      function createHandles(li) //{{{
      {
        var i;
        for (i = 0; i < li.length; i++) {
          handle[li[i]] = insertHandle(li[i]);
        }
      }
      //}}}
      function moveto(x, y) //{{{
      {
        if (!options.shade) {
          $img2.css({
            top: px(-y),
            left: px(-x)
          });
        }
        $sel.css({
          top: px(y),
          left: px(x)
        });
      }
      //}}}
      function resize(w, h) //{{{
      {
        $sel.width(Math.round(w)).height(Math.round(h));
      }
      //}}}
      function refresh() //{{{
      {
        var c = Coords.getFixed();

        Coords.setPressed([c.x, c.y]);
        Coords.setCurrent([c.x2, c.y2]);

        updateVisible();
      }
      //}}}

      // Internal Methods
      function updateVisible(select) //{{{
      {
        if (awake) {
          return update(select);
        }
      }
      //}}}
      function update(select) //{{{
      {
        var c = Coords.getFixed();

        resize(c.w, c.h);
        moveto(c.x, c.y);
        if (options.shade) Shade.updateRaw(c);

        awake || show();

        if (select) {
          options.onSelect.call(api, unscale(c));
        } else {
          options.onChange.call(api, unscale(c));
        }
      }
      //}}}
      function setBgOpacity(opacity,force,now) //{{{
      {
        if (!awake && !force) return;
        if (options.bgFade && !now) {
          $img.animate({
            opacity: opacity
          },{
            queue: false,
            duration: options.fadeTime
          });
        } else {
          $img.css('opacity', opacity);
        }
      }
      //}}}
      function show() //{{{
      {
        $sel.show();

        if (options.shade) Shade.opacity(bgopacity);
          else setBgOpacity(bgopacity,true);

        awake = true;
      }
      //}}}
      function release() //{{{
      {
        disableHandles();
        $sel.hide();

        if (options.shade) Shade.opacity(1);
          else setBgOpacity(1);

        awake = false;
        options.onRelease.call(api);
      }
      //}}}
      function showHandles() //{{{
      {
        if (seehandles) {
          $hdl_holder.show();
        }
      }
      //}}}
      function enableHandles() //{{{
      {
        seehandles = true;
        if (options.allowResize) {
          $hdl_holder.show();
          return true;
        }
      }
      //}}}
      function disableHandles() //{{{
      {
        seehandles = false;
        $hdl_holder.hide();
      } 
      //}}}
      function animMode(v) //{{{
      {
        if (v) {
          animating = true;
          disableHandles();
        } else {
          animating = false;
          enableHandles();
        }
      } 
      //}}}
      function done() //{{{
      {
        animMode(false);
        refresh();
      } 
      //}}}
      // Insert draggable elements {{{
      // Insert border divs for outline

      if (options.dragEdges && $.isArray(options.createDragbars))
        createDragbars(options.createDragbars);

      if ($.isArray(options.createHandles))
        createHandles(options.createHandles);

      if (options.drawBorders && $.isArray(options.createBorders))
        createBorders(options.createBorders);

      //}}}

      // This is a hack for iOS5 to support drag/move touch functionality
      $(document).bind('touchstart.jcrop-ios',function(e) {
        if ($(e.currentTarget).hasClass('jcrop-tracker')) e.stopPropagation();
      });

      var $track = newTracker().mousedown(createDragger('move')).css({
        cursor: 'move',
        position: 'absolute',
        zIndex: 360
      });

      if (Touch.support) {
        $track.bind('touchstart.jcrop', Touch.createDragger('move'));
      }

      $img_holder.append($track);
      disableHandles();

      return {
        updateVisible: updateVisible,
        update: update,
        release: release,
        refresh: refresh,
        isAwake: function () {
          return awake;
        },
        setCursor: function (cursor) {
          $track.css('cursor', cursor);
        },
        enableHandles: enableHandles,
        enableOnly: function () {
          seehandles = true;
        },
        showHandles: showHandles,
        disableHandles: disableHandles,
        animMode: animMode,
        setBgOpacity: setBgOpacity,
        done: done
      };
    }());
    
    //}}}
    // Tracker Module {{{
    var Tracker = (function () {
      var onMove = function () {},
          onDone = function () {},
          trackDoc = options.trackDocument;

      function toFront() //{{{
      {
        $trk.css({
          zIndex: 450
        });
        if (Touch.support) {
          $(document)
            .bind('touchmove.jcrop', trackTouchMove)
            .bind('touchend.jcrop', trackTouchEnd);
        }
        if (trackDoc) {
          $(document)
            .bind('mousemove.jcrop',trackMove)
            .bind('mouseup.jcrop',trackUp);
        }
      } 
      //}}}
      function toBack() //{{{
      {
        $trk.css({
          zIndex: 290
        });
        $(document).unbind('.jcrop');
      } 
      //}}}
      function trackMove(e) //{{{
      {
        onMove(mouseAbs(e));
        return false;
      } 
      //}}}
      function trackUp(e) //{{{
      {
        e.preventDefault();
        e.stopPropagation();

        if (btndown) {
          btndown = false;

          onDone(mouseAbs(e));

          if (Selection.isAwake()) {
            options.onSelect.call(api, unscale(Coords.getFixed()));
          }

          toBack();
          onMove = function () {};
          onDone = function () {};
        }

        return false;
      }
      //}}}
      function activateHandlers(move, done) //{{{
      {
        btndown = true;
        onMove = move;
        onDone = done;
        toFront();
        return false;
      }
      //}}}
      function trackTouchMove(e) //{{{
      {
        e.pageX = e.originalEvent.changedTouches[0].pageX;
        e.pageY = e.originalEvent.changedTouches[0].pageY;
        return trackMove(e);
      }
      //}}}
      function trackTouchEnd(e) //{{{
      {
        e.pageX = e.originalEvent.changedTouches[0].pageX;
        e.pageY = e.originalEvent.changedTouches[0].pageY;
        return trackUp(e);
      }
      //}}}
      function setCursor(t) //{{{
      {
        $trk.css('cursor', t);
      }
      //}}}

      if (!trackDoc) {
        $trk.mousemove(trackMove).mouseup(trackUp).mouseout(trackUp);
      }

      $img.before($trk);
      return {
        activateHandlers: activateHandlers,
        setCursor: setCursor
      };
    }());
    //}}}
    // KeyManager Module {{{
    var KeyManager = (function () {
      var $keymgr = $('<input type="radio" />').css({
        position: 'fixed',
        left: '-120px',
        width: '12px'
      }).addClass('jcrop-keymgr'),

        $keywrap = $('<div />').css({
          position: 'absolute',
          overflow: 'hidden'
        }).append($keymgr);

      function watchKeys() //{{{
      {
        if (options.keySupport) {
          $keymgr.show();
          $keymgr.focus();
        }
      }
      //}}}
      function onBlur(e) //{{{
      {
        $keymgr.hide();
      }
      //}}}
      function doNudge(e, x, y) //{{{
      {
        if (options.allowMove) {
          Coords.moveOffset([x, y]);
          Selection.updateVisible(true);
        }
        e.preventDefault();
        e.stopPropagation();
      }
      //}}}
      function parseKey(e) //{{{
      {
        if (e.ctrlKey || e.metaKey) {
          return true;
        }
        shift_down = e.shiftKey ? true : false;
        var nudge = shift_down ? 10 : 1;

        switch (e.keyCode) {
        case 37:
          doNudge(e, -nudge, 0);
          break;
        case 39:
          doNudge(e, nudge, 0);
          break;
        case 38:
          doNudge(e, 0, -nudge);
          break;
        case 40:
          doNudge(e, 0, nudge);
          break;
        case 9:
          return true;
        }

        return false;
      }
      //}}}

      if (options.keySupport) {
        $keymgr.keydown(parseKey).blur(onBlur);

        $keymgr.css({
          position: 'absolute',
          left: '-20px'
        });
        $keywrap.append($keymgr).insertBefore($img);
      }


      return {
        watchKeys: watchKeys
      };
    }());
    //}}}
    // }}}
    // API methods {{{
    function setClass(cname) //{{{
    {
      $div.removeClass().addClass(cssClass('holder')).addClass(cname);
    }
    //}}}
    function setSelect(rect) //{{{
    {
      setSelectRaw([rect[0] / xscale, rect[1] / yscale, rect[2] / xscale, rect[3] / yscale]);
      options.onSelect.call(api, unscale(Coords.getFixed()));
      Selection.enableHandles();
    }
    //}}}
    function setSelectRaw(l) //{{{
    {
      Coords.setPressed([l[0], l[1]]);
      Coords.setCurrent([l[2], l[3]]);
      Selection.update();
    }
    //}}}
    function tellSelect() //{{{
    {
      return unscale(Coords.getFixed());
    }
    //}}}
    function tellScaled() //{{{
    {
      return Coords.getFixed();
    }
    //}}}
    function setOptionsNew(opt) //{{{
    {
      setOptions(opt);
      interfaceUpdate();
    }
    //}}}
    function disableCrop() //{{{
    {
      options.disabled = true;
      Selection.disableHandles();
      Selection.setCursor('default');
      Tracker.setCursor('default');
    }
    //}}}
    function enableCrop() //{{{
    {
      options.disabled = false;
      interfaceUpdate();
    }
    //}}}
    function cancelCrop() //{{{
    {
      Selection.done();
      Tracker.activateHandlers(null, null);
    }
    //}}}
    function destroy() //{{{
    {
      $div.remove();
      $origimg.show();
      $origimg.css('visibility','visible');
      $(obj).removeData('Jcrop');
    }
    //}}}
    function colorChangeMacro($obj,color,now) {
      var mycolor = color || options.bgColor;
      if (options.bgFade && supportsColorFade() && options.fadeTime && !now) {
        $obj.animate({
          backgroundColor: mycolor
        }, {
          queue: false,
          duration: options.fadeTime
        });
      } else {
        $obj.css('backgroundColor', mycolor);
      }
    }
    function interfaceUpdate(alt) //{{{
    // This method tweaks the interface based on options object.
    // Called when options are changed and at end of initialization.
    {
      if (options.allowResize) {
        if (alt) {
          Selection.enableOnly();
        } else {
          Selection.enableHandles();
        }
      } else {
        Selection.disableHandles();
      }

      Selection.setCursor(options.allowMove ? 'move' : 'default');

      if (options.hasOwnProperty('trueSize')) {
        xscale = options.trueSize[0] / boundx;
        yscale = options.trueSize[1] / boundy;
      }

      if (options.hasOwnProperty('setSelect')) {
        setSelect(options.setSelect);
        Selection.done();
        delete(options.setSelect);
      }

      Shade.refresh();

      if (options.bgColor != bgcolor) {
        colorChangeMacro(
          options.shade? Shade.getShades(): $div,
          options.shade?
            (options.shadeColor || options.bgColor):
            options.bgColor
        );
        bgcolor = options.bgColor;
      }

      if (bgopacity != options.bgOpacity) {
        bgopacity = options.bgOpacity;
        if (options.shade) Shade.refresh();
          else Selection.setBgOpacity(bgopacity);
      }

      xlimit = options.maxSize[0] || 0;
      ylimit = options.maxSize[1] || 0;
      xmin = options.minSize[0] || 0;
      ymin = options.minSize[1] || 0;

      if (options.hasOwnProperty('outerImage')) {
        $img.attr('src', options.outerImage);
        delete(options.outerImage);
      }

      Selection.refresh();
    }
    //}}}
    //}}}

    $hdl_holder.hide();
    interfaceUpdate(true);

    var api = {
      setSelect: setSelect,
      setOptions: setOptionsNew,
      tellSelect: tellSelect,
      tellScaled: tellScaled,
      setClass: setClass,

      disable: disableCrop,
      enable: enableCrop,
      cancel: cancelCrop,
      release: Selection.release,
      destroy: destroy,

      focus: KeyManager.watchKeys,

      getBounds: function () {
        return [boundx * xscale, boundy * yscale];
      },
      getWidgetSize: function () {
        return [boundx, boundy];
      },
      getScaleFactor: function () {
        return [xscale, yscale];
      },
      getOptions: function() {
        // careful: internal values are returned
        return options;
      },

      ui: {
        holder: $div,
        selection: $sel
      }
    };

    $origimg.data('Jcrop', api);
    return api;
  };
  $.fn.Jcrop = function (options, callback) //{{{
  {
    var api;
    // Iterate over each object, attach Jcrop
    this.each(function () {
      // If we've already attached to this object
      if ($(this).data('Jcrop')) {
        // The API can be requested this way (undocumented)
        if (options === 'api') return $(this).data('Jcrop');
        // Otherwise, we just reset the options...
        else $(this).data('Jcrop').setOptions(options);
      }
      // If we haven't been attached, preload and attach
      else {
        if (this.tagName == 'IMG')
          $.Jcrop.Loader(this,function(){
            $(this).css({display:'block',visibility:'hidden'});
            api = $.Jcrop(this, options);
            if ($.isFunction(callback)) callback.call(api);
          });
        else {
          $(this).css({display:'block',visibility:'hidden'});
          api = $.Jcrop(this, options);
          if ($.isFunction(callback)) callback.call(api);
        }
      }
    });

    // Return "this" so the object is chainable (jQuery-style)
    return this;
  };
  //}}}
  // $.Jcrop.Loader - basic image loader {{{

  $.Jcrop.Loader = function(imgobj,success,error){
    var $img = $(imgobj), img = $img[0];

    function completeCheck(){
      if (img.complete) {
        $img.unbind('.jcloader');
        if ($.isFunction(success)) success.call(img);
      }
      else window.setTimeout(completeCheck,50);
    }

    $img
      .bind('load.jcloader',completeCheck)
      .bind('error.jcloader',function(e){
        $img.unbind('.jcloader');
        if ($.isFunction(error)) error.call(img);
      });

    if (img.complete && $.isFunction(success)){
      $img.unbind('.jcloader');
      success.call(img);
    }
  };

  //}}}
  // Global Defaults {{{
  $.Jcrop.defaults = {

    // Basic Settings
    allowMove: true,
    allowResize: true,

    trackDocument: true,

    // Styling Options
    baseClass: 'jcrop',
    addClass: null,
    bgColor: 'black',
    bgOpacity: 0.6,
    bgFade: false,
    borderOpacity: 0.4,
    handleOpacity: 0.5,
    handleSize: 7,

    aspectRatio: 0,
    keySupport: true,
    createHandles: ['n','s','e','w','nw','ne','se','sw'],
    createDragbars: ['n','s','e','w'],
    createBorders: ['n','s','e','w'],
    drawBorders: true,
    dragEdges: true,
    fixedSupport: true,
    touchSupport: null,

    shade: null,

    boxWidth: 0,
    boxHeight: 0,
    boundary: 2,
    fadeTime: 400,
    animationDelay: 20,
    swingSpeed: 3,

    minSelect: [0, 0],
    maxSize: [0, 0],
    minSize: [0, 0],

    // Callbacks / Event Handlers
    onChange: function () {},
    onSelect: function () {},
    onDblClick: function () {},
    onRelease: function () {}
  };

  // }}}
}(uploadcare.jQuery));
(function() {
  var $, namespace, tpl, utils, _ref;

  namespace = uploadcare.namespace, $ = uploadcare.jQuery, (_ref = uploadcare.templates, tpl = _ref.tpl), utils = uploadcare.utils;

  namespace('uploadcare.crop', function(ns) {
    return ns.CropWidget = (function() {
      var cropModifierRegExp;

      function CropWidget(element, originalSize, crop) {
        this.element = element;
        this.originalSize = originalSize;
        if (crop == null) {
          crop = {};
        }
        this.__api = $.Jcrop(this.element[0], {
          handleSize: 10,
          trueSize: this.originalSize,
          addClass: 'uploadcare-crop-widget',
          createDragbars: [],
          bgColor: 'transparent',
          bgOpacity: .8
        });
        this.setCrop(crop);
        this.setSelection();
      }

      CropWidget.prototype.setCrop = function(crop) {
        this.crop = crop;
        return this.__api.setOptions({
          aspectRatio: crop.preferedSize ? crop.preferedSize[0] / crop.preferedSize[1] : 0,
          minSize: crop.notLess ? utils.fitSize(crop.preferedSize, this.originalSize) : [0, 0]
        });
      };

      CropWidget.prototype.setSelection = function(selection) {
        var center, left, size, top;
        if (selection) {
          center = selection.center;
          size = [selection.width, selection.height];
        } else {
          center = true;
          size = this.originalSize;
        }
        if (this.crop.preferedSize) {
          size = utils.fitSize(this.crop.preferedSize, size, true);
        }
        if (center) {
          left = (this.originalSize[0] - size[0]) / 2;
          top = (this.originalSize[1] - size[1]) / 2;
        } else {
          left = selection.left || 0;
          top = selection.top || 0;
        }
        return this.__api.setSelect([left, top, size[0] + left, size[1] + top]);
      };

      cropModifierRegExp = /-\/crop\/([0-9]+)x([0-9]+)(\/(center|([0-9]+),([0-9]+)))?\//i;

      CropWidget.prototype.__parseModifiers = function(modifiers) {
        var raw;
        if (raw = modifiers != null ? modifiers.match(cropModifierRegExp) : void 0) {
          return {
            width: parseInt(raw[1], 10),
            height: parseInt(raw[2], 10),
            center: raw[4] === 'center',
            left: parseInt(raw[5], 10) || void 0,
            top: parseInt(raw[6], 10) || void 0
          };
        }
      };

      CropWidget.prototype.setSelectionFromModifiers = function(modifiers) {
        return this.setSelection(this.__parseModifiers(modifiers));
      };

      CropWidget.prototype.getSelection = function() {
        var coords, left, top;
        coords = this.__api.tellSelect();
        left = Math.round(Math.max(0, coords.x));
        top = Math.round(Math.max(0, coords.y));
        return {
          left: left,
          top: top,
          width: Math.round(Math.min(this.originalSize[0], coords.x2)) - left,
          height: Math.round(Math.min(this.originalSize[1], coords.y2)) - top
        };
      };

      CropWidget.prototype.getSelectionWithModifiers = function() {
        var coords, downscale, h, modifiers, prefered, upscale, w, wholeImage;
        coords = this.getSelection();
        w = coords.width, h = coords.height;
        prefered = this.crop.preferedSize;
        modifiers = '';
        wholeImage = w === this.originalSize[0] && h === this.originalSize[1];
        if (!wholeImage) {
          modifiers += "-/crop/" + w + "x" + h + "/" + coords.left + "," + coords.top + "/";
        }
        downscale = this.crop.downscale && (w > prefered[0] || h > prefered[1]);
        upscale = this.crop.upscale && (w < prefered[0] || h < prefered[1]);
        if (downscale || upscale) {
          coords.sw = prefered[0], coords.sh = prefered[1];
          modifiers += "-/resize/" + (prefered.join('x')) + "/";
        } else if (!wholeImage) {
          modifiers += "-/preview/";
        }
        return {
          crop: coords,
          modifiers: modifiers
        };
      };

      return CropWidget;

    })();
  });

}).call(this);
(function() {
  var $, namespace, s, utils,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  namespace = uploadcare.namespace, s = uploadcare.settings, $ = uploadcare.jQuery, utils = uploadcare.utils;

  namespace('uploadcare.files', function(ns) {
    return ns.BaseFile = (function() {
      function BaseFile(settings) {
        this.settings = settings;
        this.__resolveApi = __bind(this.__resolveApi, this);
        this.__rejectApi = __bind(this.__rejectApi, this);
        this.__extendApi = __bind(this.__extendApi, this);
        this.__runValidators = __bind(this.__runValidators, this);
        this.__cancel = __bind(this.__cancel, this);
        this.__fileInfo = __bind(this.__fileInfo, this);
        this.__updateInfo = __bind(this.__updateInfo, this);
        this.__handleFileData = __bind(this.__handleFileData, this);
        this.__completeUpload = __bind(this.__completeUpload, this);
        this.fileId = null;
        this.fileName = null;
        this.fileSize = null;
        this.isStored = null;
        this.cdnUrlModifiers = null;
        this.isImage = null;
        this.imageInfo = null;
        this.onInfoReady = $.Callbacks('once memory');
        this.__setupValidation();
        this.__initApi();
      }

      BaseFile.prototype.__startUpload = function() {
        throw new Error('not implemented');
      };

      BaseFile.prototype.__completeUpload = function() {
        var check, timeout,
          _this = this;
        timeout = 100;
        return (check = function() {
          if (_this.apiPromise.state() === 'pending') {
            return _this.__updateInfo().done(function() {
              setTimeout(check, timeout);
              return timeout += 50;
            });
          }
        })();
      };

      BaseFile.prototype.__handleFileData = function(data) {
        this.fileName = data.original_filename;
        this.fileSize = data.size;
        this.isImage = data.is_image;
        this.imageInfo = data.image_info;
        this.isStored = data.is_stored;
        if (!this.onInfoReady.fired()) {
          this.onInfoReady.fire(this.__fileInfo());
        }
        if (data.is_ready) {
          return this.__resolveApi();
        }
      };

      BaseFile.prototype.__updateInfo = function() {
        var _this = this;
        return utils.jsonp("" + this.settings.urlBase + "/info/", {
          file_id: this.fileId,
          pub_key: this.settings.publicKey
        }).fail(function() {
          return _this.__rejectApi('info');
        }).done(this.__handleFileData);
      };

      BaseFile.prototype.__progressInfo = function() {
        var _ref;
        return {
          state: this.__progressState,
          uploadProgress: this.__progress,
          progress: (_ref = this.__progressState) === 'ready' || _ref === 'error' ? 1 : this.__progress * 0.9,
          incompleteFileInfo: this.__fileInfo()
        };
      };

      BaseFile.prototype.__fileInfo = function() {
        return {
          uuid: this.fileId,
          name: this.fileName,
          size: this.fileSize,
          isStored: this.isStored,
          isImage: this.isImage,
          originalImageInfo: this.imageInfo,
          originalUrl: this.fileId ? "" + this.settings.cdnBase + "/" + this.fileId + "/" : null,
          cdnUrl: this.fileId ? "" + this.settings.cdnBase + "/" + this.fileId + "/" + (this.cdnUrlModifiers || '') : null,
          cdnUrlModifiers: this.cdnUrlModifiers
        };
      };

      BaseFile.prototype.__cancel = function() {
        this.__rejectApi('user');
        return this.__uploadDf.reject();
      };

      BaseFile.prototype.__setupValidation = function() {
        this.validators = this.settings.validators || this.settings.__validators || [];
        if (this.settings.imagesOnly) {
          this.validators.push(function(info) {
            if (info.isImage === false) {
              throw new Error('image');
            }
          });
        }
        return this.onInfoReady.add(this.__runValidators);
      };

      BaseFile.prototype.__runValidators = function(info) {
        var err, v, _i, _len, _ref, _results;
        try {
          _ref = this.validators;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            v = _ref[_i];
            _results.push(v(info));
          }
          return _results;
        } catch (_error) {
          err = _error;
          return this.__rejectApi(err.message);
        }
      };

      BaseFile.prototype.__extendApi = function(api) {
        var __then,
          _this = this;
        api.cancel = this.__cancel;
        __then = api.then;
        api.pipe = api.then = function() {
          return _this.__extendApi(__then.apply(api, arguments));
        };
        return api;
      };

      BaseFile.prototype.__notifyApi = function() {
        return this.apiDeferred.notify(this.__progressInfo());
      };

      BaseFile.prototype.__rejectApi = function(err) {
        this.__progressState = 'error';
        this.__notifyApi();
        return this.apiDeferred.reject(err, this.__fileInfo());
      };

      BaseFile.prototype.__resolveApi = function() {
        this.__progressState = 'ready';
        this.__notifyApi();
        return this.apiDeferred.resolve(this.__fileInfo());
      };

      BaseFile.prototype.__initApi = function() {
        var _this = this;
        this.apiDeferred = $.Deferred();
        this.apiPromise = this.__extendApi(this.apiDeferred.promise());
        this.__progressState = 'uploading';
        this.__progress = 0;
        this.__notifyApi();
        return this.__uploadDf = $.Deferred().done(this.__completeUpload).done(function() {
          _this.__progressState = 'uploaded';
          _this.__progress = 1;
          return _this.__notifyApi();
        }).progress(function(progress) {
          if (progress > _this.__progress) {
            _this.__progress = progress;
            return _this.__notifyApi();
          }
        }).fail(function() {
          return _this.__rejectApi('upload');
        });
      };

      BaseFile.prototype.promise = function() {
        if (!this.__uploadStarted) {
          this.__uploadStarted = true;
          this.__runValidators(this.__fileInfo());
          if (this.apiPromise.state() === 'pending') {
            this.__startUpload();
          }
        }
        return this.apiPromise;
      };

      return BaseFile;

    })();
  });

  namespace('uploadcare.utils', function(utils) {
    utils.isFile = function(obj) {
      return obj && obj.done && obj.fail && obj.cancel;
    };
    return utils.valueToFile = function(value, settings) {
      if (value && !utils.isFile(value)) {
        value = uploadcare.fileFrom('uploaded', value, settings);
      }
      return value;
    };
  });

}).call(this);
(function() {
  var $, namespace, utils,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  namespace = uploadcare.namespace, $ = uploadcare.jQuery, utils = uploadcare.utils;

  namespace('uploadcare.files', function(ns) {
    return ns.ObjectFile = (function(_super) {
      __extends(ObjectFile, _super);

      ObjectFile.prototype.MP_MIN_SIZE = 25 * 1024 * 1024;

      ObjectFile.prototype.MP_PART_SIZE = 5 * 1024 * 1024;

      ObjectFile.prototype.MP_MIN_LAST_PART_SIZE = 1 * 1024 * 1024;

      ObjectFile.prototype.MP_CONCURRENCY = 4;

      ObjectFile.prototype.MP_MAX_ATTEMPTS = 3;

      function ObjectFile(settings, __file) {
        this.__file = __file;
        ObjectFile.__super__.constructor.apply(this, arguments);
        this.fileSize = this.__file.size;
        this.fileName = this.__file.name || 'original';
        this.fileType = this.__file.type || 'application/octet-stream';
        this.__notifyApi();
      }

      ObjectFile.prototype.__startUpload = function() {
        if (this.fileSize >= this.MP_MIN_SIZE && utils.abilities.blob) {
          return this.multipartUpload();
        } else {
          return this.directUpload();
        }
      };

      ObjectFile.prototype.__autoAbort = function(xhr) {
        this.__uploadDf.always(xhr.abort);
        return xhr;
      };

      ObjectFile.prototype.directUpload = function() {
        var formData,
          _this = this;
        if (this.fileSize > 100 * 1024 * 1024) {
          this.__rejectApi('size');
          return;
        }
        formData = new FormData();
        formData.append('UPLOADCARE_PUB_KEY', this.settings.publicKey);
        if (this.settings.autostore) {
          formData.append('UPLOADCARE_STORE', '1');
        }
        formData.append('file', this.__file, this.fileName, "extra");
        formData.append('file_name', this.fileName);
        return this.__autoAbort($.ajax({
          xhr: function() {
            var xhr;
            xhr = $.ajaxSettings.xhr();
            if (xhr.upload) {
              xhr.upload.addEventListener('progress', function(e) {
                return _this.__uploadDf.notify(e.loaded / e.total);
              }, false);
            }
            return xhr;
          },
          crossDomain: true,
          type: 'POST',
          url: "" + this.settings.urlBase + "/base/?jsonerrors=1",
          xhrFields: {
            withCredentials: true
          },
          headers: {
            'X-PINGOTHER': 'pingpong'
          },
          contentType: false,
          processData: false,
          data: formData,
          dataType: 'json',
          error: this.__uploadDf.reject,
          success: function(data) {
            if (data != null ? data.file : void 0) {
              _this.fileId = data.file;
              return _this.__uploadDf.resolve();
            } else {
              if (_this.settings.autostore && /autostore/i.test(data.error.content)) {
                utils.commonWarning('autostore');
              }
              return _this.__uploadDf.reject();
            }
          }
        }));
      };

      ObjectFile.prototype.multipartUpload = function() {
        var _this = this;
        if (this.settings.imagesOnly) {
          this.__rejectApi('image');
          return;
        }
        return this.multipartStart().done(function(data) {
          return _this.uploadParts(data.parts).done(function() {
            return _this.multipartComplete(data.uuid).done(function(data) {
              _this.fileId = data.uuid;
              _this.__handleFileData(data);
              return _this.__completeUpload();
            }).fail(_this.__uploadDf.reject);
          }).fail(_this.__uploadDf.reject);
        }).fail(this.__uploadDf.reject);
      };

      ObjectFile.prototype.multipartStart = function() {
        var data;
        data = {
          UPLOADCARE_PUB_KEY: this.settings.publicKey,
          filename: this.fileName,
          size: this.fileSize,
          content_type: this.fileType
        };
        if (this.settings.autostore) {
          data.UPLOADCARE_STORE = '1';
        }
        return this.__autoAbort(utils.jsonp("" + this.settings.urlBase + "/multipart/start/?jsonerrors=1", 'POST', data));
      };

      ObjectFile.prototype.uploadParts = function(parts) {
        var df, i, inProgress, lastUpdate, progress, submit, submittedBytes, submittedParts, updateProgress, _i, _ref,
          _this = this;
        progress = [];
        lastUpdate = $.now();
        updateProgress = function(i, loaded) {
          var total, _i, _len;
          progress[i] = loaded;
          if ($.now() - lastUpdate < 250) {
            return;
          }
          lastUpdate = $.now();
          total = 0;
          for (_i = 0, _len = progress.length; _i < _len; _i++) {
            loaded = progress[_i];
            total += loaded;
          }
          return _this.__uploadDf.notify(total / _this.fileSize);
        };
        df = $.Deferred();
        inProgress = 0;
        submittedParts = 0;
        submittedBytes = 0;
        submit = function() {
          var attempts, blob, bytesToSubmit, partNo, retry;
          if (submittedBytes >= _this.fileSize) {
            return;
          }
          bytesToSubmit = submittedBytes + _this.MP_PART_SIZE;
          if (_this.fileSize < bytesToSubmit + _this.MP_MIN_LAST_PART_SIZE) {
            bytesToSubmit = _this.fileSize;
          }
          blob = _this.__file.slice(submittedBytes, bytesToSubmit);
          submittedBytes = bytesToSubmit;
          partNo = submittedParts;
          inProgress += 1;
          submittedParts += 1;
          attempts = 0;
          return (retry = function() {
            if (_this.__uploadDf.state() !== 'pending') {
              return;
            }
            attempts += 1;
            if (attempts > _this.MP_MAX_ATTEMPTS) {
              df.reject();
              return;
            }
            progress[partNo] = 0;
            return _this.__autoAbort($.ajax({
              xhr: function() {
                var xhr;
                xhr = $.ajaxSettings.xhr();
                if (xhr.upload) {
                  xhr.upload.addEventListener('progress', function(e) {
                    return updateProgress(partNo, e.loaded);
                  }, false);
                }
                return xhr;
              },
              url: parts[partNo],
              crossDomain: true,
              type: 'PUT',
              processData: false,
              contentType: _this.fileType,
              data: blob,
              error: retry,
              success: function() {
                inProgress -= 1;
                submit();
                if (!inProgress) {
                  return df.resolve();
                }
              }
            }));
          })();
        };
        for (i = _i = 0, _ref = this.MP_CONCURRENCY; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
          submit();
        }
        return df;
      };

      ObjectFile.prototype.multipartComplete = function(uuid) {
        var data;
        data = {
          UPLOADCARE_PUB_KEY: this.settings.publicKey,
          uuid: uuid
        };
        return this.__autoAbort(utils.jsonp("" + this.settings.urlBase + "/multipart/complete/?jsonerrors=1", "POST", data));
      };

      return ObjectFile;

    })(ns.BaseFile);
  });

}).call(this);
(function() {
  var $, namespace, utils,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  namespace = uploadcare.namespace, $ = uploadcare.jQuery, utils = uploadcare.utils;

  namespace('uploadcare.files', function(ns) {
    return ns.InputFile = (function(_super) {
      __extends(InputFile, _super);

      function InputFile(settings, __input) {
        this.__input = __input;
        InputFile.__super__.constructor.apply(this, arguments);
        this.fileId = utils.uuid();
        this.fileName = $(this.__input).val().split('\\').pop();
        this.__notifyApi();
      }

      InputFile.prototype.__startUpload = function() {
        var formParam, iframeId, targetUrl,
          _this = this;
        targetUrl = "" + this.settings.urlBase + "/iframe/";
        this.__uploadDf.always(function() {
          return _this.__cleanUp();
        });
        iframeId = "uploadcare-iframe-" + this.fileId;
        this.__iframe = $('<iframe>').attr({
          id: iframeId,
          name: iframeId
        }).css('display', 'none').appendTo('body').on('load', this.__uploadDf.resolve).on('error', this.__uploadDf.reject);
        formParam = function(name, value) {
          return $('<input/>', {
            type: 'hidden',
            name: name,
            value: value
          });
        };
        $(this.__input).attr('name', 'file');
        return this.__iframeForm = $('<form>').attr({
          method: 'POST',
          action: targetUrl,
          enctype: 'multipart/form-data',
          target: iframeId
        }).append(formParam('UPLOADCARE_PUB_KEY', this.settings.publicKey)).append(formParam('UPLOADCARE_FILE_ID', this.fileId)).append(this.settings.autostore ? formParam('UPLOADCARE_STORE', 1) : void 0).append(this.__input).css('display', 'none').appendTo('body').submit();
      };

      InputFile.prototype.__cleanUp = function() {
        var _ref, _ref1;
        if ((_ref = this.__iframe) != null) {
          _ref.off('load error').remove();
        }
        if ((_ref1 = this.__iframeForm) != null) {
          _ref1.remove();
        }
        this.__iframe = null;
        return this.__iframeForm = null;
      };

      return InputFile;

    })(ns.BaseFile);
  });

}).call(this);
(function() {
  var $, namespace, pusher, utils,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  namespace = uploadcare.namespace, $ = uploadcare.jQuery, utils = uploadcare.utils;

  pusher = uploadcare.utils.pusher;

  namespace('uploadcare.files', function(ns) {
    var PollWatcher, PusherWatcher;
    ns.UrlFile = (function(_super) {
      __extends(UrlFile, _super);

      UrlFile.prototype.allEvents = 'progress success error fail';

      function UrlFile(settings, __url) {
        var err, filename;
        this.__url = __url;
        this.__listenWatcher = __bind(this.__listenWatcher, this);
        UrlFile.__super__.constructor.apply(this, arguments);
        filename = utils.splitUrlRegex.exec(this.__url)[3].split('/').pop();
        if (filename) {
          try {
            this.fileName = decodeURIComponent(filename);
          } catch (_error) {
            err = _error;
            this.fileName = filename;
          }
        }
        this.__notifyApi();
      }

      UrlFile.prototype.setName = function(name) {
        this.__realFileName = name;
        this.fileName = name;
        return this.__notifyApi();
      };

      UrlFile.prototype.setIsImage = function(isImage) {
        this.isImage = isImage;
        return this.__notifyApi();
      };

      UrlFile.prototype.__startUpload = function() {
        var data, pollWatcher, pusherWatcher,
          _this = this;
        pusherWatcher = new PusherWatcher(this.settings.pusherKey);
        pollWatcher = new PollWatcher("" + this.settings.urlBase + "/status/");
        this.__listenWatcher($([pusherWatcher, pollWatcher]));
        $(pusherWatcher).one(this.allEvents, function() {
          return pollWatcher.stopWatching();
        });
        data = {
          pub_key: this.settings.publicKey,
          source_url: this.__url,
          filename: this.__realFileName || ''
        };
        if (this.settings.autostore) {
          data.store = 1;
        }
        utils.jsonp("" + this.settings.urlBase + "/from_url/", data).fail(function(error) {
          if (_this.settings.autostore && /autostore/i.test(error)) {
            utils.commonWarning('autostore');
          }
          return _this.__uploadDf.reject();
        }).done(function(data) {
          pusherWatcher.watch(data.token);
          return pollWatcher.watch(data.token);
        });
        return this.__uploadDf.always(function() {
          $([pusherWatcher, pollWatcher]).off(_this.allEvents);
          pusherWatcher.stopWatching();
          return pollWatcher.stopWatching();
        });
      };

      UrlFile.prototype.__listenWatcher = function(watcher) {
        var _this = this;
        return watcher.on('progress', function(e, data) {
          _this.fileSize = data.total;
          return _this.__uploadDf.notify(data.done / data.total);
        }).on('success', function(e, data) {
          $(e.target).trigger('progress', data);
          _this.fileId = data.uuid;
          _this.fileName = data.original_filename;
          return _this.__uploadDf.resolve();
        }).on('error fail', this.__uploadDf.reject);
      };

      return UrlFile;

    })(ns.BaseFile);
    PusherWatcher = (function() {
      function PusherWatcher(pusherKey) {
        this.pusher = pusher.getPusher(pusherKey, 'url-upload');
      }

      PusherWatcher.prototype.watch = function(token) {
        var channel,
          _this = this;
        channel = this.pusher.subscribe("task-status-" + token);
        return channel.bind_all(function(ev, data) {
          return $(_this).trigger(ev, data);
        });
      };

      PusherWatcher.prototype.stopWatching = function() {
        return this.pusher.release();
      };

      return PusherWatcher;

    })();
    return PollWatcher = (function() {
      function PollWatcher(poolUrl) {
        this.poolUrl = poolUrl;
      }

      PollWatcher.prototype.watch = function(token) {
        var bind,
          _this = this;
        this.token = token;
        bind = function() {
          return _this.__updateStatus().done(function() {
            if (_this.interval) {
              return _this.interval = setTimeout(bind, 250);
            }
          });
        };
        return this.interval = setTimeout(bind, 0);
      };

      PollWatcher.prototype.stopWatching = function() {
        if (this.interval) {
          clearTimeout(this.interval);
        }
        return this.interval = null;
      };

      PollWatcher.prototype.__updateStatus = function() {
        var _this = this;
        return utils.jsonp(this.poolUrl, {
          token: this.token
        }).fail(function(error) {
          _this.stopWatching();
          return $(_this).trigger('error');
        }).done(function(data) {
          return $(_this).trigger(data.status, data);
        });
      };

      return PollWatcher;

    })();
  });

}).call(this);
(function() {
  var $, namespace, utils,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  namespace = uploadcare.namespace, $ = uploadcare.jQuery, utils = uploadcare.utils;

  namespace('uploadcare.files', function(ns) {
    ns.UploadedFile = (function(_super) {
      __extends(UploadedFile, _super);

      function UploadedFile(settings, fileIdOrUrl) {
        var cdnUrl;
        UploadedFile.__super__.constructor.apply(this, arguments);
        cdnUrl = utils.splitCdnUrl(fileIdOrUrl);
        if (cdnUrl) {
          this.fileId = cdnUrl[1];
          if (cdnUrl[2]) {
            this.cdnUrlModifiers = cdnUrl[2];
          }
        } else {
          this.__rejectApi('baddata');
        }
      }

      UploadedFile.prototype.__startUpload = function() {
        return this.__uploadDf.resolve();
      };

      return UploadedFile;

    })(ns.BaseFile);
    return ns.ReadyFile = (function(_super) {
      __extends(ReadyFile, _super);

      function ReadyFile(settings, data) {
        ReadyFile.__super__.constructor.apply(this, arguments);
        if (!data) {
          this.__rejectApi('deleted');
        } else {
          this.fileId = data.uuid;
          this.__handleFileData(data);
        }
      }

      ReadyFile.prototype.__startUpload = function() {
        return this.__uploadDf.resolve();
      };

      return ReadyFile;

    })(ns.BaseFile);
  });

}).call(this);
(function() {
  var $, namespace, s, t, utils, _ref,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  namespace = uploadcare.namespace, $ = uploadcare.jQuery, utils = uploadcare.utils, (_ref = uploadcare.locale, t = _ref.t), s = uploadcare.settings;

  namespace('uploadcare.files', function(ns) {
    ns.FileGroup = (function() {
      function FileGroup(files, settings) {
        var _this = this;
        this.settings = s.build(settings);
        this.__fileColl = new utils.CollectionOfPromises(files);
        this.__allFilesDf = $.when.apply($, this.files());
        this.__fileInfosDf = (function() {
          var file;
          files = (function() {
            var _i, _len, _ref1, _results;
            _ref1 = this.files();
            _results = [];
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              file = _ref1[_i];
              _results.push(file.then(null, function(err, info) {
                return $.when(info);
              }));
            }
            return _results;
          }).call(_this);
          return $.when.apply($, files);
        })();
        this.__createGroupDf = $.Deferred();
        this.__initApiDeferred();
      }

      FileGroup.prototype.files = function() {
        return this.__fileColl.get();
      };

      FileGroup.prototype.__save = function() {
        var _this = this;
        if (!this.__saved) {
          this.__saved = true;
          return this.__allFilesDf.done(function() {
            return _this.__createGroup().done(function(groupInfo) {
              _this.__uuid = groupInfo.id;
              return _this.__buildInfo(function(info) {
                if (_this.settings.imagesOnly && !info.isImage) {
                  return _this.__createGroupDf.reject('image', info);
                } else {
                  return _this.__createGroupDf.resolve(info);
                }
              });
            }).fail(function() {
              return _this.__createGroupDf.reject('createGroup');
            });
          });
        }
      };

      FileGroup.prototype.promise = function() {
        this.__save();
        return this.__apiDf.promise();
      };

      FileGroup.prototype.__initApiDeferred = function() {
        var notify, reject, resolve,
          _this = this;
        this.__apiDf = $.Deferred();
        this.__progressState = 'uploading';
        reject = function(err) {
          return _this.__buildInfo(function(info) {
            return _this.__apiDf.reject(err, info);
          });
        };
        resolve = function(info) {
          return _this.__apiDf.resolve(info);
        };
        notify = function() {
          return _this.__apiDf.notify(_this.__progressInfo());
        };
        notify();
        this.__fileColl.onAnyProgress.add(notify);
        this.__allFilesDf.done(function() {
          _this.__progressState = 'uploaded';
          return notify();
        }).fail(reject);
        return this.__createGroupDf.done(function(info) {
          _this.__progressState = 'ready';
          notify();
          return resolve(info);
        }).fail(reject);
      };

      FileGroup.prototype.__progressInfo = function() {
        var progress, progressInfo, progressInfos, _i, _len;
        progress = 0;
        progressInfos = this.__fileColl.lastProgresses();
        for (_i = 0, _len = progressInfos.length; _i < _len; _i++) {
          progressInfo = progressInfos[_i];
          progress += ((progressInfo != null ? progressInfo.progress : void 0) || 0) / progressInfos.length;
        }
        return {
          state: this.__progressState,
          uploadProgress: progress,
          progress: this.__progressState === 'ready' ? 1 : progress * 0.9
        };
      };

      FileGroup.prototype.__buildInfo = function(cb) {
        var info;
        info = {
          uuid: this.__uuid,
          cdnUrl: "" + this.settings.cdnBase + "/" + this.__uuid + "/",
          name: t('file', this.__fileColl.length()),
          count: this.__fileColl.length(),
          size: 0,
          isImage: true,
          isStored: true
        };
        return this.__fileInfosDf.done(function() {
          var infos, _i, _info, _len;
          infos = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          for (_i = 0, _len = infos.length; _i < _len; _i++) {
            _info = infos[_i];
            info.size += _info.size;
            if (!_info.isImage) {
              info.isImage = false;
            }
            if (!_info.isStored) {
              info.isStored = false;
            }
          }
          return cb(info);
        });
      };

      FileGroup.prototype.__createGroup = function() {
        var df,
          _this = this;
        df = $.Deferred();
        if (this.__fileColl.length()) {
          this.__fileInfosDf.done(function() {
            var info, infos;
            infos = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            return utils.jsonp("" + _this.settings.urlBase + "/group/", 'POST', {
              pub_key: _this.settings.publicKey,
              files: (function() {
                var _i, _len, _results;
                _results = [];
                for (_i = 0, _len = infos.length; _i < _len; _i++) {
                  info = infos[_i];
                  _results.push(info.uuid);
                }
                return _results;
              })()
            }).fail(df.reject).done(df.resolve);
          });
        } else {
          df.reject();
        }
        return df.promise();
      };

      FileGroup.prototype.api = function() {
        if (!this.__api) {
          this.__api = utils.bindAll(this, ['promise', 'files']);
        }
        return this.__api;
      };

      return FileGroup;

    })();
    return ns.SavedFileGroup = (function(_super) {
      __extends(SavedFileGroup, _super);

      function SavedFileGroup(__data, settings) {
        var files;
        this.__data = __data;
        files = uploadcare.filesFrom('ready', this.__data.files, settings);
        SavedFileGroup.__super__.constructor.call(this, files, settings);
      }

      SavedFileGroup.prototype.__createGroup = function() {
        return utils.wrapToPromise(this.__data);
      };

      return SavedFileGroup;

    })(ns.FileGroup);
  });

  namespace('uploadcare', function(ns) {
    ns.FileGroup = function(filesAndGroups, settings) {
      var file, files, item, _i, _j, _len, _len1, _ref1;
      if (filesAndGroups == null) {
        filesAndGroups = [];
      }
      files = [];
      for (_i = 0, _len = filesAndGroups.length; _i < _len; _i++) {
        item = filesAndGroups[_i];
        if (utils.isFile(item)) {
          files.push(item);
        } else if (utils.isFileGroup(item)) {
          _ref1 = item.files();
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            file = _ref1[_j];
            files.push(file);
          }
        }
      }
      return new uploadcare.files.FileGroup(files, settings).api();
    };
    return ns.loadFileGroup = function(groupIdOrUrl, settings) {
      var df, id;
      settings = s.build(settings);
      df = $.Deferred();
      id = utils.groupIdRegex.exec(groupIdOrUrl);
      if (id) {
        utils.jsonp("" + settings.urlBase + "/group/info/", {
          pub_key: settings.publicKey,
          group_id: id[0]
        }).fail(df.reject).done(function(data) {
          return df.resolve(new uploadcare.files.SavedFileGroup(data, settings).api());
        });
      } else {
        df.reject();
      }
      return df.promise();
    };
  });

  namespace('uploadcare.utils', function(utils) {
    utils.isFileGroup = function(obj) {
      return obj && obj.files && obj.promise;
    };
    utils.valueToGroup = function(value, settings) {
      var files, item, _i, _len;
      if (value) {
        if ($.isArray(value)) {
          for (_i = 0, _len = value.length; _i < _len; _i++) {
            item = value[_i];
            files = utils.valueToFile(item, settings);
          }
          value = uploadcare.FileGroup(files, settings);
        } else {
          if (!utils.isFileGroup(value)) {
            return uploadcare.loadFileGroup(value, settings);
          }
        }
      }
      return utils.wrapToPromise(value);
    };
    return utils.isFileGroupsEqual = function(group1, group2) {
      var file, files1, files2, i, mismatches;
      if (group1 === group2) {
        return true;
      } else {
        if (utils.isFileGroup(group1) && utils.isFileGroup(group2)) {
          files1 = group1.files();
          files2 = group2.files();
          if (files1.length !== files2.length) {
            return false;
          } else {
            mismatches = (function() {
              var _i, _len, _results;
              _results = [];
              for (i = _i = 0, _len = files1.length; _i < _len; i = ++_i) {
                file = files1[i];
                if (file !== files2[i]) {
                  _results.push(1);
                }
              }
              return _results;
            })();
            if (mismatches.length) {
              return false;
            } else {
              return true;
            }
          }
        } else {
          return false;
        }
      }
    };
  });

}).call(this);
(function() {
  var $, f, namespace, settings, utils;

  namespace = uploadcare.namespace, utils = uploadcare.utils, $ = uploadcare.jQuery, f = uploadcare.files, settings = uploadcare.settings;

  namespace('uploadcare', function(ns) {
    var converters;
    ns.fileFrom = function(type, data, s) {
      return ns.filesFrom(type, [data], s)[0];
    };
    ns.filesFrom = function(type, data, s) {
      var part, _i, _len, _results;
      s = settings.build(s || {});
      _results = [];
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        part = data[_i];
        _results.push(new converters[type](s, part).promise());
      }
      return _results;
    };
    return converters = {
      object: f.ObjectFile,
      input: f.InputFile,
      url: f.UrlFile,
      uploaded: f.UploadedFile,
      ready: f.ReadyFile
    };
  });

}).call(this);
(function() {
  var $, namespace, s, utils;

  namespace = uploadcare.namespace, utils = uploadcare.utils, s = uploadcare.settings, $ = uploadcare.jQuery;

  namespace('uploadcare.dragdrop', function(ns) {
    ns.support = utils.abilities.fileDragAndDrop;
    ns.uploadDrop = function(el, callback, settings) {
      settings = s.build(settings);
      return ns.receiveDrop(el, function(type, data) {
        return callback(settings.multiple ? uploadcare.filesFrom(type, data, settings) : uploadcare.fileFrom(type, data[0], settings));
      });
    };
    if (!ns.support) {
      return ns.receiveDrop = function() {};
    } else {
      ns.receiveDrop = function(el, callback) {
        ns.watchDragging(el);
        return $(el).on({
          dragover: function(e) {
            e.preventDefault();
            return e.originalEvent.dataTransfer.dropEffect = 'copy';
          },
          drop: function(e) {
            var dt, uri, uris, _i, _len, _ref;
            e.preventDefault();
            dt = e.originalEvent.dataTransfer;
            if (!dt) {
              return;
            }
            if (dt.files.length) {
              return callback('object', dt.files);
            } else {
              uris = [];
              _ref = dt.getData('text/uri-list').split();
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                uri = _ref[_i];
                uri = $.trim(uri);
                if (uri && uri[0] !== '#') {
                  uris.push(uri);
                }
              }
              if (uris) {
                return callback('url', uris);
              }
            }
          }
        });
      };
      ns.watchDragging = function(el, receiver) {
        var active, changeState, delayedEnter;
        delayedEnter = false;
        active = false;
        changeState = function(newActive) {
          if (active !== newActive) {
            return $(el).toggleClass('uploadcare-dragging', active = newActive);
          }
        };
        return $(receiver || el).on({
          dragenter: function() {
            return delayedEnter = utils.defer(function() {
              delayedEnter = false;
              return changeState(true);
            });
          },
          dragleave: function() {
            if (!delayedEnter) {
              return changeState(false);
            }
          },
          'drop mouseenter': function() {
            if (delayedEnter) {
              clearTimeout(delayedEnter);
            }
            return utils.defer(function() {
              return changeState(false);
            });
          }
        });
      };
      return ns.watchDragging('body', document);
    }
  });

}).call(this);
(function() {
  var $, abilities, files, namespace, tpl, _ref, _ref1,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  namespace = uploadcare.namespace, files = uploadcare.files, $ = uploadcare.jQuery, (_ref = uploadcare.utils, abilities = _ref.abilities), (_ref1 = uploadcare.templates, tpl = _ref1.tpl);

  namespace('uploadcare.ui.progress', function(ns) {
    ns.Circle = (function() {
      function Circle(element) {
        this.update = __bind(this.update, this);
        if (abilities.canvas) {
          this.renderer = new ns.CanvasRenderer(element);
        } else {
          this.renderer = new ns.TextRenderer(element);
        }
        this.observed = null;
      }

      Circle.prototype.listen = function(file, selector) {
        var selectorFn,
          _this = this;
        if (selector == null) {
          selector = 'uploadProgress';
        }
        this.reset();
        selectorFn = selector != null ? function(info) {
          return info[selector];
        } : function(x) {
          return x;
        };
        this.observed = file;
        if (this.observed.state() === "resolved") {
          this.renderer.setValue(1, true);
        } else {
          this.observed.progress(function(progress) {
            if (file === _this.observed) {
              return _this.renderer.setValue(selectorFn(progress));
            }
          }).always(function(uploadedFile) {
            if (file === _this.observed) {
              return _this.renderer.setValue(1, false);
            }
          });
        }
        return this;
      };

      Circle.prototype.reset = function(filled) {
        if (filled == null) {
          filled = false;
        }
        this.observed = null;
        return this.renderer.setValue((filled ? 1 : 0), true);
      };

      Circle.prototype.update = function() {
        return this.renderer.update();
      };

      return Circle;

    })();
    ns.BaseRenderer = (function() {
      function BaseRenderer(el) {
        this.element = $(el);
        this.element.data('uploadcare-progress-renderer', this);
        this.element.addClass('uploadcare-widget-circle');
      }

      BaseRenderer.prototype.update = function() {};

      return BaseRenderer;

    })();
    ns.TextRenderer = (function(_super) {
      __extends(TextRenderer, _super);

      function TextRenderer() {
        TextRenderer.__super__.constructor.apply(this, arguments);
        this.element.addClass('uploadcare-widget-circle--text');
        this.element.html(tpl('circle-text'));
        this.text = this.element.find('@uploadcare-circle-text');
      }

      TextRenderer.prototype.setValue = function(val) {
        val = Math.round(val * 100);
        return this.text.html("" + val + " %");
      };

      return TextRenderer;

    })(ns.BaseRenderer);
    return ns.CanvasRenderer = (function(_super) {
      __extends(CanvasRenderer, _super);

      function CanvasRenderer() {
        CanvasRenderer.__super__.constructor.apply(this, arguments);
        this.canvasSize = Math.floor(Math.min(this.element.width(), this.element.height())) * 2;
        this.canvasEl = $('<canvas>').prop({
          width: this.canvasSize,
          height: this.canvasSize
        });
        this.canvasCtx = this.canvasEl.get(0).getContext('2d');
        this.element.addClass('uploadcare-widget-circle--canvas');
        this.element.html(this.canvasEl);
        this.setValue(0, true);
      }

      CanvasRenderer.prototype.update = function() {
        var arc, ctx, half;
        if (this.canvasCtx) {
          ctx = this.canvasCtx;
          half = this.canvasSize / 2;
          arc = function(radius, val) {
            var offset;
            offset = -Math.PI / 2;
            ctx.beginPath();
            ctx.moveTo(half, half);
            ctx.arc(half, half, radius, offset, offset + 2 * Math.PI * val, false);
            return ctx.fill();
          };
          ctx.clearRect(0, 0, this.canvasSize, this.canvasSize);
          ctx.globalCompositeOperation = 'source-over';
          ctx.fillStyle = this.element.css('border-left-color');
          arc(half - .5, 1);
          ctx.fillStyle = this.element.css('color');
          arc(half, this.val);
          ctx.globalCompositeOperation = 'destination-out';
          return arc(half / 7, 1);
        }
      };

      CanvasRenderer.prototype.__animateValue = function(target) {
        var speed, start, val,
          _this = this;
        val = this.val;
        start = new Date();
        speed = target > val ? 2 : -2;
        return this.__animIntervalId = setInterval(function() {
          var current;
          current = val + (new Date() - start) / 1000 * speed;
          current = (speed > 0 ? Math.min : Math.max)(current, target);
          if (current === target) {
            _this.__stopAnimation();
          }
          return _this.__setValue(current);
        }, 15);
      };

      CanvasRenderer.prototype.__stopAnimation = function() {
        if (this.__animIntervalId) {
          clearInterval(this.__animIntervalId);
          return this.__animIntervalId = null;
        }
      };

      CanvasRenderer.prototype.__setValue = function(val) {
        this.val = val;
        return this.update();
      };

      CanvasRenderer.prototype.setValue = function(val, instant) {
        if (instant == null) {
          instant = false;
        }
        this.__stopAnimation();
        if (instant) {
          return this.__setValue(val);
        } else {
          return this.__animateValue(val);
        }
      };

      return CanvasRenderer;

    })(ns.BaseRenderer);
  });

}).call(this);
(function() {
  var $, namespace, progress, t, tpl, utils, _ref, _ref1, _ref2;

  namespace = uploadcare.namespace, $ = uploadcare.jQuery, utils = uploadcare.utils, (_ref = uploadcare.ui, progress = _ref.progress), (_ref1 = uploadcare.locale, t = _ref1.t), (_ref2 = uploadcare.templates, tpl = _ref2.tpl);

  namespace('uploadcare.widget', function(ns) {
    return ns.Template = (function() {
      function Template(settings, element) {
        this.settings = settings;
        this.element = element;
        this.content = $(tpl('widget'));
        this.element.after(this.content);
        this.circle = new progress.Circle(this.content.find('@uploadcare-widget-status'));
        this.statusText = this.content.find('@uploadcare-widget-text');
      }

      Template.prototype.addButton = function(name, caption) {
        if (caption == null) {
          caption = '';
        }
        return $(tpl('widget-button', {
          name: name,
          caption: caption
        })).appendTo(this.content);
      };

      Template.prototype.setStatus = function(status) {
        var form, prefix;
        prefix = 'uploadcare-widget-status-';
        this.content.removeClass(prefix + this.content.attr('data-status'));
        this.content.attr('data-status', status);
        this.content.addClass(prefix + status);
        form = this.element.closest('@uploadcare-upload-form');
        return form.trigger("" + status + ".uploadcare");
      };

      Template.prototype.reset = function() {
        this.circle.reset();
        this.setStatus('ready');
        return this.__file = null;
      };

      Template.prototype.loaded = function() {
        this.setStatus('loaded');
        return this.circle.reset(true);
      };

      Template.prototype.listen = function(file) {
        var _this = this;
        this.__file = file;
        this.circle.listen(file);
        this.setStatus('started');
        return file.progress(function(info) {
          if (file === _this.__file) {
            switch (info.state) {
              case 'uploading':
                return _this.statusText.text(t('uploading'));
              case 'uploaded':
                return _this.statusText.text(t('loadingInfo'));
            }
          }
        });
      };

      Template.prototype.error = function(type) {
        this.statusText.text(t("errors." + (type || 'default')));
        return this.setStatus('error');
      };

      Template.prototype.setFileInfo = function(info) {
        return this.statusText.html(tpl('widget-file-name', info));
      };

      return Template;

    })();
  });

}).call(this);
(function() {
  var $, namespace, t, tpl, _ref, _ref1;

  namespace = uploadcare.namespace, $ = uploadcare.jQuery, (_ref = uploadcare.templates, tpl = _ref.tpl), (_ref1 = uploadcare.locale, t = _ref1.t);

  namespace('uploadcare.widget.tabs', function(ns) {
    return ns.BaseSourceTab = (function() {
      var CLASS_PREFIX, ROLE_PREFIX;

      CLASS_PREFIX = 'uploadcare-dialog-source-base-';

      ROLE_PREFIX = '@' + CLASS_PREFIX;

      function BaseSourceTab(container, tabButton, dialogApi, settings) {
        var notDisabled, updateFooter,
          _this = this;
        this.container = container;
        this.tabButton = tabButton;
        this.dialogApi = dialogApi;
        this.settings = settings;
        this.container.append(tpl('source-tab-base'));
        this.wrap = this.container.find(ROLE_PREFIX + 'wrap');
        notDisabled = ':not(.uploadcare-disabled-el)';
        this.container.on('click', ROLE_PREFIX + 'show-files' + notDisabled, function() {
          return _this.dialogApi.switchTab('preview');
        });
        this.container.on('click', ROLE_PREFIX + 'done' + notDisabled, this.dialogApi.done);
        updateFooter = function() {
          var files, footer, tooFewFiles, tooManyFiles;
          files = _this.dialogApi.fileColl.length();
          tooManyFiles = _this.settings.multipleMax !== 0 && files > _this.settings.multipleMax;
          tooFewFiles = files < _this.settings.multipleMin;
          _this.container.find(ROLE_PREFIX + 'done').toggleClass('uploadcare-disabled-el', tooManyFiles || tooFewFiles);
          _this.container.find(ROLE_PREFIX + 'show-files').toggleClass('uploadcare-disabled-el', files === 0);
          footer = tooManyFiles ? t('dialog.tabs.preview.multiple.tooManyFiles').replace('%max%', _this.settings.multipleMax) : files && tooFewFiles ? t('dialog.tabs.preview.multiple.tooFewFiles').replace('%min%', _this.settings.multipleMin) : t('dialog.tabs.preview.multiple.title');
          _this.container.find(ROLE_PREFIX + 'footer-text').toggleClass('uploadcare-error', tooManyFiles).text(footer.replace('%files%', t('file', files)));
          return _this.container.find("." + CLASS_PREFIX + "counter").toggleClass('uploadcare-error', tooManyFiles).text(files ? "(" + files + ")" : "");
        };
        updateFooter();
        this.dialogApi.fileColl.onAdd.add(updateFooter);
        this.dialogApi.fileColl.onRemove.add(updateFooter);
      }

      return BaseSourceTab;

    })();
  });

}).call(this);
(function() {
  var $, dragdrop, namespace, tpl, utils, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  namespace = uploadcare.namespace, utils = uploadcare.utils, dragdrop = uploadcare.dragdrop, $ = uploadcare.jQuery, (_ref = uploadcare.templates, tpl = _ref.tpl);

  namespace('uploadcare.widget.tabs', function(ns) {
    return ns.FileTab = (function(_super) {
      __extends(FileTab, _super);

      function FileTab() {
        var _this = this;
        FileTab.__super__.constructor.apply(this, arguments);
        this.wrap.append(tpl('tab-file', {
          tabs: this.settings.tabs
        }));
        this.wrap.addClass('uploadcare-dialog-padding');
        this.wrap.on('click', '@uploadcare-dialog-switch-tab', function(e) {
          return _this.dialogApi.switchTab($(e.target).data('tab'));
        });
        this.__setupFileButton();
        this.__initDragNDrop();
      }

      FileTab.prototype.__initDragNDrop = function() {
        var dropArea,
          _this = this;
        dropArea = this.wrap.find('@uploadcare-drop-area');
        if (utils.abilities.fileDragAndDrop) {
          dragdrop.receiveDrop(dropArea, function(type, data) {
            _this.dialogApi.addFiles(type, data);
            return _this.dialogApi.switchTab('preview');
          });
          return this.wrap.addClass("uploadcare-draganddrop");
        }
      };

      FileTab.prototype.__setupFileButton = function() {
        var fileButton,
          _this = this;
        fileButton = this.wrap.find('@uploadcare-dialog-browse-file');
        return utils.fileInput(fileButton, this.settings, function(input) {
          if (utils.abilities.sendFileAPI) {
            _this.dialogApi.addFiles('object', input.files);
          } else {
            _this.dialogApi.addFiles('input', [input]);
          }
          return _this.dialogApi.switchTab('preview');
        });
      };

      return FileTab;

    })(ns.BaseSourceTab);
  });

}).call(this);
(function() {
  var $, namespace, t, tpl, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  namespace = uploadcare.namespace, $ = uploadcare.jQuery, (_ref = uploadcare.templates, tpl = _ref.tpl);

  t = uploadcare.locale.t;

  namespace('uploadcare.widget.tabs', function(ns) {
    return ns.UrlTab = (function(_super) {
      var fixUrl, urlRegexp;

      __extends(UrlTab, _super);

      urlRegexp = /^[a-z][a-z0-9+\-.]*:?\/\//;

      fixUrl = function(url) {
        url = $.trim(url);
        if (urlRegexp.test(url)) {
          return url;
        } else {
          return 'http://' + url;
        }
      };

      function UrlTab() {
        var button, input,
          _this = this;
        UrlTab.__super__.constructor.apply(this, arguments);
        this.wrap.append(tpl('tab-url'));
        this.wrap.addClass('uploadcare-dialog-padding');
        input = this.wrap.find('@uploadcare-dialog-url-input');
        input.on('change keyup input', function() {
          return button.prop('disabled', !$.trim(this.value));
        });
        button = this.wrap.find('@uploadcare-dialog-url-submit').prop('disabled', true);
        this.wrap.find('@uploadcare-dialog-url-form').on('submit', function() {
          var url;
          if (url = fixUrl(input.val())) {
            _this.dialogApi.addFiles('url', [url]);
            input.val('');
          }
          return false;
        });
      }

      return UrlTab;

    })(ns.BaseSourceTab);
  });

}).call(this);
(function() {
  var $, namespace, tpl, utils, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  namespace = uploadcare.namespace, utils = uploadcare.utils, $ = uploadcare.jQuery, (_ref = uploadcare.templates, tpl = _ref.tpl);

  namespace('uploadcare.widget.tabs', function(ns) {
    return ns.CameraTab = (function(_super) {
      __extends(CameraTab, _super);

      function CameraTab() {
        this.__capture = __bind(this.__capture, this);
        this.__mirror = __bind(this.__mirror, this);
        this.__requestCamera = __bind(this.__requestCamera, this);
        var _this = this;
        CameraTab.__super__.constructor.apply(this, arguments);
        if (!this.__checkCompatibility()) {
          this.wrap.hide();
          this.tabButton.hide();
          return;
        }
        this.__loaded = false;
        this.mirrored = true;
        this.wrap.append(tpl('tab-camera'));
        this.wrap.addClass('uploadcare-dialog-padding uploadcare-dialog-camera-requested');
        this.wrap.find('.uploadcare-dialog-camera-capture').on('click', this.__capture);
        this.wrap.find('.uploadcare-dialog-camera-mirror').on('click', this.__mirror);
        this.wrap.find('.uploadcare-dialog-camera-retry').on('click', this.__requestCamera);
        this.video = this.wrap.find('video');
        this.video.on('loadeddata', function() {
          return this.play();
        });
        this.dialogApi.onSwitched.add(function(_, switchedToMe) {
          if (switchedToMe && !_this.__loaded) {
            return _this.__requestCamera();
          }
        });
        this.dialogApi.dialog.always(function() {
          var _ref1, _ref2;
          if ((_ref1 = _this.URL) != null) {
            _ref1.revokeObjectURL(_this.video.prop('src'));
          }
          return (_ref2 = _this.__stream) != null ? typeof _ref2.stop === "function" ? _ref2.stop() : void 0 : void 0;
        });
      }

      CameraTab.prototype.__checkCompatibility = function() {
        this.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        this.URL = window.URL || window.webkitURL;
        return !!this.getUserMedia && Uint8Array;
      };

      CameraTab.prototype.__requestCamera = function() {
        var _this = this;
        this.__loaded = true;
        return this.getUserMedia.call(navigator, {
          video: {
            optional: [
              {
                minWidth: 320
              }, {
                minWidth: 640
              }, {
                minWidth: 1024
              }, {
                minWidth: 1280
              }, {
                minWidth: 1920
              }
            ]
          }
        }, function(stream) {
          _this.wrap.removeClass('uploadcare-dialog-camera-requested').removeClass('uploadcare-dialog-camera-denied').addClass('uploadcare-dialog-camera-ready');
          _this.__stream = stream;
          if (_this.URL) {
            _this.video.prop('src', _this.URL.createObjectURL(stream));
          } else {
            _this.video.prop('src', stream);
          }
          return _this.video[0].play();
        }, function(error) {
          if (error === "NO_DEVICES_FOUND" || error.name === 'DevicesNotFoundError') {
            _this.wrap.addClass('uploadcare-dialog-camera-not-founded');
          } else {
            _this.wrap.addClass('uploadcare-dialog-camera-denied');
          }
          return _this.__loaded = false;
        });
      };

      CameraTab.prototype.__mirror = function() {
        this.mirrored = !this.mirrored;
        return this.video.toggleClass('uploadcare-dialog-camera--mirrored', this.mirrored);
      };

      CameraTab.prototype.__capture = function() {
        var canvas, ctx, h, video, w,
          _this = this;
        video = this.video[0];
        w = video.videoWidth;
        h = video.videoHeight;
        canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        ctx = canvas.getContext('2d');
        if (this.mirrored) {
          ctx.translate(w, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, w, h);
        return utils.canvasToBlob(canvas, 'image/jpeg', 0.9, function(blob) {
          blob.name = "camera.jpg";
          _this.dialogApi.addFiles('object', [blob]);
          return _this.dialogApi.switchTab('preview');
        });
      };

      return CameraTab;

    })(ns.BaseSourceTab);
  });

}).call(this);
(function() {
  var $, files, locale, namespace, t, tabsCss, utils, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  namespace = uploadcare.namespace, locale = uploadcare.locale, utils = uploadcare.utils, tabsCss = uploadcare.tabsCss, $ = uploadcare.jQuery, (_ref = uploadcare.locale, t = _ref.t), files = uploadcare.files;

  namespace('uploadcare.widget.tabs', function(ns) {
    return ns.RemoteTabFor = function(service) {
      var RemoteTab;
      return RemoteTab = (function(_super) {
        __extends(RemoteTab, _super);

        function RemoteTab() {
          this.__createIframe = __bind(this.__createIframe, this);
          var _this = this;
          RemoteTab.__super__.constructor.apply(this, arguments);
          this.wrap.addClass('uploadcare-dialog-remote-iframe-wrap');
          this.dialogApi.onSwitched.add(function(_, switchedToMe) {
            if (switchedToMe) {
              _this.__createIframe();
            }
            return _this.__sendMessage({
              type: 'visibility-changed',
              visible: switchedToMe
            });
          });
        }

        RemoteTab.prototype.remoteUrl = function() {
          return ("" + this.settings.socialBase + "/window/" + service + "?") + $.param({
            lang: this.settings.locale,
            public_key: this.settings.publicKey,
            widget_version: uploadcare.version,
            images_only: this.settings.imagesOnly
          });
        };

        RemoteTab.prototype.__sendMessage = function(messageObj) {
          var _ref1;
          return (_ref1 = this.iframe) != null ? _ref1[0].contentWindow.postMessage(JSON.stringify(messageObj), '*') : void 0;
        };

        RemoteTab.prototype.__createIframe = function() {
          var _this = this;
          if (this.iframe) {
            return;
          }
          this.iframe = $('<iframe>', {
            src: this.remoteUrl(),
            marginheight: 0,
            marginwidth: 0,
            frameborder: 0,
            allowTransparency: "true"
          }).addClass('uploadcare-dialog-remote-iframe').appendTo(this.wrap).on('load', function() {
            var style, url, _i, _j, _len, _len1, _ref1, _ref2;
            _this.iframe.css('opacity', '1');
            _ref1 = tabsCss.urls;
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              url = _ref1[_i];
              _this.__sendMessage({
                type: 'embed-css',
                url: url
              });
            }
            _ref2 = tabsCss.styles;
            for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
              style = _ref2[_j];
              _this.__sendMessage({
                type: 'embed-css',
                style: style
              });
            }
          });
          return $(window).on("message", function(_arg) {
            var e, file, message, url;
            e = _arg.originalEvent;
            if (e.source !== _this.iframe[0].contentWindow) {
              return;
            }
            try {
              message = JSON.parse(e.data);
            } catch (_error) {
              return;
            }
            if (message.type === 'file-selected') {
              url = (function() {
                var key, type, _i, _len, _ref1;
                if (message.alternatives) {
                  _ref1 = _this.settings.preferredTypes;
                  for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                    type = _ref1[_i];
                    type = utils.globRegexp(type);
                    for (key in message.alternatives) {
                      if (type.test(key)) {
                        return message.alternatives[key];
                      }
                    }
                  }
                }
                return message.url;
              })();
              file = new files.UrlFile(_this.settings, url);
              if (message.filename) {
                file.setName(message.filename);
              }
              if (message.is_image != null) {
                file.setIsImage(message.is_image);
              }
              return _this.dialogApi.addFiles([file.promise()]);
            }
          });
        };

        return RemoteTab;

      })(ns.BaseSourceTab);
    };
  });

}).call(this);
(function() {
  var $, Circle, namespace, _ref, _ref1;

  namespace = uploadcare.namespace, (_ref = uploadcare.ui, (_ref1 = _ref.progress, Circle = _ref1.Circle)), $ = uploadcare.jQuery;

  namespace('uploadcare.widget.tabs', function(ns) {
    return ns.BasePreviewTab = (function() {
      var PREFIX;

      PREFIX = '@uploadcare-dialog-preview-';

      function BasePreviewTab(container, tabButton, dialogApi, settings) {
        var notDisabled,
          _this = this;
        this.container = container;
        this.tabButton = tabButton;
        this.dialogApi = dialogApi;
        this.settings = settings;
        this.__initTabButtonCircle();
        notDisabled = ':not(.uploadcare-disabled-el)';
        this.container.on('click', PREFIX + 'back' + notDisabled, function() {
          return _this.dialogApi.fileColl.clear();
        });
        this.container.on('click', PREFIX + 'done' + notDisabled, this.dialogApi.done);
      }

      BasePreviewTab.prototype.__initTabButtonCircle = function() {
        var circle, circleDf, circleEl, update,
          _this = this;
        circleEl = $('<div class="uploadcare-dialog-icon">').appendTo(this.tabButton);
        circleDf = $.Deferred();
        update = function() {
          var infos, progress, progressInfo, _i, _len;
          infos = _this.dialogApi.fileColl.lastProgresses();
          progress = 0;
          for (_i = 0, _len = infos.length; _i < _len; _i++) {
            progressInfo = infos[_i];
            progress += ((progressInfo != null ? progressInfo.progress : void 0) || 0) / infos.length;
          }
          return circleDf.notify({
            progress: progress
          });
        };
        this.dialogApi.fileColl.onAnyProgress.add(update);
        this.dialogApi.fileColl.onAdd.add(update);
        this.dialogApi.fileColl.onRemove.add(update);
        update();
        circle = new Circle(circleEl).listen(circleDf.promise(), 'progress');
        return this.dialogApi.onSwitched.add(circle.update);
      };

      return BasePreviewTab;

    })();
  });

}).call(this);
(function() {
  var $, CropWidget, namespace, progress, t, tpl, utils, _ref, _ref1, _ref2, _ref3,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  namespace = uploadcare.namespace, utils = uploadcare.utils, (_ref = uploadcare.ui, progress = _ref.progress), (_ref1 = uploadcare.templates, tpl = _ref1.tpl), $ = uploadcare.jQuery, (_ref2 = uploadcare.crop, CropWidget = _ref2.CropWidget), (_ref3 = uploadcare.locale, t = _ref3.t);

  namespace('uploadcare.widget.tabs', function(ns) {
    return ns.PreviewTab = (function(_super) {
      __extends(PreviewTab, _super);

      function PreviewTab() {
        this.__setFile = __bind(this.__setFile, this);
        var _this = this;
        PreviewTab.__super__.constructor.apply(this, arguments);
        $.each(this.dialogApi.fileColl.get(), function(i, file) {
          return _this.__setFile(file);
        });
        this.dialogApi.fileColl.onAdd.add(this.__setFile);
        this.widget = null;
      }

      PreviewTab.prototype.__setFile = function(file) {
        var ifCur,
          _this = this;
        this.file = file;
        ifCur = function(fn) {
          return function() {
            if (file === _this.file) {
              return fn.apply(null, arguments);
            }
          };
        };
        this.file.progress(ifCur(utils.once(function(info) {
          return _this.__setState('unknown', {
            file: info.incompleteFileInfo
          });
        })));
        this.file.done(ifCur(function(file) {
          var state;
          state = file.isImage ? 'image' : 'regular';
          return _this.__setState(state, {
            file: file
          });
        }));
        return this.file.fail(ifCur(function(error, file) {
          return _this.__setState('error', {
            error: error,
            file: file
          });
        }));
      };

      PreviewTab.prototype.element = function(name) {
        return this.container.find('@uploadcare-dialog-preview-' + name);
      };

      PreviewTab.prototype.__setState = function(state, data) {
        this.container.empty().append(tpl("tab-preview-" + state, data));
        if (state === 'unknown' && this.settings.crop) {
          this.element('done').hide();
        }
        if (state === 'image') {
          return this.initImage(data.file);
        }
      };

      PreviewTab.prototype.initImage = function(info) {
        var done, img, imgLoader, imgSize, startCrop,
          _this = this;
        img = this.element('image');
        done = this.element('done');
        imgSize = [info.originalImageInfo.width, info.originalImageInfo.height];
        imgLoader = utils.imageLoader(img.attr('src')).done(function() {
          return _this.element('root').addClass('uploadcare-dialog-preview--loaded');
        }).fail(function() {
          _this.file = null;
          return _this.__setState('error', {
            error: 'loadImage'
          });
        });
        startCrop = function() {
          done.removeClass('uploadcare-disabled-el');
          _this.widget = new CropWidget(img, imgSize, _this.settings.crop[0]);
          _this.widget.setSelectionFromModifiers(info.cdnUrlModifiers);
          return done.click(function() {
            var opts;
            opts = _this.widget.getSelectionWithModifiers();
            return _this.dialogApi.fileColl.replace(_this.file, _this.file.then(function(info) {
              info.cdnUrlModifiers = opts.modifiers;
              info.cdnUrl = "" + info.originalUrl + (opts.modifiers || '');
              info.crop = opts.crop;
              return info;
            }));
          });
        };
        if (this.settings.crop) {
          this.element('title').text(t('dialog.tabs.preview.crop.title'));
          done.addClass('uploadcare-disabled-el');
          done.text(t('dialog.tabs.preview.crop.done'));
          this.populateCropSizes();
          return imgLoader.done(function() {
            return utils.defer(startCrop);
          });
        }
      };

      PreviewTab.prototype.populateCropSizes = function() {
        var control, currentClass, template,
          _this = this;
        if (this.settings.crop.length <= 1) {
          return;
        }
        this.element('root').addClass('uploadcare-dialog-preview--with-sizes');
        control = this.element('crop-sizes');
        template = control.children();
        currentClass = 'uploadcare-crop-size--current';
        $.each(this.settings.crop, function(i, crop) {
          var caption, gcd, item, prefered, size;
          prefered = crop.preferedSize;
          if (prefered) {
            gcd = utils.gcd(prefered[0], prefered[1]);
            caption = "" + (prefered[0] / gcd) + ":" + (prefered[1] / gcd);
          } else {
            caption = t('dialog.tabs.preview.crop.free');
          }
          item = template.clone().appendTo(control).attr('data-caption', caption).on('click', function(e) {
            if (_this.widget) {
              _this.widget.setCrop(crop);
              control.find('>*').removeClass(currentClass);
              return item.addClass(currentClass);
            }
          });
          if (prefered) {
            size = utils.fitSize(prefered, [40, 40], true);
            return item.children().css({
              width: Math.max(20, size[0]),
              height: Math.max(12, size[1])
            });
          }
        });
        template.remove();
        return control.find('>*').eq(0).addClass(currentClass);
      };

      return PreviewTab;

    })(ns.BasePreviewTab);
  });

}).call(this);
(function() {
  var $, namespace, progress, t, tpl, utils, _ref, _ref1, _ref2,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  namespace = uploadcare.namespace, utils = uploadcare.utils, (_ref = uploadcare.ui, progress = _ref.progress), (_ref1 = uploadcare.templates, tpl = _ref1.tpl), $ = uploadcare.jQuery, (_ref2 = uploadcare.locale, t = _ref2.t);

  namespace('uploadcare.widget.tabs', function(ns) {
    return ns.PreviewTabMultiple = (function(_super) {
      var CLASS_PREFIX, ROLE_PREFIX;

      __extends(PreviewTabMultiple, _super);

      CLASS_PREFIX = 'uploadcare-dpm-';

      ROLE_PREFIX = '@' + CLASS_PREFIX;

      function PreviewTabMultiple() {
        this.__fileRemoved = __bind(this.__fileRemoved, this);
        this.__fileAdded = __bind(this.__fileAdded, this);
        this.__fileFailed = __bind(this.__fileFailed, this);
        this.__fileDone = __bind(this.__fileDone, this);
        this.__fileProgress = __bind(this.__fileProgress, this);
        this.__updateContainerView = __bind(this.__updateContainerView, this);
        var _this = this;
        PreviewTabMultiple.__super__.constructor.apply(this, arguments);
        this.container.append(tpl('tab-preview-multiple'));
        this.__fileTpl = $(tpl('tab-preview-multiple-file'));
        this.fileListEl = this.__find('file-list');
        this.titleEl = this.__find('title');
        this.mobileTitleEl = this.__find('mobile-title');
        this.footerTextEl = this.__find('footer-text');
        this.doneBtnEl = this.container.find('@uploadcare-dialog-preview-done');
        $.each(this.dialogApi.fileColl.get(), function(i, file) {
          _this.__fileAdded(file);
          return file.then(function(info) {
            return _this.__fileDone(file, info);
          }, function(info) {
            return _this.__fileFailed(file, info);
          }, function(info) {
            return _this.__fileProgress(file, info);
          });
        });
        this.__updateContainerView();
        this.dialogApi.fileColl.onAdd.add([this.__fileAdded, this.__updateContainerView]);
        this.dialogApi.fileColl.onRemove.add([this.__fileRemoved, this.__updateContainerView]);
        this.dialogApi.fileColl.onAnyProgress.add(this.__fileProgress);
        this.dialogApi.fileColl.onAnyDone.add(this.__fileDone);
        this.dialogApi.fileColl.onAnyFail.add(this.__fileFailed);
        this.__setupSorting();
      }

      PreviewTabMultiple.prototype.__setupSorting = function() {
        var _this = this;
        return this.fileListEl.sortable({
          touch: false,
          axis: 'y',
          start: function(info) {
            return info.dragged.css('visibility', 'hidden');
          },
          finish: function(info) {
            var elements, index;
            info.dragged.css('visibility', 'visible');
            elements = _this.__find('file-item');
            index = function(file) {
              return elements.index(_this.__fileToEl(file));
            };
            return _this.dialogApi.fileColl.sort(function(a, b) {
              return index(a) - index(b);
            });
          }
        });
      };

      PreviewTabMultiple.prototype.__find = function(s, context) {
        if (context == null) {
          context = this.container;
        }
        return $(ROLE_PREFIX + s, context);
      };

      PreviewTabMultiple.prototype.__updateContainerView = function() {
        var files, footer, title, tooFewFiles, tooManyFiles;
        files = this.dialogApi.fileColl.length();
        tooManyFiles = this.settings.multipleMax !== 0 && files > this.settings.multipleMax;
        tooFewFiles = files < this.settings.multipleMin;
        this.doneBtnEl.toggleClass('uploadcare-disabled-el', tooManyFiles || tooFewFiles);
        title = t('dialog.tabs.preview.multiple.title').replace('%files%', t('file', files));
        this.titleEl.text(title);
        footer = tooManyFiles ? t('dialog.tabs.preview.multiple.tooManyFiles').replace('%max%', this.settings.multipleMax) : files && tooFewFiles ? t('dialog.tabs.preview.multiple.tooFewFiles').replace('%min%', this.settings.multipleMin).replace('%files%', t('file', files)) : t('dialog.tabs.preview.multiple.question');
        this.footerTextEl.toggleClass('uploadcare-error', tooManyFiles || tooFewFiles).text(footer);
        return this.mobileTitleEl.toggleClass('uploadcare-error', tooManyFiles || tooFewFiles).text(tooManyFiles || tooFewFiles ? footer : title);
      };

      PreviewTabMultiple.prototype.__fileProgress = function(file, progressInfo) {
        var fileEl, info;
        fileEl = this.__fileToEl(file);
        this.__find('file-progressbar-value', fileEl).css('width', Math.round(progressInfo.progress * 100) + '%');
        info = progressInfo.incompleteFileInfo;
        this.__find('file-name', fileEl).text(info.name || t('dialog.tabs.preview.unknownName'));
        return this.__find('file-size', fileEl).text(utils.readableFileSize(info.size, '–'));
      };

      PreviewTabMultiple.prototype.__fileDone = function(file, info) {
        var fileEl;
        fileEl = this.__fileToEl(file);
        fileEl.addClass(CLASS_PREFIX + 'uploaded');
        if (info.isImage) {
          return this.__find('file-preview-wrap', fileEl).html($('<img>').attr({
            src: "" + info.originalUrl + "-/scale_crop/90x90/center/"
          }).css({
            width: 'auto',
            height: 45
          }));
        }
      };

      PreviewTabMultiple.prototype.__fileFailed = function(file, error, info) {
        var fileEl;
        fileEl = this.__fileToEl(file);
        fileEl.addClass(CLASS_PREFIX + 'error');
        return this.__find('file-error', fileEl).text(t("errors." + error));
      };

      PreviewTabMultiple.prototype.__fileAdded = function(file) {
        return $(file).data('dmp-el', this.__createFileEl(file));
      };

      PreviewTabMultiple.prototype.__fileRemoved = function(file) {
        return this.__fileToEl(file).remove();
      };

      PreviewTabMultiple.prototype.__fileToEl = function(file) {
        return $(file).data('dmp-el');
      };

      PreviewTabMultiple.prototype.__createFileEl = function(file) {
        var _this = this;
        return this.__fileTpl.clone().appendTo(this.fileListEl).on('click', ROLE_PREFIX + 'file-remove', function() {
          return _this.dialogApi.fileColl.remove(file);
        });
      };

      return PreviewTabMultiple;

    })(ns.BasePreviewTab);
  });

}).call(this);
(function() {
  var namespace, tpl, _ref;

  namespace = uploadcare.namespace, (_ref = uploadcare.templates, tpl = _ref.tpl);

  namespace('uploadcare.widget.tabs', function(ns) {
    return ns.StaticTabWith = function(tplName) {
      var StaticTab;
      return StaticTab = (function() {
        function StaticTab(container) {
          this.container = container;
          this.container.append(tpl("tab-" + tplName));
        }

        return StaticTab;

      })();
    };
  });

}).call(this);
(function() {
  var $, Circle, files, namespace, s, t, tabs, tpl, utils, _ref, _ref1, _ref2, _ref3, _ref4,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  namespace = uploadcare.namespace, utils = uploadcare.utils, (_ref = uploadcare.locale, t = _ref.t), (_ref1 = uploadcare.templates, tpl = _ref1.tpl), (_ref2 = uploadcare.ui, (_ref3 = _ref2.progress, Circle = _ref3.Circle)), files = uploadcare.files, (_ref4 = uploadcare.widget, tabs = _ref4.tabs), s = uploadcare.settings, $ = uploadcare.jQuery;

  namespace('uploadcare', function(ns) {
    var Panel, currentDialogPr, lockScroll, openedClass, registeredTabs,
      _this = this;
    lockScroll = function(el, toTop) {
      var left, top;
      top = el.scrollTop();
      left = el.scrollLeft();
      if (toTop) {
        el.scrollTop(0).scrollLeft(0);
      }
      return function() {
        return el.scrollTop(top).scrollLeft(left);
      };
    };
    $(window).on('keydown', function(e) {
      if (ns.isDialogOpened()) {
        if (e.which === 27) {
          e.stopImmediatePropagation();
          return ns.closeDialog();
        }
      }
    });
    currentDialogPr = null;
    openedClass = 'uploadcare-dialog-opened';
    ns.isDialogOpened = function() {
      return currentDialogPr !== null;
    };
    ns.closeDialog = function() {
      return currentDialogPr != null ? currentDialogPr.reject() : void 0;
    };
    ns.openDialog = function(files, tab, settings) {
      var cancelLock, dialog;
      ns.closeDialog();
      dialog = $(tpl('dialog')).appendTo('body');
      dialog.on('click', function(e) {
        var showStoppers;
        if (!$.contains(document.documentElement, e.target)) {
          return;
        }
        showStoppers = '.uploadcare-dialog-panel, a';
        if ($(e.target).is(showStoppers) || $(e.target).parents(showStoppers).length) {
          return;
        }
        return ns.closeDialog();
      });
      currentDialogPr = ns.openPanel(dialog.find('.uploadcare-dialog-placeholder'), files, tab, settings);
      dialog.addClass('uploadcare-active');
      cancelLock = lockScroll($(window), dialog.css('position') === 'absolute');
      $('html, body').addClass(openedClass);
      return currentDialogPr.always(function() {
        $('html, body').removeClass(openedClass);
        currentDialogPr = null;
        dialog.remove();
        return cancelLock();
      });
    };
    ns.openPanel = function(placeholder, files, tab, settings) {
      var filter, panel, promise;
      if ($.isPlainObject(tab)) {
        settings = tab;
        tab = null;
      }
      if (!files) {
        files = [];
      } else if (utils.isFileGroup(files)) {
        files = files.files();
      } else if (!$.isArray(files)) {
        files = [files];
      }
      settings = s.build(settings);
      panel = new Panel(settings, placeholder, files, tab).publicPromise();
      filter = function(files) {
        if (settings.multiple) {
          return uploadcare.FileGroup(files, settings);
        } else {
          return files[0];
        }
      };
      promise = utils.then(panel, filter, filter);
      promise.reject = panel.reject;
      return promise;
    };
    registeredTabs = {};
    ns.registerTab = function(tabName, constructor) {
      return registeredTabs[tabName] = constructor;
    };
    ns.registerTab('file', tabs.FileTab);
    ns.registerTab('url', tabs.UrlTab);
    ns.registerTab('camera', tabs.CameraTab);
    ns.registerTab('facebook', tabs.RemoteTabFor('facebook'));
    ns.registerTab('dropbox', tabs.RemoteTabFor('dropbox'));
    ns.registerTab('gdrive', tabs.RemoteTabFor('gdrive'));
    ns.registerTab('instagram', tabs.RemoteTabFor('instagram'));
    ns.registerTab('flickr', tabs.RemoteTabFor('flickr'));
    ns.registerTab('vk', tabs.RemoteTabFor('vk'));
    ns.registerTab('evernote', tabs.RemoteTabFor('evernote'));
    ns.registerTab('box', tabs.RemoteTabFor('box'));
    ns.registerTab('skydrive', tabs.RemoteTabFor('skydrive'));
    ns.registerTab('welcome', tabs.StaticTabWith('welcome'));
    ns.registerTab('preview', function(tabPanel, tabButton, apiForTab, settings) {
      var tabCls;
      tabCls = settings.multiple ? tabs.PreviewTabMultiple : tabs.PreviewTab;
      return new tabCls(tabPanel, tabButton, apiForTab, settings);
    });
    return Panel = (function() {
      function Panel(settings, placeholder, files, tab) {
        var sel,
          _this = this;
        this.settings = settings;
        this.switchTab = __bind(this.switchTab, this);
        this.__closePanel = __bind(this.__closePanel, this);
        this.__reject = __bind(this.__reject, this);
        this.__resolve = __bind(this.__resolve, this);
        this.addFiles = __bind(this.addFiles, this);
        this.dfd = $.Deferred();
        this.dfd.always(this.__closePanel);
        sel = '.uploadcare-dialog-panel';
        this.content = $(tpl('panel'));
        this.panel = this.content.find(sel).add(this.content.filter(sel));
        this.placeholder = $(placeholder);
        this.placeholder.replaceWith(this.content);
        if (this.settings.multiple) {
          this.panel.addClass('uploadcare-dialog-multiple');
        }
        this.files = new utils.CollectionOfPromises(files);
        this.files.onRemove.add(function() {
          if (_this.files.length() === 0) {
            return _this.__hideTab('preview');
          }
        });
        this.tabs = {};
        if (this.settings.publicKey) {
          this.__prepareTabs(tab);
        } else {
          this.__welcome();
        }
      }

      Panel.prototype.publicPromise = function() {
        var promise;
        promise = this.dfd.promise();
        promise.reject = this.__reject;
        return promise;
      };

      Panel.prototype.addFiles = function(files, data) {
        var file, _i, _len;
        if (data) {
          files = ns.filesFrom(files, data, this.settings);
        }
        if (!this.settings.multiple) {
          this.files.clear();
        }
        for (_i = 0, _len = files.length; _i < _len; _i++) {
          file = files[_i];
          this.files.add(file);
        }
        if (this.settings.previewStep) {
          this.__showTab('preview');
          if (!this.settings.multiple) {
            return this.switchTab('preview');
          }
        } else {
          return this.__resolve();
        }
      };

      Panel.prototype.apiForTab = function(tabName) {
        var onSwitched;
        onSwitched = $.Callbacks();
        this.dfd.progress(function(name) {
          return onSwitched.fire(name, name === tabName);
        });
        return {
          fileColl: this.files,
          onSwitched: onSwitched,
          addFiles: this.addFiles,
          done: this.__resolve,
          switchTab: this.switchTab,
          dialog: this.dfd.promise()
        };
      };

      Panel.prototype.__resolve = function() {
        return this.dfd.resolve(this.files.get());
      };

      Panel.prototype.__reject = function() {
        return this.dfd.reject(this.files.get());
      };

      Panel.prototype.__prepareTabs = function(tab) {
        var tabName, _i, _len, _ref5;
        this.addTab('preview');
        _ref5 = this.settings.tabs;
        for (_i = 0, _len = _ref5.length; _i < _len; _i++) {
          tabName = _ref5[_i];
          this.addTab(tabName);
        }
        if (this.files.length()) {
          this.__showTab('preview');
          return this.switchTab('preview');
        } else {
          this.__hideTab('preview');
          return this.switchTab(tab || this.settings.tabs[0]);
        }
      };

      Panel.prototype.__closePanel = function() {
        this.panel.replaceWith(this.placeholder);
        return this.content.remove();
      };

      Panel.prototype.addTab = function(name) {
        var TabCls, tabButton, tabPanel,
          _this = this;
        if (name in this.tabs) {
          return;
        }
        TabCls = registeredTabs[name];
        if (!TabCls) {
          throw new Error("No such tab: " + name);
        }
        tabPanel = $('<div>').addClass("uploadcare-dialog-tabs-panel").addClass("uploadcare-dialog-tabs-panel-" + name).appendTo(this.panel);
        tabButton = $('<div>').addClass("uploadcare-dialog-tab").addClass("uploadcare-dialog-tab-" + name).attr('title', t("dialog.tabs.names." + name)).on('click', function() {
          if (name === _this.currentTab) {
            return _this.panel.toggleClass('uploadcare-dialog-opened-tabs');
          } else {
            return _this.switchTab(name);
          }
        }).appendTo(this.panel.find('.uploadcare-dialog-tabs'));
        return this.tabs[name] = new TabCls(tabPanel, tabButton, this.apiForTab(name), this.settings);
      };

      Panel.prototype.__addFakeTab = function(name) {
        return $('<div>').addClass("uploadcare-dialog-tab uploadcare-dialog-tab-" + name).addClass('uploadcare-dialog-disabled-tab').attr('title', t("tabs." + name + ".title")).appendTo(this.panel.find('.uploadcare-dialog-tabs'));
      };

      Panel.prototype.switchTab = function(currentTab) {
        var className;
        this.currentTab = currentTab;
        this.panel.removeClass('uploadcare-dialog-opened-tabs');
        className = 'uploadcare-dialog-tab';
        this.panel.find("." + className).removeClass("" + className + "_current").filter("." + className + "-" + this.currentTab).addClass("" + className + "_current");
        className = 'uploadcare-dialog-tabs-panel';
        this.panel.find("." + className).removeClass("" + className + "_current").filter("." + className + "-" + this.currentTab).addClass("" + className + "_current");
        return this.dfd.notify(this.currentTab);
      };

      Panel.prototype.__showTab = function(tab) {
        var className;
        className = 'uploadcare-dialog-tab';
        return this.panel.find("." + className + "-" + tab).removeClass("" + className + "_hidden");
      };

      Panel.prototype.__hideTab = function(tab) {
        var className;
        if (this.currentTab === tab) {
          this.switchTab(this.settings.tabs[0]);
        }
        className = 'uploadcare-dialog-tab';
        return this.panel.find("." + className + "-" + tab).addClass("" + className + "_hidden");
      };

      Panel.prototype.__welcome = function() {
        var tabName, _i, _len, _ref5;
        this.addTab('welcome');
        _ref5 = this.settings.tabs;
        for (_i = 0, _len = _ref5.length; _i < _len; _i++) {
          tabName = _ref5[_i];
          this.__addFakeTab(tabName);
        }
        return this.switchTab('welcome');
      };

      return Panel;

    })();
  });

}).call(this);
(function() {
  var $, dragdrop, namespace, s, t, utils, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  namespace = uploadcare.namespace, utils = uploadcare.utils, s = uploadcare.settings, $ = uploadcare.jQuery, dragdrop = uploadcare.dragdrop, (_ref = uploadcare.locale, t = _ref.t);

  namespace('uploadcare.widget', function(ns) {
    return ns.BaseWidget = (function() {
      function BaseWidget(element) {
        this.reloadInfo = __bind(this.reloadInfo, this);
        this.__setObject = __bind(this.__setObject, this);
        this.__reset = __bind(this.__reset, this);
        var _this = this;
        this.element = $(element);
        this.settings = s.build(this.element.data());
        this.validators = this.settings.validators = [];
        this.currentObject = null;
        this.__onUploadComplete = $.Callbacks();
        this.__onChange = $.Callbacks().add(function(object) {
          return object != null ? object.promise().done(function(info) {
            return _this.__onUploadComplete.fire(info);
          }) : void 0;
        });
        this.__setupWidget();
        this.element.on('change.uploadcare', this.reloadInfo);
        this.__hasValue = false;
        setTimeout(function() {
          if (!_this.__hasValue) {
            return _this.reloadInfo();
          }
        }, 0);
      }

      BaseWidget.prototype.__setupWidget = function() {
        var path,
          _this = this;
        this.template = new ns.Template(this.settings, this.element);
        path = ['buttons.choose'];
        path.push(this.settings.imagesOnly ? 'images' : 'files');
        path.push(this.settings.multiple ? 'other' : 'one');
        this.template.addButton('open', t(path.join('.'))).on('click', function() {
          return _this.openDialog();
        });
        this.template.addButton('cancel', t('buttons.cancel')).on('click', function() {
          return _this.__setObject(null);
        });
        if (this.settings.clearable) {
          this.template.addButton('remove', t('buttons.remove')).on('click', function() {
            return _this.__setObject(null);
          });
        }
        this.template.content.on('click', '@uploadcare-widget-file-name', function() {
          return _this.openDialog();
        });
        dragdrop.receiveDrop(this.template.content, this.__handleDirectSelection);
        return this.template.reset();
      };

      BaseWidget.prototype.__infoToValue = function(info) {
        if (info.cdnUrlModifiers || this.settings.pathValue) {
          return info.cdnUrl;
        } else {
          return info.uuid;
        }
      };

      BaseWidget.prototype.__reset = function() {
        var object;
        object = this.currentObject;
        this.currentObject = null;
        if (object != null) {
          if (typeof object.cancel === "function") {
            object.cancel();
          }
        }
        this.template.reset();
        return this.element.val('');
      };

      BaseWidget.prototype.__setObject = function(newFile) {
        if (newFile !== this.currentObject) {
          this.__reset();
          if (newFile) {
            this.currentObject = newFile;
            this.__watchCurrentObject();
          }
          return this.__onChange.fire(this.currentObject);
        }
      };

      BaseWidget.prototype.__watchCurrentObject = function() {
        var object,
          _this = this;
        object = this.__currentFile();
        if (object) {
          this.template.listen(object);
          return object.done(function(info) {
            if (object === _this.__currentFile()) {
              return _this.__onUploadingDone(info);
            }
          }).fail(function(error) {
            if (object === _this.__currentFile()) {
              return _this.__onUploadingFailed(error);
            }
          });
        }
      };

      BaseWidget.prototype.__onUploadingDone = function(info) {
        this.element.val(this.__infoToValue(info));
        this.template.setFileInfo(info);
        return this.template.loaded();
      };

      BaseWidget.prototype.__onUploadingFailed = function(error) {
        this.__setObject(null);
        return this.template.error(error);
      };

      BaseWidget.prototype.__setExternalValue = function(value) {
        return this.__setObject(utils.valueToFile(value, this.settings));
      };

      BaseWidget.prototype.value = function(value) {
        if (value !== void 0) {
          this.__hasValue = true;
          this.__setExternalValue(value);
          return this;
        } else {
          return this.currentObject;
        }
      };

      BaseWidget.prototype.reloadInfo = function() {
        return this.value(this.element.val());
      };

      BaseWidget.prototype.openDialog = function(tab) {
        var _this = this;
        if (this.settings.systemDialog) {
          return utils.fileSelectDialog(this.template.content, this.settings, function(input) {
            return _this.__handleDirectSelection('object', input.files);
          });
        } else {
          return uploadcare.openDialog(this.currentObject, tab, this.settings).done(this.__setObject);
        }
      };

      BaseWidget.prototype.api = function() {
        if (!this.__api) {
          this.__api = utils.bindAll(this, ['openDialog', 'reloadInfo', 'value', 'validators']);
          this.__api.onChange = utils.publicCallbacks(this.__onChange);
          this.__api.onUploadComplete = utils.publicCallbacks(this.__onUploadComplete);
          this.__api.inputElement = this.element.get(0);
        }
        return this.__api;
      };

      return BaseWidget;

    })();
  });

}).call(this);
(function() {
  var $, files, namespace, utils,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  namespace = uploadcare.namespace, utils = uploadcare.utils, files = uploadcare.files, $ = uploadcare.jQuery;

  namespace('uploadcare.widget', function(ns) {
    var _ref;
    return ns.Widget = (function(_super) {
      __extends(Widget, _super);

      function Widget() {
        this.__handleDirectSelection = __bind(this.__handleDirectSelection, this);
        _ref = Widget.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Widget.prototype.__currentFile = function() {
        return this.currentObject;
      };

      Widget.prototype.__handleDirectSelection = function(type, data) {
        var file;
        file = uploadcare.fileFrom(type, data[0], this.settings);
        if (this.settings.systemDialog || !this.settings.previewStep) {
          return this.__setObject(file);
        } else {
          return uploadcare.openDialog(file, this.settings).done(this.__setObject);
        }
      };

      return Widget;

    })(ns.BaseWidget);
  });

}).call(this);
(function() {
  var $, namespace, t, utils, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  namespace = uploadcare.namespace, utils = uploadcare.utils, $ = uploadcare.jQuery, (_ref = uploadcare.locale, t = _ref.t);

  namespace('uploadcare.widget', function(ns) {
    var _ref1;
    return ns.MultipleWidget = (function(_super) {
      __extends(MultipleWidget, _super);

      function MultipleWidget() {
        this.__handleDirectSelection = __bind(this.__handleDirectSelection, this);
        this.__setObject = __bind(this.__setObject, this);
        _ref1 = MultipleWidget.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      MultipleWidget.prototype.__currentFile = function() {
        var _ref2;
        return (_ref2 = this.currentObject) != null ? _ref2.promise() : void 0;
      };

      MultipleWidget.prototype.__setObject = function(group) {
        if (!utils.isFileGroupsEqual(this.currentObject, group)) {
          return MultipleWidget.__super__.__setObject.apply(this, arguments);
        }
      };

      MultipleWidget.prototype.__setExternalValue = function(value) {
        var groupPr,
          _this = this;
        this.__lastGroupPr = groupPr = utils.valueToGroup(value, this.settings);
        this.__reset();
        this.template.setStatus('started');
        this.template.statusText.text(t('loadingInfo'));
        return groupPr.done(function(group) {
          if (_this.__lastGroupPr === groupPr) {
            return _this.__setObject(group);
          }
        }).fail(function() {
          if (_this.__lastGroupPr === groupPr) {
            return _this.template.error('createGroup');
          }
        });
      };

      MultipleWidget.prototype.__onUploadingFailed = function(error) {
        if (error === 'createGroup') {
          this.__setObject(null);
        }
        return this.template.error(error);
      };

      MultipleWidget.prototype.__handleDirectSelection = function(type, data) {
        var files;
        files = uploadcare.filesFrom(type, data, this.settings);
        if (this.settings.systemDialog) {
          return this.__setObject(uploadcare.FileGroup(files, this.settings));
        } else {
          return uploadcare.openDialog(files, this.settings).done(this.__setObject);
        }
      };

      return MultipleWidget;

    })(ns.BaseWidget);
  });

}).call(this);
(function() {
  var $, namespace, s, utils;

  utils = uploadcare.utils, namespace = uploadcare.namespace, s = uploadcare.settings, $ = uploadcare.jQuery;

  namespace('uploadcare', function(ns) {
    var cleanup, dataAttr, getSettings, initialize, initializeWidget;
    dataAttr = 'uploadcareWidget';
    ns.initialize = function(container) {
      if (container == null) {
        container = 'body';
      }
      return initialize($(container).find('@uploadcare-uploader'));
    };
    getSettings = function(el) {
      return s.build($(el).data());
    };
    initialize = function(targets) {
      var target, widget, widgetClass, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = targets.length; _i < _len; _i++) {
        target = targets[_i];
        widget = $(target).data(dataAttr);
        if (widget && target === widget.element[0]) {
          continue;
        }
        widgetClass = getSettings(target).multiple ? ns.widget.MultipleWidget : ns.widget.Widget;
        _results.push(initializeWidget($(target), widgetClass));
      }
      return _results;
    };
    ns.Widget = function(target) {
      var el;
      el = $(target).eq(0);
      if (!getSettings(el).multiple) {
        return initializeWidget(el, ns.widget.Widget);
      } else {
        throw new Error('This element should be processed using MultipleWidget');
      }
    };
    ns.MultipleWidget = function(target) {
      var el;
      el = $(target).eq(0);
      if (getSettings(el).multiple) {
        return initializeWidget(el, ns.widget.MultipleWidget);
      } else {
        throw new Error('This element should be processed using Widget');
      }
    };
    initializeWidget = function(el, Widget) {
      var widget;
      widget = el.data(dataAttr);
      if (!widget || el[0] !== widget.element[0]) {
        cleanup(el);
        widget = new Widget(el);
        el.data(dataAttr, widget);
        widget.template.content.data(dataAttr, widget.template);
      }
      return widget.api();
    };
    cleanup = function(el) {
      var template;
      el.off('.uploadcare');
      el = el.next('.uploadcare-widget');
      template = el.data(dataAttr);
      if (el.length && (!template || el[0] !== template.content[0])) {
        return el.remove();
      }
    };
    ns.start = function(settings) {
      var live;
      live = function() {
        return initialize($('@uploadcare-uploader'));
      };
      if (s.common(settings).live) {
        return setInterval(live, 100);
      } else {
        return live();
      }
    };
    return $(function() {
      if (!s.globals().manualStart) {
        return ns.start();
      }
    });
  });

}).call(this);
(function() {
  var $, canSubmit, cancelEvents, submitPreventionState, submittedForm;

  $ = uploadcare.jQuery;

  canSubmit = function(form) {
    var notSubmittable;
    notSubmittable = '[data-status=started], [data-status=error]';
    return !form.find('.uploadcare-widget').is(notSubmittable);
  };

  submitPreventionState = function(form, prevent) {
    form.attr('data-uploadcare-submitted', prevent);
    return form.find(':submit').attr('disabled', prevent);
  };

  $(document).on('submit', '@uploadcare-upload-form', function() {
    var form;
    form = $(this);
    if (canSubmit(form)) {
      return true;
    } else {
      submitPreventionState(form, true);
      return false;
    }
  });

  submittedForm = '@uploadcare-upload-form[data-uploadcare-submitted]';

  $(document).on('loaded.uploadcare', submittedForm, function() {
    return $(this).submit();
  });

  cancelEvents = 'ready.uploadcare error.uploadcare';

  $(document).on(cancelEvents, submittedForm, function() {
    var form;
    form = $(this);
    if (canSubmit(form)) {
      return submitPreventionState(form, false);
    }
  });

}).call(this);
(function() {
  var expose, key,
    __hasProp = {}.hasOwnProperty;

  uploadcare.version = '1.5.0';

  expose = uploadcare.expose;

  expose('version');

  expose('jQuery');

  expose('globals', uploadcare.settings.globals);

  expose('start');

  expose('initialize');

  expose('fileFrom');

  expose('filesFrom');

  expose('FileGroup');

  expose('loadFileGroup');

  expose('locales', (function() {
    var _ref, _results;
    _ref = uploadcare.locale.translations;
    _results = [];
    for (key in _ref) {
      if (!__hasProp.call(_ref, key)) continue;
      _results.push(key);
    }
    return _results;
  })());

  expose('openDialog');

  expose('openPanel');

  expose('registerTab');

  expose('Circle', uploadcare.ui.progress.Circle);

  expose('Widget');

  expose('MultipleWidget');

  expose('plugin', uploadcare.utils.plugin);

  expose('tabsCss');

  expose('dragdrop.support');

  expose('dragdrop.receiveDrop');

  expose('dragdrop.uploadDrop');

  expose('whenReady', function(fn) {
    return fn();
  });

}).call(this);
}({}, '//ucarecdn.com/widget/1.5.0/uploadcare/'));
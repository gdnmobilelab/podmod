/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 26);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */,
/* 1 */,
/* 2 */,
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Action; });
var Action;
(function (Action) {
    Action["RunCommand"] = "run-command";
})(Action || (Action = {}));
//# sourceMappingURL=interfaces.js.map

/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__client__ = __webpack_require__(7);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return __WEBPACK_IMPORTED_MODULE_0__client__["b"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return __WEBPACK_IMPORTED_MODULE_0__client__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__worker__ = __webpack_require__(8);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_1__worker__["a"]; });


//# sourceMappingURL=index.js.map

/***/ }),
/* 5 */,
/* 6 */,
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ServiceWorkerNotSupportedError; });
/* harmony export (immutable) */ __webpack_exports__["b"] = runServiceWorkerCommand;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__interfaces__ = __webpack_require__(3);
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

function createPendingPromise() {
    var fulfill, reject;
    var promise = new Promise(function (f, r) {
        fulfill = f;
        reject = r;
    });
    return [promise, fulfill, reject];
}
var ServiceWorkerNotSupportedError = /** @class */ (function (_super) {
    __extends(ServiceWorkerNotSupportedError, _super);
    function ServiceWorkerNotSupportedError() {
        var _this = _super.call(this, "Service workers are not supported") || this;
        Object.setPrototypeOf(_this, ServiceWorkerNotSupportedError.prototype);
        return _this;
    }
    return ServiceWorkerNotSupportedError;
}(Error));

function runServiceWorkerCommand(name, data) {
    if ("serviceWorker" in navigator === false) {
        throw new ServiceWorkerNotSupportedError();
    }
    var command = { name: name, data: data };
    var channel = new MessageChannel();
    var _a = createPendingPromise(), promise = _a[0], fulfill = _a[1], reject = _a[2];
    channel.port2.addEventListener("message", function (e) {
        var response = e.data;
        if (response.error) {
            reject(response.error);
        }
        else {
            fulfill(response.data);
        }
        channel.port2.close();
    });
    channel.port2.start();
    return navigator.serviceWorker.ready.then(function (reg) {
        reg.active.postMessage({
            action: __WEBPACK_IMPORTED_MODULE_0__interfaces__["a" /* Action */].RunCommand,
            command: command,
            respondOn: channel.port1
        }, [channel.port1]);
        return promise;
    });
}
//# sourceMappingURL=client.js.map

/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export CommandBridgeListener */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return CommandListener; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__interfaces__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_deep_for_each__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_deep_for_each___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_deep_for_each__);


var CommandBridgeListener = /** @class */ (function () {
    function CommandBridgeListener() {
        this.boundFunctions = {};
    }
    CommandBridgeListener.prototype.processMessage = function (e) {
        if (!e.data || !e.data.action || e.data.action !== __WEBPACK_IMPORTED_MODULE_0__interfaces__["a" /* Action */].RunCommand) {
            return;
        }
        var command = e.data.command;
        var respondOn = e.data.respondOn;
        var listener = this.boundFunctions[command.name];
        if (!listener) {
            return;
        }
        Promise.resolve(listener(command.data))
            .then(function (returnData) {
            return { data: returnData };
        })
            .catch(function (error) {
            return { error: error };
        })
            .then(function (response) {
            var transferables = [];
            __WEBPACK_IMPORTED_MODULE_1_deep_for_each___default()(response, function (value) {
                if (value instanceof MessagePort ||
                    value instanceof ArrayBuffer) {
                    transferables.push(value);
                }
            });
            respondOn.postMessage(response, transferables);
        });
    };
    CommandBridgeListener.prototype.bind = function (name, listener) {
        if (this.boundFunctions[name]) {
            throw new Error("Command is already bound to " + name);
        }
        this.boundFunctions[name] = listener;
    };
    CommandBridgeListener.prototype.listen = function () {
        self.addEventListener("message", this.processMessage.bind(this));
    };
    return CommandBridgeListener;
}());

var CommandListener = new CommandBridgeListener();
//# sourceMappingURL=worker.js.map

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isPlainObject = __webpack_require__(10);

function forEach(value, fn, path) {
    path = path || '';

    if (Array.isArray(value)) {
        forEachArray(value, fn, path);
    } else if (isPlainObject(value)) {
        forEachObject(value, fn, path);
    }
}

function forEachObject(obj, fn, path) {
    var key;
    var deepPath;

    for (key in obj) {
        deepPath = path ? path + '.' + key : key;
        // Note that we always use obj[key] because it might be mutated by forEach
        fn.call(obj, obj[key], key, obj, deepPath);
        forEach(obj[key], fn, deepPath);
    }
}

function forEachArray(array, fn, path) {
    var deepPath = '';

    array.forEach(function (value, index, arr) {
        deepPath = path + '[' + index + ']';
        fn.call(arr, value, index, arr, deepPath);
        // Note that we use arr[index] because it might be mutated by forEach
        forEach(arr[index], fn, deepPath);
    });
}

module.exports = forEach;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
 * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */



var isObject = __webpack_require__(11);

function isObjectObject(o) {
  return isObject(o) === true
    && Object.prototype.toString.call(o) === '[object Object]';
}

module.exports = function isPlainObject(o) {
  var ctor,prot;

  if (isObjectObject(o) === false) return false;

  // If has modified constructor
  ctor = o.constructor;
  if (typeof ctor !== 'function') return false;

  // If has modified prototype
  prot = ctor.prototype;
  if (isObjectObject(prot) === false) return false;

  // If constructor does not have an Object-specific method
  if (prot.hasOwnProperty('isPrototypeOf') === false) {
    return false;
  }

  // Most likely a plain Object
  return true;
};


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
 * isobject <https://github.com/jonschlinkert/isobject>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */



var isArray = __webpack_require__(12);

module.exports = function isObject(val) {
  return val != null && typeof val === 'object' && isArray(val) === false;
};


/***/ }),
/* 12 */
/***/ (function(module, exports) {

var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};


/***/ }),
/* 13 */,
/* 14 */,
/* 15 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
class PendingPromise {
    constructor() {
        this.promise = new Promise((f, r) => {
            this.fulfill = f;
            this.reject = r;
        });
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = PendingPromise;



/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * @copyright 2015 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */


Object.defineProperty(exports, '__esModule', { value: true });

/**
 * @typedef {object} PrivateData
 * @property {EventTarget} eventTarget The event target.
 * @property {{type:string}} event The original event object.
 * @property {number} eventPhase The current event phase.
 * @property {EventTarget|null} currentTarget The current event target.
 * @property {boolean} canceled The flag to prevent default.
 * @property {boolean} stopped The flag to stop propagation immediately.
 * @property {Function|null} passiveListener The listener if the current listener is passive. Otherwise this is null.
 * @property {number} timeStamp The unix time.
 * @private
 */

/**
 * Private data for event wrappers.
 * @type {WeakMap<Event, PrivateData>}
 * @private
 */
const privateData = new WeakMap();

/**
 * Cache for wrapper classes.
 * @type {WeakMap<Object, Function>}
 * @private
 */
const wrappers = new WeakMap();

/**
 * Get private data.
 * @param {Event} event The event object to get private data.
 * @returns {PrivateData} The private data of the event.
 * @private
 */
function pd(event) {
    const retv = privateData.get(event);
    console.assert(retv != null, "'this' is expected an Event object, but got", event);
    return retv
}

/**
 * @see https://dom.spec.whatwg.org/#interface-event
 * @private
 */
/**
 * The event wrapper.
 * @constructor
 * @param {EventTarget} eventTarget The event target of this dispatching.
 * @param {Event|{type:string}} event The original event to wrap.
 */
function Event(eventTarget, event) {
    privateData.set(this, {
        eventTarget,
        event,
        eventPhase: 2,
        currentTarget: eventTarget,
        canceled: false,
        stopped: false,
        passiveListener: null,
        timeStamp: event.timeStamp || Date.now(),
    });

    // https://heycam.github.io/webidl/#Unforgeable
    Object.defineProperty(this, "isTrusted", { value: false, enumerable: true });

    // Define accessors
    const keys = Object.keys(event);
    for (let i = 0; i < keys.length; ++i) {
        const key = keys[i];
        if (!(key in this)) {
            Object.defineProperty(this, key, defineRedirectDescriptor(key));
        }
    }
}

// Should be enumerable, but class methods are not enumerable.
Event.prototype = {
    /**
     * The type of this event.
     * @type {string}
     */
    get type() {
        return pd(this).event.type
    },

    /**
     * The target of this event.
     * @type {EventTarget}
     */
    get target() {
        return pd(this).eventTarget
    },

    /**
     * The target of this event.
     * @type {EventTarget}
     */
    get currentTarget() {
        return pd(this).currentTarget
    },

    /**
     * @returns {EventTarget[]} The composed path of this event.
     */
    composedPath() {
        const currentTarget = pd(this).currentTarget;
        if (currentTarget == null) {
            return []
        }
        return [currentTarget]
    },

    /**
     * Constant of NONE.
     * @type {number}
     */
    get NONE() {
        return 0
    },

    /**
     * Constant of CAPTURING_PHASE.
     * @type {number}
     */
    get CAPTURING_PHASE() {
        return 1
    },

    /**
     * Constant of AT_TARGET.
     * @type {number}
     */
    get AT_TARGET() {
        return 2
    },

    /**
     * Constant of BUBBLING_PHASE.
     * @type {number}
     */
    get BUBBLING_PHASE() {
        return 3
    },

    /**
     * The target of this event.
     * @type {number}
     */
    get eventPhase() {
        return pd(this).eventPhase
    },

    /**
     * Stop event bubbling.
     * @returns {void}
     */
    stopPropagation() {
        const data = pd(this);
        if (typeof data.event.stopPropagation === "function") {
            data.event.stopPropagation();
        }
    },

    /**
     * Stop event bubbling.
     * @returns {void}
     */
    stopImmediatePropagation() {
        const data = pd(this);

        data.stopped = true;
        if (typeof data.event.stopImmediatePropagation === "function") {
            data.event.stopImmediatePropagation();
        }
    },

    /**
     * The flag to be bubbling.
     * @type {boolean}
     */
    get bubbles() {
        return Boolean(pd(this).event.bubbles)
    },

    /**
     * The flag to be cancelable.
     * @type {boolean}
     */
    get cancelable() {
        return Boolean(pd(this).event.cancelable)
    },

    /**
     * Cancel this event.
     * @returns {void}
     */
    preventDefault() {
        const data = pd(this);
        if (data.passiveListener != null) {
            console.warn("Event#preventDefault() was called from a passive listener:", data.passiveListener);
            return
        }
        if (!data.event.cancelable) {
            return
        }

        data.canceled = true;
        if (typeof data.event.preventDefault === "function") {
            data.event.preventDefault();
        }
    },

    /**
     * The flag to indicate cancellation state.
     * @type {boolean}
     */
    get defaultPrevented() {
        return pd(this).canceled
    },

    /**
     * The flag to be composed.
     * @type {boolean}
     */
    get composed() {
        return Boolean(pd(this).event.composed)
    },

    /**
     * The unix time of this event.
     * @type {number}
     */
    get timeStamp() {
        return pd(this).timeStamp
    },
};

// `constructor` is not enumerable.
Object.defineProperty(Event.prototype, "constructor", { value: Event, configurable: true, writable: true });

// Ensure `event instanceof window.Event` is `true`.
if (typeof window !== "undefined" && typeof window.Event !== "undefined") {
    Object.setPrototypeOf(Event.prototype, window.Event.prototype);

    // Make association for wrappers.
    wrappers.set(window.Event.prototype, Event);
}

/**
 * Get the property descriptor to redirect a given property.
 * @param {string} key Property name to define property descriptor.
 * @returns {PropertyDescriptor} The property descriptor to redirect the property.
 * @private
 */
function defineRedirectDescriptor(key) {
    return {
        get() {
            return pd(this).event[key]
        },
        set(value) {
            pd(this).event[key] = value;
        },
        configurable: true,
        enumerable: true,
    }
}

/**
 * Get the property descriptor to call a given method property.
 * @param {string} key Property name to define property descriptor.
 * @returns {PropertyDescriptor} The property descriptor to call the method property.
 * @private
 */
function defineCallDescriptor(key) {
    return {
        value() {
            const event = pd(this).event;
            return event[key].apply(event, arguments)
        },
        configurable: true,
        enumerable: true,
    }
}

/**
 * Define new wrapper class.
 * @param {Function} BaseEvent The base wrapper class.
 * @param {Object} proto The prototype of the original event.
 * @returns {Function} The defined wrapper class.
 * @private
 */
function defineWrapper(BaseEvent, proto) {
    const keys = Object.keys(proto);
    if (keys.length === 0) {
        return BaseEvent
    }

    /** CustomEvent */
    function CustomEvent(eventTarget, event) {
        BaseEvent.call(this, eventTarget, event);
    }

    CustomEvent.prototype = Object.create(BaseEvent.prototype, {
        constructor: { value: CustomEvent, configurable: true, writable: true },
    });

    // Define accessors.
    for (let i = 0; i < keys.length; ++i) {
        const key = keys[i];
        if (!(key in BaseEvent.prototype)) {
            const descriptor = Object.getOwnPropertyDescriptor(proto, key);
            const isFunc = (typeof descriptor.value === "function");
            Object.defineProperty(
                CustomEvent.prototype,
                key,
                isFunc ? defineCallDescriptor(key) : defineRedirectDescriptor(key)
            );
        }
    }

    return CustomEvent
}

/**
 * Get the wrapper class of a given prototype.
 * @param {Object} proto The prototype of the original event to get its wrapper.
 * @returns {Function} The wrapper class.
 * @private
 */
function getWrapper(proto) {
    if (proto == null || proto === Object.prototype) {
        return Event
    }

    let wrapper = wrappers.get(proto);
    if (wrapper == null) {
        wrapper = defineWrapper(getWrapper(Object.getPrototypeOf(proto)), proto);
        wrappers.set(proto, wrapper);
    }
    return wrapper
}

/**
 * Wrap a given event to management a dispatching.
 * @param {EventTarget} eventTarget The event target of this dispatching.
 * @param {Object} event The event to wrap.
 * @returns {Event} The wrapper instance.
 * @private
 */
function wrapEvent(eventTarget, event) {
    const Wrapper = getWrapper(Object.getPrototypeOf(event));
    return new Wrapper(eventTarget, event)
}

/**
 * Get the stopped flag of a given event.
 * @param {Event} event The event to get.
 * @returns {boolean} The flag to stop propagation immediately.
 * @private
 */
function isStopped(event) {
    return pd(event).stopped
}

/**
 * Set the current event phase of a given event.
 * @param {Event} event The event to set current target.
 * @param {number} eventPhase New event phase.
 * @returns {void}
 * @private
 */
function setEventPhase(event, eventPhase) {
    pd(event).eventPhase = eventPhase;
}

/**
 * Set the current target of a given event.
 * @param {Event} event The event to set current target.
 * @param {EventTarget|null} currentTarget New current target.
 * @returns {void}
 * @private
 */
function setCurrentTarget(event, currentTarget) {
    pd(event).currentTarget = currentTarget;
}

/**
 * Set a passive listener of a given event.
 * @param {Event} event The event to set current target.
 * @param {Function|null} passiveListener New passive listener.
 * @returns {void}
 * @private
 */
function setPassiveListener(event, passiveListener) {
    pd(event).passiveListener = passiveListener;
}

/**
 * @typedef {object} ListenerNode
 * @property {Function} listener
 * @property {1|2|3} listenerType
 * @property {boolean} passive
 * @property {boolean} once
 * @property {ListenerNode|null} next
 * @private
 */

/**
 * @type {WeakMap<object, Map<string, ListenerNode>>}
 * @private
 */
const listenersMap = new WeakMap();

// Listener types
const CAPTURE = 1;
const BUBBLE = 2;
const ATTRIBUTE = 3;

/**
 * Check whether a given value is an object or not.
 * @param {any} x The value to check.
 * @returns {boolean} `true` if the value is an object.
 */
function isObject(x) {
    return x !== null && typeof x === "object" //eslint-disable-line no-restricted-syntax
}

/**
 * Get listeners.
 * @param {EventTarget} eventTarget The event target to get.
 * @returns {Map<string, ListenerNode>} The listeners.
 * @private
 */
function getListeners(eventTarget) {
    const listeners = listenersMap.get(eventTarget);
    console.assert(listeners != null, "'this' is expected an EventTarget object, but got", eventTarget);
    return listeners || new Map()
}

/**
 * Get the property descriptor for the event attribute of a given event.
 * @param {string} eventName The event name to get property descriptor.
 * @returns {PropertyDescriptor} The property descriptor.
 * @private
 */
function defineEventAttributeDescriptor(eventName) {
    return {
        get() {
            const listeners = getListeners(this);
            let node = listeners.get(eventName);
            while (node != null) {
                if (node.listenerType === ATTRIBUTE) {
                    return node.listener
                }
                node = node.next;
            }
            return null
        },

        set(listener) {
            if (typeof listener !== "function" && !isObject(listener)) {
                listener = null; // eslint-disable-line no-param-reassign
            }
            const listeners = getListeners(this);

            // Traverse to the tail while removing old value.
            let prev = null;
            let node = listeners.get(eventName);
            while (node != null) {
                if (node.listenerType === ATTRIBUTE) {
                    // Remove old value.
                    if (prev !== null) {
                        prev.next = node.next;
                    }
                    else if (node.next !== null) {
                        listeners.set(eventName, node.next);
                    }
                    else {
                        listeners.delete(eventName);
                    }
                }
                else {
                    prev = node;
                }

                node = node.next;
            }

            // Add new value.
            if (listener !== null) {
                const newNode = {
                    listener,
                    listenerType: ATTRIBUTE,
                    passive: false,
                    once: false,
                    next: null,
                };
                if (prev === null) {
                    listeners.set(eventName, newNode);
                }
                else {
                    prev.next = newNode;
                }
            }
        },
        configurable: true,
        enumerable: true,
    }
}

/**
 * Define an event attribute (e.g. `eventTarget.onclick`).
 * @param {Object} eventTargetPrototype The event target prototype to define an event attrbite.
 * @param {string} eventName The event name to define.
 * @returns {void}
 */
function defineEventAttribute(eventTargetPrototype, eventName) {
    Object.defineProperty(eventTargetPrototype, `on${eventName}`, defineEventAttributeDescriptor(eventName));
}

/**
 * Define a custom EventTarget with event attributes.
 * @param {string[]} eventNames Event names for event attributes.
 * @returns {EventTarget} The custom EventTarget.
 * @private
 */
function defineCustomEventTarget(eventNames) {
    /** CustomEventTarget */
    function CustomEventTarget() {
        EventTarget.call(this);
    }

    CustomEventTarget.prototype = Object.create(EventTarget.prototype, {
        constructor: { value: CustomEventTarget, configurable: true, writable: true },
    });

    for (let i = 0; i < eventNames.length; ++i) {
        defineEventAttribute(CustomEventTarget.prototype, eventNames[i]);
    }

    return CustomEventTarget
}

/**
 * EventTarget.
 * 
 * - This is constructor if no arguments.
 * - This is a function which returns a CustomEventTarget constructor if there are arguments.
 * 
 * For example:
 * 
 *     class A extends EventTarget {}
 *     class B extends EventTarget("message") {}
 *     class C extends EventTarget("message", "error") {}
 *     class D extends EventTarget(["message", "error"]) {}
 */
function EventTarget() {
    /*eslint-disable consistent-return */
    if (this instanceof EventTarget) {
        listenersMap.set(this, new Map());
        return
    }
    if (arguments.length === 1 && Array.isArray(arguments[0])) {
        return defineCustomEventTarget(arguments[0])
    }
    if (arguments.length > 0) {
        const types = new Array(arguments.length);
        for (let i = 0; i < arguments.length; ++i) {
            types[i] = arguments[i];
        }
        return defineCustomEventTarget(types)
    }
    throw new TypeError("Cannot call a class as a function")
    /*eslint-enable consistent-return */
}

// Should be enumerable, but class methods are not enumerable.
EventTarget.prototype = {
    /**
     * Add a given listener to this event target.
     * @param {string} eventName The event name to add.
     * @param {Function} listener The listener to add.
     * @param {boolean|{capture?:boolean,passive?:boolean,once?:boolean}} [options] The options for this listener.
     * @returns {boolean} `true` if the listener was added actually.
     */
    addEventListener(eventName, listener, options) {
        if (listener == null) {
            return false
        }
        if (typeof listener !== "function" && !isObject(listener)) {
            throw new TypeError("'listener' should be a function or an object.")
        }

        const listeners = getListeners(this);
        const optionsIsObj = isObject(options);
        const capture = optionsIsObj ? Boolean(options.capture) : Boolean(options);
        const listenerType = (capture ? CAPTURE : BUBBLE);
        const newNode = {
            listener,
            listenerType,
            passive: optionsIsObj && Boolean(options.passive),
            once: optionsIsObj && Boolean(options.once),
            next: null,
        };

        // Set it as the first node if the first node is null.
        let node = listeners.get(eventName);
        if (node === undefined) {
            listeners.set(eventName, newNode);
            return true
        }

        // Traverse to the tail while checking duplication..
        let prev = null;
        while (node != null) {
            if (node.listener === listener && node.listenerType === listenerType) {
                // Should ignore duplication.
                return false
            }
            prev = node;
            node = node.next;
        }

        // Add it.
        prev.next = newNode;
        return true
    },

    /**
     * Remove a given listener from this event target.
     * @param {string} eventName The event name to remove.
     * @param {Function} listener The listener to remove.
     * @param {boolean|{capture?:boolean,passive?:boolean,once?:boolean}} [options] The options for this listener.
     * @returns {boolean} `true` if the listener was removed actually.
     */
    removeEventListener(eventName, listener, options) {
        if (listener == null) {
            return false
        }

        const listeners = getListeners(this);
        const capture = isObject(options) ? Boolean(options.capture) : Boolean(options);
        const listenerType = (capture ? CAPTURE : BUBBLE);

        let prev = null;
        let node = listeners.get(eventName);
        while (node != null) {
            if (node.listener === listener && node.listenerType === listenerType) {
                if (prev !== null) {
                    prev.next = node.next;
                }
                else if (node.next !== null) {
                    listeners.set(eventName, node.next);
                }
                else {
                    listeners.delete(eventName);
                }
                return true
            }

            prev = node;
            node = node.next;
        }

        return false
    },

    /**
     * Dispatch a given event.
     * @param {Event|{type:string}} event The event to dispatch.
     * @returns {boolean} `false` if canceled.
     */
    dispatchEvent(event) {
        if (event == null || typeof event.type !== "string") {
            throw new TypeError("\"event.type\" should be a string.")
        }

        // If listeners aren't registered, terminate.
        const listeners = getListeners(this);
        const eventName = event.type;
        let node = listeners.get(eventName);
        if (node == null) {
            return true
        }

        // Since we cannot rewrite several properties, so wrap object.
        const wrappedEvent = wrapEvent(this, event);

        // This doesn't process capturing phase and bubbling phase.
        // This isn't participating in a tree.
        let prev = null;
        while (node != null) {
            // Remove this listener if it's once
            if (node.once) {
                if (prev !== null) {
                    prev.next = node.next;
                }
                else if (node.next !== null) {
                    listeners.set(eventName, node.next);
                }
                else {
                    listeners.delete(eventName);
                }
            }
            else {
                prev = node;
            }

            // Call this listener
            setPassiveListener(wrappedEvent, (node.passive ? node.listener : null));
            if (typeof node.listener === "function") {
                node.listener.call(this, wrappedEvent);
            }
            else if (node.listenerType !== ATTRIBUTE && typeof node.listener.handleEvent === "function") {
                node.listener.handleEvent(wrappedEvent);
            }

            // Break if `event.stopImmediatePropagation` was called.
            if (isStopped(wrappedEvent)) {
                break
            }

            node = node.next;
        }
        setPassiveListener(wrappedEvent, null);
        setEventPhase(wrappedEvent, 0);
        setCurrentTarget(wrappedEvent, null);

        return !wrappedEvent.defaultPrevented
    },
};

// `constructor` is not enumerable.
Object.defineProperty(EventTarget.prototype, "constructor", { value: EventTarget, configurable: true, writable: true });

// Ensure `eventTarget instanceof window.EventTarget` is `true`.
if (typeof window !== "undefined" && typeof window.EventTarget !== "undefined") {
    Object.setPrototypeOf(EventTarget.prototype, window.EventTarget.prototype);
}

exports.defineEventAttribute = defineEventAttribute;
exports.EventTarget = EventTarget;
exports['default'] = EventTarget;

module.exports = EventTarget
module.exports.EventTarget = module.exports["default"] = EventTarget
module.exports.defineEventAttribute = defineEventAttribute
//# sourceMappingURL=event-target-shim.js.map


/***/ }),
/* 17 */,
/* 18 */,
/* 19 */,
/* 20 */,
/* 21 */,
/* 22 */,
/* 23 */,
/* 24 */,
/* 25 */,
/* 26 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__io_cache_sync__ = __webpack_require__(27);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_service_worker_command_bridge__ = __webpack_require__(4);
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};


self.addEventListener("fetch", (e) => {
    e.respondWith(caches
        .match(e.request)
        .then(response => {
        console.log("cache response", response);
        return response || __WEBPACK_IMPORTED_MODULE_0__io_cache_sync__["a" /* CacheSync */].matchInProgress(e.request);
    })
        .then(response => {
        return response || fetch(e.request);
    }));
});
__WEBPACK_IMPORTED_MODULE_1_service_worker_command_bridge__["a" /* CommandListener */].bind("cachesync", (request) => {
    let sync = new __WEBPACK_IMPORTED_MODULE_0__io_cache_sync__["a" /* CacheSync */](request.cacheName, request.payloadURL);
    let channel = new MessageChannel();
    sync.addEventListener("progress", e => {
        channel.port1.postMessage(Object.assign(e.detail, {
            type: "progress"
        }));
    });
    return {
        progressEvents: channel.port2
    };
});
__WEBPACK_IMPORTED_MODULE_1_service_worker_command_bridge__["a" /* CommandListener */].listen();
// self.addEventListener("message", e => {
//     console.log("GOT MESSAGE");
// });
self.addEventListener("install", e => self.skipWaiting());
self.addEventListener("activate", e => self.clients.claim());
__WEBPACK_IMPORTED_MODULE_1_service_worker_command_bridge__["a" /* CommandListener */].bind("show-notification", (n) => {
    self.registration.showNotification(n.title, {
        icon: n.icon,
        body: n.body,
        data: n.data
    });
});
__WEBPACK_IMPORTED_MODULE_1_service_worker_command_bridge__["a" /* CommandListener */].bind("get-notifications", (n) => __awaiter(this, void 0, void 0, function* () {
    let notifications = yield self.registration.getNotifications();
    return notifications.map(n => {
        return {
            title: n.title,
            body: n.body,
            icon: n.icon,
            data: n.data
        };
    });
}));
__WEBPACK_IMPORTED_MODULE_1_service_worker_command_bridge__["a" /* CommandListener */].bind("remove-notification", (predicate) => __awaiter(this, void 0, void 0, function* () {
    let notifications = (yield self.registration.getNotifications());
    notifications.forEach(notification => {
        for (let key in predicate) {
            if (predicate[key] !== notification.data[key]) {
                return;
            }
        }
        notification.close();
    });
}));
// CommandListener.bind("remove-notification")
// CommandListener.listen();
// let sync = new CacheSync("test-cache", "./bundles/mona-ep-1/files.json");
// sync.addEventListener("progress", e => {
//     console.log(e.detail);
// });
// sync.complete.then(() => console.info("done"));


/***/ }),
/* 27 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util_pending_promise__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__download_progress__ = __webpack_require__(28);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_range_parser__ = __webpack_require__(29);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_range_parser___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_range_parser__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_event_target_shim__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_event_target_shim___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_event_target_shim__);




class CacheSync extends __WEBPACK_IMPORTED_MODULE_3_event_target_shim__["EventTarget"] {
    constructor(cacheName, payloadURL) {
        super();
        this.completePromise = new __WEBPACK_IMPORTED_MODULE_0__util_pending_promise__["a" /* PendingPromise */]();
        let payload = new URL(payloadURL, self.location.href);
        Promise.all([
            caches.open(cacheName),
            fetch(payloadURL).then(res => {
                // Payload files are always arrays of strings, so we can make this
                // promise more specific than it would have been otherwise.
                return res.json();
            })
        ])
            .then(([cache, fileList]) => {
            this.files = fileList.map(file => {
                return {
                    url: new URL(file, payload.href).href,
                    downloaded: 0,
                    total: -1
                };
            });
            let promises = this.files.map(file => this.performCacheCheck(cache, file));
            return Promise.all(promises);
        })
            .then(() => {
            this.completePromise.fulfill();
        })
            .catch(err => {
            console.error(err);
            this.completePromise.reject(err);
        });
    }
    get complete() {
        return this.completePromise.promise;
    }
    static matchInProgress(request) {
        // While cache.put() is being run, the entry itself isn't actually
        // in the
        let existing = Array.from(this.currentlyDownloadingResponses.keys()).find(response => response.url == request.url);
        if (existing) {
            let rangeHeader = request.headers.get("range");
            if (!rangeHeader) {
                return existing.clone();
            }
            let length = existing.headers.get("content-length");
            let requestedRange = __WEBPACK_IMPORTED_MODULE_2_range_parser__(length, rangeHeader);
            let currentlyDownloaded = this.currentlyDownloadingResponses.get(existing);
            // Only supporting the first range requested, that's all <audio/> ever does
            if (!currentlyDownloaded || requestedRange[0].start > currentlyDownloaded) {
                // A range has been requested that's outside of what we have
                // cached so far. So we send the user over the wire instead, which isn't
                // ideal but it'll have to do.
                return undefined;
            }
            return existing.clone();
        }
        return undefined;
    }
    performCacheCheck(cache, fileEntry) {
        return cache.match(fileEntry.url).then((existingMatch) => {
            let checkRequest = new Request(fileEntry.url);
            // If we already have an entry in the cache, adjust our request
            // so we can get a 304 response if that applies.
            if (existingMatch) {
                let etag = existingMatch.headers.get("etag");
                let lastModified = existingMatch.headers.get("last-modified");
                if (etag) {
                    checkRequest.headers.append("If-None-Match", etag);
                }
                if (lastModified) {
                    checkRequest.headers.append("If-Modified-Since", lastModified);
                }
            }
            return fetch(checkRequest).then(res => {
                if (res.status == 304) {
                    // The file hasn't changed since the last time we downloaded it
                    // so we'll just set our progress based on the previously cached
                    // version.
                    if (!existingMatch) {
                        throw new Error("Should never get 304 response when we have no existing match!");
                    }
                    // We know we have this header because it would have thrown an error
                    // on initial download otherwise.
                    let length = parseInt(existingMatch.headers.get("content-length"), 10);
                    console.info(`${fileEntry.url} is already in the cache.`);
                    fileEntry.total = length;
                    fileEntry.downloaded = length;
                    this.emitProgressUpdate();
                }
                else {
                    // Add to the downloading array, so fetch events can use it
                    return this.cacheDownload(cache, fileEntry, res);
                }
            });
        });
    }
    cacheDownload(targetCache, fileEntry, incomingResponse) {
        let cloneForResponse = incomingResponse.clone();
        CacheSync.currentlyDownloadingResponses.set(cloneForResponse, 0);
        let progress = new __WEBPACK_IMPORTED_MODULE_1__download_progress__["a" /* DownloadProgress */](incomingResponse);
        progress.addEventListener("progress", (e) => {
            fileEntry.downloaded = e.detail.current;
            // Update our 'currently downloading' collection to reflect the new downloaded
            // length.
            CacheSync.currentlyDownloadingResponses.set(cloneForResponse, e.detail.current);
            this.emitProgressUpdate();
        });
        fileEntry.total = progress.length;
        this.emitProgressUpdate();
        console.info(`Putting ${fileEntry.url} into the cache.`);
        return Promise.all([
            targetCache.put(incomingResponse.url, incomingResponse),
            progress.complete
        ]).then(() => {
            // Now that the response is successfully inserted into the cache, we don't
            // need our temporary store any more.
            CacheSync.currentlyDownloadingResponses.delete(cloneForResponse);
            console.info(`Successfully put ${fileEntry.url} into the cache.`);
        });
    }
    emitProgressUpdate() {
        let allFilesTotal = this.files.reduce((previous, current, index) => {
            if (previous == -1 || current.total == -1) {
                // If any of the files don't have totals yet, we
                // return -1 for the total, because we don't know what
                // it is.
                return -1;
            }
            return previous + current.total;
        }, 0);
        let downloadedTotal = this.files.reduce((previous, current) => {
            return previous + current.downloaded;
        }, 0);
        let event = new CustomEvent("progress", {
            detail: {
                current: downloadedTotal,
                total: allFilesTotal
            }
        });
        this.dispatchEvent(event);
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = CacheSync;

CacheSync.currentlyDownloadingResponses = new Map();


/***/ }),
/* 28 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_event_target_shim__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_event_target_shim___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_event_target_shim__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__util_pending_promise__ = __webpack_require__(15);


// Lets us monitor the download progress of a fetch response.
class DownloadProgress extends __WEBPACK_IMPORTED_MODULE_0_event_target_shim__["EventTarget"] {
    constructor(response) {
        super();
        this.currentLengthDownloaded = 0;
        this.length = 0;
        this.completePromise = new __WEBPACK_IMPORTED_MODULE_1__util_pending_promise__["a" /* PendingPromise */]();
        let lengthHeader = response.headers.get("Content-Length");
        if (!lengthHeader) {
            throw new Error("Download progress requires a Content-Length header.");
        }
        this.length = parseInt(lengthHeader, 10);
        this.reader = response.clone().body.getReader();
        this.emitUpdate();
        this.performRead();
    }
    get complete() {
        return this.completePromise.promise;
    }
    emitUpdate() {
        let downloadEvent = new CustomEvent("progress", {
            detail: {
                current: this.currentLengthDownloaded,
                total: this.length
            }
        });
        this.dispatchEvent(downloadEvent);
    }
    performRead() {
        return this.reader.read().then((readResponse) => {
            if (readResponse.done == true) {
                return this.completePromise.fulfill();
            }
            this.currentLengthDownloaded += readResponse.value.length;
            this.emitUpdate();
            this.performRead();
        });
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = DownloadProgress;



/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
 * range-parser
 * Copyright(c) 2012-2014 TJ Holowaychuk
 * Copyright(c) 2015-2016 Douglas Christopher Wilson
 * MIT Licensed
 */



/**
 * Module exports.
 * @public
 */

module.exports = rangeParser

/**
 * Parse "Range" header `str` relative to the given file `size`.
 *
 * @param {Number} size
 * @param {String} str
 * @param {Object} [options]
 * @return {Array}
 * @public
 */

function rangeParser (size, str, options) {
  var index = str.indexOf('=')

  if (index === -1) {
    return -2
  }

  // split the range string
  var arr = str.slice(index + 1).split(',')
  var ranges = []

  // add ranges type
  ranges.type = str.slice(0, index)

  // parse all ranges
  for (var i = 0; i < arr.length; i++) {
    var range = arr[i].split('-')
    var start = parseInt(range[0], 10)
    var end = parseInt(range[1], 10)

    // -nnn
    if (isNaN(start)) {
      start = size - end
      end = size - 1
    // nnn-
    } else if (isNaN(end)) {
      end = size - 1
    }

    // limit last-byte-pos to current length
    if (end > size - 1) {
      end = size - 1
    }

    // invalid or unsatisifiable
    if (isNaN(start) || isNaN(end) || start > end || start < 0) {
      continue
    }

    // add range
    ranges.push({
      start: start,
      end: end
    })
  }

  if (ranges.length < 1) {
    // unsatisifiable
    return -1
  }

  return options && options.combine
    ? combineRanges(ranges)
    : ranges
}

/**
 * Combine overlapping & adjacent ranges.
 * @private
 */

function combineRanges (ranges) {
  var ordered = ranges.map(mapWithIndex).sort(sortByRangeStart)

  for (var j = 0, i = 1; i < ordered.length; i++) {
    var range = ordered[i]
    var current = ordered[j]

    if (range.start > current.end + 1) {
      // next range
      ordered[++j] = range
    } else if (range.end > current.end) {
      // extend range
      current.end = range.end
      current.index = Math.min(current.index, range.index)
    }
  }

  // trim ordered array
  ordered.length = j + 1

  // generate combined range
  var combined = ordered.sort(sortByRangeIndex).map(mapWithoutIndex)

  // copy ranges type
  combined.type = ranges.type

  return combined
}

/**
 * Map function to add index value to ranges.
 * @private
 */

function mapWithIndex (range, index) {
  return {
    start: range.start,
    end: range.end,
    index: index
  }
}

/**
 * Map function to remove index value from ranges.
 * @private
 */

function mapWithoutIndex (range) {
  return {
    start: range.start,
    end: range.end
  }
}

/**
 * Sort function to sort ranges by index.
 * @private
 */

function sortByRangeIndex (a, b) {
  return a.index - b.index
}

/**
 * Sort function to sort ranges by start position.
 * @private
 */

function sortByRangeStart (a, b) {
  return a.start - b.start
}


/***/ })
/******/ ]);
//# sourceMappingURL=worker.js.map
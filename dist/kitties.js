(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

/**
 * Created by Shaun on 4/23/2015.
 */

//import ResourceRegistry from './engine/resources/resource-registry.js';

var _cacheDataElements = require('./engine/fragments.js');

var _Resource = require('./engine/resources/resource.js');

var _Resource2 = _interopRequireWildcard(_Resource);

var _getInstances = require('./engine/container.js');

var _HttpResource = require('./engine/resources/http-resource.js');

var _HttpResource2 = _interopRequireWildcard(_HttpResource);

//import Loader from './loader.js';

var _SceneSchema = require('./schema/scene-schema.js');

var _SceneSchema2 = _interopRequireWildcard(_SceneSchema);

var _SpriteSchema = require('./schema/sprite-schema.js');

var _SpriteSchema2 = _interopRequireWildcard(_SpriteSchema);

var _Scene = require('./scene.js');

var _Scene2 = _interopRequireWildcard(_Scene);

_cacheDataElements.cacheDataElements();

/*window.refresh = function() {
  return ResourceRegistry.getResources('assets/kitty.json');
};*/

//var loader = new Loader();
//loader.getScene('kitty-world.json','assets');

_Resource2['default'].baseUri = 'assets';

// DEBUG
window.Resource = _Resource2['default'];
window.getInstances = _getInstances.getInstances;

var sceneSchema = _SceneSchema2['default']();

_HttpResource2['default']('kitty-world.json').ready(function (sceneData) {
  var scene = sceneSchema.map(sceneData);
  console.log(scene);
  _Scene2['default'](scene);
});

var spriteSchema = _SpriteSchema2['default']();

_HttpResource2['default']('kitty.json').ready(function (spriteData) {
  var sprite = spriteSchema.map(spriteData);
  console.log(sprite);
});

},{"./engine/container.js":3,"./engine/fragments.js":6,"./engine/resources/http-resource.js":10,"./engine/resources/resource.js":14,"./scene.js":20,"./schema/scene-schema.js":21,"./schema/sprite-schema.js":22}],2:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

// Return everything before the last slash of a url
// e.g. http://foo/bar/baz.json => http://foo/bar
exports.getBaseUrl = getBaseUrl;
exports.isFullUrl = isFullUrl;
exports.normalizeUrl = normalizeUrl;
exports.mergeObject = mergeObject;
exports.assignProperty = assignProperty;
exports.getCanvas = getCanvas;
exports.intersects = intersects;

// Make the given RGB value transparent in the given image.
// Returns a new image.
exports.getTransparentImage = getTransparentImage;

var _Util = require('./util.js');

var _Util2 = _interopRequireWildcard(_Util);

function getBaseUrl(url) {
  var n = url.lastIndexOf('/');
  return url.substring(0, n);
}

function isFullUrl(url) {
  return url.substring(0, 7) === 'http://' || url.substring(0, 8) === 'https://';
}

function normalizeUrl(url, baseUrl) {
  if (baseUrl && !isFullUrl(url)) {
    return baseUrl + '/' + url;
  }
  return url;
}

function mergeObject(source, destination, allowWrap, exceptionOnCollisions) {
  source = source || {}; //Pool.getObject();
  destination = destination || {}; //Pool.getObject();

  Object.keys(source).forEach(function (prop) {
    assignProperty(source, destination, prop, allowWrap, exceptionOnCollisions);
  });

  return destination;
}

function assignProperty(source, destination, prop, allowWrap, exceptionOnCollisions) {
  if (destination.hasOwnProperty(prop)) {
    if (allowWrap) {
      destination[prop] = Func.wrap(destination[prop], source[prop]);
      _Util2['default'].log('Merge: wrapped \'' + prop + '\'');
    } else if (exceptionOnCollisions) {
      _Util2['default'].error('Failed to merge mixin. Method \'' + prop + '\' caused a name collision.');
    } else {
      destination[prop] = source[prop];
      _Util2['default'].log('Merge: overwrote \'' + prop + '\'');
    }
    return destination;
  }

  destination[prop] = source[prop];

  return destination;
}

function getCanvas(width, height) {
  var canvas = document.createElement('canvas');

  canvas.width = width || 500;
  canvas.height = height || 500;

  return canvas;
}

function intersects(rectA, rectB) {
  return !(rectA.x + rectA.width < rectB.x || rectA.y + rectA.height < rectB.y || rectA.x > rectB.x + rectB.width || rectA.y > rectB.y + rectB.height);
}

function getTransparentImage(transRGB, image) {
  var r, g, b, newImage, dataLength;
  var width = image.width;
  var height = image.height;
  var imageData = image.getContext('2d').getImageData(0, 0, width, height);

  if (transRGB) {
    dataLength = width * height * 4;

    for (var index = 0; index < dataLength; index += 4) {
      r = imageData.data[index];
      g = imageData.data[index + 1];
      b = imageData.data[index + 2];
      if (r === transRGB[0] && g === transRGB[1] && b === transRGB[2]) {
        imageData.data[index + 3] = 0;
      }
    }
  }

  newImage = getCanvas(width, height);
  newImage.getContext('2d').putImageData(imageData, 0, 0);

  return newImage;
}

},{"./util.js":18}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.useFactory = useFactory;
exports.useSingleton = useSingleton;
exports.useInstance = useInstance;
exports.registerFactory = registerFactory;
exports.registerSingleton = registerSingleton;
exports.registerInstance = registerInstance;
exports.includeSingleton = includeSingleton;
exports.includeInstance = includeInstance;
exports.getInstances = getInstances;
/**
 * Created by shaunwest on 4/30/15.
 */

var instances = {};
var singletons = [];

function findSingleton(token) {
  var results = singletons.filter(function (singleton) {
    return token === singleton.token;
  });

  return results.length ? results[0].instance : null;
}

function useFactory(id, factory) {
  return includeInstance(id) || registerFactory(id, factory);
}

function useSingleton(token, func) {
  return includeSingleton(token) || registerSingleton(token, func);
}

function useInstance(id, instance) {
  return includeInstance(id) || registerInstance(id, instance);
}

function registerFactory(id, factory) {
  if (typeof factory == 'function') {
    return registerInstance(id, factory());
  }
  throw 'registerFactory: factory must be a function';
}

function registerSingleton(token) {
  var instance;

  if (typeof token != 'function') {
    throw 'registerSingleton: first argument must be a function';
  }

  instance = new token();
  if (instance) {
    singletons.push({
      token: token,
      instance: instance
    });
    return instance;
  }
}

function registerInstance(id, instance) {
  if (typeof id != 'string' || typeof instance == 'undefined') {
    throw 'registerInstance: a string id and an instance are required';
  }
  instances[id] = instance;
  return instance;
}

function includeSingleton(token) {
  return findSingleton(token);
}

function includeInstance(id) {
  return instances[id];
}

function getInstances() {
  return instances;
}

},{}],4:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = create;
/**
 * Created by shaunwest on 5/10/15.
 */

var _inject = require('../injector.js');

var _inject2 = _interopRequireWildcard(_inject);

var _useFactory = require('../container.js');

function create(id, factory) {
  var result = _useFactory.useFactory(id, factory);

  if (result) {
    return _inject2['default']([result]);
  }
}

module.exports = exports['default'];

},{"../container.js":3,"../injector.js":7}],5:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});
/**
 * Created by shaunwest on 5/10/15.
 */

var _inject = require('../injector.js');

var _inject2 = _interopRequireWildcard(_inject);

var _Fragment = require('../fragments.js');

exports['default'] = function (element) {
  return _inject2['default']([_Fragment.Fragment(element)]);
};

module.exports = exports['default'];

},{"../fragments.js":6,"../injector.js":7}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.findDataElements = findDataElements;
exports.Fragments = Fragments;
exports.Fragment = Fragment;
exports.cacheDataElements = cacheDataElements;
/**
 * Created by Shaun on 4/23/2015.
 */

var allDataElements;

function hasDataAttribute(element) {
  var attributes = element.attributes;
  for (var i = 0, numAttributes = attributes.length; i < numAttributes; i++) {
    if (attributes[i].name.substr(0, 4) === 'data') {
      return element;
    }
  }
}

function findDataElements(parentElement) {
  var allElements,
      element,
      dataElements = [];

  if (!parentElement) {
    var html = document.getElementsByTagName('html');
    if (!html[0]) {
      return dataElements;
    }
    parentElement = html[0];
  }

  allElements = parentElement.querySelectorAll('*');
  for (var i = 0, numElements = allElements.length; i < numElements; i++) {
    element = allElements[i];
    if (hasDataAttribute(element)) {
      dataElements.push(element);
    }
  }
  return dataElements;
}

function Fragments(name) {
  if (!allDataElements) {
    cacheDataElements();
  }
  return allDataElements.reduce(function (result, element) {
    if (element.hasAttribute('data-' + name)) {
      result.push(element);
    }
    return result;
  }, []);
}

function Fragment(name) {
  return Fragments(name)[0];
}

function cacheDataElements() {
  allDataElements = findDataElements();
}

},{}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Created by shaunwest on 4/28/15.
 */

exports["default"] = function (injected) {
  return function (target) {
    injected = target._injected ? injected.concat(target._injected) : injected;

    if (target._target) {
      target = target._target;
    }

    var newTarget = target.bind.apply(target, [null].concat(injected));
    newTarget._target = target;
    newTarget._injected = injected;
    return newTarget;
  };
};

module.exports = exports["default"];

},{}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.requestGet = requestGet;
exports.purge = purge;
exports.getPromises = getPromises;
/**
 * Created by Shaun on 5/3/14.
 */
var promises = [],
    baseUrl = '';

function isFunction(obj) {
  return Object.prototype.toString.call(obj) == '[object Function]';
}

function parseResponse(contentType, responseText) {
  if (contentType.substr(0, 16) == 'application/json') {
    return JSON.parse(responseText);
  }
  return responseText;
}

function requestGet(url, contentTypeOrOnProgress, onProgress) {
  var promise;

  if (url.substr(0, 7) !== 'http://' && url.substr(0, 8) !== 'https://') {
    url = baseUrl + url;
  }

  function getHandler(resolve, reject) {
    var req = new XMLHttpRequest();

    if (isFunction(contentTypeOrOnProgress)) {
      onProgress = contentTypeOrOnProgress;
      contentTypeOrOnProgress = undefined;
    }

    if (onProgress) {
      req.addEventListener('progress', function (event) {
        onProgress(event.loaded, event.total);
      }, false);
    }

    req.onerror = function (event) {
      reject('Network error.');
    };

    req.onload = function () {
      var contentType = contentTypeOrOnProgress || this.getResponseHeader('content-type') || '';
      this.status >= 300 ? reject({ statusText: this.statusText, status: this.status }) : resolve({ data: parseResponse(contentType, this.responseText), status: this.status });
    };

    req.open('get', url, true);
    req.send();
  }

  promise = new Promise(getHandler);
  promises.push(promise);

  return promise;
}

function purge() {
  promises.length = 0;
}

function getPromises() {
  return promises;
}

function setBaseUrl(url) {
  baseUrl = url;
}

exports['default'] = {
  requestGet: requestGet,
  purge: purge,
  setBaseUrl: setBaseUrl,
  getPromises: getPromises
};

},{}],9:[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, '__esModule', {
  value: true
});
/**
 * Created by Shaun on 2/5/15
 * 
 */
// TODO: remove references to 'background'

var ImageLayer = (function () {
  function ImageLayer(canvas) {
    _classCallCheck(this, ImageLayer);

    this.canvas = canvas;
    this.context2d = canvas.getContext('2d');
  }

  _createClass(ImageLayer, [{
    key: 'setBackground',
    value: function setBackground(image) {
      this.background = image;
      return this;
    }
  }, {
    key: 'draw',
    value: function draw(viewport) {
      if (!viewport) {
        return;
      }

      this.context2d.clearRect(0, 0, this.canvas.width, this.canvas.height);

      if (this.background) {
        this.context2d.drawImage(this.background, viewport.x, viewport.y, viewport.width, viewport.height, 0, 0, viewport.width, viewport.height);
      }

      return this;
    }
  }, {
    key: 'getLayer',
    value: function getLayer() {
      return this.canvas;
    }
  }]);

  return ImageLayer;
})();

exports['default'] = ImageLayer;
module.exports = exports['default'];

},{}],10:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});
/**
 * Created by Shaun on 3/1/15
 *
 */

var _Util = require('../util.js');

var _Util2 = _interopRequireWildcard(_Util);

var _requestGet = require('../kjax.js');

var _Resource = require('./resource.js');

var _Resource2 = _interopRequireWildcard(_Resource);

exports['default'] = function (uri) {
  return _Resource2['default'](_requestGet.requestGet, uri).ready(function (response) {
    return response.data;
  });
};

;
module.exports = exports['default'];

},{"../kjax.js":8,"../util.js":18,"./resource.js":14}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getImage = getImage;
/**
 * Created by Shaun on 5/1/14.
 */

var IMAGE_WAIT_INTERVAL = 100;

function waitForImage(image) {
  return new Promise(function (resolve, reject) {
    var intervalId = setInterval(function () {
      if (image.complete) {
        clearInterval(intervalId);
        resolve(image);
      }
    }, IMAGE_WAIT_INTERVAL);

    image.onerror = function () {
      clearInterval(intervalId);
      reject();
    };
  });
}

function getImage(uri) {
  var image, promise;

  image = new Image();
  image.src = uri;

  promise = waitForImage(image);

  return promise;
}

},{}],12:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});
/**
 * Created by Shaun on 1/25/15
 *
 */

var _Resource = require('./resource.js');

var _Resource2 = _interopRequireWildcard(_Resource);

var _getImage = require('./image-loader.js');

exports['default'] = function (uri) {
  return _Resource2['default'](_getImage.getImage, uri);
};

;
module.exports = exports['default'];

},{"./image-loader.js":11,"./resource.js":14}],13:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Created by Shaun on 3/1/15
 *
 */

var resources = {};

/*function register (resource) {
  var source = resource.source;

  if(!resources[source]) {
    resources[source] = [];
  }

  resources[source].push(resource);
}

function getResources (source) {
  if(!source) {
    return resources;
  }

  return resources[source];
}*/

function register(resource) {
  resources[resource.source] = resource;
}

function getResource(source) {
  return resources[source];
}

exports["default"] = {
  register: register,
  getResource: getResource
};
module.exports = exports["default"];

},{}],14:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});
/**
 * Created by Shaun on 3/3/15
 *
 */

var _Util = require('../util.js');

var _Util2 = _interopRequireWildcard(_Util);

var _ResourceRegistry = require('./resource-registry.js');

var _ResourceRegistry2 = _interopRequireWildcard(_ResourceRegistry);

var _isFullUrl = require('../common.js');

var resourcePool = {};

// method must be asynchronous
function Resource(method, source) {
  var successCallbacks = [],
      errorCallbacks = [],
      resource = {
    ready: ready,
    fetch: fetch,
    promise: null,
    source: source
  };

  if (!_Util2['default'].isFunction(method)) {
    return;
  }

  function ready(onSuccess, onError) {
    if (_Util2['default'].isArray(onSuccess)) {
      successCallbacks = successCallbacks.concat(onSuccess);
    } else {
      successCallbacks.push(onSuccess);
    }

    if (_Util2['default'].isArray(onError)) {
      errorCallbacks = errorCallbacks.concat(onError);
    } else {
      errorCallbacks.push(onError);
    }

    return resource;
  }

  function onSuccess(result, index) {
    var successCallback = successCallbacks[index];
    if (!successCallback) {
      if (index < successCallbacks.length) {
        onError(result, index + 1);
      }
      return;
    }

    var newResult = successCallback(result);
    if (newResult && newResult.ready) {
      newResult.ready(function (result) {
        onSuccess(result, index + 1);
      }, function (result) {
        onError(result, index + 1);
      });
      return;
    } else if (!newResult) {
      newResult = result;
    }
    onSuccess(newResult, index + 1);
  }

  function onError(result, index) {
    var errorCallback = errorCallbacks[index];
    if (!errorCallback) {
      if (index < errorCallbacks.length) {
        onError(result, index + 1);
      }
      return;
    }

    result = errorCallback(result);
    if (result && result.ready) {
      result.ready(function () {
        onSuccess(result, index + 1);
      }, function (result) {
        onError(result, index + 1);
      });
      return;
    }
    onError(result, index + 1);
  }

  function fetch(source) {
    var promise;

    if (Resource.baseUri) {
      if (!_isFullUrl.isFullUrl(source)) {
        source = Resource.baseUri + '/' + source;
      }
    }

    promise = method(source);

    if (!_Util2['default'].isObject(promise) || !promise.then) {
      _Util2['default'].error('Provided resource method did not return a thenable object');
    }

    resource.source = source;
    resource.promise = promise.then(function (result) {
      onSuccess(result, 0);
    }, function (result) {
      onError(result, 0);
    });

    return resource;
  }

  // TODO: make better
  if (source) {
    var fullSource = source;
    if (Resource.baseUri) {
      if (!_isFullUrl.isFullUrl(source)) {
        fullSource = Resource.baseUri + '/' + source;
      }
    }
    var existingResource = resourcePool[fullSource];
    if (existingResource) {
      return existingResource.fetch(source);
    }
  }

  //ResourceRegistry.register(resource);
  resourcePool[fullSource] = resource;
  return source ? resource.fetch(source) : resource;
}

Resource.baseUri = '';
Resource.pool = resourcePool;

exports['default'] = Resource;
module.exports = exports['default'];

},{"../common.js":2,"../util.js":18,"./resource-registry.js":13}],15:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});
/**
 * Created by Shaun on 2/1/15
 * Based on the jack2d Chrono object
 * 
 */

var _Util = require('./util.js');

var _Util2 = _interopRequireWildcard(_Util);

var _mergeObject = require('./common.js');

var instance;
var ONE_SECOND = 1000;

function Scheduler(cb, rate) {
  if (!instance) {
    instance = create();
  }
  if (cb) {
    instance.schedule(cb, rate);
  }
  return instance;
}

Scheduler.instance = create;

function create() {
  return _mergeObject.mergeObject({
    scheduled: [],
    schedule: schedule,
    unschedule: unschedule,
    start: start,
    stop: stop,
    frame: frame,
    id: id
  }).start();
}

function schedule(cb, rate) {
  function setRate(newRate) {
    rate = newRate;
  }

  function makeFrame() {
    var count = 1,
        totalDeltaTime = 0;

    return function (deltaTime) {
      totalDeltaTime += deltaTime;
      if (count !== rate) {
        count++;
        return;
      }
      cb(totalDeltaTime, setRate);
      count = 1;
      totalDeltaTime = 0;
    };
  }

  if (!_Util2['default'].isFunction(cb)) {
    _Util2['default'].error('Scheduler: only functions can be scheduled.');
  }
  rate = rate || 1;

  this.scheduled.push(makeFrame());

  return this;
}

function id() {
  return this.scheduled.length;
}

function unschedule(id) {
  this.scheduled.splice(id - 1, 1);
  return this;
}

function start() {
  if (this.running) {
    return this;
  }

  _mergeObject.mergeObject({
    actualFps: 0,
    ticks: 0,
    elapsedSeconds: 0,
    running: true,
    lastUpdateTime: new Date(),
    oneSecondTimerId: window.setInterval(onOneSecond.bind(this), ONE_SECOND)
  }, this);

  return this.frame();
}

function stop() {
  this.running = false;
  window.clearInterval(this.oneSecondTimerId);
  window.cancelAnimationFrame(this.animationFrameId);

  return this;
}

function clear() {
  this.scheduled.length = 0;
  return this;
}

function frame() {
  executeFrameCallbacks.bind(this)(getDeltaTime.bind(this)());
  this.ticks++;

  if (this.running) {
    this.animationFrameId = window.requestAnimationFrame(frame.bind(this));
  }

  return this;
}

function onOneSecond() {
  this.actualFps = this.ticks;
  this.ticks = 0;
  this.elapsedSeconds++;
}

function executeFrameCallbacks(deltaTime) {
  var scheduled = this.scheduled;

  for (var i = 0, numScheduled = scheduled.length; i < numScheduled; i++) {
    scheduled[i](deltaTime);
  }
}

function getDeltaTime() {
  var now = +new Date();
  var deltaTime = (now - this.lastUpdateTime) / ONE_SECOND;

  this.lastUpdateTime = now;

  return deltaTime;
}

exports['default'] = Scheduler;
module.exports = exports['default'];

},{"./common.js":2,"./util.js":18}],16:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.setProp = setProp;
exports.includeResource = includeResource;
exports.attachResource = attachResource;

/*export function registerArray(id, schema) {
  return function(val) {
    if(Util.isArray(schema)) {
      registerInstance(id, val);
      return schema;
    }

    var instance = includeInstance(id);
    if(!instance) {
      instance = [val];
      registerInstance(instance);
      return schema;
    }

    instance.push(val);

    return schema;
  }
}*/

/*export function registerValue(id, schema) {
  return function(val) {
    registerInstance(id, val);
    return schema;
  }
}*/

exports.registerValue = registerValue;
exports.echo = echo;
/**
 * Created by shaunwest on 5/11/15.
 */

var _Util = require('../util.js');

var _Util2 = _interopRequireWildcard(_Util);

var _includeInstance$registerInstance = require('../container.js');

function setProp(prop, func) {
  return function (val, container) {
    container[prop] = func(val, container);
  };
}

function includeResource(id) {
  return function (val) {
    var resource = _includeInstance$registerInstance.includeInstance(id);
    if (resource) {
      resource.fetch(val);
    }
  };
}

function attachResource(key, resourceFactory) {
  return function (val, container) {
    container[key] = resourceFactory(val);
    return val;
  };
}

function registerValue(id, schema) {
  return function (val) {
    return {
      schema: schema,
      cb: function cb(mappedVal) {
        _includeInstance$registerInstance.registerInstance(id, mappedVal);
      }
    };
  };
}

function echo() {
  return function (val) {
    console.log(val);
  };
}

},{"../container.js":3,"../util.js":18}],17:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, '__esModule', {
  value: true
});
/**
 * Created by shaunwest on 5/9/15.
 */

var _Util = require('../util.js');

var _Util2 = _interopRequireWildcard(_Util);

var SchemaMapper = (function () {
  function SchemaMapper(schema) {
    _classCallCheck(this, SchemaMapper);

    if (typeof schema != 'object' && typeof schema != 'function') {
      throw 'SchemaMapper: schema must be an object or function';
    }

    this.schema = schema;
  }

  _createClass(SchemaMapper, [{
    key: 'map',
    value: function map(data) {
      var schema = typeof this.schema == 'function' ? this.schema(data) : this.schema;
      return mapValue(data, schema);
    }
  }]);

  return SchemaMapper;
})();

exports['default'] = SchemaMapper;

var typeMap = {
  object: iterateKeys,
  array: iterateArray
};

function mapValue(val, schema, container) {
  var mappingFunc, retVal;

  if (!schema) {
    return val;
  }

  if (typeof schema == 'function') {
    val = schema(val, container);
  } else if (typeof schema == 'object' && schema.hasOwnProperty('schema')) {
    val = mapValue(val, schema.schema);
    schema.cb(val);
    return val;
  }

  mappingFunc = typeMap[typeof val];
  if (mappingFunc) {
    val = mappingFunc(val, schema);
  }

  return val;
}

function iterateKeys(obj, schema) {
  return Object.keys(obj).reduce(function (newObj, key) {
    var schemaVal = schema.hasOwnProperty('*') ? schema['*'] : schema[key];
    newObj[key] = mapValue(obj[key], schemaVal, newObj);
    return newObj;
  }, {});
}

function iterateArray(arr, schema) {
  return arr.reduce(function (newArr, val, index) {
    newArr.push(mapValue(arr[index], schema[0], newArr));
    return newArr;
  }, []);
}
module.exports = exports['default'];

},{"../util.js":18}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
/**
 * Created by Shaun on 4/23/2015.
 */

var types = ['Array', 'Object', 'Boolean', 'Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'];

var Util = {
  isDefined: function isDefined(value) {
    return typeof value != 'undefined';
  },
  def: function def(value, defaultValue) {
    return typeof value == 'undefined' ? defaultValue : value;
  },
  error: function error(message) {
    throw new Error(id + ': ' + message);
  },
  warn: function warn(message) {
    Util.log('Warning: ' + message);
  },
  log: function log(message) {
    if (config.log) {
      console.log(id + ': ' + message);
    }
  },
  argsToArray: function argsToArray(args) {
    return Array.prototype.slice.call(args);
  },
  rand: function rand(max, min) {
    // move to extra?
    min = min || 0;
    if (min > max) {
      Util.error('rand: invalid range.');
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
};

for (var i = 0; i < types.length; i++) {
  Util['is' + types[i]] = (function (type) {
    return function (obj) {
      return Object.prototype.toString.call(obj) == '[object ' + type + ']';
    };
  })(types[i]);
}

exports['default'] = Util;
module.exports = exports['default'];

},{}],19:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

Object.defineProperty(exports, '__esModule', {
  value: true
});
/**
 * Created by shaunwest on 5/4/15.
 */

var _fragment = require('../engine/decorators/fragment.js');

var _fragment2 = _interopRequireWildcard(_fragment);

var _create = require('../engine/decorators/create.js');

var _create2 = _interopRequireWildcard(_create);

var _Scheduler = require('../engine/scheduler.js');

var _Scheduler2 = _interopRequireWildcard(_Scheduler);

var _ImageLayer = require('../engine/layers/image-layer.js');

var _ImageLayer2 = _interopRequireWildcard(_ImageLayer);

var _viewport = require('../viewport.js');

var _viewport2 = _interopRequireWildcard(_viewport);

var _ImageResource = require('../engine/resources/image-resource.js');

var _ImageResource2 = _interopRequireWildcard(_ImageResource);

var BackgroundLayer = (function () {
  function BackgroundLayer(canvasBackground, backgroundImage) {
    _classCallCheck(this, _BackgroundLayer);

    var backgroundLayer = new _ImageLayer2['default'](canvasBackground);

    _Scheduler2['default'](function () {
      backgroundLayer.draw(_viewport2['default']);
    });

    backgroundImage.ready(function (background) {
      backgroundLayer.setBackground(background);
    });
  }

  var _BackgroundLayer = BackgroundLayer;
  BackgroundLayer = _create2['default']('backgroundImage', _ImageResource2['default'])(BackgroundLayer) || BackgroundLayer;
  BackgroundLayer = _fragment2['default']('canvas-background')(BackgroundLayer) || BackgroundLayer;
  return BackgroundLayer;
})();

exports['default'] = BackgroundLayer;
module.exports = exports['default'];

},{"../engine/decorators/create.js":4,"../engine/decorators/fragment.js":5,"../engine/layers/image-layer.js":9,"../engine/resources/image-resource.js":12,"../engine/scheduler.js":15,"../viewport.js":23}],20:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = Scene;
/**
 * Created by shaunwest on 5/9/15.
 */

var _BackgroundLayer = require('./layers/background-layer.js');

var _BackgroundLayer2 = _interopRequireWildcard(_BackgroundLayer);

function Scene() {
  new _BackgroundLayer2['default']();
}

module.exports = exports['default'];

},{"./layers/background-layer.js":19}],21:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

/*function getSpriteSchema(val) {
  var spriteSchema = SpriteSchema();

  HttpResource(val)
    .ready(function(spriteData) {
      var sprite = spriteSchema.map(spriteData);
      console.log(getInstances());
    });
}*/

exports['default'] = SceneSchema;
/**
 * Created by shaunwest on 5/9/15.
 */

var _SchemaMapper = require('../engine/schema/schema-mapper.js');

var _SchemaMapper2 = _interopRequireWildcard(_SchemaMapper);

var _ImageResource = require('../engine/resources/image-resource.js');

var _ImageResource2 = _interopRequireWildcard(_ImageResource);

var _includeResource$registerValue$echo = require('../engine/schema/helper.js');

var _HttpResource = require('../engine/resources/http-resource.js');

var _HttpResource2 = _interopRequireWildcard(_HttpResource);

var _SpriteSchema = require('./sprite-schema.js');

var _SpriteSchema2 = _interopRequireWildcard(_SpriteSchema);

var _getInstances = require('../engine/container.js');

function SceneSchema() {
  return new _SchemaMapper2['default']({
    layerDefinitions: {
      background: {
        backgroundUrl: _includeResource$registerValue$echo.includeResource('backgroundImage')
      },
      /*entities: {
        sprites: registerValue('sprites')
      }*/
      entities: {
        sprites: _includeResource$registerValue$echo.registerValue('sprites')
      }
    }
  });
}

module.exports = exports['default'];

},{"../engine/container.js":3,"../engine/resources/http-resource.js":10,"../engine/resources/image-resource.js":12,"../engine/schema/helper.js":16,"../engine/schema/schema-mapper.js":17,"./sprite-schema.js":22}],22:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = SpriteSchema;
/**
 * Created by shaunwest on 5/9/15.
 */

var _SchemaMapper = require('../engine/schema/schema-mapper.js');

var _SchemaMapper2 = _interopRequireWildcard(_SchemaMapper);

var _ImageResource = require('../engine/resources/image-resource.js');

var _ImageResource2 = _interopRequireWildcard(_ImageResource);

var _attachResource$registerValue = require('../engine/schema/helper.js');

function SpriteSchema() {
  return new _SchemaMapper2['default'](_attachResource$registerValue.registerValue('spriteTypes', {
    '*': {
      spriteSheetUrl: _attachResource$registerValue.attachResource('spriteSheet', _ImageResource2['default'])
    }
  }));
}

module.exports = exports['default'];

},{"../engine/resources/image-resource.js":12,"../engine/schema/helper.js":16,"../engine/schema/schema-mapper.js":17}],23:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Created by shaunwest on 5/4/15.
 */

exports["default"] = {
  x: 0,
  y: 0,
  width: 600,
  height: 400
};
module.exports = exports["default"];

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvbWFpbi5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy9lbmdpbmUvY29tbW9uLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9jb250YWluZXIuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL2RlY29yYXRvcnMvY3JlYXRlLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9kZWNvcmF0b3JzL2ZyYWdtZW50LmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9mcmFnbWVudHMuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL2luamVjdG9yLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9ramF4LmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9sYXllcnMvaW1hZ2UtbGF5ZXIuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL3Jlc291cmNlcy9odHRwLXJlc291cmNlLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9yZXNvdXJjZXMvaW1hZ2UtbG9hZGVyLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9yZXNvdXJjZXMvaW1hZ2UtcmVzb3VyY2UuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL3Jlc291cmNlcy9yZXNvdXJjZS1yZWdpc3RyeS5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy9lbmdpbmUvcmVzb3VyY2VzL3Jlc291cmNlLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9zY2hlZHVsZXIuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL3NjaGVtYS9oZWxwZXIuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL3NjaGVtYS9zY2hlbWEtbWFwcGVyLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS91dGlsLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2xheWVycy9iYWNrZ3JvdW5kLWxheWVyLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL3NjZW5lLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL3NjaGVtYS9zY2VuZS1zY2hlbWEuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvc2NoZW1hL3Nwcml0ZS1zY2hlbWEuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvdmlld3BvcnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7O2lDQ0tnQyx1QkFBdUI7O3dCQUNsQyxnQ0FBZ0M7Ozs7NEJBQzFCLHVCQUF1Qjs7NEJBQ3pCLHFDQUFxQzs7Ozs7OzJCQUV0QywwQkFBMEI7Ozs7NEJBQ3pCLDJCQUEyQjs7OztxQkFDbEMsWUFBWTs7OztBQUU5QixtQkFUUSxpQkFBaUIsRUFTTixDQUFDOzs7Ozs7Ozs7QUFTcEIsc0JBQVMsT0FBTyxHQUFHLFFBQVEsQ0FBQzs7O0FBRzVCLE1BQU0sQ0FBQyxRQUFRLHdCQUFXLENBQUM7QUFDM0IsTUFBTSxDQUFDLFlBQVksaUJBcEJYLFlBQVksQUFvQmMsQ0FBQzs7QUFFbkMsSUFBSSxXQUFXLEdBQUcsMEJBQWEsQ0FBQzs7QUFFaEMsMEJB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LENBeUJQLFNBQVMsQ0FBQztPQUNsQztLQUNGO0dBQ0YsQ0FBQyxDQUFDO0NBQ0o7Ozs7Ozs7Ozs7OztxQkMzQnVCLFlBQVk7Ozs7OzRCQUpYLG1DQUFtQzs7Ozs2QkFDbEMsdUNBQXVDOzs7OzRDQUNyQiw0QkFBNEI7O0FBRXpELFNBQVMsWUFBWSxHQUFHO0FBQ3JDLFNBQU8sOEJBQWlCLDhCQUhGLGFBQWEsQ0FHRyxhQUFhLEVBQUU7QUFDbkQsT0FBRyxFQUFFO0FBQ0gsb0JBQWMsRUFBRSw4QkFMZCxjQUFjLENBS2UsYUFBYSw2QkFBZ0I7S0FDN0Q7R0FDRixDQUFDLENBQUMsQ0FBQztDQUNMOzs7Ozs7Ozs7Ozs7OztxQkNWYztBQUNiLEdBQUMsRUFBRSxDQUFDO0FBQ0osR0FBQyxFQUFFLENBQUM7QUFDSixPQUFLLEVBQUUsR0FBRztBQUNWLFFBQU0sRUFBRSxHQUFHO0NBQ1oiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgU2hhdW4gb24gNC8yMy8yMDE1LlxyXG4gKi9cclxuXHJcbi8vaW1wb3J0IFJlc291cmNlUmVnaXN0cnkgZnJvbSAnLi9lbmdpbmUvcmVzb3VyY2VzL3Jlc291cmNlLXJlZ2lzdHJ5LmpzJztcclxuaW1wb3J0IHtjYWNoZURhdGFFbGVtZW50c30gZnJvbSAnLi9lbmdpbmUvZnJhZ21lbnRzLmpzJztcclxuaW1wb3J0IFJlc291cmNlIGZyb20gJy4vZW5naW5lL3Jlc291cmNlcy9yZXNvdXJjZS5qcyc7XHJcbmltcG9ydCB7Z2V0SW5zdGFuY2VzfSBmcm9tICcuL2VuZ2luZS9jb250YWluZXIuanMnO1xyXG5pbXBvcnQgSHR0cFJlc291cmNlIGZyb20gJy4vZW5naW5lL3Jlc291cmNlcy9odHRwLXJlc291cmNlLmpzJztcclxuLy9pbXBvcnQgTG9hZGVyIGZyb20gJy4vbG9hZGVyLmpzJztcclxuaW1wb3J0IFNjZW5lU2NoZW1hIGZyb20gJy4vc2NoZW1hL3NjZW5lLXNjaGVtYS5qcyc7XHJcbmltcG9ydCBTcHJpdGVTY2hlbWEgZnJvbSAnLi9zY2hlbWEvc3ByaXRlLXNjaGVtYS5qcyc7XHJcbmltcG9ydCBTY2VuZSBmcm9tICcuL3NjZW5lLmpzJztcclxuXHJcbmNhY2hlRGF0YUVsZW1lbnRzKCk7XHJcblxyXG4vKndpbmRvdy5yZWZyZXNoID0gZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIFJlc291cmNlUmVnaXN0cnkuZ2V0UmVzb3VyY2VzKCdhc3NldHMva2l0dHkuanNvbicpO1xyXG59OyovXHJcblxyXG4vL3ZhciBsb2FkZXIgPSBuZXcgTG9hZGVyKCk7XHJcbi8vbG9hZGVyLmdldFNjZW5lKCdraXR0eS13b3JsZC5qc29uJywnYXNzZXRzJyk7XHJcblxyXG5SZXNvdXJjZS5iYXNlVXJpID0gJ2Fzc2V0cyc7XHJcblxyXG4vLyBERUJVR1xyXG53aW5kb3cuUmVzb3VyY2UgPSBSZXNvdXJjZTtcclxud2luZG93LmdldEluc3RhbmNlcyA9IGdldEluc3RhbmNlcztcclxuXHJcbnZhciBzY2VuZVNjaGVtYSA9IFNjZW5lU2NoZW1hKCk7XHJcblxyXG5IdHRwUmVzb3VyY2UoJ2tpdHR5LXdvcmxkLmpzb24nKVxyXG4gIC5yZWFkeShmdW5jdGlvbihzY2VuZURhdGEpIHtcclxuICAgIHZhciBzY2VuZSA9IHNjZW5lU2NoZW1hLm1hcChzY2VuZURhdGEpO1xyXG4gICAgY29uc29sZS5sb2coc2NlbmUpO1xyXG4gICAgU2NlbmUoc2NlbmUpO1xyXG4gIH0pO1xyXG5cclxudmFyIHNwcml0ZVNjaGVtYSA9IFNwcml0ZVNjaGVtYSgpO1xyXG5cclxuSHR0cFJlc291cmNlKCdraXR0eS5qc29uJylcclxuICAucmVhZHkoZnVuY3Rpb24oc3ByaXRlRGF0YSkge1xyXG4gICAgdmFyIHNwcml0ZSA9IHNwcml0ZVNjaGVtYS5tYXAoc3ByaXRlRGF0YSk7XHJcbiAgICBjb25zb2xlLmxvZyhzcHJpdGUpO1xyXG4gIH0pO1xyXG4iLCJcclxuaW1wb3J0IFV0aWwgZnJvbSAnLi91dGlsLmpzJztcclxuXHJcbi8vIFJldHVybiBldmVyeXRoaW5nIGJlZm9yZSB0aGUgbGFzdCBzbGFzaCBvZiBhIHVybFxyXG4vLyBlLmcuIGh0dHA6Ly9mb28vYmFyL2Jhei5qc29uID0+IGh0dHA6Ly9mb28vYmFyXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRCYXNlVXJsKHVybCkge1xyXG4gIHZhciBuID0gdXJsLmxhc3RJbmRleE9mKCcvJyk7XHJcbiAgcmV0dXJuIHVybC5zdWJzdHJpbmcoMCwgbik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpc0Z1bGxVcmwodXJsKSB7XHJcbiAgcmV0dXJuICh1cmwuc3Vic3RyaW5nKDAsIDcpID09PSAnaHR0cDovLycgfHxcclxuICAgIHVybC5zdWJzdHJpbmcoMCwgOCkgPT09ICdodHRwczovLycpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplVXJsKHVybCwgYmFzZVVybCkge1xyXG4gIGlmKGJhc2VVcmwgJiYgIWlzRnVsbFVybCh1cmwpKSB7XHJcbiAgICByZXR1cm4gYmFzZVVybCArICcvJyArIHVybDtcclxuICB9XHJcbiAgcmV0dXJuIHVybDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlT2JqZWN0KHNvdXJjZSwgZGVzdGluYXRpb24sIGFsbG93V3JhcCwgZXhjZXB0aW9uT25Db2xsaXNpb25zKSB7XHJcbiAgc291cmNlID0gc291cmNlIHx8IHt9OyAvL1Bvb2wuZ2V0T2JqZWN0KCk7XHJcbiAgZGVzdGluYXRpb24gPSBkZXN0aW5hdGlvbiB8fCB7fTsgLy9Qb29sLmdldE9iamVjdCgpO1xyXG5cclxuICBPYmplY3Qua2V5cyhzb3VyY2UpLmZvckVhY2goZnVuY3Rpb24ocHJvcCkge1xyXG4gICAgYXNzaWduUHJvcGVydHkoc291cmNlLCBkZXN0aW5hdGlvbiwgcHJvcCwgYWxsb3dXcmFwLCBleGNlcHRpb25PbkNvbGxpc2lvbnMpO1xyXG4gIH0pO1xyXG5cclxuICByZXR1cm4gZGVzdGluYXRpb247XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBhc3NpZ25Qcm9wZXJ0eShzb3VyY2UsIGRlc3RpbmF0aW9uLCBwcm9wLCBhbGxvd1dyYXAsIGV4Y2VwdGlvbk9uQ29sbGlzaW9ucykge1xyXG4gIGlmKGRlc3RpbmF0aW9uLmhhc093blByb3BlcnR5KHByb3ApKSB7XHJcbiAgICBpZihhbGxvd1dyYXApIHtcclxuICAgICAgZGVzdGluYXRpb25bcHJvcF0gPSBGdW5jLndyYXAoZGVzdGluYXRpb25bcHJvcF0sIHNvdXJjZVtwcm9wXSk7XHJcbiAgICAgIFV0aWwubG9nKCdNZXJnZTogd3JhcHBlZCBcXCcnICsgcHJvcCArICdcXCcnKTtcclxuICAgIH0gZWxzZSBpZihleGNlcHRpb25PbkNvbGxpc2lvbnMpIHtcclxuICAgICAgVXRpbC5lcnJvcignRmFpbGVkIHRvIG1lcmdlIG1peGluLiBNZXRob2QgXFwnJyArXHJcbiAgICAgIHByb3AgKyAnXFwnIGNhdXNlZCBhIG5hbWUgY29sbGlzaW9uLicpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZGVzdGluYXRpb25bcHJvcF0gPSBzb3VyY2VbcHJvcF07XHJcbiAgICAgIFV0aWwubG9nKCdNZXJnZTogb3Zlcndyb3RlIFxcJycgKyBwcm9wICsgJ1xcJycpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGRlc3RpbmF0aW9uO1xyXG4gIH1cclxuXHJcbiAgZGVzdGluYXRpb25bcHJvcF0gPSBzb3VyY2VbcHJvcF07XHJcblxyXG4gIHJldHVybiBkZXN0aW5hdGlvbjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldENhbnZhcyh3aWR0aCwgaGVpZ2h0KSB7XHJcbiAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG5cclxuICBjYW52YXMud2lkdGggPSB3aWR0aCB8fCA1MDA7XHJcbiAgY2FudmFzLmhlaWdodCA9IGhlaWdodCB8fCA1MDA7XHJcblxyXG4gIHJldHVybiBjYW52YXM7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpbnRlcnNlY3RzKHJlY3RBLCByZWN0Qikge1xyXG4gIHJldHVybiAhKFxyXG4gICAgcmVjdEEueCArIHJlY3RBLndpZHRoIDwgcmVjdEIueCB8fFxyXG4gICAgcmVjdEEueSArIHJlY3RBLmhlaWdodCA8IHJlY3RCLnkgfHxcclxuICAgIHJlY3RBLnggPiByZWN0Qi54ICsgcmVjdEIud2lkdGggfHxcclxuICAgIHJlY3RBLnkgPiByZWN0Qi55ICsgcmVjdEIuaGVpZ2h0XHJcbiAgKTtcclxufVxyXG5cclxuLy8gTWFrZSB0aGUgZ2l2ZW4gUkdCIHZhbHVlIHRyYW5zcGFyZW50IGluIHRoZSBnaXZlbiBpbWFnZS5cclxuLy8gUmV0dXJucyBhIG5ldyBpbWFnZS5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFRyYW5zcGFyZW50SW1hZ2UodHJhbnNSR0IsIGltYWdlKSB7XHJcbiAgdmFyIHIsIGcsIGIsIG5ld0ltYWdlLCBkYXRhTGVuZ3RoO1xyXG4gIHZhciB3aWR0aCA9IGltYWdlLndpZHRoO1xyXG4gIHZhciBoZWlnaHQgPSBpbWFnZS5oZWlnaHQ7XHJcbiAgdmFyIGltYWdlRGF0YSA9IGltYWdlXHJcbiAgICAuZ2V0Q29udGV4dCgnMmQnKVxyXG4gICAgLmdldEltYWdlRGF0YSgwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcclxuXHJcbiAgaWYodHJhbnNSR0IpIHtcclxuICAgIGRhdGFMZW5ndGggPSB3aWR0aCAqIGhlaWdodCAqIDQ7XHJcblxyXG4gICAgZm9yKHZhciBpbmRleCA9IDA7IGluZGV4IDwgZGF0YUxlbmd0aDsgaW5kZXgrPTQpIHtcclxuICAgICAgciA9IGltYWdlRGF0YS5kYXRhW2luZGV4XTtcclxuICAgICAgZyA9IGltYWdlRGF0YS5kYXRhW2luZGV4ICsgMV07XHJcbiAgICAgIGIgPSBpbWFnZURhdGEuZGF0YVtpbmRleCArIDJdO1xyXG4gICAgICBpZihyID09PSB0cmFuc1JHQlswXSAmJiBnID09PSB0cmFuc1JHQlsxXSAmJiBiID09PSB0cmFuc1JHQlsyXSkge1xyXG4gICAgICAgIGltYWdlRGF0YS5kYXRhW2luZGV4ICsgM10gPSAwO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBuZXdJbWFnZSA9IGdldENhbnZhcyh3aWR0aCwgaGVpZ2h0KTtcclxuICBuZXdJbWFnZVxyXG4gICAgLmdldENvbnRleHQoJzJkJylcclxuICAgIC5wdXRJbWFnZURhdGEoaW1hZ2VEYXRhLCAwLCAwKTtcclxuXHJcbiAgcmV0dXJuIG5ld0ltYWdlO1xyXG59XHJcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBzaGF1bndlc3Qgb24gNC8zMC8xNS5cbiAqL1xuXG52YXIgaW5zdGFuY2VzID0ge307XG52YXIgc2luZ2xldG9ucyA9IFtdO1xuXG5mdW5jdGlvbiBmaW5kU2luZ2xldG9uICh0b2tlbikge1xuICB2YXIgcmVzdWx0cyA9IHNpbmdsZXRvbnMuZmlsdGVyKGZ1bmN0aW9uKHNpbmdsZXRvbikge1xuICAgIHJldHVybiAodG9rZW4gPT09IHNpbmdsZXRvbi50b2tlbik7XG4gIH0pO1xuXG4gIHJldHVybiAocmVzdWx0cy5sZW5ndGgpID8gcmVzdWx0c1swXS5pbnN0YW5jZSA6IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VGYWN0b3J5IChpZCwgZmFjdG9yeSkge1xuICByZXR1cm4gaW5jbHVkZUluc3RhbmNlKGlkKSB8fCByZWdpc3RlckZhY3RvcnkoaWQsIGZhY3RvcnkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlU2luZ2xldG9uICh0b2tlbiwgZnVuYykge1xuICByZXR1cm4gaW5jbHVkZVNpbmdsZXRvbih0b2tlbikgfHwgcmVnaXN0ZXJTaW5nbGV0b24odG9rZW4sIGZ1bmMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlSW5zdGFuY2UoaWQsIGluc3RhbmNlKSB7XG4gIHJldHVybiBpbmNsdWRlSW5zdGFuY2UoaWQpIHx8IHJlZ2lzdGVySW5zdGFuY2UoaWQsIGluc3RhbmNlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyRmFjdG9yeSAoaWQsIGZhY3RvcnkpIHtcbiAgaWYodHlwZW9mIGZhY3RvcnkgPT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiByZWdpc3Rlckluc3RhbmNlKGlkLCBmYWN0b3J5KCkpO1xuICB9XG4gIHRocm93ICdyZWdpc3RlckZhY3Rvcnk6IGZhY3RvcnkgbXVzdCBiZSBhIGZ1bmN0aW9uJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyU2luZ2xldG9uICh0b2tlbikge1xuICB2YXIgaW5zdGFuY2U7XG5cbiAgaWYodHlwZW9mIHRva2VuICE9ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyAncmVnaXN0ZXJTaW5nbGV0b246IGZpcnN0IGFyZ3VtZW50IG11c3QgYmUgYSBmdW5jdGlvbic7XG4gIH1cblxuICBpbnN0YW5jZSA9IG5ldyB0b2tlbigpO1xuICBpZiAoaW5zdGFuY2UpIHtcbiAgICBzaW5nbGV0b25zLnB1c2goe1xuICAgICAgdG9rZW46IHRva2VuLFxuICAgICAgaW5zdGFuY2U6IGluc3RhbmNlXG4gICAgfSk7XG4gICAgcmV0dXJuIGluc3RhbmNlO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3Rlckluc3RhbmNlIChpZCwgaW5zdGFuY2UpIHtcbiAgaWYodHlwZW9mIGlkICE9ICdzdHJpbmcnIHx8IHR5cGVvZiBpbnN0YW5jZSA9PSAndW5kZWZpbmVkJykge1xuICAgIHRocm93ICdyZWdpc3Rlckluc3RhbmNlOiBhIHN0cmluZyBpZCBhbmQgYW4gaW5zdGFuY2UgYXJlIHJlcXVpcmVkJztcbiAgfVxuICBpbnN0YW5jZXNbaWRdID0gaW5zdGFuY2U7XG4gIHJldHVybiBpbnN0YW5jZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluY2x1ZGVTaW5nbGV0b24gKHRva2VuKSB7XG4gIHJldHVybiBmaW5kU2luZ2xldG9uKHRva2VuKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluY2x1ZGVJbnN0YW5jZSAoaWQpIHtcbiAgcmV0dXJuIGluc3RhbmNlc1tpZF07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRJbnN0YW5jZXMgKCkge1xuICByZXR1cm4gaW5zdGFuY2VzO1xufSIsIi8qKlxuICogQ3JlYXRlZCBieSBzaGF1bndlc3Qgb24gNS8xMC8xNS5cbiAqL1xuXG5pbXBvcnQgaW5qZWN0IGZyb20gJy4uL2luamVjdG9yLmpzJztcbmltcG9ydCB7dXNlRmFjdG9yeX0gZnJvbSAnLi4vY29udGFpbmVyLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3JlYXRlIChpZCwgZmFjdG9yeSkge1xuICB2YXIgcmVzdWx0ID0gdXNlRmFjdG9yeShpZCwgZmFjdG9yeSk7XG5cbiAgaWYocmVzdWx0KSB7XG4gICAgcmV0dXJuIGluamVjdChbcmVzdWx0XSk7XG4gIH1cbn0iLCIvKipcbiAqIENyZWF0ZWQgYnkgc2hhdW53ZXN0IG9uIDUvMTAvMTUuXG4gKi9cblxuaW1wb3J0IGluamVjdCBmcm9tICcuLi9pbmplY3Rvci5qcyc7XG5pbXBvcnQge0ZyYWdtZW50fSBmcm9tICcuLi9mcmFnbWVudHMuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoZWxlbWVudCkge1xuICByZXR1cm4gaW5qZWN0KFtGcmFnbWVudChlbGVtZW50KV0pXG59IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgU2hhdW4gb24gNC8yMy8yMDE1LlxyXG4gKi9cclxuXHJcbnZhciBhbGxEYXRhRWxlbWVudHM7XHJcblxyXG5mdW5jdGlvbiBoYXNEYXRhQXR0cmlidXRlKGVsZW1lbnQpIHtcclxuICB2YXIgYXR0cmlidXRlcyA9IGVsZW1lbnQuYXR0cmlidXRlcztcclxuICBmb3IodmFyIGkgPSAwLCBudW1BdHRyaWJ1dGVzID0gYXR0cmlidXRlcy5sZW5ndGg7IGkgPCBudW1BdHRyaWJ1dGVzOyBpKyspIHtcclxuICAgIGlmKGF0dHJpYnV0ZXNbaV0ubmFtZS5zdWJzdHIoMCwgNCkgPT09ICdkYXRhJykge1xyXG4gICAgICByZXR1cm4gZWxlbWVudDtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBmaW5kRGF0YUVsZW1lbnRzIChwYXJlbnRFbGVtZW50KSB7XHJcbiAgdmFyIGFsbEVsZW1lbnRzLCBlbGVtZW50LCBkYXRhRWxlbWVudHMgPSBbXTtcclxuXHJcbiAgaWYoIXBhcmVudEVsZW1lbnQpIHtcclxuICAgIHZhciBodG1sID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2h0bWwnKTtcclxuICAgIGlmKCFodG1sWzBdKSB7XHJcbiAgICAgIHJldHVybiBkYXRhRWxlbWVudHM7XHJcbiAgICB9XHJcbiAgICBwYXJlbnRFbGVtZW50ID0gaHRtbFswXTtcclxuICB9XHJcblxyXG4gIGFsbEVsZW1lbnRzID0gcGFyZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCcqJyk7XHJcbiAgZm9yKHZhciBpID0gMCwgbnVtRWxlbWVudHMgPSBhbGxFbGVtZW50cy5sZW5ndGg7IGkgPCBudW1FbGVtZW50czsgaSsrKSB7XHJcbiAgICBlbGVtZW50ID0gYWxsRWxlbWVudHNbaV07XHJcbiAgICBpZihoYXNEYXRhQXR0cmlidXRlKGVsZW1lbnQpKSB7XHJcbiAgICAgIGRhdGFFbGVtZW50cy5wdXNoKGVsZW1lbnQpO1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gZGF0YUVsZW1lbnRzO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gRnJhZ21lbnRzIChuYW1lKSB7XHJcbiAgaWYoIWFsbERhdGFFbGVtZW50cykge1xyXG4gICAgY2FjaGVEYXRhRWxlbWVudHMoKTtcclxuICB9XHJcbiAgcmV0dXJuIGFsbERhdGFFbGVtZW50cy5yZWR1Y2UoZnVuY3Rpb24ocmVzdWx0LCBlbGVtZW50KSB7XHJcbiAgICBpZihlbGVtZW50Lmhhc0F0dHJpYnV0ZSgnZGF0YS0nICsgbmFtZSkpIHtcclxuICAgICAgcmVzdWx0LnB1c2goZWxlbWVudCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH0sIFtdKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIEZyYWdtZW50IChuYW1lKSB7XHJcbiAgcmV0dXJuIEZyYWdtZW50cyhuYW1lKVswXTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNhY2hlRGF0YUVsZW1lbnRzKCkge1xyXG4gIGFsbERhdGFFbGVtZW50cyA9IGZpbmREYXRhRWxlbWVudHMoKTtcclxufVxyXG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgc2hhdW53ZXN0IG9uIDQvMjgvMTUuXG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKGluamVjdGVkKSB7XG4gIHJldHVybiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICBpbmplY3RlZCA9ICh0YXJnZXQuX2luamVjdGVkKSA/XG4gICAgICBpbmplY3RlZC5jb25jYXQodGFyZ2V0Ll9pbmplY3RlZCkgOlxuICAgICAgaW5qZWN0ZWQ7XG5cbiAgICBpZih0YXJnZXQuX3RhcmdldCkge1xuICAgICAgdGFyZ2V0ID0gdGFyZ2V0Ll90YXJnZXQ7XG4gICAgfVxuXG4gICAgdmFyIG5ld1RhcmdldCA9IHRhcmdldC5iaW5kLmFwcGx5KHRhcmdldCwgW251bGxdLmNvbmNhdChpbmplY3RlZCkpO1xuICAgIG5ld1RhcmdldC5fdGFyZ2V0ID0gdGFyZ2V0O1xuICAgIG5ld1RhcmdldC5faW5qZWN0ZWQgPSBpbmplY3RlZDtcbiAgICByZXR1cm4gbmV3VGFyZ2V0O1xuICB9O1xufVxuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IFNoYXVuIG9uIDUvMy8xNC5cbiAqL1xudmFyIHByb21pc2VzID0gW10sXG4gIGJhc2VVcmwgPSAnJztcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihvYmopIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG59XG5cbmZ1bmN0aW9uIHBhcnNlUmVzcG9uc2UgKGNvbnRlbnRUeXBlLCByZXNwb25zZVRleHQpIHtcbiAgaWYoY29udGVudFR5cGUuc3Vic3RyKDAsIDE2KSA9PSAnYXBwbGljYXRpb24vanNvbicpIHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShyZXNwb25zZVRleHQpO1xuICB9XG4gIHJldHVybiByZXNwb25zZVRleHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXF1ZXN0R2V0KHVybCwgY29udGVudFR5cGVPck9uUHJvZ3Jlc3MsIG9uUHJvZ3Jlc3MpIHtcbiAgdmFyIHByb21pc2U7XG5cbiAgaWYodXJsLnN1YnN0cigwLCA3KSAhPT0gJ2h0dHA6Ly8nICYmIHVybC5zdWJzdHIoMCwgOCkgIT09ICdodHRwczovLycpIHtcbiAgICB1cmwgPSBiYXNlVXJsICsgdXJsO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0SGFuZGxlcihyZXNvbHZlLCByZWplY3QpIHtcbiAgICB2YXIgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICBpZiAoaXNGdW5jdGlvbihjb250ZW50VHlwZU9yT25Qcm9ncmVzcykpIHtcbiAgICAgIG9uUHJvZ3Jlc3MgPSBjb250ZW50VHlwZU9yT25Qcm9ncmVzcztcbiAgICAgIGNvbnRlbnRUeXBlT3JPblByb2dyZXNzID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGlmIChvblByb2dyZXNzKSB7XG4gICAgICByZXEuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgb25Qcm9ncmVzcyhldmVudC5sb2FkZWQsIGV2ZW50LnRvdGFsKTtcbiAgICAgIH0sIGZhbHNlKTtcbiAgICB9XG5cbiAgICByZXEub25lcnJvciA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgcmVqZWN0KCdOZXR3b3JrIGVycm9yLicpO1xuICAgIH07XG5cbiAgICByZXEub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGNvbnRlbnRUeXBlID0gY29udGVudFR5cGVPck9uUHJvZ3Jlc3MgfHwgdGhpcy5nZXRSZXNwb25zZUhlYWRlcignY29udGVudC10eXBlJykgfHwgJyc7XG4gICAgICAodGhpcy5zdGF0dXMgPj0gMzAwKSA/XG4gICAgICAgIHJlamVjdCh7c3RhdHVzVGV4dDogdGhpcy5zdGF0dXNUZXh0LCBzdGF0dXM6IHRoaXMuc3RhdHVzfSkgOlxuICAgICAgICByZXNvbHZlKHtkYXRhOiBwYXJzZVJlc3BvbnNlKGNvbnRlbnRUeXBlLCB0aGlzLnJlc3BvbnNlVGV4dCksIHN0YXR1czogdGhpcy5zdGF0dXN9KTtcbiAgICB9O1xuXG4gICAgcmVxLm9wZW4oJ2dldCcsIHVybCwgdHJ1ZSk7XG4gICAgcmVxLnNlbmQoKTtcbiAgfVxuXG4gIHByb21pc2UgPSBuZXcgUHJvbWlzZShnZXRIYW5kbGVyKTtcbiAgcHJvbWlzZXMucHVzaChwcm9taXNlKTtcblxuICByZXR1cm4gcHJvbWlzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHB1cmdlKCkge1xuICBwcm9taXNlcy5sZW5ndGggPSAwO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UHJvbWlzZXMoKSB7XG4gIHJldHVybiBwcm9taXNlcztcbn1cblxuZnVuY3Rpb24gc2V0QmFzZVVybCh1cmwpIHtcbiAgYmFzZVVybCA9IHVybDtcbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuICByZXF1ZXN0R2V0OiByZXF1ZXN0R2V0LFxuICBwdXJnZTogcHVyZ2UsXG4gIHNldEJhc2VVcmw6IHNldEJhc2VVcmwsXG4gIGdldFByb21pc2VzOiBnZXRQcm9taXNlc1xufTtcbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IFNoYXVuIG9uIDIvNS8xNVxyXG4gKiBcclxuICovXHJcbi8vIFRPRE86IHJlbW92ZSByZWZlcmVuY2VzIHRvICdiYWNrZ3JvdW5kJ1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbWFnZUxheWVyIHtcclxuICBjb25zdHJ1Y3RvciAoY2FudmFzKSB7XHJcbiAgICB0aGlzLmNhbnZhcyA9IGNhbnZhcztcclxuICAgIHRoaXMuY29udGV4dDJkID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgfVxyXG5cclxuICBzZXRCYWNrZ3JvdW5kIChpbWFnZSkge1xyXG4gICAgdGhpcy5iYWNrZ3JvdW5kID0gaW1hZ2U7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIGRyYXcgKHZpZXdwb3J0KSB7XHJcbiAgICBpZighdmlld3BvcnQpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuY29udGV4dDJkLmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcclxuXHJcbiAgICBpZih0aGlzLmJhY2tncm91bmQpIHtcclxuICAgICAgdGhpcy5jb250ZXh0MmQuZHJhd0ltYWdlKFxyXG4gICAgICAgIHRoaXMuYmFja2dyb3VuZCxcclxuICAgICAgICB2aWV3cG9ydC54LCB2aWV3cG9ydC55LFxyXG4gICAgICAgIHZpZXdwb3J0LndpZHRoLCB2aWV3cG9ydC5oZWlnaHQsXHJcbiAgICAgICAgMCwgMCxcclxuICAgICAgICB2aWV3cG9ydC53aWR0aCwgdmlld3BvcnQuaGVpZ2h0XHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBnZXRMYXllciAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5jYW52YXM7XHJcbiAgfVxyXG59XHJcbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IFNoYXVuIG9uIDMvMS8xNVxyXG4gKlxyXG4gKi9cclxuXHJcbmltcG9ydCBVdGlsIGZyb20gJy4uL3V0aWwuanMnO1xyXG5pbXBvcnQge3JlcXVlc3RHZXR9IGZyb20gJy4uL2tqYXguanMnO1xyXG5pbXBvcnQgUmVzb3VyY2UgZnJvbSAnLi9yZXNvdXJjZS5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih1cmkpIHtcclxuICByZXR1cm4gUmVzb3VyY2UocmVxdWVzdEdldCwgdXJpKVxyXG4gICAgLnJlYWR5KGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xyXG4gICAgfSk7XHJcbn07XHJcblxyXG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgU2hhdW4gb24gNS8xLzE0LlxuICovXG5cbnZhciBJTUFHRV9XQUlUX0lOVEVSVkFMID0gMTAwO1xuXG5mdW5jdGlvbiB3YWl0Rm9ySW1hZ2UgKGltYWdlKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICB2YXIgaW50ZXJ2YWxJZCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuICAgICAgaWYoaW1hZ2UuY29tcGxldGUpIHtcbiAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbElkKTtcbiAgICAgICAgcmVzb2x2ZShpbWFnZSk7XG4gICAgICB9XG4gICAgfSwgSU1BR0VfV0FJVF9JTlRFUlZBTCk7XG5cbiAgICBpbWFnZS5vbmVycm9yID0gZnVuY3Rpb24gKCkge1xuICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbElkKTtcbiAgICAgIHJlamVjdCgpO1xuICAgIH07XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0SW1hZ2UgKHVyaSkge1xuICB2YXIgaW1hZ2UsIHByb21pc2U7XG5cbiAgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgaW1hZ2Uuc3JjID0gdXJpO1xuXG4gIHByb21pc2UgPSB3YWl0Rm9ySW1hZ2UoaW1hZ2UpO1xuXG4gIHJldHVybiBwcm9taXNlO1xufVxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgU2hhdW4gb24gMS8yNS8xNVxyXG4gKlxyXG4gKi9cclxuXHJcbmltcG9ydCBSZXNvdXJjZSBmcm9tICcuL3Jlc291cmNlLmpzJztcclxuaW1wb3J0IHtnZXRJbWFnZX0gZnJvbSAnLi9pbWFnZS1sb2FkZXIuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKHVyaSkge1xyXG4gIHJldHVybiBSZXNvdXJjZShnZXRJbWFnZSwgdXJpKTtcclxufTtcclxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgU2hhdW4gb24gMy8xLzE1XHJcbiAqXHJcbiAqL1xyXG5cclxudmFyIHJlc291cmNlcyA9IHt9O1xyXG5cclxuLypmdW5jdGlvbiByZWdpc3RlciAocmVzb3VyY2UpIHtcclxuICB2YXIgc291cmNlID0gcmVzb3VyY2Uuc291cmNlO1xyXG5cclxuICBpZighcmVzb3VyY2VzW3NvdXJjZV0pIHtcclxuICAgIHJlc291cmNlc1tzb3VyY2VdID0gW107XHJcbiAgfVxyXG5cclxuICByZXNvdXJjZXNbc291cmNlXS5wdXNoKHJlc291cmNlKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0UmVzb3VyY2VzIChzb3VyY2UpIHtcclxuICBpZighc291cmNlKSB7XHJcbiAgICByZXR1cm4gcmVzb3VyY2VzO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHJlc291cmNlc1tzb3VyY2VdO1xyXG59Ki9cclxuXHJcbmZ1bmN0aW9uIHJlZ2lzdGVyIChyZXNvdXJjZSkge1xyXG4gIHJlc291cmNlc1tyZXNvdXJjZS5zb3VyY2VdID0gcmVzb3VyY2U7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFJlc291cmNlKHNvdXJjZSkge1xyXG4gIHJldHVybiByZXNvdXJjZXNbc291cmNlXTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHJlZ2lzdGVyOiByZWdpc3RlcixcclxuICBnZXRSZXNvdXJjZTogZ2V0UmVzb3VyY2VcclxufTtcclxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgU2hhdW4gb24gMy8zLzE1XHJcbiAqXHJcbiAqL1xyXG5cclxuaW1wb3J0IFV0aWwgZnJvbSAnLi4vdXRpbC5qcyc7XHJcbmltcG9ydCBSZXNvdXJjZVJlZ2lzdHJ5IGZyb20gJy4vcmVzb3VyY2UtcmVnaXN0cnkuanMnO1xyXG5pbXBvcnQge2lzRnVsbFVybH0gZnJvbSAnLi4vY29tbW9uLmpzJztcclxuXHJcbnZhciByZXNvdXJjZVBvb2wgPSB7fTtcclxuXHJcbi8vIG1ldGhvZCBtdXN0IGJlIGFzeW5jaHJvbm91c1xyXG5mdW5jdGlvbiBSZXNvdXJjZSAobWV0aG9kLCBzb3VyY2UpIHtcclxuICB2YXIgc3VjY2Vzc0NhbGxiYWNrcyA9IFtdLFxyXG4gICAgZXJyb3JDYWxsYmFja3MgPSBbXSxcclxuICAgIHJlc291cmNlID0ge1xyXG4gICAgICByZWFkeTogcmVhZHksXHJcbiAgICAgIGZldGNoOiBmZXRjaCxcclxuICAgICAgcHJvbWlzZTogbnVsbCxcclxuICAgICAgc291cmNlOiBzb3VyY2VcclxuICAgIH07XHJcblxyXG4gIGlmKCFVdGlsLmlzRnVuY3Rpb24obWV0aG9kKSkge1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcmVhZHkgKG9uU3VjY2Vzcywgb25FcnJvcikge1xyXG4gICAgaWYoVXRpbC5pc0FycmF5KG9uU3VjY2VzcykpIHtcclxuICAgICAgc3VjY2Vzc0NhbGxiYWNrcyA9IHN1Y2Nlc3NDYWxsYmFja3MuY29uY2F0KG9uU3VjY2Vzcyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzdWNjZXNzQ2FsbGJhY2tzLnB1c2gob25TdWNjZXNzKTtcclxuICAgIH1cclxuXHJcbiAgICBpZihVdGlsLmlzQXJyYXkob25FcnJvcikpIHtcclxuICAgICAgZXJyb3JDYWxsYmFja3MgPSBlcnJvckNhbGxiYWNrcy5jb25jYXQob25FcnJvcik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBlcnJvckNhbGxiYWNrcy5wdXNoKG9uRXJyb3IpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXNvdXJjZTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIG9uU3VjY2VzcyAocmVzdWx0LCBpbmRleCkge1xyXG4gICAgdmFyIHN1Y2Nlc3NDYWxsYmFjayA9IHN1Y2Nlc3NDYWxsYmFja3NbaW5kZXhdO1xyXG4gICAgaWYoIXN1Y2Nlc3NDYWxsYmFjaykge1xyXG4gICAgICBpZihpbmRleCA8IHN1Y2Nlc3NDYWxsYmFja3MubGVuZ3RoKSB7IG9uRXJyb3IocmVzdWx0LCBpbmRleCArIDEpOyB9XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgbmV3UmVzdWx0ID0gc3VjY2Vzc0NhbGxiYWNrKHJlc3VsdCk7XHJcbiAgICBpZihuZXdSZXN1bHQgJiYgbmV3UmVzdWx0LnJlYWR5KSB7XHJcbiAgICAgIG5ld1Jlc3VsdC5yZWFkeShmdW5jdGlvbiAocmVzdWx0KSB7XHJcbiAgICAgICAgb25TdWNjZXNzKHJlc3VsdCwgaW5kZXggKyAxKTtcclxuICAgICAgfSwgZnVuY3Rpb24gKHJlc3VsdCkge1xyXG4gICAgICAgIG9uRXJyb3IocmVzdWx0LCBpbmRleCArIDEpO1xyXG4gICAgICB9KTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfSBlbHNlIGlmKCFuZXdSZXN1bHQpIHtcclxuICAgICAgbmV3UmVzdWx0ID0gcmVzdWx0O1xyXG4gICAgfVxyXG4gICAgb25TdWNjZXNzKG5ld1Jlc3VsdCwgaW5kZXggKyAxKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIG9uRXJyb3IocmVzdWx0LCBpbmRleCkge1xyXG4gICAgdmFyIGVycm9yQ2FsbGJhY2sgPSBlcnJvckNhbGxiYWNrc1tpbmRleF07XHJcbiAgICBpZighZXJyb3JDYWxsYmFjaykge1xyXG4gICAgICBpZihpbmRleCA8IGVycm9yQ2FsbGJhY2tzLmxlbmd0aCkgeyBvbkVycm9yKHJlc3VsdCwgaW5kZXggKyAxKTsgfVxyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgcmVzdWx0ID0gZXJyb3JDYWxsYmFjayhyZXN1bHQpO1xyXG4gICAgaWYocmVzdWx0ICYmIHJlc3VsdC5yZWFkeSkge1xyXG4gICAgICByZXN1bHQucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgb25TdWNjZXNzKHJlc3VsdCwgaW5kZXggKyAxKTtcclxuICAgICAgfSwgZnVuY3Rpb24ocmVzdWx0KSB7XHJcbiAgICAgICAgb25FcnJvcihyZXN1bHQsIGluZGV4ICsgMSk7XHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBvbkVycm9yKHJlc3VsdCwgaW5kZXggKyAxKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGZldGNoIChzb3VyY2UpIHtcclxuICAgIHZhciBwcm9taXNlO1xyXG5cclxuICAgIGlmKFJlc291cmNlLmJhc2VVcmkpIHtcclxuICAgICAgaWYoIWlzRnVsbFVybChzb3VyY2UpKSB7XHJcbiAgICAgICAgc291cmNlID0gUmVzb3VyY2UuYmFzZVVyaSArICcvJyArIHNvdXJjZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByb21pc2UgPSBtZXRob2Qoc291cmNlKTtcclxuXHJcbiAgICBpZighVXRpbC5pc09iamVjdChwcm9taXNlKSB8fCAhcHJvbWlzZS50aGVuKSB7XHJcbiAgICAgIFV0aWwuZXJyb3IoJ1Byb3ZpZGVkIHJlc291cmNlIG1ldGhvZCBkaWQgbm90IHJldHVybiBhIHRoZW5hYmxlIG9iamVjdCcpO1xyXG4gICAgfVxyXG5cclxuICAgIHJlc291cmNlLnNvdXJjZSA9IHNvdXJjZTtcclxuICAgIHJlc291cmNlLnByb21pc2UgPSBwcm9taXNlLnRoZW4oXHJcbiAgICAgIGZ1bmN0aW9uKHJlc3VsdCkge1xyXG4gICAgICAgIG9uU3VjY2VzcyhyZXN1bHQsIDApO1xyXG4gICAgICB9LFxyXG4gICAgICBmdW5jdGlvbihyZXN1bHQpIHtcclxuICAgICAgICBvbkVycm9yKHJlc3VsdCwgMCk7XHJcbiAgICAgIH1cclxuICAgICk7XHJcblxyXG4gICAgcmV0dXJuIHJlc291cmNlO1xyXG4gIH1cclxuXHJcbiAgLy8gVE9ETzogbWFrZSBiZXR0ZXJcclxuICBpZihzb3VyY2UpIHtcclxuICAgIHZhciBmdWxsU291cmNlID0gc291cmNlO1xyXG4gICAgaWYgKFJlc291cmNlLmJhc2VVcmkpIHtcclxuICAgICAgaWYgKCFpc0Z1bGxVcmwoc291cmNlKSkge1xyXG4gICAgICAgIGZ1bGxTb3VyY2UgPSBSZXNvdXJjZS5iYXNlVXJpICsgJy8nICsgc291cmNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB2YXIgZXhpc3RpbmdSZXNvdXJjZSA9IHJlc291cmNlUG9vbFtmdWxsU291cmNlXTtcclxuICAgIGlmIChleGlzdGluZ1Jlc291cmNlKSB7XHJcbiAgICAgIHJldHVybiBleGlzdGluZ1Jlc291cmNlLmZldGNoKHNvdXJjZSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvL1Jlc291cmNlUmVnaXN0cnkucmVnaXN0ZXIocmVzb3VyY2UpO1xyXG4gIHJlc291cmNlUG9vbFtmdWxsU291cmNlXSA9IHJlc291cmNlO1xyXG4gIHJldHVybiAoc291cmNlKSA/IHJlc291cmNlLmZldGNoKHNvdXJjZSkgOiByZXNvdXJjZTtcclxufVxyXG5cclxuUmVzb3VyY2UuYmFzZVVyaSA9ICcnO1xyXG5SZXNvdXJjZS5wb29sID0gcmVzb3VyY2VQb29sO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgUmVzb3VyY2U7XHJcbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IFNoYXVuIG9uIDIvMS8xNVxyXG4gKiBCYXNlZCBvbiB0aGUgamFjazJkIENocm9ubyBvYmplY3RcclxuICogXHJcbiAqL1xyXG5cclxuaW1wb3J0IFV0aWwgZnJvbSAnLi91dGlsLmpzJztcclxuaW1wb3J0IHttZXJnZU9iamVjdH0gZnJvbSAnLi9jb21tb24uanMnO1xyXG5cclxudmFyIGluc3RhbmNlO1xyXG52YXIgT05FX1NFQ09ORCA9IDEwMDA7XHJcblxyXG5mdW5jdGlvbiBTY2hlZHVsZXIoY2IsIHJhdGUpIHtcclxuICBpZighaW5zdGFuY2UpIHtcclxuICAgIGluc3RhbmNlID0gY3JlYXRlKCk7XHJcbiAgfVxyXG4gIGlmKGNiKSB7XHJcbiAgICBpbnN0YW5jZS5zY2hlZHVsZShjYiwgcmF0ZSk7XHJcbiAgfVxyXG4gIHJldHVybiBpbnN0YW5jZTtcclxufVxyXG5cclxuU2NoZWR1bGVyLmluc3RhbmNlID0gY3JlYXRlO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlKCkge1xyXG4gIHJldHVybiBtZXJnZU9iamVjdCh7XHJcbiAgICBzY2hlZHVsZWQ6IFtdLFxyXG4gICAgc2NoZWR1bGU6IHNjaGVkdWxlLFxyXG4gICAgdW5zY2hlZHVsZTogdW5zY2hlZHVsZSxcclxuICAgIHN0YXJ0OiBzdGFydCxcclxuICAgIHN0b3A6IHN0b3AsXHJcbiAgICBmcmFtZTogZnJhbWUsXHJcbiAgICBpZDogaWRcclxuICB9KS5zdGFydCgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzY2hlZHVsZShjYiwgcmF0ZSkge1xyXG4gIGZ1bmN0aW9uIHNldFJhdGUobmV3UmF0ZSkge1xyXG4gICAgcmF0ZSA9IG5ld1JhdGU7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBtYWtlRnJhbWUoKSB7XHJcbiAgICB2YXIgY291bnQgPSAxLFxyXG4gICAgICB0b3RhbERlbHRhVGltZSA9IDA7XHJcblxyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKGRlbHRhVGltZSkge1xyXG4gICAgICB0b3RhbERlbHRhVGltZSArPSBkZWx0YVRpbWU7XHJcbiAgICAgIGlmKGNvdW50ICE9PSByYXRlKSB7XHJcbiAgICAgICAgY291bnQrKztcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgY2IodG90YWxEZWx0YVRpbWUsIHNldFJhdGUpO1xyXG4gICAgICBjb3VudCA9IDE7XHJcbiAgICAgIHRvdGFsRGVsdGFUaW1lID0gMDtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBpZighVXRpbC5pc0Z1bmN0aW9uKGNiKSkge1xyXG4gICAgVXRpbC5lcnJvcignU2NoZWR1bGVyOiBvbmx5IGZ1bmN0aW9ucyBjYW4gYmUgc2NoZWR1bGVkLicpO1xyXG4gIH1cclxuICByYXRlID0gcmF0ZSB8fCAxO1xyXG5cclxuICB0aGlzLnNjaGVkdWxlZC5wdXNoKG1ha2VGcmFtZSgpKTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlkKCkge1xyXG4gIHJldHVybiB0aGlzLnNjaGVkdWxlZC5sZW5ndGg7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHVuc2NoZWR1bGUoaWQpIHtcclxuICB0aGlzLnNjaGVkdWxlZC5zcGxpY2UoaWQgLSAxLCAxKTtcclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuZnVuY3Rpb24gc3RhcnQoKSB7XHJcbiAgaWYodGhpcy5ydW5uaW5nKSB7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIG1lcmdlT2JqZWN0KHtcclxuICAgIGFjdHVhbEZwczogMCxcclxuICAgIHRpY2tzOiAwLFxyXG4gICAgZWxhcHNlZFNlY29uZHM6IDAsXHJcbiAgICBydW5uaW5nOiB0cnVlLFxyXG4gICAgbGFzdFVwZGF0ZVRpbWU6IG5ldyBEYXRlKCksXHJcbiAgICBvbmVTZWNvbmRUaW1lcklkOiB3aW5kb3cuc2V0SW50ZXJ2YWwob25PbmVTZWNvbmQuYmluZCh0aGlzKSwgT05FX1NFQ09ORClcclxuICB9LCB0aGlzKTtcclxuXHJcbiAgcmV0dXJuIHRoaXMuZnJhbWUoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gc3RvcCgpIHtcclxuICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcclxuICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLm9uZVNlY29uZFRpbWVySWQpO1xyXG4gIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLmFuaW1hdGlvbkZyYW1lSWQpO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuZnVuY3Rpb24gY2xlYXIoKSB7XHJcbiAgdGhpcy5zY2hlZHVsZWQubGVuZ3RoID0gMDtcclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuZnVuY3Rpb24gZnJhbWUoKSB7XHJcbiAgZXhlY3V0ZUZyYW1lQ2FsbGJhY2tzLmJpbmQodGhpcykoZ2V0RGVsdGFUaW1lLmJpbmQodGhpcykoKSk7XHJcbiAgdGhpcy50aWNrcysrO1xyXG5cclxuICBpZih0aGlzLnJ1bm5pbmcpIHtcclxuICAgIHRoaXMuYW5pbWF0aW9uRnJhbWVJZCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnJhbWUuYmluZCh0aGlzKSk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuZnVuY3Rpb24gb25PbmVTZWNvbmQoKSB7XHJcbiAgdGhpcy5hY3R1YWxGcHMgPSB0aGlzLnRpY2tzO1xyXG4gIHRoaXMudGlja3MgPSAwO1xyXG4gIHRoaXMuZWxhcHNlZFNlY29uZHMrKztcclxufVxyXG5cclxuZnVuY3Rpb24gZXhlY3V0ZUZyYW1lQ2FsbGJhY2tzKGRlbHRhVGltZSkge1xyXG4gIHZhciBzY2hlZHVsZWQgPSB0aGlzLnNjaGVkdWxlZDtcclxuXHJcbiAgZm9yKHZhciBpID0gMCwgbnVtU2NoZWR1bGVkID0gc2NoZWR1bGVkLmxlbmd0aDsgaSA8IG51bVNjaGVkdWxlZDsgaSsrKSB7XHJcbiAgICBzY2hlZHVsZWRbaV0oZGVsdGFUaW1lKTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldERlbHRhVGltZSgpIHtcclxuICB2YXIgbm93ID0gK25ldyBEYXRlKCk7XHJcbiAgdmFyIGRlbHRhVGltZSA9IChub3cgLSB0aGlzLmxhc3RVcGRhdGVUaW1lKSAvIE9ORV9TRUNPTkQ7XHJcblxyXG4gIHRoaXMubGFzdFVwZGF0ZVRpbWUgPSBub3c7XHJcblxyXG4gIHJldHVybiBkZWx0YVRpbWU7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFNjaGVkdWxlcjtcclxuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IHNoYXVud2VzdCBvbiA1LzExLzE1LlxuICovXG5cbmltcG9ydCBVdGlsIGZyb20gJy4uL3V0aWwuanMnO1xuaW1wb3J0IHtpbmNsdWRlSW5zdGFuY2UsIHJlZ2lzdGVySW5zdGFuY2V9IGZyb20gJy4uL2NvbnRhaW5lci5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRQcm9wKHByb3AsIGZ1bmMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHZhbCwgY29udGFpbmVyKSB7XG4gICAgY29udGFpbmVyW3Byb3BdID0gZnVuYyh2YWwsIGNvbnRhaW5lcik7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluY2x1ZGVSZXNvdXJjZShpZCkge1xuICByZXR1cm4gZnVuY3Rpb24odmFsKSB7XG4gICAgdmFyIHJlc291cmNlID0gaW5jbHVkZUluc3RhbmNlKGlkKTtcbiAgICBpZihyZXNvdXJjZSkge1xuICAgICAgcmVzb3VyY2UuZmV0Y2godmFsKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGF0dGFjaFJlc291cmNlKGtleSwgcmVzb3VyY2VGYWN0b3J5KSB7XG4gIHJldHVybiBmdW5jdGlvbih2YWwsIGNvbnRhaW5lcikge1xuICAgIGNvbnRhaW5lcltrZXldID0gcmVzb3VyY2VGYWN0b3J5KHZhbCk7XG4gICAgcmV0dXJuIHZhbDtcbiAgfVxufVxuXG4vKmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckFycmF5KGlkLCBzY2hlbWEpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHZhbCkge1xuICAgIGlmKFV0aWwuaXNBcnJheShzY2hlbWEpKSB7XG4gICAgICByZWdpc3Rlckluc3RhbmNlKGlkLCB2YWwpO1xuICAgICAgcmV0dXJuIHNjaGVtYTtcbiAgICB9XG5cbiAgICB2YXIgaW5zdGFuY2UgPSBpbmNsdWRlSW5zdGFuY2UoaWQpO1xuICAgIGlmKCFpbnN0YW5jZSkge1xuICAgICAgaW5zdGFuY2UgPSBbdmFsXTtcbiAgICAgIHJlZ2lzdGVySW5zdGFuY2UoaW5zdGFuY2UpO1xuICAgICAgcmV0dXJuIHNjaGVtYTtcbiAgICB9XG5cbiAgICBpbnN0YW5jZS5wdXNoKHZhbCk7XG5cbiAgICByZXR1cm4gc2NoZW1hO1xuICB9XG59Ki9cblxuLypleHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJWYWx1ZShpZCwgc2NoZW1hKSB7XG4gIHJldHVybiBmdW5jdGlvbih2YWwpIHtcbiAgICByZWdpc3Rlckluc3RhbmNlKGlkLCB2YWwpO1xuICAgIHJldHVybiBzY2hlbWE7XG4gIH1cbn0qL1xuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJWYWx1ZShpZCwgc2NoZW1hKSB7XG4gIHJldHVybiBmdW5jdGlvbih2YWwpIHtcbiAgICByZXR1cm4ge1xuICAgICAgc2NoZW1hOiBzY2hlbWEsXG4gICAgICBjYjogZnVuY3Rpb24gKG1hcHBlZFZhbCkge1xuICAgICAgICByZWdpc3Rlckluc3RhbmNlKGlkLCBtYXBwZWRWYWwpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVjaG8oKSB7XG4gIHJldHVybiBmdW5jdGlvbih2YWwpIHtcbiAgICBjb25zb2xlLmxvZyh2YWwpO1xuICB9XG59IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IHNoYXVud2VzdCBvbiA1LzkvMTUuXG4gKi9cbmltcG9ydCBVdGlsIGZyb20gJy4uL3V0aWwuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTY2hlbWFNYXBwZXIge1xuICBjb25zdHJ1Y3RvciAoc2NoZW1hKSB7XG4gICAgaWYodHlwZW9mIHNjaGVtYSAhPSAnb2JqZWN0JyAmJiB0eXBlb2Ygc2NoZW1hICE9ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93ICdTY2hlbWFNYXBwZXI6IHNjaGVtYSBtdXN0IGJlIGFuIG9iamVjdCBvciBmdW5jdGlvbic7XG4gICAgfVxuXG4gICAgdGhpcy5zY2hlbWEgPSBzY2hlbWE7XG4gIH1cblxuICBtYXAgKGRhdGEpIHtcbiAgICB2YXIgc2NoZW1hID0gKHR5cGVvZiB0aGlzLnNjaGVtYSA9PSAnZnVuY3Rpb24nKSA/IHRoaXMuc2NoZW1hKGRhdGEpIDogdGhpcy5zY2hlbWE7XG4gICAgcmV0dXJuIG1hcFZhbHVlKGRhdGEsIHNjaGVtYSk7XG4gIH1cbn1cblxudmFyIHR5cGVNYXAgPSB7XG4gICdvYmplY3QnOiBpdGVyYXRlS2V5cyxcbiAgJ2FycmF5JzogaXRlcmF0ZUFycmF5XG59O1xuXG5mdW5jdGlvbiBtYXBWYWx1ZSAodmFsLCBzY2hlbWEsIGNvbnRhaW5lcikge1xuICB2YXIgbWFwcGluZ0Z1bmMsIHJldFZhbDtcblxuICBpZighc2NoZW1hKSB7XG4gICAgcmV0dXJuIHZhbDtcbiAgfVxuXG4gIGlmKHR5cGVvZiBzY2hlbWEgPT0gJ2Z1bmN0aW9uJykge1xuICAgIHZhbCA9IHNjaGVtYSh2YWwsIGNvbnRhaW5lcik7XG4gIH0gZWxzZSBpZih0eXBlb2Ygc2NoZW1hID09ICdvYmplY3QnICYmIHNjaGVtYS5oYXNPd25Qcm9wZXJ0eSgnc2NoZW1hJykpIHtcbiAgICB2YWwgPSBtYXBWYWx1ZSh2YWwsIHNjaGVtYS5zY2hlbWEpO1xuICAgIHNjaGVtYS5jYih2YWwpO1xuICAgIHJldHVybiB2YWw7XG4gIH1cblxuICBtYXBwaW5nRnVuYyA9IHR5cGVNYXBbdHlwZW9mIHZhbF07XG4gIGlmKG1hcHBpbmdGdW5jKSB7XG4gICAgdmFsID0gbWFwcGluZ0Z1bmModmFsLCBzY2hlbWEpO1xuICB9XG5cbiAgcmV0dXJuIHZhbDtcbn1cblxuZnVuY3Rpb24gaXRlcmF0ZUtleXMgKG9iaiwgc2NoZW1hKSB7XG4gIHJldHVybiBPYmplY3Qua2V5cyhvYmopLnJlZHVjZShmdW5jdGlvbihuZXdPYmosIGtleSkge1xuICAgIHZhciBzY2hlbWFWYWwgPSAoc2NoZW1hLmhhc093blByb3BlcnR5KCcqJykpID8gc2NoZW1hWycqJ10gOiBzY2hlbWFba2V5XTtcbiAgICBuZXdPYmpba2V5XSA9IG1hcFZhbHVlKG9ialtrZXldLCBzY2hlbWFWYWwsIG5ld09iaik7XG4gICAgcmV0dXJuIG5ld09iajtcbiAgfSwge30pO1xufVxuXG5mdW5jdGlvbiBpdGVyYXRlQXJyYXkgKGFyciwgc2NoZW1hKSB7XG4gIHJldHVybiBhcnIucmVkdWNlKGZ1bmN0aW9uKG5ld0FyciwgdmFsLCBpbmRleCkge1xuICAgIG5ld0Fyci5wdXNoKG1hcFZhbHVlKGFycltpbmRleF0sIHNjaGVtYVswXSwgbmV3QXJyKSk7XG4gICAgcmV0dXJuIG5ld0FycjtcbiAgfSwgW10pO1xufVxuXG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBTaGF1biBvbiA0LzIzLzIwMTUuXHJcbiAqL1xyXG5cclxudmFyIHR5cGVzID0gWydBcnJheScsICdPYmplY3QnLCAnQm9vbGVhbicsICdBcmd1bWVudHMnLCAnRnVuY3Rpb24nLCAnU3RyaW5nJywgJ051bWJlcicsICdEYXRlJywgJ1JlZ0V4cCddO1xyXG5cclxudmFyIFV0aWwgPSB7XHJcbiAgaXNEZWZpbmVkOiBmdW5jdGlvbiAodmFsdWUpIHsgcmV0dXJuIHR5cGVvZiB2YWx1ZSAhPSAndW5kZWZpbmVkJyB9LFxyXG4gIGRlZjogZnVuY3Rpb24gKHZhbHVlLCBkZWZhdWx0VmFsdWUpIHsgcmV0dXJuICh0eXBlb2YgdmFsdWUgPT0gJ3VuZGVmaW5lZCcpID8gZGVmYXVsdFZhbHVlIDogdmFsdWUgfSxcclxuICBlcnJvcjogZnVuY3Rpb24gKG1lc3NhZ2UpIHsgdGhyb3cgbmV3IEVycm9yKGlkICsgJzogJyArIG1lc3NhZ2UpIH0sXHJcbiAgd2FybjogZnVuY3Rpb24gKG1lc3NhZ2UpIHsgVXRpbC5sb2coJ1dhcm5pbmc6ICcgKyBtZXNzYWdlKSB9LFxyXG4gIGxvZzogZnVuY3Rpb24gKG1lc3NhZ2UpIHsgaWYoY29uZmlnLmxvZykgeyBjb25zb2xlLmxvZyhpZCArICc6ICcgKyBtZXNzYWdlKSB9IH0sXHJcbiAgYXJnc1RvQXJyYXk6IGZ1bmN0aW9uIChhcmdzKSB7IHJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmdzKSB9LFxyXG4gIHJhbmQ6IGZ1bmN0aW9uIChtYXgsIG1pbikgeyAvLyBtb3ZlIHRvIGV4dHJhP1xyXG4gICAgbWluID0gbWluIHx8IDA7XHJcbiAgICBpZihtaW4gPiBtYXgpIHsgVXRpbC5lcnJvcigncmFuZDogaW52YWxpZCByYW5nZS4nKTsgfVxyXG4gICAgcmV0dXJuIE1hdGguZmxvb3IoKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpKSArIChtaW4pO1xyXG4gIH1cclxufTtcclxuXHJcbmZvcih2YXIgaSA9IDA7IGkgPCB0eXBlcy5sZW5ndGg7IGkrKykge1xyXG4gIFV0aWxbJ2lzJyArIHR5cGVzW2ldXSA9IChmdW5jdGlvbih0eXBlKSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqKSB7XHJcbiAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PSAnW29iamVjdCAnICsgdHlwZSArICddJztcclxuICAgIH07XHJcbiAgfSkodHlwZXNbaV0pO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBVdGlsOyIsIi8qKlxuICogQ3JlYXRlZCBieSBzaGF1bndlc3Qgb24gNS80LzE1LlxuICovXG5cbmltcG9ydCBmcmFnbWVudCBmcm9tICcuLi9lbmdpbmUvZGVjb3JhdG9ycy9mcmFnbWVudC5qcydcbmltcG9ydCBjcmVhdGUgZnJvbSAnLi4vZW5naW5lL2RlY29yYXRvcnMvY3JlYXRlLmpzJ1xuaW1wb3J0IFNjaGVkdWxlciBmcm9tICcuLi9lbmdpbmUvc2NoZWR1bGVyLmpzJ1xuaW1wb3J0IEltYWdlTGF5ZXIgZnJvbSAnLi4vZW5naW5lL2xheWVycy9pbWFnZS1sYXllci5qcydcbmltcG9ydCB2aWV3cG9ydCBmcm9tICcuLi92aWV3cG9ydC5qcydcbmltcG9ydCBJbWFnZVJlc291cmNlIGZyb20gJy4uL2VuZ2luZS9yZXNvdXJjZXMvaW1hZ2UtcmVzb3VyY2UuanMnXG5cbkBmcmFnbWVudCgnY2FudmFzLWJhY2tncm91bmQnKVxuQGNyZWF0ZSgnYmFja2dyb3VuZEltYWdlJywgSW1hZ2VSZXNvdXJjZSlcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJhY2tncm91bmRMYXllciB7XG4gIGNvbnN0cnVjdG9yIChjYW52YXNCYWNrZ3JvdW5kLCBiYWNrZ3JvdW5kSW1hZ2UpIHtcbiAgICB2YXIgYmFja2dyb3VuZExheWVyID0gbmV3IEltYWdlTGF5ZXIoY2FudmFzQmFja2dyb3VuZCk7XG5cbiAgICBTY2hlZHVsZXIoZnVuY3Rpb24gKCkge1xuICAgICAgYmFja2dyb3VuZExheWVyLmRyYXcodmlld3BvcnQpO1xuICAgIH0pO1xuXG4gICAgYmFja2dyb3VuZEltYWdlLnJlYWR5KGZ1bmN0aW9uKGJhY2tncm91bmQpIHtcbiAgICAgIGJhY2tncm91bmRMYXllci5zZXRCYWNrZ3JvdW5kKGJhY2tncm91bmQpO1xuICAgIH0pO1xuICB9XG59IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IHNoYXVud2VzdCBvbiA1LzkvMTUuXG4gKi9cblxuaW1wb3J0IEJhY2tncm91bmRMYXllciBmcm9tICcuL2xheWVycy9iYWNrZ3JvdW5kLWxheWVyLmpzJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBTY2VuZSAoKSB7XG4gIG5ldyBCYWNrZ3JvdW5kTGF5ZXIoKTtcbn0iLCIvKipcbiAqIENyZWF0ZWQgYnkgc2hhdW53ZXN0IG9uIDUvOS8xNS5cbiAqL1xuXG5pbXBvcnQgU2NoZW1hTWFwcGVyIGZyb20gJy4uL2VuZ2luZS9zY2hlbWEvc2NoZW1hLW1hcHBlci5qcyc7XG5pbXBvcnQgSW1hZ2VSZXNvdXJjZSBmcm9tICcuLi9lbmdpbmUvcmVzb3VyY2VzL2ltYWdlLXJlc291cmNlLmpzJztcbmltcG9ydCB7aW5jbHVkZVJlc291cmNlLCByZWdpc3RlclZhbHVlLCBlY2hvfSBmcm9tICcuLi9lbmdpbmUvc2NoZW1hL2hlbHBlci5qcyc7XG5pbXBvcnQgSHR0cFJlc291cmNlIGZyb20gJy4uL2VuZ2luZS9yZXNvdXJjZXMvaHR0cC1yZXNvdXJjZS5qcyc7XG5pbXBvcnQgU3ByaXRlU2NoZW1hIGZyb20gJy4vc3ByaXRlLXNjaGVtYS5qcyc7XG5pbXBvcnQge2dldEluc3RhbmNlc30gZnJvbSAnLi4vZW5naW5lL2NvbnRhaW5lci5qcyc7XG5cbi8qZnVuY3Rpb24gZ2V0U3ByaXRlU2NoZW1hKHZhbCkge1xuICB2YXIgc3ByaXRlU2NoZW1hID0gU3ByaXRlU2NoZW1hKCk7XG5cbiAgSHR0cFJlc291cmNlKHZhbClcbiAgICAucmVhZHkoZnVuY3Rpb24oc3ByaXRlRGF0YSkge1xuICAgICAgdmFyIHNwcml0ZSA9IHNwcml0ZVNjaGVtYS5tYXAoc3ByaXRlRGF0YSk7XG4gICAgICBjb25zb2xlLmxvZyhnZXRJbnN0YW5jZXMoKSk7XG4gICAgfSk7XG59Ki9cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gU2NlbmVTY2hlbWEoKSB7XG4gIHJldHVybiBuZXcgU2NoZW1hTWFwcGVyKHtcbiAgICBsYXllckRlZmluaXRpb25zOiB7XG4gICAgICBiYWNrZ3JvdW5kOiB7XG4gICAgICAgIGJhY2tncm91bmRVcmw6IGluY2x1ZGVSZXNvdXJjZSgnYmFja2dyb3VuZEltYWdlJylcbiAgICAgIH0sXG4gICAgICAvKmVudGl0aWVzOiB7XG4gICAgICAgIHNwcml0ZXM6IHJlZ2lzdGVyVmFsdWUoJ3Nwcml0ZXMnKVxuICAgICAgfSovXG4gICAgICBlbnRpdGllczoge1xuICAgICAgICBzcHJpdGVzOiByZWdpc3RlclZhbHVlKCdzcHJpdGVzJylcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufSIsIi8qKlxuICogQ3JlYXRlZCBieSBzaGF1bndlc3Qgb24gNS85LzE1LlxuICovXG5cbmltcG9ydCBTY2hlbWFNYXBwZXIgZnJvbSAnLi4vZW5naW5lL3NjaGVtYS9zY2hlbWEtbWFwcGVyLmpzJztcbmltcG9ydCBJbWFnZVJlc291cmNlIGZyb20gJy4uL2VuZ2luZS9yZXNvdXJjZXMvaW1hZ2UtcmVzb3VyY2UuanMnO1xuaW1wb3J0IHthdHRhY2hSZXNvdXJjZSwgcmVnaXN0ZXJWYWx1ZX0gZnJvbSAnLi4vZW5naW5lL3NjaGVtYS9oZWxwZXIuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBTcHJpdGVTY2hlbWEoKSB7XG4gIHJldHVybiBuZXcgU2NoZW1hTWFwcGVyKHJlZ2lzdGVyVmFsdWUoJ3Nwcml0ZVR5cGVzJywge1xuICAgICcqJzoge1xuICAgICAgc3ByaXRlU2hlZXRVcmw6IGF0dGFjaFJlc291cmNlKCdzcHJpdGVTaGVldCcsIEltYWdlUmVzb3VyY2UpXG4gICAgfVxuICB9KSk7XG59XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgc2hhdW53ZXN0IG9uIDUvNC8xNS5cbiAqL1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIHg6IDAsXG4gIHk6IDAsXG4gIHdpZHRoOiA2MDAsXG4gIGhlaWdodDogNDAwXG59OyJdfQ==

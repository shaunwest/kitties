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

var _register = require('./engine/container.js');

var _HttpResource = require('./engine/resources/http-resource.js');

var _HttpResource2 = _interopRequireWildcard(_HttpResource);

//import Loader from './loader.js';

var _SceneSchema = require('./schema/scene-schema.js');

var _SceneSchema2 = _interopRequireWildcard(_SceneSchema);

var _Scene = require('./scene.js');

var _Scene2 = _interopRequireWildcard(_Scene);

var refresh;

_cacheDataElements.cacheDataElements();

/*window.refresh = function() {
  return ResourceRegistry.getResources('assets/kitty.json');
};*/

//var loader = new Loader();
//loader.getScene('kitty-world.json','assets');

_Resource2['default'].baseUri = 'assets';
window.Resource = _Resource2['default'];

var sceneSchema = _SceneSchema2['default']();

_HttpResource2['default']('kitty-world.json').ready(function (sceneData) {
  var scene = sceneSchema.map(sceneData);
  console.log(scene);
  _Scene2['default'](scene);
});

},{"./engine/container.js":3,"./engine/fragments.js":5,"./engine/resources/http-resource.js":9,"./engine/resources/resource.js":14,"./scene.js":24,"./schema/scene-schema.js":25}],2:[function(require,module,exports){
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

},{"./util.js":17}],3:[function(require,module,exports){
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
}

function registerSingleton(token, func) {
  var instance;

  if (typeof token == 'string') {
    instance = new func();
  }

  if (typeof token == 'function') {
    instance = new token();
  }

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
    return;
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

},{"../container.js":3,"../injector.js":6}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

var BackgroundLayer = (function () {
  function BackgroundLayer(canvas) {
    _classCallCheck(this, BackgroundLayer);

    this.canvas = canvas;
    this.context2d = canvas.getContext('2d');
  }

  _createClass(BackgroundLayer, [{
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

  return BackgroundLayer;
})();

exports['default'] = BackgroundLayer;
module.exports = exports['default'];

},{}],9:[function(require,module,exports){
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

},{"../kjax.js":7,"../util.js":17,"./resource.js":14}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

},{"./image-loader.js":10,"./resource.js":14}],12:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});
/**
 * Created by Shaun on 3/9/2015.
 */

var _Util = require('../util.js');

var _Util2 = _interopRequireWildcard(_Util);

exports['default'] = function (sources) {
  var successCallbacks = [],
      errorCallbacks = [],
      multiResource = {
    ready: ready,
    each: each
  };

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

    return multiResource;
  }

  function each(callback) {
    setTimeout(function () {
      // needs to happen AFTER ready() calls
      sources.forEach(function (source) {
        var resource = callback(source);
        resource.ready(successCallbacks, errorCallbacks);
      });
    }, 1);

    return multiResource;
  }

  return multiResource;
};

module.exports = exports['default'];

},{"../util.js":17}],13:[function(require,module,exports){
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

},{"../common.js":2,"../util.js":17,"./resource-registry.js":13}],15:[function(require,module,exports){
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

},{"./common.js":2,"./util.js":17}],16:[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, '__esModule', {
  value: true
});
/**
 * Created by shaunwest on 5/9/15.
 */

var SchemaMapper = (function () {
  function SchemaMapper(schema) {
    _classCallCheck(this, SchemaMapper);

    if (typeof schema !== 'object') {
      throw 'SchemaMapper: schema must be an object';
    }

    this.schema = schema;
  }

  _createClass(SchemaMapper, [{
    key: 'map',
    value: function map(data) {
      return mapValue(data, this.schema);
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
  var mappingFunc;

  if (!schema) {
    return val;
  }

  mappingFunc = typeMap[typeof val];
  if (mappingFunc) {
    return mappingFunc(val, schema);
  }

  if (typeof schema === 'function') {
    schema(val, container);
  }
  return val;
}

function iterateKeys(obj, schema) {
  return Object.keys(obj).reduce(function (newObj, key) {
    newObj[key] = mapValue(obj[key], schema[key], newObj);
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

},{}],17:[function(require,module,exports){
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

},{}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
/**
 * Created by Shaun on 3/1/15
 *
 */

var _getCanvas$getTransparentImage = require('../common.js');

var DEFAULT_RATE = 5;

function buildFrameSequence(frameSetDefinition, frameSize, spriteSheet) {
  var frameWidth = frameSize.width;
  var frameHeight = frameSize.height;

  return {
    rate: frameSetDefinition.rate || DEFAULT_RATE,
    frames: frameSetDefinition.frames.map(function (frameDefinition) {
      var frame = _getCanvas$getTransparentImage.getCanvas(frameWidth, frameHeight);

      frame.getContext('2d').drawImage(spriteSheet, frameDefinition.x, frameDefinition.y, frameWidth, frameHeight, 0, 0, frameWidth, frameHeight);

      return frame;
    })
  };
}

exports['default'] = function (spriteDefinition, spriteSheet) {
  return Object.keys(spriteDefinition.frameSet).reduce(function (frameSet, frameSetId) {
    var frameSequence = buildFrameSequence(spriteDefinition.frameSet[frameSetId], spriteDefinition.frameSize, spriteSheet);

    frameSequence.frames = frameSequence.frames.map(function (frame) {
      return _getCanvas$getTransparentImage.getTransparentImage(spriteDefinition.transparentColor, frame);
    });

    frameSet[frameSetId] = frameSequence;

    return frameSet;
  }, {});
};

;
module.exports = exports['default'];

},{"../common.js":2}],19:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});
/**
 * Created by Shaun on 4/25/2015.
 */

var _HttpResource = require('../resources/http-resource.js');

var _HttpResource2 = _interopRequireWildcard(_HttpResource);

var _ImageResource = require('../resources/image-resource.js');

var _ImageResource2 = _interopRequireWildcard(_ImageResource);

var _Sprites = require('./sprites.js');

var _Sprites2 = _interopRequireWildcard(_Sprites);

var _Resource = require('../resources/resource.js');

var _Resource2 = _interopRequireWildcard(_Resource);

exports['default'] = function (sceneUri) {
  //Resource.baseUri = baseUri;
  return _HttpResource2['default'](sceneUri).ready(function (sceneData) {
    var layerDefinitions = sceneData.layerDefinitions;

    return {
      sceneData: sceneData,
      background: _ImageResource2['default'](layerDefinitions.background.backgroundUrl),
      sprite: _Sprites2['default'](layerDefinitions.entities.sprites)
    };
  });
};

module.exports = exports['default'];

},{"../resources/http-resource.js":9,"../resources/image-resource.js":11,"../resources/resource.js":14,"./sprites.js":22}],20:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _Scheduler = require('../scheduler.js');

var _Scheduler2 = _interopRequireWildcard(_Scheduler);

exports['default'] = function (frameSet) {
  var currentFrameSequence = null,
      currentFrameIndex = 0,
      currentFrame = null,
      frameCallback = null;

  var schedulerId = _Scheduler2['default'](function (deltaTime, setRate) {
    if (!currentFrameSequence) {
      return;
    }

    if (!currentFrame) {
      setRate(currentFrameSequence.rate);
    }

    currentFrame = currentFrameSequence.frames[currentFrameIndex];
    if (frameCallback) {
      frameCallback(currentFrame);
    }

    if (++currentFrameIndex >= currentFrameSequence.frames.length) {
      currentFrameIndex = 0;
    }
  }).id();

  return {
    play: function play(frameSetId) {
      currentFrameSequence = frameSet[frameSetId];
      currentFrameIndex = 0;
      currentFrame = null;
      return this;
    },
    onFrame: function onFrame(cb) {
      frameCallback = cb;
      return this;
    },
    stop: function stop() {
      currentFrameSequence = null;
      return this;
    },
    kill: function kill() {
      scheduler.unschedule(schedulerId);
      return this;
    },
    currentFrameIndex: (function (_currentFrameIndex) {
      function currentFrameIndex() {
        return _currentFrameIndex.apply(this, arguments);
      }

      currentFrameIndex.toString = function () {
        return _currentFrameIndex.toString();
      };

      return currentFrameIndex;
    })(function () {
      return currentFrameIndex;
    }),
    getImage: function getImage() {
      return currentFrame;
    }
  };
};

module.exports = exports['default'];

},{"../scheduler.js":15}],21:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});
/**
 * Created by Shaun on 5/31/14.
 *
 */

var _ImageResource = require('../resources/image-resource.js');

var _ImageResource2 = _interopRequireWildcard(_ImageResource);

var _FrameSet = require('./frame-set.js');

var _FrameSet2 = _interopRequireWildcard(_FrameSet);

exports['default'] = function (spriteDefinition) {
  return _ImageResource2['default'](spriteDefinition.spriteSheetUrl).ready(function (spriteSheet) {
    return {
      spriteSheet: spriteSheet,
      definition: spriteDefinition,
      frameSet: _FrameSet2['default'](spriteDefinition, spriteSheet)
    };
  });
};

;
module.exports = exports['default'];

},{"../resources/image-resource.js":11,"./frame-set.js":18}],22:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});
/**
 * Created by Shaun on 3/7/15
 *
 */

var _mergeObject = require('../common.js');

var _HttpResource = require('../resources/http-resource.js');

var _HttpResource2 = _interopRequireWildcard(_HttpResource);

var _MultiResource = require('../resources/multi-resource.js');

var _MultiResource2 = _interopRequireWildcard(_MultiResource);

var _Sprite = require('./sprite.js');

var _Sprite2 = _interopRequireWildcard(_Sprite);

var _SpriteAnimation = require('./sprite-animation.js');

var _SpriteAnimation2 = _interopRequireWildcard(_SpriteAnimation);

exports['default'] = function (spritesData) {
  return _MultiResource2['default'](spritesData).each(function (spriteData) {
    return _HttpResource2['default'](spriteData.src)
    //return HttpResource()
    .ready(_Sprite2['default']).ready(function (sprite) {
      sprite = _mergeObject.mergeObject(spriteData, sprite);
      sprite.animation = _SpriteAnimation2['default'](sprite.frameSet);

      return sprite;
    });
  });
};

;
module.exports = exports['default'];

},{"../common.js":2,"../resources/http-resource.js":9,"../resources/multi-resource.js":12,"./sprite-animation.js":20,"./sprite.js":21}],23:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, '__esModule', {
  value: true
});
/**
 * Created by shaunwest on 5/4/15.
 */

var _Fragment = require('../engine/fragments.js');

var _create = require('../engine/decorators/create.js');

var _create2 = _interopRequireWildcard(_create);

var _Scene = require('../engine/world/scene.js');

var _Scene2 = _interopRequireWildcard(_Scene);

var _Scheduler = require('../engine/scheduler.js');

var _Scheduler2 = _interopRequireWildcard(_Scheduler);

var _BackgroundLayer = require('../engine/layers/background-layer.js');

var _BackgroundLayer2 = _interopRequireWildcard(_BackgroundLayer);

var _viewport = require('../viewport.js');

var _viewport2 = _interopRequireWildcard(_viewport);

var _ImageResource = require('../engine/resources/image-resource.js'

//@use('background1')
);

var _ImageResource2 = _interopRequireWildcard(_ImageResource);

var Background1 = (function () {
  function Background1(background1) {
    _classCallCheck(this, _Background1);

    var canvasBackground = _Fragment.Fragment('canvas-background');
    var backgroundLayer = new _BackgroundLayer2['default'](canvasBackground);

    _Scheduler2['default'](function () {
      backgroundLayer.draw(_viewport2['default']);
    });

    /*scene.ready(function (scene1) {
      scene1.background.ready(function (background) {
        backgroundLayer.setBackground(background);
      });
    });*/

    background1.ready(function (background) {
      backgroundLayer.setBackground(background);
    });

    this.backgroundLayer = backgroundLayer;
  }

  var _Background1 = Background1;

  _createClass(_Background1, [{
    key: 'layer',
    get: function () {
      return this.backgroundLayer;
    }
  }]);

  Background1 = _create2['default']('background1', _ImageResource2['default'])(Background1) || Background1;
  return Background1;
})();

exports['default'] = Background1;
module.exports = exports['default'];

},{"../engine/decorators/create.js":4,"../engine/fragments.js":5,"../engine/layers/background-layer.js":8,"../engine/resources/image-resource.js":11,"../engine/scheduler.js":15,"../engine/world/scene.js":19,"../viewport.js":26}],24:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = Scene;
/**
 * Created by shaunwest on 5/9/15.
 */

var _Background1 = require('./layers/background1.js');

var _Background12 = _interopRequireWildcard(_Background1);

function Scene(scene) {
  //new Background1(scene.layerDefinitions.background.background);
  new _Background12['default']();
}

module.exports = exports['default'];

},{"./layers/background1.js":23}],25:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = SceneSchema;
/**
 * Created by shaunwest on 5/9/15.
 */

var _SchemaMapper = require('../engine/schema-mapper.js');

var _SchemaMapper2 = _interopRequireWildcard(_SchemaMapper);

var _ImageResource = require('../engine/resources/image-resource.js');

var _ImageResource2 = _interopRequireWildcard(_ImageResource);

var _includeInstance = require('../engine/container.js');

function setProp(prop, func) {
  return function (val, container) {
    container[prop] = func(val, container);
  };
}

/*function registerResource(id, resource) {
  register(id, resource);
  return function(val) {
    return resource.fetch(val);
  }
}*/

function includeResource(id) {
  return function (val) {
    var resource = _includeInstance.includeInstance(id);
    resource.fetch(val);
  };
}

function SceneSchema() {
  return new _SchemaMapper2['default']({
    layerDefinitions: {
      background: {
        //backgroundUrl: setProp('background', ImageResource)
        // register this resource so it can be injected
        //backgroundUrl: registerResource('background1', ImageResource())
        backgroundUrl: includeResource('background1')
      }
      /*entities: {
        sprites: [
          {
            src: SpriteSchema
          }
        ]
      }*/
    }
  });
}

module.exports = exports['default'];

},{"../engine/container.js":3,"../engine/resources/image-resource.js":11,"../engine/schema-mapper.js":16}],26:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvbWFpbi5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy9lbmdpbmUvY29tbW9uLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9jb250YWluZXIuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL2RlY29yYXRvcnMvY3JlYXRlLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9mcmFnbWVudHMuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL2luamVjdG9yLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9ramF4LmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9sYXllcnMvYmFja2dyb3VuZC1sYXllci5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy9lbmdpbmUvcmVzb3VyY2VzL2h0dHAtcmVzb3VyY2UuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL3Jlc291cmNlcy9pbWFnZS1sb2FkZXIuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL3Jlc291cmNlcy9pbWFnZS1yZXNvdXJjZS5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy9lbmdpbmUvcmVzb3VyY2VzL211bHRpLXJlc291cmNlLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9yZXNvdXJjZXMvcmVzb3VyY2UtcmVnaXN0cnkuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL3Jlc291cmNlcy9yZXNvdXJjZS5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy9lbmdpbmUvc2NoZWR1bGVyLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9zY2hlbWEtbWFwcGVyLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS91dGlsLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS93b3JsZC9mcmFtZS1zZXQuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL3dvcmxkL3NjZW5lLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS93b3JsZC9zcHJpdGUtYW5pbWF0aW9uLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS93b3JsZC9zcHJpdGUuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL3dvcmxkL3Nwcml0ZXMuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvbGF5ZXJzL2JhY2tncm91bmQxLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL3NjZW5lLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL3NjaGVtYS9zY2VuZS1zY2hlbWEuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvdmlld3BvcnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7O2lDQ0tnQyx1QkFBdUI7O3dCQUNsQyxnQ0FBZ0M7Ozs7d0JBQzlCLHVCQUF1Qjs7NEJBQ3JCLHFDQUFxQzs7Ozs7OzJCQUV0QywwQkFBMEI7Ozs7cUJBQ2hDLFlBQVk7Ozs7QUFFOUIsSUFBSSxPQUFPLENBQUM7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QUU7QUFDaEIsZ0JBQVUsRUFBRTs7OztBQUlWLHFCQUFhLEVBQUUsZUFBZSxDQUFDLGFBQWEsQ0FBQztPQUM5Qzs7Ozs7Ozs7QUFBQSxLQVFGO0dBQ0YsQ0FBQyxDQUFDO0NBQ0o7Ozs7Ozs7Ozs7Ozs7O3FCQzFDYztBQUNiLEdBQUMsRUFBRSxDQUFDO0FBQ0osR0FBQyxFQUFFLENBQUM7QUFDSixPQUFLLEVBQUUsR0FBRztBQUNWLFFBQU0sRUFBRSxHQUFHO0NBQ1oiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgU2hhdW4gb24gNC8yMy8yMDE1LlxyXG4gKi9cclxuXHJcbi8vaW1wb3J0IFJlc291cmNlUmVnaXN0cnkgZnJvbSAnLi9lbmdpbmUvcmVzb3VyY2VzL3Jlc291cmNlLXJlZ2lzdHJ5LmpzJztcclxuaW1wb3J0IHtjYWNoZURhdGFFbGVtZW50c30gZnJvbSAnLi9lbmdpbmUvZnJhZ21lbnRzLmpzJztcclxuaW1wb3J0IFJlc291cmNlIGZyb20gJy4vZW5naW5lL3Jlc291cmNlcy9yZXNvdXJjZS5qcyc7XHJcbmltcG9ydCB7cmVnaXN0ZXJ9IGZyb20gJy4vZW5naW5lL2NvbnRhaW5lci5qcyc7XHJcbmltcG9ydCBIdHRwUmVzb3VyY2UgZnJvbSAnLi9lbmdpbmUvcmVzb3VyY2VzL2h0dHAtcmVzb3VyY2UuanMnO1xyXG4vL2ltcG9ydCBMb2FkZXIgZnJvbSAnLi9sb2FkZXIuanMnO1xyXG5pbXBvcnQgU2NlbmVTY2hlbWEgZnJvbSAnLi9zY2hlbWEvc2NlbmUtc2NoZW1hLmpzJztcclxuaW1wb3J0IFNjZW5lIGZyb20gJy4vc2NlbmUuanMnO1xyXG5cclxudmFyIHJlZnJlc2g7XHJcblxyXG5jYWNoZURhdGFFbGVtZW50cygpO1xyXG5cclxuLyp3aW5kb3cucmVmcmVzaCA9IGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiBSZXNvdXJjZVJlZ2lzdHJ5LmdldFJlc291cmNlcygnYXNzZXRzL2tpdHR5Lmpzb24nKTtcclxufTsqL1xyXG5cclxuLy92YXIgbG9hZGVyID0gbmV3IExvYWRlcigpO1xyXG4vL2xvYWRlci5nZXRTY2VuZSgna2l0dHktd29ybGQuanNvbicsJ2Fzc2V0cycpO1xyXG5cclxuUmVzb3VyY2UuYmFzZVVyaSA9ICdhc3NldHMnO1xyXG53aW5kb3cuUmVzb3VyY2UgPSBSZXNvdXJjZTtcclxuXHJcbnZhciBzY2VuZVNjaGVtYSA9IFNjZW5lU2NoZW1hKCk7XHJcblxyXG5IdHRwUmVzb3VyY2UoJ2tpdHR5LXdvcmxkLmpzb24nKVxyXG4gIC5yZWFkeShmdW5jdGlvbihzY2VuZURhdGEpIHtcclxuICAgIHZhciBzY2VuZSA9IHNjZW5lU2NoZW1hLm1hcChzY2VuZURhdGEpO1xyXG4gICAgY29uc29sZS5sb2coc2NlbmUpO1xyXG4gICAgU2NlbmUoc2NlbmUpO1xyXG4gIH0pO1xyXG4iLCJcclxuaW1wb3J0IFV0aWwgZnJvbSAnLi91dGlsLmpzJztcclxuXHJcbi8vIFJldHVybiBldmVyeXRoaW5nIGJlZm9yZSB0aGUgbGFzdCBzbGFzaCBvZiBhIHVybFxyXG4vLyBlLmcuIGh0dHA6Ly9mb28vYmFyL2Jhei5qc29uID0+IGh0dHA6Ly9mb28vYmFyXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRCYXNlVXJsKHVybCkge1xyXG4gIHZhciBuID0gdXJsLmxhc3RJbmRleE9mKCcvJyk7XHJcbiAgcmV0dXJuIHVybC5zdWJzdHJpbmcoMCwgbik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpc0Z1bGxVcmwodXJsKSB7XHJcbiAgcmV0dXJuICh1cmwuc3Vic3RyaW5nKDAsIDcpID09PSAnaHR0cDovLycgfHxcclxuICAgIHVybC5zdWJzdHJpbmcoMCwgOCkgPT09ICdodHRwczovLycpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplVXJsKHVybCwgYmFzZVVybCkge1xyXG4gIGlmKGJhc2VVcmwgJiYgIWlzRnVsbFVybCh1cmwpKSB7XHJcbiAgICByZXR1cm4gYmFzZVVybCArICcvJyArIHVybDtcclxuICB9XHJcbiAgcmV0dXJuIHVybDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlT2JqZWN0KHNvdXJjZSwgZGVzdGluYXRpb24sIGFsbG93V3JhcCwgZXhjZXB0aW9uT25Db2xsaXNpb25zKSB7XHJcbiAgc291cmNlID0gc291cmNlIHx8IHt9OyAvL1Bvb2wuZ2V0T2JqZWN0KCk7XHJcbiAgZGVzdGluYXRpb24gPSBkZXN0aW5hdGlvbiB8fCB7fTsgLy9Qb29sLmdldE9iamVjdCgpO1xyXG5cclxuICBPYmplY3Qua2V5cyhzb3VyY2UpLmZvckVhY2goZnVuY3Rpb24ocHJvcCkge1xyXG4gICAgYXNzaWduUHJvcGVydHkoc291cmNlLCBkZXN0aW5hdGlvbiwgcHJvcCwgYWxsb3dXcmFwLCBleGNlcHRpb25PbkNvbGxpc2lvbnMpO1xyXG4gIH0pO1xyXG5cclxuICByZXR1cm4gZGVzdGluYXRpb247XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBhc3NpZ25Qcm9wZXJ0eShzb3VyY2UsIGRlc3RpbmF0aW9uLCBwcm9wLCBhbGxvd1dyYXAsIGV4Y2VwdGlvbk9uQ29sbGlzaW9ucykge1xyXG4gIGlmKGRlc3RpbmF0aW9uLmhhc093blByb3BlcnR5KHByb3ApKSB7XHJcbiAgICBpZihhbGxvd1dyYXApIHtcclxuICAgICAgZGVzdGluYXRpb25bcHJvcF0gPSBGdW5jLndyYXAoZGVzdGluYXRpb25bcHJvcF0sIHNvdXJjZVtwcm9wXSk7XHJcbiAgICAgIFV0aWwubG9nKCdNZXJnZTogd3JhcHBlZCBcXCcnICsgcHJvcCArICdcXCcnKTtcclxuICAgIH0gZWxzZSBpZihleGNlcHRpb25PbkNvbGxpc2lvbnMpIHtcclxuICAgICAgVXRpbC5lcnJvcignRmFpbGVkIHRvIG1lcmdlIG1peGluLiBNZXRob2QgXFwnJyArXHJcbiAgICAgIHByb3AgKyAnXFwnIGNhdXNlZCBhIG5hbWUgY29sbGlzaW9uLicpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZGVzdGluYXRpb25bcHJvcF0gPSBzb3VyY2VbcHJvcF07XHJcbiAgICAgIFV0aWwubG9nKCdNZXJnZTogb3Zlcndyb3RlIFxcJycgKyBwcm9wICsgJ1xcJycpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGRlc3RpbmF0aW9uO1xyXG4gIH1cclxuXHJcbiAgZGVzdGluYXRpb25bcHJvcF0gPSBzb3VyY2VbcHJvcF07XHJcblxyXG4gIHJldHVybiBkZXN0aW5hdGlvbjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldENhbnZhcyh3aWR0aCwgaGVpZ2h0KSB7XHJcbiAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG5cclxuICBjYW52YXMud2lkdGggPSB3aWR0aCB8fCA1MDA7XHJcbiAgY2FudmFzLmhlaWdodCA9IGhlaWdodCB8fCA1MDA7XHJcblxyXG4gIHJldHVybiBjYW52YXM7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpbnRlcnNlY3RzKHJlY3RBLCByZWN0Qikge1xyXG4gIHJldHVybiAhKFxyXG4gICAgcmVjdEEueCArIHJlY3RBLndpZHRoIDwgcmVjdEIueCB8fFxyXG4gICAgcmVjdEEueSArIHJlY3RBLmhlaWdodCA8IHJlY3RCLnkgfHxcclxuICAgIHJlY3RBLnggPiByZWN0Qi54ICsgcmVjdEIud2lkdGggfHxcclxuICAgIHJlY3RBLnkgPiByZWN0Qi55ICsgcmVjdEIuaGVpZ2h0XHJcbiAgKTtcclxufVxyXG5cclxuLy8gTWFrZSB0aGUgZ2l2ZW4gUkdCIHZhbHVlIHRyYW5zcGFyZW50IGluIHRoZSBnaXZlbiBpbWFnZS5cclxuLy8gUmV0dXJucyBhIG5ldyBpbWFnZS5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFRyYW5zcGFyZW50SW1hZ2UodHJhbnNSR0IsIGltYWdlKSB7XHJcbiAgdmFyIHIsIGcsIGIsIG5ld0ltYWdlLCBkYXRhTGVuZ3RoO1xyXG4gIHZhciB3aWR0aCA9IGltYWdlLndpZHRoO1xyXG4gIHZhciBoZWlnaHQgPSBpbWFnZS5oZWlnaHQ7XHJcbiAgdmFyIGltYWdlRGF0YSA9IGltYWdlXHJcbiAgICAuZ2V0Q29udGV4dCgnMmQnKVxyXG4gICAgLmdldEltYWdlRGF0YSgwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcclxuXHJcbiAgaWYodHJhbnNSR0IpIHtcclxuICAgIGRhdGFMZW5ndGggPSB3aWR0aCAqIGhlaWdodCAqIDQ7XHJcblxyXG4gICAgZm9yKHZhciBpbmRleCA9IDA7IGluZGV4IDwgZGF0YUxlbmd0aDsgaW5kZXgrPTQpIHtcclxuICAgICAgciA9IGltYWdlRGF0YS5kYXRhW2luZGV4XTtcclxuICAgICAgZyA9IGltYWdlRGF0YS5kYXRhW2luZGV4ICsgMV07XHJcbiAgICAgIGIgPSBpbWFnZURhdGEuZGF0YVtpbmRleCArIDJdO1xyXG4gICAgICBpZihyID09PSB0cmFuc1JHQlswXSAmJiBnID09PSB0cmFuc1JHQlsxXSAmJiBiID09PSB0cmFuc1JHQlsyXSkge1xyXG4gICAgICAgIGltYWdlRGF0YS5kYXRhW2luZGV4ICsgM10gPSAwO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBuZXdJbWFnZSA9IGdldENhbnZhcyh3aWR0aCwgaGVpZ2h0KTtcclxuICBuZXdJbWFnZVxyXG4gICAgLmdldENvbnRleHQoJzJkJylcclxuICAgIC5wdXRJbWFnZURhdGEoaW1hZ2VEYXRhLCAwLCAwKTtcclxuXHJcbiAgcmV0dXJuIG5ld0ltYWdlO1xyXG59XHJcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBzaGF1bndlc3Qgb24gNC8zMC8xNS5cbiAqL1xuXG52YXIgaW5zdGFuY2VzID0ge307XG52YXIgc2luZ2xldG9ucyA9IFtdO1xuXG5mdW5jdGlvbiBmaW5kU2luZ2xldG9uICh0b2tlbikge1xuICB2YXIgcmVzdWx0cyA9IHNpbmdsZXRvbnMuZmlsdGVyKGZ1bmN0aW9uKHNpbmdsZXRvbikge1xuICAgIHJldHVybiAodG9rZW4gPT09IHNpbmdsZXRvbi50b2tlbik7XG4gIH0pO1xuXG4gIHJldHVybiAocmVzdWx0cy5sZW5ndGgpID8gcmVzdWx0c1swXS5pbnN0YW5jZSA6IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VGYWN0b3J5IChpZCwgZmFjdG9yeSkge1xuICByZXR1cm4gaW5jbHVkZUluc3RhbmNlKGlkKSB8fCByZWdpc3RlckZhY3RvcnkoaWQsIGZhY3RvcnkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlU2luZ2xldG9uICh0b2tlbiwgZnVuYykge1xuICByZXR1cm4gaW5jbHVkZVNpbmdsZXRvbih0b2tlbikgfHwgcmVnaXN0ZXJTaW5nbGV0b24odG9rZW4sIGZ1bmMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlSW5zdGFuY2UoaWQsIGluc3RhbmNlKSB7XG4gIHJldHVybiBpbmNsdWRlSW5zdGFuY2UoaWQpIHx8IHJlZ2lzdGVySW5zdGFuY2UoaWQsIGluc3RhbmNlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyRmFjdG9yeSAoaWQsIGZhY3RvcnkpIHtcbiAgaWYodHlwZW9mIGZhY3RvcnkgPT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiByZWdpc3Rlckluc3RhbmNlKGlkLCBmYWN0b3J5KCkpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlclNpbmdsZXRvbiAodG9rZW4sIGZ1bmMpIHtcbiAgdmFyIGluc3RhbmNlO1xuXG4gIGlmKHR5cGVvZiB0b2tlbiA9PSAnc3RyaW5nJykge1xuICAgIGluc3RhbmNlID0gbmV3IGZ1bmMoKTtcbiAgfVxuXG4gIGlmKHR5cGVvZiB0b2tlbiA9PSAnZnVuY3Rpb24nKSB7XG4gICAgaW5zdGFuY2UgPSBuZXcgdG9rZW4oKTtcbiAgfVxuXG4gIGlmIChpbnN0YW5jZSkge1xuICAgIHNpbmdsZXRvbnMucHVzaCh7XG4gICAgICB0b2tlbjogdG9rZW4sXG4gICAgICBpbnN0YW5jZTogaW5zdGFuY2VcbiAgICB9KTtcbiAgICByZXR1cm4gaW5zdGFuY2U7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVySW5zdGFuY2UgKGlkLCBpbnN0YW5jZSkge1xuICBpZih0eXBlb2YgaWQgIT0gJ3N0cmluZycgfHwgdHlwZW9mIGluc3RhbmNlID09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGluc3RhbmNlc1tpZF0gPSBpbnN0YW5jZTtcbiAgcmV0dXJuIGluc3RhbmNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5jbHVkZVNpbmdsZXRvbiAodG9rZW4pIHtcbiAgcmV0dXJuIGZpbmRTaW5nbGV0b24odG9rZW4pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5jbHVkZUluc3RhbmNlIChpZCkge1xuICByZXR1cm4gaW5zdGFuY2VzW2lkXTtcbn0iLCIvKipcbiAqIENyZWF0ZWQgYnkgc2hhdW53ZXN0IG9uIDUvMTAvMTUuXG4gKi9cblxuaW1wb3J0IGluamVjdCBmcm9tICcuLi9pbmplY3Rvci5qcyc7XG5pbXBvcnQge3VzZUZhY3Rvcnl9IGZyb20gJy4uL2NvbnRhaW5lci5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNyZWF0ZSAoaWQsIGZhY3RvcnkpIHtcbiAgdmFyIHJlc3VsdCA9IHVzZUZhY3RvcnkoaWQsIGZhY3RvcnkpO1xuXG4gIGlmKHJlc3VsdCkge1xuICAgIHJldHVybiBpbmplY3QoW3Jlc3VsdF0pO1xuICB9XG59IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgU2hhdW4gb24gNC8yMy8yMDE1LlxyXG4gKi9cclxuXHJcbnZhciBhbGxEYXRhRWxlbWVudHM7XHJcblxyXG5mdW5jdGlvbiBoYXNEYXRhQXR0cmlidXRlKGVsZW1lbnQpIHtcclxuICB2YXIgYXR0cmlidXRlcyA9IGVsZW1lbnQuYXR0cmlidXRlcztcclxuICBmb3IodmFyIGkgPSAwLCBudW1BdHRyaWJ1dGVzID0gYXR0cmlidXRlcy5sZW5ndGg7IGkgPCBudW1BdHRyaWJ1dGVzOyBpKyspIHtcclxuICAgIGlmKGF0dHJpYnV0ZXNbaV0ubmFtZS5zdWJzdHIoMCwgNCkgPT09ICdkYXRhJykge1xyXG4gICAgICByZXR1cm4gZWxlbWVudDtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBmaW5kRGF0YUVsZW1lbnRzIChwYXJlbnRFbGVtZW50KSB7XHJcbiAgdmFyIGFsbEVsZW1lbnRzLCBlbGVtZW50LCBkYXRhRWxlbWVudHMgPSBbXTtcclxuXHJcbiAgaWYoIXBhcmVudEVsZW1lbnQpIHtcclxuICAgIHZhciBodG1sID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2h0bWwnKTtcclxuICAgIGlmKCFodG1sWzBdKSB7XHJcbiAgICAgIHJldHVybiBkYXRhRWxlbWVudHM7XHJcbiAgICB9XHJcbiAgICBwYXJlbnRFbGVtZW50ID0gaHRtbFswXTtcclxuICB9XHJcblxyXG4gIGFsbEVsZW1lbnRzID0gcGFyZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCcqJyk7XHJcbiAgZm9yKHZhciBpID0gMCwgbnVtRWxlbWVudHMgPSBhbGxFbGVtZW50cy5sZW5ndGg7IGkgPCBudW1FbGVtZW50czsgaSsrKSB7XHJcbiAgICBlbGVtZW50ID0gYWxsRWxlbWVudHNbaV07XHJcbiAgICBpZihoYXNEYXRhQXR0cmlidXRlKGVsZW1lbnQpKSB7XHJcbiAgICAgIGRhdGFFbGVtZW50cy5wdXNoKGVsZW1lbnQpO1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gZGF0YUVsZW1lbnRzO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gRnJhZ21lbnRzIChuYW1lKSB7XHJcbiAgaWYoIWFsbERhdGFFbGVtZW50cykge1xyXG4gICAgY2FjaGVEYXRhRWxlbWVudHMoKTtcclxuICB9XHJcbiAgcmV0dXJuIGFsbERhdGFFbGVtZW50cy5yZWR1Y2UoZnVuY3Rpb24ocmVzdWx0LCBlbGVtZW50KSB7XHJcbiAgICBpZihlbGVtZW50Lmhhc0F0dHJpYnV0ZSgnZGF0YS0nICsgbmFtZSkpIHtcclxuICAgICAgcmVzdWx0LnB1c2goZWxlbWVudCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH0sIFtdKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIEZyYWdtZW50IChuYW1lKSB7XHJcbiAgcmV0dXJuIEZyYWdtZW50cyhuYW1lKVswXTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNhY2hlRGF0YUVsZW1lbnRzKCkge1xyXG4gIGFsbERhdGFFbGVtZW50cyA9IGZpbmREYXRhRWxlbWVudHMoKTtcclxufVxyXG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgc2hhdW53ZXN0IG9uIDQvMjgvMTUuXG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKGluamVjdGVkKSB7XG4gIHJldHVybiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICBpbmplY3RlZCA9ICh0YXJnZXQuX2luamVjdGVkKSA/XG4gICAgICBpbmplY3RlZC5jb25jYXQodGFyZ2V0Ll9pbmplY3RlZCkgOlxuICAgICAgaW5qZWN0ZWQ7XG5cbiAgICBpZih0YXJnZXQuX3RhcmdldCkge1xuICAgICAgdGFyZ2V0ID0gdGFyZ2V0Ll90YXJnZXQ7XG4gICAgfVxuXG4gICAgdmFyIG5ld1RhcmdldCA9IHRhcmdldC5iaW5kLmFwcGx5KHRhcmdldCwgW251bGxdLmNvbmNhdChpbmplY3RlZCkpO1xuICAgIG5ld1RhcmdldC5fdGFyZ2V0ID0gdGFyZ2V0O1xuICAgIG5ld1RhcmdldC5faW5qZWN0ZWQgPSBpbmplY3RlZDtcbiAgICByZXR1cm4gbmV3VGFyZ2V0O1xuICB9O1xufVxuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IFNoYXVuIG9uIDUvMy8xNC5cbiAqL1xudmFyIHByb21pc2VzID0gW10sXG4gIGJhc2VVcmwgPSAnJztcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihvYmopIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG59XG5cbmZ1bmN0aW9uIHBhcnNlUmVzcG9uc2UgKGNvbnRlbnRUeXBlLCByZXNwb25zZVRleHQpIHtcbiAgaWYoY29udGVudFR5cGUuc3Vic3RyKDAsIDE2KSA9PSAnYXBwbGljYXRpb24vanNvbicpIHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShyZXNwb25zZVRleHQpO1xuICB9XG4gIHJldHVybiByZXNwb25zZVRleHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXF1ZXN0R2V0KHVybCwgY29udGVudFR5cGVPck9uUHJvZ3Jlc3MsIG9uUHJvZ3Jlc3MpIHtcbiAgdmFyIHByb21pc2U7XG5cbiAgaWYodXJsLnN1YnN0cigwLCA3KSAhPT0gJ2h0dHA6Ly8nICYmIHVybC5zdWJzdHIoMCwgOCkgIT09ICdodHRwczovLycpIHtcbiAgICB1cmwgPSBiYXNlVXJsICsgdXJsO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0SGFuZGxlcihyZXNvbHZlLCByZWplY3QpIHtcbiAgICB2YXIgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICBpZiAoaXNGdW5jdGlvbihjb250ZW50VHlwZU9yT25Qcm9ncmVzcykpIHtcbiAgICAgIG9uUHJvZ3Jlc3MgPSBjb250ZW50VHlwZU9yT25Qcm9ncmVzcztcbiAgICAgIGNvbnRlbnRUeXBlT3JPblByb2dyZXNzID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGlmIChvblByb2dyZXNzKSB7XG4gICAgICByZXEuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgb25Qcm9ncmVzcyhldmVudC5sb2FkZWQsIGV2ZW50LnRvdGFsKTtcbiAgICAgIH0sIGZhbHNlKTtcbiAgICB9XG5cbiAgICByZXEub25lcnJvciA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgcmVqZWN0KCdOZXR3b3JrIGVycm9yLicpO1xuICAgIH07XG5cbiAgICByZXEub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGNvbnRlbnRUeXBlID0gY29udGVudFR5cGVPck9uUHJvZ3Jlc3MgfHwgdGhpcy5nZXRSZXNwb25zZUhlYWRlcignY29udGVudC10eXBlJykgfHwgJyc7XG4gICAgICAodGhpcy5zdGF0dXMgPj0gMzAwKSA/XG4gICAgICAgIHJlamVjdCh7c3RhdHVzVGV4dDogdGhpcy5zdGF0dXNUZXh0LCBzdGF0dXM6IHRoaXMuc3RhdHVzfSkgOlxuICAgICAgICByZXNvbHZlKHtkYXRhOiBwYXJzZVJlc3BvbnNlKGNvbnRlbnRUeXBlLCB0aGlzLnJlc3BvbnNlVGV4dCksIHN0YXR1czogdGhpcy5zdGF0dXN9KTtcbiAgICB9O1xuXG4gICAgcmVxLm9wZW4oJ2dldCcsIHVybCwgdHJ1ZSk7XG4gICAgcmVxLnNlbmQoKTtcbiAgfVxuXG4gIHByb21pc2UgPSBuZXcgUHJvbWlzZShnZXRIYW5kbGVyKTtcbiAgcHJvbWlzZXMucHVzaChwcm9taXNlKTtcblxuICByZXR1cm4gcHJvbWlzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHB1cmdlKCkge1xuICBwcm9taXNlcy5sZW5ndGggPSAwO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UHJvbWlzZXMoKSB7XG4gIHJldHVybiBwcm9taXNlcztcbn1cblxuZnVuY3Rpb24gc2V0QmFzZVVybCh1cmwpIHtcbiAgYmFzZVVybCA9IHVybDtcbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuICByZXF1ZXN0R2V0OiByZXF1ZXN0R2V0LFxuICBwdXJnZTogcHVyZ2UsXG4gIHNldEJhc2VVcmw6IHNldEJhc2VVcmwsXG4gIGdldFByb21pc2VzOiBnZXRQcm9taXNlc1xufTtcbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IFNoYXVuIG9uIDIvNS8xNVxyXG4gKiBcclxuICovXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCYWNrZ3JvdW5kTGF5ZXIge1xyXG4gIGNvbnN0cnVjdG9yIChjYW52YXMpIHtcclxuICAgIHRoaXMuY2FudmFzID0gY2FudmFzO1xyXG4gICAgdGhpcy5jb250ZXh0MmQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICB9XHJcblxyXG4gIHNldEJhY2tncm91bmQgKGltYWdlKSB7XHJcbiAgICB0aGlzLmJhY2tncm91bmQgPSBpbWFnZTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgZHJhdyAodmlld3BvcnQpIHtcclxuICAgIGlmKCF2aWV3cG9ydCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5jb250ZXh0MmQuY2xlYXJSZWN0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xyXG5cclxuICAgIGlmKHRoaXMuYmFja2dyb3VuZCkge1xyXG4gICAgICB0aGlzLmNvbnRleHQyZC5kcmF3SW1hZ2UoXHJcbiAgICAgICAgdGhpcy5iYWNrZ3JvdW5kLFxyXG4gICAgICAgIHZpZXdwb3J0LngsIHZpZXdwb3J0LnksXHJcbiAgICAgICAgdmlld3BvcnQud2lkdGgsIHZpZXdwb3J0LmhlaWdodCxcclxuICAgICAgICAwLCAwLFxyXG4gICAgICAgIHZpZXdwb3J0LndpZHRoLCB2aWV3cG9ydC5oZWlnaHRcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIGdldExheWVyICgpIHtcclxuICAgIHJldHVybiB0aGlzLmNhbnZhcztcclxuICB9XHJcbn1cclxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgU2hhdW4gb24gMy8xLzE1XHJcbiAqXHJcbiAqL1xyXG5cclxuaW1wb3J0IFV0aWwgZnJvbSAnLi4vdXRpbC5qcyc7XHJcbmltcG9ydCB7cmVxdWVzdEdldH0gZnJvbSAnLi4va2pheC5qcyc7XHJcbmltcG9ydCBSZXNvdXJjZSBmcm9tICcuL3Jlc291cmNlLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHVyaSkge1xyXG4gIHJldHVybiBSZXNvdXJjZShyZXF1ZXN0R2V0LCB1cmkpXHJcbiAgICAucmVhZHkoZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XHJcbiAgICB9KTtcclxufTtcclxuXHJcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBTaGF1biBvbiA1LzEvMTQuXG4gKi9cblxudmFyIElNQUdFX1dBSVRfSU5URVJWQUwgPSAxMDA7XG5cbmZ1bmN0aW9uIHdhaXRGb3JJbWFnZSAoaW1hZ2UpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgIHZhciBpbnRlcnZhbElkID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgICBpZihpbWFnZS5jb21wbGV0ZSkge1xuICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsSWQpO1xuICAgICAgICByZXNvbHZlKGltYWdlKTtcbiAgICAgIH1cbiAgICB9LCBJTUFHRV9XQUlUX0lOVEVSVkFMKTtcblxuICAgIGltYWdlLm9uZXJyb3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBjbGVhckludGVydmFsKGludGVydmFsSWQpO1xuICAgICAgcmVqZWN0KCk7XG4gICAgfTtcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRJbWFnZSAodXJpKSB7XG4gIHZhciBpbWFnZSwgcHJvbWlzZTtcblxuICBpbWFnZSA9IG5ldyBJbWFnZSgpO1xuICBpbWFnZS5zcmMgPSB1cmk7XG5cbiAgcHJvbWlzZSA9IHdhaXRGb3JJbWFnZShpbWFnZSk7XG5cbiAgcmV0dXJuIHByb21pc2U7XG59XG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBTaGF1biBvbiAxLzI1LzE1XHJcbiAqXHJcbiAqL1xyXG5cclxuaW1wb3J0IFJlc291cmNlIGZyb20gJy4vcmVzb3VyY2UuanMnO1xyXG5pbXBvcnQge2dldEltYWdlfSBmcm9tICcuL2ltYWdlLWxvYWRlci5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAodXJpKSB7XHJcbiAgcmV0dXJuIFJlc291cmNlKGdldEltYWdlLCB1cmkpO1xyXG59O1xyXG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBTaGF1biBvbiAzLzkvMjAxNS5cclxuICovXHJcblxyXG5pbXBvcnQgVXRpbCBmcm9tICcuLi91dGlsLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChzb3VyY2VzKSB7XHJcbiAgdmFyIHN1Y2Nlc3NDYWxsYmFja3MgPSBbXSxcclxuICAgIGVycm9yQ2FsbGJhY2tzID0gW10sXHJcbiAgICBtdWx0aVJlc291cmNlID0ge1xyXG4gICAgICByZWFkeTogcmVhZHksXHJcbiAgICAgIGVhY2g6IGVhY2hcclxuICAgIH07XHJcblxyXG4gIGZ1bmN0aW9uIHJlYWR5KG9uU3VjY2Vzcywgb25FcnJvcikge1xyXG4gICAgaWYoVXRpbC5pc0FycmF5KG9uU3VjY2VzcykpIHtcclxuICAgICAgc3VjY2Vzc0NhbGxiYWNrcyA9IHN1Y2Nlc3NDYWxsYmFja3MuY29uY2F0KG9uU3VjY2Vzcyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzdWNjZXNzQ2FsbGJhY2tzLnB1c2gob25TdWNjZXNzKTtcclxuICAgIH1cclxuXHJcbiAgICBpZihVdGlsLmlzQXJyYXkob25FcnJvcikpIHtcclxuICAgICAgZXJyb3JDYWxsYmFja3MgPSBlcnJvckNhbGxiYWNrcy5jb25jYXQob25FcnJvcik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBlcnJvckNhbGxiYWNrcy5wdXNoKG9uRXJyb3IpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBtdWx0aVJlc291cmNlO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZWFjaChjYWxsYmFjaykge1xyXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHsgLy8gbmVlZHMgdG8gaGFwcGVuIEFGVEVSIHJlYWR5KCkgY2FsbHNcclxuICAgICAgc291cmNlcy5mb3JFYWNoKGZ1bmN0aW9uKHNvdXJjZSkge1xyXG4gICAgICAgIHZhciByZXNvdXJjZSA9IGNhbGxiYWNrKHNvdXJjZSk7XHJcbiAgICAgICAgcmVzb3VyY2UucmVhZHkoc3VjY2Vzc0NhbGxiYWNrcywgZXJyb3JDYWxsYmFja3MpO1xyXG4gICAgICB9KTtcclxuICAgIH0sIDEpO1xyXG5cclxuICAgIHJldHVybiBtdWx0aVJlc291cmNlO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIG11bHRpUmVzb3VyY2U7XHJcbn1cclxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgU2hhdW4gb24gMy8xLzE1XHJcbiAqXHJcbiAqL1xyXG5cclxudmFyIHJlc291cmNlcyA9IHt9O1xyXG5cclxuLypmdW5jdGlvbiByZWdpc3RlciAocmVzb3VyY2UpIHtcclxuICB2YXIgc291cmNlID0gcmVzb3VyY2Uuc291cmNlO1xyXG5cclxuICBpZighcmVzb3VyY2VzW3NvdXJjZV0pIHtcclxuICAgIHJlc291cmNlc1tzb3VyY2VdID0gW107XHJcbiAgfVxyXG5cclxuICByZXNvdXJjZXNbc291cmNlXS5wdXNoKHJlc291cmNlKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0UmVzb3VyY2VzIChzb3VyY2UpIHtcclxuICBpZighc291cmNlKSB7XHJcbiAgICByZXR1cm4gcmVzb3VyY2VzO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHJlc291cmNlc1tzb3VyY2VdO1xyXG59Ki9cclxuXHJcbmZ1bmN0aW9uIHJlZ2lzdGVyIChyZXNvdXJjZSkge1xyXG4gIHJlc291cmNlc1tyZXNvdXJjZS5zb3VyY2VdID0gcmVzb3VyY2U7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFJlc291cmNlKHNvdXJjZSkge1xyXG4gIHJldHVybiByZXNvdXJjZXNbc291cmNlXTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHJlZ2lzdGVyOiByZWdpc3RlcixcclxuICBnZXRSZXNvdXJjZTogZ2V0UmVzb3VyY2VcclxufTtcclxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgU2hhdW4gb24gMy8zLzE1XHJcbiAqXHJcbiAqL1xyXG5cclxuaW1wb3J0IFV0aWwgZnJvbSAnLi4vdXRpbC5qcyc7XHJcbmltcG9ydCBSZXNvdXJjZVJlZ2lzdHJ5IGZyb20gJy4vcmVzb3VyY2UtcmVnaXN0cnkuanMnO1xyXG5pbXBvcnQge2lzRnVsbFVybH0gZnJvbSAnLi4vY29tbW9uLmpzJztcclxuXHJcbnZhciByZXNvdXJjZVBvb2wgPSB7fTtcclxuXHJcbi8vIG1ldGhvZCBtdXN0IGJlIGFzeW5jaHJvbm91c1xyXG5mdW5jdGlvbiBSZXNvdXJjZSAobWV0aG9kLCBzb3VyY2UpIHtcclxuICB2YXIgc3VjY2Vzc0NhbGxiYWNrcyA9IFtdLFxyXG4gICAgZXJyb3JDYWxsYmFja3MgPSBbXSxcclxuICAgIHJlc291cmNlID0ge1xyXG4gICAgICByZWFkeTogcmVhZHksXHJcbiAgICAgIGZldGNoOiBmZXRjaCxcclxuICAgICAgcHJvbWlzZTogbnVsbCxcclxuICAgICAgc291cmNlOiBzb3VyY2VcclxuICAgIH07XHJcblxyXG4gIGlmKCFVdGlsLmlzRnVuY3Rpb24obWV0aG9kKSkge1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcmVhZHkgKG9uU3VjY2Vzcywgb25FcnJvcikge1xyXG4gICAgaWYoVXRpbC5pc0FycmF5KG9uU3VjY2VzcykpIHtcclxuICAgICAgc3VjY2Vzc0NhbGxiYWNrcyA9IHN1Y2Nlc3NDYWxsYmFja3MuY29uY2F0KG9uU3VjY2Vzcyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzdWNjZXNzQ2FsbGJhY2tzLnB1c2gob25TdWNjZXNzKTtcclxuICAgIH1cclxuXHJcbiAgICBpZihVdGlsLmlzQXJyYXkob25FcnJvcikpIHtcclxuICAgICAgZXJyb3JDYWxsYmFja3MgPSBlcnJvckNhbGxiYWNrcy5jb25jYXQob25FcnJvcik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBlcnJvckNhbGxiYWNrcy5wdXNoKG9uRXJyb3IpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXNvdXJjZTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIG9uU3VjY2VzcyAocmVzdWx0LCBpbmRleCkge1xyXG4gICAgdmFyIHN1Y2Nlc3NDYWxsYmFjayA9IHN1Y2Nlc3NDYWxsYmFja3NbaW5kZXhdO1xyXG4gICAgaWYoIXN1Y2Nlc3NDYWxsYmFjaykge1xyXG4gICAgICBpZihpbmRleCA8IHN1Y2Nlc3NDYWxsYmFja3MubGVuZ3RoKSB7IG9uRXJyb3IocmVzdWx0LCBpbmRleCArIDEpOyB9XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgbmV3UmVzdWx0ID0gc3VjY2Vzc0NhbGxiYWNrKHJlc3VsdCk7XHJcbiAgICBpZihuZXdSZXN1bHQgJiYgbmV3UmVzdWx0LnJlYWR5KSB7XHJcbiAgICAgIG5ld1Jlc3VsdC5yZWFkeShmdW5jdGlvbiAocmVzdWx0KSB7XHJcbiAgICAgICAgb25TdWNjZXNzKHJlc3VsdCwgaW5kZXggKyAxKTtcclxuICAgICAgfSwgZnVuY3Rpb24gKHJlc3VsdCkge1xyXG4gICAgICAgIG9uRXJyb3IocmVzdWx0LCBpbmRleCArIDEpO1xyXG4gICAgICB9KTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfSBlbHNlIGlmKCFuZXdSZXN1bHQpIHtcclxuICAgICAgbmV3UmVzdWx0ID0gcmVzdWx0O1xyXG4gICAgfVxyXG4gICAgb25TdWNjZXNzKG5ld1Jlc3VsdCwgaW5kZXggKyAxKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIG9uRXJyb3IocmVzdWx0LCBpbmRleCkge1xyXG4gICAgdmFyIGVycm9yQ2FsbGJhY2sgPSBlcnJvckNhbGxiYWNrc1tpbmRleF07XHJcbiAgICBpZighZXJyb3JDYWxsYmFjaykge1xyXG4gICAgICBpZihpbmRleCA8IGVycm9yQ2FsbGJhY2tzLmxlbmd0aCkgeyBvbkVycm9yKHJlc3VsdCwgaW5kZXggKyAxKTsgfVxyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgcmVzdWx0ID0gZXJyb3JDYWxsYmFjayhyZXN1bHQpO1xyXG4gICAgaWYocmVzdWx0ICYmIHJlc3VsdC5yZWFkeSkge1xyXG4gICAgICByZXN1bHQucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgb25TdWNjZXNzKHJlc3VsdCwgaW5kZXggKyAxKTtcclxuICAgICAgfSwgZnVuY3Rpb24ocmVzdWx0KSB7XHJcbiAgICAgICAgb25FcnJvcihyZXN1bHQsIGluZGV4ICsgMSk7XHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBvbkVycm9yKHJlc3VsdCwgaW5kZXggKyAxKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGZldGNoIChzb3VyY2UpIHtcclxuICAgIHZhciBwcm9taXNlO1xyXG5cclxuICAgIGlmKFJlc291cmNlLmJhc2VVcmkpIHtcclxuICAgICAgaWYoIWlzRnVsbFVybChzb3VyY2UpKSB7XHJcbiAgICAgICAgc291cmNlID0gUmVzb3VyY2UuYmFzZVVyaSArICcvJyArIHNvdXJjZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByb21pc2UgPSBtZXRob2Qoc291cmNlKTtcclxuXHJcbiAgICBpZighVXRpbC5pc09iamVjdChwcm9taXNlKSB8fCAhcHJvbWlzZS50aGVuKSB7XHJcbiAgICAgIFV0aWwuZXJyb3IoJ1Byb3ZpZGVkIHJlc291cmNlIG1ldGhvZCBkaWQgbm90IHJldHVybiBhIHRoZW5hYmxlIG9iamVjdCcpO1xyXG4gICAgfVxyXG5cclxuICAgIHJlc291cmNlLnNvdXJjZSA9IHNvdXJjZTtcclxuICAgIHJlc291cmNlLnByb21pc2UgPSBwcm9taXNlLnRoZW4oXHJcbiAgICAgIGZ1bmN0aW9uKHJlc3VsdCkge1xyXG4gICAgICAgIG9uU3VjY2VzcyhyZXN1bHQsIDApO1xyXG4gICAgICB9LFxyXG4gICAgICBmdW5jdGlvbihyZXN1bHQpIHtcclxuICAgICAgICBvbkVycm9yKHJlc3VsdCwgMCk7XHJcbiAgICAgIH1cclxuICAgICk7XHJcblxyXG4gICAgcmV0dXJuIHJlc291cmNlO1xyXG4gIH1cclxuXHJcbiAgLy8gVE9ETzogbWFrZSBiZXR0ZXJcclxuICBpZihzb3VyY2UpIHtcclxuICAgIHZhciBmdWxsU291cmNlID0gc291cmNlO1xyXG4gICAgaWYgKFJlc291cmNlLmJhc2VVcmkpIHtcclxuICAgICAgaWYgKCFpc0Z1bGxVcmwoc291cmNlKSkge1xyXG4gICAgICAgIGZ1bGxTb3VyY2UgPSBSZXNvdXJjZS5iYXNlVXJpICsgJy8nICsgc291cmNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB2YXIgZXhpc3RpbmdSZXNvdXJjZSA9IHJlc291cmNlUG9vbFtmdWxsU291cmNlXTtcclxuICAgIGlmIChleGlzdGluZ1Jlc291cmNlKSB7XHJcbiAgICAgIHJldHVybiBleGlzdGluZ1Jlc291cmNlLmZldGNoKHNvdXJjZSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvL1Jlc291cmNlUmVnaXN0cnkucmVnaXN0ZXIocmVzb3VyY2UpO1xyXG4gIHJlc291cmNlUG9vbFtmdWxsU291cmNlXSA9IHJlc291cmNlO1xyXG4gIHJldHVybiAoc291cmNlKSA/IHJlc291cmNlLmZldGNoKHNvdXJjZSkgOiByZXNvdXJjZTtcclxufVxyXG5cclxuUmVzb3VyY2UuYmFzZVVyaSA9ICcnO1xyXG5SZXNvdXJjZS5wb29sID0gcmVzb3VyY2VQb29sO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgUmVzb3VyY2U7XHJcbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IFNoYXVuIG9uIDIvMS8xNVxyXG4gKiBCYXNlZCBvbiB0aGUgamFjazJkIENocm9ubyBvYmplY3RcclxuICogXHJcbiAqL1xyXG5cclxuaW1wb3J0IFV0aWwgZnJvbSAnLi91dGlsLmpzJztcclxuaW1wb3J0IHttZXJnZU9iamVjdH0gZnJvbSAnLi9jb21tb24uanMnO1xyXG5cclxudmFyIGluc3RhbmNlO1xyXG52YXIgT05FX1NFQ09ORCA9IDEwMDA7XHJcblxyXG5mdW5jdGlvbiBTY2hlZHVsZXIoY2IsIHJhdGUpIHtcclxuICBpZighaW5zdGFuY2UpIHtcclxuICAgIGluc3RhbmNlID0gY3JlYXRlKCk7XHJcbiAgfVxyXG4gIGlmKGNiKSB7XHJcbiAgICBpbnN0YW5jZS5zY2hlZHVsZShjYiwgcmF0ZSk7XHJcbiAgfVxyXG4gIHJldHVybiBpbnN0YW5jZTtcclxufVxyXG5cclxuU2NoZWR1bGVyLmluc3RhbmNlID0gY3JlYXRlO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlKCkge1xyXG4gIHJldHVybiBtZXJnZU9iamVjdCh7XHJcbiAgICBzY2hlZHVsZWQ6IFtdLFxyXG4gICAgc2NoZWR1bGU6IHNjaGVkdWxlLFxyXG4gICAgdW5zY2hlZHVsZTogdW5zY2hlZHVsZSxcclxuICAgIHN0YXJ0OiBzdGFydCxcclxuICAgIHN0b3A6IHN0b3AsXHJcbiAgICBmcmFtZTogZnJhbWUsXHJcbiAgICBpZDogaWRcclxuICB9KS5zdGFydCgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzY2hlZHVsZShjYiwgcmF0ZSkge1xyXG4gIGZ1bmN0aW9uIHNldFJhdGUobmV3UmF0ZSkge1xyXG4gICAgcmF0ZSA9IG5ld1JhdGU7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBtYWtlRnJhbWUoKSB7XHJcbiAgICB2YXIgY291bnQgPSAxLFxyXG4gICAgICB0b3RhbERlbHRhVGltZSA9IDA7XHJcblxyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKGRlbHRhVGltZSkge1xyXG4gICAgICB0b3RhbERlbHRhVGltZSArPSBkZWx0YVRpbWU7XHJcbiAgICAgIGlmKGNvdW50ICE9PSByYXRlKSB7XHJcbiAgICAgICAgY291bnQrKztcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgY2IodG90YWxEZWx0YVRpbWUsIHNldFJhdGUpO1xyXG4gICAgICBjb3VudCA9IDE7XHJcbiAgICAgIHRvdGFsRGVsdGFUaW1lID0gMDtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBpZighVXRpbC5pc0Z1bmN0aW9uKGNiKSkge1xyXG4gICAgVXRpbC5lcnJvcignU2NoZWR1bGVyOiBvbmx5IGZ1bmN0aW9ucyBjYW4gYmUgc2NoZWR1bGVkLicpO1xyXG4gIH1cclxuICByYXRlID0gcmF0ZSB8fCAxO1xyXG5cclxuICB0aGlzLnNjaGVkdWxlZC5wdXNoKG1ha2VGcmFtZSgpKTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlkKCkge1xyXG4gIHJldHVybiB0aGlzLnNjaGVkdWxlZC5sZW5ndGg7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHVuc2NoZWR1bGUoaWQpIHtcclxuICB0aGlzLnNjaGVkdWxlZC5zcGxpY2UoaWQgLSAxLCAxKTtcclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuZnVuY3Rpb24gc3RhcnQoKSB7XHJcbiAgaWYodGhpcy5ydW5uaW5nKSB7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIG1lcmdlT2JqZWN0KHtcclxuICAgIGFjdHVhbEZwczogMCxcclxuICAgIHRpY2tzOiAwLFxyXG4gICAgZWxhcHNlZFNlY29uZHM6IDAsXHJcbiAgICBydW5uaW5nOiB0cnVlLFxyXG4gICAgbGFzdFVwZGF0ZVRpbWU6IG5ldyBEYXRlKCksXHJcbiAgICBvbmVTZWNvbmRUaW1lcklkOiB3aW5kb3cuc2V0SW50ZXJ2YWwob25PbmVTZWNvbmQuYmluZCh0aGlzKSwgT05FX1NFQ09ORClcclxuICB9LCB0aGlzKTtcclxuXHJcbiAgcmV0dXJuIHRoaXMuZnJhbWUoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gc3RvcCgpIHtcclxuICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcclxuICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLm9uZVNlY29uZFRpbWVySWQpO1xyXG4gIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLmFuaW1hdGlvbkZyYW1lSWQpO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuZnVuY3Rpb24gY2xlYXIoKSB7XHJcbiAgdGhpcy5zY2hlZHVsZWQubGVuZ3RoID0gMDtcclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuZnVuY3Rpb24gZnJhbWUoKSB7XHJcbiAgZXhlY3V0ZUZyYW1lQ2FsbGJhY2tzLmJpbmQodGhpcykoZ2V0RGVsdGFUaW1lLmJpbmQodGhpcykoKSk7XHJcbiAgdGhpcy50aWNrcysrO1xyXG5cclxuICBpZih0aGlzLnJ1bm5pbmcpIHtcclxuICAgIHRoaXMuYW5pbWF0aW9uRnJhbWVJZCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnJhbWUuYmluZCh0aGlzKSk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuZnVuY3Rpb24gb25PbmVTZWNvbmQoKSB7XHJcbiAgdGhpcy5hY3R1YWxGcHMgPSB0aGlzLnRpY2tzO1xyXG4gIHRoaXMudGlja3MgPSAwO1xyXG4gIHRoaXMuZWxhcHNlZFNlY29uZHMrKztcclxufVxyXG5cclxuZnVuY3Rpb24gZXhlY3V0ZUZyYW1lQ2FsbGJhY2tzKGRlbHRhVGltZSkge1xyXG4gIHZhciBzY2hlZHVsZWQgPSB0aGlzLnNjaGVkdWxlZDtcclxuXHJcbiAgZm9yKHZhciBpID0gMCwgbnVtU2NoZWR1bGVkID0gc2NoZWR1bGVkLmxlbmd0aDsgaSA8IG51bVNjaGVkdWxlZDsgaSsrKSB7XHJcbiAgICBzY2hlZHVsZWRbaV0oZGVsdGFUaW1lKTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldERlbHRhVGltZSgpIHtcclxuICB2YXIgbm93ID0gK25ldyBEYXRlKCk7XHJcbiAgdmFyIGRlbHRhVGltZSA9IChub3cgLSB0aGlzLmxhc3RVcGRhdGVUaW1lKSAvIE9ORV9TRUNPTkQ7XHJcblxyXG4gIHRoaXMubGFzdFVwZGF0ZVRpbWUgPSBub3c7XHJcblxyXG4gIHJldHVybiBkZWx0YVRpbWU7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFNjaGVkdWxlcjtcclxuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IHNoYXVud2VzdCBvbiA1LzkvMTUuXG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2NoZW1hTWFwcGVyIHtcbiAgY29uc3RydWN0b3IgKHNjaGVtYSkge1xuICAgIGlmKHR5cGVvZiBzY2hlbWEgIT09ICdvYmplY3QnKSB7XG4gICAgICB0aHJvdyAnU2NoZW1hTWFwcGVyOiBzY2hlbWEgbXVzdCBiZSBhbiBvYmplY3QnO1xuICAgIH1cblxuICAgIHRoaXMuc2NoZW1hID0gc2NoZW1hO1xuICB9XG5cbiAgbWFwIChkYXRhKSB7XG4gICAgcmV0dXJuIG1hcFZhbHVlKGRhdGEsIHRoaXMuc2NoZW1hKTtcbiAgfVxufVxuXG52YXIgdHlwZU1hcCA9IHtcbiAgJ29iamVjdCc6IGl0ZXJhdGVLZXlzLFxuICAnYXJyYXknOiBpdGVyYXRlQXJyYXlcbn07XG5cbmZ1bmN0aW9uIG1hcFZhbHVlICh2YWwsIHNjaGVtYSwgY29udGFpbmVyKSB7XG4gIHZhciBtYXBwaW5nRnVuYztcblxuICBpZighc2NoZW1hKSB7XG4gICAgcmV0dXJuIHZhbDtcbiAgfVxuXG4gIG1hcHBpbmdGdW5jID0gdHlwZU1hcFt0eXBlb2YgdmFsXTtcbiAgaWYobWFwcGluZ0Z1bmMpIHtcbiAgICByZXR1cm4gbWFwcGluZ0Z1bmModmFsLCBzY2hlbWEpO1xuICB9XG5cbiAgaWYodHlwZW9mIHNjaGVtYSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHNjaGVtYSh2YWwsIGNvbnRhaW5lcik7XG4gIH1cbiAgcmV0dXJuIHZhbDtcbn1cblxuZnVuY3Rpb24gaXRlcmF0ZUtleXMgKG9iaiwgc2NoZW1hKSB7XG4gIHJldHVybiBPYmplY3Qua2V5cyhvYmopLnJlZHVjZShmdW5jdGlvbihuZXdPYmosIGtleSkge1xuICAgIG5ld09ialtrZXldID0gbWFwVmFsdWUob2JqW2tleV0sIHNjaGVtYVtrZXldLCBuZXdPYmopO1xuICAgIHJldHVybiBuZXdPYmo7XG4gIH0sIHt9KTtcbn1cblxuZnVuY3Rpb24gaXRlcmF0ZUFycmF5IChhcnIsIHNjaGVtYSkge1xuICByZXR1cm4gYXJyLnJlZHVjZShmdW5jdGlvbihuZXdBcnIsIHZhbCwgaW5kZXgpIHtcbiAgICBuZXdBcnIucHVzaChtYXBWYWx1ZShhcnJbaW5kZXhdLCBzY2hlbWFbMF0sIG5ld0FycikpO1xuICAgIHJldHVybiBuZXdBcnI7XG4gIH0sIFtdKTtcbn1cblxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgU2hhdW4gb24gNC8yMy8yMDE1LlxyXG4gKi9cclxuXHJcbnZhciB0eXBlcyA9IFsnQXJyYXknLCAnT2JqZWN0JywgJ0Jvb2xlYW4nLCAnQXJndW1lbnRzJywgJ0Z1bmN0aW9uJywgJ1N0cmluZycsICdOdW1iZXInLCAnRGF0ZScsICdSZWdFeHAnXTtcclxuXHJcbnZhciBVdGlsID0ge1xyXG4gIGlzRGVmaW5lZDogZnVuY3Rpb24gKHZhbHVlKSB7IHJldHVybiB0eXBlb2YgdmFsdWUgIT0gJ3VuZGVmaW5lZCcgfSxcclxuICBkZWY6IGZ1bmN0aW9uICh2YWx1ZSwgZGVmYXVsdFZhbHVlKSB7IHJldHVybiAodHlwZW9mIHZhbHVlID09ICd1bmRlZmluZWQnKSA/IGRlZmF1bHRWYWx1ZSA6IHZhbHVlIH0sXHJcbiAgZXJyb3I6IGZ1bmN0aW9uIChtZXNzYWdlKSB7IHRocm93IG5ldyBFcnJvcihpZCArICc6ICcgKyBtZXNzYWdlKSB9LFxyXG4gIHdhcm46IGZ1bmN0aW9uIChtZXNzYWdlKSB7IFV0aWwubG9nKCdXYXJuaW5nOiAnICsgbWVzc2FnZSkgfSxcclxuICBsb2c6IGZ1bmN0aW9uIChtZXNzYWdlKSB7IGlmKGNvbmZpZy5sb2cpIHsgY29uc29sZS5sb2coaWQgKyAnOiAnICsgbWVzc2FnZSkgfSB9LFxyXG4gIGFyZ3NUb0FycmF5OiBmdW5jdGlvbiAoYXJncykgeyByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJncykgfSxcclxuICByYW5kOiBmdW5jdGlvbiAobWF4LCBtaW4pIHsgLy8gbW92ZSB0byBleHRyYT9cclxuICAgIG1pbiA9IG1pbiB8fCAwO1xyXG4gICAgaWYobWluID4gbWF4KSB7IFV0aWwuZXJyb3IoJ3JhbmQ6IGludmFsaWQgcmFuZ2UuJyk7IH1cclxuICAgIHJldHVybiBNYXRoLmZsb29yKChNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKSkgKyAobWluKTtcclxuICB9XHJcbn07XHJcblxyXG5mb3IodmFyIGkgPSAwOyBpIDwgdHlwZXMubGVuZ3RoOyBpKyspIHtcclxuICBVdGlsWydpcycgKyB0eXBlc1tpXV0gPSAoZnVuY3Rpb24odHlwZSkge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaikge1xyXG4gICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT0gJ1tvYmplY3QgJyArIHR5cGUgKyAnXSc7XHJcbiAgICB9O1xyXG4gIH0pKHR5cGVzW2ldKTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgVXRpbDsiLCIvKipcclxuICogQ3JlYXRlZCBieSBTaGF1biBvbiAzLzEvMTVcclxuICpcclxuICovXHJcblxyXG5pbXBvcnQge2dldENhbnZhcywgZ2V0VHJhbnNwYXJlbnRJbWFnZX0gZnJvbSAnLi4vY29tbW9uLmpzJztcclxuXHJcbmNvbnN0IERFRkFVTFRfUkFURSA9IDU7XHJcblxyXG5mdW5jdGlvbiBidWlsZEZyYW1lU2VxdWVuY2UoZnJhbWVTZXREZWZpbml0aW9uLCBmcmFtZVNpemUsIHNwcml0ZVNoZWV0KSB7XHJcbiAgdmFyIGZyYW1lV2lkdGggPSBmcmFtZVNpemUud2lkdGg7XHJcbiAgdmFyIGZyYW1lSGVpZ2h0ID0gZnJhbWVTaXplLmhlaWdodDtcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIHJhdGU6IGZyYW1lU2V0RGVmaW5pdGlvbi5yYXRlIHx8IERFRkFVTFRfUkFURSxcclxuICAgIGZyYW1lczogZnJhbWVTZXREZWZpbml0aW9uLmZyYW1lc1xyXG4gICAgICAubWFwKGZ1bmN0aW9uKGZyYW1lRGVmaW5pdGlvbikge1xyXG4gICAgICAgIHZhciBmcmFtZSA9IGdldENhbnZhcyhmcmFtZVdpZHRoLCBmcmFtZUhlaWdodCk7XHJcblxyXG4gICAgICAgIGZyYW1lXHJcbiAgICAgICAgICAuZ2V0Q29udGV4dCgnMmQnKVxyXG4gICAgICAgICAgLmRyYXdJbWFnZShcclxuICAgICAgICAgICAgc3ByaXRlU2hlZXQsXHJcbiAgICAgICAgICAgIGZyYW1lRGVmaW5pdGlvbi54LCBmcmFtZURlZmluaXRpb24ueSxcclxuICAgICAgICAgICAgZnJhbWVXaWR0aCwgZnJhbWVIZWlnaHQsXHJcbiAgICAgICAgICAgIDAsIDAsXHJcbiAgICAgICAgICAgIGZyYW1lV2lkdGgsIGZyYW1lSGVpZ2h0XHJcbiAgICAgICAgICApO1xyXG5cclxuICAgICAgICByZXR1cm4gZnJhbWU7XHJcbiAgICAgIH0pXHJcbiAgfTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKHNwcml0ZURlZmluaXRpb24sIHNwcml0ZVNoZWV0KSB7XHJcbiAgcmV0dXJuIE9iamVjdFxyXG4gICAgLmtleXMoc3ByaXRlRGVmaW5pdGlvbi5mcmFtZVNldClcclxuICAgIC5yZWR1Y2UoZnVuY3Rpb24oZnJhbWVTZXQsIGZyYW1lU2V0SWQpIHtcclxuICAgICAgdmFyIGZyYW1lU2VxdWVuY2UgPSBidWlsZEZyYW1lU2VxdWVuY2UoXHJcbiAgICAgICAgc3ByaXRlRGVmaW5pdGlvbi5mcmFtZVNldFtmcmFtZVNldElkXSxcclxuICAgICAgICBzcHJpdGVEZWZpbml0aW9uLmZyYW1lU2l6ZSxcclxuICAgICAgICBzcHJpdGVTaGVldFxyXG4gICAgICApO1xyXG5cclxuICAgICAgZnJhbWVTZXF1ZW5jZS5mcmFtZXMgPSBmcmFtZVNlcXVlbmNlLmZyYW1lc1xyXG4gICAgICAgIC5tYXAoZnVuY3Rpb24oZnJhbWUpIHtcclxuICAgICAgICAgIHJldHVybiBnZXRUcmFuc3BhcmVudEltYWdlKHNwcml0ZURlZmluaXRpb24udHJhbnNwYXJlbnRDb2xvciwgZnJhbWUpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgZnJhbWVTZXRbZnJhbWVTZXRJZF0gPSBmcmFtZVNlcXVlbmNlO1xyXG5cclxuICAgICAgcmV0dXJuIGZyYW1lU2V0O1xyXG4gICAgfSwge30pO1xyXG59O1xyXG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBTaGF1biBvbiA0LzI1LzIwMTUuXHJcbiAqL1xyXG5cclxuaW1wb3J0IEh0dHBSZXNvdXJjZSBmcm9tICcuLi9yZXNvdXJjZXMvaHR0cC1yZXNvdXJjZS5qcyc7XHJcbmltcG9ydCBJbWFnZVJlc291cmNlIGZyb20gJy4uL3Jlc291cmNlcy9pbWFnZS1yZXNvdXJjZS5qcyc7XHJcbmltcG9ydCBTcHJpdGVzIGZyb20gJy4vc3ByaXRlcy5qcyc7XHJcbmltcG9ydCBSZXNvdXJjZSBmcm9tICcuLi9yZXNvdXJjZXMvcmVzb3VyY2UuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKHNjZW5lVXJpKSB7XHJcbiAgLy9SZXNvdXJjZS5iYXNlVXJpID0gYmFzZVVyaTtcclxuICByZXR1cm4gSHR0cFJlc291cmNlKHNjZW5lVXJpKS5yZWFkeShmdW5jdGlvbihzY2VuZURhdGEpIHtcclxuICAgIHZhciBsYXllckRlZmluaXRpb25zID0gc2NlbmVEYXRhLmxheWVyRGVmaW5pdGlvbnM7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgc2NlbmVEYXRhOiBzY2VuZURhdGEsXHJcbiAgICAgIGJhY2tncm91bmQ6IEltYWdlUmVzb3VyY2UobGF5ZXJEZWZpbml0aW9ucy5iYWNrZ3JvdW5kLmJhY2tncm91bmRVcmwpLFxyXG4gICAgICBzcHJpdGU6IFNwcml0ZXMobGF5ZXJEZWZpbml0aW9ucy5lbnRpdGllcy5zcHJpdGVzKVxyXG4gICAgfTtcclxuICB9KTtcclxufVxyXG4iLCJpbXBvcnQgU2NoZWR1bGVyIGZyb20gJy4uL3NjaGVkdWxlci5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoZnJhbWVTZXQpIHtcclxuICB2YXIgY3VycmVudEZyYW1lU2VxdWVuY2UgPSBudWxsLFxyXG4gICAgY3VycmVudEZyYW1lSW5kZXggPSAwLFxyXG4gICAgY3VycmVudEZyYW1lID0gbnVsbCxcclxuICAgIGZyYW1lQ2FsbGJhY2sgPSBudWxsO1xyXG5cclxuICB2YXIgc2NoZWR1bGVySWQgPSBTY2hlZHVsZXIoZnVuY3Rpb24oZGVsdGFUaW1lLCBzZXRSYXRlKSB7XHJcbiAgICBpZighY3VycmVudEZyYW1lU2VxdWVuY2UpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmKCFjdXJyZW50RnJhbWUpIHtcclxuICAgICAgc2V0UmF0ZShjdXJyZW50RnJhbWVTZXF1ZW5jZS5yYXRlKTtcclxuICAgIH1cclxuXHJcbiAgICBjdXJyZW50RnJhbWUgPSBjdXJyZW50RnJhbWVTZXF1ZW5jZS5mcmFtZXNbY3VycmVudEZyYW1lSW5kZXhdXHJcbiAgICBpZihmcmFtZUNhbGxiYWNrKSB7XHJcbiAgICAgIGZyYW1lQ2FsbGJhY2soY3VycmVudEZyYW1lKTtcclxuICAgIH1cclxuXHJcbiAgICBpZigrK2N1cnJlbnRGcmFtZUluZGV4ID49IGN1cnJlbnRGcmFtZVNlcXVlbmNlLmZyYW1lcy5sZW5ndGgpIHtcclxuICAgICAgY3VycmVudEZyYW1lSW5kZXggPSAwO1xyXG4gICAgfVxyXG4gIH0pXHJcbiAgICAuaWQoKTtcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIHBsYXk6IGZ1bmN0aW9uKGZyYW1lU2V0SWQpIHtcclxuICAgICAgY3VycmVudEZyYW1lU2VxdWVuY2UgPSBmcmFtZVNldFtmcmFtZVNldElkXTtcclxuICAgICAgY3VycmVudEZyYW1lSW5kZXggPSAwO1xyXG4gICAgICBjdXJyZW50RnJhbWUgPSBudWxsO1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcbiAgICBvbkZyYW1lOiBmdW5jdGlvbihjYikge1xyXG4gICAgICBmcmFtZUNhbGxiYWNrID0gY2I7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuICAgIHN0b3A6IGZ1bmN0aW9uKCkge1xyXG4gICAgICBjdXJyZW50RnJhbWVTZXF1ZW5jZSA9IG51bGw7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuICAgIGtpbGw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICBzY2hlZHVsZXIudW5zY2hlZHVsZShzY2hlZHVsZXJJZCk7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuICAgIGN1cnJlbnRGcmFtZUluZGV4OiBmdW5jdGlvbigpIHtcclxuICAgICAgcmV0dXJuIGN1cnJlbnRGcmFtZUluZGV4O1xyXG4gICAgfSxcclxuICAgIGdldEltYWdlOiBmdW5jdGlvbigpIHtcclxuICAgICAgcmV0dXJuIGN1cnJlbnRGcmFtZTtcclxuICAgIH1cclxuICB9O1xyXG59XHJcbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IFNoYXVuIG9uIDUvMzEvMTQuXHJcbiAqXHJcbiAqL1xyXG5cclxuaW1wb3J0IEltYWdlUmVzb3VyY2UgZnJvbSAnLi4vcmVzb3VyY2VzL2ltYWdlLXJlc291cmNlLmpzJztcclxuaW1wb3J0IEZyYW1lU2V0IGZyb20gJy4vZnJhbWUtc2V0LmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChzcHJpdGVEZWZpbml0aW9uKSB7XHJcbiAgcmV0dXJuIEltYWdlUmVzb3VyY2Uoc3ByaXRlRGVmaW5pdGlvbi5zcHJpdGVTaGVldFVybClcclxuICAgIC5yZWFkeShmdW5jdGlvbiAoc3ByaXRlU2hlZXQpIHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzcHJpdGVTaGVldDogc3ByaXRlU2hlZXQsXHJcbiAgICAgICAgZGVmaW5pdGlvbjogc3ByaXRlRGVmaW5pdGlvbixcclxuICAgICAgICBmcmFtZVNldDogRnJhbWVTZXQoc3ByaXRlRGVmaW5pdGlvbiwgc3ByaXRlU2hlZXQpXHJcbiAgICAgIH07XHJcbiAgICB9KTtcclxufTtcclxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgU2hhdW4gb24gMy83LzE1XHJcbiAqXHJcbiAqL1xyXG5cclxuaW1wb3J0IHttZXJnZU9iamVjdH0gZnJvbSAnLi4vY29tbW9uLmpzJztcclxuaW1wb3J0IEh0dHBSZXNvdXJjZSBmcm9tICcuLi9yZXNvdXJjZXMvaHR0cC1yZXNvdXJjZS5qcyc7XHJcbmltcG9ydCBNdWx0aVJlc291cmNlIGZyb20gJy4uL3Jlc291cmNlcy9tdWx0aS1yZXNvdXJjZS5qcyc7XHJcbmltcG9ydCBTcHJpdGUgZnJvbSAnLi9zcHJpdGUuanMnO1xyXG5pbXBvcnQgU3ByaXRlQW5pbWF0aW9uIGZyb20gJy4vc3ByaXRlLWFuaW1hdGlvbi5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoc3ByaXRlc0RhdGEpIHtcclxuICByZXR1cm4gTXVsdGlSZXNvdXJjZShzcHJpdGVzRGF0YSlcclxuICAgIC5lYWNoKGZ1bmN0aW9uKHNwcml0ZURhdGEpIHtcclxuICAgICAgcmV0dXJuIEh0dHBSZXNvdXJjZShzcHJpdGVEYXRhLnNyYylcclxuICAgICAgLy9yZXR1cm4gSHR0cFJlc291cmNlKClcclxuICAgICAgICAucmVhZHkoU3ByaXRlKVxyXG4gICAgICAgIC5yZWFkeShmdW5jdGlvbiAoc3ByaXRlKSB7XHJcbiAgICAgICAgICBzcHJpdGUgPSBtZXJnZU9iamVjdChzcHJpdGVEYXRhLCBzcHJpdGUpO1xyXG4gICAgICAgICAgc3ByaXRlLmFuaW1hdGlvbiA9IFNwcml0ZUFuaW1hdGlvbihzcHJpdGUuZnJhbWVTZXQpO1xyXG5cclxuICAgICAgICAgIHJldHVybiBzcHJpdGU7XHJcbiAgICAgICAgfSk7XHJcbiAgfSk7XHJcbn07XHJcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBzaGF1bndlc3Qgb24gNS80LzE1LlxuICovXG5cbmltcG9ydCB7RnJhZ21lbnR9IGZyb20gJy4uL2VuZ2luZS9mcmFnbWVudHMuanMnXG5pbXBvcnQgY3JlYXRlIGZyb20gJy4uL2VuZ2luZS9kZWNvcmF0b3JzL2NyZWF0ZS5qcydcbmltcG9ydCBTY2VuZSBmcm9tICcuLi9lbmdpbmUvd29ybGQvc2NlbmUuanMnXG5pbXBvcnQgU2NoZWR1bGVyIGZyb20gJy4uL2VuZ2luZS9zY2hlZHVsZXIuanMnXG5pbXBvcnQgQmFja2dyb3VuZExheWVyIGZyb20gJy4uL2VuZ2luZS9sYXllcnMvYmFja2dyb3VuZC1sYXllci5qcydcbmltcG9ydCB2aWV3cG9ydCBmcm9tICcuLi92aWV3cG9ydC5qcydcbmltcG9ydCBJbWFnZVJlc291cmNlIGZyb20gJy4uL2VuZ2luZS9yZXNvdXJjZXMvaW1hZ2UtcmVzb3VyY2UuanMnXG5cbi8vQHVzZSgnYmFja2dyb3VuZDEnKVxuQGNyZWF0ZSgnYmFja2dyb3VuZDEnLCBJbWFnZVJlc291cmNlKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmFja2dyb3VuZDEge1xuICBjb25zdHJ1Y3RvciAoYmFja2dyb3VuZDEpIHtcbiAgICB2YXIgY2FudmFzQmFja2dyb3VuZCA9IEZyYWdtZW50KCdjYW52YXMtYmFja2dyb3VuZCcpO1xuICAgIHZhciBiYWNrZ3JvdW5kTGF5ZXIgPSBuZXcgQmFja2dyb3VuZExheWVyKGNhbnZhc0JhY2tncm91bmQpO1xuXG4gICAgU2NoZWR1bGVyKGZ1bmN0aW9uICgpIHtcbiAgICAgIGJhY2tncm91bmRMYXllci5kcmF3KHZpZXdwb3J0KTtcbiAgICB9KTtcblxuICAgIC8qc2NlbmUucmVhZHkoZnVuY3Rpb24gKHNjZW5lMSkge1xuICAgICAgc2NlbmUxLmJhY2tncm91bmQucmVhZHkoZnVuY3Rpb24gKGJhY2tncm91bmQpIHtcbiAgICAgICAgYmFja2dyb3VuZExheWVyLnNldEJhY2tncm91bmQoYmFja2dyb3VuZCk7XG4gICAgICB9KTtcbiAgICB9KTsqL1xuXG4gICAgYmFja2dyb3VuZDEucmVhZHkoZnVuY3Rpb24oYmFja2dyb3VuZCkge1xuICAgICAgYmFja2dyb3VuZExheWVyLnNldEJhY2tncm91bmQoYmFja2dyb3VuZCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmJhY2tncm91bmRMYXllciA9IGJhY2tncm91bmRMYXllcjtcbiAgfVxuXG4gIGdldCBsYXllcigpIHtcbiAgICByZXR1cm4gdGhpcy5iYWNrZ3JvdW5kTGF5ZXI7XG4gIH1cbn0iLCIvKipcbiAqIENyZWF0ZWQgYnkgc2hhdW53ZXN0IG9uIDUvOS8xNS5cbiAqL1xuXG5pbXBvcnQgQmFja2dyb3VuZDEgZnJvbSAnLi9sYXllcnMvYmFja2dyb3VuZDEuanMnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFNjZW5lIChzY2VuZSkge1xuICAvL25ldyBCYWNrZ3JvdW5kMShzY2VuZS5sYXllckRlZmluaXRpb25zLmJhY2tncm91bmQuYmFja2dyb3VuZCk7XG4gIG5ldyBCYWNrZ3JvdW5kMSgpO1xufSIsIi8qKlxuICogQ3JlYXRlZCBieSBzaGF1bndlc3Qgb24gNS85LzE1LlxuICovXG5cbmltcG9ydCBTY2hlbWFNYXBwZXIgZnJvbSAnLi4vZW5naW5lL3NjaGVtYS1tYXBwZXIuanMnO1xuaW1wb3J0IEltYWdlUmVzb3VyY2UgZnJvbSAnLi4vZW5naW5lL3Jlc291cmNlcy9pbWFnZS1yZXNvdXJjZS5qcyc7XG5pbXBvcnQge2luY2x1ZGVJbnN0YW5jZX0gZnJvbSAnLi4vZW5naW5lL2NvbnRhaW5lci5qcyc7XG5cbmZ1bmN0aW9uIHNldFByb3AocHJvcCwgZnVuYykge1xuICByZXR1cm4gZnVuY3Rpb24odmFsLCBjb250YWluZXIpIHtcbiAgICBjb250YWluZXJbcHJvcF0gPSBmdW5jKHZhbCwgY29udGFpbmVyKTtcbiAgfVxufVxuXG4vKmZ1bmN0aW9uIHJlZ2lzdGVyUmVzb3VyY2UoaWQsIHJlc291cmNlKSB7XG4gIHJlZ2lzdGVyKGlkLCByZXNvdXJjZSk7XG4gIHJldHVybiBmdW5jdGlvbih2YWwpIHtcbiAgICByZXR1cm4gcmVzb3VyY2UuZmV0Y2godmFsKTtcbiAgfVxufSovXG5cbmZ1bmN0aW9uIGluY2x1ZGVSZXNvdXJjZShpZCkge1xuICByZXR1cm4gZnVuY3Rpb24odmFsKSB7XG4gICAgdmFyIHJlc291cmNlID0gaW5jbHVkZUluc3RhbmNlKGlkKTtcbiAgICByZXNvdXJjZS5mZXRjaCh2YWwpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFNjZW5lU2NoZW1hKCkge1xuICByZXR1cm4gbmV3IFNjaGVtYU1hcHBlcih7XG4gICAgbGF5ZXJEZWZpbml0aW9uczoge1xuICAgICAgYmFja2dyb3VuZDoge1xuICAgICAgICAvL2JhY2tncm91bmRVcmw6IHNldFByb3AoJ2JhY2tncm91bmQnLCBJbWFnZVJlc291cmNlKVxuICAgICAgICAvLyByZWdpc3RlciB0aGlzIHJlc291cmNlIHNvIGl0IGNhbiBiZSBpbmplY3RlZFxuICAgICAgICAvL2JhY2tncm91bmRVcmw6IHJlZ2lzdGVyUmVzb3VyY2UoJ2JhY2tncm91bmQxJywgSW1hZ2VSZXNvdXJjZSgpKVxuICAgICAgICBiYWNrZ3JvdW5kVXJsOiBpbmNsdWRlUmVzb3VyY2UoJ2JhY2tncm91bmQxJylcbiAgICAgIH1cbiAgICAgIC8qZW50aXRpZXM6IHtcbiAgICAgICAgc3ByaXRlczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogU3ByaXRlU2NoZW1hXG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9Ki9cbiAgICB9XG4gIH0pO1xufSIsIi8qKlxuICogQ3JlYXRlZCBieSBzaGF1bndlc3Qgb24gNS80LzE1LlxuICovXG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgeDogMCxcbiAgeTogMCxcbiAgd2lkdGg6IDYwMCxcbiAgaGVpZ2h0OiA0MDBcbn07Il19

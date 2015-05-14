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
  return function () {
    return {
      schema: schema,
      cb: function cb(val) {
        _includeInstance$registerInstance.registerInstance(id, val);
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

var _mergeObject = require('../common.js');

/*
There are 2 schema types: "function" and "not function"
With that in mind, this could possibly be refactored to be a
little more clear/readable
 */

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
      return mapValue(getConfig(data, this.schema));
    }
  }]);

  return SchemaMapper;
})();

exports['default'] = SchemaMapper;

var typeMap = {
  object: iterateKeys,
  array: iterateArray
};

function getConfig(data, schema, container) {
  return typeof schema == 'function' ? { data: data, schema: null, func: schema, container: container } : { data: data, schema: schema, func: null, container: container };
}

function mapByType(data, schema) {
  var mappingFunc = typeMap[typeof data];
  if (mappingFunc) {
    return mappingFunc(data, schema);
  }
  return data;
}

function clone(val) {
  if (_Util2['default'].isObject(val)) {
    return _mergeObject.mergeObject(val);
  }

  if (_Util2['default'].isArray(val)) {
    return val.slice(0);
  }

  return val;
}

function mapValue(config) {
  var func = config.func,
      data = config.data,
      schema = config.schema,
      container = config.container,
      result,
      mappedValue;

  mappedValue = schema ? mapByType(data, schema) : clone(data);

  if (func) {
    result = func(mappedValue, container);
    if (typeof result == 'object' && result.cb) {
      mappedValue = mapValue({
        data: data,
        func: null,
        schema: result.schema,
        container: container
      });
      result.cb(mappedValue);
    }
  }

  return mappedValue;
}

function iterateKeys(obj, schema) {
  return Object.keys(obj).reduce(function (newObj, key) {
    var schemaVal = schema.hasOwnProperty('*') ? schema['*'] : schema[key];
    newObj[key] = mapValue(getConfig(obj[key], schemaVal, newObj));
    return newObj;
  }, {});
}

function iterateArray(arr, schema) {
  return arr.reduce(function (newArr, val, index) {
    newArr.push(mapValue(getConfig(arr[index], schema[0], newArr)));
    return newArr;
  }, []);
}
module.exports = exports['default'];

},{"../common.js":2,"../util.js":18}],18:[function(require,module,exports){
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
exports['default'] = SceneSchema;
/**
 * Created by shaunwest on 5/9/15.
 */

var _SchemaMapper = require('../engine/schema/schema-mapper.js');

var _SchemaMapper2 = _interopRequireWildcard(_SchemaMapper);

var _includeResource$registerValue = require('../engine/schema/helper.js');

function SceneSchema() {
  return new _SchemaMapper2['default']({
    layerDefinitions: {
      background: {
        backgroundUrl: _includeResource$registerValue.includeResource('backgroundImage')
      },
      /*entities: {
        sprites: registerValue('sprites')
      }*/
      entities: {
        sprites: _includeResource$registerValue.registerValue('sprites')
      }
    }
  });
}

module.exports = exports['default'];

},{"../engine/schema/helper.js":16,"../engine/schema/schema-mapper.js":17}],22:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvbWFpbi5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy9lbmdpbmUvY29tbW9uLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9jb250YWluZXIuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL2RlY29yYXRvcnMvY3JlYXRlLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9kZWNvcmF0b3JzL2ZyYWdtZW50LmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9mcmFnbWVudHMuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL2luamVjdG9yLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9ramF4LmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9sYXllcnMvaW1hZ2UtbGF5ZXIuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL3Jlc291cmNlcy9odHRwLXJlc291cmNlLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9yZXNvdXJjZXMvaW1hZ2UtbG9hZGVyLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9yZXNvdXJjZXMvaW1hZ2UtcmVzb3VyY2UuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL3Jlc291cmNlcy9yZXNvdXJjZS1yZWdpc3RyeS5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy9lbmdpbmUvcmVzb3VyY2VzL3Jlc291cmNlLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9zY2hlZHVsZXIuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL3NjaGVtYS9oZWxwZXIuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL3NjaGVtYS9zY2hlbWEtbWFwcGVyLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS91dGlsLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2xheWVycy9iYWNrZ3JvdW5kLWxheWVyLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL3NjZW5lLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL3NjaGVtYS9zY2VuZS1zY2hlbWEuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvc2NoZW1hL3Nwcml0ZS1zY2hlbWEuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvdmlld3BvcnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7O2lDQ0tnQyx1QkFBdUI7O3dCQUNsQyxnQ0FBZ0M7Ozs7NEJBQzFCLHVCQUF1Qjs7NEJBQ3pCLHFDQUFxQzs7Ozs7OzJCQUV0QywwQkFBMEI7Ozs7NEJBQ3pCLDJCQUEyQjs7OztxQkFDbEMsWUFBWTs7OztBQUU5QixtQkFUUSxpQkFBaUIsRUFTTixDQUFDOzs7Ozs7Ozs7QUFTcEIsc0JBQVMsT0FBTyxHQUFHLFFBQVEsQ0FBQzs7O0FBRzVCLE1BQU0sQ0FBQyxRQUFRLHdCQUFXLENBQUM7QUFDM0IsTUFBTSxDQUFDLFlBQVksaUJBcEJYLFlBQVksQUFvQmMsQ0FBQzs7QUFFbkMsSUFBSSxXQUFXLEdBQUcsMEJBQWEsQ0FBQzs7QUFFaEMsMEJB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LEVBQUUsQ0FBQztBQUNKLEdBQUMsRUFBRSxDQUFDO0FBQ0osT0FBSyxFQUFFLEdBQUc7QUFDVixRQUFNLEVBQUUsR0FBRztDQUNaIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IFNoYXVuIG9uIDQvMjMvMjAxNS5cclxuICovXHJcblxyXG4vL2ltcG9ydCBSZXNvdXJjZVJlZ2lzdHJ5IGZyb20gJy4vZW5naW5lL3Jlc291cmNlcy9yZXNvdXJjZS1yZWdpc3RyeS5qcyc7XHJcbmltcG9ydCB7Y2FjaGVEYXRhRWxlbWVudHN9IGZyb20gJy4vZW5naW5lL2ZyYWdtZW50cy5qcyc7XHJcbmltcG9ydCBSZXNvdXJjZSBmcm9tICcuL2VuZ2luZS9yZXNvdXJjZXMvcmVzb3VyY2UuanMnO1xyXG5pbXBvcnQge2dldEluc3RhbmNlc30gZnJvbSAnLi9lbmdpbmUvY29udGFpbmVyLmpzJztcclxuaW1wb3J0IEh0dHBSZXNvdXJjZSBmcm9tICcuL2VuZ2luZS9yZXNvdXJjZXMvaHR0cC1yZXNvdXJjZS5qcyc7XHJcbi8vaW1wb3J0IExvYWRlciBmcm9tICcuL2xvYWRlci5qcyc7XHJcbmltcG9ydCBTY2VuZVNjaGVtYSBmcm9tICcuL3NjaGVtYS9zY2VuZS1zY2hlbWEuanMnO1xyXG5pbXBvcnQgU3ByaXRlU2NoZW1hIGZyb20gJy4vc2NoZW1hL3Nwcml0ZS1zY2hlbWEuanMnO1xyXG5pbXBvcnQgU2NlbmUgZnJvbSAnLi9zY2VuZS5qcyc7XHJcblxyXG5jYWNoZURhdGFFbGVtZW50cygpO1xyXG5cclxuLyp3aW5kb3cucmVmcmVzaCA9IGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiBSZXNvdXJjZVJlZ2lzdHJ5LmdldFJlc291cmNlcygnYXNzZXRzL2tpdHR5Lmpzb24nKTtcclxufTsqL1xyXG5cclxuLy92YXIgbG9hZGVyID0gbmV3IExvYWRlcigpO1xyXG4vL2xvYWRlci5nZXRTY2VuZSgna2l0dHktd29ybGQuanNvbicsJ2Fzc2V0cycpO1xyXG5cclxuUmVzb3VyY2UuYmFzZVVyaSA9ICdhc3NldHMnO1xyXG5cclxuLy8gREVCVUdcclxud2luZG93LlJlc291cmNlID0gUmVzb3VyY2U7XHJcbndpbmRvdy5nZXRJbnN0YW5jZXMgPSBnZXRJbnN0YW5jZXM7XHJcblxyXG52YXIgc2NlbmVTY2hlbWEgPSBTY2VuZVNjaGVtYSgpO1xyXG5cclxuSHR0cFJlc291cmNlKCdraXR0eS13b3JsZC5qc29uJylcclxuICAucmVhZHkoZnVuY3Rpb24oc2NlbmVEYXRhKSB7XHJcbiAgICB2YXIgc2NlbmUgPSBzY2VuZVNjaGVtYS5tYXAoc2NlbmVEYXRhKTtcclxuICAgIGNvbnNvbGUubG9nKHNjZW5lKTtcclxuICAgIFNjZW5lKHNjZW5lKTtcclxuICB9KTtcclxuXHJcbnZhciBzcHJpdGVTY2hlbWEgPSBTcHJpdGVTY2hlbWEoKTtcclxuXHJcbkh0dHBSZXNvdXJjZSgna2l0dHkuanNvbicpXHJcbiAgLnJlYWR5KGZ1bmN0aW9uKHNwcml0ZURhdGEpIHtcclxuICAgIHZhciBzcHJpdGUgPSBzcHJpdGVTY2hlbWEubWFwKHNwcml0ZURhdGEpO1xyXG4gICAgY29uc29sZS5sb2coc3ByaXRlKTtcclxuICB9KTtcclxuIiwiXHJcbmltcG9ydCBVdGlsIGZyb20gJy4vdXRpbC5qcyc7XHJcblxyXG4vLyBSZXR1cm4gZXZlcnl0aGluZyBiZWZvcmUgdGhlIGxhc3Qgc2xhc2ggb2YgYSB1cmxcclxuLy8gZS5nLiBodHRwOi8vZm9vL2Jhci9iYXouanNvbiA9PiBodHRwOi8vZm9vL2JhclxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0QmFzZVVybCh1cmwpIHtcclxuICB2YXIgbiA9IHVybC5sYXN0SW5kZXhPZignLycpO1xyXG4gIHJldHVybiB1cmwuc3Vic3RyaW5nKDAsIG4pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaXNGdWxsVXJsKHVybCkge1xyXG4gIHJldHVybiAodXJsLnN1YnN0cmluZygwLCA3KSA9PT0gJ2h0dHA6Ly8nIHx8XHJcbiAgICB1cmwuc3Vic3RyaW5nKDAsIDgpID09PSAnaHR0cHM6Ly8nKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZVVybCh1cmwsIGJhc2VVcmwpIHtcclxuICBpZihiYXNlVXJsICYmICFpc0Z1bGxVcmwodXJsKSkge1xyXG4gICAgcmV0dXJuIGJhc2VVcmwgKyAnLycgKyB1cmw7XHJcbiAgfVxyXG4gIHJldHVybiB1cmw7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBtZXJnZU9iamVjdChzb3VyY2UsIGRlc3RpbmF0aW9uLCBhbGxvd1dyYXAsIGV4Y2VwdGlvbk9uQ29sbGlzaW9ucykge1xyXG4gIHNvdXJjZSA9IHNvdXJjZSB8fCB7fTsgLy9Qb29sLmdldE9iamVjdCgpO1xyXG4gIGRlc3RpbmF0aW9uID0gZGVzdGluYXRpb24gfHwge307IC8vUG9vbC5nZXRPYmplY3QoKTtcclxuXHJcbiAgT2JqZWN0LmtleXMoc291cmNlKS5mb3JFYWNoKGZ1bmN0aW9uKHByb3ApIHtcclxuICAgIGFzc2lnblByb3BlcnR5KHNvdXJjZSwgZGVzdGluYXRpb24sIHByb3AsIGFsbG93V3JhcCwgZXhjZXB0aW9uT25Db2xsaXNpb25zKTtcclxuICB9KTtcclxuXHJcbiAgcmV0dXJuIGRlc3RpbmF0aW9uO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gYXNzaWduUHJvcGVydHkoc291cmNlLCBkZXN0aW5hdGlvbiwgcHJvcCwgYWxsb3dXcmFwLCBleGNlcHRpb25PbkNvbGxpc2lvbnMpIHtcclxuICBpZihkZXN0aW5hdGlvbi5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xyXG4gICAgaWYoYWxsb3dXcmFwKSB7XHJcbiAgICAgIGRlc3RpbmF0aW9uW3Byb3BdID0gRnVuYy53cmFwKGRlc3RpbmF0aW9uW3Byb3BdLCBzb3VyY2VbcHJvcF0pO1xyXG4gICAgICBVdGlsLmxvZygnTWVyZ2U6IHdyYXBwZWQgXFwnJyArIHByb3AgKyAnXFwnJyk7XHJcbiAgICB9IGVsc2UgaWYoZXhjZXB0aW9uT25Db2xsaXNpb25zKSB7XHJcbiAgICAgIFV0aWwuZXJyb3IoJ0ZhaWxlZCB0byBtZXJnZSBtaXhpbi4gTWV0aG9kIFxcJycgK1xyXG4gICAgICBwcm9wICsgJ1xcJyBjYXVzZWQgYSBuYW1lIGNvbGxpc2lvbi4nKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGRlc3RpbmF0aW9uW3Byb3BdID0gc291cmNlW3Byb3BdO1xyXG4gICAgICBVdGlsLmxvZygnTWVyZ2U6IG92ZXJ3cm90ZSBcXCcnICsgcHJvcCArICdcXCcnKTtcclxuICAgIH1cclxuICAgIHJldHVybiBkZXN0aW5hdGlvbjtcclxuICB9XHJcblxyXG4gIGRlc3RpbmF0aW9uW3Byb3BdID0gc291cmNlW3Byb3BdO1xyXG5cclxuICByZXR1cm4gZGVzdGluYXRpb247XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRDYW52YXMod2lkdGgsIGhlaWdodCkge1xyXG4gIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuXHJcbiAgY2FudmFzLndpZHRoID0gd2lkdGggfHwgNTAwO1xyXG4gIGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQgfHwgNTAwO1xyXG5cclxuICByZXR1cm4gY2FudmFzO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaW50ZXJzZWN0cyhyZWN0QSwgcmVjdEIpIHtcclxuICByZXR1cm4gIShcclxuICAgIHJlY3RBLnggKyByZWN0QS53aWR0aCA8IHJlY3RCLnggfHxcclxuICAgIHJlY3RBLnkgKyByZWN0QS5oZWlnaHQgPCByZWN0Qi55IHx8XHJcbiAgICByZWN0QS54ID4gcmVjdEIueCArIHJlY3RCLndpZHRoIHx8XHJcbiAgICByZWN0QS55ID4gcmVjdEIueSArIHJlY3RCLmhlaWdodFxyXG4gICk7XHJcbn1cclxuXHJcbi8vIE1ha2UgdGhlIGdpdmVuIFJHQiB2YWx1ZSB0cmFuc3BhcmVudCBpbiB0aGUgZ2l2ZW4gaW1hZ2UuXHJcbi8vIFJldHVybnMgYSBuZXcgaW1hZ2UuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRUcmFuc3BhcmVudEltYWdlKHRyYW5zUkdCLCBpbWFnZSkge1xyXG4gIHZhciByLCBnLCBiLCBuZXdJbWFnZSwgZGF0YUxlbmd0aDtcclxuICB2YXIgd2lkdGggPSBpbWFnZS53aWR0aDtcclxuICB2YXIgaGVpZ2h0ID0gaW1hZ2UuaGVpZ2h0O1xyXG4gIHZhciBpbWFnZURhdGEgPSBpbWFnZVxyXG4gICAgLmdldENvbnRleHQoJzJkJylcclxuICAgIC5nZXRJbWFnZURhdGEoMCwgMCwgd2lkdGgsIGhlaWdodCk7XHJcblxyXG4gIGlmKHRyYW5zUkdCKSB7XHJcbiAgICBkYXRhTGVuZ3RoID0gd2lkdGggKiBoZWlnaHQgKiA0O1xyXG5cclxuICAgIGZvcih2YXIgaW5kZXggPSAwOyBpbmRleCA8IGRhdGFMZW5ndGg7IGluZGV4Kz00KSB7XHJcbiAgICAgIHIgPSBpbWFnZURhdGEuZGF0YVtpbmRleF07XHJcbiAgICAgIGcgPSBpbWFnZURhdGEuZGF0YVtpbmRleCArIDFdO1xyXG4gICAgICBiID0gaW1hZ2VEYXRhLmRhdGFbaW5kZXggKyAyXTtcclxuICAgICAgaWYociA9PT0gdHJhbnNSR0JbMF0gJiYgZyA9PT0gdHJhbnNSR0JbMV0gJiYgYiA9PT0gdHJhbnNSR0JbMl0pIHtcclxuICAgICAgICBpbWFnZURhdGEuZGF0YVtpbmRleCArIDNdID0gMDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgbmV3SW1hZ2UgPSBnZXRDYW52YXMod2lkdGgsIGhlaWdodCk7XHJcbiAgbmV3SW1hZ2VcclxuICAgIC5nZXRDb250ZXh0KCcyZCcpXHJcbiAgICAucHV0SW1hZ2VEYXRhKGltYWdlRGF0YSwgMCwgMCk7XHJcblxyXG4gIHJldHVybiBuZXdJbWFnZTtcclxufVxyXG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgc2hhdW53ZXN0IG9uIDQvMzAvMTUuXG4gKi9cblxudmFyIGluc3RhbmNlcyA9IHt9O1xudmFyIHNpbmdsZXRvbnMgPSBbXTtcblxuZnVuY3Rpb24gZmluZFNpbmdsZXRvbiAodG9rZW4pIHtcbiAgdmFyIHJlc3VsdHMgPSBzaW5nbGV0b25zLmZpbHRlcihmdW5jdGlvbihzaW5nbGV0b24pIHtcbiAgICByZXR1cm4gKHRva2VuID09PSBzaW5nbGV0b24udG9rZW4pO1xuICB9KTtcblxuICByZXR1cm4gKHJlc3VsdHMubGVuZ3RoKSA/IHJlc3VsdHNbMF0uaW5zdGFuY2UgOiBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlRmFjdG9yeSAoaWQsIGZhY3RvcnkpIHtcbiAgcmV0dXJuIGluY2x1ZGVJbnN0YW5jZShpZCkgfHwgcmVnaXN0ZXJGYWN0b3J5KGlkLCBmYWN0b3J5KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZVNpbmdsZXRvbiAodG9rZW4sIGZ1bmMpIHtcbiAgcmV0dXJuIGluY2x1ZGVTaW5nbGV0b24odG9rZW4pIHx8IHJlZ2lzdGVyU2luZ2xldG9uKHRva2VuLCBmdW5jKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZUluc3RhbmNlKGlkLCBpbnN0YW5jZSkge1xuICByZXR1cm4gaW5jbHVkZUluc3RhbmNlKGlkKSB8fCByZWdpc3Rlckluc3RhbmNlKGlkLCBpbnN0YW5jZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckZhY3RvcnkgKGlkLCBmYWN0b3J5KSB7XG4gIGlmKHR5cGVvZiBmYWN0b3J5ID09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gcmVnaXN0ZXJJbnN0YW5jZShpZCwgZmFjdG9yeSgpKTtcbiAgfVxuICB0aHJvdyAncmVnaXN0ZXJGYWN0b3J5OiBmYWN0b3J5IG11c3QgYmUgYSBmdW5jdGlvbic7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlclNpbmdsZXRvbiAodG9rZW4pIHtcbiAgdmFyIGluc3RhbmNlO1xuXG4gIGlmKHR5cGVvZiB0b2tlbiAhPSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgJ3JlZ2lzdGVyU2luZ2xldG9uOiBmaXJzdCBhcmd1bWVudCBtdXN0IGJlIGEgZnVuY3Rpb24nO1xuICB9XG5cbiAgaW5zdGFuY2UgPSBuZXcgdG9rZW4oKTtcbiAgaWYgKGluc3RhbmNlKSB7XG4gICAgc2luZ2xldG9ucy5wdXNoKHtcbiAgICAgIHRva2VuOiB0b2tlbixcbiAgICAgIGluc3RhbmNlOiBpbnN0YW5jZVxuICAgIH0pO1xuICAgIHJldHVybiBpbnN0YW5jZTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJJbnN0YW5jZSAoaWQsIGluc3RhbmNlKSB7XG4gIGlmKHR5cGVvZiBpZCAhPSAnc3RyaW5nJyB8fCB0eXBlb2YgaW5zdGFuY2UgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICB0aHJvdyAncmVnaXN0ZXJJbnN0YW5jZTogYSBzdHJpbmcgaWQgYW5kIGFuIGluc3RhbmNlIGFyZSByZXF1aXJlZCc7XG4gIH1cbiAgaW5zdGFuY2VzW2lkXSA9IGluc3RhbmNlO1xuICByZXR1cm4gaW5zdGFuY2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbmNsdWRlU2luZ2xldG9uICh0b2tlbikge1xuICByZXR1cm4gZmluZFNpbmdsZXRvbih0b2tlbik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbmNsdWRlSW5zdGFuY2UgKGlkKSB7XG4gIHJldHVybiBpbnN0YW5jZXNbaWRdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0SW5zdGFuY2VzICgpIHtcbiAgcmV0dXJuIGluc3RhbmNlcztcbn0iLCIvKipcbiAqIENyZWF0ZWQgYnkgc2hhdW53ZXN0IG9uIDUvMTAvMTUuXG4gKi9cblxuaW1wb3J0IGluamVjdCBmcm9tICcuLi9pbmplY3Rvci5qcyc7XG5pbXBvcnQge3VzZUZhY3Rvcnl9IGZyb20gJy4uL2NvbnRhaW5lci5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNyZWF0ZSAoaWQsIGZhY3RvcnkpIHtcbiAgdmFyIHJlc3VsdCA9IHVzZUZhY3RvcnkoaWQsIGZhY3RvcnkpO1xuXG4gIGlmKHJlc3VsdCkge1xuICAgIHJldHVybiBpbmplY3QoW3Jlc3VsdF0pO1xuICB9XG59IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IHNoYXVud2VzdCBvbiA1LzEwLzE1LlxuICovXG5cbmltcG9ydCBpbmplY3QgZnJvbSAnLi4vaW5qZWN0b3IuanMnO1xuaW1wb3J0IHtGcmFnbWVudH0gZnJvbSAnLi4vZnJhZ21lbnRzLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgcmV0dXJuIGluamVjdChbRnJhZ21lbnQoZWxlbWVudCldKVxufSIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IFNoYXVuIG9uIDQvMjMvMjAxNS5cclxuICovXHJcblxyXG52YXIgYWxsRGF0YUVsZW1lbnRzO1xyXG5cclxuZnVuY3Rpb24gaGFzRGF0YUF0dHJpYnV0ZShlbGVtZW50KSB7XHJcbiAgdmFyIGF0dHJpYnV0ZXMgPSBlbGVtZW50LmF0dHJpYnV0ZXM7XHJcbiAgZm9yKHZhciBpID0gMCwgbnVtQXR0cmlidXRlcyA9IGF0dHJpYnV0ZXMubGVuZ3RoOyBpIDwgbnVtQXR0cmlidXRlczsgaSsrKSB7XHJcbiAgICBpZihhdHRyaWJ1dGVzW2ldLm5hbWUuc3Vic3RyKDAsIDQpID09PSAnZGF0YScpIHtcclxuICAgICAgcmV0dXJuIGVsZW1lbnQ7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZmluZERhdGFFbGVtZW50cyAocGFyZW50RWxlbWVudCkge1xyXG4gIHZhciBhbGxFbGVtZW50cywgZWxlbWVudCwgZGF0YUVsZW1lbnRzID0gW107XHJcblxyXG4gIGlmKCFwYXJlbnRFbGVtZW50KSB7XHJcbiAgICB2YXIgaHRtbCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdodG1sJyk7XHJcbiAgICBpZighaHRtbFswXSkge1xyXG4gICAgICByZXR1cm4gZGF0YUVsZW1lbnRzO1xyXG4gICAgfVxyXG4gICAgcGFyZW50RWxlbWVudCA9IGh0bWxbMF07XHJcbiAgfVxyXG5cclxuICBhbGxFbGVtZW50cyA9IHBhcmVudEVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnKicpO1xyXG4gIGZvcih2YXIgaSA9IDAsIG51bUVsZW1lbnRzID0gYWxsRWxlbWVudHMubGVuZ3RoOyBpIDwgbnVtRWxlbWVudHM7IGkrKykge1xyXG4gICAgZWxlbWVudCA9IGFsbEVsZW1lbnRzW2ldO1xyXG4gICAgaWYoaGFzRGF0YUF0dHJpYnV0ZShlbGVtZW50KSkge1xyXG4gICAgICBkYXRhRWxlbWVudHMucHVzaChlbGVtZW50KTtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIGRhdGFFbGVtZW50cztcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIEZyYWdtZW50cyAobmFtZSkge1xyXG4gIGlmKCFhbGxEYXRhRWxlbWVudHMpIHtcclxuICAgIGNhY2hlRGF0YUVsZW1lbnRzKCk7XHJcbiAgfVxyXG4gIHJldHVybiBhbGxEYXRhRWxlbWVudHMucmVkdWNlKGZ1bmN0aW9uKHJlc3VsdCwgZWxlbWVudCkge1xyXG4gICAgaWYoZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2RhdGEtJyArIG5hbWUpKSB7XHJcbiAgICAgIHJlc3VsdC5wdXNoKGVsZW1lbnQpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9LCBbXSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBGcmFnbWVudCAobmFtZSkge1xyXG4gIHJldHVybiBGcmFnbWVudHMobmFtZSlbMF07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjYWNoZURhdGFFbGVtZW50cygpIHtcclxuICBhbGxEYXRhRWxlbWVudHMgPSBmaW5kRGF0YUVsZW1lbnRzKCk7XHJcbn1cclxuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IHNoYXVud2VzdCBvbiA0LzI4LzE1LlxuICovXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChpbmplY3RlZCkge1xuICByZXR1cm4gZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgaW5qZWN0ZWQgPSAodGFyZ2V0Ll9pbmplY3RlZCkgP1xuICAgICAgaW5qZWN0ZWQuY29uY2F0KHRhcmdldC5faW5qZWN0ZWQpIDpcbiAgICAgIGluamVjdGVkO1xuXG4gICAgaWYodGFyZ2V0Ll90YXJnZXQpIHtcbiAgICAgIHRhcmdldCA9IHRhcmdldC5fdGFyZ2V0O1xuICAgIH1cblxuICAgIHZhciBuZXdUYXJnZXQgPSB0YXJnZXQuYmluZC5hcHBseSh0YXJnZXQsIFtudWxsXS5jb25jYXQoaW5qZWN0ZWQpKTtcbiAgICBuZXdUYXJnZXQuX3RhcmdldCA9IHRhcmdldDtcbiAgICBuZXdUYXJnZXQuX2luamVjdGVkID0gaW5qZWN0ZWQ7XG4gICAgcmV0dXJuIG5ld1RhcmdldDtcbiAgfTtcbn1cbiIsIi8qKlxuICogQ3JlYXRlZCBieSBTaGF1biBvbiA1LzMvMTQuXG4gKi9cbnZhciBwcm9taXNlcyA9IFtdLFxuICBiYXNlVXJsID0gJyc7XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24ob2JqKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PSAnW29iamVjdCBGdW5jdGlvbl0nO1xufVxuXG5mdW5jdGlvbiBwYXJzZVJlc3BvbnNlIChjb250ZW50VHlwZSwgcmVzcG9uc2VUZXh0KSB7XG4gIGlmKGNvbnRlbnRUeXBlLnN1YnN0cigwLCAxNikgPT0gJ2FwcGxpY2F0aW9uL2pzb24nKSB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UocmVzcG9uc2VUZXh0KTtcbiAgfVxuICByZXR1cm4gcmVzcG9uc2VUZXh0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVxdWVzdEdldCh1cmwsIGNvbnRlbnRUeXBlT3JPblByb2dyZXNzLCBvblByb2dyZXNzKSB7XG4gIHZhciBwcm9taXNlO1xuXG4gIGlmKHVybC5zdWJzdHIoMCwgNykgIT09ICdodHRwOi8vJyAmJiB1cmwuc3Vic3RyKDAsIDgpICE9PSAnaHR0cHM6Ly8nKSB7XG4gICAgdXJsID0gYmFzZVVybCArIHVybDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldEhhbmRsZXIocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgdmFyIHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgaWYgKGlzRnVuY3Rpb24oY29udGVudFR5cGVPck9uUHJvZ3Jlc3MpKSB7XG4gICAgICBvblByb2dyZXNzID0gY29udGVudFR5cGVPck9uUHJvZ3Jlc3M7XG4gICAgICBjb250ZW50VHlwZU9yT25Qcm9ncmVzcyA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBpZiAob25Qcm9ncmVzcykge1xuICAgICAgcmVxLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIG9uUHJvZ3Jlc3MoZXZlbnQubG9hZGVkLCBldmVudC50b3RhbCk7XG4gICAgICB9LCBmYWxzZSk7XG4gICAgfVxuXG4gICAgcmVxLm9uZXJyb3IgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIHJlamVjdCgnTmV0d29yayBlcnJvci4nKTtcbiAgICB9O1xuXG4gICAgcmVxLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBjb250ZW50VHlwZSA9IGNvbnRlbnRUeXBlT3JPblByb2dyZXNzIHx8IHRoaXMuZ2V0UmVzcG9uc2VIZWFkZXIoJ2NvbnRlbnQtdHlwZScpIHx8ICcnO1xuICAgICAgKHRoaXMuc3RhdHVzID49IDMwMCkgP1xuICAgICAgICByZWplY3Qoe3N0YXR1c1RleHQ6IHRoaXMuc3RhdHVzVGV4dCwgc3RhdHVzOiB0aGlzLnN0YXR1c30pIDpcbiAgICAgICAgcmVzb2x2ZSh7ZGF0YTogcGFyc2VSZXNwb25zZShjb250ZW50VHlwZSwgdGhpcy5yZXNwb25zZVRleHQpLCBzdGF0dXM6IHRoaXMuc3RhdHVzfSk7XG4gICAgfTtcblxuICAgIHJlcS5vcGVuKCdnZXQnLCB1cmwsIHRydWUpO1xuICAgIHJlcS5zZW5kKCk7XG4gIH1cblxuICBwcm9taXNlID0gbmV3IFByb21pc2UoZ2V0SGFuZGxlcik7XG4gIHByb21pc2VzLnB1c2gocHJvbWlzZSk7XG5cbiAgcmV0dXJuIHByb21pc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwdXJnZSgpIHtcbiAgcHJvbWlzZXMubGVuZ3RoID0gMDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFByb21pc2VzKCkge1xuICByZXR1cm4gcHJvbWlzZXM7XG59XG5cbmZ1bmN0aW9uIHNldEJhc2VVcmwodXJsKSB7XG4gIGJhc2VVcmwgPSB1cmw7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgcmVxdWVzdEdldDogcmVxdWVzdEdldCxcbiAgcHVyZ2U6IHB1cmdlLFxuICBzZXRCYXNlVXJsOiBzZXRCYXNlVXJsLFxuICBnZXRQcm9taXNlczogZ2V0UHJvbWlzZXNcbn07XG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBTaGF1biBvbiAyLzUvMTVcclxuICogXHJcbiAqL1xyXG4vLyBUT0RPOiByZW1vdmUgcmVmZXJlbmNlcyB0byAnYmFja2dyb3VuZCdcclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW1hZ2VMYXllciB7XHJcbiAgY29uc3RydWN0b3IgKGNhbnZhcykge1xyXG4gICAgdGhpcy5jYW52YXMgPSBjYW52YXM7XHJcbiAgICB0aGlzLmNvbnRleHQyZCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gIH1cclxuXHJcbiAgc2V0QmFja2dyb3VuZCAoaW1hZ2UpIHtcclxuICAgIHRoaXMuYmFja2dyb3VuZCA9IGltYWdlO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBkcmF3ICh2aWV3cG9ydCkge1xyXG4gICAgaWYoIXZpZXdwb3J0KSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmNvbnRleHQyZC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XHJcblxyXG4gICAgaWYodGhpcy5iYWNrZ3JvdW5kKSB7XHJcbiAgICAgIHRoaXMuY29udGV4dDJkLmRyYXdJbWFnZShcclxuICAgICAgICB0aGlzLmJhY2tncm91bmQsXHJcbiAgICAgICAgdmlld3BvcnQueCwgdmlld3BvcnQueSxcclxuICAgICAgICB2aWV3cG9ydC53aWR0aCwgdmlld3BvcnQuaGVpZ2h0LFxyXG4gICAgICAgIDAsIDAsXHJcbiAgICAgICAgdmlld3BvcnQud2lkdGgsIHZpZXdwb3J0LmhlaWdodFxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgZ2V0TGF5ZXIgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuY2FudmFzO1xyXG4gIH1cclxufVxyXG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBTaGF1biBvbiAzLzEvMTVcclxuICpcclxuICovXHJcblxyXG5pbXBvcnQgVXRpbCBmcm9tICcuLi91dGlsLmpzJztcclxuaW1wb3J0IHtyZXF1ZXN0R2V0fSBmcm9tICcuLi9ramF4LmpzJztcclxuaW1wb3J0IFJlc291cmNlIGZyb20gJy4vcmVzb3VyY2UuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odXJpKSB7XHJcbiAgcmV0dXJuIFJlc291cmNlKHJlcXVlc3RHZXQsIHVyaSlcclxuICAgIC5yZWFkeShmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcclxuICAgIH0pO1xyXG59O1xyXG5cclxuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IFNoYXVuIG9uIDUvMS8xNC5cbiAqL1xuXG52YXIgSU1BR0VfV0FJVF9JTlRFUlZBTCA9IDEwMDtcblxuZnVuY3Rpb24gd2FpdEZvckltYWdlIChpbWFnZSkge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgdmFyIGludGVydmFsSWQgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICAgIGlmKGltYWdlLmNvbXBsZXRlKSB7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZCk7XG4gICAgICAgIHJlc29sdmUoaW1hZ2UpO1xuICAgICAgfVxuICAgIH0sIElNQUdFX1dBSVRfSU5URVJWQUwpO1xuXG4gICAgaW1hZ2Uub25lcnJvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZCk7XG4gICAgICByZWplY3QoKTtcbiAgICB9O1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEltYWdlICh1cmkpIHtcbiAgdmFyIGltYWdlLCBwcm9taXNlO1xuXG4gIGltYWdlID0gbmV3IEltYWdlKCk7XG4gIGltYWdlLnNyYyA9IHVyaTtcblxuICBwcm9taXNlID0gd2FpdEZvckltYWdlKGltYWdlKTtcblxuICByZXR1cm4gcHJvbWlzZTtcbn1cbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IFNoYXVuIG9uIDEvMjUvMTVcclxuICpcclxuICovXHJcblxyXG5pbXBvcnQgUmVzb3VyY2UgZnJvbSAnLi9yZXNvdXJjZS5qcyc7XHJcbmltcG9ydCB7Z2V0SW1hZ2V9IGZyb20gJy4vaW1hZ2UtbG9hZGVyLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uICh1cmkpIHtcclxuICByZXR1cm4gUmVzb3VyY2UoZ2V0SW1hZ2UsIHVyaSk7XHJcbn07XHJcbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IFNoYXVuIG9uIDMvMS8xNVxyXG4gKlxyXG4gKi9cclxuXHJcbnZhciByZXNvdXJjZXMgPSB7fTtcclxuXHJcbi8qZnVuY3Rpb24gcmVnaXN0ZXIgKHJlc291cmNlKSB7XHJcbiAgdmFyIHNvdXJjZSA9IHJlc291cmNlLnNvdXJjZTtcclxuXHJcbiAgaWYoIXJlc291cmNlc1tzb3VyY2VdKSB7XHJcbiAgICByZXNvdXJjZXNbc291cmNlXSA9IFtdO1xyXG4gIH1cclxuXHJcbiAgcmVzb3VyY2VzW3NvdXJjZV0ucHVzaChyZXNvdXJjZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFJlc291cmNlcyAoc291cmNlKSB7XHJcbiAgaWYoIXNvdXJjZSkge1xyXG4gICAgcmV0dXJuIHJlc291cmNlcztcclxuICB9XHJcblxyXG4gIHJldHVybiByZXNvdXJjZXNbc291cmNlXTtcclxufSovXHJcblxyXG5mdW5jdGlvbiByZWdpc3RlciAocmVzb3VyY2UpIHtcclxuICByZXNvdXJjZXNbcmVzb3VyY2Uuc291cmNlXSA9IHJlc291cmNlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRSZXNvdXJjZShzb3VyY2UpIHtcclxuICByZXR1cm4gcmVzb3VyY2VzW3NvdXJjZV07XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICByZWdpc3RlcjogcmVnaXN0ZXIsXHJcbiAgZ2V0UmVzb3VyY2U6IGdldFJlc291cmNlXHJcbn07XHJcbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IFNoYXVuIG9uIDMvMy8xNVxyXG4gKlxyXG4gKi9cclxuXHJcbmltcG9ydCBVdGlsIGZyb20gJy4uL3V0aWwuanMnO1xyXG5pbXBvcnQgUmVzb3VyY2VSZWdpc3RyeSBmcm9tICcuL3Jlc291cmNlLXJlZ2lzdHJ5LmpzJztcclxuaW1wb3J0IHtpc0Z1bGxVcmx9IGZyb20gJy4uL2NvbW1vbi5qcyc7XHJcblxyXG52YXIgcmVzb3VyY2VQb29sID0ge307XHJcblxyXG4vLyBtZXRob2QgbXVzdCBiZSBhc3luY2hyb25vdXNcclxuZnVuY3Rpb24gUmVzb3VyY2UgKG1ldGhvZCwgc291cmNlKSB7XHJcbiAgdmFyIHN1Y2Nlc3NDYWxsYmFja3MgPSBbXSxcclxuICAgIGVycm9yQ2FsbGJhY2tzID0gW10sXHJcbiAgICByZXNvdXJjZSA9IHtcclxuICAgICAgcmVhZHk6IHJlYWR5LFxyXG4gICAgICBmZXRjaDogZmV0Y2gsXHJcbiAgICAgIHByb21pc2U6IG51bGwsXHJcbiAgICAgIHNvdXJjZTogc291cmNlXHJcbiAgICB9O1xyXG5cclxuICBpZighVXRpbC5pc0Z1bmN0aW9uKG1ldGhvZCkpIHtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHJlYWR5IChvblN1Y2Nlc3MsIG9uRXJyb3IpIHtcclxuICAgIGlmKFV0aWwuaXNBcnJheShvblN1Y2Nlc3MpKSB7XHJcbiAgICAgIHN1Y2Nlc3NDYWxsYmFja3MgPSBzdWNjZXNzQ2FsbGJhY2tzLmNvbmNhdChvblN1Y2Nlc3MpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc3VjY2Vzc0NhbGxiYWNrcy5wdXNoKG9uU3VjY2Vzcyk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYoVXRpbC5pc0FycmF5KG9uRXJyb3IpKSB7XHJcbiAgICAgIGVycm9yQ2FsbGJhY2tzID0gZXJyb3JDYWxsYmFja3MuY29uY2F0KG9uRXJyb3IpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZXJyb3JDYWxsYmFja3MucHVzaChvbkVycm9yKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzb3VyY2U7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBvblN1Y2Nlc3MgKHJlc3VsdCwgaW5kZXgpIHtcclxuICAgIHZhciBzdWNjZXNzQ2FsbGJhY2sgPSBzdWNjZXNzQ2FsbGJhY2tzW2luZGV4XTtcclxuICAgIGlmKCFzdWNjZXNzQ2FsbGJhY2spIHtcclxuICAgICAgaWYoaW5kZXggPCBzdWNjZXNzQ2FsbGJhY2tzLmxlbmd0aCkgeyBvbkVycm9yKHJlc3VsdCwgaW5kZXggKyAxKTsgfVxyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIG5ld1Jlc3VsdCA9IHN1Y2Nlc3NDYWxsYmFjayhyZXN1bHQpO1xyXG4gICAgaWYobmV3UmVzdWx0ICYmIG5ld1Jlc3VsdC5yZWFkeSkge1xyXG4gICAgICBuZXdSZXN1bHQucmVhZHkoZnVuY3Rpb24gKHJlc3VsdCkge1xyXG4gICAgICAgIG9uU3VjY2VzcyhyZXN1bHQsIGluZGV4ICsgMSk7XHJcbiAgICAgIH0sIGZ1bmN0aW9uIChyZXN1bHQpIHtcclxuICAgICAgICBvbkVycm9yKHJlc3VsdCwgaW5kZXggKyAxKTtcclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH0gZWxzZSBpZighbmV3UmVzdWx0KSB7XHJcbiAgICAgIG5ld1Jlc3VsdCA9IHJlc3VsdDtcclxuICAgIH1cclxuICAgIG9uU3VjY2VzcyhuZXdSZXN1bHQsIGluZGV4ICsgMSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBvbkVycm9yKHJlc3VsdCwgaW5kZXgpIHtcclxuICAgIHZhciBlcnJvckNhbGxiYWNrID0gZXJyb3JDYWxsYmFja3NbaW5kZXhdO1xyXG4gICAgaWYoIWVycm9yQ2FsbGJhY2spIHtcclxuICAgICAgaWYoaW5kZXggPCBlcnJvckNhbGxiYWNrcy5sZW5ndGgpIHsgb25FcnJvcihyZXN1bHQsIGluZGV4ICsgMSk7IH1cclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHJlc3VsdCA9IGVycm9yQ2FsbGJhY2socmVzdWx0KTtcclxuICAgIGlmKHJlc3VsdCAmJiByZXN1bHQucmVhZHkpIHtcclxuICAgICAgcmVzdWx0LnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIG9uU3VjY2VzcyhyZXN1bHQsIGluZGV4ICsgMSk7XHJcbiAgICAgIH0sIGZ1bmN0aW9uKHJlc3VsdCkge1xyXG4gICAgICAgIG9uRXJyb3IocmVzdWx0LCBpbmRleCArIDEpO1xyXG4gICAgICB9KTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgb25FcnJvcihyZXN1bHQsIGluZGV4ICsgMSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBmZXRjaCAoc291cmNlKSB7XHJcbiAgICB2YXIgcHJvbWlzZTtcclxuXHJcbiAgICBpZihSZXNvdXJjZS5iYXNlVXJpKSB7XHJcbiAgICAgIGlmKCFpc0Z1bGxVcmwoc291cmNlKSkge1xyXG4gICAgICAgIHNvdXJjZSA9IFJlc291cmNlLmJhc2VVcmkgKyAnLycgKyBzb3VyY2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcm9taXNlID0gbWV0aG9kKHNvdXJjZSk7XHJcblxyXG4gICAgaWYoIVV0aWwuaXNPYmplY3QocHJvbWlzZSkgfHwgIXByb21pc2UudGhlbikge1xyXG4gICAgICBVdGlsLmVycm9yKCdQcm92aWRlZCByZXNvdXJjZSBtZXRob2QgZGlkIG5vdCByZXR1cm4gYSB0aGVuYWJsZSBvYmplY3QnKTtcclxuICAgIH1cclxuXHJcbiAgICByZXNvdXJjZS5zb3VyY2UgPSBzb3VyY2U7XHJcbiAgICByZXNvdXJjZS5wcm9taXNlID0gcHJvbWlzZS50aGVuKFxyXG4gICAgICBmdW5jdGlvbihyZXN1bHQpIHtcclxuICAgICAgICBvblN1Y2Nlc3MocmVzdWx0LCAwKTtcclxuICAgICAgfSxcclxuICAgICAgZnVuY3Rpb24ocmVzdWx0KSB7XHJcbiAgICAgICAgb25FcnJvcihyZXN1bHQsIDApO1xyXG4gICAgICB9XHJcbiAgICApO1xyXG5cclxuICAgIHJldHVybiByZXNvdXJjZTtcclxuICB9XHJcblxyXG4gIC8vIFRPRE86IG1ha2UgYmV0dGVyXHJcbiAgaWYoc291cmNlKSB7XHJcbiAgICB2YXIgZnVsbFNvdXJjZSA9IHNvdXJjZTtcclxuICAgIGlmIChSZXNvdXJjZS5iYXNlVXJpKSB7XHJcbiAgICAgIGlmICghaXNGdWxsVXJsKHNvdXJjZSkpIHtcclxuICAgICAgICBmdWxsU291cmNlID0gUmVzb3VyY2UuYmFzZVVyaSArICcvJyArIHNvdXJjZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdmFyIGV4aXN0aW5nUmVzb3VyY2UgPSByZXNvdXJjZVBvb2xbZnVsbFNvdXJjZV07XHJcbiAgICBpZiAoZXhpc3RpbmdSZXNvdXJjZSkge1xyXG4gICAgICByZXR1cm4gZXhpc3RpbmdSZXNvdXJjZS5mZXRjaChzb3VyY2UpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy9SZXNvdXJjZVJlZ2lzdHJ5LnJlZ2lzdGVyKHJlc291cmNlKTtcclxuICByZXNvdXJjZVBvb2xbZnVsbFNvdXJjZV0gPSByZXNvdXJjZTtcclxuICByZXR1cm4gKHNvdXJjZSkgPyByZXNvdXJjZS5mZXRjaChzb3VyY2UpIDogcmVzb3VyY2U7XHJcbn1cclxuXHJcblJlc291cmNlLmJhc2VVcmkgPSAnJztcclxuUmVzb3VyY2UucG9vbCA9IHJlc291cmNlUG9vbDtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFJlc291cmNlO1xyXG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBTaGF1biBvbiAyLzEvMTVcclxuICogQmFzZWQgb24gdGhlIGphY2syZCBDaHJvbm8gb2JqZWN0XHJcbiAqIFxyXG4gKi9cclxuXHJcbmltcG9ydCBVdGlsIGZyb20gJy4vdXRpbC5qcyc7XHJcbmltcG9ydCB7bWVyZ2VPYmplY3R9IGZyb20gJy4vY29tbW9uLmpzJztcclxuXHJcbnZhciBpbnN0YW5jZTtcclxudmFyIE9ORV9TRUNPTkQgPSAxMDAwO1xyXG5cclxuZnVuY3Rpb24gU2NoZWR1bGVyKGNiLCByYXRlKSB7XHJcbiAgaWYoIWluc3RhbmNlKSB7XHJcbiAgICBpbnN0YW5jZSA9IGNyZWF0ZSgpO1xyXG4gIH1cclxuICBpZihjYikge1xyXG4gICAgaW5zdGFuY2Uuc2NoZWR1bGUoY2IsIHJhdGUpO1xyXG4gIH1cclxuICByZXR1cm4gaW5zdGFuY2U7XHJcbn1cclxuXHJcblNjaGVkdWxlci5pbnN0YW5jZSA9IGNyZWF0ZTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZSgpIHtcclxuICByZXR1cm4gbWVyZ2VPYmplY3Qoe1xyXG4gICAgc2NoZWR1bGVkOiBbXSxcclxuICAgIHNjaGVkdWxlOiBzY2hlZHVsZSxcclxuICAgIHVuc2NoZWR1bGU6IHVuc2NoZWR1bGUsXHJcbiAgICBzdGFydDogc3RhcnQsXHJcbiAgICBzdG9wOiBzdG9wLFxyXG4gICAgZnJhbWU6IGZyYW1lLFxyXG4gICAgaWQ6IGlkXHJcbiAgfSkuc3RhcnQoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2NoZWR1bGUoY2IsIHJhdGUpIHtcclxuICBmdW5jdGlvbiBzZXRSYXRlKG5ld1JhdGUpIHtcclxuICAgIHJhdGUgPSBuZXdSYXRlO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gbWFrZUZyYW1lKCkge1xyXG4gICAgdmFyIGNvdW50ID0gMSxcclxuICAgICAgdG90YWxEZWx0YVRpbWUgPSAwO1xyXG5cclxuICAgIHJldHVybiBmdW5jdGlvbihkZWx0YVRpbWUpIHtcclxuICAgICAgdG90YWxEZWx0YVRpbWUgKz0gZGVsdGFUaW1lO1xyXG4gICAgICBpZihjb3VudCAhPT0gcmF0ZSkge1xyXG4gICAgICAgIGNvdW50Kys7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIGNiKHRvdGFsRGVsdGFUaW1lLCBzZXRSYXRlKTtcclxuICAgICAgY291bnQgPSAxO1xyXG4gICAgICB0b3RhbERlbHRhVGltZSA9IDA7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgaWYoIVV0aWwuaXNGdW5jdGlvbihjYikpIHtcclxuICAgIFV0aWwuZXJyb3IoJ1NjaGVkdWxlcjogb25seSBmdW5jdGlvbnMgY2FuIGJlIHNjaGVkdWxlZC4nKTtcclxuICB9XHJcbiAgcmF0ZSA9IHJhdGUgfHwgMTtcclxuXHJcbiAgdGhpcy5zY2hlZHVsZWQucHVzaChtYWtlRnJhbWUoKSk7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpZCgpIHtcclxuICByZXR1cm4gdGhpcy5zY2hlZHVsZWQubGVuZ3RoO1xyXG59XHJcblxyXG5mdW5jdGlvbiB1bnNjaGVkdWxlKGlkKSB7XHJcbiAgdGhpcy5zY2hlZHVsZWQuc3BsaWNlKGlkIC0gMSwgMSk7XHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHN0YXJ0KCkge1xyXG4gIGlmKHRoaXMucnVubmluZykge1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBtZXJnZU9iamVjdCh7XHJcbiAgICBhY3R1YWxGcHM6IDAsXHJcbiAgICB0aWNrczogMCxcclxuICAgIGVsYXBzZWRTZWNvbmRzOiAwLFxyXG4gICAgcnVubmluZzogdHJ1ZSxcclxuICAgIGxhc3RVcGRhdGVUaW1lOiBuZXcgRGF0ZSgpLFxyXG4gICAgb25lU2Vjb25kVGltZXJJZDogd2luZG93LnNldEludGVydmFsKG9uT25lU2Vjb25kLmJpbmQodGhpcyksIE9ORV9TRUNPTkQpXHJcbiAgfSwgdGhpcyk7XHJcblxyXG4gIHJldHVybiB0aGlzLmZyYW1lKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHN0b3AoKSB7XHJcbiAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XHJcbiAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5vbmVTZWNvbmRUaW1lcklkKTtcclxuICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5hbmltYXRpb25GcmFtZUlkKTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNsZWFyKCkge1xyXG4gIHRoaXMuc2NoZWR1bGVkLmxlbmd0aCA9IDA7XHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGZyYW1lKCkge1xyXG4gIGV4ZWN1dGVGcmFtZUNhbGxiYWNrcy5iaW5kKHRoaXMpKGdldERlbHRhVGltZS5iaW5kKHRoaXMpKCkpO1xyXG4gIHRoaXMudGlja3MrKztcclxuXHJcbiAgaWYodGhpcy5ydW5uaW5nKSB7XHJcbiAgICB0aGlzLmFuaW1hdGlvbkZyYW1lSWQgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZyYW1lLmJpbmQodGhpcykpO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG9uT25lU2Vjb25kKCkge1xyXG4gIHRoaXMuYWN0dWFsRnBzID0gdGhpcy50aWNrcztcclxuICB0aGlzLnRpY2tzID0gMDtcclxuICB0aGlzLmVsYXBzZWRTZWNvbmRzKys7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGV4ZWN1dGVGcmFtZUNhbGxiYWNrcyhkZWx0YVRpbWUpIHtcclxuICB2YXIgc2NoZWR1bGVkID0gdGhpcy5zY2hlZHVsZWQ7XHJcblxyXG4gIGZvcih2YXIgaSA9IDAsIG51bVNjaGVkdWxlZCA9IHNjaGVkdWxlZC5sZW5ndGg7IGkgPCBudW1TY2hlZHVsZWQ7IGkrKykge1xyXG4gICAgc2NoZWR1bGVkW2ldKGRlbHRhVGltZSk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXREZWx0YVRpbWUoKSB7XHJcbiAgdmFyIG5vdyA9ICtuZXcgRGF0ZSgpO1xyXG4gIHZhciBkZWx0YVRpbWUgPSAobm93IC0gdGhpcy5sYXN0VXBkYXRlVGltZSkgLyBPTkVfU0VDT05EO1xyXG5cclxuICB0aGlzLmxhc3RVcGRhdGVUaW1lID0gbm93O1xyXG5cclxuICByZXR1cm4gZGVsdGFUaW1lO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBTY2hlZHVsZXI7XHJcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBzaGF1bndlc3Qgb24gNS8xMS8xNS5cbiAqL1xuXG5pbXBvcnQgVXRpbCBmcm9tICcuLi91dGlsLmpzJztcbmltcG9ydCB7aW5jbHVkZUluc3RhbmNlLCByZWdpc3Rlckluc3RhbmNlfSBmcm9tICcuLi9jb250YWluZXIuanMnO1xuXG5leHBvcnQgZnVuY3Rpb24gc2V0UHJvcChwcm9wLCBmdW5jKSB7XG4gIHJldHVybiBmdW5jdGlvbih2YWwsIGNvbnRhaW5lcikge1xuICAgIGNvbnRhaW5lcltwcm9wXSA9IGZ1bmModmFsLCBjb250YWluZXIpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbmNsdWRlUmVzb3VyY2UoaWQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHZhbCkge1xuICAgIHZhciByZXNvdXJjZSA9IGluY2x1ZGVJbnN0YW5jZShpZCk7XG4gICAgaWYocmVzb3VyY2UpIHtcbiAgICAgIHJlc291cmNlLmZldGNoKHZhbCk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhdHRhY2hSZXNvdXJjZShrZXksIHJlc291cmNlRmFjdG9yeSkge1xuICByZXR1cm4gZnVuY3Rpb24odmFsLCBjb250YWluZXIpIHtcbiAgICBjb250YWluZXJba2V5XSA9IHJlc291cmNlRmFjdG9yeSh2YWwpO1xuICAgIHJldHVybiB2YWw7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyVmFsdWUoaWQsIHNjaGVtYSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNjaGVtYTogc2NoZW1hLFxuICAgICAgY2I6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgcmVnaXN0ZXJJbnN0YW5jZShpZCwgdmFsKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlY2hvKCkge1xuICByZXR1cm4gZnVuY3Rpb24odmFsKSB7XG4gICAgY29uc29sZS5sb2codmFsKTtcbiAgfVxufSIsIi8qKlxuICogQ3JlYXRlZCBieSBzaGF1bndlc3Qgb24gNS85LzE1LlxuICovXG5pbXBvcnQgVXRpbCBmcm9tICcuLi91dGlsLmpzJztcbmltcG9ydCB7bWVyZ2VPYmplY3R9IGZyb20gJy4uL2NvbW1vbi5qcyc7XG5cbi8qXG5UaGVyZSBhcmUgMiBzY2hlbWEgdHlwZXM6IFwiZnVuY3Rpb25cIiBhbmQgXCJub3QgZnVuY3Rpb25cIlxuV2l0aCB0aGF0IGluIG1pbmQsIHRoaXMgY291bGQgcG9zc2libHkgYmUgcmVmYWN0b3JlZCB0byBiZSBhXG5saXR0bGUgbW9yZSBjbGVhci9yZWFkYWJsZVxuICovXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNjaGVtYU1hcHBlciB7XG4gIGNvbnN0cnVjdG9yIChzY2hlbWEpIHtcbiAgICBpZih0eXBlb2Ygc2NoZW1hICE9ICdvYmplY3QnICYmIHR5cGVvZiBzY2hlbWEgIT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhyb3cgJ1NjaGVtYU1hcHBlcjogc2NoZW1hIG11c3QgYmUgYW4gb2JqZWN0IG9yIGZ1bmN0aW9uJztcbiAgICB9XG5cbiAgICB0aGlzLnNjaGVtYSA9IHNjaGVtYTtcbiAgfVxuXG4gIG1hcCAoZGF0YSkge1xuICAgIHJldHVybiBtYXBWYWx1ZShnZXRDb25maWcoZGF0YSwgdGhpcy5zY2hlbWEpKTtcbiAgfVxufVxuXG52YXIgdHlwZU1hcCA9IHtcbiAgJ29iamVjdCc6IGl0ZXJhdGVLZXlzLFxuICAnYXJyYXknOiBpdGVyYXRlQXJyYXlcbn07XG5cbmZ1bmN0aW9uIGdldENvbmZpZyhkYXRhLCBzY2hlbWEsIGNvbnRhaW5lcikge1xuICByZXR1cm4gKHR5cGVvZiBzY2hlbWEgPT0gJ2Z1bmN0aW9uJykgP1xuICAgIHsgZGF0YTogZGF0YSwgc2NoZW1hOiBudWxsLCBmdW5jOiBzY2hlbWEsIGNvbnRhaW5lcjogY29udGFpbmVyIH0gOlxuICAgIHsgZGF0YTogZGF0YSwgc2NoZW1hOiBzY2hlbWEsIGZ1bmM6IG51bGwsIGNvbnRhaW5lcjogY29udGFpbmVyIH07XG59XG5cbmZ1bmN0aW9uIG1hcEJ5VHlwZShkYXRhLCBzY2hlbWEpIHtcbiAgdmFyIG1hcHBpbmdGdW5jID0gdHlwZU1hcFt0eXBlb2YgZGF0YV07XG4gIGlmIChtYXBwaW5nRnVuYykge1xuICAgIHJldHVybiBtYXBwaW5nRnVuYyhkYXRhLCBzY2hlbWEpO1xuICB9XG4gIHJldHVybiBkYXRhO1xufVxuXG5mdW5jdGlvbiBjbG9uZSh2YWwpIHtcbiAgaWYoVXRpbC5pc09iamVjdCh2YWwpKSB7XG4gICAgcmV0dXJuIG1lcmdlT2JqZWN0KHZhbCk7XG4gIH1cblxuICBpZihVdGlsLmlzQXJyYXkodmFsKSkge1xuICAgIHJldHVybiB2YWwuc2xpY2UoMCk7XG4gIH1cblxuICByZXR1cm4gdmFsO1xufVxuXG5mdW5jdGlvbiBtYXBWYWx1ZShjb25maWcpIHtcbiAgdmFyIGZ1bmMgPSBjb25maWcuZnVuYyxcbiAgICBkYXRhID0gY29uZmlnLmRhdGEsXG4gICAgc2NoZW1hID0gY29uZmlnLnNjaGVtYSxcbiAgICBjb250YWluZXIgPSBjb25maWcuY29udGFpbmVyLFxuICAgIHJlc3VsdCxcbiAgICBtYXBwZWRWYWx1ZTtcblxuICBtYXBwZWRWYWx1ZSA9IChzY2hlbWEpID8gbWFwQnlUeXBlKGRhdGEsIHNjaGVtYSkgOiBjbG9uZShkYXRhKTtcblxuICBpZihmdW5jKSB7XG4gICAgcmVzdWx0ID0gZnVuYyhtYXBwZWRWYWx1ZSwgY29udGFpbmVyKTtcbiAgICBpZih0eXBlb2YgcmVzdWx0ID09ICdvYmplY3QnICYmIHJlc3VsdC5jYikge1xuICAgICAgbWFwcGVkVmFsdWUgPSBtYXBWYWx1ZSh7XG4gICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgIGZ1bmM6IG51bGwsXG4gICAgICAgIHNjaGVtYTogcmVzdWx0LnNjaGVtYSxcbiAgICAgICAgY29udGFpbmVyOiBjb250YWluZXJcbiAgICAgIH0pO1xuICAgICAgcmVzdWx0LmNiKG1hcHBlZFZhbHVlKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbWFwcGVkVmFsdWU7XG59XG5cbmZ1bmN0aW9uIGl0ZXJhdGVLZXlzIChvYmosIHNjaGVtYSkge1xuICByZXR1cm4gT2JqZWN0LmtleXMob2JqKS5yZWR1Y2UoZnVuY3Rpb24obmV3T2JqLCBrZXkpIHtcbiAgICB2YXIgc2NoZW1hVmFsID0gKHNjaGVtYS5oYXNPd25Qcm9wZXJ0eSgnKicpKSA/IHNjaGVtYVsnKiddIDogc2NoZW1hW2tleV07XG4gICAgbmV3T2JqW2tleV0gPSBtYXBWYWx1ZShnZXRDb25maWcob2JqW2tleV0sIHNjaGVtYVZhbCwgbmV3T2JqKSk7XG4gICAgcmV0dXJuIG5ld09iajtcbiAgfSwge30pO1xufVxuXG5mdW5jdGlvbiBpdGVyYXRlQXJyYXkgKGFyciwgc2NoZW1hKSB7XG4gIHJldHVybiBhcnIucmVkdWNlKGZ1bmN0aW9uKG5ld0FyciwgdmFsLCBpbmRleCkge1xuICAgIG5ld0Fyci5wdXNoKG1hcFZhbHVlKGdldENvbmZpZyhhcnJbaW5kZXhdLCBzY2hlbWFbMF0sIG5ld0FycikpKTtcbiAgICByZXR1cm4gbmV3QXJyO1xuICB9LCBbXSk7XG59XG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBTaGF1biBvbiA0LzIzLzIwMTUuXHJcbiAqL1xyXG5cclxudmFyIHR5cGVzID0gWydBcnJheScsICdPYmplY3QnLCAnQm9vbGVhbicsICdBcmd1bWVudHMnLCAnRnVuY3Rpb24nLCAnU3RyaW5nJywgJ051bWJlcicsICdEYXRlJywgJ1JlZ0V4cCddO1xyXG5cclxudmFyIFV0aWwgPSB7XHJcbiAgaXNEZWZpbmVkOiBmdW5jdGlvbiAodmFsdWUpIHsgcmV0dXJuIHR5cGVvZiB2YWx1ZSAhPSAndW5kZWZpbmVkJyB9LFxyXG4gIGRlZjogZnVuY3Rpb24gKHZhbHVlLCBkZWZhdWx0VmFsdWUpIHsgcmV0dXJuICh0eXBlb2YgdmFsdWUgPT0gJ3VuZGVmaW5lZCcpID8gZGVmYXVsdFZhbHVlIDogdmFsdWUgfSxcclxuICBlcnJvcjogZnVuY3Rpb24gKG1lc3NhZ2UpIHsgdGhyb3cgbmV3IEVycm9yKGlkICsgJzogJyArIG1lc3NhZ2UpIH0sXHJcbiAgd2FybjogZnVuY3Rpb24gKG1lc3NhZ2UpIHsgVXRpbC5sb2coJ1dhcm5pbmc6ICcgKyBtZXNzYWdlKSB9LFxyXG4gIGxvZzogZnVuY3Rpb24gKG1lc3NhZ2UpIHsgaWYoY29uZmlnLmxvZykgeyBjb25zb2xlLmxvZyhpZCArICc6ICcgKyBtZXNzYWdlKSB9IH0sXHJcbiAgYXJnc1RvQXJyYXk6IGZ1bmN0aW9uIChhcmdzKSB7IHJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmdzKSB9LFxyXG4gIHJhbmQ6IGZ1bmN0aW9uIChtYXgsIG1pbikgeyAvLyBtb3ZlIHRvIGV4dHJhP1xyXG4gICAgbWluID0gbWluIHx8IDA7XHJcbiAgICBpZihtaW4gPiBtYXgpIHsgVXRpbC5lcnJvcigncmFuZDogaW52YWxpZCByYW5nZS4nKTsgfVxyXG4gICAgcmV0dXJuIE1hdGguZmxvb3IoKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpKSArIChtaW4pO1xyXG4gIH1cclxufTtcclxuXHJcbmZvcih2YXIgaSA9IDA7IGkgPCB0eXBlcy5sZW5ndGg7IGkrKykge1xyXG4gIFV0aWxbJ2lzJyArIHR5cGVzW2ldXSA9IChmdW5jdGlvbih0eXBlKSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqKSB7XHJcbiAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PSAnW29iamVjdCAnICsgdHlwZSArICddJztcclxuICAgIH07XHJcbiAgfSkodHlwZXNbaV0pO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBVdGlsOyIsIi8qKlxuICogQ3JlYXRlZCBieSBzaGF1bndlc3Qgb24gNS80LzE1LlxuICovXG5cbmltcG9ydCBmcmFnbWVudCBmcm9tICcuLi9lbmdpbmUvZGVjb3JhdG9ycy9mcmFnbWVudC5qcydcbmltcG9ydCBjcmVhdGUgZnJvbSAnLi4vZW5naW5lL2RlY29yYXRvcnMvY3JlYXRlLmpzJ1xuaW1wb3J0IFNjaGVkdWxlciBmcm9tICcuLi9lbmdpbmUvc2NoZWR1bGVyLmpzJ1xuaW1wb3J0IEltYWdlTGF5ZXIgZnJvbSAnLi4vZW5naW5lL2xheWVycy9pbWFnZS1sYXllci5qcydcbmltcG9ydCB2aWV3cG9ydCBmcm9tICcuLi92aWV3cG9ydC5qcydcbmltcG9ydCBJbWFnZVJlc291cmNlIGZyb20gJy4uL2VuZ2luZS9yZXNvdXJjZXMvaW1hZ2UtcmVzb3VyY2UuanMnXG5cbkBmcmFnbWVudCgnY2FudmFzLWJhY2tncm91bmQnKVxuQGNyZWF0ZSgnYmFja2dyb3VuZEltYWdlJywgSW1hZ2VSZXNvdXJjZSlcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJhY2tncm91bmRMYXllciB7XG4gIGNvbnN0cnVjdG9yIChjYW52YXNCYWNrZ3JvdW5kLCBiYWNrZ3JvdW5kSW1hZ2UpIHtcbiAgICB2YXIgYmFja2dyb3VuZExheWVyID0gbmV3IEltYWdlTGF5ZXIoY2FudmFzQmFja2dyb3VuZCk7XG5cbiAgICBTY2hlZHVsZXIoZnVuY3Rpb24gKCkge1xuICAgICAgYmFja2dyb3VuZExheWVyLmRyYXcodmlld3BvcnQpO1xuICAgIH0pO1xuXG4gICAgYmFja2dyb3VuZEltYWdlLnJlYWR5KGZ1bmN0aW9uKGJhY2tncm91bmQpIHtcbiAgICAgIGJhY2tncm91bmRMYXllci5zZXRCYWNrZ3JvdW5kKGJhY2tncm91bmQpO1xuICAgIH0pO1xuICB9XG59IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IHNoYXVud2VzdCBvbiA1LzkvMTUuXG4gKi9cblxuaW1wb3J0IEJhY2tncm91bmRMYXllciBmcm9tICcuL2xheWVycy9iYWNrZ3JvdW5kLWxheWVyLmpzJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBTY2VuZSAoKSB7XG4gIG5ldyBCYWNrZ3JvdW5kTGF5ZXIoKTtcbn0iLCIvKipcbiAqIENyZWF0ZWQgYnkgc2hhdW53ZXN0IG9uIDUvOS8xNS5cbiAqL1xuXG5pbXBvcnQgU2NoZW1hTWFwcGVyIGZyb20gJy4uL2VuZ2luZS9zY2hlbWEvc2NoZW1hLW1hcHBlci5qcyc7XG5pbXBvcnQge2luY2x1ZGVSZXNvdXJjZSwgcmVnaXN0ZXJWYWx1ZX0gZnJvbSAnLi4vZW5naW5lL3NjaGVtYS9oZWxwZXIuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBTY2VuZVNjaGVtYSgpIHtcbiAgcmV0dXJuIG5ldyBTY2hlbWFNYXBwZXIoe1xuICAgIGxheWVyRGVmaW5pdGlvbnM6IHtcbiAgICAgIGJhY2tncm91bmQ6IHtcbiAgICAgICAgYmFja2dyb3VuZFVybDogaW5jbHVkZVJlc291cmNlKCdiYWNrZ3JvdW5kSW1hZ2UnKVxuICAgICAgfSxcbiAgICAgIC8qZW50aXRpZXM6IHtcbiAgICAgICAgc3ByaXRlczogcmVnaXN0ZXJWYWx1ZSgnc3ByaXRlcycpXG4gICAgICB9Ki9cbiAgICAgIGVudGl0aWVzOiB7XG4gICAgICAgIHNwcml0ZXM6IHJlZ2lzdGVyVmFsdWUoJ3Nwcml0ZXMnKVxuICAgICAgfVxuICAgIH1cbiAgfSk7XG59IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IHNoYXVud2VzdCBvbiA1LzkvMTUuXG4gKi9cblxuaW1wb3J0IFNjaGVtYU1hcHBlciBmcm9tICcuLi9lbmdpbmUvc2NoZW1hL3NjaGVtYS1tYXBwZXIuanMnO1xuaW1wb3J0IEltYWdlUmVzb3VyY2UgZnJvbSAnLi4vZW5naW5lL3Jlc291cmNlcy9pbWFnZS1yZXNvdXJjZS5qcyc7XG5pbXBvcnQge2F0dGFjaFJlc291cmNlLCByZWdpc3RlclZhbHVlfSBmcm9tICcuLi9lbmdpbmUvc2NoZW1hL2hlbHBlci5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFNwcml0ZVNjaGVtYSgpIHtcbiAgcmV0dXJuIG5ldyBTY2hlbWFNYXBwZXIocmVnaXN0ZXJWYWx1ZSgnc3ByaXRlVHlwZXMnLCB7XG4gICAgJyonOiB7XG4gICAgICBzcHJpdGVTaGVldFVybDogYXR0YWNoUmVzb3VyY2UoJ3Nwcml0ZVNoZWV0JywgSW1hZ2VSZXNvdXJjZSlcbiAgICB9XG4gIH0pKTtcbn1cbiIsIi8qKlxuICogQ3JlYXRlZCBieSBzaGF1bndlc3Qgb24gNS80LzE1LlxuICovXG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgeDogMCxcbiAgeTogMCxcbiAgd2lkdGg6IDYwMCxcbiAgaGVpZ2h0OiA0MDBcbn07Il19

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

/**
 * Created by Shaun on 4/23/2015.
 */

var _ResourceRegistry = require('./engine/resources/resource-registry.js');

var _ResourceRegistry2 = _interopRequireWildcard(_ResourceRegistry);

/*import BackgroundLayer from './layers/background-layer.js';
import EntityLayer from './layers/entity-layer.js';
import CollisionLayer from './layers/collision-layer.js';
import Scheduler from './scheduler.js';
import Scene from './world/scene.js';*/

var _cacheDataElements$Fragment = require('./engine/fragments.js');

//import {use, instance} from './injector.js';
//import {register} from './engine/container.js';
//import {log} from './logger.js';

var _View = require('./view.js');

var _View2 = _interopRequireWildcard(_View);

var _Loader = require('./loader.js');

var _Loader2 = _interopRequireWildcard(_Loader);

var refresh;

/*register('viewport', {
  x: 0,
  y: 0,
  width: 600,
  height: 400
});*/

/*class Data {
  setValue(value) {
    this.value = value;
  }
  getValue() {
    return this.value;
  }
}


@use(Data)
class Bar {
  constructor(data) {
    data.setValue('fuuuuuu');
  }
  baz() {
    return 'baz';
  }
}

@instance(Bar)
class Stupid {
  constructor(bar) {
    this.bar = bar;
  }
  @log('you called dumb!')
  dumb() {
    return this.bar.baz();
  }
}

@instance(Stupid)
@use(Data)
@instance('blah')
class Foo {
  constructor(stupid, data, blah) {
    console.log(stupid.dumb());
    console.log(data.getValue());
    console.log(blah);
  }

  foobar(bar) {
    return bar.baz();
  }
}

var foo = new Foo('hello!');*/

_cacheDataElements$Fragment.cacheDataElements();

/*var canvasBackground = Fragment('canvas-background');
var canvasEntities = Fragment('canvas-entities');
var canvasColliders = Fragment('canvas-colliders');*/

refresh = function () {
  return _ResourceRegistry2['default'].getResources('assets/kitty.json');
};

//new View();

var loader = new _Loader2['default']();
loader.getScene('kitty-world.json', 'assets');

/*
// VIEW STUFF

// Setup background layer
var backgroundLayer = BackgroundLayer(canvasBackground);
Scheduler(function () {
  backgroundLayer.draw(viewport);
});

// Setup entity layer
var entityLayer = EntityLayer(canvasEntities);
Scheduler(function () {
  entityLayer.draw(viewport);
});

// Setup collision debug layer
var collisionLayer = CollisionLayer(canvasColliders);
Scheduler(function () {
  collisionLayer.draw(viewport);
});
*/

/*Scene('kitty-world.json','assets').ready(function(scene) {
  scene.background.ready(function (background) {
    backgroundLayer.setBackground(background);
  });

  entityLayer.clear();
  scene.sprite.ready(function (sprite) {
    sprite.animation.play('run');
    entityLayer.addEntity(sprite);
  }, function() {
    console.log('ERROR!!')
  });

  collisionLayer.setColliders(scene.sceneData.layerDefinitions.collisions.colliders);
});*/

},{"./engine/fragments.js":4,"./engine/resources/resource-registry.js":14,"./loader.js":26,"./view.js":27}],2:[function(require,module,exports){
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
exports.tryToInstantiate = tryToInstantiate;
exports.register = register;
exports.include = include;
/**
 * Created by shaunwest on 4/30/15.
 */

var container = {};
var singletons = [];

function tryToInstantiate(func, msg) {
  try {
    // Notes on 'new': If func returns an object, the object
    // will be used as the instance. If func does not return
    // an object, a new object is created based on func.prototype
    return new func();
  } catch (e) {
    if (msg) {
      console.error(msg);
    }
    return null;
  }
}

function findSingleton(constructor) {
  var results = singletons.filter(function (singleton) {
    return constructor === singleton.constructor;
  });

  return results.length ? results[0].instance : null;
}

function register(idOrConstructor, value) {
  var instance;

  if (typeof idOrConstructor === 'string') {
    container[idOrConstructor] = value;
    return;
  }

  if (typeof idOrConstructor !== 'function') {
    return;
  }

  //instance = tryToInstantiate(idOrConstructor, '"' + idOrConstructor + '" not a class');
  instance = new idOrConstructor();

  if (instance) {
    singletons.push({
      constructor: idOrConstructor,
      instance: instance
    });
  }
}

function include(idOrConstructor) {
  if (typeof idOrConstructor === 'string') {
    return container[idOrConstructor];
  }
  return findSingleton(idOrConstructor);
}

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

/*function doInject(args, instantiate) {
  args = Array.prototype.slice.call(args);
  var injected = args.map(function(injectable) {
    return (instantiate) ?
      tryToInstantiate(injectable, '"' + injectable + '" cannot be instantiated.') :
      findInContainer(injectable) || registerSingleton(injectable) || injectable;
  });

  return function(target) {
    injected = (target._injected) ?
      injected.concat(target._injected) :
      injected;

    if(target._target) {
      target = target._target;
    }

    var newTarget = target.bind.apply(target, [null].concat(injected));
    newTarget._target = target;
    newTarget._injected = injected;
    return newTarget;
  };
}*/

// Finds a saved value or singleton.
// Pass in a constructor to inject it as a singleton
// Pass in a string id to get a registered value
exports.use = use;

// Creates a new instance of the provided constructors
// and injects them. Also accepts literal values, which
// will be directly injected.
exports.instance = instance;
/**
 * Created by shaunwest on 4/28/15.
 */

var _include$register$tryToInstantiate = require('./container.js');

//var container = [];

/*function findInContainer(id) {
  var results = container.filter(function(singletonData) {
    if(id === singletonData.id) {
      return true;
    }
  });

  return (results.length) ? results[0].value : null;
}

function registerSingleton(constructor) {
  var instance = tryToInstantiate(constructor);
  if(instance) {
    register(constructor, instance);
    return instance;
  }

  return null;
}

function tryToInstantiate(constructor, msg) {
  try {
    return new constructor();
  } catch(e) {
    if(msg) {
      console.error(msg);
    }
    return null;
  }
}*/

function doInject(injected) {
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
}

function doUse(injectList) {
  injectList = Array.prototype.slice.call(injectList);

  return doInject(injectList.map(function (item) {
    var result = _include$register$tryToInstantiate.include(item);
    if (result) {
      return result;
    }
    if (typeof item !== 'string') {
      _include$register$tryToInstantiate.register(item);
      return _include$register$tryToInstantiate.include(item);
    }
  }));
}

function doInstance(injectList) {
  injectList = Array.prototype.slice.call(injectList);

  return doInject(injectList.map(function (item) {
    return _include$register$tryToInstantiate.tryToInstantiate(item) || item;
  }));
}
function use() {
  return doUse(arguments);
}

function instance() {
  //return doInject(arguments, true);
  return doInstance(arguments);
}

/*export function inject() {
  return doInject(arguments);
}*/

},{"./container.js":3}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, '__esModule', {
  value: true
});
/**
 * Created by Shaun on 2/28/15
 * 
 */

var _intersects = require('../common.js');

var COLLIDER_STROKE = '#ff00ff';
var ENTITY_STROKE = '#50ff68';

var CollisionLayer = (function () {
  function CollisionLayer(canvas) {
    _classCallCheck(this, CollisionLayer);

    this.colliders = [];
    this.entities = [];
    this.canvas = canvas;
    this.context2d = canvas.getContext('2d');
  }

  _createClass(CollisionLayer, [{
    key: 'setEntities',

    // FIXME: change it to addEntity or something
    value: function setEntities(value) {
      this.entities = value;
    }
  }, {
    key: 'setColliders',
    value: function setColliders(value) {
      this.colliders = value;
    }
  }, {
    key: 'draw',
    value: function draw(viewport) {
      var context2d = this.context2d;

      this.context2d.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.context2d.strokeStyle = COLLIDER_STROKE;

      this.colliders.forEach(function (collider) {
        if (!_intersects.intersects(collider, viewport)) {
          return;
        }
        context2d.strokeRect(collider.x - viewport.x, collider.y - viewport.y, collider.width, collider.height);
      });

      context2d.strokeStyle = ENTITY_STROKE;
      this.entities.forEach(function (entity) {
        if (!_intersects.intersects(entity, viewport)) {
          return;
        }
        context2d.strokeRect(entity.x - viewport.x, entity.y - viewport.y, entity.width, entity.height);
      });
      return this;
    }
  }, {
    key: 'getLayer',
    value: function getLayer() {
      return this.canvas;
    }
  }]);

  return CollisionLayer;
})();

exports['default'] = CollisionLayer;
module.exports = exports['default'];

},{"../common.js":2}],9:[function(require,module,exports){
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

var _intersects = require('../common.js');

var EntityLayer = (function () {
  function EntityLayer(canvas) {
    _classCallCheck(this, EntityLayer);

    this.entities = [];
    this.context2d = canvas.getContext('2d');
    this.canvas = canvas;
  }

  _createClass(EntityLayer, [{
    key: 'addEntity',
    value: function addEntity(entity) {
      this.entities.push(entity);
      return this;
    }
  }, {
    key: 'clear',
    value: function clear() {
      this.entities.length = 0;
      return this;
    }
  }, {
    key: 'draw',
    value: function draw(viewport) {
      var entity, image;

      this.context2d.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (var i = 0, numEntities = this.entities.length; i < numEntities; i++) {
        entity = this.entities[i];

        if (!entity.animation) {
          continue;
        }

        if (!_intersects.intersects(entity, viewport)) {
          continue;
        }

        image = entity.animation.getImage();
        if (image) {
          this.context2d.drawImage(image, entity.x - viewport.x || 0, entity.y - viewport.y || 0);
        }
      }

      return this;
    }
  }, {
    key: 'getLayer',
    value: function getLayer() {
      return this.canvas;
    }
  }]);

  return EntityLayer;
})();

exports['default'] = EntityLayer;
module.exports = exports['default'];

},{"../common.js":2}],10:[function(require,module,exports){
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

// Re-work Resources...
/*export default class HttpResource {
  constructor() {
    this.resource = Resource(requestGet);
  }

  fetch (uri) {
    return this.resource
      .fetch(uri)
      .ready(function(response) {
        return response.data;
      });
  }

  ready(onSuccess, onError) {
    this.resource.ready(onSuccess, onError);
  }
}*/

exports['default'] = function (uri) {
  return _Resource2['default'](_requestGet.requestGet, uri).ready(function (response) {
    return response.data;
  });
};

;
module.exports = exports['default'];

},{"../kjax.js":6,"../util.js":17,"./resource.js":15}],11:[function(require,module,exports){
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

},{"./image-loader.js":11,"./resource.js":15}],13:[function(require,module,exports){
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

},{"../util.js":17}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Created by Shaun on 3/1/15
 *
 */

var resources = {};

function register(resource) {
  var source = resource.source;

  if (!resources[source]) {
    resources[source] = [];
  }

  resources[source].push(resource);
}

function getResources(source) {
  if (!source) {
    return resources;
  }

  return resources[source];
}

exports["default"] = {
  register: register,
  getResources: getResources
};
module.exports = exports["default"];

},{}],15:[function(require,module,exports){
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

  _ResourceRegistry2['default'].register(resource);

  //return fetch();
  return source ? resource.fetch(source) : resource;
}

Resource.baseUri = '';

exports['default'] = Resource;
module.exports = exports['default'];

},{"../common.js":2,"../util.js":17,"./resource-registry.js":14}],16:[function(require,module,exports){
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

},{"./common.js":2,"./util.js":17}],17:[function(require,module,exports){
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
}

/*export default class Scene {
  constructor() {
    this.resource = HttpResource().ready(function(sceneData) {
      var layerDefinitions = sceneData.layerDefinitions;

      return {
        sceneData: sceneData,
        background: ImageResource().fetch(layerDefinitions.background.backgroundUrl)
        //sprite: Sprites(layerDefinitions.entities.sprites)
      };
    });
  }

  load(sceneUri, baseUri) {
    Resource.baseUri = baseUri;
    return this.resource.fetch(sceneUri);
  }

  ready(onSuccess, onError) {
    return this.resource.ready(onSuccess, onError);
  }
}*/
;

module.exports = exports['default'];

},{"../resources/http-resource.js":10,"../resources/image-resource.js":12,"../resources/resource.js":15,"./sprites.js":22}],20:[function(require,module,exports){
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

},{"../scheduler.js":16}],21:[function(require,module,exports){
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

},{"../resources/image-resource.js":12,"./frame-set.js":18}],22:[function(require,module,exports){
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

},{"../common.js":2,"../resources/http-resource.js":10,"../resources/multi-resource.js":13,"./sprite-animation.js":20,"./sprite.js":21}],23:[function(require,module,exports){
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

var _use = require('../engine/injector.js');

var _Scene = require('../engine/world/scene.js');

var _Scene2 = _interopRequireWildcard(_Scene);

var _Scheduler = require('../engine/scheduler.js');

var _Scheduler2 = _interopRequireWildcard(_Scheduler);

var _BackgroundLayer = require('../engine/layers/background-layer.js');

var _BackgroundLayer2 = _interopRequireWildcard(_BackgroundLayer);

var _viewport = require('../viewport.js');

var _viewport2 = _interopRequireWildcard(_viewport);

var Background1 = (function () {
  function Background1(scene) {
    _classCallCheck(this, _Background1);

    var canvasBackground = _Fragment.Fragment('canvas-background');
    var backgroundLayer = new _BackgroundLayer2['default'](canvasBackground);

    _Scheduler2['default'](function () {
      backgroundLayer.draw(_viewport2['default']);
    });

    scene.ready(function (scene1) {
      scene1.background.ready(function (background) {
        backgroundLayer.setBackground(background);
      });
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

  Background1 = _use.use(_Scene2['default'])(Background1) || Background1;
  return Background1;
})();

exports['default'] = Background1;
module.exports = exports['default'];

},{"../engine/fragments.js":4,"../engine/injector.js":5,"../engine/layers/background-layer.js":7,"../engine/scheduler.js":16,"../engine/world/scene.js":19,"../viewport.js":28}],24:[function(require,module,exports){
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

var _use = require('../engine/injector.js');

var _Scene = require('../engine/world/scene.js');

var _Scene2 = _interopRequireWildcard(_Scene);

var _Scheduler = require('../engine/scheduler.js');

var _Scheduler2 = _interopRequireWildcard(_Scheduler);

var _CollisionLayer = require('../engine/layers/collision-layer.js');

var _CollisionLayer2 = _interopRequireWildcard(_CollisionLayer);

var _viewport = require('../viewport.js');

var _viewport2 = _interopRequireWildcard(_viewport);

var Collision1 = (function () {
  function Collision1(scene) {
    _classCallCheck(this, _Collision1);

    var canvasColliders = _Fragment.Fragment('canvas-colliders');
    var collisionLayer = new _CollisionLayer2['default'](canvasColliders);

    _Scheduler2['default'](function () {
      collisionLayer.draw(_viewport2['default']);
    });

    scene.ready(function (scene) {
      collisionLayer.setColliders(scene.sceneData.layerDefinitions.collisions.colliders);
    });

    this.collisionLayer = collisionLayer;
  }

  var _Collision1 = Collision1;

  _createClass(_Collision1, [{
    key: 'layer',
    get: function () {
      return this.collisionLayer;
    }
  }]);

  Collision1 = _use.use(_Scene2['default'])(Collision1) || Collision1;
  return Collision1;
})();

exports['default'] = Collision1;
module.exports = exports['default'];

},{"../engine/fragments.js":4,"../engine/injector.js":5,"../engine/layers/collision-layer.js":8,"../engine/scheduler.js":16,"../engine/world/scene.js":19,"../viewport.js":28}],25:[function(require,module,exports){
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

var _use = require('../engine/injector.js');

var _Fragment = require('../engine/fragments.js');

var _Scene = require('../engine/world/scene.js');

var _Scene2 = _interopRequireWildcard(_Scene);

var _Scheduler = require('../engine/scheduler.js');

var _Scheduler2 = _interopRequireWildcard(_Scheduler);

var _EntityLayer = require('../engine/layers/entity-layer.js');

var _EntityLayer2 = _interopRequireWildcard(_EntityLayer);

var _viewport = require('../viewport.js');

var _viewport2 = _interopRequireWildcard(_viewport);

var Entity1 = (function () {
  function Entity1(scene) {
    _classCallCheck(this, _Entity1);

    var canvasEntities = _Fragment.Fragment('canvas-entities');
    var entityLayer = new _EntityLayer2['default'](canvasEntities);

    _Scheduler2['default'](function () {
      entityLayer.draw(_viewport2['default']);
    });

    entityLayer.clear();
    scene.ready(function (scene1) {
      scene1.sprite.ready(function (sprite) {
        sprite.animation.play('run');
        entityLayer.addEntity(sprite);
      }, function () {
        console.log('ERROR!!');
      });
    });

    this.entityLayer = entityLayer;
  }

  var _Entity1 = Entity1;

  _createClass(_Entity1, [{
    key: 'layer',
    get: function () {
      return this.entityLayer;
    }
  }]);

  Entity1 = _use.use(_Scene2['default'])(Entity1) || Entity1;
  return Entity1;
})();

exports['default'] = Entity1;
module.exports = exports['default'];

},{"../engine/fragments.js":4,"../engine/injector.js":5,"../engine/layers/entity-layer.js":9,"../engine/scheduler.js":16,"../engine/world/scene.js":19,"../viewport.js":28}],26:[function(require,module,exports){
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

var _use = require('./engine/injector.js');

var _Scene = require('./engine/world/scene.js');

var _Scene2 = _interopRequireWildcard(_Scene);

var _Resource = require('./engine/resources/resource.js');

var _Resource2 = _interopRequireWildcard(_Resource);

var _Background1 = require('./layers/background1.js');

var _Background12 = _interopRequireWildcard(_Background1);

var _Entity1 = require('./layers/entity1.js');

var _Entity12 = _interopRequireWildcard(_Entity1);

var _Collision1 = require('./layers/collision1.js');

var _Collision12 = _interopRequireWildcard(_Collision1);

var Loader = (function () {
  function Loader(backgroundLayer1, entityLayer1, collisionLayer1, scene) {
    _classCallCheck(this, _Loader);

    this.backgroundLayer1 = backgroundLayer1;
    this.entityLayer1 = entityLayer1;
    this.collisionLayer1 = collisionLayer1;
    this.scene = scene;
  }

  var _Loader = Loader;

  _createClass(_Loader, [{
    key: 'getScene',
    value: function getScene(sceneFile, baseDir) {
      _Resource2['default'].baseUri = baseDir;
      //this.scene.load(sceneFile, baseDir);
      this.scene.fetch(sceneFile);
    }
  }]);

  Loader = _use.use(_Background12['default'], _Entity12['default'], _Collision12['default'], _Scene2['default'])(Loader) || Loader;
  return Loader;
})();

exports['default'] = Loader;
module.exports = exports['default'];

},{"./engine/injector.js":5,"./engine/resources/resource.js":15,"./engine/world/scene.js":19,"./layers/background1.js":23,"./layers/collision1.js":24,"./layers/entity1.js":25}],27:[function(require,module,exports){
"use strict";

},{}],28:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvbWFpbi5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy9lbmdpbmUvY29tbW9uLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9jb250YWluZXIuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL2ZyYWdtZW50cy5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy9lbmdpbmUvaW5qZWN0b3IuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL2tqYXguanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL2xheWVycy9iYWNrZ3JvdW5kLWxheWVyLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9sYXllcnMvY29sbGlzaW9uLWxheWVyLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9sYXllcnMvZW50aXR5LWxheWVyLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9yZXNvdXJjZXMvaHR0cC1yZXNvdXJjZS5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy9lbmdpbmUvcmVzb3VyY2VzL2ltYWdlLWxvYWRlci5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy9lbmdpbmUvcmVzb3VyY2VzL2ltYWdlLXJlc291cmNlLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9yZXNvdXJjZXMvbXVsdGktcmVzb3VyY2UuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL3Jlc291cmNlcy9yZXNvdXJjZS1yZWdpc3RyeS5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy9lbmdpbmUvcmVzb3VyY2VzL3Jlc291cmNlLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9zY2hlZHVsZXIuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL3V0aWwuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL3dvcmxkL2ZyYW1lLXNldC5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy9lbmdpbmUvd29ybGQvc2NlbmUuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL3dvcmxkL3Nwcml0ZS1hbmltYXRpb24uanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL3dvcmxkL3Nwcml0ZS5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy9lbmdpbmUvd29ybGQvc3ByaXRlcy5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy9sYXllcnMvYmFja2dyb3VuZDEuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvbGF5ZXJzL2NvbGxpc2lvbjEuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvbGF5ZXJzL2VudGl0eTEuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvbG9hZGVyLmpzIiwic3JjL3ZpZXcuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvdmlld3BvcnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztnQ0NJNkIseUNBQXlDOzs7Ozs7Ozs7OzBDQU01Qix1QkFBdUI7Ozs7OztvQkFJaEQsV0FBVzs7OztzQkFDVCxhQUFhOzs7O0FBRWhDLElBQUksT0FBTyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF5RFosNEJBaEVRLGlCQUFpQixFQWdFTixDQUFDOzs7Ozs7QUFNcEIsT0FBTyxHQUFHLFlBQVc7QUFDbkIsU0FBTyw4QkFBaUIsWUFBWSxDQUFDLG1CQUFtQixDQUFDLENBQUM7Q0FDM0QsQ0FBQzs7OztBQUlGLElBQUksTUFBTSxHQUFHLHlCQUFZLENBQUM7QUFDMUIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsRUFBQyxRQUFRLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1FDbEY3QixVQUFVLEdBQVYsVUFBVTtRQUtWLFNBQVMsR0FBVCxTQUFTO1FBS1QsWUFBWSxHQUFaLFlBQVk7UUFPWixXQUFXLEdBQVgsV0FBVztRQVdYLGNBQWMsR0FBZCxjQUFjO1FBb0JkLFNBQVMsR0FBVCxTQUFTO1FBU1QsVUFBVSxHQUFWLFVBQVU7Ozs7UUFXVixtQkFBbUIsR0FBbkIsbUJBQW1COztvQkF4RWxCLFdBQVc7Ozs7QUFJckIsU0FBUyxVQUFVLENBQUMsR0FBRyxFQUFFO0FBQzlCLE1BQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDN0IsU0FBTyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUM1Qjs7QUFFTSxTQUFTLFNBQVMsQ0FBQyxHQUFHLEVBQUU7QUFDN0IsU0FBUSxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxTQUFTLElBQ3ZDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLFVBQVUsQ0FBRTtDQUN2Qzs7QUFFTSxTQUFTLFlBQVksQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFO0FBQ3pDLE1BQUcsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQzdCLFdBQU8sT0FBTyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7R0FDNUI7QUFDRCxTQUFPLEdBQUcsQ0FBQztDQUNaOztBQUVNLFNBQVMsV0FBVyxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLHFCQUFxQixFQUFFO0FBQ2pGLFFBQU0sR0FBRyxNQUFNLElBQUksRUFBRSxDQUFDO0FBQ3RCLGFBQVcsR0FBRyxXQUFXLElBQUksRUFBRSxDQUFDOztBQUVoQyxRQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFTLElBQUksRUFBRTtBQUN6QyxrQkFBYyxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO0dBQzdFLENBQUMsQ0FBQzs7QUFFSCxTQUFPLFdBQVcsQ0FBQztDQUNwQjs7QUFFTSxTQUFTLGNBQWMsQ0FBQyxNQUFNLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUscUJBQXFCLEVBQUU7QUFDMUYsTUFBRyxXQUFXLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQ25DLFFBQUcsU0FBUyxFQUFFO0FBQ1osaUJBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUMvRCx3QkFBSyxHQUFHLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDO0tBQzdDLE1BQU0sSUFBRyxxQkFBcUIsRUFBRTtBQUMvQix3QkFBSyxLQUFLLENBQUMsa0NBQWtDLEdBQzdDLElBQUksR0FBRyw2QkFBNkIsQ0FBQyxDQUFDO0tBQ3ZDLE1BQU07QUFDTCxpQkFBVyxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNqQyx3QkFBSyxHQUFHLENBQUMscUJBQXFCLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDO0tBQy9DO0FBQ0QsV0FBTyxXQUFXLENBQUM7R0FDcEI7O0FBRUQsYUFBVyxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFakMsU0FBTyxXQUFXLENBQUM7Q0FDcEI7O0FBRU0sU0FBUyxTQUFTLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRTtBQUN2QyxNQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDOztBQUU5QyxRQUFNLENBQUMsS0FBSyxHQUFHLEtBQUssSUFBSSxHQUFHLENBQUM7QUFDNUIsUUFBTSxDQUFDLE1BQU0sR0FBRyxNQUFNLElBQUksR0FBRyxDQUFDOztBQUU5QixTQUFPLE1BQU0sQ0FBQztDQUNmOztBQUVNLFNBQVMsVUFBVSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUU7QUFDdkMsU0FBTyxFQUNMLEtBQUssQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsQ0FBQyxJQUMvQixLQUFLLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLENBQUMsSUFDaEMsS0FBSyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFLLElBQy9CLEtBQUssQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFBLEFBQ2pDLENBQUM7Q0FDSDs7QUFJTSxTQUFTLG1CQUFtQixDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUU7QUFDbkQsTUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsVUFBVSxDQUFDO0FBQ2xDLE1BQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUM7QUFDeEIsTUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztBQUMxQixNQUFJLFNBQVMsR0FBRyxLQUFLLENBQ2xCLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FDaEIsWUFBWSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDOztBQUVyQyxNQUFHLFFBQVEsRUFBRTtBQUNYLGNBQVUsR0FBRyxLQUFLLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQzs7QUFFaEMsU0FBSSxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLFVBQVUsRUFBRSxLQUFLLElBQUUsQ0FBQyxFQUFFO0FBQy9DLE9BQUMsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzFCLE9BQUMsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM5QixPQUFDLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDOUIsVUFBRyxDQUFDLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUM5RCxpQkFBUyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO09BQy9CO0tBQ0Y7R0FDRjs7QUFFRCxVQUFRLEdBQUcsU0FBUyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztBQUNwQyxVQUFRLENBQ0wsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUNoQixZQUFZLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzs7QUFFakMsU0FBTyxRQUFRLENBQUM7Q0FDakI7Ozs7Ozs7O1FDN0ZlLGdCQUFnQixHQUFoQixnQkFBZ0I7UUFzQmhCLFFBQVEsR0FBUixRQUFRO1FBdUJSLE9BQU8sR0FBUCxPQUFPOzs7OztBQWhEdkIsSUFBSSxTQUFTLEdBQUcsRUFBRSxDQUFDO0FBQ25CLElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQzs7QUFFYixTQUFTLGdCQUFnQixDQUFFLElBQUksRUFBRSxHQUFHLEVBQUU7QUFDM0MsTUFBSTs7OztBQUlGLFdBQU8sSUFBSSxJQUFJLEVBQUUsQ0FBQztHQUNuQixDQUFDLE9BQU0sQ0FBQyxFQUFFO0FBQ1QsUUFBRyxHQUFHLEVBQUU7QUFDTixhQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ3BCO0FBQ0QsV0FBTyxJQUFJLENBQUM7R0FDYjtDQUNGOztBQUVELFNBQVMsYUFBYSxDQUFFLFdBQVcsRUFBRTtBQUNuQyxNQUFJLE9BQU8sR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLFVBQVMsU0FBUyxFQUFFO0FBQ2xELFdBQVEsV0FBVyxLQUFLLFNBQVMsQ0FBQyxXQUFXLENBQUU7R0FDaEQsQ0FBQyxDQUFDOztBQUVILFNBQU8sQUFBQyxPQUFPLENBQUMsTUFBTSxHQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO0NBQ3REOztBQUVNLFNBQVMsUUFBUSxDQUFFLGVBQWUsRUFBRSxLQUFLLEVBQUU7QUFDaEQsTUFBSSxRQUFRLENBQUM7O0FBRWIsTUFBRyxPQUFPLGVBQWUsS0FBSyxRQUFRLEVBQUU7QUFDdEMsYUFBUyxDQUFDLGVBQWUsQ0FBQyxHQUFHLEtBQUssQ0FBQztBQUNuQyxXQUFPO0dBQ1I7O0FBRUQsTUFBRyxPQUFPLGVBQWUsS0FBSyxVQUFVLEVBQUU7QUFDeEMsV0FBTztHQUNSOzs7QUFHRCxVQUFRLEdBQUcsSUFBSSxlQUFlLEVBQUUsQ0FBQzs7QUFFakMsTUFBSSxRQUFRLEVBQUU7QUFDWixjQUFVLENBQUMsSUFBSSxDQUFDO0FBQ2QsaUJBQVcsRUFBRSxlQUFlO0FBQzVCLGNBQVEsRUFBRSxRQUFRO0tBQ25CLENBQUMsQ0FBQztHQUNKO0NBQ0Y7O0FBRU0sU0FBUyxPQUFPLENBQUUsZUFBZSxFQUFFO0FBQ3hDLE1BQUcsT0FBTyxlQUFlLEtBQUssUUFBUSxFQUFFO0FBQ3RDLFdBQU8sU0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0dBQ25DO0FBQ0QsU0FBTyxhQUFhLENBQUMsZUFBZSxDQUFDLENBQUM7Q0FDdkM7Ozs7Ozs7O1FDMUNlLGdCQUFnQixHQUFoQixnQkFBZ0I7UUFxQmhCLFNBQVMsR0FBVCxTQUFTO1FBWVQsUUFBUSxHQUFSLFFBQVE7UUFJUixpQkFBaUIsR0FBakIsaUJBQWlCOzs7OztBQWhEakMsSUFBSSxlQUFlLENBQUM7O0FBRXBCLFNBQVMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFO0FBQ2pDLE1BQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUM7QUFDcEMsT0FBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsYUFBYSxHQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLGFBQWEsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUN4RSxRQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxNQUFNLEVBQUU7QUFDN0MsYUFBTyxPQUFPLENBQUM7S0FDaEI7R0FDRjtDQUNGOztBQUVNLFNBQVMsZ0JBQWdCLENBQUUsYUFBYSxFQUFFO0FBQy9DLE1BQUksV0FBVztNQUFFLE9BQU87TUFBRSxZQUFZLEdBQUcsRUFBRSxDQUFDOztBQUU1QyxNQUFHLENBQUMsYUFBYSxFQUFFO0FBQ2pCLFFBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNqRCxRQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQ1gsYUFBTyxZQUFZLENBQUM7S0FDckI7QUFDRCxpQkFBYSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztHQUN6Qjs7QUFFRCxhQUFXLEdBQUcsYUFBYSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2xELE9BQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLFdBQVcsR0FBRyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxXQUFXLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDckUsV0FBTyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN6QixRQUFHLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQzVCLGtCQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQzVCO0dBQ0Y7QUFDRCxTQUFPLFlBQVksQ0FBQztDQUNyQjs7QUFFTSxTQUFTLFNBQVMsQ0FBRSxJQUFJLEVBQUU7QUFDL0IsTUFBRyxDQUFDLGVBQWUsRUFBRTtBQUNuQixxQkFBaUIsRUFBRSxDQUFDO0dBQ3JCO0FBQ0QsU0FBTyxlQUFlLENBQUMsTUFBTSxDQUFDLFVBQVMsTUFBTSxFQUFFLE9BQU8sRUFBRTtBQUN0RCxRQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxFQUFFO0FBQ3ZDLFlBQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDdEI7QUFDRCxXQUFPLE1BQU0sQ0FBQztHQUNmLEVBQUUsRUFBRSxDQUFDLENBQUM7Q0FDUjs7QUFFTSxTQUFTLFFBQVEsQ0FBRSxJQUFJLEVBQUU7QUFDOUIsU0FBTyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDM0I7O0FBRU0sU0FBUyxpQkFBaUIsR0FBRztBQUNsQyxpQkFBZSxHQUFHLGdCQUFnQixFQUFFLENBQUM7Q0FDdEM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztRQ21EZSxHQUFHLEdBQUgsR0FBRzs7Ozs7UUFPSCxRQUFRLEdBQVIsUUFBUTs7Ozs7aURBN0cwQixnQkFBZ0I7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBbUNsRSxTQUFTLFFBQVEsQ0FBQyxRQUFRLEVBQUU7QUFDMUIsU0FBTyxVQUFTLE1BQU0sRUFBRTtBQUN0QixZQUFRLEdBQUcsQUFBQyxNQUFNLENBQUMsU0FBUyxHQUMxQixRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FDakMsUUFBUSxDQUFDOztBQUVYLFFBQUcsTUFBTSxDQUFDLE9BQU8sRUFBRTtBQUNqQixZQUFNLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQztLQUN6Qjs7QUFFRCxRQUFJLFNBQVMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztBQUNuRSxhQUFTLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztBQUMzQixhQUFTLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztBQUMvQixXQUFPLFNBQVMsQ0FBQztHQUNsQixDQUFDO0NBQ0g7O0FBRUQsU0FBUyxLQUFLLENBQUMsVUFBVSxFQUFFO0FBQ3pCLFlBQVUsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7O0FBRXBELFNBQU8sUUFBUSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBUyxJQUFJLEVBQUU7QUFDNUMsUUFBSSxNQUFNLEdBQUcsbUNBeERULE9BQU8sQ0F3RFUsSUFBSSxDQUFDLENBQUM7QUFDM0IsUUFBRyxNQUFNLEVBQUU7QUFDVCxhQUFPLE1BQU0sQ0FBQztLQUNmO0FBQ0QsUUFBRyxPQUFPLElBQUksS0FBSyxRQUFRLEVBQUU7QUFDM0IseUNBN0RXLFFBQVEsQ0E2RFYsSUFBSSxDQUFDLENBQUM7QUFDZixhQUFPLG1DQTlETCxPQUFPLENBOERNLElBQUksQ0FBQyxDQUFDO0tBQ3RCO0dBQ0YsQ0FBQyxDQUFDLENBQUM7Q0FDTDs7QUFFRCxTQUFTLFVBQVUsQ0FBQyxVQUFVLEVBQUU7QUFDOUIsWUFBVSxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFFcEQsU0FBTyxRQUFRLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxVQUFTLElBQUksRUFBRTtBQUM1QyxXQUFPLG1DQXZFZ0IsZ0JBQWdCLENBdUVmLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQztHQUN2QyxDQUFDLENBQUMsQ0FBQztDQUNMO0FBNkJNLFNBQVMsR0FBRyxHQUFHO0FBQ3BCLFNBQU8sS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0NBQ3pCOztBQUtNLFNBQVMsUUFBUSxHQUFHOztBQUV6QixTQUFPLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztDQUM5Qjs7Ozs7QUFBQTs7Ozs7OztRQ2xHZSxVQUFVLEdBQVYsVUFBVTtRQTBDVixLQUFLLEdBQUwsS0FBSztRQUlMLFdBQVcsR0FBWCxXQUFXOzs7O0FBNUQzQixJQUFJLFFBQVEsR0FBRyxFQUFFO0lBQ2YsT0FBTyxHQUFHLEVBQUUsQ0FBQzs7QUFFZixTQUFTLFVBQVUsQ0FBQyxHQUFHLEVBQUU7QUFDdkIsU0FBTyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksbUJBQW1CLENBQUM7Q0FDbkU7O0FBRUQsU0FBUyxhQUFhLENBQUUsV0FBVyxFQUFFLFlBQVksRUFBRTtBQUNqRCxNQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLGtCQUFrQixFQUFFO0FBQ2xELFdBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztHQUNqQztBQUNELFNBQU8sWUFBWSxDQUFDO0NBQ3JCOztBQUVNLFNBQVMsVUFBVSxDQUFDLEdBQUcsRUFBRSx1QkFBdUIsRUFBRSxVQUFVLEVBQUU7QUFDbkUsTUFBSSxPQUFPLENBQUM7O0FBRVosTUFBRyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxTQUFTLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssVUFBVSxFQUFFO0FBQ3BFLE9BQUcsR0FBRyxPQUFPLEdBQUcsR0FBRyxDQUFDO0dBQ3JCOztBQUVELFdBQVMsVUFBVSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUU7QUFDbkMsUUFBSSxHQUFHLEdBQUcsSUFBSSxjQUFjLEVBQUUsQ0FBQzs7QUFFL0IsUUFBSSxVQUFVLENBQUMsdUJBQXVCLENBQUMsRUFBRTtBQUN2QyxnQkFBVSxHQUFHLHVCQUF1QixDQUFDO0FBQ3JDLDZCQUF1QixHQUFHLFNBQVMsQ0FBQztLQUNyQzs7QUFFRCxRQUFJLFVBQVUsRUFBRTtBQUNkLFNBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsVUFBVSxLQUFLLEVBQUU7QUFDaEQsa0JBQVUsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztPQUN2QyxFQUFFLEtBQUssQ0FBQyxDQUFDO0tBQ1g7O0FBRUQsT0FBRyxDQUFDLE9BQU8sR0FBRyxVQUFVLEtBQUssRUFBRTtBQUM3QixZQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztLQUMxQixDQUFDOztBQUVGLE9BQUcsQ0FBQyxNQUFNLEdBQUcsWUFBWTtBQUN2QixVQUFJLFdBQVcsR0FBRyx1QkFBdUIsSUFBSSxJQUFJLENBQUMsaUJBQWlCLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQzFGLEFBQUMsVUFBSSxDQUFDLE1BQU0sSUFBSSxHQUFHLEdBQ2pCLE1BQU0sQ0FBQyxFQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFDLENBQUMsR0FDMUQsT0FBTyxDQUFDLEVBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQztLQUN2RixDQUFDOztBQUVGLE9BQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUMzQixPQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7R0FDWjs7QUFFRCxTQUFPLEdBQUcsSUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDbEMsVUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFFdkIsU0FBTyxPQUFPLENBQUM7Q0FDaEI7O0FBRU0sU0FBUyxLQUFLLEdBQUc7QUFDdEIsVUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7Q0FDckI7O0FBRU0sU0FBUyxXQUFXLEdBQUc7QUFDNUIsU0FBTyxRQUFRLENBQUM7Q0FDakI7O0FBRUQsU0FBUyxVQUFVLENBQUMsR0FBRyxFQUFFO0FBQ3ZCLFNBQU8sR0FBRyxHQUFHLENBQUM7Q0FDZjs7cUJBRWM7QUFDYixZQUFVLEVBQUUsVUFBVTtBQUN0QixPQUFLLEVBQUUsS0FBSztBQUNaLFlBQVUsRUFBRSxVQUFVO0FBQ3RCLGFBQVcsRUFBRSxXQUFXO0NBQ3pCOzs7Ozs7Ozs7Ozs7Ozs7OztJQ3ZFb0IsZUFBZTtBQUN0QixXQURPLGVBQWUsQ0FDckIsTUFBTSxFQUFFOzBCQURGLGVBQWU7O0FBRWhDLFFBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQ3JCLFFBQUksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUMxQzs7ZUFKa0IsZUFBZTs7V0FNcEIsdUJBQUMsS0FBSyxFQUFFO0FBQ3BCLFVBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO0FBQ3hCLGFBQU8sSUFBSSxDQUFDO0tBQ2I7OztXQUVJLGNBQUMsUUFBUSxFQUFFO0FBQ2QsVUFBRyxDQUFDLFFBQVEsRUFBRTtBQUNaLGVBQU87T0FDUjs7QUFFRCxVQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBRXRFLFVBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRTtBQUNsQixZQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FDdEIsSUFBSSxDQUFDLFVBQVUsRUFDZixRQUFRLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLEVBQ3RCLFFBQVEsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLE1BQU0sRUFDL0IsQ0FBQyxFQUFFLENBQUMsRUFDSixRQUFRLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQ2hDLENBQUM7T0FDSDs7QUFFRCxhQUFPLElBQUksQ0FBQztLQUNiOzs7V0FFUSxvQkFBRztBQUNWLGFBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztLQUNwQjs7O1NBakNrQixlQUFlOzs7cUJBQWYsZUFBZTs7Ozs7Ozs7Ozs7Ozs7Ozs7OzBCQ0FYLGNBQWM7O0FBRXZDLElBQU0sZUFBZSxHQUFHLFNBQVMsQ0FBQztBQUNsQyxJQUFNLGFBQWEsR0FBRyxTQUFTLENBQUM7O0lBRVgsY0FBYztBQUNyQixXQURPLGNBQWMsQ0FDcEIsTUFBTSxFQUFFOzBCQURGLGNBQWM7O0FBRS9CLFFBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO0FBQ3BCLFFBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO0FBQ25CLFFBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQ3JCLFFBQUksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUMxQzs7ZUFOa0IsY0FBYzs7OztXQVNyQixxQkFBQyxLQUFLLEVBQUU7QUFDbEIsVUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7S0FDdkI7OztXQUVZLHNCQUFDLEtBQUssRUFBRTtBQUNuQixVQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztLQUN4Qjs7O1dBRUksY0FBQyxRQUFRLEVBQUU7QUFDZCxVQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDOztBQUUvQixVQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDdEUsVUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsZUFBZSxDQUFDOztBQUU3QyxVQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFTLFFBQVEsRUFBRTtBQUN4QyxZQUFHLENBQUMsWUE3QkYsVUFBVSxDQTZCRyxRQUFRLEVBQUUsUUFBUSxDQUFDLEVBQUU7QUFDbEMsaUJBQU87U0FDUjtBQUNELGlCQUFTLENBQUMsVUFBVSxDQUNsQixRQUFRLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLEVBQ3ZCLFFBQVEsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsRUFDdkIsUUFBUSxDQUFDLEtBQUssRUFDZCxRQUFRLENBQUMsTUFBTSxDQUNoQixDQUFDO09BQ0gsQ0FBQyxDQUFDOztBQUVILGVBQVMsQ0FBQyxXQUFXLEdBQUcsYUFBYSxDQUFDO0FBQ3RDLFVBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFVBQVMsTUFBTSxFQUFFO0FBQ3JDLFlBQUcsQ0FBQyxZQTFDRixVQUFVLENBMENHLE1BQU0sRUFBRSxRQUFRLENBQUMsRUFBRTtBQUNoQyxpQkFBTztTQUNSO0FBQ0QsaUJBQVMsQ0FBQyxVQUFVLENBQ2xCLE1BQU0sQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsRUFDckIsTUFBTSxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxFQUNyQixNQUFNLENBQUMsS0FBSyxFQUNaLE1BQU0sQ0FBQyxNQUFNLENBQ2QsQ0FBQztPQUNILENBQUMsQ0FBQztBQUNILGFBQU8sSUFBSSxDQUFDO0tBQ2I7OztXQUVRLG9CQUFHO0FBQ1YsYUFBTyxJQUFJLENBQUMsTUFBTSxDQUFDO0tBQ3BCOzs7U0FwRGtCLGNBQWM7OztxQkFBZCxjQUFjOzs7Ozs7Ozs7Ozs7Ozs7Ozs7MEJDTFYsY0FBYzs7SUFFbEIsV0FBVztBQUNuQixXQURRLFdBQVcsQ0FDbEIsTUFBTSxFQUFFOzBCQURELFdBQVc7O0FBRTVCLFFBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO0FBQ25CLFFBQUksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QyxRQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztHQUN0Qjs7ZUFMa0IsV0FBVzs7V0FPcEIsbUJBQUMsTUFBTSxFQUFFO0FBQ2pCLFVBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzNCLGFBQU8sSUFBSSxDQUFDO0tBQ2I7OztXQUVLLGlCQUFHO0FBQ1AsVUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQ3pCLGFBQU8sSUFBSSxDQUFDO0tBQ2I7OztXQUVJLGNBQUMsUUFBUSxFQUFFO0FBQ2QsVUFBSSxNQUFNLEVBQUUsS0FBSyxDQUFDOztBQUVsQixVQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBRXRFLFdBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLFdBQVcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsV0FBVyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3ZFLGNBQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUUxQixZQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRTtBQUNwQixtQkFBUztTQUNWOztBQUVELFlBQUcsQ0FBQyxZQS9CRixVQUFVLENBK0JHLE1BQU0sRUFBRSxRQUFRLENBQUMsRUFBRTtBQUNoQyxtQkFBUztTQUNWOztBQUVELGFBQUssR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ3BDLFlBQUcsS0FBSyxFQUFFO0FBQ1IsY0FBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQ3RCLEtBQUssRUFDTCxNQUFNLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUMxQixNQUFNLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUMzQixDQUFDO1NBQ0g7T0FDRjs7QUFFRCxhQUFPLElBQUksQ0FBQztLQUNiOzs7V0FFUSxvQkFBRztBQUNWLGFBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztLQUNwQjs7O1NBaERrQixXQUFXOzs7cUJBQVgsV0FBVzs7Ozs7Ozs7Ozs7Ozs7OztvQkNGZixZQUFZOzs7OzBCQUNKLFlBQVk7O3dCQUNoQixlQUFlOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztxQkFxQnJCLFVBQVMsR0FBRyxFQUFFO0FBQzNCLFNBQU8sa0NBdkJELFVBQVUsRUF1QlksR0FBRyxDQUFDLENBQzdCLEtBQUssQ0FBQyxVQUFTLFFBQVEsRUFBRTtBQUN4QixXQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUM7R0FDdEIsQ0FBQyxDQUFDO0NBQ047O0FBQUEsQ0FBQzs7Ozs7Ozs7O1FDWGMsUUFBUSxHQUFSLFFBQVE7Ozs7O0FBbEJ4QixJQUFJLG1CQUFtQixHQUFHLEdBQUcsQ0FBQzs7QUFFOUIsU0FBUyxZQUFZLENBQUUsS0FBSyxFQUFFO0FBQzVCLFNBQU8sSUFBSSxPQUFPLENBQUMsVUFBUyxPQUFPLEVBQUUsTUFBTSxFQUFFO0FBQzNDLFFBQUksVUFBVSxHQUFHLFdBQVcsQ0FBQyxZQUFXO0FBQ3RDLFVBQUcsS0FBSyxDQUFDLFFBQVEsRUFBRTtBQUNqQixxQkFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzFCLGVBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztPQUNoQjtLQUNGLEVBQUUsbUJBQW1CLENBQUMsQ0FBQzs7QUFFeEIsU0FBSyxDQUFDLE9BQU8sR0FBRyxZQUFZO0FBQzFCLG1CQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDMUIsWUFBTSxFQUFFLENBQUM7S0FDVixDQUFDO0dBQ0gsQ0FBQyxDQUFDO0NBQ0o7O0FBRU0sU0FBUyxRQUFRLENBQUUsR0FBRyxFQUFFO0FBQzdCLE1BQUksS0FBSyxFQUFFLE9BQU8sQ0FBQzs7QUFFbkIsT0FBSyxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7QUFDcEIsT0FBSyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7O0FBRWhCLFNBQU8sR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRTlCLFNBQU8sT0FBTyxDQUFDO0NBQ2hCOzs7Ozs7Ozs7Ozs7Ozs7d0JDMUJvQixlQUFlOzs7O3dCQUNiLG1CQUFtQjs7cUJBRTNCLFVBQVUsR0FBRyxFQUFFO0FBQzVCLFNBQU8sZ0NBSEQsUUFBUSxFQUdZLEdBQUcsQ0FBQyxDQUFDO0NBQ2hDOztBQUFBLENBQUM7Ozs7Ozs7Ozs7Ozs7OztvQkNOZSxZQUFZOzs7O3FCQUVkLFVBQVUsT0FBTyxFQUFFO0FBQ2hDLE1BQUksZ0JBQWdCLEdBQUcsRUFBRTtNQUN2QixjQUFjLEdBQUcsRUFBRTtNQUNuQixhQUFhLEdBQUc7QUFDZCxTQUFLLEVBQUUsS0FBSztBQUNaLFFBQUksRUFBRSxJQUFJO0dBQ1gsQ0FBQzs7QUFFSixXQUFTLEtBQUssQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFO0FBQ2pDLFFBQUcsa0JBQUssT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFO0FBQzFCLHNCQUFnQixHQUFHLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUN2RCxNQUFNO0FBQ0wsc0JBQWdCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0tBQ2xDOztBQUVELFFBQUcsa0JBQUssT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ3hCLG9CQUFjLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUNqRCxNQUFNO0FBQ0wsb0JBQWMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDOUI7O0FBRUQsV0FBTyxhQUFhLENBQUM7R0FDdEI7O0FBRUQsV0FBUyxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQ3RCLGNBQVUsQ0FBQyxZQUFXOztBQUNwQixhQUFPLENBQUMsT0FBTyxDQUFDLFVBQVMsTUFBTSxFQUFFO0FBQy9CLFlBQUksUUFBUSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNoQyxnQkFBUSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxjQUFjLENBQUMsQ0FBQztPQUNsRCxDQUFDLENBQUM7S0FDSixFQUFFLENBQUMsQ0FBQyxDQUFDOztBQUVOLFdBQU8sYUFBYSxDQUFDO0dBQ3RCOztBQUVELFNBQU8sYUFBYSxDQUFDO0NBQ3RCOzs7Ozs7Ozs7Ozs7Ozs7QUNyQ0QsSUFBSSxTQUFTLEdBQUcsRUFBRSxDQUFDOztBQUVuQixTQUFTLFFBQVEsQ0FBRSxRQUFRLEVBQUU7QUFDM0IsTUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQzs7QUFFN0IsTUFBRyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRTtBQUNyQixhQUFTLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO0dBQ3hCOztBQUVELFdBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7Q0FDbEM7O0FBRUQsU0FBUyxZQUFZLENBQUUsTUFBTSxFQUFFO0FBQzdCLE1BQUcsQ0FBQyxNQUFNLEVBQUU7QUFDVixXQUFPLFNBQVMsQ0FBQztHQUNsQjs7QUFFRCxTQUFPLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztDQUMxQjs7cUJBRWM7QUFDYixVQUFRLEVBQUUsUUFBUTtBQUNsQixjQUFZLEVBQUUsWUFBWTtDQUMzQjs7Ozs7Ozs7Ozs7Ozs7OztvQkN2QmdCLFlBQVk7Ozs7Z0NBQ0Esd0JBQXdCOzs7O3lCQUM3QixjQUFjOzs7QUFHdEMsU0FBUyxRQUFRLENBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRTtBQUNqQyxNQUFJLGdCQUFnQixHQUFHLEVBQUU7TUFDdkIsY0FBYyxHQUFHLEVBQUU7TUFDbkIsUUFBUSxHQUFHO0FBQ1QsU0FBSyxFQUFFLEtBQUs7QUFDWixTQUFLLEVBQUUsS0FBSztBQUNaLFdBQU8sRUFBRSxJQUFJO0FBQ2IsVUFBTSxFQUFFLE1BQU07R0FDZixDQUFDOztBQUVKLE1BQUcsQ0FBQyxrQkFBSyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUU7QUFDM0IsV0FBTztHQUNSOztBQUVELFdBQVMsS0FBSyxDQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUU7QUFDbEMsUUFBRyxrQkFBSyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUU7QUFDMUIsc0JBQWdCLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0tBQ3ZELE1BQU07QUFDTCxzQkFBZ0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7S0FDbEM7O0FBRUQsUUFBRyxrQkFBSyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDeEIsb0JBQWMsR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQ2pELE1BQU07QUFDTCxvQkFBYyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUM5Qjs7QUFFRCxXQUFPLFFBQVEsQ0FBQztHQUNqQjs7QUFFRCxXQUFTLFNBQVMsQ0FBRSxNQUFNLEVBQUUsS0FBSyxFQUFFO0FBQ2pDLFFBQUksZUFBZSxHQUFHLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzlDLFFBQUcsQ0FBQyxlQUFlLEVBQUU7QUFDbkIsVUFBRyxLQUFLLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxFQUFFO0FBQUUsZUFBTyxDQUFDLE1BQU0sRUFBRSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7T0FBRTtBQUNuRSxhQUFPO0tBQ1I7O0FBRUQsUUFBSSxTQUFTLEdBQUcsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3hDLFFBQUcsU0FBUyxJQUFJLFNBQVMsQ0FBQyxLQUFLLEVBQUU7QUFDL0IsZUFBUyxDQUFDLEtBQUssQ0FBQyxVQUFVLE1BQU0sRUFBRTtBQUNoQyxpQkFBUyxDQUFDLE1BQU0sRUFBRSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7T0FDOUIsRUFBRSxVQUFVLE1BQU0sRUFBRTtBQUNuQixlQUFPLENBQUMsTUFBTSxFQUFFLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztPQUM1QixDQUFDLENBQUM7QUFDSCxhQUFPO0tBQ1IsTUFBTSxJQUFHLENBQUMsU0FBUyxFQUFFO0FBQ3BCLGVBQVMsR0FBRyxNQUFNLENBQUM7S0FDcEI7QUFDRCxhQUFTLENBQUMsU0FBUyxFQUFFLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztHQUNqQzs7QUFFRCxXQUFTLE9BQU8sQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFO0FBQzlCLFFBQUksYUFBYSxHQUFHLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMxQyxRQUFHLENBQUMsYUFBYSxFQUFFO0FBQ2pCLFVBQUcsS0FBSyxHQUFHLGNBQWMsQ0FBQyxNQUFNLEVBQUU7QUFBRSxlQUFPLENBQUMsTUFBTSxFQUFFLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztPQUFFO0FBQ2pFLGFBQU87S0FDUjs7QUFFRCxVQUFNLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQy9CLFFBQUcsTUFBTSxJQUFJLE1BQU0sQ0FBQyxLQUFLLEVBQUU7QUFDekIsWUFBTSxDQUFDLEtBQUssQ0FBQyxZQUFXO0FBQ3RCLGlCQUFTLENBQUMsTUFBTSxFQUFFLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztPQUM5QixFQUFFLFVBQVMsTUFBTSxFQUFFO0FBQ2xCLGVBQU8sQ0FBQyxNQUFNLEVBQUUsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO09BQzVCLENBQUMsQ0FBQztBQUNILGFBQU87S0FDUjtBQUNELFdBQU8sQ0FBQyxNQUFNLEVBQUUsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO0dBQzVCOztBQUVELFdBQVMsS0FBSyxDQUFFLE1BQU0sRUFBRTtBQUN0QixRQUFJLE9BQU8sQ0FBQzs7QUFFWixRQUFHLFFBQVEsQ0FBQyxPQUFPLEVBQUU7QUFDbkIsVUFBRyxDQUFDLFdBN0VGLFNBQVMsQ0E2RUcsTUFBTSxDQUFDLEVBQUU7QUFDckIsY0FBTSxHQUFHLFFBQVEsQ0FBQyxPQUFPLEdBQUcsR0FBRyxHQUFHLE1BQU0sQ0FBQztPQUMxQztLQUNGOztBQUVELFdBQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBRXpCLFFBQUcsQ0FBQyxrQkFBSyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFO0FBQzNDLHdCQUFLLEtBQUssQ0FBQywyREFBMkQsQ0FBQyxDQUFDO0tBQ3pFOztBQUVELFlBQVEsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQ3pCLFlBQVEsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FDN0IsVUFBUyxNQUFNLEVBQUU7QUFDZixlQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQ3RCLEVBQ0QsVUFBUyxNQUFNLEVBQUU7QUFDZixhQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQ3BCLENBQ0YsQ0FBQzs7QUFFRixXQUFPLFFBQVEsQ0FBQztHQUNqQjs7QUFFRCxnQ0FBaUIsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDOzs7QUFHcEMsU0FBTyxBQUFDLE1BQU0sR0FBSSxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLFFBQVEsQ0FBQztDQUNyRDs7QUFFRCxRQUFRLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQzs7cUJBRVAsUUFBUTs7Ozs7Ozs7Ozs7Ozs7Ozs7b0JDOUdOLFdBQVc7Ozs7MkJBQ0YsYUFBYTs7QUFFdkMsSUFBSSxRQUFRLENBQUM7QUFDYixJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUM7O0FBRXRCLFNBQVMsU0FBUyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUU7QUFDM0IsTUFBRyxDQUFDLFFBQVEsRUFBRTtBQUNaLFlBQVEsR0FBRyxNQUFNLEVBQUUsQ0FBQztHQUNyQjtBQUNELE1BQUcsRUFBRSxFQUFFO0FBQ0wsWUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7R0FDN0I7QUFDRCxTQUFPLFFBQVEsQ0FBQztDQUNqQjs7QUFFRCxTQUFTLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQzs7QUFFNUIsU0FBUyxNQUFNLEdBQUc7QUFDaEIsU0FBTyxhQWxCRCxXQUFXLENBa0JFO0FBQ2pCLGFBQVMsRUFBRSxFQUFFO0FBQ2IsWUFBUSxFQUFFLFFBQVE7QUFDbEIsY0FBVSxFQUFFLFVBQVU7QUFDdEIsU0FBSyxFQUFFLEtBQUs7QUFDWixRQUFJLEVBQUUsSUFBSTtBQUNWLFNBQUssRUFBRSxLQUFLO0FBQ1osTUFBRSxFQUFFLEVBQUU7R0FDUCxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7Q0FDWjs7QUFFRCxTQUFTLFFBQVEsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFO0FBQzFCLFdBQVMsT0FBTyxDQUFDLE9BQU8sRUFBRTtBQUN4QixRQUFJLEdBQUcsT0FBTyxDQUFDO0dBQ2hCOztBQUVELFdBQVMsU0FBUyxHQUFHO0FBQ25CLFFBQUksS0FBSyxHQUFHLENBQUM7UUFDWCxjQUFjLEdBQUcsQ0FBQyxDQUFDOztBQUVyQixXQUFPLFVBQVMsU0FBUyxFQUFFO0FBQ3pCLG9CQUFjLElBQUksU0FBUyxDQUFDO0FBQzVCLFVBQUcsS0FBSyxLQUFLLElBQUksRUFBRTtBQUNqQixhQUFLLEVBQUUsQ0FBQztBQUNSLGVBQU87T0FDUjtBQUNELFFBQUUsQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDNUIsV0FBSyxHQUFHLENBQUMsQ0FBQztBQUNWLG9CQUFjLEdBQUcsQ0FBQyxDQUFDO0tBQ3BCLENBQUM7R0FDSDs7QUFFRCxNQUFHLENBQUMsa0JBQUssVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ3ZCLHNCQUFLLEtBQUssQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDO0dBQzNEO0FBQ0QsTUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLENBQUM7O0FBRWpCLE1BQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7O0FBRWpDLFNBQU8sSUFBSSxDQUFDO0NBQ2I7O0FBRUQsU0FBUyxFQUFFLEdBQUc7QUFDWixTQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDO0NBQzlCOztBQUVELFNBQVMsVUFBVSxDQUFDLEVBQUUsRUFBRTtBQUN0QixNQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2pDLFNBQU8sSUFBSSxDQUFDO0NBQ2I7O0FBRUQsU0FBUyxLQUFLLEdBQUc7QUFDZixNQUFHLElBQUksQ0FBQyxPQUFPLEVBQUU7QUFDZixXQUFPLElBQUksQ0FBQztHQUNiOztBQUVELGVBMUVNLFdBQVcsQ0EwRUw7QUFDVixhQUFTLEVBQUUsQ0FBQztBQUNaLFNBQUssRUFBRSxDQUFDO0FBQ1Isa0JBQWMsRUFBRSxDQUFDO0FBQ2pCLFdBQU8sRUFBRSxJQUFJO0FBQ2Isa0JBQWMsRUFBRSxJQUFJLElBQUksRUFBRTtBQUMxQixvQkFBZ0IsRUFBRSxNQUFNLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsVUFBVSxDQUFDO0dBQ3pFLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRVQsU0FBTyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7Q0FDckI7O0FBRUQsU0FBUyxJQUFJLEdBQUc7QUFDZCxNQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztBQUNyQixRQUFNLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQzVDLFFBQU0sQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzs7QUFFbkQsU0FBTyxJQUFJLENBQUM7Q0FDYjs7QUFFRCxTQUFTLEtBQUssR0FBRztBQUNmLE1BQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUMxQixTQUFPLElBQUksQ0FBQztDQUNiOztBQUVELFNBQVMsS0FBSyxHQUFHO0FBQ2YsdUJBQXFCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzVELE1BQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQzs7QUFFYixNQUFHLElBQUksQ0FBQyxPQUFPLEVBQUU7QUFDZixRQUFJLENBQUMsZ0JBQWdCLEdBQUcsTUFBTSxDQUFDLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztHQUN4RTs7QUFFRCxTQUFPLElBQUksQ0FBQztDQUNiOztBQUVELFNBQVMsV0FBVyxHQUFHO0FBQ3JCLE1BQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUM1QixNQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztBQUNmLE1BQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztDQUN2Qjs7QUFFRCxTQUFTLHFCQUFxQixDQUFDLFNBQVMsRUFBRTtBQUN4QyxNQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDOztBQUUvQixPQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxZQUFZLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsWUFBWSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3JFLGFBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztHQUN6QjtDQUNGOztBQUVELFNBQVMsWUFBWSxHQUFHO0FBQ3RCLE1BQUksR0FBRyxHQUFHLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztBQUN0QixNQUFJLFNBQVMsR0FBRyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFBLEdBQUksVUFBVSxDQUFDOztBQUV6RCxNQUFJLENBQUMsY0FBYyxHQUFHLEdBQUcsQ0FBQzs7QUFFMUIsU0FBTyxTQUFTLENBQUM7Q0FDbEI7O3FCQUVjLFNBQVM7Ozs7Ozs7Ozs7Ozs7QUN4SXhCLElBQUksS0FBSyxHQUFHLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQzs7QUFFMUcsSUFBSSxJQUFJLEdBQUc7QUFDVCxXQUFTLEVBQUUsbUJBQVUsS0FBSyxFQUFFO0FBQUUsV0FBTyxPQUFPLEtBQUssSUFBSSxXQUFXLENBQUE7R0FBRTtBQUNsRSxLQUFHLEVBQUUsYUFBVSxLQUFLLEVBQUUsWUFBWSxFQUFFO0FBQUUsV0FBTyxBQUFDLE9BQU8sS0FBSyxJQUFJLFdBQVcsR0FBSSxZQUFZLEdBQUcsS0FBSyxDQUFBO0dBQUU7QUFDbkcsT0FBSyxFQUFFLGVBQVUsT0FBTyxFQUFFO0FBQUUsVUFBTSxJQUFJLEtBQUssQ0FBQyxFQUFFLEdBQUcsSUFBSSxHQUFHLE9BQU8sQ0FBQyxDQUFBO0dBQUU7QUFDbEUsTUFBSSxFQUFFLGNBQVUsT0FBTyxFQUFFO0FBQUUsUUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLENBQUE7R0FBRTtBQUM1RCxLQUFHLEVBQUUsYUFBVSxPQUFPLEVBQUU7QUFBRSxRQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUU7QUFBRSxhQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxJQUFJLEdBQUcsT0FBTyxDQUFDLENBQUE7S0FBRTtHQUFFO0FBQy9FLGFBQVcsRUFBRSxxQkFBVSxJQUFJLEVBQUU7QUFBRSxXQUFPLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtHQUFFO0FBQ3hFLE1BQUksRUFBRSxjQUFVLEdBQUcsRUFBRSxHQUFHLEVBQUU7O0FBQ3hCLE9BQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDO0FBQ2YsUUFBRyxHQUFHLEdBQUcsR0FBRyxFQUFFO0FBQUUsVUFBSSxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0tBQUU7QUFDckQsV0FBTyxJQUFJLENBQUMsS0FBSyxDQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQSxBQUFDLENBQUUsR0FBSSxHQUFHLEFBQUMsQ0FBQztHQUM5RDtDQUNGLENBQUM7O0FBRUYsS0FBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDcEMsTUFBSSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVMsSUFBSSxFQUFFO0FBQ3RDLFdBQU8sVUFBUyxHQUFHLEVBQUU7QUFDbkIsYUFBTyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksVUFBVSxHQUFHLElBQUksR0FBRyxHQUFHLENBQUM7S0FDdkUsQ0FBQztHQUNILENBQUEsQ0FBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUNkOztxQkFFYyxJQUFJOzs7Ozs7Ozs7Ozs7Ozs2Q0N2QjBCLGNBQWM7O0FBRTNELElBQU0sWUFBWSxHQUFHLENBQUMsQ0FBQzs7QUFFdkIsU0FBUyxrQkFBa0IsQ0FBQyxrQkFBa0IsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFO0FBQ3RFLE1BQUksVUFBVSxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUM7QUFDakMsTUFBSSxXQUFXLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQzs7QUFFbkMsU0FBTztBQUNMLFFBQUksRUFBRSxrQkFBa0IsQ0FBQyxJQUFJLElBQUksWUFBWTtBQUM3QyxVQUFNLEVBQUUsa0JBQWtCLENBQUMsTUFBTSxDQUM5QixHQUFHLENBQUMsVUFBUyxlQUFlLEVBQUU7QUFDN0IsVUFBSSxLQUFLLEdBQUcsK0JBWlosU0FBUyxDQVlhLFVBQVUsRUFBRSxXQUFXLENBQUMsQ0FBQzs7QUFFL0MsV0FBSyxDQUNGLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FDaEIsU0FBUyxDQUNSLFdBQVcsRUFDWCxlQUFlLENBQUMsQ0FBQyxFQUFFLGVBQWUsQ0FBQyxDQUFDLEVBQ3BDLFVBQVUsRUFBRSxXQUFXLEVBQ3ZCLENBQUMsRUFBRSxDQUFDLEVBQ0osVUFBVSxFQUFFLFdBQVcsQ0FDeEIsQ0FBQzs7QUFFSixhQUFPLEtBQUssQ0FBQztLQUNkLENBQUM7R0FDTCxDQUFDO0NBQ0g7O3FCQUVjLFVBQVUsZ0JBQWdCLEVBQUUsV0FBVyxFQUFFO0FBQ3RELFNBQU8sTUFBTSxDQUNWLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FDL0IsTUFBTSxDQUFDLFVBQVMsUUFBUSxFQUFFLFVBQVUsRUFBRTtBQUNyQyxRQUFJLGFBQWEsR0FBRyxrQkFBa0IsQ0FDcEMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUNyQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQzFCLFdBQVcsQ0FDWixDQUFDOztBQUVGLGlCQUFhLENBQUMsTUFBTSxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQ3hDLEdBQUcsQ0FBQyxVQUFTLEtBQUssRUFBRTtBQUNuQixhQUFPLCtCQXpDRSxtQkFBbUIsQ0F5Q0QsZ0JBQWdCLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDdEUsQ0FBQyxDQUFDOztBQUVMLFlBQVEsQ0FBQyxVQUFVLENBQUMsR0FBRyxhQUFhLENBQUM7O0FBRXJDLFdBQU8sUUFBUSxDQUFDO0dBQ2pCLEVBQUUsRUFBRSxDQUFDLENBQUM7Q0FDVjs7QUFBQSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7NEJDakR1QiwrQkFBK0I7Ozs7NkJBQzlCLGdDQUFnQzs7Ozt1QkFDdEMsY0FBYzs7Ozt3QkFDYiwwQkFBMEI7Ozs7cUJBRWhDLFVBQVUsUUFBUSxFQUFFOzs7QUFHakMsU0FBTywwQkFBYSxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBUyxTQUFTLEVBQUU7QUFDdEQsUUFBSSxnQkFBZ0IsR0FBRyxTQUFTLENBQUMsZ0JBQWdCLENBQUM7O0FBRWxELFdBQU87QUFDTCxlQUFTLEVBQUUsU0FBUztBQUNwQixnQkFBVSxFQUFFLDJCQUFjLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUM7QUFDcEUsWUFBTSxFQUFFLHFCQUFRLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUM7S0FDbkQsQ0FBQztHQUNILENBQUMsQ0FBQztDQUNKOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7Ozs7Ozs7Ozs7Ozt5QkNyQnFCLGlCQUFpQjs7OztxQkFFeEIsVUFBVSxRQUFRLEVBQUU7QUFDakMsTUFBSSxvQkFBb0IsR0FBRyxJQUFJO01BQzdCLGlCQUFpQixHQUFHLENBQUM7TUFDckIsWUFBWSxHQUFHLElBQUk7TUFDbkIsYUFBYSxHQUFHLElBQUksQ0FBQzs7QUFFdkIsTUFBSSxXQUFXLEdBQUcsdUJBQVUsVUFBUyxTQUFTLEVBQUUsT0FBTyxFQUFFO0FBQ3ZELFFBQUcsQ0FBQyxvQkFBb0IsRUFBRTtBQUN4QixhQUFPO0tBQ1I7O0FBRUQsUUFBRyxDQUFDLFlBQVksRUFBRTtBQUNoQixhQUFPLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDcEM7O0FBRUQsZ0JBQVksR0FBRyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtBQUM3RCxRQUFHLGFBQWEsRUFBRTtBQUNoQixtQkFBYSxDQUFDLFlBQVksQ0FBQyxDQUFDO0tBQzdCOztBQUVELFFBQUcsRUFBRSxpQkFBaUIsSUFBSSxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO0FBQzVELHVCQUFpQixHQUFHLENBQUMsQ0FBQztLQUN2QjtHQUNGLENBQUMsQ0FDQyxFQUFFLEVBQUUsQ0FBQzs7QUFFUixTQUFPO0FBQ0wsUUFBSSxFQUFFLGNBQVMsVUFBVSxFQUFFO0FBQ3pCLDBCQUFvQixHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUM1Qyx1QkFBaUIsR0FBRyxDQUFDLENBQUM7QUFDdEIsa0JBQVksR0FBRyxJQUFJLENBQUM7QUFDcEIsYUFBTyxJQUFJLENBQUM7S0FDYjtBQUNELFdBQU8sRUFBRSxpQkFBUyxFQUFFLEVBQUU7QUFDcEIsbUJBQWEsR0FBRyxFQUFFLENBQUM7QUFDbkIsYUFBTyxJQUFJLENBQUM7S0FDYjtBQUNELFFBQUksRUFBRSxnQkFBVztBQUNmLDBCQUFvQixHQUFHLElBQUksQ0FBQztBQUM1QixhQUFPLElBQUksQ0FBQztLQUNiO0FBQ0QsUUFBSSxFQUFFLGdCQUFXO0FBQ2YsZUFBUyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNsQyxhQUFPLElBQUksQ0FBQztLQUNiO0FBQ0QscUJBQWlCOzs7Ozs7Ozs7O09BQUUsWUFBVztBQUM1QixhQUFPLGlCQUFpQixDQUFDO0tBQzFCLENBQUE7QUFDRCxZQUFRLEVBQUUsb0JBQVc7QUFDbkIsYUFBTyxZQUFZLENBQUM7S0FDckI7R0FDRixDQUFDO0NBQ0g7Ozs7Ozs7Ozs7Ozs7Ozs7OzZCQ2pEeUIsZ0NBQWdDOzs7O3dCQUNyQyxnQkFBZ0I7Ozs7cUJBRXRCLFVBQVUsZ0JBQWdCLEVBQUU7QUFDekMsU0FBTywyQkFBYyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsQ0FDbEQsS0FBSyxDQUFDLFVBQVUsV0FBVyxFQUFFO0FBQzVCLFdBQU87QUFDTCxpQkFBVyxFQUFFLFdBQVc7QUFDeEIsZ0JBQVUsRUFBRSxnQkFBZ0I7QUFDNUIsY0FBUSxFQUFFLHNCQUFTLGdCQUFnQixFQUFFLFdBQVcsQ0FBQztLQUNsRCxDQUFDO0dBQ0gsQ0FBQyxDQUFDO0NBQ047O0FBQUEsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7OzsyQkNad0IsY0FBYzs7NEJBQ2YsK0JBQStCOzs7OzZCQUM5QixnQ0FBZ0M7Ozs7c0JBQ3ZDLGFBQWE7Ozs7K0JBQ0osdUJBQXVCOzs7O3FCQUVwQyxVQUFVLFdBQVcsRUFBRTtBQUNwQyxTQUFPLDJCQUFjLFdBQVcsQ0FBQyxDQUM5QixJQUFJLENBQUMsVUFBUyxVQUFVLEVBQUU7QUFDekIsV0FBTywwQkFBYSxVQUFVLENBQUMsR0FBRyxDQUFDOztLQUVoQyxLQUFLLHFCQUFRLENBQ2IsS0FBSyxDQUFDLFVBQVUsTUFBTSxFQUFFO0FBQ3ZCLFlBQU0sR0FBRyxhQWJYLFdBQVcsQ0FhWSxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDekMsWUFBTSxDQUFDLFNBQVMsR0FBRyw2QkFBZ0IsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDOztBQUVwRCxhQUFPLE1BQU0sQ0FBQztLQUNmLENBQUMsQ0FBQztHQUNSLENBQUMsQ0FBQztDQUNKOztBQUFBLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7d0JDcEJxQix3QkFBd0I7O21CQUM3Qix1QkFBdUI7O3FCQUN2QiwwQkFBMEI7Ozs7eUJBQ3RCLHdCQUF3Qjs7OzsrQkFDbEIsc0NBQXNDOzs7O3dCQUM3QyxnQkFBZ0I7Ozs7SUFHaEIsV0FBVztBQUNuQixXQURRLFdBQVcsQ0FDbEIsS0FBSyxFQUFFOzs7QUFDakIsUUFBSSxnQkFBZ0IsR0FBRyxVQVZuQixRQUFRLENBVW9CLG1CQUFtQixDQUFDLENBQUM7QUFDckQsUUFBSSxlQUFlLEdBQUcsaUNBQW9CLGdCQUFnQixDQUFDLENBQUM7O0FBRTVELDJCQUFVLFlBQVk7QUFDcEIscUJBQWUsQ0FBQyxJQUFJLHVCQUFVLENBQUM7S0FDaEMsQ0FBQyxDQUFDOztBQUVILFNBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxNQUFNLEVBQUU7QUFDNUIsWUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsVUFBVSxVQUFVLEVBQUU7QUFDNUMsdUJBQWUsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7T0FDM0MsQ0FBQyxDQUFDO0tBQ0osQ0FBQyxDQUFDOztBQUVILFFBQUksQ0FBQyxlQUFlLEdBQUcsZUFBZSxDQUFDO0dBQ3hDOztxQkFoQmtCLFdBQVc7Ozs7U0FrQnJCLFlBQUc7QUFDVixhQUFPLElBQUksQ0FBQyxlQUFlLENBQUM7S0FDN0I7OztBQXBCa0IsYUFBVyxHQUQvQixLQU5PLEdBQUcsb0JBTUEsQ0FDVSxXQUFXLEtBQVgsV0FBVztTQUFYLFdBQVc7OztxQkFBWCxXQUFXOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O3dCQ1JULHdCQUF3Qjs7bUJBQzdCLHVCQUF1Qjs7cUJBQ3ZCLDBCQUEwQjs7Ozt5QkFDdEIsd0JBQXdCOzs7OzhCQUNuQixxQ0FBcUM7Ozs7d0JBQzNDLGdCQUFnQjs7OztJQUdoQixVQUFVO0FBQ2xCLFdBRFEsVUFBVSxDQUNqQixLQUFLLEVBQUU7OztBQUNqQixRQUFJLGVBQWUsR0FBRyxVQVZsQixRQUFRLENBVW1CLGtCQUFrQixDQUFDLENBQUM7QUFDbkQsUUFBSSxjQUFjLEdBQUcsZ0NBQW1CLGVBQWUsQ0FBQyxDQUFDOztBQUV6RCwyQkFBVSxZQUFZO0FBQ3BCLG9CQUFjLENBQUMsSUFBSSx1QkFBVSxDQUFDO0tBQy9CLENBQUMsQ0FBQzs7QUFFSCxTQUFLLENBQUMsS0FBSyxDQUFDLFVBQVMsS0FBSyxFQUFFO0FBQzFCLG9CQUFjLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0tBQ3BGLENBQUMsQ0FBQzs7QUFFSCxRQUFJLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQztHQUN0Qzs7b0JBZGtCLFVBQVU7Ozs7U0FnQnBCLFlBQUc7QUFDVixhQUFPLElBQUksQ0FBQyxjQUFjLENBQUM7S0FDNUI7OztBQWxCa0IsWUFBVSxHQUQ5QixLQU5PLEdBQUcsb0JBTUEsQ0FDVSxVQUFVLEtBQVYsVUFBVTtTQUFWLFVBQVU7OztxQkFBVixVQUFVOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQ1JiLHVCQUF1Qjs7d0JBQ2xCLHdCQUF3Qjs7cUJBQzdCLDBCQUEwQjs7Ozt5QkFDdEIsd0JBQXdCOzs7OzJCQUN0QixrQ0FBa0M7Ozs7d0JBQ3JDLGdCQUFnQjs7OztJQUdoQixPQUFPO0FBQ2YsV0FEUSxPQUFPLENBQ2QsS0FBSyxFQUFFOzs7QUFDakIsUUFBSSxjQUFjLEdBQUcsVUFUakIsUUFBUSxDQVNrQixpQkFBaUIsQ0FBQyxDQUFDO0FBQ2pELFFBQUksV0FBVyxHQUFHLDZCQUFnQixjQUFjLENBQUMsQ0FBQzs7QUFFbEQsMkJBQVUsWUFBWTtBQUNwQixpQkFBVyxDQUFDLElBQUksdUJBQVUsQ0FBQztLQUM1QixDQUFDLENBQUM7O0FBRUgsZUFBVyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ3BCLFNBQUssQ0FBQyxLQUFLLENBQUMsVUFBUyxNQUFNLEVBQUU7QUFDM0IsWUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsVUFBVSxNQUFNLEVBQUU7QUFDcEMsY0FBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDN0IsbUJBQVcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7T0FDL0IsRUFBRSxZQUFXO0FBQ1osZUFBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQTtPQUN2QixDQUFDLENBQUM7S0FDSixDQUFDLENBQUM7O0FBRUgsUUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7R0FDaEM7O2lCQXBCa0IsT0FBTzs7OztTQXNCakIsWUFBRztBQUNWLGFBQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztLQUN6Qjs7O0FBeEJrQixTQUFPLEdBRDNCLEtBUE8sR0FBRyxvQkFPQSxDQUNVLE9BQU8sS0FBUCxPQUFPO1NBQVAsT0FBTzs7O3FCQUFQLE9BQU87Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJDUlYsc0JBQXNCOztxQkFDdEIseUJBQXlCOzs7O3dCQUN0QixnQ0FBZ0M7Ozs7MkJBQzdCLHlCQUF5Qjs7Ozt1QkFDN0IscUJBQXFCOzs7OzBCQUNsQix3QkFBd0I7Ozs7SUFHMUIsTUFBTTtBQUNkLFdBRFEsTUFBTSxDQUNiLGdCQUFnQixFQUFFLFlBQVksRUFBRSxlQUFlLEVBQUUsS0FBSyxFQUFFOzs7QUFDbEUsUUFBSSxDQUFDLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDO0FBQ3pDLFFBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO0FBQ2pDLFFBQUksQ0FBQyxlQUFlLEdBQUcsZUFBZSxDQUFDO0FBQ3ZDLFFBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0dBQ3BCOztnQkFOa0IsTUFBTTs7OztXQVFqQixrQkFBQyxTQUFTLEVBQUUsT0FBTyxFQUFFO0FBQzNCLDRCQUFTLE9BQU8sR0FBRyxPQUFPLENBQUM7O0FBRTNCLFVBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0tBQzdCOzs7QUFaa0IsUUFBTSxHQUQxQixLQVBPLEdBQUcsNkZBT2tDLENBQ3hCLE1BQU0sS0FBTixNQUFNO1NBQU4sTUFBTTs7O3FCQUFOLE1BQU07Ozs7QUNaM0I7QUFDQTs7Ozs7Ozs7Ozs7cUJDR2U7QUFDYixHQUFDLEVBQUUsQ0FBQztBQUNKLEdBQUMsRUFBRSxDQUFDO0FBQ0osT0FBSyxFQUFFLEdBQUc7QUFDVixRQUFNLEVBQUUsR0FBRztDQUNaIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IFNoYXVuIG9uIDQvMjMvMjAxNS5cclxuICovXHJcblxyXG5pbXBvcnQgUmVzb3VyY2VSZWdpc3RyeSBmcm9tICcuL2VuZ2luZS9yZXNvdXJjZXMvcmVzb3VyY2UtcmVnaXN0cnkuanMnO1xyXG4vKmltcG9ydCBCYWNrZ3JvdW5kTGF5ZXIgZnJvbSAnLi9sYXllcnMvYmFja2dyb3VuZC1sYXllci5qcyc7XHJcbmltcG9ydCBFbnRpdHlMYXllciBmcm9tICcuL2xheWVycy9lbnRpdHktbGF5ZXIuanMnO1xyXG5pbXBvcnQgQ29sbGlzaW9uTGF5ZXIgZnJvbSAnLi9sYXllcnMvY29sbGlzaW9uLWxheWVyLmpzJztcclxuaW1wb3J0IFNjaGVkdWxlciBmcm9tICcuL3NjaGVkdWxlci5qcyc7XHJcbmltcG9ydCBTY2VuZSBmcm9tICcuL3dvcmxkL3NjZW5lLmpzJzsqL1xyXG5pbXBvcnQge2NhY2hlRGF0YUVsZW1lbnRzLCBGcmFnbWVudH0gZnJvbSAnLi9lbmdpbmUvZnJhZ21lbnRzLmpzJztcclxuLy9pbXBvcnQge3VzZSwgaW5zdGFuY2V9IGZyb20gJy4vaW5qZWN0b3IuanMnO1xyXG4vL2ltcG9ydCB7cmVnaXN0ZXJ9IGZyb20gJy4vZW5naW5lL2NvbnRhaW5lci5qcyc7XHJcbi8vaW1wb3J0IHtsb2d9IGZyb20gJy4vbG9nZ2VyLmpzJztcclxuaW1wb3J0IFZpZXcgZnJvbSAnLi92aWV3LmpzJztcclxuaW1wb3J0IExvYWRlciBmcm9tICcuL2xvYWRlci5qcyc7XHJcblxyXG52YXIgcmVmcmVzaDtcclxuXHJcbi8qcmVnaXN0ZXIoJ3ZpZXdwb3J0Jywge1xyXG4gIHg6IDAsXHJcbiAgeTogMCxcclxuICB3aWR0aDogNjAwLFxyXG4gIGhlaWdodDogNDAwXHJcbn0pOyovXHJcblxyXG4vKmNsYXNzIERhdGEge1xyXG4gIHNldFZhbHVlKHZhbHVlKSB7XHJcbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XHJcbiAgfVxyXG4gIGdldFZhbHVlKCkge1xyXG4gICAgcmV0dXJuIHRoaXMudmFsdWU7XHJcbiAgfVxyXG59XHJcblxyXG5cclxuQHVzZShEYXRhKVxyXG5jbGFzcyBCYXIge1xyXG4gIGNvbnN0cnVjdG9yKGRhdGEpIHtcclxuICAgIGRhdGEuc2V0VmFsdWUoJ2Z1dXV1dXUnKTtcclxuICB9XHJcbiAgYmF6KCkge1xyXG4gICAgcmV0dXJuICdiYXonO1xyXG4gIH1cclxufVxyXG5cclxuQGluc3RhbmNlKEJhcilcclxuY2xhc3MgU3R1cGlkIHtcclxuICBjb25zdHJ1Y3RvcihiYXIpIHtcclxuICAgIHRoaXMuYmFyID0gYmFyO1xyXG4gIH1cclxuICBAbG9nKCd5b3UgY2FsbGVkIGR1bWIhJylcclxuICBkdW1iKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuYmFyLmJheigpO1xyXG4gIH1cclxufVxyXG5cclxuQGluc3RhbmNlKFN0dXBpZClcclxuQHVzZShEYXRhKVxyXG5AaW5zdGFuY2UoJ2JsYWgnKVxyXG5jbGFzcyBGb28ge1xyXG4gIGNvbnN0cnVjdG9yKHN0dXBpZCwgZGF0YSwgYmxhaCkge1xyXG4gICAgY29uc29sZS5sb2coc3R1cGlkLmR1bWIoKSk7XHJcbiAgICBjb25zb2xlLmxvZyhkYXRhLmdldFZhbHVlKCkpO1xyXG4gICAgY29uc29sZS5sb2coYmxhaCk7XHJcbiAgfVxyXG5cclxuICBmb29iYXIoYmFyKSB7XHJcbiAgICByZXR1cm4gYmFyLmJheigpO1xyXG4gIH1cclxufVxyXG5cclxudmFyIGZvbyA9IG5ldyBGb28oJ2hlbGxvIScpOyovXHJcblxyXG5jYWNoZURhdGFFbGVtZW50cygpO1xyXG5cclxuLyp2YXIgY2FudmFzQmFja2dyb3VuZCA9IEZyYWdtZW50KCdjYW52YXMtYmFja2dyb3VuZCcpO1xyXG52YXIgY2FudmFzRW50aXRpZXMgPSBGcmFnbWVudCgnY2FudmFzLWVudGl0aWVzJyk7XHJcbnZhciBjYW52YXNDb2xsaWRlcnMgPSBGcmFnbWVudCgnY2FudmFzLWNvbGxpZGVycycpOyovXHJcblxyXG5yZWZyZXNoID0gZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIFJlc291cmNlUmVnaXN0cnkuZ2V0UmVzb3VyY2VzKCdhc3NldHMva2l0dHkuanNvbicpO1xyXG59O1xyXG5cclxuLy9uZXcgVmlldygpO1xyXG5cclxudmFyIGxvYWRlciA9IG5ldyBMb2FkZXIoKTtcclxubG9hZGVyLmdldFNjZW5lKCdraXR0eS13b3JsZC5qc29uJywnYXNzZXRzJyk7XHJcblxyXG4vKlxyXG4vLyBWSUVXIFNUVUZGXHJcblxyXG4vLyBTZXR1cCBiYWNrZ3JvdW5kIGxheWVyXHJcbnZhciBiYWNrZ3JvdW5kTGF5ZXIgPSBCYWNrZ3JvdW5kTGF5ZXIoY2FudmFzQmFja2dyb3VuZCk7XHJcblNjaGVkdWxlcihmdW5jdGlvbiAoKSB7XHJcbiAgYmFja2dyb3VuZExheWVyLmRyYXcodmlld3BvcnQpO1xyXG59KTtcclxuXHJcbi8vIFNldHVwIGVudGl0eSBsYXllclxyXG52YXIgZW50aXR5TGF5ZXIgPSBFbnRpdHlMYXllcihjYW52YXNFbnRpdGllcyk7XHJcblNjaGVkdWxlcihmdW5jdGlvbiAoKSB7XHJcbiAgZW50aXR5TGF5ZXIuZHJhdyh2aWV3cG9ydCk7XHJcbn0pO1xyXG5cclxuLy8gU2V0dXAgY29sbGlzaW9uIGRlYnVnIGxheWVyXHJcbnZhciBjb2xsaXNpb25MYXllciA9IENvbGxpc2lvbkxheWVyKGNhbnZhc0NvbGxpZGVycyk7XHJcblNjaGVkdWxlcihmdW5jdGlvbiAoKSB7XHJcbiAgY29sbGlzaW9uTGF5ZXIuZHJhdyh2aWV3cG9ydCk7XHJcbn0pO1xyXG4qL1xyXG5cclxuLypTY2VuZSgna2l0dHktd29ybGQuanNvbicsJ2Fzc2V0cycpLnJlYWR5KGZ1bmN0aW9uKHNjZW5lKSB7XHJcbiAgc2NlbmUuYmFja2dyb3VuZC5yZWFkeShmdW5jdGlvbiAoYmFja2dyb3VuZCkge1xyXG4gICAgYmFja2dyb3VuZExheWVyLnNldEJhY2tncm91bmQoYmFja2dyb3VuZCk7XHJcbiAgfSk7XHJcblxyXG4gIGVudGl0eUxheWVyLmNsZWFyKCk7XHJcbiAgc2NlbmUuc3ByaXRlLnJlYWR5KGZ1bmN0aW9uIChzcHJpdGUpIHtcclxuICAgIHNwcml0ZS5hbmltYXRpb24ucGxheSgncnVuJyk7XHJcbiAgICBlbnRpdHlMYXllci5hZGRFbnRpdHkoc3ByaXRlKTtcclxuICB9LCBmdW5jdGlvbigpIHtcclxuICAgIGNvbnNvbGUubG9nKCdFUlJPUiEhJylcclxuICB9KTtcclxuXHJcbiAgY29sbGlzaW9uTGF5ZXIuc2V0Q29sbGlkZXJzKHNjZW5lLnNjZW5lRGF0YS5sYXllckRlZmluaXRpb25zLmNvbGxpc2lvbnMuY29sbGlkZXJzKTtcclxufSk7Ki9cclxuIiwiXHJcbmltcG9ydCBVdGlsIGZyb20gJy4vdXRpbC5qcyc7XHJcblxyXG4vLyBSZXR1cm4gZXZlcnl0aGluZyBiZWZvcmUgdGhlIGxhc3Qgc2xhc2ggb2YgYSB1cmxcclxuLy8gZS5nLiBodHRwOi8vZm9vL2Jhci9iYXouanNvbiA9PiBodHRwOi8vZm9vL2JhclxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0QmFzZVVybCh1cmwpIHtcclxuICB2YXIgbiA9IHVybC5sYXN0SW5kZXhPZignLycpO1xyXG4gIHJldHVybiB1cmwuc3Vic3RyaW5nKDAsIG4pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaXNGdWxsVXJsKHVybCkge1xyXG4gIHJldHVybiAodXJsLnN1YnN0cmluZygwLCA3KSA9PT0gJ2h0dHA6Ly8nIHx8XHJcbiAgICB1cmwuc3Vic3RyaW5nKDAsIDgpID09PSAnaHR0cHM6Ly8nKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZVVybCh1cmwsIGJhc2VVcmwpIHtcclxuICBpZihiYXNlVXJsICYmICFpc0Z1bGxVcmwodXJsKSkge1xyXG4gICAgcmV0dXJuIGJhc2VVcmwgKyAnLycgKyB1cmw7XHJcbiAgfVxyXG4gIHJldHVybiB1cmw7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBtZXJnZU9iamVjdChzb3VyY2UsIGRlc3RpbmF0aW9uLCBhbGxvd1dyYXAsIGV4Y2VwdGlvbk9uQ29sbGlzaW9ucykge1xyXG4gIHNvdXJjZSA9IHNvdXJjZSB8fCB7fTsgLy9Qb29sLmdldE9iamVjdCgpO1xyXG4gIGRlc3RpbmF0aW9uID0gZGVzdGluYXRpb24gfHwge307IC8vUG9vbC5nZXRPYmplY3QoKTtcclxuXHJcbiAgT2JqZWN0LmtleXMoc291cmNlKS5mb3JFYWNoKGZ1bmN0aW9uKHByb3ApIHtcclxuICAgIGFzc2lnblByb3BlcnR5KHNvdXJjZSwgZGVzdGluYXRpb24sIHByb3AsIGFsbG93V3JhcCwgZXhjZXB0aW9uT25Db2xsaXNpb25zKTtcclxuICB9KTtcclxuXHJcbiAgcmV0dXJuIGRlc3RpbmF0aW9uO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gYXNzaWduUHJvcGVydHkoc291cmNlLCBkZXN0aW5hdGlvbiwgcHJvcCwgYWxsb3dXcmFwLCBleGNlcHRpb25PbkNvbGxpc2lvbnMpIHtcclxuICBpZihkZXN0aW5hdGlvbi5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xyXG4gICAgaWYoYWxsb3dXcmFwKSB7XHJcbiAgICAgIGRlc3RpbmF0aW9uW3Byb3BdID0gRnVuYy53cmFwKGRlc3RpbmF0aW9uW3Byb3BdLCBzb3VyY2VbcHJvcF0pO1xyXG4gICAgICBVdGlsLmxvZygnTWVyZ2U6IHdyYXBwZWQgXFwnJyArIHByb3AgKyAnXFwnJyk7XHJcbiAgICB9IGVsc2UgaWYoZXhjZXB0aW9uT25Db2xsaXNpb25zKSB7XHJcbiAgICAgIFV0aWwuZXJyb3IoJ0ZhaWxlZCB0byBtZXJnZSBtaXhpbi4gTWV0aG9kIFxcJycgK1xyXG4gICAgICBwcm9wICsgJ1xcJyBjYXVzZWQgYSBuYW1lIGNvbGxpc2lvbi4nKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGRlc3RpbmF0aW9uW3Byb3BdID0gc291cmNlW3Byb3BdO1xyXG4gICAgICBVdGlsLmxvZygnTWVyZ2U6IG92ZXJ3cm90ZSBcXCcnICsgcHJvcCArICdcXCcnKTtcclxuICAgIH1cclxuICAgIHJldHVybiBkZXN0aW5hdGlvbjtcclxuICB9XHJcblxyXG4gIGRlc3RpbmF0aW9uW3Byb3BdID0gc291cmNlW3Byb3BdO1xyXG5cclxuICByZXR1cm4gZGVzdGluYXRpb247XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRDYW52YXMod2lkdGgsIGhlaWdodCkge1xyXG4gIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuXHJcbiAgY2FudmFzLndpZHRoID0gd2lkdGggfHwgNTAwO1xyXG4gIGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQgfHwgNTAwO1xyXG5cclxuICByZXR1cm4gY2FudmFzO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaW50ZXJzZWN0cyhyZWN0QSwgcmVjdEIpIHtcclxuICByZXR1cm4gIShcclxuICAgIHJlY3RBLnggKyByZWN0QS53aWR0aCA8IHJlY3RCLnggfHxcclxuICAgIHJlY3RBLnkgKyByZWN0QS5oZWlnaHQgPCByZWN0Qi55IHx8XHJcbiAgICByZWN0QS54ID4gcmVjdEIueCArIHJlY3RCLndpZHRoIHx8XHJcbiAgICByZWN0QS55ID4gcmVjdEIueSArIHJlY3RCLmhlaWdodFxyXG4gICk7XHJcbn1cclxuXHJcbi8vIE1ha2UgdGhlIGdpdmVuIFJHQiB2YWx1ZSB0cmFuc3BhcmVudCBpbiB0aGUgZ2l2ZW4gaW1hZ2UuXHJcbi8vIFJldHVybnMgYSBuZXcgaW1hZ2UuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRUcmFuc3BhcmVudEltYWdlKHRyYW5zUkdCLCBpbWFnZSkge1xyXG4gIHZhciByLCBnLCBiLCBuZXdJbWFnZSwgZGF0YUxlbmd0aDtcclxuICB2YXIgd2lkdGggPSBpbWFnZS53aWR0aDtcclxuICB2YXIgaGVpZ2h0ID0gaW1hZ2UuaGVpZ2h0O1xyXG4gIHZhciBpbWFnZURhdGEgPSBpbWFnZVxyXG4gICAgLmdldENvbnRleHQoJzJkJylcclxuICAgIC5nZXRJbWFnZURhdGEoMCwgMCwgd2lkdGgsIGhlaWdodCk7XHJcblxyXG4gIGlmKHRyYW5zUkdCKSB7XHJcbiAgICBkYXRhTGVuZ3RoID0gd2lkdGggKiBoZWlnaHQgKiA0O1xyXG5cclxuICAgIGZvcih2YXIgaW5kZXggPSAwOyBpbmRleCA8IGRhdGFMZW5ndGg7IGluZGV4Kz00KSB7XHJcbiAgICAgIHIgPSBpbWFnZURhdGEuZGF0YVtpbmRleF07XHJcbiAgICAgIGcgPSBpbWFnZURhdGEuZGF0YVtpbmRleCArIDFdO1xyXG4gICAgICBiID0gaW1hZ2VEYXRhLmRhdGFbaW5kZXggKyAyXTtcclxuICAgICAgaWYociA9PT0gdHJhbnNSR0JbMF0gJiYgZyA9PT0gdHJhbnNSR0JbMV0gJiYgYiA9PT0gdHJhbnNSR0JbMl0pIHtcclxuICAgICAgICBpbWFnZURhdGEuZGF0YVtpbmRleCArIDNdID0gMDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgbmV3SW1hZ2UgPSBnZXRDYW52YXMod2lkdGgsIGhlaWdodCk7XHJcbiAgbmV3SW1hZ2VcclxuICAgIC5nZXRDb250ZXh0KCcyZCcpXHJcbiAgICAucHV0SW1hZ2VEYXRhKGltYWdlRGF0YSwgMCwgMCk7XHJcblxyXG4gIHJldHVybiBuZXdJbWFnZTtcclxufVxyXG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgc2hhdW53ZXN0IG9uIDQvMzAvMTUuXG4gKi9cblxudmFyIGNvbnRhaW5lciA9IHt9O1xudmFyIHNpbmdsZXRvbnMgPSBbXTtcblxuZXhwb3J0IGZ1bmN0aW9uIHRyeVRvSW5zdGFudGlhdGUgKGZ1bmMsIG1zZykge1xuICB0cnkge1xuICAgIC8vIE5vdGVzIG9uICduZXcnOiBJZiBmdW5jIHJldHVybnMgYW4gb2JqZWN0LCB0aGUgb2JqZWN0XG4gICAgLy8gd2lsbCBiZSB1c2VkIGFzIHRoZSBpbnN0YW5jZS4gSWYgZnVuYyBkb2VzIG5vdCByZXR1cm5cbiAgICAvLyBhbiBvYmplY3QsIGEgbmV3IG9iamVjdCBpcyBjcmVhdGVkIGJhc2VkIG9uIGZ1bmMucHJvdG90eXBlXG4gICAgcmV0dXJuIG5ldyBmdW5jKCk7XG4gIH0gY2F0Y2goZSkge1xuICAgIGlmKG1zZykge1xuICAgICAgY29uc29sZS5lcnJvcihtc2cpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG5mdW5jdGlvbiBmaW5kU2luZ2xldG9uIChjb25zdHJ1Y3Rvcikge1xuICB2YXIgcmVzdWx0cyA9IHNpbmdsZXRvbnMuZmlsdGVyKGZ1bmN0aW9uKHNpbmdsZXRvbikge1xuICAgIHJldHVybiAoY29uc3RydWN0b3IgPT09IHNpbmdsZXRvbi5jb25zdHJ1Y3Rvcik7XG4gIH0pO1xuXG4gIHJldHVybiAocmVzdWx0cy5sZW5ndGgpID8gcmVzdWx0c1swXS5pbnN0YW5jZSA6IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlciAoaWRPckNvbnN0cnVjdG9yLCB2YWx1ZSkge1xuICB2YXIgaW5zdGFuY2U7XG5cbiAgaWYodHlwZW9mIGlkT3JDb25zdHJ1Y3RvciA9PT0gJ3N0cmluZycpIHtcbiAgICBjb250YWluZXJbaWRPckNvbnN0cnVjdG9yXSA9IHZhbHVlO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmKHR5cGVvZiBpZE9yQ29uc3RydWN0b3IgIT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvL2luc3RhbmNlID0gdHJ5VG9JbnN0YW50aWF0ZShpZE9yQ29uc3RydWN0b3IsICdcIicgKyBpZE9yQ29uc3RydWN0b3IgKyAnXCIgbm90IGEgY2xhc3MnKTtcbiAgaW5zdGFuY2UgPSBuZXcgaWRPckNvbnN0cnVjdG9yKCk7XG5cbiAgaWYgKGluc3RhbmNlKSB7XG4gICAgc2luZ2xldG9ucy5wdXNoKHtcbiAgICAgIGNvbnN0cnVjdG9yOiBpZE9yQ29uc3RydWN0b3IsXG4gICAgICBpbnN0YW5jZTogaW5zdGFuY2VcbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5jbHVkZSAoaWRPckNvbnN0cnVjdG9yKSB7XG4gIGlmKHR5cGVvZiBpZE9yQ29uc3RydWN0b3IgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGNvbnRhaW5lcltpZE9yQ29uc3RydWN0b3JdO1xuICB9XG4gIHJldHVybiBmaW5kU2luZ2xldG9uKGlkT3JDb25zdHJ1Y3Rvcik7XG59IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgU2hhdW4gb24gNC8yMy8yMDE1LlxyXG4gKi9cclxuXHJcbnZhciBhbGxEYXRhRWxlbWVudHM7XHJcblxyXG5mdW5jdGlvbiBoYXNEYXRhQXR0cmlidXRlKGVsZW1lbnQpIHtcclxuICB2YXIgYXR0cmlidXRlcyA9IGVsZW1lbnQuYXR0cmlidXRlcztcclxuICBmb3IodmFyIGkgPSAwLCBudW1BdHRyaWJ1dGVzID0gYXR0cmlidXRlcy5sZW5ndGg7IGkgPCBudW1BdHRyaWJ1dGVzOyBpKyspIHtcclxuICAgIGlmKGF0dHJpYnV0ZXNbaV0ubmFtZS5zdWJzdHIoMCwgNCkgPT09ICdkYXRhJykge1xyXG4gICAgICByZXR1cm4gZWxlbWVudDtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBmaW5kRGF0YUVsZW1lbnRzIChwYXJlbnRFbGVtZW50KSB7XHJcbiAgdmFyIGFsbEVsZW1lbnRzLCBlbGVtZW50LCBkYXRhRWxlbWVudHMgPSBbXTtcclxuXHJcbiAgaWYoIXBhcmVudEVsZW1lbnQpIHtcclxuICAgIHZhciBodG1sID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2h0bWwnKTtcclxuICAgIGlmKCFodG1sWzBdKSB7XHJcbiAgICAgIHJldHVybiBkYXRhRWxlbWVudHM7XHJcbiAgICB9XHJcbiAgICBwYXJlbnRFbGVtZW50ID0gaHRtbFswXTtcclxuICB9XHJcblxyXG4gIGFsbEVsZW1lbnRzID0gcGFyZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCcqJyk7XHJcbiAgZm9yKHZhciBpID0gMCwgbnVtRWxlbWVudHMgPSBhbGxFbGVtZW50cy5sZW5ndGg7IGkgPCBudW1FbGVtZW50czsgaSsrKSB7XHJcbiAgICBlbGVtZW50ID0gYWxsRWxlbWVudHNbaV07XHJcbiAgICBpZihoYXNEYXRhQXR0cmlidXRlKGVsZW1lbnQpKSB7XHJcbiAgICAgIGRhdGFFbGVtZW50cy5wdXNoKGVsZW1lbnQpO1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gZGF0YUVsZW1lbnRzO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gRnJhZ21lbnRzIChuYW1lKSB7XHJcbiAgaWYoIWFsbERhdGFFbGVtZW50cykge1xyXG4gICAgY2FjaGVEYXRhRWxlbWVudHMoKTtcclxuICB9XHJcbiAgcmV0dXJuIGFsbERhdGFFbGVtZW50cy5yZWR1Y2UoZnVuY3Rpb24ocmVzdWx0LCBlbGVtZW50KSB7XHJcbiAgICBpZihlbGVtZW50Lmhhc0F0dHJpYnV0ZSgnZGF0YS0nICsgbmFtZSkpIHtcclxuICAgICAgcmVzdWx0LnB1c2goZWxlbWVudCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH0sIFtdKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIEZyYWdtZW50IChuYW1lKSB7XHJcbiAgcmV0dXJuIEZyYWdtZW50cyhuYW1lKVswXTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNhY2hlRGF0YUVsZW1lbnRzKCkge1xyXG4gIGFsbERhdGFFbGVtZW50cyA9IGZpbmREYXRhRWxlbWVudHMoKTtcclxufVxyXG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgc2hhdW53ZXN0IG9uIDQvMjgvMTUuXG4gKi9cbmltcG9ydCB7aW5jbHVkZSwgcmVnaXN0ZXIsIHRyeVRvSW5zdGFudGlhdGV9IGZyb20gJy4vY29udGFpbmVyLmpzJztcblxuLy92YXIgY29udGFpbmVyID0gW107XG5cbi8qZnVuY3Rpb24gZmluZEluQ29udGFpbmVyKGlkKSB7XG4gIHZhciByZXN1bHRzID0gY29udGFpbmVyLmZpbHRlcihmdW5jdGlvbihzaW5nbGV0b25EYXRhKSB7XG4gICAgaWYoaWQgPT09IHNpbmdsZXRvbkRhdGEuaWQpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIChyZXN1bHRzLmxlbmd0aCkgPyByZXN1bHRzWzBdLnZhbHVlIDogbnVsbDtcbn1cblxuZnVuY3Rpb24gcmVnaXN0ZXJTaW5nbGV0b24oY29uc3RydWN0b3IpIHtcbiAgdmFyIGluc3RhbmNlID0gdHJ5VG9JbnN0YW50aWF0ZShjb25zdHJ1Y3Rvcik7XG4gIGlmKGluc3RhbmNlKSB7XG4gICAgcmVnaXN0ZXIoY29uc3RydWN0b3IsIGluc3RhbmNlKTtcbiAgICByZXR1cm4gaW5zdGFuY2U7XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gdHJ5VG9JbnN0YW50aWF0ZShjb25zdHJ1Y3RvciwgbXNnKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIG5ldyBjb25zdHJ1Y3RvcigpO1xuICB9IGNhdGNoKGUpIHtcbiAgICBpZihtc2cpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IobXNnKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn0qL1xuXG5mdW5jdGlvbiBkb0luamVjdChpbmplY3RlZCkge1xuICByZXR1cm4gZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgaW5qZWN0ZWQgPSAodGFyZ2V0Ll9pbmplY3RlZCkgP1xuICAgICAgaW5qZWN0ZWQuY29uY2F0KHRhcmdldC5faW5qZWN0ZWQpIDpcbiAgICAgIGluamVjdGVkO1xuXG4gICAgaWYodGFyZ2V0Ll90YXJnZXQpIHtcbiAgICAgIHRhcmdldCA9IHRhcmdldC5fdGFyZ2V0O1xuICAgIH1cblxuICAgIHZhciBuZXdUYXJnZXQgPSB0YXJnZXQuYmluZC5hcHBseSh0YXJnZXQsIFtudWxsXS5jb25jYXQoaW5qZWN0ZWQpKTtcbiAgICBuZXdUYXJnZXQuX3RhcmdldCA9IHRhcmdldDtcbiAgICBuZXdUYXJnZXQuX2luamVjdGVkID0gaW5qZWN0ZWQ7XG4gICAgcmV0dXJuIG5ld1RhcmdldDtcbiAgfTtcbn1cblxuZnVuY3Rpb24gZG9Vc2UoaW5qZWN0TGlzdCkge1xuICBpbmplY3RMaXN0ID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoaW5qZWN0TGlzdCk7XG5cbiAgcmV0dXJuIGRvSW5qZWN0KGluamVjdExpc3QubWFwKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICB2YXIgcmVzdWx0ID0gaW5jbHVkZShpdGVtKTtcbiAgICBpZihyZXN1bHQpIHtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIGlmKHR5cGVvZiBpdGVtICE9PSAnc3RyaW5nJykge1xuICAgICAgcmVnaXN0ZXIoaXRlbSk7XG4gICAgICByZXR1cm4gaW5jbHVkZShpdGVtKTtcbiAgICB9XG4gIH0pKTtcbn1cblxuZnVuY3Rpb24gZG9JbnN0YW5jZShpbmplY3RMaXN0KSB7XG4gIGluamVjdExpc3QgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChpbmplY3RMaXN0KTtcblxuICByZXR1cm4gZG9JbmplY3QoaW5qZWN0TGlzdC5tYXAoZnVuY3Rpb24oaXRlbSkge1xuICAgIHJldHVybiB0cnlUb0luc3RhbnRpYXRlKGl0ZW0pIHx8IGl0ZW07XG4gIH0pKTtcbn1cblxuLypmdW5jdGlvbiBkb0luamVjdChhcmdzLCBpbnN0YW50aWF0ZSkge1xuICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJncyk7XG4gIHZhciBpbmplY3RlZCA9IGFyZ3MubWFwKGZ1bmN0aW9uKGluamVjdGFibGUpIHtcbiAgICByZXR1cm4gKGluc3RhbnRpYXRlKSA/XG4gICAgICB0cnlUb0luc3RhbnRpYXRlKGluamVjdGFibGUsICdcIicgKyBpbmplY3RhYmxlICsgJ1wiIGNhbm5vdCBiZSBpbnN0YW50aWF0ZWQuJykgOlxuICAgICAgZmluZEluQ29udGFpbmVyKGluamVjdGFibGUpIHx8IHJlZ2lzdGVyU2luZ2xldG9uKGluamVjdGFibGUpIHx8IGluamVjdGFibGU7XG4gIH0pO1xuXG4gIHJldHVybiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICBpbmplY3RlZCA9ICh0YXJnZXQuX2luamVjdGVkKSA/XG4gICAgICBpbmplY3RlZC5jb25jYXQodGFyZ2V0Ll9pbmplY3RlZCkgOlxuICAgICAgaW5qZWN0ZWQ7XG5cbiAgICBpZih0YXJnZXQuX3RhcmdldCkge1xuICAgICAgdGFyZ2V0ID0gdGFyZ2V0Ll90YXJnZXQ7XG4gICAgfVxuXG4gICAgdmFyIG5ld1RhcmdldCA9IHRhcmdldC5iaW5kLmFwcGx5KHRhcmdldCwgW251bGxdLmNvbmNhdChpbmplY3RlZCkpO1xuICAgIG5ld1RhcmdldC5fdGFyZ2V0ID0gdGFyZ2V0O1xuICAgIG5ld1RhcmdldC5faW5qZWN0ZWQgPSBpbmplY3RlZDtcbiAgICByZXR1cm4gbmV3VGFyZ2V0O1xuICB9O1xufSovXG5cbi8vIEZpbmRzIGEgc2F2ZWQgdmFsdWUgb3Igc2luZ2xldG9uLlxuLy8gUGFzcyBpbiBhIGNvbnN0cnVjdG9yIHRvIGluamVjdCBpdCBhcyBhIHNpbmdsZXRvblxuLy8gUGFzcyBpbiBhIHN0cmluZyBpZCB0byBnZXQgYSByZWdpc3RlcmVkIHZhbHVlXG5leHBvcnQgZnVuY3Rpb24gdXNlKCkge1xuICByZXR1cm4gZG9Vc2UoYXJndW1lbnRzKTtcbn1cblxuLy8gQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiB0aGUgcHJvdmlkZWQgY29uc3RydWN0b3JzXG4vLyBhbmQgaW5qZWN0cyB0aGVtLiBBbHNvIGFjY2VwdHMgbGl0ZXJhbCB2YWx1ZXMsIHdoaWNoXG4vLyB3aWxsIGJlIGRpcmVjdGx5IGluamVjdGVkLlxuZXhwb3J0IGZ1bmN0aW9uIGluc3RhbmNlKCkge1xuICAvL3JldHVybiBkb0luamVjdChhcmd1bWVudHMsIHRydWUpO1xuICByZXR1cm4gZG9JbnN0YW5jZShhcmd1bWVudHMpO1xufVxuXG4vKmV4cG9ydCBmdW5jdGlvbiBpbmplY3QoKSB7XG4gIHJldHVybiBkb0luamVjdChhcmd1bWVudHMpO1xufSovXG5cblxuXG5cbiIsIi8qKlxuICogQ3JlYXRlZCBieSBTaGF1biBvbiA1LzMvMTQuXG4gKi9cbnZhciBwcm9taXNlcyA9IFtdLFxuICBiYXNlVXJsID0gJyc7XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24ob2JqKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PSAnW29iamVjdCBGdW5jdGlvbl0nO1xufVxuXG5mdW5jdGlvbiBwYXJzZVJlc3BvbnNlIChjb250ZW50VHlwZSwgcmVzcG9uc2VUZXh0KSB7XG4gIGlmKGNvbnRlbnRUeXBlLnN1YnN0cigwLCAxNikgPT0gJ2FwcGxpY2F0aW9uL2pzb24nKSB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UocmVzcG9uc2VUZXh0KTtcbiAgfVxuICByZXR1cm4gcmVzcG9uc2VUZXh0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVxdWVzdEdldCh1cmwsIGNvbnRlbnRUeXBlT3JPblByb2dyZXNzLCBvblByb2dyZXNzKSB7XG4gIHZhciBwcm9taXNlO1xuXG4gIGlmKHVybC5zdWJzdHIoMCwgNykgIT09ICdodHRwOi8vJyAmJiB1cmwuc3Vic3RyKDAsIDgpICE9PSAnaHR0cHM6Ly8nKSB7XG4gICAgdXJsID0gYmFzZVVybCArIHVybDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldEhhbmRsZXIocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgdmFyIHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgaWYgKGlzRnVuY3Rpb24oY29udGVudFR5cGVPck9uUHJvZ3Jlc3MpKSB7XG4gICAgICBvblByb2dyZXNzID0gY29udGVudFR5cGVPck9uUHJvZ3Jlc3M7XG4gICAgICBjb250ZW50VHlwZU9yT25Qcm9ncmVzcyA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBpZiAob25Qcm9ncmVzcykge1xuICAgICAgcmVxLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIG9uUHJvZ3Jlc3MoZXZlbnQubG9hZGVkLCBldmVudC50b3RhbCk7XG4gICAgICB9LCBmYWxzZSk7XG4gICAgfVxuXG4gICAgcmVxLm9uZXJyb3IgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIHJlamVjdCgnTmV0d29yayBlcnJvci4nKTtcbiAgICB9O1xuXG4gICAgcmVxLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBjb250ZW50VHlwZSA9IGNvbnRlbnRUeXBlT3JPblByb2dyZXNzIHx8IHRoaXMuZ2V0UmVzcG9uc2VIZWFkZXIoJ2NvbnRlbnQtdHlwZScpIHx8ICcnO1xuICAgICAgKHRoaXMuc3RhdHVzID49IDMwMCkgP1xuICAgICAgICByZWplY3Qoe3N0YXR1c1RleHQ6IHRoaXMuc3RhdHVzVGV4dCwgc3RhdHVzOiB0aGlzLnN0YXR1c30pIDpcbiAgICAgICAgcmVzb2x2ZSh7ZGF0YTogcGFyc2VSZXNwb25zZShjb250ZW50VHlwZSwgdGhpcy5yZXNwb25zZVRleHQpLCBzdGF0dXM6IHRoaXMuc3RhdHVzfSk7XG4gICAgfTtcblxuICAgIHJlcS5vcGVuKCdnZXQnLCB1cmwsIHRydWUpO1xuICAgIHJlcS5zZW5kKCk7XG4gIH1cblxuICBwcm9taXNlID0gbmV3IFByb21pc2UoZ2V0SGFuZGxlcik7XG4gIHByb21pc2VzLnB1c2gocHJvbWlzZSk7XG5cbiAgcmV0dXJuIHByb21pc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwdXJnZSgpIHtcbiAgcHJvbWlzZXMubGVuZ3RoID0gMDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFByb21pc2VzKCkge1xuICByZXR1cm4gcHJvbWlzZXM7XG59XG5cbmZ1bmN0aW9uIHNldEJhc2VVcmwodXJsKSB7XG4gIGJhc2VVcmwgPSB1cmw7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgcmVxdWVzdEdldDogcmVxdWVzdEdldCxcbiAgcHVyZ2U6IHB1cmdlLFxuICBzZXRCYXNlVXJsOiBzZXRCYXNlVXJsLFxuICBnZXRQcm9taXNlczogZ2V0UHJvbWlzZXNcbn07XG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBTaGF1biBvbiAyLzUvMTVcclxuICogXHJcbiAqL1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmFja2dyb3VuZExheWVyIHtcclxuICBjb25zdHJ1Y3RvciAoY2FudmFzKSB7XHJcbiAgICB0aGlzLmNhbnZhcyA9IGNhbnZhcztcclxuICAgIHRoaXMuY29udGV4dDJkID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgfVxyXG5cclxuICBzZXRCYWNrZ3JvdW5kIChpbWFnZSkge1xyXG4gICAgdGhpcy5iYWNrZ3JvdW5kID0gaW1hZ2U7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIGRyYXcgKHZpZXdwb3J0KSB7XHJcbiAgICBpZighdmlld3BvcnQpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuY29udGV4dDJkLmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcclxuXHJcbiAgICBpZih0aGlzLmJhY2tncm91bmQpIHtcclxuICAgICAgdGhpcy5jb250ZXh0MmQuZHJhd0ltYWdlKFxyXG4gICAgICAgIHRoaXMuYmFja2dyb3VuZCxcclxuICAgICAgICB2aWV3cG9ydC54LCB2aWV3cG9ydC55LFxyXG4gICAgICAgIHZpZXdwb3J0LndpZHRoLCB2aWV3cG9ydC5oZWlnaHQsXHJcbiAgICAgICAgMCwgMCxcclxuICAgICAgICB2aWV3cG9ydC53aWR0aCwgdmlld3BvcnQuaGVpZ2h0XHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBnZXRMYXllciAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5jYW52YXM7XHJcbiAgfVxyXG59XHJcbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IFNoYXVuIG9uIDIvMjgvMTVcclxuICogXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtpbnRlcnNlY3RzfSBmcm9tICcuLi9jb21tb24uanMnO1xyXG5cclxuY29uc3QgQ09MTElERVJfU1RST0tFID0gJyNmZjAwZmYnO1xyXG5jb25zdCBFTlRJVFlfU1RST0tFID0gJyM1MGZmNjgnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29sbGlzaW9uTGF5ZXIgIHtcclxuICBjb25zdHJ1Y3RvciAoY2FudmFzKSB7XHJcbiAgICB0aGlzLmNvbGxpZGVycyA9IFtdO1xyXG4gICAgdGhpcy5lbnRpdGllcyA9IFtdO1xyXG4gICAgdGhpcy5jYW52YXMgPSBjYW52YXM7XHJcbiAgICB0aGlzLmNvbnRleHQyZCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gIH1cclxuXHJcbiAgLy8gRklYTUU6IGNoYW5nZSBpdCB0byBhZGRFbnRpdHkgb3Igc29tZXRoaW5nXHJcbiAgc2V0RW50aXRpZXMgKHZhbHVlKSB7XHJcbiAgICB0aGlzLmVudGl0aWVzID0gdmFsdWU7XHJcbiAgfVxyXG5cclxuICBzZXRDb2xsaWRlcnMgKHZhbHVlKSB7XHJcbiAgICB0aGlzLmNvbGxpZGVycyA9IHZhbHVlO1xyXG4gIH1cclxuXHJcbiAgZHJhdyAodmlld3BvcnQpIHtcclxuICAgIHZhciBjb250ZXh0MmQgPSB0aGlzLmNvbnRleHQyZDtcclxuXHJcbiAgICB0aGlzLmNvbnRleHQyZC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XHJcbiAgICB0aGlzLmNvbnRleHQyZC5zdHJva2VTdHlsZSA9IENPTExJREVSX1NUUk9LRTtcclxuXHJcbiAgICB0aGlzLmNvbGxpZGVycy5mb3JFYWNoKGZ1bmN0aW9uKGNvbGxpZGVyKSB7XHJcbiAgICAgIGlmKCFpbnRlcnNlY3RzKGNvbGxpZGVyLCB2aWV3cG9ydCkpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgY29udGV4dDJkLnN0cm9rZVJlY3QoXHJcbiAgICAgICAgY29sbGlkZXIueCAtIHZpZXdwb3J0LngsXHJcbiAgICAgICAgY29sbGlkZXIueSAtIHZpZXdwb3J0LnksXHJcbiAgICAgICAgY29sbGlkZXIud2lkdGgsXHJcbiAgICAgICAgY29sbGlkZXIuaGVpZ2h0XHJcbiAgICAgICk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBjb250ZXh0MmQuc3Ryb2tlU3R5bGUgPSBFTlRJVFlfU1RST0tFO1xyXG4gICAgdGhpcy5lbnRpdGllcy5mb3JFYWNoKGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gICAgICBpZighaW50ZXJzZWN0cyhlbnRpdHksIHZpZXdwb3J0KSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICBjb250ZXh0MmQuc3Ryb2tlUmVjdChcclxuICAgICAgICBlbnRpdHkueCAtIHZpZXdwb3J0LngsXHJcbiAgICAgICAgZW50aXR5LnkgLSB2aWV3cG9ydC55LFxyXG4gICAgICAgIGVudGl0eS53aWR0aCxcclxuICAgICAgICBlbnRpdHkuaGVpZ2h0XHJcbiAgICAgICk7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgZ2V0TGF5ZXIgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuY2FudmFzO1xyXG4gIH1cclxufVxyXG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBTaGF1biBvbiAyLzUvMTVcclxuICogXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtpbnRlcnNlY3RzfSBmcm9tICcuLi9jb21tb24uanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRW50aXR5TGF5ZXIge1xyXG4gIGNvbnN0cnVjdG9yKGNhbnZhcykge1xyXG4gICAgdGhpcy5lbnRpdGllcyA9IFtdO1xyXG4gICAgdGhpcy5jb250ZXh0MmQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgIHRoaXMuY2FudmFzID0gY2FudmFzO1xyXG4gIH1cclxuXHJcbiAgYWRkRW50aXR5IChlbnRpdHkpIHtcclxuICAgIHRoaXMuZW50aXRpZXMucHVzaChlbnRpdHkpO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBjbGVhciAoKSB7XHJcbiAgICB0aGlzLmVudGl0aWVzLmxlbmd0aCA9IDA7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIGRyYXcgKHZpZXdwb3J0KSB7XHJcbiAgICB2YXIgZW50aXR5LCBpbWFnZTtcclxuXHJcbiAgICB0aGlzLmNvbnRleHQyZC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XHJcblxyXG4gICAgZm9yKHZhciBpID0gMCwgbnVtRW50aXRpZXMgPSB0aGlzLmVudGl0aWVzLmxlbmd0aDsgaSA8IG51bUVudGl0aWVzOyBpKyspIHtcclxuICAgICAgZW50aXR5ID0gdGhpcy5lbnRpdGllc1tpXTtcclxuXHJcbiAgICAgIGlmKCFlbnRpdHkuYW5pbWF0aW9uKSB7XHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmKCFpbnRlcnNlY3RzKGVudGl0eSwgdmlld3BvcnQpKSB7XHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGltYWdlID0gZW50aXR5LmFuaW1hdGlvbi5nZXRJbWFnZSgpO1xyXG4gICAgICBpZihpbWFnZSkge1xyXG4gICAgICAgIHRoaXMuY29udGV4dDJkLmRyYXdJbWFnZShcclxuICAgICAgICAgIGltYWdlLFxyXG4gICAgICAgICAgZW50aXR5LnggLSB2aWV3cG9ydC54IHx8IDAsXHJcbiAgICAgICAgICBlbnRpdHkueSAtIHZpZXdwb3J0LnkgfHwgMFxyXG4gICAgICAgICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIGdldExheWVyICgpIHtcclxuICAgIHJldHVybiB0aGlzLmNhbnZhcztcclxuICB9XHJcbn1cclxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgU2hhdW4gb24gMy8xLzE1XHJcbiAqXHJcbiAqL1xyXG5cclxuaW1wb3J0IFV0aWwgZnJvbSAnLi4vdXRpbC5qcyc7XHJcbmltcG9ydCB7cmVxdWVzdEdldH0gZnJvbSAnLi4va2pheC5qcyc7XHJcbmltcG9ydCBSZXNvdXJjZSBmcm9tICcuL3Jlc291cmNlLmpzJztcclxuXHJcbi8vIFJlLXdvcmsgUmVzb3VyY2VzLi4uXHJcbi8qZXhwb3J0IGRlZmF1bHQgY2xhc3MgSHR0cFJlc291cmNlIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHRoaXMucmVzb3VyY2UgPSBSZXNvdXJjZShyZXF1ZXN0R2V0KTtcclxuICB9XHJcblxyXG4gIGZldGNoICh1cmkpIHtcclxuICAgIHJldHVybiB0aGlzLnJlc291cmNlXHJcbiAgICAgIC5mZXRjaCh1cmkpXHJcbiAgICAgIC5yZWFkeShmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xyXG4gICAgICB9KTtcclxuICB9XHJcblxyXG4gIHJlYWR5KG9uU3VjY2Vzcywgb25FcnJvcikge1xyXG4gICAgdGhpcy5yZXNvdXJjZS5yZWFkeShvblN1Y2Nlc3MsIG9uRXJyb3IpO1xyXG4gIH1cclxufSovXHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih1cmkpIHtcclxuICByZXR1cm4gUmVzb3VyY2UocmVxdWVzdEdldCwgdXJpKVxyXG4gICAgLnJlYWR5KGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xyXG4gICAgfSk7XHJcbn07XHJcblxyXG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgU2hhdW4gb24gNS8xLzE0LlxuICovXG5cbnZhciBJTUFHRV9XQUlUX0lOVEVSVkFMID0gMTAwO1xuXG5mdW5jdGlvbiB3YWl0Rm9ySW1hZ2UgKGltYWdlKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICB2YXIgaW50ZXJ2YWxJZCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuICAgICAgaWYoaW1hZ2UuY29tcGxldGUpIHtcbiAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbElkKTtcbiAgICAgICAgcmVzb2x2ZShpbWFnZSk7XG4gICAgICB9XG4gICAgfSwgSU1BR0VfV0FJVF9JTlRFUlZBTCk7XG5cbiAgICBpbWFnZS5vbmVycm9yID0gZnVuY3Rpb24gKCkge1xuICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbElkKTtcbiAgICAgIHJlamVjdCgpO1xuICAgIH07XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0SW1hZ2UgKHVyaSkge1xuICB2YXIgaW1hZ2UsIHByb21pc2U7XG5cbiAgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgaW1hZ2Uuc3JjID0gdXJpO1xuXG4gIHByb21pc2UgPSB3YWl0Rm9ySW1hZ2UoaW1hZ2UpO1xuXG4gIHJldHVybiBwcm9taXNlO1xufVxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgU2hhdW4gb24gMS8yNS8xNVxyXG4gKlxyXG4gKi9cclxuXHJcbmltcG9ydCBSZXNvdXJjZSBmcm9tICcuL3Jlc291cmNlLmpzJztcclxuaW1wb3J0IHtnZXRJbWFnZX0gZnJvbSAnLi9pbWFnZS1sb2FkZXIuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKHVyaSkge1xyXG4gIHJldHVybiBSZXNvdXJjZShnZXRJbWFnZSwgdXJpKTtcclxufTtcclxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgU2hhdW4gb24gMy85LzIwMTUuXHJcbiAqL1xyXG5cclxuaW1wb3J0IFV0aWwgZnJvbSAnLi4vdXRpbC5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoc291cmNlcykge1xyXG4gIHZhciBzdWNjZXNzQ2FsbGJhY2tzID0gW10sXHJcbiAgICBlcnJvckNhbGxiYWNrcyA9IFtdLFxyXG4gICAgbXVsdGlSZXNvdXJjZSA9IHtcclxuICAgICAgcmVhZHk6IHJlYWR5LFxyXG4gICAgICBlYWNoOiBlYWNoXHJcbiAgICB9O1xyXG5cclxuICBmdW5jdGlvbiByZWFkeShvblN1Y2Nlc3MsIG9uRXJyb3IpIHtcclxuICAgIGlmKFV0aWwuaXNBcnJheShvblN1Y2Nlc3MpKSB7XHJcbiAgICAgIHN1Y2Nlc3NDYWxsYmFja3MgPSBzdWNjZXNzQ2FsbGJhY2tzLmNvbmNhdChvblN1Y2Nlc3MpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc3VjY2Vzc0NhbGxiYWNrcy5wdXNoKG9uU3VjY2Vzcyk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYoVXRpbC5pc0FycmF5KG9uRXJyb3IpKSB7XHJcbiAgICAgIGVycm9yQ2FsbGJhY2tzID0gZXJyb3JDYWxsYmFja3MuY29uY2F0KG9uRXJyb3IpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZXJyb3JDYWxsYmFja3MucHVzaChvbkVycm9yKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbXVsdGlSZXNvdXJjZTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGVhY2goY2FsbGJhY2spIHtcclxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IC8vIG5lZWRzIHRvIGhhcHBlbiBBRlRFUiByZWFkeSgpIGNhbGxzXHJcbiAgICAgIHNvdXJjZXMuZm9yRWFjaChmdW5jdGlvbihzb3VyY2UpIHtcclxuICAgICAgICB2YXIgcmVzb3VyY2UgPSBjYWxsYmFjayhzb3VyY2UpO1xyXG4gICAgICAgIHJlc291cmNlLnJlYWR5KHN1Y2Nlc3NDYWxsYmFja3MsIGVycm9yQ2FsbGJhY2tzKTtcclxuICAgICAgfSk7XHJcbiAgICB9LCAxKTtcclxuXHJcbiAgICByZXR1cm4gbXVsdGlSZXNvdXJjZTtcclxuICB9XHJcblxyXG4gIHJldHVybiBtdWx0aVJlc291cmNlO1xyXG59XHJcbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IFNoYXVuIG9uIDMvMS8xNVxyXG4gKlxyXG4gKi9cclxuXHJcbnZhciByZXNvdXJjZXMgPSB7fTtcclxuXHJcbmZ1bmN0aW9uIHJlZ2lzdGVyIChyZXNvdXJjZSkge1xyXG4gIHZhciBzb3VyY2UgPSByZXNvdXJjZS5zb3VyY2U7XHJcblxyXG4gIGlmKCFyZXNvdXJjZXNbc291cmNlXSkge1xyXG4gICAgcmVzb3VyY2VzW3NvdXJjZV0gPSBbXTtcclxuICB9XHJcblxyXG4gIHJlc291cmNlc1tzb3VyY2VdLnB1c2gocmVzb3VyY2UpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRSZXNvdXJjZXMgKHNvdXJjZSkge1xyXG4gIGlmKCFzb3VyY2UpIHtcclxuICAgIHJldHVybiByZXNvdXJjZXM7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gcmVzb3VyY2VzW3NvdXJjZV07XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICByZWdpc3RlcjogcmVnaXN0ZXIsXHJcbiAgZ2V0UmVzb3VyY2VzOiBnZXRSZXNvdXJjZXNcclxufTtcclxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgU2hhdW4gb24gMy8zLzE1XHJcbiAqXHJcbiAqL1xyXG5cclxuaW1wb3J0IFV0aWwgZnJvbSAnLi4vdXRpbC5qcyc7XHJcbmltcG9ydCBSZXNvdXJjZVJlZ2lzdHJ5IGZyb20gJy4vcmVzb3VyY2UtcmVnaXN0cnkuanMnO1xyXG5pbXBvcnQge2lzRnVsbFVybH0gZnJvbSAnLi4vY29tbW9uLmpzJztcclxuXHJcbi8vIG1ldGhvZCBtdXN0IGJlIGFzeW5jaHJvbm91c1xyXG5mdW5jdGlvbiBSZXNvdXJjZSAobWV0aG9kLCBzb3VyY2UpIHtcclxuICB2YXIgc3VjY2Vzc0NhbGxiYWNrcyA9IFtdLFxyXG4gICAgZXJyb3JDYWxsYmFja3MgPSBbXSxcclxuICAgIHJlc291cmNlID0ge1xyXG4gICAgICByZWFkeTogcmVhZHksXHJcbiAgICAgIGZldGNoOiBmZXRjaCxcclxuICAgICAgcHJvbWlzZTogbnVsbCxcclxuICAgICAgc291cmNlOiBzb3VyY2VcclxuICAgIH07XHJcblxyXG4gIGlmKCFVdGlsLmlzRnVuY3Rpb24obWV0aG9kKSkge1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcmVhZHkgKG9uU3VjY2Vzcywgb25FcnJvcikge1xyXG4gICAgaWYoVXRpbC5pc0FycmF5KG9uU3VjY2VzcykpIHtcclxuICAgICAgc3VjY2Vzc0NhbGxiYWNrcyA9IHN1Y2Nlc3NDYWxsYmFja3MuY29uY2F0KG9uU3VjY2Vzcyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzdWNjZXNzQ2FsbGJhY2tzLnB1c2gob25TdWNjZXNzKTtcclxuICAgIH1cclxuXHJcbiAgICBpZihVdGlsLmlzQXJyYXkob25FcnJvcikpIHtcclxuICAgICAgZXJyb3JDYWxsYmFja3MgPSBlcnJvckNhbGxiYWNrcy5jb25jYXQob25FcnJvcik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBlcnJvckNhbGxiYWNrcy5wdXNoKG9uRXJyb3IpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXNvdXJjZTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIG9uU3VjY2VzcyAocmVzdWx0LCBpbmRleCkge1xyXG4gICAgdmFyIHN1Y2Nlc3NDYWxsYmFjayA9IHN1Y2Nlc3NDYWxsYmFja3NbaW5kZXhdO1xyXG4gICAgaWYoIXN1Y2Nlc3NDYWxsYmFjaykge1xyXG4gICAgICBpZihpbmRleCA8IHN1Y2Nlc3NDYWxsYmFja3MubGVuZ3RoKSB7IG9uRXJyb3IocmVzdWx0LCBpbmRleCArIDEpOyB9XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgbmV3UmVzdWx0ID0gc3VjY2Vzc0NhbGxiYWNrKHJlc3VsdCk7XHJcbiAgICBpZihuZXdSZXN1bHQgJiYgbmV3UmVzdWx0LnJlYWR5KSB7XHJcbiAgICAgIG5ld1Jlc3VsdC5yZWFkeShmdW5jdGlvbiAocmVzdWx0KSB7XHJcbiAgICAgICAgb25TdWNjZXNzKHJlc3VsdCwgaW5kZXggKyAxKTtcclxuICAgICAgfSwgZnVuY3Rpb24gKHJlc3VsdCkge1xyXG4gICAgICAgIG9uRXJyb3IocmVzdWx0LCBpbmRleCArIDEpO1xyXG4gICAgICB9KTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfSBlbHNlIGlmKCFuZXdSZXN1bHQpIHtcclxuICAgICAgbmV3UmVzdWx0ID0gcmVzdWx0O1xyXG4gICAgfVxyXG4gICAgb25TdWNjZXNzKG5ld1Jlc3VsdCwgaW5kZXggKyAxKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIG9uRXJyb3IocmVzdWx0LCBpbmRleCkge1xyXG4gICAgdmFyIGVycm9yQ2FsbGJhY2sgPSBlcnJvckNhbGxiYWNrc1tpbmRleF07XHJcbiAgICBpZighZXJyb3JDYWxsYmFjaykge1xyXG4gICAgICBpZihpbmRleCA8IGVycm9yQ2FsbGJhY2tzLmxlbmd0aCkgeyBvbkVycm9yKHJlc3VsdCwgaW5kZXggKyAxKTsgfVxyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgcmVzdWx0ID0gZXJyb3JDYWxsYmFjayhyZXN1bHQpO1xyXG4gICAgaWYocmVzdWx0ICYmIHJlc3VsdC5yZWFkeSkge1xyXG4gICAgICByZXN1bHQucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgb25TdWNjZXNzKHJlc3VsdCwgaW5kZXggKyAxKTtcclxuICAgICAgfSwgZnVuY3Rpb24ocmVzdWx0KSB7XHJcbiAgICAgICAgb25FcnJvcihyZXN1bHQsIGluZGV4ICsgMSk7XHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBvbkVycm9yKHJlc3VsdCwgaW5kZXggKyAxKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGZldGNoIChzb3VyY2UpIHtcclxuICAgIHZhciBwcm9taXNlO1xyXG5cclxuICAgIGlmKFJlc291cmNlLmJhc2VVcmkpIHtcclxuICAgICAgaWYoIWlzRnVsbFVybChzb3VyY2UpKSB7XHJcbiAgICAgICAgc291cmNlID0gUmVzb3VyY2UuYmFzZVVyaSArICcvJyArIHNvdXJjZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByb21pc2UgPSBtZXRob2Qoc291cmNlKTtcclxuXHJcbiAgICBpZighVXRpbC5pc09iamVjdChwcm9taXNlKSB8fCAhcHJvbWlzZS50aGVuKSB7XHJcbiAgICAgIFV0aWwuZXJyb3IoJ1Byb3ZpZGVkIHJlc291cmNlIG1ldGhvZCBkaWQgbm90IHJldHVybiBhIHRoZW5hYmxlIG9iamVjdCcpO1xyXG4gICAgfVxyXG5cclxuICAgIHJlc291cmNlLnNvdXJjZSA9IHNvdXJjZTtcclxuICAgIHJlc291cmNlLnByb21pc2UgPSBwcm9taXNlLnRoZW4oXHJcbiAgICAgIGZ1bmN0aW9uKHJlc3VsdCkge1xyXG4gICAgICAgIG9uU3VjY2VzcyhyZXN1bHQsIDApO1xyXG4gICAgICB9LFxyXG4gICAgICBmdW5jdGlvbihyZXN1bHQpIHtcclxuICAgICAgICBvbkVycm9yKHJlc3VsdCwgMCk7XHJcbiAgICAgIH1cclxuICAgICk7XHJcblxyXG4gICAgcmV0dXJuIHJlc291cmNlO1xyXG4gIH1cclxuXHJcbiAgUmVzb3VyY2VSZWdpc3RyeS5yZWdpc3RlcihyZXNvdXJjZSk7XHJcblxyXG4gIC8vcmV0dXJuIGZldGNoKCk7XHJcbiAgcmV0dXJuIChzb3VyY2UpID8gcmVzb3VyY2UuZmV0Y2goc291cmNlKSA6IHJlc291cmNlO1xyXG59XHJcblxyXG5SZXNvdXJjZS5iYXNlVXJpID0gJyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBSZXNvdXJjZTtcclxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgU2hhdW4gb24gMi8xLzE1XHJcbiAqIEJhc2VkIG9uIHRoZSBqYWNrMmQgQ2hyb25vIG9iamVjdFxyXG4gKiBcclxuICovXHJcblxyXG5pbXBvcnQgVXRpbCBmcm9tICcuL3V0aWwuanMnO1xyXG5pbXBvcnQge21lcmdlT2JqZWN0fSBmcm9tICcuL2NvbW1vbi5qcyc7XHJcblxyXG52YXIgaW5zdGFuY2U7XHJcbnZhciBPTkVfU0VDT05EID0gMTAwMDtcclxuXHJcbmZ1bmN0aW9uIFNjaGVkdWxlcihjYiwgcmF0ZSkge1xyXG4gIGlmKCFpbnN0YW5jZSkge1xyXG4gICAgaW5zdGFuY2UgPSBjcmVhdGUoKTtcclxuICB9XHJcbiAgaWYoY2IpIHtcclxuICAgIGluc3RhbmNlLnNjaGVkdWxlKGNiLCByYXRlKTtcclxuICB9XHJcbiAgcmV0dXJuIGluc3RhbmNlO1xyXG59XHJcblxyXG5TY2hlZHVsZXIuaW5zdGFuY2UgPSBjcmVhdGU7XHJcblxyXG5mdW5jdGlvbiBjcmVhdGUoKSB7XHJcbiAgcmV0dXJuIG1lcmdlT2JqZWN0KHtcclxuICAgIHNjaGVkdWxlZDogW10sXHJcbiAgICBzY2hlZHVsZTogc2NoZWR1bGUsXHJcbiAgICB1bnNjaGVkdWxlOiB1bnNjaGVkdWxlLFxyXG4gICAgc3RhcnQ6IHN0YXJ0LFxyXG4gICAgc3RvcDogc3RvcCxcclxuICAgIGZyYW1lOiBmcmFtZSxcclxuICAgIGlkOiBpZFxyXG4gIH0pLnN0YXJ0KCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNjaGVkdWxlKGNiLCByYXRlKSB7XHJcbiAgZnVuY3Rpb24gc2V0UmF0ZShuZXdSYXRlKSB7XHJcbiAgICByYXRlID0gbmV3UmF0ZTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIG1ha2VGcmFtZSgpIHtcclxuICAgIHZhciBjb3VudCA9IDEsXHJcbiAgICAgIHRvdGFsRGVsdGFUaW1lID0gMDtcclxuXHJcbiAgICByZXR1cm4gZnVuY3Rpb24oZGVsdGFUaW1lKSB7XHJcbiAgICAgIHRvdGFsRGVsdGFUaW1lICs9IGRlbHRhVGltZTtcclxuICAgICAgaWYoY291bnQgIT09IHJhdGUpIHtcclxuICAgICAgICBjb3VudCsrO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICBjYih0b3RhbERlbHRhVGltZSwgc2V0UmF0ZSk7XHJcbiAgICAgIGNvdW50ID0gMTtcclxuICAgICAgdG90YWxEZWx0YVRpbWUgPSAwO1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIGlmKCFVdGlsLmlzRnVuY3Rpb24oY2IpKSB7XHJcbiAgICBVdGlsLmVycm9yKCdTY2hlZHVsZXI6IG9ubHkgZnVuY3Rpb25zIGNhbiBiZSBzY2hlZHVsZWQuJyk7XHJcbiAgfVxyXG4gIHJhdGUgPSByYXRlIHx8IDE7XHJcblxyXG4gIHRoaXMuc2NoZWR1bGVkLnB1c2gobWFrZUZyYW1lKCkpO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuZnVuY3Rpb24gaWQoKSB7XHJcbiAgcmV0dXJuIHRoaXMuc2NoZWR1bGVkLmxlbmd0aDtcclxufVxyXG5cclxuZnVuY3Rpb24gdW5zY2hlZHVsZShpZCkge1xyXG4gIHRoaXMuc2NoZWR1bGVkLnNwbGljZShpZCAtIDEsIDEpO1xyXG4gIHJldHVybiB0aGlzO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzdGFydCgpIHtcclxuICBpZih0aGlzLnJ1bm5pbmcpIHtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgbWVyZ2VPYmplY3Qoe1xyXG4gICAgYWN0dWFsRnBzOiAwLFxyXG4gICAgdGlja3M6IDAsXHJcbiAgICBlbGFwc2VkU2Vjb25kczogMCxcclxuICAgIHJ1bm5pbmc6IHRydWUsXHJcbiAgICBsYXN0VXBkYXRlVGltZTogbmV3IERhdGUoKSxcclxuICAgIG9uZVNlY29uZFRpbWVySWQ6IHdpbmRvdy5zZXRJbnRlcnZhbChvbk9uZVNlY29uZC5iaW5kKHRoaXMpLCBPTkVfU0VDT05EKVxyXG4gIH0sIHRoaXMpO1xyXG5cclxuICByZXR1cm4gdGhpcy5mcmFtZSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzdG9wKCkge1xyXG4gIHRoaXMucnVubmluZyA9IGZhbHNlO1xyXG4gIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMub25lU2Vjb25kVGltZXJJZCk7XHJcbiAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuYW5pbWF0aW9uRnJhbWVJZCk7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjbGVhcigpIHtcclxuICB0aGlzLnNjaGVkdWxlZC5sZW5ndGggPSAwO1xyXG4gIHJldHVybiB0aGlzO1xyXG59XHJcblxyXG5mdW5jdGlvbiBmcmFtZSgpIHtcclxuICBleGVjdXRlRnJhbWVDYWxsYmFja3MuYmluZCh0aGlzKShnZXREZWx0YVRpbWUuYmluZCh0aGlzKSgpKTtcclxuICB0aGlzLnRpY2tzKys7XHJcblxyXG4gIGlmKHRoaXMucnVubmluZykge1xyXG4gICAgdGhpcy5hbmltYXRpb25GcmFtZUlkID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShmcmFtZS5iaW5kKHRoaXMpKTtcclxuICB9XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59XHJcblxyXG5mdW5jdGlvbiBvbk9uZVNlY29uZCgpIHtcclxuICB0aGlzLmFjdHVhbEZwcyA9IHRoaXMudGlja3M7XHJcbiAgdGhpcy50aWNrcyA9IDA7XHJcbiAgdGhpcy5lbGFwc2VkU2Vjb25kcysrO1xyXG59XHJcblxyXG5mdW5jdGlvbiBleGVjdXRlRnJhbWVDYWxsYmFja3MoZGVsdGFUaW1lKSB7XHJcbiAgdmFyIHNjaGVkdWxlZCA9IHRoaXMuc2NoZWR1bGVkO1xyXG5cclxuICBmb3IodmFyIGkgPSAwLCBudW1TY2hlZHVsZWQgPSBzY2hlZHVsZWQubGVuZ3RoOyBpIDwgbnVtU2NoZWR1bGVkOyBpKyspIHtcclxuICAgIHNjaGVkdWxlZFtpXShkZWx0YVRpbWUpO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0RGVsdGFUaW1lKCkge1xyXG4gIHZhciBub3cgPSArbmV3IERhdGUoKTtcclxuICB2YXIgZGVsdGFUaW1lID0gKG5vdyAtIHRoaXMubGFzdFVwZGF0ZVRpbWUpIC8gT05FX1NFQ09ORDtcclxuXHJcbiAgdGhpcy5sYXN0VXBkYXRlVGltZSA9IG5vdztcclxuXHJcbiAgcmV0dXJuIGRlbHRhVGltZTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgU2NoZWR1bGVyO1xyXG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBTaGF1biBvbiA0LzIzLzIwMTUuXHJcbiAqL1xyXG5cclxudmFyIHR5cGVzID0gWydBcnJheScsICdPYmplY3QnLCAnQm9vbGVhbicsICdBcmd1bWVudHMnLCAnRnVuY3Rpb24nLCAnU3RyaW5nJywgJ051bWJlcicsICdEYXRlJywgJ1JlZ0V4cCddO1xyXG5cclxudmFyIFV0aWwgPSB7XHJcbiAgaXNEZWZpbmVkOiBmdW5jdGlvbiAodmFsdWUpIHsgcmV0dXJuIHR5cGVvZiB2YWx1ZSAhPSAndW5kZWZpbmVkJyB9LFxyXG4gIGRlZjogZnVuY3Rpb24gKHZhbHVlLCBkZWZhdWx0VmFsdWUpIHsgcmV0dXJuICh0eXBlb2YgdmFsdWUgPT0gJ3VuZGVmaW5lZCcpID8gZGVmYXVsdFZhbHVlIDogdmFsdWUgfSxcclxuICBlcnJvcjogZnVuY3Rpb24gKG1lc3NhZ2UpIHsgdGhyb3cgbmV3IEVycm9yKGlkICsgJzogJyArIG1lc3NhZ2UpIH0sXHJcbiAgd2FybjogZnVuY3Rpb24gKG1lc3NhZ2UpIHsgVXRpbC5sb2coJ1dhcm5pbmc6ICcgKyBtZXNzYWdlKSB9LFxyXG4gIGxvZzogZnVuY3Rpb24gKG1lc3NhZ2UpIHsgaWYoY29uZmlnLmxvZykgeyBjb25zb2xlLmxvZyhpZCArICc6ICcgKyBtZXNzYWdlKSB9IH0sXHJcbiAgYXJnc1RvQXJyYXk6IGZ1bmN0aW9uIChhcmdzKSB7IHJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmdzKSB9LFxyXG4gIHJhbmQ6IGZ1bmN0aW9uIChtYXgsIG1pbikgeyAvLyBtb3ZlIHRvIGV4dHJhP1xyXG4gICAgbWluID0gbWluIHx8IDA7XHJcbiAgICBpZihtaW4gPiBtYXgpIHsgVXRpbC5lcnJvcigncmFuZDogaW52YWxpZCByYW5nZS4nKTsgfVxyXG4gICAgcmV0dXJuIE1hdGguZmxvb3IoKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpKSArIChtaW4pO1xyXG4gIH1cclxufTtcclxuXHJcbmZvcih2YXIgaSA9IDA7IGkgPCB0eXBlcy5sZW5ndGg7IGkrKykge1xyXG4gIFV0aWxbJ2lzJyArIHR5cGVzW2ldXSA9IChmdW5jdGlvbih0eXBlKSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqKSB7XHJcbiAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PSAnW29iamVjdCAnICsgdHlwZSArICddJztcclxuICAgIH07XHJcbiAgfSkodHlwZXNbaV0pO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBVdGlsOyIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IFNoYXVuIG9uIDMvMS8xNVxyXG4gKlxyXG4gKi9cclxuXHJcbmltcG9ydCB7Z2V0Q2FudmFzLCBnZXRUcmFuc3BhcmVudEltYWdlfSBmcm9tICcuLi9jb21tb24uanMnO1xyXG5cclxuY29uc3QgREVGQVVMVF9SQVRFID0gNTtcclxuXHJcbmZ1bmN0aW9uIGJ1aWxkRnJhbWVTZXF1ZW5jZShmcmFtZVNldERlZmluaXRpb24sIGZyYW1lU2l6ZSwgc3ByaXRlU2hlZXQpIHtcclxuICB2YXIgZnJhbWVXaWR0aCA9IGZyYW1lU2l6ZS53aWR0aDtcclxuICB2YXIgZnJhbWVIZWlnaHQgPSBmcmFtZVNpemUuaGVpZ2h0O1xyXG5cclxuICByZXR1cm4ge1xyXG4gICAgcmF0ZTogZnJhbWVTZXREZWZpbml0aW9uLnJhdGUgfHwgREVGQVVMVF9SQVRFLFxyXG4gICAgZnJhbWVzOiBmcmFtZVNldERlZmluaXRpb24uZnJhbWVzXHJcbiAgICAgIC5tYXAoZnVuY3Rpb24oZnJhbWVEZWZpbml0aW9uKSB7XHJcbiAgICAgICAgdmFyIGZyYW1lID0gZ2V0Q2FudmFzKGZyYW1lV2lkdGgsIGZyYW1lSGVpZ2h0KTtcclxuXHJcbiAgICAgICAgZnJhbWVcclxuICAgICAgICAgIC5nZXRDb250ZXh0KCcyZCcpXHJcbiAgICAgICAgICAuZHJhd0ltYWdlKFxyXG4gICAgICAgICAgICBzcHJpdGVTaGVldCxcclxuICAgICAgICAgICAgZnJhbWVEZWZpbml0aW9uLngsIGZyYW1lRGVmaW5pdGlvbi55LFxyXG4gICAgICAgICAgICBmcmFtZVdpZHRoLCBmcmFtZUhlaWdodCxcclxuICAgICAgICAgICAgMCwgMCxcclxuICAgICAgICAgICAgZnJhbWVXaWR0aCwgZnJhbWVIZWlnaHRcclxuICAgICAgICAgICk7XHJcblxyXG4gICAgICAgIHJldHVybiBmcmFtZTtcclxuICAgICAgfSlcclxuICB9O1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoc3ByaXRlRGVmaW5pdGlvbiwgc3ByaXRlU2hlZXQpIHtcclxuICByZXR1cm4gT2JqZWN0XHJcbiAgICAua2V5cyhzcHJpdGVEZWZpbml0aW9uLmZyYW1lU2V0KVxyXG4gICAgLnJlZHVjZShmdW5jdGlvbihmcmFtZVNldCwgZnJhbWVTZXRJZCkge1xyXG4gICAgICB2YXIgZnJhbWVTZXF1ZW5jZSA9IGJ1aWxkRnJhbWVTZXF1ZW5jZShcclxuICAgICAgICBzcHJpdGVEZWZpbml0aW9uLmZyYW1lU2V0W2ZyYW1lU2V0SWRdLFxyXG4gICAgICAgIHNwcml0ZURlZmluaXRpb24uZnJhbWVTaXplLFxyXG4gICAgICAgIHNwcml0ZVNoZWV0XHJcbiAgICAgICk7XHJcblxyXG4gICAgICBmcmFtZVNlcXVlbmNlLmZyYW1lcyA9IGZyYW1lU2VxdWVuY2UuZnJhbWVzXHJcbiAgICAgICAgLm1hcChmdW5jdGlvbihmcmFtZSkge1xyXG4gICAgICAgICAgcmV0dXJuIGdldFRyYW5zcGFyZW50SW1hZ2Uoc3ByaXRlRGVmaW5pdGlvbi50cmFuc3BhcmVudENvbG9yLCBmcmFtZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICBmcmFtZVNldFtmcmFtZVNldElkXSA9IGZyYW1lU2VxdWVuY2U7XHJcblxyXG4gICAgICByZXR1cm4gZnJhbWVTZXQ7XHJcbiAgICB9LCB7fSk7XHJcbn07XHJcbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IFNoYXVuIG9uIDQvMjUvMjAxNS5cclxuICovXHJcblxyXG5pbXBvcnQgSHR0cFJlc291cmNlIGZyb20gJy4uL3Jlc291cmNlcy9odHRwLXJlc291cmNlLmpzJztcclxuaW1wb3J0IEltYWdlUmVzb3VyY2UgZnJvbSAnLi4vcmVzb3VyY2VzL2ltYWdlLXJlc291cmNlLmpzJztcclxuaW1wb3J0IFNwcml0ZXMgZnJvbSAnLi9zcHJpdGVzLmpzJztcclxuaW1wb3J0IFJlc291cmNlIGZyb20gJy4uL3Jlc291cmNlcy9yZXNvdXJjZS5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoc2NlbmVVcmkpIHtcclxuICAvL1Jlc291cmNlLmJhc2VVcmkgPSBiYXNlVXJpO1xyXG5cclxuICByZXR1cm4gSHR0cFJlc291cmNlKHNjZW5lVXJpKS5yZWFkeShmdW5jdGlvbihzY2VuZURhdGEpIHtcclxuICAgIHZhciBsYXllckRlZmluaXRpb25zID0gc2NlbmVEYXRhLmxheWVyRGVmaW5pdGlvbnM7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgc2NlbmVEYXRhOiBzY2VuZURhdGEsXHJcbiAgICAgIGJhY2tncm91bmQ6IEltYWdlUmVzb3VyY2UobGF5ZXJEZWZpbml0aW9ucy5iYWNrZ3JvdW5kLmJhY2tncm91bmRVcmwpLFxyXG4gICAgICBzcHJpdGU6IFNwcml0ZXMobGF5ZXJEZWZpbml0aW9ucy5lbnRpdGllcy5zcHJpdGVzKVxyXG4gICAgfTtcclxuICB9KTtcclxufVxyXG5cclxuLypleHBvcnQgZGVmYXVsdCBjbGFzcyBTY2VuZSB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICB0aGlzLnJlc291cmNlID0gSHR0cFJlc291cmNlKCkucmVhZHkoZnVuY3Rpb24oc2NlbmVEYXRhKSB7XHJcbiAgICAgIHZhciBsYXllckRlZmluaXRpb25zID0gc2NlbmVEYXRhLmxheWVyRGVmaW5pdGlvbnM7XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHNjZW5lRGF0YTogc2NlbmVEYXRhLFxyXG4gICAgICAgIGJhY2tncm91bmQ6IEltYWdlUmVzb3VyY2UoKS5mZXRjaChsYXllckRlZmluaXRpb25zLmJhY2tncm91bmQuYmFja2dyb3VuZFVybClcclxuICAgICAgICAvL3Nwcml0ZTogU3ByaXRlcyhsYXllckRlZmluaXRpb25zLmVudGl0aWVzLnNwcml0ZXMpXHJcbiAgICAgIH07XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGxvYWQoc2NlbmVVcmksIGJhc2VVcmkpIHtcclxuICAgIFJlc291cmNlLmJhc2VVcmkgPSBiYXNlVXJpO1xyXG4gICAgcmV0dXJuIHRoaXMucmVzb3VyY2UuZmV0Y2goc2NlbmVVcmkpO1xyXG4gIH1cclxuXHJcbiAgcmVhZHkob25TdWNjZXNzLCBvbkVycm9yKSB7XHJcbiAgICByZXR1cm4gdGhpcy5yZXNvdXJjZS5yZWFkeShvblN1Y2Nlc3MsIG9uRXJyb3IpO1xyXG4gIH1cclxufSovXHJcbiIsImltcG9ydCBTY2hlZHVsZXIgZnJvbSAnLi4vc2NoZWR1bGVyLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChmcmFtZVNldCkge1xyXG4gIHZhciBjdXJyZW50RnJhbWVTZXF1ZW5jZSA9IG51bGwsXHJcbiAgICBjdXJyZW50RnJhbWVJbmRleCA9IDAsXHJcbiAgICBjdXJyZW50RnJhbWUgPSBudWxsLFxyXG4gICAgZnJhbWVDYWxsYmFjayA9IG51bGw7XHJcblxyXG4gIHZhciBzY2hlZHVsZXJJZCA9IFNjaGVkdWxlcihmdW5jdGlvbihkZWx0YVRpbWUsIHNldFJhdGUpIHtcclxuICAgIGlmKCFjdXJyZW50RnJhbWVTZXF1ZW5jZSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgaWYoIWN1cnJlbnRGcmFtZSkge1xyXG4gICAgICBzZXRSYXRlKGN1cnJlbnRGcmFtZVNlcXVlbmNlLnJhdGUpO1xyXG4gICAgfVxyXG5cclxuICAgIGN1cnJlbnRGcmFtZSA9IGN1cnJlbnRGcmFtZVNlcXVlbmNlLmZyYW1lc1tjdXJyZW50RnJhbWVJbmRleF1cclxuICAgIGlmKGZyYW1lQ2FsbGJhY2spIHtcclxuICAgICAgZnJhbWVDYWxsYmFjayhjdXJyZW50RnJhbWUpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmKCsrY3VycmVudEZyYW1lSW5kZXggPj0gY3VycmVudEZyYW1lU2VxdWVuY2UuZnJhbWVzLmxlbmd0aCkge1xyXG4gICAgICBjdXJyZW50RnJhbWVJbmRleCA9IDA7XHJcbiAgICB9XHJcbiAgfSlcclxuICAgIC5pZCgpO1xyXG5cclxuICByZXR1cm4ge1xyXG4gICAgcGxheTogZnVuY3Rpb24oZnJhbWVTZXRJZCkge1xyXG4gICAgICBjdXJyZW50RnJhbWVTZXF1ZW5jZSA9IGZyYW1lU2V0W2ZyYW1lU2V0SWRdO1xyXG4gICAgICBjdXJyZW50RnJhbWVJbmRleCA9IDA7XHJcbiAgICAgIGN1cnJlbnRGcmFtZSA9IG51bGw7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuICAgIG9uRnJhbWU6IGZ1bmN0aW9uKGNiKSB7XHJcbiAgICAgIGZyYW1lQ2FsbGJhY2sgPSBjYjtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG4gICAgc3RvcDogZnVuY3Rpb24oKSB7XHJcbiAgICAgIGN1cnJlbnRGcmFtZVNlcXVlbmNlID0gbnVsbDtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG4gICAga2lsbDogZnVuY3Rpb24oKSB7XHJcbiAgICAgIHNjaGVkdWxlci51bnNjaGVkdWxlKHNjaGVkdWxlcklkKTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG4gICAgY3VycmVudEZyYW1lSW5kZXg6IGZ1bmN0aW9uKCkge1xyXG4gICAgICByZXR1cm4gY3VycmVudEZyYW1lSW5kZXg7XHJcbiAgICB9LFxyXG4gICAgZ2V0SW1hZ2U6IGZ1bmN0aW9uKCkge1xyXG4gICAgICByZXR1cm4gY3VycmVudEZyYW1lO1xyXG4gICAgfVxyXG4gIH07XHJcbn1cclxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgU2hhdW4gb24gNS8zMS8xNC5cclxuICpcclxuICovXHJcblxyXG5pbXBvcnQgSW1hZ2VSZXNvdXJjZSBmcm9tICcuLi9yZXNvdXJjZXMvaW1hZ2UtcmVzb3VyY2UuanMnO1xyXG5pbXBvcnQgRnJhbWVTZXQgZnJvbSAnLi9mcmFtZS1zZXQuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKHNwcml0ZURlZmluaXRpb24pIHtcclxuICByZXR1cm4gSW1hZ2VSZXNvdXJjZShzcHJpdGVEZWZpbml0aW9uLnNwcml0ZVNoZWV0VXJsKVxyXG4gICAgLnJlYWR5KGZ1bmN0aW9uIChzcHJpdGVTaGVldCkge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHNwcml0ZVNoZWV0OiBzcHJpdGVTaGVldCxcclxuICAgICAgICBkZWZpbml0aW9uOiBzcHJpdGVEZWZpbml0aW9uLFxyXG4gICAgICAgIGZyYW1lU2V0OiBGcmFtZVNldChzcHJpdGVEZWZpbml0aW9uLCBzcHJpdGVTaGVldClcclxuICAgICAgfTtcclxuICAgIH0pO1xyXG59O1xyXG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBTaGF1biBvbiAzLzcvMTVcclxuICpcclxuICovXHJcblxyXG5pbXBvcnQge21lcmdlT2JqZWN0fSBmcm9tICcuLi9jb21tb24uanMnO1xyXG5pbXBvcnQgSHR0cFJlc291cmNlIGZyb20gJy4uL3Jlc291cmNlcy9odHRwLXJlc291cmNlLmpzJztcclxuaW1wb3J0IE11bHRpUmVzb3VyY2UgZnJvbSAnLi4vcmVzb3VyY2VzL211bHRpLXJlc291cmNlLmpzJztcclxuaW1wb3J0IFNwcml0ZSBmcm9tICcuL3Nwcml0ZS5qcyc7XHJcbmltcG9ydCBTcHJpdGVBbmltYXRpb24gZnJvbSAnLi9zcHJpdGUtYW5pbWF0aW9uLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChzcHJpdGVzRGF0YSkge1xyXG4gIHJldHVybiBNdWx0aVJlc291cmNlKHNwcml0ZXNEYXRhKVxyXG4gICAgLmVhY2goZnVuY3Rpb24oc3ByaXRlRGF0YSkge1xyXG4gICAgICByZXR1cm4gSHR0cFJlc291cmNlKHNwcml0ZURhdGEuc3JjKVxyXG4gICAgICAvL3JldHVybiBIdHRwUmVzb3VyY2UoKVxyXG4gICAgICAgIC5yZWFkeShTcHJpdGUpXHJcbiAgICAgICAgLnJlYWR5KGZ1bmN0aW9uIChzcHJpdGUpIHtcclxuICAgICAgICAgIHNwcml0ZSA9IG1lcmdlT2JqZWN0KHNwcml0ZURhdGEsIHNwcml0ZSk7XHJcbiAgICAgICAgICBzcHJpdGUuYW5pbWF0aW9uID0gU3ByaXRlQW5pbWF0aW9uKHNwcml0ZS5mcmFtZVNldCk7XHJcblxyXG4gICAgICAgICAgcmV0dXJuIHNwcml0ZTtcclxuICAgICAgICB9KTtcclxuICB9KTtcclxufTtcclxuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IHNoYXVud2VzdCBvbiA1LzQvMTUuXG4gKi9cblxuaW1wb3J0IHtGcmFnbWVudH0gZnJvbSAnLi4vZW5naW5lL2ZyYWdtZW50cy5qcydcbmltcG9ydCB7dXNlfSBmcm9tICcuLi9lbmdpbmUvaW5qZWN0b3IuanMnXG5pbXBvcnQgU2NlbmUgZnJvbSAnLi4vZW5naW5lL3dvcmxkL3NjZW5lLmpzJ1xuaW1wb3J0IFNjaGVkdWxlciBmcm9tICcuLi9lbmdpbmUvc2NoZWR1bGVyLmpzJ1xuaW1wb3J0IEJhY2tncm91bmRMYXllciBmcm9tICcuLi9lbmdpbmUvbGF5ZXJzL2JhY2tncm91bmQtbGF5ZXIuanMnXG5pbXBvcnQgdmlld3BvcnQgZnJvbSAnLi4vdmlld3BvcnQuanMnXG5cbkB1c2UoU2NlbmUpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCYWNrZ3JvdW5kMSB7XG4gIGNvbnN0cnVjdG9yKHNjZW5lKSB7XG4gICAgdmFyIGNhbnZhc0JhY2tncm91bmQgPSBGcmFnbWVudCgnY2FudmFzLWJhY2tncm91bmQnKTtcbiAgICB2YXIgYmFja2dyb3VuZExheWVyID0gbmV3IEJhY2tncm91bmRMYXllcihjYW52YXNCYWNrZ3JvdW5kKTtcblxuICAgIFNjaGVkdWxlcihmdW5jdGlvbiAoKSB7XG4gICAgICBiYWNrZ3JvdW5kTGF5ZXIuZHJhdyh2aWV3cG9ydCk7XG4gICAgfSk7XG5cbiAgICBzY2VuZS5yZWFkeShmdW5jdGlvbiAoc2NlbmUxKSB7XG4gICAgICBzY2VuZTEuYmFja2dyb3VuZC5yZWFkeShmdW5jdGlvbiAoYmFja2dyb3VuZCkge1xuICAgICAgICBiYWNrZ3JvdW5kTGF5ZXIuc2V0QmFja2dyb3VuZChiYWNrZ3JvdW5kKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5iYWNrZ3JvdW5kTGF5ZXIgPSBiYWNrZ3JvdW5kTGF5ZXI7XG4gIH1cblxuICBnZXQgbGF5ZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuYmFja2dyb3VuZExheWVyO1xuICB9XG59IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IHNoYXVud2VzdCBvbiA1LzQvMTUuXG4gKi9cblxuaW1wb3J0IHtGcmFnbWVudH0gZnJvbSAnLi4vZW5naW5lL2ZyYWdtZW50cy5qcydcbmltcG9ydCB7dXNlfSBmcm9tICcuLi9lbmdpbmUvaW5qZWN0b3IuanMnXG5pbXBvcnQgU2NlbmUgZnJvbSAnLi4vZW5naW5lL3dvcmxkL3NjZW5lLmpzJ1xuaW1wb3J0IFNjaGVkdWxlciBmcm9tICcuLi9lbmdpbmUvc2NoZWR1bGVyLmpzJ1xuaW1wb3J0IENvbGxpc2lvbkxheWVyIGZyb20gJy4uL2VuZ2luZS9sYXllcnMvY29sbGlzaW9uLWxheWVyLmpzJ1xuaW1wb3J0IHZpZXdwb3J0IGZyb20gJy4uL3ZpZXdwb3J0LmpzJ1xuXG5AdXNlKFNjZW5lKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29sbGlzaW9uMSB7XG4gIGNvbnN0cnVjdG9yKHNjZW5lKSB7XG4gICAgdmFyIGNhbnZhc0NvbGxpZGVycyA9IEZyYWdtZW50KCdjYW52YXMtY29sbGlkZXJzJyk7XG4gICAgdmFyIGNvbGxpc2lvbkxheWVyID0gbmV3IENvbGxpc2lvbkxheWVyKGNhbnZhc0NvbGxpZGVycyk7XG5cbiAgICBTY2hlZHVsZXIoZnVuY3Rpb24gKCkge1xuICAgICAgY29sbGlzaW9uTGF5ZXIuZHJhdyh2aWV3cG9ydCk7XG4gICAgfSk7XG5cbiAgICBzY2VuZS5yZWFkeShmdW5jdGlvbihzY2VuZSkge1xuICAgICAgY29sbGlzaW9uTGF5ZXIuc2V0Q29sbGlkZXJzKHNjZW5lLnNjZW5lRGF0YS5sYXllckRlZmluaXRpb25zLmNvbGxpc2lvbnMuY29sbGlkZXJzKTtcbiAgICB9KTtcblxuICAgIHRoaXMuY29sbGlzaW9uTGF5ZXIgPSBjb2xsaXNpb25MYXllcjtcbiAgfVxuXG4gIGdldCBsYXllcigpIHtcbiAgICByZXR1cm4gdGhpcy5jb2xsaXNpb25MYXllcjtcbiAgfVxufSIsIi8qKlxuICogQ3JlYXRlZCBieSBzaGF1bndlc3Qgb24gNS80LzE1LlxuICovXG5cbmltcG9ydCB7dXNlfSBmcm9tICcuLi9lbmdpbmUvaW5qZWN0b3IuanMnXG5pbXBvcnQge0ZyYWdtZW50fSBmcm9tICcuLi9lbmdpbmUvZnJhZ21lbnRzLmpzJ1xuaW1wb3J0IFNjZW5lIGZyb20gJy4uL2VuZ2luZS93b3JsZC9zY2VuZS5qcydcbmltcG9ydCBTY2hlZHVsZXIgZnJvbSAnLi4vZW5naW5lL3NjaGVkdWxlci5qcydcbmltcG9ydCBFbnRpdHlMYXllciBmcm9tICcuLi9lbmdpbmUvbGF5ZXJzL2VudGl0eS1sYXllci5qcydcbmltcG9ydCB2aWV3cG9ydCBmcm9tICcuLi92aWV3cG9ydC5qcydcblxuQHVzZShTY2VuZSlcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVudGl0eTEge1xuICBjb25zdHJ1Y3RvcihzY2VuZSkge1xuICAgIHZhciBjYW52YXNFbnRpdGllcyA9IEZyYWdtZW50KCdjYW52YXMtZW50aXRpZXMnKTtcbiAgICB2YXIgZW50aXR5TGF5ZXIgPSBuZXcgRW50aXR5TGF5ZXIoY2FudmFzRW50aXRpZXMpO1xuXG4gICAgU2NoZWR1bGVyKGZ1bmN0aW9uICgpIHtcbiAgICAgIGVudGl0eUxheWVyLmRyYXcodmlld3BvcnQpO1xuICAgIH0pO1xuXG4gICAgZW50aXR5TGF5ZXIuY2xlYXIoKTtcbiAgICBzY2VuZS5yZWFkeShmdW5jdGlvbihzY2VuZTEpIHtcbiAgICAgIHNjZW5lMS5zcHJpdGUucmVhZHkoZnVuY3Rpb24gKHNwcml0ZSkge1xuICAgICAgICBzcHJpdGUuYW5pbWF0aW9uLnBsYXkoJ3J1bicpO1xuICAgICAgICBlbnRpdHlMYXllci5hZGRFbnRpdHkoc3ByaXRlKTtcbiAgICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25zb2xlLmxvZygnRVJST1IhIScpXG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHRoaXMuZW50aXR5TGF5ZXIgPSBlbnRpdHlMYXllcjtcbiAgfVxuXG4gIGdldCBsYXllcigpIHtcbiAgICByZXR1cm4gdGhpcy5lbnRpdHlMYXllcjtcbiAgfVxufVxuXG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgc2hhdW53ZXN0IG9uIDUvNC8xNS5cbiAqL1xuXG5pbXBvcnQge3VzZX0gZnJvbSAnLi9lbmdpbmUvaW5qZWN0b3IuanMnXG5pbXBvcnQgU2NlbmUgZnJvbSAnLi9lbmdpbmUvd29ybGQvc2NlbmUuanMnXG5pbXBvcnQgUmVzb3VyY2UgZnJvbSAnLi9lbmdpbmUvcmVzb3VyY2VzL3Jlc291cmNlLmpzJ1xuaW1wb3J0IEJhY2tncm91bmQxIGZyb20gJy4vbGF5ZXJzL2JhY2tncm91bmQxLmpzJ1xuaW1wb3J0IEVudGl0eTEgZnJvbSAnLi9sYXllcnMvZW50aXR5MS5qcydcbmltcG9ydCBDb2xsaXNpb24xIGZyb20gJy4vbGF5ZXJzL2NvbGxpc2lvbjEuanMnXG5cbkB1c2UoQmFja2dyb3VuZDEsIEVudGl0eTEsIENvbGxpc2lvbjEsIFNjZW5lKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTG9hZGVyIHtcbiAgY29uc3RydWN0b3IoYmFja2dyb3VuZExheWVyMSwgZW50aXR5TGF5ZXIxLCBjb2xsaXNpb25MYXllcjEsIHNjZW5lKSB7XG4gICAgdGhpcy5iYWNrZ3JvdW5kTGF5ZXIxID0gYmFja2dyb3VuZExheWVyMTtcbiAgICB0aGlzLmVudGl0eUxheWVyMSA9IGVudGl0eUxheWVyMTtcbiAgICB0aGlzLmNvbGxpc2lvbkxheWVyMSA9IGNvbGxpc2lvbkxheWVyMTtcbiAgICB0aGlzLnNjZW5lID0gc2NlbmU7XG4gIH1cblxuICBnZXRTY2VuZShzY2VuZUZpbGUsIGJhc2VEaXIpIHtcbiAgICBSZXNvdXJjZS5iYXNlVXJpID0gYmFzZURpcjtcbiAgICAvL3RoaXMuc2NlbmUubG9hZChzY2VuZUZpbGUsIGJhc2VEaXIpO1xuICAgIHRoaXMuc2NlbmUuZmV0Y2goc2NlbmVGaWxlKTtcbiAgfVxufSIsIlwidXNlIHN0cmljdFwiO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKemIzVnlZMlZ6SWpwYlhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWlJc0ltWnBiR1VpT2lJdlZYTmxjbk12YzJoaGRXNTNaWE4wTDJGd2NITXZhMmwwZEdsbGN5OXpjbU12ZG1sbGR5NXFjeUlzSW5OdmRYSmpaWE5EYjI1MFpXNTBJanBiWFgwPSIsIi8qKlxuICogQ3JlYXRlZCBieSBzaGF1bndlc3Qgb24gNS80LzE1LlxuICovXG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgeDogMCxcbiAgeTogMCxcbiAgd2lkdGg6IDYwMCxcbiAgaGVpZ2h0OiA0MDBcbn07Il19

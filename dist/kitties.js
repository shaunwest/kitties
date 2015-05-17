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

/*var sceneSchema = SceneSchema();

HttpResource('kitty-world.json')
  .ready(function(sceneData) {
    var scene = sceneSchema.map(sceneData);
    console.log(scene);
    Scene(scene);
  });*/

_SceneSchema2['default']();
_SpriteSchema2['default']();

/*var spriteSchema = SpriteSchema();

HttpResource('kitty.json')
  .ready(function(spriteData) {
    var sprite = spriteSchema.map(spriteData);
    console.log(sprite);
  });*/

},{"./engine/container.js":5,"./engine/fragments.js":8,"./engine/resources/http-resource.js":14,"./engine/resources/resource.js":18,"./scene.js":26,"./schema/scene-schema.js":27,"./schema/sprite-schema.js":28}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
/**
 * Created by Shaun on 3/1/15
 *
 */

var _getCanvas$getTransparentImage = require('../engine/common.js');

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

},{"../engine/common.js":4}],3:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _Scheduler = require('../engine/scheduler.js');

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
      _Scheduler2['default'].unschedule(schedulerId);
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

},{"../engine/scheduler.js":19}],4:[function(require,module,exports){
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

},{"./util.js":22}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.useFactory = useFactory;
exports.useSingleton = useSingleton;

/* I don't think this makes a whole lot of sense
export function useInstance(id, instance) {
  return includeInstance(id) || registerInstance(id, instance);
}*/

exports.registerFactory = registerFactory;

// some of these 'throw' calls could maybe be replaced with a "required" decorator
exports.registerSingleton = registerSingleton;
exports.registerInstance = registerInstance;
exports.includeSingleton = includeSingleton;
exports.includeInstance = includeInstance;
exports.includeInstanceAsync = includeInstanceAsync;
exports.getInstances = getInstances;
/**
 * Created by shaunwest on 4/30/15.
 */

var instances = {};
var singletons = [];
var callbacks = [];

// Use arrow => functions

function findSingleton(token) {
  var results = singletons.filter(function (singleton) {
    return token === singleton.token;
  });

  return results.length ? results[0].instance : null;
}

function registerCallback(id, callback) {
  callbacks.push({ id: id, func: callback });
}

function findCallbacks(id) {
  return callbacks.filter(function (callback) {
    return id === callback.id;
  });
}

function useFactory(id, factory) {
  return includeInstance(id) || registerFactory(id, factory);
}

function useSingleton(token) {
  return includeSingleton(token) || registerSingleton(token);
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
    throw 'registerSingleton: argument must be a function';
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

  findCallbacks(id).forEach(function (callback) {
    callback.func(instance);
  });

  return instance;
}

function includeSingleton(token) {
  return findSingleton(token);
}

function includeInstance(id) {
  return instances[id];
}

function includeInstanceAsync(id) {
  var instance;

  if (typeof id != 'string') {
    throw 'includeInstanceAsync: a string id is required';
  }

  instance = includeInstance(id);
  if (instance) {
    return Promise.resolve(instance);
  }

  return new Promise(function (resolve, reject) {
    registerCallback(id, function (instance) {
      resolve(instance);
    });
  });
}

function getInstances() {
  return instances;
}

},{}],6:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = async;
/**
 * Created by shaunwest on 5/16/15.
 */

/**
 * Created by shaunwest on 5/9/15.
 */

var _inject = require('../injector.js');

var _inject2 = _interopRequireWildcard(_inject);

var _includeInstanceAsync = require('../container.js');

function async() {
  var tokens = Array.prototype.slice.call(arguments);
  return _inject2['default'](tokens.map(function (token) {
    return _includeInstanceAsync.includeInstanceAsync(token);
  }));
}

module.exports = exports['default'];

},{"../container.js":5,"../injector.js":9}],7:[function(require,module,exports){
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

},{"../fragments.js":8,"../injector.js":9}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

var CollisionRenderer = (function () {
  function CollisionRenderer(canvas) {
    _classCallCheck(this, CollisionRenderer);

    this.colliders = [];
    this.entities = [];
    this.canvas = canvas;
    this.context2d = canvas.getContext('2d');
  }

  _createClass(CollisionRenderer, [{
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

  return CollisionRenderer;
})();

exports['default'] = CollisionRenderer;
module.exports = exports['default'];

},{"../common.js":4}],12:[function(require,module,exports){
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

var ImageRenderer = (function () {
  function ImageRenderer(canvas) {
    _classCallCheck(this, ImageRenderer);

    this.canvas = canvas;
    this.context2d = canvas.getContext('2d');
  }

  _createClass(ImageRenderer, [{
    key: 'setImage',
    value: function setImage(image) {
      this.image = image;
      return this;
    }
  }, {
    key: 'draw',
    value: function draw(viewport) {
      if (!viewport) {
        return;
      }

      this.context2d.clearRect(0, 0, this.canvas.width, this.canvas.height);

      if (this.image) {
        this.context2d.drawImage(this.image, viewport.x, viewport.y, viewport.width, viewport.height, 0, 0, viewport.width, viewport.height);
      }

      return this;
    }
  }, {
    key: 'getLayer',
    value: function getLayer() {
      return this.canvas;
    }
  }]);

  return ImageRenderer;
})();

exports['default'] = ImageRenderer;
module.exports = exports['default'];

},{}],13:[function(require,module,exports){
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

var SpriteRenderer = (function () {
  function SpriteRenderer(canvas) {
    _classCallCheck(this, SpriteRenderer);

    this.entities = [];
    this.context2d = canvas.getContext('2d');
    this.canvas = canvas;
  }

  _createClass(SpriteRenderer, [{
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

  return SpriteRenderer;
})();

exports['default'] = SpriteRenderer;
module.exports = exports['default'];

},{"../common.js":4}],14:[function(require,module,exports){
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

},{"../kjax.js":10,"../util.js":22,"./resource.js":18}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
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

},{"./image-loader.js":15,"./resource.js":18}],17:[function(require,module,exports){
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

},{}],18:[function(require,module,exports){
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

},{"../common.js":4,"../util.js":22,"./resource-registry.js":17}],19:[function(require,module,exports){
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

},{"./common.js":4,"./util.js":22}],20:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.setProp = setProp;
exports.includeResource = includeResource;
exports.registerResource = registerResource;
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

function registerResource(id, resourceFactory, schema) {
  return function () {
    return {
      schema: schema,
      cb: function cb(val) {
        var resource = resourceFactory();
        _includeInstance$registerInstance.registerInstance(id, resource);
        resource.fetch(val);
      }
    };
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

},{"../container.js":5,"../util.js":22}],21:[function(require,module,exports){
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
      return mapValue(data, this.schema);
    }
  }]);

  return SchemaMapper;
})();

exports['default'] = SchemaMapper;

function mapByType(data, schema) {
  switch (typeof data) {
    case 'object':
      return iterateKeys(data, schema);
    case 'array':
      return iterateArray(data, schema);
    default:
      return data;
  }
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

function mapValue(data, schemaOrFunc, container) {
  var mappedData, result;

  if (!schemaOrFunc) {
    return clone(data);
  }

  if (typeof schemaOrFunc == 'function') {
    mappedData = clone(data);
    result = schemaOrFunc(mappedData, container);
    if (typeof result == 'object' && result.cb) {
      mappedData = mapValue(data, result.schema, container);
      result.cb(mappedData);
    }
    return mappedData;
  }

  return mapByType(data, schemaOrFunc);
}

function iterateKeys(obj, schema) {
  return Object.keys(obj).reduce(function (newObj, key) {
    newObj[key] = mapValue(obj[key], schema.hasOwnProperty('*') ? schema['*'] : schema[key], newObj);
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

},{"../common.js":4,"../util.js":22}],22:[function(require,module,exports){
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

},{}],23:[function(require,module,exports){
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

var _async = require('../engine/decorators/async.js');

var _async2 = _interopRequireWildcard(_async);

var _Scheduler = require('../engine/scheduler.js');

var _Scheduler2 = _interopRequireWildcard(_Scheduler);

var _ImageRenderer = require('../engine/renderer/image-renderer.js');

var _ImageRenderer2 = _interopRequireWildcard(_ImageRenderer);

var _viewport = require('../viewport.js');

var _viewport2 = _interopRequireWildcard(_viewport);

var _ImageResource = require('../engine/resources/image-resource.js');

var _ImageResource2 = _interopRequireWildcard(_ImageResource);

var BackgroundLayer = (function () {
  function BackgroundLayer(canvas, backgroundImagePromise) {
    _classCallCheck(this, _BackgroundLayer);

    var renderer = new _ImageRenderer2['default'](canvas);

    _Scheduler2['default'](function () {
      renderer.draw(_viewport2['default']);
    });

    backgroundImagePromise.then(function (backgroundImageResource) {
      backgroundImageResource.ready(function (backgroundImage) {
        renderer.setImage(backgroundImage);
      });
    });
  }

  var _BackgroundLayer = BackgroundLayer;
  BackgroundLayer = _async2['default']('backgroundImage')(BackgroundLayer) || BackgroundLayer;
  BackgroundLayer = _fragment2['default']('canvas-background')(BackgroundLayer) || BackgroundLayer;
  return BackgroundLayer;
})();

exports['default'] = BackgroundLayer;
module.exports = exports['default'];

//@create('backgroundImage', ImageResource) // maybe should be created elsewhere...

},{"../engine/decorators/async.js":6,"../engine/decorators/fragment.js":7,"../engine/renderer/image-renderer.js":12,"../engine/resources/image-resource.js":16,"../engine/scheduler.js":19,"../viewport.js":29}],24:[function(require,module,exports){
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

var _async = require('../engine/decorators/async.js');

var _async2 = _interopRequireWildcard(_async);

var _Scheduler = require('../engine/scheduler.js');

var _Scheduler2 = _interopRequireWildcard(_Scheduler);

var _CollisionRenderer = require('../engine/renderer/collision-renderer.js');

var _CollisionRenderer2 = _interopRequireWildcard(_CollisionRenderer);

var _viewport = require('../viewport.js');

var _viewport2 = _interopRequireWildcard(_viewport);

var CollisionLayer = (function () {
  function CollisionLayer(canvas, collidersPromise) {
    _classCallCheck(this, _CollisionLayer);

    var renderer = new _CollisionRenderer2['default'](canvas);

    _Scheduler2['default'](function () {
      renderer.draw(_viewport2['default']);
    });

    collidersPromise.then(function (colliders) {
      renderer.setColliders(colliders);
    });

    this.renderer = renderer;
  }

  var _CollisionLayer = CollisionLayer;
  CollisionLayer = _async2['default']('colliders')(CollisionLayer) || CollisionLayer;
  CollisionLayer = _fragment2['default']('canvas-colliders')(CollisionLayer) || CollisionLayer;
  return CollisionLayer;
})();

exports['default'] = CollisionLayer;
module.exports = exports['default'];

},{"../engine/decorators/async.js":6,"../engine/decorators/fragment.js":7,"../engine/renderer/collision-renderer.js":11,"../engine/scheduler.js":19,"../viewport.js":29}],25:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

Object.defineProperty(exports, '__esModule', {
  value: true
});
/**
 * Created by shaunwest on 5/4/15.
 */

var _async = require('../engine/decorators/async.js');

var _async2 = _interopRequireWildcard(_async);

var _fragment = require('../engine/decorators/fragment.js');

var _fragment2 = _interopRequireWildcard(_fragment);

var _Scheduler = require('../engine/scheduler.js');

var _Scheduler2 = _interopRequireWildcard(_Scheduler);

var _SpriteRenderer = require('../engine/renderer/sprite-renderer.js');

var _SpriteRenderer2 = _interopRequireWildcard(_SpriteRenderer);

var _viewport = require('../viewport.js');

var _viewport2 = _interopRequireWildcard(_viewport);

var SpriteLayer = (function () {
  function SpriteLayer(canvas, spritesPromise, spriteTypesPromise) {
    _classCallCheck(this, _SpriteLayer);

    var renderer = new _SpriteRenderer2['default'](canvas);

    _Scheduler2['default'](function () {
      renderer.draw(_viewport2['default']);
    });

    renderer.clear();

    // this stuff should probably be moved out of here
    spritesPromise.then(function (sprites) {
      sprites.forEach(function (sprite) {
        // not quite right... each individual sprite should have its own animation object
        spriteTypesPromise.then(function (spriteTypes) {
          var spriteType = spriteTypes[sprite.srcId];

          spriteType.spriteSheet.ready(function () {
            spriteType.animation.play('run');
            renderer.addEntity(spriteType);
          });
        });
      });
    });

    this.renderer = renderer;
  }

  var _SpriteLayer = SpriteLayer;
  SpriteLayer = _async2['default']('spriteTypes')(SpriteLayer) || SpriteLayer;
  SpriteLayer = _async2['default']('sprites')(SpriteLayer) || SpriteLayer;
  SpriteLayer = _fragment2['default']('canvas-entities')(SpriteLayer) || SpriteLayer;
  return SpriteLayer;
})();

exports['default'] = SpriteLayer;
module.exports = exports['default'];

},{"../engine/decorators/async.js":6,"../engine/decorators/fragment.js":7,"../engine/renderer/sprite-renderer.js":13,"../engine/scheduler.js":19,"../viewport.js":29}],26:[function(require,module,exports){
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

var _CollisionLayer = require('./layers/collision-layer.js');

var _CollisionLayer2 = _interopRequireWildcard(_CollisionLayer);

var _SpriteLayer = require('./layers/sprite-layer.js');

var _SpriteLayer2 = _interopRequireWildcard(_SpriteLayer);

function Scene() {
  new _BackgroundLayer2['default']();
  new _CollisionLayer2['default']();
  new _SpriteLayer2['default']();
}

module.exports = exports['default'];

},{"./layers/background-layer.js":23,"./layers/collision-layer.js":24,"./layers/sprite-layer.js":25}],27:[function(require,module,exports){
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

var _ImageResource = require('../engine/resources/image-resource.js');

var _ImageResource2 = _interopRequireWildcard(_ImageResource);

var _HttpResource = require('../engine/resources/http-resource.js');

var _HttpResource2 = _interopRequireWildcard(_HttpResource);

var _registerResource$registerValue = require('../engine/schema/helper.js');

function SceneSchema() {
  return _HttpResource2['default']('kitty-world.json').ready(function (sceneData) {
    var schema = getSceneSchema();
    var scene = schema.map(sceneData);
    console.log(scene);
    //Scene(scene);
  });
}

function getSceneSchema() {
  return new _SchemaMapper2['default']({
    layerDefinitions: {
      background: {
        backgroundUrl: _registerResource$registerValue.registerResource('backgroundImage', _ImageResource2['default'])
      },
      entities: {
        sprites: _registerResource$registerValue.registerValue('sprites')
      },
      collisions: {
        colliders: _registerResource$registerValue.registerValue('colliders')
      }
    }
  });
}
module.exports = exports['default'];

},{"../engine/resources/http-resource.js":14,"../engine/resources/image-resource.js":16,"../engine/schema/helper.js":20,"../engine/schema/schema-mapper.js":21}],28:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

//var spriteSchema = SpriteSchema();

exports['default'] = SpriteSchema;
/**
 * Created by shaunwest on 5/9/15.
 */

var _SchemaMapper = require('../engine/schema/schema-mapper.js');

var _SchemaMapper2 = _interopRequireWildcard(_SchemaMapper);

var _ImageResource = require('../engine/resources/image-resource.js');

var _ImageResource2 = _interopRequireWildcard(_ImageResource);

var _HttpResource = require('../engine/resources/http-resource.js');

var _HttpResource2 = _interopRequireWildcard(_HttpResource);

var _frameSet = require('../animation/frame-set.js');

var _frameSet2 = _interopRequireWildcard(_frameSet);

var _spriteAnimation = require('../animation/sprite-animation.js');

var _spriteAnimation2 = _interopRequireWildcard(_spriteAnimation);

var _attachResource$registerValue = require('../engine/schema/helper.js');

function SpriteSchema() {
  return _HttpResource2['default']('kitty.json').ready(function (spriteData) {
    var spriteSchema = getSpriteSchema();
    var sprite = spriteSchema.map(spriteData);
    console.log(sprite);
  });
}

function createAnimation(uri, container) {
  container.spriteSheet = _ImageResource2['default'](uri).ready(function (spriteSheet) {
    container.animation = _spriteAnimation2['default'](_frameSet2['default'](container, spriteSheet));
  });
}

function getSpriteSchema() {
  return new _SchemaMapper2['default'](_attachResource$registerValue.registerValue('spriteTypes', {
    '*': {
      //spriteSheetUrl: attachResource('spriteSheet', ImageResource)
      spriteSheetUrl: createAnimation
    }
  }));
}
module.exports = exports['default'];

},{"../animation/frame-set.js":2,"../animation/sprite-animation.js":3,"../engine/resources/http-resource.js":14,"../engine/resources/image-resource.js":16,"../engine/schema/helper.js":20,"../engine/schema/schema-mapper.js":21}],29:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvbWFpbi5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy9hbmltYXRpb24vZnJhbWUtc2V0LmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2FuaW1hdGlvbi9zcHJpdGUtYW5pbWF0aW9uLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9jb21tb24uanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL2NvbnRhaW5lci5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy9lbmdpbmUvZGVjb3JhdG9ycy9hc3luYy5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy9lbmdpbmUvZGVjb3JhdG9ycy9mcmFnbWVudC5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy9lbmdpbmUvZnJhZ21lbnRzLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9pbmplY3Rvci5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy9lbmdpbmUva2pheC5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy9lbmdpbmUvcmVuZGVyZXIvY29sbGlzaW9uLXJlbmRlcmVyLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9yZW5kZXJlci9pbWFnZS1yZW5kZXJlci5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy9lbmdpbmUvcmVuZGVyZXIvc3ByaXRlLXJlbmRlcmVyLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9yZXNvdXJjZXMvaHR0cC1yZXNvdXJjZS5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy9lbmdpbmUvcmVzb3VyY2VzL2ltYWdlLWxvYWRlci5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy9lbmdpbmUvcmVzb3VyY2VzL2ltYWdlLXJlc291cmNlLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9yZXNvdXJjZXMvcmVzb3VyY2UtcmVnaXN0cnkuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL3Jlc291cmNlcy9yZXNvdXJjZS5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy9lbmdpbmUvc2NoZWR1bGVyLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9zY2hlbWEvaGVscGVyLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9zY2hlbWEvc2NoZW1hLW1hcHBlci5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy9lbmdpbmUvdXRpbC5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy9sYXllcnMvYmFja2dyb3VuZC1sYXllci5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy9sYXllcnMvY29sbGlzaW9uLWxheWVyLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2xheWVycy9zcHJpdGUtbGF5ZXIuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvc2NlbmUuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvc2NoZW1hL3NjZW5lLXNjaGVtYS5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy9zY2hlbWEvc3ByaXRlLXNjaGVtYS5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy92aWV3cG9ydC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7aUNDS2dDLHVCQUF1Qjs7d0JBQ2xDLGdDQUFnQzs7Ozs0QkFDMUIsdUJBQXVCOzs0QkFDekIscUNBQXFDOzs7OzJCQUN0QywwQkFBMEI7Ozs7NEJBQ3pCLDJCQUEyQjs7OztxQkFDbEMsWUFBWTs7OztBQUU5QixtQkFSUSxpQkFBaUIsRUFRTixDQUFDOzs7Ozs7Ozs7QUFTcEIsc0JBQVMsT0FBTyxHQUFHLFFBQVEsQ0FBQzs7O0FBRzVCLE1BQU0sQ0FBQyxRQUFRLHdCQUFXLENBQUM7QUFDM0IsTUFBTSxDQUFDLFlBQVksaUJBbkJYLFlBQVksQUFtQmMsQ0FBQzs7Ozs7Ozs7Ozs7QUFXbkMsMEJBQWEsQ0FBQztBQUNkLDJCQUFjLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs2Q0NqQzhCLHFCQUFxQjs7QUFFbEUsSUFBTSxZQUFZLEdBQUcsQ0FBQyxDQUFDOztBQUV2QixTQUFTLGtCQUFrQixDQUFDLGtCQUFrQixFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUU7QUFDdEUsTUFBSSxVQUFVLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQztBQUNqQyxNQUFJLFdBQVcsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDOztBQUVuQyxTQUFPO0FBQ0wsUUFBSSxFQUFFLGtCQUFrQixDQUFDLElBQUksSUFBSSxZQUFZO0FBQzdDLFVBQU0sRUFBRSxrQkFBa0IsQ0FBQyxNQUFNLENBQzlCLEdBQUcsQ0FBQyxVQUFTLGVBQWUsRUFBRTtBQUM3QixVQUFJLEtBQUssR0FBRywrQkFaWixTQUFTLENBWWEsVUFBVSxFQUFFLFdBQVcsQ0FBQyxDQUFDOztBQUUvQyxXQUFLLENBQ0YsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUNoQixTQUFTLENBQ1IsV0FBVyxFQUNYLGVBQWUsQ0FBQyxDQUFDLEVBQUUsZUFBZSxDQUFDLENBQUMsRUFDcEMsVUFBVSxFQUFFLFdBQVcsRUFDdkIsQ0FBQyxFQUFFLENBQUMsRUFDSixVQUFVLEVBQUUsV0FBVyxDQUN4QixDQUFDOztBQUVKLGFBQU8sS0FBSyxDQUFDO0tBQ2QsQ0FBQztHQUNMLENBQUM7Q0FDSDs7cUJBRWMsVUFBVSxnQkFBZ0IsRUFBRSxXQUFXLEVBQUU7QUFDdEQsU0FBTyxNQUFNLENBQ1YsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUMvQixNQUFNLENBQUMsVUFBUyxRQUFRLEVBQUUsVUFBVSxFQUFFO0FBQ3JDLFFBQUksYUFBYSxHQUFHLGtCQUFrQixDQUNwQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQ3JDLGdCQUFnQixDQUFDLFNBQVMsRUFDMUIsV0FBVyxDQUNaLENBQUM7O0FBRUYsaUJBQWEsQ0FBQyxNQUFNLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FDeEMsR0FBRyxDQUFDLFVBQVMsS0FBSyxFQUFFO0FBQ25CLGFBQU8sK0JBekNFLG1CQUFtQixDQXlDRCxnQkFBZ0IsQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLENBQUMsQ0FBQztLQUN0RSxDQUFDLENBQUM7O0FBRUwsWUFBUSxDQUFDLFVBQVUsQ0FBQyxHQUFHLGFBQWEsQ0FBQzs7QUFFckMsV0FBTyxRQUFRLENBQUM7R0FDakIsRUFBRSxFQUFFLENBQUMsQ0FBQztDQUNWOztBQUFBLENBQUM7Ozs7Ozs7Ozs7Ozt5QkNyRG9CLHdCQUF3Qjs7OztxQkFFL0IsVUFBVSxRQUFRLEVBQUU7QUFDakMsTUFBSSxvQkFBb0IsR0FBRyxJQUFJO01BQzdCLGlCQUFpQixHQUFHLENBQUM7TUFDckIsWUFBWSxHQUFHLElBQUk7TUFDbkIsYUFBYSxHQUFHLElBQUksQ0FBQzs7QUFFdkIsTUFBSSxXQUFXLEdBQUcsdUJBQVUsVUFBUyxTQUFTLEVBQUUsT0FBTyxFQUFFO0FBQ3ZELFFBQUcsQ0FBQyxvQkFBb0IsRUFBRTtBQUN4QixhQUFPO0tBQ1I7O0FBRUQsUUFBRyxDQUFDLFlBQVksRUFBRTtBQUNoQixhQUFPLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDcEM7O0FBRUQsZ0JBQVksR0FBRyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUM5RCxRQUFHLGFBQWEsRUFBRTtBQUNoQixtQkFBYSxDQUFDLFlBQVksQ0FBQyxDQUFDO0tBQzdCOztBQUVELFFBQUcsRUFBRSxpQkFBaUIsSUFBSSxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO0FBQzVELHVCQUFpQixHQUFHLENBQUMsQ0FBQztLQUN2QjtHQUNGLENBQUMsQ0FDQyxFQUFFLEVBQUUsQ0FBQzs7QUFFUixTQUFPO0FBQ0wsUUFBSSxFQUFFLGNBQVMsVUFBVSxFQUFFO0FBQ3pCLDBCQUFvQixHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUM1Qyx1QkFBaUIsR0FBRyxDQUFDLENBQUM7QUFDdEIsa0JBQVksR0FBRyxJQUFJLENBQUM7QUFDcEIsYUFBTyxJQUFJLENBQUM7S0FDYjtBQUNELFdBQU8sRUFBRSxpQkFBUyxFQUFFLEVBQUU7QUFDcEIsbUJBQWEsR0FBRyxFQUFFLENBQUM7QUFDbkIsYUFBTyxJQUFJLENBQUM7S0FDYjtBQUNELFFBQUksRUFBRSxnQkFBVztBQUNmLDBCQUFvQixHQUFHLElBQUksQ0FBQztBQUM1QixhQUFPLElBQUksQ0FBQztLQUNiO0FBQ0QsUUFBSSxFQUFFLGdCQUFXO0FBQ2YsNkJBQVUsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ2xDLGFBQU8sSUFBSSxDQUFDO0tBQ2I7QUFDRCxxQkFBaUI7Ozs7Ozs7Ozs7T0FBRSxZQUFXO0FBQzVCLGFBQU8saUJBQWlCLENBQUM7S0FDMUIsQ0FBQTtBQUNELFlBQVEsRUFBRSxvQkFBVztBQUNuQixhQUFPLFlBQVksQ0FBQztLQUNyQjtHQUNGLENBQUM7Q0FDSDs7Ozs7Ozs7Ozs7Ozs7O1FDakRlLFVBQVUsR0FBVixVQUFVO1FBS1YsU0FBUyxHQUFULFNBQVM7UUFLVCxZQUFZLEdBQVosWUFBWTtRQU9aLFdBQVcsR0FBWCxXQUFXO1FBV1gsY0FBYyxHQUFkLGNBQWM7UUFvQmQsU0FBUyxHQUFULFNBQVM7UUFTVCxVQUFVLEdBQVYsVUFBVTs7OztRQVdWLG1CQUFtQixHQUFuQixtQkFBbUI7O29CQXhFbEIsV0FBVzs7OztBQUlyQixTQUFTLFVBQVUsQ0FBQyxHQUFHLEVBQUU7QUFDOUIsTUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM3QixTQUFPLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQzVCOztBQUVNLFNBQVMsU0FBUyxDQUFDLEdBQUcsRUFBRTtBQUM3QixTQUFRLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLFNBQVMsSUFDdkMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssVUFBVSxDQUFFO0NBQ3ZDOztBQUVNLFNBQVMsWUFBWSxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUU7QUFDekMsTUFBRyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDN0IsV0FBTyxPQUFPLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztHQUM1QjtBQUNELFNBQU8sR0FBRyxDQUFDO0NBQ1o7O0FBRU0sU0FBUyxXQUFXLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUscUJBQXFCLEVBQUU7QUFDakYsUUFBTSxHQUFHLE1BQU0sSUFBSSxFQUFFLENBQUM7QUFDdEIsYUFBVyxHQUFHLFdBQVcsSUFBSSxFQUFFLENBQUM7O0FBRWhDLFFBQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVMsSUFBSSxFQUFFO0FBQ3pDLGtCQUFjLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLHFCQUFxQixDQUFDLENBQUM7R0FDN0UsQ0FBQyxDQUFDOztBQUVILFNBQU8sV0FBVyxDQUFDO0NBQ3BCOztBQUVNLFNBQVMsY0FBYyxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxxQkFBcUIsRUFBRTtBQUMxRixNQUFHLFdBQVcsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDbkMsUUFBRyxTQUFTLEVBQUU7QUFDWixpQkFBVyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQy9ELHdCQUFLLEdBQUcsQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUM7S0FDN0MsTUFBTSxJQUFHLHFCQUFxQixFQUFFO0FBQy9CLHdCQUFLLEtBQUssQ0FBQyxrQ0FBa0MsR0FDN0MsSUFBSSxHQUFHLDZCQUE2QixDQUFDLENBQUM7S0FDdkMsTUFBTTtBQUNMLGlCQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2pDLHdCQUFLLEdBQUcsQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUM7S0FDL0M7QUFDRCxXQUFPLFdBQVcsQ0FBQztHQUNwQjs7QUFFRCxhQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUVqQyxTQUFPLFdBQVcsQ0FBQztDQUNwQjs7QUFFTSxTQUFTLFNBQVMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFO0FBQ3ZDLE1BQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7O0FBRTlDLFFBQU0sQ0FBQyxLQUFLLEdBQUcsS0FBSyxJQUFJLEdBQUcsQ0FBQztBQUM1QixRQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sSUFBSSxHQUFHLENBQUM7O0FBRTlCLFNBQU8sTUFBTSxDQUFDO0NBQ2Y7O0FBRU0sU0FBUyxVQUFVLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRTtBQUN2QyxTQUFPLEVBQ0wsS0FBSyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDLElBQy9CLEtBQUssQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsQ0FBQyxJQUNoQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLEtBQUssSUFDL0IsS0FBSyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUEsQUFDakMsQ0FBQztDQUNIOztBQUlNLFNBQVMsbUJBQW1CLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRTtBQUNuRCxNQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxVQUFVLENBQUM7QUFDbEMsTUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQztBQUN4QixNQUFJLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO0FBQzFCLE1BQUksU0FBUyxHQUFHLEtBQUssQ0FDbEIsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUNoQixZQUFZLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7O0FBRXJDLE1BQUcsUUFBUSxFQUFFO0FBQ1gsY0FBVSxHQUFHLEtBQUssR0FBRyxNQUFNLEdBQUcsQ0FBQyxDQUFDOztBQUVoQyxTQUFJLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsVUFBVSxFQUFFLEtBQUssSUFBRSxDQUFDLEVBQUU7QUFDL0MsT0FBQyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDMUIsT0FBQyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzlCLE9BQUMsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM5QixVQUFHLENBQUMsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQzlELGlCQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7T0FDL0I7S0FDRjtHQUNGOztBQUVELFVBQVEsR0FBRyxTQUFTLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ3BDLFVBQVEsQ0FDTCxVQUFVLENBQUMsSUFBSSxDQUFDLENBQ2hCLFlBQVksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDOztBQUVqQyxTQUFPLFFBQVEsQ0FBQztDQUNqQjs7Ozs7Ozs7UUN4RWUsVUFBVSxHQUFWLFVBQVU7UUFJVixZQUFZLEdBQVosWUFBWTs7Ozs7OztRQVNaLGVBQWUsR0FBZixlQUFlOzs7UUFTZixpQkFBaUIsR0FBakIsaUJBQWlCO1FBaUJqQixnQkFBZ0IsR0FBaEIsZ0JBQWdCO1FBYWhCLGdCQUFnQixHQUFoQixnQkFBZ0I7UUFJaEIsZUFBZSxHQUFmLGVBQWU7UUFJZixvQkFBb0IsR0FBcEIsb0JBQW9CO1FBbUJwQixZQUFZLEdBQVosWUFBWTs7Ozs7QUF2RzVCLElBQUksU0FBUyxHQUFHLEVBQUUsQ0FBQztBQUNuQixJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUM7QUFDcEIsSUFBSSxTQUFTLEdBQUcsRUFBRSxDQUFDOzs7O0FBSW5CLFNBQVMsYUFBYSxDQUFFLEtBQUssRUFBRTtBQUM3QixNQUFJLE9BQU8sR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLFVBQVMsU0FBUyxFQUFFO0FBQ2xELFdBQVEsS0FBSyxLQUFLLFNBQVMsQ0FBQyxLQUFLLENBQUU7R0FDcEMsQ0FBQyxDQUFDOztBQUVILFNBQU8sQUFBQyxPQUFPLENBQUMsTUFBTSxHQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO0NBQ3REOztBQUVELFNBQVMsZ0JBQWdCLENBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRTtBQUN2QyxXQUFTLENBQUMsSUFBSSxDQUFFLEVBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFDLENBQUUsQ0FBQztDQUM1Qzs7QUFFRCxTQUFTLGFBQWEsQ0FBRSxFQUFFLEVBQUU7QUFDMUIsU0FBTyxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVMsUUFBUSxFQUFFO0FBQ3pDLFdBQVEsRUFBRSxLQUFLLFFBQVEsQ0FBQyxFQUFFLENBQUU7R0FDN0IsQ0FBQyxDQUFDO0NBQ0o7O0FBRU0sU0FBUyxVQUFVLENBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRTtBQUN2QyxTQUFPLGVBQWUsQ0FBQyxFQUFFLENBQUMsSUFBSSxlQUFlLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0NBQzVEOztBQUVNLFNBQVMsWUFBWSxDQUFFLEtBQUssRUFBRTtBQUNuQyxTQUFPLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxJQUFJLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDO0NBQzVEOztBQU9NLFNBQVMsZUFBZSxDQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUU7QUFDNUMsTUFBRyxPQUFPLE9BQU8sSUFBSSxVQUFVLEVBQUU7QUFDL0IsV0FBTyxnQkFBZ0IsQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztHQUN4QztBQUNELFFBQU0sNkNBQTZDLENBQUM7Q0FDckQ7O0FBSU0sU0FBUyxpQkFBaUIsQ0FBRSxLQUFLLEVBQUU7QUFDeEMsTUFBSSxRQUFRLENBQUM7O0FBRWIsTUFBRyxPQUFPLEtBQUssSUFBSSxVQUFVLEVBQUU7QUFDN0IsVUFBTSxnREFBZ0QsQ0FBQztHQUN4RDs7QUFFRCxVQUFRLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQztBQUN2QixNQUFJLFFBQVEsRUFBRTtBQUNaLGNBQVUsQ0FBQyxJQUFJLENBQUM7QUFDZCxXQUFLLEVBQUUsS0FBSztBQUNaLGNBQVEsRUFBRSxRQUFRO0tBQ25CLENBQUMsQ0FBQztBQUNILFdBQU8sUUFBUSxDQUFDO0dBQ2pCO0NBQ0Y7O0FBRU0sU0FBUyxnQkFBZ0IsQ0FBRSxFQUFFLEVBQUUsUUFBUSxFQUFFO0FBQzlDLE1BQUcsT0FBTyxFQUFFLElBQUksUUFBUSxJQUFJLE9BQU8sUUFBUSxJQUFJLFdBQVcsRUFBRTtBQUMxRCxVQUFNLDREQUE0RCxDQUFDO0dBQ3BFO0FBQ0QsV0FBUyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQzs7QUFFekIsZUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFTLFFBQVEsRUFBRTtBQUMzQyxZQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0dBQ3pCLENBQUMsQ0FBQzs7QUFFSCxTQUFPLFFBQVEsQ0FBQztDQUNqQjs7QUFFTSxTQUFTLGdCQUFnQixDQUFFLEtBQUssRUFBRTtBQUN2QyxTQUFPLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztDQUM3Qjs7QUFFTSxTQUFTLGVBQWUsQ0FBRSxFQUFFLEVBQUU7QUFDbkMsU0FBTyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7Q0FDdEI7O0FBRU0sU0FBUyxvQkFBb0IsQ0FBQyxFQUFFLEVBQUU7QUFDdkMsTUFBSSxRQUFRLENBQUM7O0FBRWIsTUFBRyxPQUFPLEVBQUUsSUFBSSxRQUFRLEVBQUU7QUFDeEIsVUFBTSwrQ0FBK0MsQ0FBQztHQUN2RDs7QUFFRCxVQUFRLEdBQUcsZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQy9CLE1BQUcsUUFBUSxFQUFFO0FBQ1gsV0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0dBQ2xDOztBQUVELFNBQU8sSUFBSSxPQUFPLENBQUMsVUFBUyxPQUFPLEVBQUUsTUFBTSxFQUFFO0FBQzNDLG9CQUFnQixDQUFDLEVBQUUsRUFBRSxVQUFTLFFBQVEsRUFBRTtBQUN0QyxhQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDbkIsQ0FBQyxDQUFDO0dBQ0osQ0FBQyxDQUFDO0NBQ0o7O0FBRU0sU0FBUyxZQUFZLEdBQUk7QUFDOUIsU0FBTyxTQUFTLENBQUM7Q0FDbEI7Ozs7Ozs7Ozs7cUJDbEd1QixLQUFLOzs7Ozs7Ozs7c0JBSFYsZ0JBQWdCOzs7O29DQUNBLGlCQUFpQjs7QUFFckMsU0FBUyxLQUFLLEdBQUk7QUFDL0IsTUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ25ELFNBQU8sb0JBQU8sTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFBLEtBQUs7V0FBSSxzQkFKNUIsb0JBQW9CLENBSTZCLEtBQUssQ0FBQztHQUFBLENBQUMsQ0FBQyxDQUFDO0NBQ2pFOzs7Ozs7Ozs7Ozs7Ozs7O3NCQ1ZrQixnQkFBZ0I7Ozs7d0JBQ1osaUJBQWlCOztxQkFFekIsVUFBVSxPQUFPLEVBQUU7QUFDaEMsU0FBTyxvQkFBTyxDQUFDLFVBSFQsUUFBUSxDQUdVLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQTtDQUNuQzs7Ozs7Ozs7OztRQ01lLGdCQUFnQixHQUFoQixnQkFBZ0I7UUFxQmhCLFNBQVMsR0FBVCxTQUFTO1FBWVQsUUFBUSxHQUFSLFFBQVE7UUFJUixpQkFBaUIsR0FBakIsaUJBQWlCOzs7OztBQWhEakMsSUFBSSxlQUFlLENBQUM7O0FBRXBCLFNBQVMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFO0FBQ2pDLE1BQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUM7QUFDcEMsT0FBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsYUFBYSxHQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLGFBQWEsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUN4RSxRQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxNQUFNLEVBQUU7QUFDN0MsYUFBTyxPQUFPLENBQUM7S0FDaEI7R0FDRjtDQUNGOztBQUVNLFNBQVMsZ0JBQWdCLENBQUUsYUFBYSxFQUFFO0FBQy9DLE1BQUksV0FBVztNQUFFLE9BQU87TUFBRSxZQUFZLEdBQUcsRUFBRSxDQUFDOztBQUU1QyxNQUFHLENBQUMsYUFBYSxFQUFFO0FBQ2pCLFFBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNqRCxRQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQ1gsYUFBTyxZQUFZLENBQUM7S0FDckI7QUFDRCxpQkFBYSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztHQUN6Qjs7QUFFRCxhQUFXLEdBQUcsYUFBYSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2xELE9BQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLFdBQVcsR0FBRyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxXQUFXLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDckUsV0FBTyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN6QixRQUFHLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQzVCLGtCQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQzVCO0dBQ0Y7QUFDRCxTQUFPLFlBQVksQ0FBQztDQUNyQjs7QUFFTSxTQUFTLFNBQVMsQ0FBRSxJQUFJLEVBQUU7QUFDL0IsTUFBRyxDQUFDLGVBQWUsRUFBRTtBQUNuQixxQkFBaUIsRUFBRSxDQUFDO0dBQ3JCO0FBQ0QsU0FBTyxlQUFlLENBQUMsTUFBTSxDQUFDLFVBQVMsTUFBTSxFQUFFLE9BQU8sRUFBRTtBQUN0RCxRQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxFQUFFO0FBQ3ZDLFlBQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDdEI7QUFDRCxXQUFPLE1BQU0sQ0FBQztHQUNmLEVBQUUsRUFBRSxDQUFDLENBQUM7Q0FDUjs7QUFFTSxTQUFTLFFBQVEsQ0FBRSxJQUFJLEVBQUU7QUFDOUIsU0FBTyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDM0I7O0FBRU0sU0FBUyxpQkFBaUIsR0FBRztBQUNsQyxpQkFBZSxHQUFHLGdCQUFnQixFQUFFLENBQUM7Q0FDdEM7Ozs7Ozs7Ozs7OztxQkNsRGMsVUFBVSxRQUFRLEVBQUU7QUFDakMsU0FBTyxVQUFTLE1BQU0sRUFBRTtBQUN0QixZQUFRLEdBQUcsQUFBQyxNQUFNLENBQUMsU0FBUyxHQUMxQixRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FDakMsUUFBUSxDQUFDOztBQUVYLFFBQUcsTUFBTSxDQUFDLE9BQU8sRUFBRTtBQUNqQixZQUFNLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQztLQUN6Qjs7QUFFRCxRQUFJLFNBQVMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztBQUNuRSxhQUFTLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztBQUMzQixhQUFTLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztBQUMvQixXQUFPLFNBQVMsQ0FBQztHQUNsQixDQUFDO0NBQ0g7Ozs7Ozs7Ozs7UUNGZSxVQUFVLEdBQVYsVUFBVTtRQTBDVixLQUFLLEdBQUwsS0FBSztRQUlMLFdBQVcsR0FBWCxXQUFXOzs7O0FBNUQzQixJQUFJLFFBQVEsR0FBRyxFQUFFO0lBQ2YsT0FBTyxHQUFHLEVBQUUsQ0FBQzs7QUFFZixTQUFTLFVBQVUsQ0FBQyxHQUFHLEVBQUU7QUFDdkIsU0FBTyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksbUJBQW1CLENBQUM7Q0FDbkU7O0FBRUQsU0FBUyxhQUFhLENBQUUsV0FBVyxFQUFFLFlBQVksRUFBRTtBQUNqRCxNQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLGtCQUFrQixFQUFFO0FBQ2xELFdBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztHQUNqQztBQUNELFNBQU8sWUFBWSxDQUFDO0NBQ3JCOztBQUVNLFNBQVMsVUFBVSxDQUFDLEdBQUcsRUFBRSx1QkFBdUIsRUFBRSxVQUFVLEVBQUU7QUFDbkUsTUFBSSxPQUFPLENBQUM7O0FBRVosTUFBRyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxTQUFTLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssVUFBVSxFQUFFO0FBQ3BFLE9BQUcsR0FBRyxPQUFPLEdBQUcsR0FBRyxDQUFDO0dBQ3JCOztBQUVELFdBQVMsVUFBVSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUU7QUFDbkMsUUFBSSxHQUFHLEdBQUcsSUFBSSxjQUFjLEVBQUUsQ0FBQzs7QUFFL0IsUUFBSSxVQUFVLENBQUMsdUJBQXVCLENBQUMsRUFBRTtBQUN2QyxnQkFBVSxHQUFHLHVCQUF1QixDQUFDO0FBQ3JDLDZCQUF1QixHQUFHLFNBQVMsQ0FBQztLQUNyQzs7QUFFRCxRQUFJLFVBQVUsRUFBRTtBQUNkLFNBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsVUFBVSxLQUFLLEVBQUU7QUFDaEQsa0JBQVUsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztPQUN2QyxFQUFFLEtBQUssQ0FBQyxDQUFDO0tBQ1g7O0FBRUQsT0FBRyxDQUFDLE9BQU8sR0FBRyxVQUFVLEtBQUssRUFBRTtBQUM3QixZQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztLQUMxQixDQUFDOztBQUVGLE9BQUcsQ0FBQyxNQUFNLEdBQUcsWUFBWTtBQUN2QixVQUFJLFdBQVcsR0FBRyx1QkFBdUIsSUFBSSxJQUFJLENBQUMsaUJBQWlCLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQzFGLEFBQUMsVUFBSSxDQUFDLE1BQU0sSUFBSSxHQUFHLEdBQ2pCLE1BQU0sQ0FBQyxFQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFDLENBQUMsR0FDMUQsT0FBTyxDQUFDLEVBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQztLQUN2RixDQUFDOztBQUVGLE9BQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUMzQixPQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7R0FDWjs7QUFFRCxTQUFPLEdBQUcsSUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDbEMsVUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFFdkIsU0FBTyxPQUFPLENBQUM7Q0FDaEI7O0FBRU0sU0FBUyxLQUFLLEdBQUc7QUFDdEIsVUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7Q0FDckI7O0FBRU0sU0FBUyxXQUFXLEdBQUc7QUFDNUIsU0FBTyxRQUFRLENBQUM7Q0FDakI7O0FBRUQsU0FBUyxVQUFVLENBQUMsR0FBRyxFQUFFO0FBQ3ZCLFNBQU8sR0FBRyxHQUFHLENBQUM7Q0FDZjs7cUJBRWM7QUFDYixZQUFVLEVBQUUsVUFBVTtBQUN0QixPQUFLLEVBQUUsS0FBSztBQUNaLFlBQVUsRUFBRSxVQUFVO0FBQ3RCLGFBQVcsRUFBRSxXQUFXO0NBQ3pCOzs7Ozs7Ozs7Ozs7Ozs7OzswQkN2RXdCLGNBQWM7O0FBRXZDLElBQU0sZUFBZSxHQUFHLFNBQVMsQ0FBQztBQUNsQyxJQUFNLGFBQWEsR0FBRyxTQUFTLENBQUM7O0lBRVgsaUJBQWlCO0FBQ3hCLFdBRE8saUJBQWlCLENBQ3ZCLE1BQU0sRUFBRTswQkFERixpQkFBaUI7O0FBRWxDLFFBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO0FBQ3BCLFFBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO0FBQ25CLFFBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQ3JCLFFBQUksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUMxQzs7ZUFOa0IsaUJBQWlCOzs7O1dBU3hCLHFCQUFDLEtBQUssRUFBRTtBQUNsQixVQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztLQUN2Qjs7O1dBRVksc0JBQUMsS0FBSyxFQUFFO0FBQ25CLFVBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO0tBQ3hCOzs7V0FFSSxjQUFDLFFBQVEsRUFBRTtBQUNkLFVBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7O0FBRS9CLFVBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUN0RSxVQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxlQUFlLENBQUM7O0FBRTdDLFVBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFVBQVMsUUFBUSxFQUFFO0FBQ3hDLFlBQUcsQ0FBQyxZQTdCRixVQUFVLENBNkJHLFFBQVEsRUFBRSxRQUFRLENBQUMsRUFBRTtBQUNsQyxpQkFBTztTQUNSO0FBQ0QsaUJBQVMsQ0FBQyxVQUFVLENBQ2xCLFFBQVEsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsRUFDdkIsUUFBUSxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxFQUN2QixRQUFRLENBQUMsS0FBSyxFQUNkLFFBQVEsQ0FBQyxNQUFNLENBQ2hCLENBQUM7T0FDSCxDQUFDLENBQUM7O0FBRUgsZUFBUyxDQUFDLFdBQVcsR0FBRyxhQUFhLENBQUM7QUFDdEMsVUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsVUFBUyxNQUFNLEVBQUU7QUFDckMsWUFBRyxDQUFDLFlBMUNGLFVBQVUsQ0EwQ0csTUFBTSxFQUFFLFFBQVEsQ0FBQyxFQUFFO0FBQ2hDLGlCQUFPO1NBQ1I7QUFDRCxpQkFBUyxDQUFDLFVBQVUsQ0FDbEIsTUFBTSxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxFQUNyQixNQUFNLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLEVBQ3JCLE1BQU0sQ0FBQyxLQUFLLEVBQ1osTUFBTSxDQUFDLE1BQU0sQ0FDZCxDQUFDO09BQ0gsQ0FBQyxDQUFDO0FBQ0gsYUFBTyxJQUFJLENBQUM7S0FDYjs7O1dBRVEsb0JBQUc7QUFDVixhQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7S0FDcEI7OztTQXBEa0IsaUJBQWlCOzs7cUJBQWpCLGlCQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lDTmpCLGFBQWE7QUFDcEIsV0FETyxhQUFhLENBQ25CLE1BQU0sRUFBRTswQkFERixhQUFhOztBQUU5QixRQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUNyQixRQUFJLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDMUM7O2VBSmtCLGFBQWE7O1dBTXZCLGtCQUFDLEtBQUssRUFBRTtBQUNmLFVBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQ25CLGFBQU8sSUFBSSxDQUFDO0tBQ2I7OztXQUVJLGNBQUMsUUFBUSxFQUFFO0FBQ2QsVUFBRyxDQUFDLFFBQVEsRUFBRTtBQUNaLGVBQU87T0FDUjs7QUFFRCxVQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBRXRFLFVBQUcsSUFBSSxDQUFDLEtBQUssRUFBRTtBQUNiLFlBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUN0QixJQUFJLENBQUMsS0FBSyxFQUNWLFFBQVEsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsRUFDdEIsUUFBUSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsTUFBTSxFQUMvQixDQUFDLEVBQUUsQ0FBQyxFQUNKLFFBQVEsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FDaEMsQ0FBQztPQUNIOztBQUVELGFBQU8sSUFBSSxDQUFDO0tBQ2I7OztXQUVRLG9CQUFHO0FBQ1YsYUFBTyxJQUFJLENBQUMsTUFBTSxDQUFDO0tBQ3BCOzs7U0FqQ2tCLGFBQWE7OztxQkFBYixhQUFhOzs7Ozs7Ozs7Ozs7Ozs7Ozs7MEJDQ1QsY0FBYzs7SUFFbEIsY0FBYztBQUN0QixXQURRLGNBQWMsQ0FDckIsTUFBTSxFQUFFOzBCQURELGNBQWM7O0FBRS9CLFFBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO0FBQ25CLFFBQUksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QyxRQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztHQUN0Qjs7ZUFMa0IsY0FBYzs7V0FPdkIsbUJBQUMsTUFBTSxFQUFFO0FBQ2pCLFVBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzNCLGFBQU8sSUFBSSxDQUFDO0tBQ2I7OztXQUVLLGlCQUFHO0FBQ1AsVUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQ3pCLGFBQU8sSUFBSSxDQUFDO0tBQ2I7OztXQUVJLGNBQUMsUUFBUSxFQUFFO0FBQ2QsVUFBSSxNQUFNLEVBQUUsS0FBSyxDQUFDOztBQUVsQixVQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBRXRFLFdBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLFdBQVcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsV0FBVyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3ZFLGNBQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUUxQixZQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRTtBQUNwQixtQkFBUztTQUNWOztBQUVELFlBQUcsQ0FBQyxZQS9CRixVQUFVLENBK0JHLE1BQU0sRUFBRSxRQUFRLENBQUMsRUFBRTtBQUNoQyxtQkFBUztTQUNWOztBQUVELGFBQUssR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ3BDLFlBQUcsS0FBSyxFQUFFO0FBQ1IsY0FBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQ3RCLEtBQUssRUFDTCxNQUFNLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUMxQixNQUFNLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUMzQixDQUFDO1NBQ0g7T0FDRjs7QUFFRCxhQUFPLElBQUksQ0FBQztLQUNiOzs7V0FFUSxvQkFBRztBQUNWLGFBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztLQUNwQjs7O1NBaERrQixjQUFjOzs7cUJBQWQsY0FBYzs7Ozs7Ozs7Ozs7Ozs7OztvQkNGbEIsWUFBWTs7OzswQkFDSixZQUFZOzt3QkFDaEIsZUFBZTs7OztxQkFFckIsVUFBUyxHQUFHLEVBQUU7QUFDM0IsU0FBTyxrQ0FKRCxVQUFVLEVBSVksR0FBRyxDQUFDLENBQzdCLEtBQUssQ0FBQyxVQUFTLFFBQVEsRUFBRTtBQUN4QixXQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUM7R0FDdEIsQ0FBQyxDQUFDO0NBQ047O0FBQUEsQ0FBQzs7Ozs7Ozs7O1FDUWMsUUFBUSxHQUFSLFFBQVE7Ozs7O0FBbEJ4QixJQUFJLG1CQUFtQixHQUFHLEdBQUcsQ0FBQzs7QUFFOUIsU0FBUyxZQUFZLENBQUUsS0FBSyxFQUFFO0FBQzVCLFNBQU8sSUFBSSxPQUFPLENBQUMsVUFBUyxPQUFPLEVBQUUsTUFBTSxFQUFFO0FBQzNDLFFBQUksVUFBVSxHQUFHLFdBQVcsQ0FBQyxZQUFXO0FBQ3RDLFVBQUcsS0FBSyxDQUFDLFFBQVEsRUFBRTtBQUNqQixxQkFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzFCLGVBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztPQUNoQjtLQUNGLEVBQUUsbUJBQW1CLENBQUMsQ0FBQzs7QUFFeEIsU0FBSyxDQUFDLE9BQU8sR0FBRyxZQUFZO0FBQzFCLG1CQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDMUIsWUFBTSxFQUFFLENBQUM7S0FDVixDQUFDO0dBQ0gsQ0FBQyxDQUFDO0NBQ0o7O0FBRU0sU0FBUyxRQUFRLENBQUUsR0FBRyxFQUFFO0FBQzdCLE1BQUksS0FBSyxFQUFFLE9BQU8sQ0FBQzs7QUFFbkIsT0FBSyxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7QUFDcEIsT0FBSyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7O0FBRWhCLFNBQU8sR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRTlCLFNBQU8sT0FBTyxDQUFDO0NBQ2hCOzs7Ozs7Ozs7Ozs7Ozs7d0JDMUJvQixlQUFlOzs7O3dCQUNiLG1CQUFtQjs7cUJBRTNCLFVBQVUsR0FBRyxFQUFFO0FBQzVCLFNBQU8sZ0NBSEQsUUFBUSxFQUdZLEdBQUcsQ0FBQyxDQUFDO0NBQ2hDOztBQUFBLENBQUM7Ozs7Ozs7Ozs7Ozs7O0FDTEYsSUFBSSxTQUFTLEdBQUcsRUFBRSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW9CbkIsU0FBUyxRQUFRLENBQUUsUUFBUSxFQUFFO0FBQzNCLFdBQVMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEdBQUcsUUFBUSxDQUFDO0NBQ3ZDOztBQUVELFNBQVMsV0FBVyxDQUFDLE1BQU0sRUFBRTtBQUMzQixTQUFPLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztDQUMxQjs7cUJBRWM7QUFDYixVQUFRLEVBQUUsUUFBUTtBQUNsQixhQUFXLEVBQUUsV0FBVztDQUN6Qjs7Ozs7Ozs7Ozs7Ozs7OztvQkMvQmdCLFlBQVk7Ozs7Z0NBQ0Esd0JBQXdCOzs7O3lCQUM3QixjQUFjOztBQUV0QyxJQUFJLFlBQVksR0FBRyxFQUFFLENBQUM7OztBQUd0QixTQUFTLFFBQVEsQ0FBRSxNQUFNLEVBQUUsTUFBTSxFQUFFO0FBQ2pDLE1BQUksZ0JBQWdCLEdBQUcsRUFBRTtNQUN2QixjQUFjLEdBQUcsRUFBRTtNQUNuQixRQUFRLEdBQUc7QUFDVCxTQUFLLEVBQUUsS0FBSztBQUNaLFNBQUssRUFBRSxLQUFLO0FBQ1osV0FBTyxFQUFFLElBQUk7QUFDYixVQUFNLEVBQUUsTUFBTTtHQUNmLENBQUM7O0FBRUosTUFBRyxDQUFDLGtCQUFLLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRTtBQUMzQixXQUFPO0dBQ1I7O0FBRUQsV0FBUyxLQUFLLENBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRTtBQUNsQyxRQUFHLGtCQUFLLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRTtBQUMxQixzQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7S0FDdkQsTUFBTTtBQUNMLHNCQUFnQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUNsQzs7QUFFRCxRQUFHLGtCQUFLLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUN4QixvQkFBYyxHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDakQsTUFBTTtBQUNMLG9CQUFjLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQzlCOztBQUVELFdBQU8sUUFBUSxDQUFDO0dBQ2pCOztBQUVELFdBQVMsU0FBUyxDQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUU7QUFDakMsUUFBSSxlQUFlLEdBQUcsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDOUMsUUFBRyxDQUFDLGVBQWUsRUFBRTtBQUNuQixVQUFHLEtBQUssR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUU7QUFBRSxlQUFPLENBQUMsTUFBTSxFQUFFLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztPQUFFO0FBQ25FLGFBQU87S0FDUjs7QUFFRCxRQUFJLFNBQVMsR0FBRyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDeEMsUUFBRyxTQUFTLElBQUksU0FBUyxDQUFDLEtBQUssRUFBRTtBQUMvQixlQUFTLENBQUMsS0FBSyxDQUFDLFVBQVUsTUFBTSxFQUFFO0FBQ2hDLGlCQUFTLENBQUMsTUFBTSxFQUFFLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztPQUM5QixFQUFFLFVBQVUsTUFBTSxFQUFFO0FBQ25CLGVBQU8sQ0FBQyxNQUFNLEVBQUUsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO09BQzVCLENBQUMsQ0FBQztBQUNILGFBQU87S0FDUixNQUFNLElBQUcsQ0FBQyxTQUFTLEVBQUU7QUFDcEIsZUFBUyxHQUFHLE1BQU0sQ0FBQztLQUNwQjtBQUNELGFBQVMsQ0FBQyxTQUFTLEVBQUUsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO0dBQ2pDOztBQUVELFdBQVMsT0FBTyxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUU7QUFDOUIsUUFBSSxhQUFhLEdBQUcsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzFDLFFBQUcsQ0FBQyxhQUFhLEVBQUU7QUFDakIsVUFBRyxLQUFLLEdBQUcsY0FBYyxDQUFDLE1BQU0sRUFBRTtBQUFFLGVBQU8sQ0FBQyxNQUFNLEVBQUUsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO09BQUU7QUFDakUsYUFBTztLQUNSOztBQUVELFVBQU0sR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDL0IsUUFBRyxNQUFNLElBQUksTUFBTSxDQUFDLEtBQUssRUFBRTtBQUN6QixZQUFNLENBQUMsS0FBSyxDQUFDLFlBQVc7QUFDdEIsaUJBQVMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO09BQzlCLEVBQUUsVUFBUyxNQUFNLEVBQUU7QUFDbEIsZUFBTyxDQUFDLE1BQU0sRUFBRSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7T0FDNUIsQ0FBQyxDQUFDO0FBQ0gsYUFBTztLQUNSO0FBQ0QsV0FBTyxDQUFDLE1BQU0sRUFBRSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7R0FDNUI7O0FBRUQsV0FBUyxLQUFLLENBQUUsTUFBTSxFQUFFO0FBQ3RCLFFBQUksT0FBTyxDQUFDOztBQUVaLFFBQUcsUUFBUSxDQUFDLE9BQU8sRUFBRTtBQUNuQixVQUFHLENBQUMsV0EvRUYsU0FBUyxDQStFRyxNQUFNLENBQUMsRUFBRTtBQUNyQixjQUFNLEdBQUcsUUFBUSxDQUFDLE9BQU8sR0FBRyxHQUFHLEdBQUcsTUFBTSxDQUFDO09BQzFDO0tBQ0Y7O0FBRUQsV0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUFFekIsUUFBRyxDQUFDLGtCQUFLLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUU7QUFDM0Msd0JBQUssS0FBSyxDQUFDLDJEQUEyRCxDQUFDLENBQUM7S0FDekU7O0FBRUQsWUFBUSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7QUFDekIsWUFBUSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsSUFBSSxDQUM3QixVQUFTLE1BQU0sRUFBRTtBQUNmLGVBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDdEIsRUFDRCxVQUFTLE1BQU0sRUFBRTtBQUNmLGFBQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDcEIsQ0FDRixDQUFDOztBQUVGLFdBQU8sUUFBUSxDQUFDO0dBQ2pCOzs7QUFHRCxNQUFHLE1BQU0sRUFBRTtBQUNULFFBQUksVUFBVSxHQUFHLE1BQU0sQ0FBQztBQUN4QixRQUFJLFFBQVEsQ0FBQyxPQUFPLEVBQUU7QUFDcEIsVUFBSSxDQUFDLFdBM0dILFNBQVMsQ0EyR0ksTUFBTSxDQUFDLEVBQUU7QUFDdEIsa0JBQVUsR0FBRyxRQUFRLENBQUMsT0FBTyxHQUFHLEdBQUcsR0FBRyxNQUFNLENBQUM7T0FDOUM7S0FDRjtBQUNELFFBQUksZ0JBQWdCLEdBQUcsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2hELFFBQUksZ0JBQWdCLEVBQUU7QUFDcEIsYUFBTyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDdkM7R0FDRjs7O0FBR0QsY0FBWSxDQUFDLFVBQVUsQ0FBQyxHQUFHLFFBQVEsQ0FBQztBQUNwQyxTQUFPLEFBQUMsTUFBTSxHQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsUUFBUSxDQUFDO0NBQ3JEOztBQUVELFFBQVEsQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0FBQ3RCLFFBQVEsQ0FBQyxJQUFJLEdBQUcsWUFBWSxDQUFDOztxQkFFZCxRQUFROzs7Ozs7Ozs7Ozs7Ozs7OztvQkM5SE4sV0FBVzs7OzsyQkFDRixhQUFhOztBQUV2QyxJQUFJLFFBQVEsQ0FBQztBQUNiLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQzs7QUFFdEIsU0FBUyxTQUFTLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRTtBQUMzQixNQUFHLENBQUMsUUFBUSxFQUFFO0FBQ1osWUFBUSxHQUFHLE1BQU0sRUFBRSxDQUFDO0dBQ3JCO0FBQ0QsTUFBRyxFQUFFLEVBQUU7QUFDTCxZQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztHQUM3QjtBQUNELFNBQU8sUUFBUSxDQUFDO0NBQ2pCOztBQUVELFNBQVMsQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDOztBQUU1QixTQUFTLE1BQU0sR0FBRztBQUNoQixTQUFPLGFBbEJELFdBQVcsQ0FrQkU7QUFDakIsYUFBUyxFQUFFLEVBQUU7QUFDYixZQUFRLEVBQUUsUUFBUTtBQUNsQixjQUFVLEVBQUUsVUFBVTtBQUN0QixTQUFLLEVBQUUsS0FBSztBQUNaLFFBQUksRUFBRSxJQUFJO0FBQ1YsU0FBSyxFQUFFLEtBQUs7QUFDWixNQUFFLEVBQUUsRUFBRTtHQUNQLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztDQUNaOztBQUVELFNBQVMsUUFBUSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUU7QUFDMUIsV0FBUyxPQUFPLENBQUMsT0FBTyxFQUFFO0FBQ3hCLFFBQUksR0FBRyxPQUFPLENBQUM7R0FDaEI7O0FBRUQsV0FBUyxTQUFTLEdBQUc7QUFDbkIsUUFBSSxLQUFLLEdBQUcsQ0FBQztRQUNYLGNBQWMsR0FBRyxDQUFDLENBQUM7O0FBRXJCLFdBQU8sVUFBUyxTQUFTLEVBQUU7QUFDekIsb0JBQWMsSUFBSSxTQUFTLENBQUM7QUFDNUIsVUFBRyxLQUFLLEtBQUssSUFBSSxFQUFFO0FBQ2pCLGFBQUssRUFBRSxDQUFDO0FBQ1IsZUFBTztPQUNSO0FBQ0QsUUFBRSxDQUFDLGNBQWMsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUM1QixXQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQ1Ysb0JBQWMsR0FBRyxDQUFDLENBQUM7S0FDcEIsQ0FBQztHQUNIOztBQUVELE1BQUcsQ0FBQyxrQkFBSyxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDdkIsc0JBQUssS0FBSyxDQUFDLDZDQUE2QyxDQUFDLENBQUM7R0FDM0Q7QUFDRCxNQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQzs7QUFFakIsTUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQzs7QUFFakMsU0FBTyxJQUFJLENBQUM7Q0FDYjs7QUFFRCxTQUFTLEVBQUUsR0FBRztBQUNaLFNBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUM7Q0FDOUI7O0FBRUQsU0FBUyxVQUFVLENBQUMsRUFBRSxFQUFFO0FBQ3RCLE1BQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDakMsU0FBTyxJQUFJLENBQUM7Q0FDYjs7QUFFRCxTQUFTLEtBQUssR0FBRztBQUNmLE1BQUcsSUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNmLFdBQU8sSUFBSSxDQUFDO0dBQ2I7O0FBRUQsZUExRU0sV0FBVyxDQTBFTDtBQUNWLGFBQVMsRUFBRSxDQUFDO0FBQ1osU0FBSyxFQUFFLENBQUM7QUFDUixrQkFBYyxFQUFFLENBQUM7QUFDakIsV0FBTyxFQUFFLElBQUk7QUFDYixrQkFBYyxFQUFFLElBQUksSUFBSSxFQUFFO0FBQzFCLG9CQUFnQixFQUFFLE1BQU0sQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxVQUFVLENBQUM7R0FDekUsRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFFVCxTQUFPLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztDQUNyQjs7QUFFRCxTQUFTLElBQUksR0FBRztBQUNkLE1BQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO0FBQ3JCLFFBQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDNUMsUUFBTSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDOztBQUVuRCxTQUFPLElBQUksQ0FBQztDQUNiOztBQUVELFNBQVMsS0FBSyxHQUFHO0FBQ2YsTUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQzFCLFNBQU8sSUFBSSxDQUFDO0NBQ2I7O0FBRUQsU0FBUyxLQUFLLEdBQUc7QUFDZix1QkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDNUQsTUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDOztBQUViLE1BQUcsSUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNmLFFBQUksQ0FBQyxnQkFBZ0IsR0FBRyxNQUFNLENBQUMscUJBQXFCLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0dBQ3hFOztBQUVELFNBQU8sSUFBSSxDQUFDO0NBQ2I7O0FBRUQsU0FBUyxXQUFXLEdBQUc7QUFDckIsTUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQzVCLE1BQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQ2YsTUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0NBQ3ZCOztBQUVELFNBQVMscUJBQXFCLENBQUMsU0FBUyxFQUFFO0FBQ3hDLE1BQUksU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7O0FBRS9CLE9BQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLFlBQVksR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxZQUFZLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDckUsYUFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0dBQ3pCO0NBQ0Y7O0FBRUQsU0FBUyxZQUFZLEdBQUc7QUFDdEIsTUFBSSxHQUFHLEdBQUcsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDO0FBQ3RCLE1BQUksU0FBUyxHQUFHLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUEsR0FBSSxVQUFVLENBQUM7O0FBRXpELE1BQUksQ0FBQyxjQUFjLEdBQUcsR0FBRyxDQUFDOztBQUUxQixTQUFPLFNBQVMsQ0FBQztDQUNsQjs7cUJBRWMsU0FBUzs7Ozs7Ozs7Ozs7UUNySVIsT0FBTyxHQUFQLE9BQU87UUFNUCxlQUFlLEdBQWYsZUFBZTtRQVNmLGdCQUFnQixHQUFoQixnQkFBZ0I7UUFhaEIsY0FBYyxHQUFkLGNBQWM7UUFPZCxhQUFhLEdBQWIsYUFBYTtRQVdiLElBQUksR0FBSixJQUFJOzs7OztvQkFqREgsWUFBWTs7OztnREFDbUIsaUJBQWlCOztBQUUxRCxTQUFTLE9BQU8sQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFO0FBQ2xDLFNBQU8sVUFBUyxHQUFHLEVBQUUsU0FBUyxFQUFFO0FBQzlCLGFBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0dBQ3hDLENBQUE7Q0FDRjs7QUFFTSxTQUFTLGVBQWUsQ0FBQyxFQUFFLEVBQUU7QUFDbEMsU0FBTyxVQUFVLEdBQUcsRUFBRTtBQUNwQixRQUFJLFFBQVEsR0FBRyxrQ0FWWCxlQUFlLENBVVksRUFBRSxDQUFDLENBQUM7QUFDbkMsUUFBRyxRQUFRLEVBQUU7QUFDWCxjQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ3JCO0dBQ0YsQ0FBQTtDQUNGOztBQUVNLFNBQVMsZ0JBQWdCLENBQUMsRUFBRSxFQUFFLGVBQWUsRUFBRSxNQUFNLEVBQUU7QUFDNUQsU0FBTyxZQUFZO0FBQ2pCLFdBQU87QUFDTCxZQUFNLEVBQUUsTUFBTTtBQUNkLFFBQUUsRUFBRSxZQUFVLEdBQUcsRUFBRTtBQUNqQixZQUFJLFFBQVEsR0FBRyxlQUFlLEVBQUUsQ0FBQztBQUNqQywwQ0F2QmlCLGdCQUFnQixDQXVCaEIsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQy9CLGdCQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO09BQ3JCO0tBQ0YsQ0FBQTtHQUNGLENBQUE7Q0FDRjs7QUFFTSxTQUFTLGNBQWMsQ0FBQyxHQUFHLEVBQUUsZUFBZSxFQUFFO0FBQ25ELFNBQU8sVUFBUyxHQUFHLEVBQUUsU0FBUyxFQUFFO0FBQzlCLGFBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdEMsV0FBTyxHQUFHLENBQUM7R0FDWixDQUFBO0NBQ0Y7O0FBRU0sU0FBUyxhQUFhLENBQUMsRUFBRSxFQUFFLE1BQU0sRUFBRTtBQUN4QyxTQUFPLFlBQVc7QUFDaEIsV0FBTztBQUNMLFlBQU0sRUFBRSxNQUFNO0FBQ2QsUUFBRSxFQUFFLFlBQVUsR0FBRyxFQUFFO0FBQ2pCLDBDQTFDaUIsZ0JBQWdCLENBMENoQixFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7T0FDM0I7S0FDRixDQUFBO0dBQ0YsQ0FBQztDQUNIOztBQUVNLFNBQVMsSUFBSSxHQUFHO0FBQ3JCLFNBQU8sVUFBUyxHQUFHLEVBQUU7QUFDbkIsV0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztHQUNsQixDQUFBO0NBQ0Y7Ozs7Ozs7Ozs7Ozs7Ozs7OztvQkNyRGdCLFlBQVk7Ozs7MkJBQ0gsY0FBYzs7SUFFbkIsWUFBWTtBQUNuQixXQURPLFlBQVksQ0FDbEIsTUFBTSxFQUFFOzBCQURGLFlBQVk7O0FBRTdCLFFBQUcsT0FBTyxNQUFNLElBQUksUUFBUSxJQUFJLE9BQU8sTUFBTSxJQUFJLFVBQVUsRUFBRTtBQUMzRCxZQUFNLG9EQUFvRCxDQUFDO0tBQzVEOztBQUVELFFBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0dBQ3RCOztlQVBrQixZQUFZOztXQVMzQixhQUFDLElBQUksRUFBRTtBQUNULGFBQU8sUUFBUSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDcEM7OztTQVhrQixZQUFZOzs7cUJBQVosWUFBWTs7QUFjakMsU0FBUyxTQUFTLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRTtBQUMvQixVQUFPLE9BQU8sSUFBSTtBQUNoQixTQUFLLFFBQVE7QUFDWCxhQUFPLFdBQVcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFBQSxBQUNuQyxTQUFLLE9BQU87QUFDVixhQUFPLFlBQVksQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFBQSxBQUNwQztBQUNFLGFBQU8sSUFBSSxDQUFDO0FBQUEsR0FDZjtDQUNGOztBQUVELFNBQVMsS0FBSyxDQUFDLEdBQUcsRUFBRTtBQUNsQixNQUFHLGtCQUFLLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUNyQixXQUFPLGFBN0JILFdBQVcsQ0E2QkksR0FBRyxDQUFDLENBQUM7R0FDekI7O0FBRUQsTUFBRyxrQkFBSyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDcEIsV0FBTyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0dBQ3JCOztBQUVELFNBQU8sR0FBRyxDQUFDO0NBQ1o7O0FBRUQsU0FBUyxRQUFRLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUU7QUFDL0MsTUFBSSxVQUFVLEVBQUUsTUFBTSxDQUFDOztBQUV2QixNQUFHLENBQUMsWUFBWSxFQUFFO0FBQ2hCLFdBQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ3BCOztBQUVELE1BQUcsT0FBTyxZQUFZLElBQUksVUFBVSxFQUFFO0FBQ3BDLGNBQVUsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDekIsVUFBTSxHQUFHLFlBQVksQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDN0MsUUFBRyxPQUFPLE1BQU0sSUFBSSxRQUFRLElBQUksTUFBTSxDQUFDLEVBQUUsRUFBRTtBQUN6QyxnQkFBVSxHQUFHLFFBQVEsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztBQUN0RCxZQUFNLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0tBQ3ZCO0FBQ0QsV0FBTyxVQUFVLENBQUM7R0FDbkI7O0FBRUQsU0FBTyxTQUFTLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFDO0NBQ3RDOztBQUVELFNBQVMsV0FBVyxDQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUU7QUFDakMsU0FBTyxNQUFNLENBQ1YsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUNULE1BQU0sQ0FBQyxVQUFTLE1BQU0sRUFBRSxHQUFHLEVBQUU7QUFDNUIsVUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFFBQVEsQ0FDcEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUNSLE1BQU0sQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEdBQ3hCLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FDWCxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQ2IsTUFBTSxDQUNQLENBQUM7QUFDRixXQUFPLE1BQU0sQ0FBQztHQUNmLEVBQUUsRUFBRSxDQUFDLENBQUM7Q0FDVjs7QUFFRCxTQUFTLFlBQVksQ0FBRSxHQUFHLEVBQUUsTUFBTSxFQUFFO0FBQ2xDLFNBQU8sR0FBRyxDQUNQLE1BQU0sQ0FBQyxVQUFTLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFO0FBQ25DLFVBQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUNsQixHQUFHLENBQUMsS0FBSyxDQUFDLEVBQ1YsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUNULE1BQU0sQ0FDUCxDQUFDLENBQUM7QUFDSCxXQUFPLE1BQU0sQ0FBQztHQUNmLEVBQUUsRUFBRSxDQUFDLENBQUM7Q0FDVjs7Ozs7Ozs7Ozs7OztBQ3JGRCxJQUFJLEtBQUssR0FBRyxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7O0FBRTFHLElBQUksSUFBSSxHQUFHO0FBQ1QsV0FBUyxFQUFFLG1CQUFVLEtBQUssRUFBRTtBQUFFLFdBQU8sT0FBTyxLQUFLLElBQUksV0FBVyxDQUFBO0dBQUU7QUFDbEUsS0FBRyxFQUFFLGFBQVUsS0FBSyxFQUFFLFlBQVksRUFBRTtBQUFFLFdBQU8sQUFBQyxPQUFPLEtBQUssSUFBSSxXQUFXLEdBQUksWUFBWSxHQUFHLEtBQUssQ0FBQTtHQUFFO0FBQ25HLE9BQUssRUFBRSxlQUFVLE9BQU8sRUFBRTtBQUFFLFVBQU0sSUFBSSxLQUFLLENBQUMsRUFBRSxHQUFHLElBQUksR0FBRyxPQUFPLENBQUMsQ0FBQTtHQUFFO0FBQ2xFLE1BQUksRUFBRSxjQUFVLE9BQU8sRUFBRTtBQUFFLFFBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxDQUFBO0dBQUU7QUFDNUQsS0FBRyxFQUFFLGFBQVUsT0FBTyxFQUFFO0FBQUUsUUFBRyxNQUFNLENBQUMsR0FBRyxFQUFFO0FBQUUsYUFBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsSUFBSSxHQUFHLE9BQU8sQ0FBQyxDQUFBO0tBQUU7R0FBRTtBQUMvRSxhQUFXLEVBQUUscUJBQVUsSUFBSSxFQUFFO0FBQUUsV0FBTyxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7R0FBRTtBQUN4RSxNQUFJLEVBQUUsY0FBVSxHQUFHLEVBQUUsR0FBRyxFQUFFOztBQUN4QixPQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQztBQUNmLFFBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRTtBQUFFLFVBQUksQ0FBQyxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQztLQUFFO0FBQ3JELFdBQU8sSUFBSSxDQUFDLEtBQUssQ0FBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUEsQUFBQyxDQUFFLEdBQUksR0FBRyxBQUFDLENBQUM7R0FDOUQ7Q0FDRixDQUFDOztBQUVGLEtBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3BDLE1BQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFTLElBQUksRUFBRTtBQUN0QyxXQUFPLFVBQVMsR0FBRyxFQUFFO0FBQ25CLGFBQU8sTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLFVBQVUsR0FBRyxJQUFJLEdBQUcsR0FBRyxDQUFDO0tBQ3ZFLENBQUM7R0FDSCxDQUFBLENBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDZDs7cUJBRWMsSUFBSTs7Ozs7Ozs7Ozs7Ozs7Ozs7d0JDeEJFLGtDQUFrQzs7OztxQkFDckMsK0JBQStCOzs7O3lCQUMzQix3QkFBd0I7Ozs7NkJBQ3BCLHNDQUFzQzs7Ozt3QkFDM0MsZ0JBQWdCOzs7OzZCQUNYLHVDQUF1Qzs7OztJQUs1QyxlQUFlO0FBQ3RCLFdBRE8sZUFBZSxDQUNyQixNQUFNLEVBQUUsc0JBQXNCLEVBQUU7OztBQUMzQyxRQUFJLFFBQVEsR0FBRywrQkFBa0IsTUFBTSxDQUFDLENBQUM7O0FBRXpDLDJCQUFVLFlBQVk7QUFDcEIsY0FBUSxDQUFDLElBQUksdUJBQVUsQ0FBQztLQUN6QixDQUFDLENBQUM7O0FBRUgsMEJBQXNCLENBQUMsSUFBSSxDQUFDLFVBQVMsdUJBQXVCLEVBQUU7QUFDNUQsNkJBQXVCLENBQUMsS0FBSyxDQUFDLFVBQVMsZUFBZSxFQUFFO0FBQ3RELGdCQUFRLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxDQUFDO09BQ3BDLENBQUMsQ0FBQztLQUNKLENBQUMsQ0FBQztHQUNKOzt5QkFia0IsZUFBZTtBQUFmLGlCQUFlLEdBRG5DLG1CQUFNLGlCQUFpQixDQUFDLENBQ0osZUFBZSxLQUFmLGVBQWU7QUFBZixpQkFBZSxHQUhuQyxzQkFBUyxtQkFBbUIsQ0FBQyxDQUdULGVBQWUsS0FBZixlQUFlO1NBQWYsZUFBZTs7O3FCQUFmLGVBQWU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7d0JDVmYsa0NBQWtDOzs7O3FCQUNyQywrQkFBK0I7Ozs7eUJBQzNCLHdCQUF3Qjs7OztpQ0FDaEIsMENBQTBDOzs7O3dCQUNuRCxnQkFBZ0I7Ozs7SUFJaEIsY0FBYztBQUN0QixXQURRLGNBQWMsQ0FDckIsTUFBTSxFQUFFLGdCQUFnQixFQUFFOzs7QUFDcEMsUUFBSSxRQUFRLEdBQUcsbUNBQXNCLE1BQU0sQ0FBQyxDQUFDOztBQUU3QywyQkFBVSxZQUFZO0FBQ3BCLGNBQVEsQ0FBQyxJQUFJLHVCQUFVLENBQUM7S0FDekIsQ0FBQyxDQUFDOztBQUVILG9CQUFnQixDQUFDLElBQUksQ0FBQyxVQUFTLFNBQVMsRUFBRTtBQUN6QyxjQUFRLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0tBQ2pDLENBQUMsQ0FBQzs7QUFFSCxRQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztHQUMxQjs7d0JBYmtCLGNBQWM7QUFBZCxnQkFBYyxHQURsQyxtQkFBTSxXQUFXLENBQUMsQ0FDRSxjQUFjLEtBQWQsY0FBYztBQUFkLGdCQUFjLEdBRmxDLHNCQUFTLGtCQUFrQixDQUFDLENBRVIsY0FBYyxLQUFkLGNBQWM7U0FBZCxjQUFjOzs7cUJBQWQsY0FBYzs7Ozs7Ozs7Ozs7Ozs7Ozs7cUJDUmpCLCtCQUErQjs7Ozt3QkFDNUIsa0NBQWtDOzs7O3lCQUNqQyx3QkFBd0I7Ozs7OEJBQ25CLHVDQUF1Qzs7Ozt3QkFDN0MsZ0JBQWdCOzs7O0lBS2hCLFdBQVc7QUFDbkIsV0FEUSxXQUFXLENBQ2xCLE1BQU0sRUFBRSxjQUFjLEVBQUUsa0JBQWtCLEVBQUU7OztBQUN0RCxRQUFJLFFBQVEsR0FBRyxnQ0FBbUIsTUFBTSxDQUFDLENBQUM7O0FBRTFDLDJCQUFVLFlBQVk7QUFDcEIsY0FBUSxDQUFDLElBQUksdUJBQVUsQ0FBQztLQUN6QixDQUFDLENBQUM7O0FBRUgsWUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDOzs7QUFHakIsa0JBQWMsQ0FBQyxJQUFJLENBQUMsVUFBUyxPQUFPLEVBQUU7QUFDcEMsYUFBTyxDQUFDLE9BQU8sQ0FBQyxVQUFTLE1BQU0sRUFBRTs7QUFFL0IsMEJBQWtCLENBQUMsSUFBSSxDQUFDLFVBQVMsV0FBVyxFQUFFO0FBQzVDLGNBQUksVUFBVSxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRTNDLG9CQUFVLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxZQUFXO0FBQ3RDLHNCQUFVLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNqQyxvQkFBUSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztXQUNoQyxDQUFDLENBQUM7U0FDSixDQUFDLENBQUM7T0FDSixDQUFDLENBQUM7S0FDSixDQUFDLENBQUM7O0FBRUgsUUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7R0FDMUI7O3FCQTFCa0IsV0FBVztBQUFYLGFBQVcsR0FEL0IsbUJBQU0sYUFBYSxDQUFDLENBQ0EsV0FBVyxLQUFYLFdBQVc7QUFBWCxhQUFXLEdBRi9CLG1CQUFNLFNBQVMsQ0FBQyxDQUVJLFdBQVcsS0FBWCxXQUFXO0FBQVgsYUFBVyxHQUgvQixzQkFBUyxpQkFBaUIsQ0FBQyxDQUdQLFdBQVcsS0FBWCxXQUFXO1NBQVgsV0FBVzs7O3FCQUFYLFdBQVc7Ozs7Ozs7Ozs7O3FCQ0xSLEtBQUs7Ozs7OytCQUpELDhCQUE4Qjs7Ozs4QkFDL0IsNkJBQTZCOzs7OzJCQUNoQywwQkFBMEI7Ozs7QUFFbkMsU0FBUyxLQUFLLEdBQUk7QUFDL0Isb0NBQXFCLENBQUM7QUFDdEIsbUNBQW9CLENBQUM7QUFDckIsZ0NBQWlCLENBQUM7Q0FDbkI7Ozs7Ozs7Ozs7OztxQkNIdUIsV0FBVzs7Ozs7NEJBTFYsbUNBQW1DOzs7OzZCQUNsQyx1Q0FBdUM7Ozs7NEJBQ3hDLHNDQUFzQzs7Ozs4Q0FDakIsNEJBQTRCOztBQUUzRCxTQUFTLFdBQVcsR0FBRztBQUNwQyxTQUFPLDBCQUFhLGtCQUFrQixDQUFDLENBQ3BDLEtBQUssQ0FBQyxVQUFTLFNBQVMsRUFBRTtBQUN6QixRQUFJLE1BQU0sR0FBRyxjQUFjLEVBQUUsQ0FBQztBQUM5QixRQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2xDLFdBQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7O0dBRXBCLENBQUMsQ0FBQztDQUNOOztBQUdELFNBQVMsY0FBYyxHQUFHO0FBQ3hCLFNBQU8sOEJBQWlCO0FBQ3RCLG9CQUFnQixFQUFFO0FBQ2hCLGdCQUFVLEVBQUU7QUFDVixxQkFBYSxFQUFFLGdDQWpCZixnQkFBZ0IsQ0FpQmdCLGlCQUFpQiw2QkFBZ0I7T0FDbEU7QUFDRCxjQUFRLEVBQUU7QUFDUixlQUFPLEVBQUUsZ0NBcEJTLGFBQWEsQ0FvQlIsU0FBUyxDQUFDO09BQ2xDO0FBQ0QsZ0JBQVUsRUFBRTtBQUNWLGlCQUFTLEVBQUUsZ0NBdkJPLGFBQWEsQ0F1Qk4sV0FBVyxDQUFDO09BQ3RDO0tBQ0Y7R0FDRixDQUFDLENBQUM7Q0FDSjs7Ozs7Ozs7Ozs7Ozs7cUJDckJ1QixZQUFZOzs7Ozs0QkFUWCxtQ0FBbUM7Ozs7NkJBQ2xDLHVDQUF1Qzs7Ozs0QkFDeEMsc0NBQXNDOzs7O3dCQUMxQywyQkFBMkI7Ozs7K0JBQ3BCLGtDQUFrQzs7Ozs0Q0FDbEIsNEJBQTRCOztBQUl6RCxTQUFTLFlBQVksR0FBRztBQUNyQyxTQUFPLDBCQUFhLFlBQVksQ0FBQyxDQUM5QixLQUFLLENBQUMsVUFBUyxVQUFVLEVBQUU7QUFDMUIsUUFBSSxZQUFZLEdBQUcsZUFBZSxFQUFFLENBQUM7QUFDckMsUUFBSSxNQUFNLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUMxQyxXQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0dBQ3JCLENBQUMsQ0FBQztDQUNOOztBQUVELFNBQVMsZUFBZSxDQUFDLEdBQUcsRUFBRSxTQUFTLEVBQUU7QUFDdkMsV0FBUyxZQUFlLEdBQUcsMkJBQWMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQVMsV0FBVyxFQUFFO0FBQ3hFLGFBQVMsVUFBYSxHQUFHLDZCQUFnQixzQkFBUyxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQztHQUM1RSxDQUFDLENBQUM7Q0FDSjs7QUFFRCxTQUFTLGVBQWUsR0FBRztBQUN6QixTQUFPLDhCQUFpQiw4QkFwQkYsYUFBYSxDQW9CRyxhQUFhLEVBQUU7QUFDbkQsT0FBRyxFQUFFOztBQUVILG9CQUFjLEVBQUUsZUFBZTtLQUNoQztHQUNGLENBQUMsQ0FBQyxDQUFDO0NBQ0w7Ozs7Ozs7Ozs7Ozs7cUJDL0JjO0FBQ2IsR0FBQyxFQUFFLENBQUM7QUFDSixHQUFDLEVBQUUsQ0FBQztBQUNKLE9BQUssRUFBRSxHQUFHO0FBQ1YsUUFBTSxFQUFFLEdBQUc7Q0FDWiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcclxuICogQ3JlYXRlZCBieSBTaGF1biBvbiA0LzIzLzIwMTUuXHJcbiAqL1xyXG5cclxuLy9pbXBvcnQgUmVzb3VyY2VSZWdpc3RyeSBmcm9tICcuL2VuZ2luZS9yZXNvdXJjZXMvcmVzb3VyY2UtcmVnaXN0cnkuanMnO1xyXG5pbXBvcnQge2NhY2hlRGF0YUVsZW1lbnRzfSBmcm9tICcuL2VuZ2luZS9mcmFnbWVudHMuanMnO1xyXG5pbXBvcnQgUmVzb3VyY2UgZnJvbSAnLi9lbmdpbmUvcmVzb3VyY2VzL3Jlc291cmNlLmpzJztcclxuaW1wb3J0IHtnZXRJbnN0YW5jZXN9IGZyb20gJy4vZW5naW5lL2NvbnRhaW5lci5qcyc7XHJcbmltcG9ydCBIdHRwUmVzb3VyY2UgZnJvbSAnLi9lbmdpbmUvcmVzb3VyY2VzL2h0dHAtcmVzb3VyY2UuanMnO1xyXG5pbXBvcnQgU2NlbmVTY2hlbWEgZnJvbSAnLi9zY2hlbWEvc2NlbmUtc2NoZW1hLmpzJztcclxuaW1wb3J0IFNwcml0ZVNjaGVtYSBmcm9tICcuL3NjaGVtYS9zcHJpdGUtc2NoZW1hLmpzJztcclxuaW1wb3J0IFNjZW5lIGZyb20gJy4vc2NlbmUuanMnO1xyXG5cclxuY2FjaGVEYXRhRWxlbWVudHMoKTtcclxuXHJcbi8qd2luZG93LnJlZnJlc2ggPSBmdW5jdGlvbigpIHtcclxuICByZXR1cm4gUmVzb3VyY2VSZWdpc3RyeS5nZXRSZXNvdXJjZXMoJ2Fzc2V0cy9raXR0eS5qc29uJyk7XHJcbn07Ki9cclxuXHJcbi8vdmFyIGxvYWRlciA9IG5ldyBMb2FkZXIoKTtcclxuLy9sb2FkZXIuZ2V0U2NlbmUoJ2tpdHR5LXdvcmxkLmpzb24nLCdhc3NldHMnKTtcclxuXHJcblJlc291cmNlLmJhc2VVcmkgPSAnYXNzZXRzJztcclxuXHJcbi8vIERFQlVHXHJcbndpbmRvdy5SZXNvdXJjZSA9IFJlc291cmNlO1xyXG53aW5kb3cuZ2V0SW5zdGFuY2VzID0gZ2V0SW5zdGFuY2VzO1xyXG5cclxuLyp2YXIgc2NlbmVTY2hlbWEgPSBTY2VuZVNjaGVtYSgpO1xyXG5cclxuSHR0cFJlc291cmNlKCdraXR0eS13b3JsZC5qc29uJylcclxuICAucmVhZHkoZnVuY3Rpb24oc2NlbmVEYXRhKSB7XHJcbiAgICB2YXIgc2NlbmUgPSBzY2VuZVNjaGVtYS5tYXAoc2NlbmVEYXRhKTtcclxuICAgIGNvbnNvbGUubG9nKHNjZW5lKTtcclxuICAgIFNjZW5lKHNjZW5lKTtcclxuICB9KTsqL1xyXG5cclxuU2NlbmVTY2hlbWEoKTtcclxuU3ByaXRlU2NoZW1hKCk7XHJcblxyXG4vKnZhciBzcHJpdGVTY2hlbWEgPSBTcHJpdGVTY2hlbWEoKTtcclxuXHJcbkh0dHBSZXNvdXJjZSgna2l0dHkuanNvbicpXHJcbiAgLnJlYWR5KGZ1bmN0aW9uKHNwcml0ZURhdGEpIHtcclxuICAgIHZhciBzcHJpdGUgPSBzcHJpdGVTY2hlbWEubWFwKHNwcml0ZURhdGEpO1xyXG4gICAgY29uc29sZS5sb2coc3ByaXRlKTtcclxuICB9KTsqL1xyXG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBTaGF1biBvbiAzLzEvMTVcclxuICpcclxuICovXHJcblxyXG5pbXBvcnQge2dldENhbnZhcywgZ2V0VHJhbnNwYXJlbnRJbWFnZX0gZnJvbSAnLi4vZW5naW5lL2NvbW1vbi5qcyc7XHJcblxyXG5jb25zdCBERUZBVUxUX1JBVEUgPSA1O1xyXG5cclxuZnVuY3Rpb24gYnVpbGRGcmFtZVNlcXVlbmNlKGZyYW1lU2V0RGVmaW5pdGlvbiwgZnJhbWVTaXplLCBzcHJpdGVTaGVldCkge1xyXG4gIHZhciBmcmFtZVdpZHRoID0gZnJhbWVTaXplLndpZHRoO1xyXG4gIHZhciBmcmFtZUhlaWdodCA9IGZyYW1lU2l6ZS5oZWlnaHQ7XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICByYXRlOiBmcmFtZVNldERlZmluaXRpb24ucmF0ZSB8fCBERUZBVUxUX1JBVEUsXHJcbiAgICBmcmFtZXM6IGZyYW1lU2V0RGVmaW5pdGlvbi5mcmFtZXNcclxuICAgICAgLm1hcChmdW5jdGlvbihmcmFtZURlZmluaXRpb24pIHtcclxuICAgICAgICB2YXIgZnJhbWUgPSBnZXRDYW52YXMoZnJhbWVXaWR0aCwgZnJhbWVIZWlnaHQpO1xyXG5cclxuICAgICAgICBmcmFtZVxyXG4gICAgICAgICAgLmdldENvbnRleHQoJzJkJylcclxuICAgICAgICAgIC5kcmF3SW1hZ2UoXHJcbiAgICAgICAgICAgIHNwcml0ZVNoZWV0LFxyXG4gICAgICAgICAgICBmcmFtZURlZmluaXRpb24ueCwgZnJhbWVEZWZpbml0aW9uLnksXHJcbiAgICAgICAgICAgIGZyYW1lV2lkdGgsIGZyYW1lSGVpZ2h0LFxyXG4gICAgICAgICAgICAwLCAwLFxyXG4gICAgICAgICAgICBmcmFtZVdpZHRoLCBmcmFtZUhlaWdodFxyXG4gICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGZyYW1lO1xyXG4gICAgICB9KVxyXG4gIH07XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChzcHJpdGVEZWZpbml0aW9uLCBzcHJpdGVTaGVldCkge1xyXG4gIHJldHVybiBPYmplY3RcclxuICAgIC5rZXlzKHNwcml0ZURlZmluaXRpb24uZnJhbWVTZXQpXHJcbiAgICAucmVkdWNlKGZ1bmN0aW9uKGZyYW1lU2V0LCBmcmFtZVNldElkKSB7XHJcbiAgICAgIHZhciBmcmFtZVNlcXVlbmNlID0gYnVpbGRGcmFtZVNlcXVlbmNlKFxyXG4gICAgICAgIHNwcml0ZURlZmluaXRpb24uZnJhbWVTZXRbZnJhbWVTZXRJZF0sXHJcbiAgICAgICAgc3ByaXRlRGVmaW5pdGlvbi5mcmFtZVNpemUsXHJcbiAgICAgICAgc3ByaXRlU2hlZXRcclxuICAgICAgKTtcclxuXHJcbiAgICAgIGZyYW1lU2VxdWVuY2UuZnJhbWVzID0gZnJhbWVTZXF1ZW5jZS5mcmFtZXNcclxuICAgICAgICAubWFwKGZ1bmN0aW9uKGZyYW1lKSB7XHJcbiAgICAgICAgICByZXR1cm4gZ2V0VHJhbnNwYXJlbnRJbWFnZShzcHJpdGVEZWZpbml0aW9uLnRyYW5zcGFyZW50Q29sb3IsIGZyYW1lKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgIGZyYW1lU2V0W2ZyYW1lU2V0SWRdID0gZnJhbWVTZXF1ZW5jZTtcclxuXHJcbiAgICAgIHJldHVybiBmcmFtZVNldDtcclxuICAgIH0sIHt9KTtcclxufTtcclxuIiwiaW1wb3J0IFNjaGVkdWxlciBmcm9tICcuLi9lbmdpbmUvc2NoZWR1bGVyLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChmcmFtZVNldCkge1xyXG4gIHZhciBjdXJyZW50RnJhbWVTZXF1ZW5jZSA9IG51bGwsXHJcbiAgICBjdXJyZW50RnJhbWVJbmRleCA9IDAsXHJcbiAgICBjdXJyZW50RnJhbWUgPSBudWxsLFxyXG4gICAgZnJhbWVDYWxsYmFjayA9IG51bGw7XHJcblxyXG4gIHZhciBzY2hlZHVsZXJJZCA9IFNjaGVkdWxlcihmdW5jdGlvbihkZWx0YVRpbWUsIHNldFJhdGUpIHtcclxuICAgIGlmKCFjdXJyZW50RnJhbWVTZXF1ZW5jZSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgaWYoIWN1cnJlbnRGcmFtZSkge1xyXG4gICAgICBzZXRSYXRlKGN1cnJlbnRGcmFtZVNlcXVlbmNlLnJhdGUpO1xyXG4gICAgfVxyXG5cclxuICAgIGN1cnJlbnRGcmFtZSA9IGN1cnJlbnRGcmFtZVNlcXVlbmNlLmZyYW1lc1tjdXJyZW50RnJhbWVJbmRleF07XHJcbiAgICBpZihmcmFtZUNhbGxiYWNrKSB7XHJcbiAgICAgIGZyYW1lQ2FsbGJhY2soY3VycmVudEZyYW1lKTtcclxuICAgIH1cclxuXHJcbiAgICBpZigrK2N1cnJlbnRGcmFtZUluZGV4ID49IGN1cnJlbnRGcmFtZVNlcXVlbmNlLmZyYW1lcy5sZW5ndGgpIHtcclxuICAgICAgY3VycmVudEZyYW1lSW5kZXggPSAwO1xyXG4gICAgfVxyXG4gIH0pXHJcbiAgICAuaWQoKTtcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIHBsYXk6IGZ1bmN0aW9uKGZyYW1lU2V0SWQpIHtcclxuICAgICAgY3VycmVudEZyYW1lU2VxdWVuY2UgPSBmcmFtZVNldFtmcmFtZVNldElkXTtcclxuICAgICAgY3VycmVudEZyYW1lSW5kZXggPSAwO1xyXG4gICAgICBjdXJyZW50RnJhbWUgPSBudWxsO1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcbiAgICBvbkZyYW1lOiBmdW5jdGlvbihjYikge1xyXG4gICAgICBmcmFtZUNhbGxiYWNrID0gY2I7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuICAgIHN0b3A6IGZ1bmN0aW9uKCkge1xyXG4gICAgICBjdXJyZW50RnJhbWVTZXF1ZW5jZSA9IG51bGw7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuICAgIGtpbGw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICBTY2hlZHVsZXIudW5zY2hlZHVsZShzY2hlZHVsZXJJZCk7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuICAgIGN1cnJlbnRGcmFtZUluZGV4OiBmdW5jdGlvbigpIHtcclxuICAgICAgcmV0dXJuIGN1cnJlbnRGcmFtZUluZGV4O1xyXG4gICAgfSxcclxuICAgIGdldEltYWdlOiBmdW5jdGlvbigpIHtcclxuICAgICAgcmV0dXJuIGN1cnJlbnRGcmFtZTtcclxuICAgIH1cclxuICB9O1xyXG59XHJcbiIsIlxyXG5pbXBvcnQgVXRpbCBmcm9tICcuL3V0aWwuanMnO1xyXG5cclxuLy8gUmV0dXJuIGV2ZXJ5dGhpbmcgYmVmb3JlIHRoZSBsYXN0IHNsYXNoIG9mIGEgdXJsXHJcbi8vIGUuZy4gaHR0cDovL2Zvby9iYXIvYmF6Lmpzb24gPT4gaHR0cDovL2Zvby9iYXJcclxuZXhwb3J0IGZ1bmN0aW9uIGdldEJhc2VVcmwodXJsKSB7XHJcbiAgdmFyIG4gPSB1cmwubGFzdEluZGV4T2YoJy8nKTtcclxuICByZXR1cm4gdXJsLnN1YnN0cmluZygwLCBuKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGlzRnVsbFVybCh1cmwpIHtcclxuICByZXR1cm4gKHVybC5zdWJzdHJpbmcoMCwgNykgPT09ICdodHRwOi8vJyB8fFxyXG4gICAgdXJsLnN1YnN0cmluZygwLCA4KSA9PT0gJ2h0dHBzOi8vJyk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVVcmwodXJsLCBiYXNlVXJsKSB7XHJcbiAgaWYoYmFzZVVybCAmJiAhaXNGdWxsVXJsKHVybCkpIHtcclxuICAgIHJldHVybiBiYXNlVXJsICsgJy8nICsgdXJsO1xyXG4gIH1cclxuICByZXR1cm4gdXJsO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VPYmplY3Qoc291cmNlLCBkZXN0aW5hdGlvbiwgYWxsb3dXcmFwLCBleGNlcHRpb25PbkNvbGxpc2lvbnMpIHtcclxuICBzb3VyY2UgPSBzb3VyY2UgfHwge307IC8vUG9vbC5nZXRPYmplY3QoKTtcclxuICBkZXN0aW5hdGlvbiA9IGRlc3RpbmF0aW9uIHx8IHt9OyAvL1Bvb2wuZ2V0T2JqZWN0KCk7XHJcblxyXG4gIE9iamVjdC5rZXlzKHNvdXJjZSkuZm9yRWFjaChmdW5jdGlvbihwcm9wKSB7XHJcbiAgICBhc3NpZ25Qcm9wZXJ0eShzb3VyY2UsIGRlc3RpbmF0aW9uLCBwcm9wLCBhbGxvd1dyYXAsIGV4Y2VwdGlvbk9uQ29sbGlzaW9ucyk7XHJcbiAgfSk7XHJcblxyXG4gIHJldHVybiBkZXN0aW5hdGlvbjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGFzc2lnblByb3BlcnR5KHNvdXJjZSwgZGVzdGluYXRpb24sIHByb3AsIGFsbG93V3JhcCwgZXhjZXB0aW9uT25Db2xsaXNpb25zKSB7XHJcbiAgaWYoZGVzdGluYXRpb24uaGFzT3duUHJvcGVydHkocHJvcCkpIHtcclxuICAgIGlmKGFsbG93V3JhcCkge1xyXG4gICAgICBkZXN0aW5hdGlvbltwcm9wXSA9IEZ1bmMud3JhcChkZXN0aW5hdGlvbltwcm9wXSwgc291cmNlW3Byb3BdKTtcclxuICAgICAgVXRpbC5sb2coJ01lcmdlOiB3cmFwcGVkIFxcJycgKyBwcm9wICsgJ1xcJycpO1xyXG4gICAgfSBlbHNlIGlmKGV4Y2VwdGlvbk9uQ29sbGlzaW9ucykge1xyXG4gICAgICBVdGlsLmVycm9yKCdGYWlsZWQgdG8gbWVyZ2UgbWl4aW4uIE1ldGhvZCBcXCcnICtcclxuICAgICAgcHJvcCArICdcXCcgY2F1c2VkIGEgbmFtZSBjb2xsaXNpb24uJyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBkZXN0aW5hdGlvbltwcm9wXSA9IHNvdXJjZVtwcm9wXTtcclxuICAgICAgVXRpbC5sb2coJ01lcmdlOiBvdmVyd3JvdGUgXFwnJyArIHByb3AgKyAnXFwnJyk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZGVzdGluYXRpb247XHJcbiAgfVxyXG5cclxuICBkZXN0aW5hdGlvbltwcm9wXSA9IHNvdXJjZVtwcm9wXTtcclxuXHJcbiAgcmV0dXJuIGRlc3RpbmF0aW9uO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2FudmFzKHdpZHRoLCBoZWlnaHQpIHtcclxuICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcblxyXG4gIGNhbnZhcy53aWR0aCA9IHdpZHRoIHx8IDUwMDtcclxuICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0IHx8IDUwMDtcclxuXHJcbiAgcmV0dXJuIGNhbnZhcztcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGludGVyc2VjdHMocmVjdEEsIHJlY3RCKSB7XHJcbiAgcmV0dXJuICEoXHJcbiAgICByZWN0QS54ICsgcmVjdEEud2lkdGggPCByZWN0Qi54IHx8XHJcbiAgICByZWN0QS55ICsgcmVjdEEuaGVpZ2h0IDwgcmVjdEIueSB8fFxyXG4gICAgcmVjdEEueCA+IHJlY3RCLnggKyByZWN0Qi53aWR0aCB8fFxyXG4gICAgcmVjdEEueSA+IHJlY3RCLnkgKyByZWN0Qi5oZWlnaHRcclxuICApO1xyXG59XHJcblxyXG4vLyBNYWtlIHRoZSBnaXZlbiBSR0IgdmFsdWUgdHJhbnNwYXJlbnQgaW4gdGhlIGdpdmVuIGltYWdlLlxyXG4vLyBSZXR1cm5zIGEgbmV3IGltYWdlLlxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0VHJhbnNwYXJlbnRJbWFnZSh0cmFuc1JHQiwgaW1hZ2UpIHtcclxuICB2YXIgciwgZywgYiwgbmV3SW1hZ2UsIGRhdGFMZW5ndGg7XHJcbiAgdmFyIHdpZHRoID0gaW1hZ2Uud2lkdGg7XHJcbiAgdmFyIGhlaWdodCA9IGltYWdlLmhlaWdodDtcclxuICB2YXIgaW1hZ2VEYXRhID0gaW1hZ2VcclxuICAgIC5nZXRDb250ZXh0KCcyZCcpXHJcbiAgICAuZ2V0SW1hZ2VEYXRhKDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xyXG5cclxuICBpZih0cmFuc1JHQikge1xyXG4gICAgZGF0YUxlbmd0aCA9IHdpZHRoICogaGVpZ2h0ICogNDtcclxuXHJcbiAgICBmb3IodmFyIGluZGV4ID0gMDsgaW5kZXggPCBkYXRhTGVuZ3RoOyBpbmRleCs9NCkge1xyXG4gICAgICByID0gaW1hZ2VEYXRhLmRhdGFbaW5kZXhdO1xyXG4gICAgICBnID0gaW1hZ2VEYXRhLmRhdGFbaW5kZXggKyAxXTtcclxuICAgICAgYiA9IGltYWdlRGF0YS5kYXRhW2luZGV4ICsgMl07XHJcbiAgICAgIGlmKHIgPT09IHRyYW5zUkdCWzBdICYmIGcgPT09IHRyYW5zUkdCWzFdICYmIGIgPT09IHRyYW5zUkdCWzJdKSB7XHJcbiAgICAgICAgaW1hZ2VEYXRhLmRhdGFbaW5kZXggKyAzXSA9IDA7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIG5ld0ltYWdlID0gZ2V0Q2FudmFzKHdpZHRoLCBoZWlnaHQpO1xyXG4gIG5ld0ltYWdlXHJcbiAgICAuZ2V0Q29udGV4dCgnMmQnKVxyXG4gICAgLnB1dEltYWdlRGF0YShpbWFnZURhdGEsIDAsIDApO1xyXG5cclxuICByZXR1cm4gbmV3SW1hZ2U7XHJcbn1cclxuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IHNoYXVud2VzdCBvbiA0LzMwLzE1LlxuICovXG5cbnZhciBpbnN0YW5jZXMgPSB7fTtcbnZhciBzaW5nbGV0b25zID0gW107XG52YXIgY2FsbGJhY2tzID0gW107XG5cbi8vIFVzZSBhcnJvdyA9PiBmdW5jdGlvbnNcblxuZnVuY3Rpb24gZmluZFNpbmdsZXRvbiAodG9rZW4pIHtcbiAgdmFyIHJlc3VsdHMgPSBzaW5nbGV0b25zLmZpbHRlcihmdW5jdGlvbihzaW5nbGV0b24pIHtcbiAgICByZXR1cm4gKHRva2VuID09PSBzaW5nbGV0b24udG9rZW4pO1xuICB9KTtcblxuICByZXR1cm4gKHJlc3VsdHMubGVuZ3RoKSA/IHJlc3VsdHNbMF0uaW5zdGFuY2UgOiBudWxsO1xufVxuXG5mdW5jdGlvbiByZWdpc3RlckNhbGxiYWNrIChpZCwgY2FsbGJhY2spIHtcbiAgY2FsbGJhY2tzLnB1c2goIHtpZDogaWQsIGZ1bmM6IGNhbGxiYWNrfSApO1xufVxuXG5mdW5jdGlvbiBmaW5kQ2FsbGJhY2tzIChpZCkge1xuICByZXR1cm4gY2FsbGJhY2tzLmZpbHRlcihmdW5jdGlvbihjYWxsYmFjaykge1xuICAgIHJldHVybiAoaWQgPT09IGNhbGxiYWNrLmlkKTtcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VGYWN0b3J5IChpZCwgZmFjdG9yeSkge1xuICByZXR1cm4gaW5jbHVkZUluc3RhbmNlKGlkKSB8fCByZWdpc3RlckZhY3RvcnkoaWQsIGZhY3RvcnkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlU2luZ2xldG9uICh0b2tlbikge1xuICByZXR1cm4gaW5jbHVkZVNpbmdsZXRvbih0b2tlbikgfHwgcmVnaXN0ZXJTaW5nbGV0b24odG9rZW4pO1xufVxuXG4vKiBJIGRvbid0IHRoaW5rIHRoaXMgbWFrZXMgYSB3aG9sZSBsb3Qgb2Ygc2Vuc2VcbmV4cG9ydCBmdW5jdGlvbiB1c2VJbnN0YW5jZShpZCwgaW5zdGFuY2UpIHtcbiAgcmV0dXJuIGluY2x1ZGVJbnN0YW5jZShpZCkgfHwgcmVnaXN0ZXJJbnN0YW5jZShpZCwgaW5zdGFuY2UpO1xufSovXG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckZhY3RvcnkgKGlkLCBmYWN0b3J5KSB7XG4gIGlmKHR5cGVvZiBmYWN0b3J5ID09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gcmVnaXN0ZXJJbnN0YW5jZShpZCwgZmFjdG9yeSgpKTtcbiAgfVxuICB0aHJvdyAncmVnaXN0ZXJGYWN0b3J5OiBmYWN0b3J5IG11c3QgYmUgYSBmdW5jdGlvbic7XG59XG5cblxuLy8gc29tZSBvZiB0aGVzZSAndGhyb3cnIGNhbGxzIGNvdWxkIG1heWJlIGJlIHJlcGxhY2VkIHdpdGggYSBcInJlcXVpcmVkXCIgZGVjb3JhdG9yXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJTaW5nbGV0b24gKHRva2VuKSB7XG4gIHZhciBpbnN0YW5jZTtcblxuICBpZih0eXBlb2YgdG9rZW4gIT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93ICdyZWdpc3RlclNpbmdsZXRvbjogYXJndW1lbnQgbXVzdCBiZSBhIGZ1bmN0aW9uJztcbiAgfVxuXG4gIGluc3RhbmNlID0gbmV3IHRva2VuKCk7XG4gIGlmIChpbnN0YW5jZSkge1xuICAgIHNpbmdsZXRvbnMucHVzaCh7XG4gICAgICB0b2tlbjogdG9rZW4sXG4gICAgICBpbnN0YW5jZTogaW5zdGFuY2VcbiAgICB9KTtcbiAgICByZXR1cm4gaW5zdGFuY2U7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVySW5zdGFuY2UgKGlkLCBpbnN0YW5jZSkge1xuICBpZih0eXBlb2YgaWQgIT0gJ3N0cmluZycgfHwgdHlwZW9mIGluc3RhbmNlID09ICd1bmRlZmluZWQnKSB7XG4gICAgdGhyb3cgJ3JlZ2lzdGVySW5zdGFuY2U6IGEgc3RyaW5nIGlkIGFuZCBhbiBpbnN0YW5jZSBhcmUgcmVxdWlyZWQnO1xuICB9XG4gIGluc3RhbmNlc1tpZF0gPSBpbnN0YW5jZTtcblxuICBmaW5kQ2FsbGJhY2tzKGlkKS5mb3JFYWNoKGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgY2FsbGJhY2suZnVuYyhpbnN0YW5jZSk7XG4gIH0pO1xuXG4gIHJldHVybiBpbnN0YW5jZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluY2x1ZGVTaW5nbGV0b24gKHRva2VuKSB7XG4gIHJldHVybiBmaW5kU2luZ2xldG9uKHRva2VuKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluY2x1ZGVJbnN0YW5jZSAoaWQpIHtcbiAgcmV0dXJuIGluc3RhbmNlc1tpZF07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbmNsdWRlSW5zdGFuY2VBc3luYyhpZCkge1xuICB2YXIgaW5zdGFuY2U7XG5cbiAgaWYodHlwZW9mIGlkICE9ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgJ2luY2x1ZGVJbnN0YW5jZUFzeW5jOiBhIHN0cmluZyBpZCBpcyByZXF1aXJlZCc7XG4gIH1cblxuICBpbnN0YW5jZSA9IGluY2x1ZGVJbnN0YW5jZShpZCk7XG4gIGlmKGluc3RhbmNlKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShpbnN0YW5jZSk7XG4gIH1cblxuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgcmVnaXN0ZXJDYWxsYmFjayhpZCwgZnVuY3Rpb24oaW5zdGFuY2UpIHtcbiAgICAgIHJlc29sdmUoaW5zdGFuY2UpO1xuICAgIH0pO1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEluc3RhbmNlcyAoKSB7XG4gIHJldHVybiBpbnN0YW5jZXM7XG59IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IHNoYXVud2VzdCBvbiA1LzE2LzE1LlxuICovXG5cbi8qKlxuICogQ3JlYXRlZCBieSBzaGF1bndlc3Qgb24gNS85LzE1LlxuICovXG5cbmltcG9ydCBpbmplY3QgZnJvbSAnLi4vaW5qZWN0b3IuanMnO1xuaW1wb3J0IHtpbmNsdWRlSW5zdGFuY2VBc3luY30gZnJvbSAnLi4vY29udGFpbmVyLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYXN5bmMgKCkge1xuICB2YXIgdG9rZW5zID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgcmV0dXJuIGluamVjdCh0b2tlbnMubWFwKHRva2VuID0+IGluY2x1ZGVJbnN0YW5jZUFzeW5jKHRva2VuKSkpO1xufSIsIi8qKlxuICogQ3JlYXRlZCBieSBzaGF1bndlc3Qgb24gNS8xMC8xNS5cbiAqL1xuXG5pbXBvcnQgaW5qZWN0IGZyb20gJy4uL2luamVjdG9yLmpzJztcbmltcG9ydCB7RnJhZ21lbnR9IGZyb20gJy4uL2ZyYWdtZW50cy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gIHJldHVybiBpbmplY3QoW0ZyYWdtZW50KGVsZW1lbnQpXSlcbn0iLCIvKipcclxuICogQ3JlYXRlZCBieSBTaGF1biBvbiA0LzIzLzIwMTUuXHJcbiAqL1xyXG5cclxudmFyIGFsbERhdGFFbGVtZW50cztcclxuXHJcbmZ1bmN0aW9uIGhhc0RhdGFBdHRyaWJ1dGUoZWxlbWVudCkge1xyXG4gIHZhciBhdHRyaWJ1dGVzID0gZWxlbWVudC5hdHRyaWJ1dGVzO1xyXG4gIGZvcih2YXIgaSA9IDAsIG51bUF0dHJpYnV0ZXMgPSBhdHRyaWJ1dGVzLmxlbmd0aDsgaSA8IG51bUF0dHJpYnV0ZXM7IGkrKykge1xyXG4gICAgaWYoYXR0cmlidXRlc1tpXS5uYW1lLnN1YnN0cigwLCA0KSA9PT0gJ2RhdGEnKSB7XHJcbiAgICAgIHJldHVybiBlbGVtZW50O1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGZpbmREYXRhRWxlbWVudHMgKHBhcmVudEVsZW1lbnQpIHtcclxuICB2YXIgYWxsRWxlbWVudHMsIGVsZW1lbnQsIGRhdGFFbGVtZW50cyA9IFtdO1xyXG5cclxuICBpZighcGFyZW50RWxlbWVudCkge1xyXG4gICAgdmFyIGh0bWwgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaHRtbCcpO1xyXG4gICAgaWYoIWh0bWxbMF0pIHtcclxuICAgICAgcmV0dXJuIGRhdGFFbGVtZW50cztcclxuICAgIH1cclxuICAgIHBhcmVudEVsZW1lbnQgPSBodG1sWzBdO1xyXG4gIH1cclxuXHJcbiAgYWxsRWxlbWVudHMgPSBwYXJlbnRFbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyonKTtcclxuICBmb3IodmFyIGkgPSAwLCBudW1FbGVtZW50cyA9IGFsbEVsZW1lbnRzLmxlbmd0aDsgaSA8IG51bUVsZW1lbnRzOyBpKyspIHtcclxuICAgIGVsZW1lbnQgPSBhbGxFbGVtZW50c1tpXTtcclxuICAgIGlmKGhhc0RhdGFBdHRyaWJ1dGUoZWxlbWVudCkpIHtcclxuICAgICAgZGF0YUVsZW1lbnRzLnB1c2goZWxlbWVudCk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBkYXRhRWxlbWVudHM7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBGcmFnbWVudHMgKG5hbWUpIHtcclxuICBpZighYWxsRGF0YUVsZW1lbnRzKSB7XHJcbiAgICBjYWNoZURhdGFFbGVtZW50cygpO1xyXG4gIH1cclxuICByZXR1cm4gYWxsRGF0YUVsZW1lbnRzLnJlZHVjZShmdW5jdGlvbihyZXN1bHQsIGVsZW1lbnQpIHtcclxuICAgIGlmKGVsZW1lbnQuaGFzQXR0cmlidXRlKCdkYXRhLScgKyBuYW1lKSkge1xyXG4gICAgICByZXN1bHQucHVzaChlbGVtZW50KTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfSwgW10pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gRnJhZ21lbnQgKG5hbWUpIHtcclxuICByZXR1cm4gRnJhZ21lbnRzKG5hbWUpWzBdO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY2FjaGVEYXRhRWxlbWVudHMoKSB7XHJcbiAgYWxsRGF0YUVsZW1lbnRzID0gZmluZERhdGFFbGVtZW50cygpO1xyXG59XHJcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBzaGF1bndlc3Qgb24gNC8yOC8xNS5cbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoaW5qZWN0ZWQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHRhcmdldCkge1xuICAgIGluamVjdGVkID0gKHRhcmdldC5faW5qZWN0ZWQpID9cbiAgICAgIGluamVjdGVkLmNvbmNhdCh0YXJnZXQuX2luamVjdGVkKSA6XG4gICAgICBpbmplY3RlZDtcblxuICAgIGlmKHRhcmdldC5fdGFyZ2V0KSB7XG4gICAgICB0YXJnZXQgPSB0YXJnZXQuX3RhcmdldDtcbiAgICB9XG5cbiAgICB2YXIgbmV3VGFyZ2V0ID0gdGFyZ2V0LmJpbmQuYXBwbHkodGFyZ2V0LCBbbnVsbF0uY29uY2F0KGluamVjdGVkKSk7XG4gICAgbmV3VGFyZ2V0Ll90YXJnZXQgPSB0YXJnZXQ7XG4gICAgbmV3VGFyZ2V0Ll9pbmplY3RlZCA9IGluamVjdGVkO1xuICAgIHJldHVybiBuZXdUYXJnZXQ7XG4gIH07XG59XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgU2hhdW4gb24gNS8zLzE0LlxuICovXG52YXIgcHJvbWlzZXMgPSBbXSxcbiAgYmFzZVVybCA9ICcnO1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKG9iaikge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbn1cblxuZnVuY3Rpb24gcGFyc2VSZXNwb25zZSAoY29udGVudFR5cGUsIHJlc3BvbnNlVGV4dCkge1xuICBpZihjb250ZW50VHlwZS5zdWJzdHIoMCwgMTYpID09ICdhcHBsaWNhdGlvbi9qc29uJykge1xuICAgIHJldHVybiBKU09OLnBhcnNlKHJlc3BvbnNlVGV4dCk7XG4gIH1cbiAgcmV0dXJuIHJlc3BvbnNlVGV4dDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlcXVlc3RHZXQodXJsLCBjb250ZW50VHlwZU9yT25Qcm9ncmVzcywgb25Qcm9ncmVzcykge1xuICB2YXIgcHJvbWlzZTtcblxuICBpZih1cmwuc3Vic3RyKDAsIDcpICE9PSAnaHR0cDovLycgJiYgdXJsLnN1YnN0cigwLCA4KSAhPT0gJ2h0dHBzOi8vJykge1xuICAgIHVybCA9IGJhc2VVcmwgKyB1cmw7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRIYW5kbGVyKHJlc29sdmUsIHJlamVjdCkge1xuICAgIHZhciByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgIGlmIChpc0Z1bmN0aW9uKGNvbnRlbnRUeXBlT3JPblByb2dyZXNzKSkge1xuICAgICAgb25Qcm9ncmVzcyA9IGNvbnRlbnRUeXBlT3JPblByb2dyZXNzO1xuICAgICAgY29udGVudFR5cGVPck9uUHJvZ3Jlc3MgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgaWYgKG9uUHJvZ3Jlc3MpIHtcbiAgICAgIHJlcS5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBvblByb2dyZXNzKGV2ZW50LmxvYWRlZCwgZXZlbnQudG90YWwpO1xuICAgICAgfSwgZmFsc2UpO1xuICAgIH1cblxuICAgIHJlcS5vbmVycm9yID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICByZWplY3QoJ05ldHdvcmsgZXJyb3IuJyk7XG4gICAgfTtcblxuICAgIHJlcS5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgY29udGVudFR5cGUgPSBjb250ZW50VHlwZU9yT25Qcm9ncmVzcyB8fCB0aGlzLmdldFJlc3BvbnNlSGVhZGVyKCdjb250ZW50LXR5cGUnKSB8fCAnJztcbiAgICAgICh0aGlzLnN0YXR1cyA+PSAzMDApID9cbiAgICAgICAgcmVqZWN0KHtzdGF0dXNUZXh0OiB0aGlzLnN0YXR1c1RleHQsIHN0YXR1czogdGhpcy5zdGF0dXN9KSA6XG4gICAgICAgIHJlc29sdmUoe2RhdGE6IHBhcnNlUmVzcG9uc2UoY29udGVudFR5cGUsIHRoaXMucmVzcG9uc2VUZXh0KSwgc3RhdHVzOiB0aGlzLnN0YXR1c30pO1xuICAgIH07XG5cbiAgICByZXEub3BlbignZ2V0JywgdXJsLCB0cnVlKTtcbiAgICByZXEuc2VuZCgpO1xuICB9XG5cbiAgcHJvbWlzZSA9IG5ldyBQcm9taXNlKGdldEhhbmRsZXIpO1xuICBwcm9taXNlcy5wdXNoKHByb21pc2UpO1xuXG4gIHJldHVybiBwcm9taXNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHVyZ2UoKSB7XG4gIHByb21pc2VzLmxlbmd0aCA9IDA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQcm9taXNlcygpIHtcbiAgcmV0dXJuIHByb21pc2VzO1xufVxuXG5mdW5jdGlvbiBzZXRCYXNlVXJsKHVybCkge1xuICBiYXNlVXJsID0gdXJsO1xufVxuXG5leHBvcnQgZGVmYXVsdCB7XG4gIHJlcXVlc3RHZXQ6IHJlcXVlc3RHZXQsXG4gIHB1cmdlOiBwdXJnZSxcbiAgc2V0QmFzZVVybDogc2V0QmFzZVVybCxcbiAgZ2V0UHJvbWlzZXM6IGdldFByb21pc2VzXG59O1xuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgU2hhdW4gb24gMi8yOC8xNVxyXG4gKiBcclxuICovXHJcblxyXG5pbXBvcnQge2ludGVyc2VjdHN9IGZyb20gJy4uL2NvbW1vbi5qcyc7XHJcblxyXG5jb25zdCBDT0xMSURFUl9TVFJPS0UgPSAnI2ZmMDBmZic7XHJcbmNvbnN0IEVOVElUWV9TVFJPS0UgPSAnIzUwZmY2OCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb2xsaXNpb25SZW5kZXJlciAge1xyXG4gIGNvbnN0cnVjdG9yIChjYW52YXMpIHtcclxuICAgIHRoaXMuY29sbGlkZXJzID0gW107XHJcbiAgICB0aGlzLmVudGl0aWVzID0gW107XHJcbiAgICB0aGlzLmNhbnZhcyA9IGNhbnZhcztcclxuICAgIHRoaXMuY29udGV4dDJkID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgfVxyXG5cclxuICAvLyBGSVhNRTogY2hhbmdlIGl0IHRvIGFkZEVudGl0eSBvciBzb21ldGhpbmdcclxuICBzZXRFbnRpdGllcyAodmFsdWUpIHtcclxuICAgIHRoaXMuZW50aXRpZXMgPSB2YWx1ZTtcclxuICB9XHJcblxyXG4gIHNldENvbGxpZGVycyAodmFsdWUpIHtcclxuICAgIHRoaXMuY29sbGlkZXJzID0gdmFsdWU7XHJcbiAgfVxyXG5cclxuICBkcmF3ICh2aWV3cG9ydCkge1xyXG4gICAgdmFyIGNvbnRleHQyZCA9IHRoaXMuY29udGV4dDJkO1xyXG5cclxuICAgIHRoaXMuY29udGV4dDJkLmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcclxuICAgIHRoaXMuY29udGV4dDJkLnN0cm9rZVN0eWxlID0gQ09MTElERVJfU1RST0tFO1xyXG5cclxuICAgIHRoaXMuY29sbGlkZXJzLmZvckVhY2goZnVuY3Rpb24oY29sbGlkZXIpIHtcclxuICAgICAgaWYoIWludGVyc2VjdHMoY29sbGlkZXIsIHZpZXdwb3J0KSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICBjb250ZXh0MmQuc3Ryb2tlUmVjdChcclxuICAgICAgICBjb2xsaWRlci54IC0gdmlld3BvcnQueCxcclxuICAgICAgICBjb2xsaWRlci55IC0gdmlld3BvcnQueSxcclxuICAgICAgICBjb2xsaWRlci53aWR0aCxcclxuICAgICAgICBjb2xsaWRlci5oZWlnaHRcclxuICAgICAgKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnRleHQyZC5zdHJva2VTdHlsZSA9IEVOVElUWV9TVFJPS0U7XHJcbiAgICB0aGlzLmVudGl0aWVzLmZvckVhY2goZnVuY3Rpb24oZW50aXR5KSB7XHJcbiAgICAgIGlmKCFpbnRlcnNlY3RzKGVudGl0eSwgdmlld3BvcnQpKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnRleHQyZC5zdHJva2VSZWN0KFxyXG4gICAgICAgIGVudGl0eS54IC0gdmlld3BvcnQueCxcclxuICAgICAgICBlbnRpdHkueSAtIHZpZXdwb3J0LnksXHJcbiAgICAgICAgZW50aXR5LndpZHRoLFxyXG4gICAgICAgIGVudGl0eS5oZWlnaHRcclxuICAgICAgKTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBnZXRMYXllciAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5jYW52YXM7XHJcbiAgfVxyXG59XHJcbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IFNoYXVuIG9uIDIvNS8xNVxyXG4gKiBcclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEltYWdlUmVuZGVyZXIge1xyXG4gIGNvbnN0cnVjdG9yIChjYW52YXMpIHtcclxuICAgIHRoaXMuY2FudmFzID0gY2FudmFzO1xyXG4gICAgdGhpcy5jb250ZXh0MmQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICB9XHJcblxyXG4gIHNldEltYWdlIChpbWFnZSkge1xyXG4gICAgdGhpcy5pbWFnZSA9IGltYWdlO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBkcmF3ICh2aWV3cG9ydCkge1xyXG4gICAgaWYoIXZpZXdwb3J0KSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmNvbnRleHQyZC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XHJcblxyXG4gICAgaWYodGhpcy5pbWFnZSkge1xyXG4gICAgICB0aGlzLmNvbnRleHQyZC5kcmF3SW1hZ2UoXHJcbiAgICAgICAgdGhpcy5pbWFnZSxcclxuICAgICAgICB2aWV3cG9ydC54LCB2aWV3cG9ydC55LFxyXG4gICAgICAgIHZpZXdwb3J0LndpZHRoLCB2aWV3cG9ydC5oZWlnaHQsXHJcbiAgICAgICAgMCwgMCxcclxuICAgICAgICB2aWV3cG9ydC53aWR0aCwgdmlld3BvcnQuaGVpZ2h0XHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBnZXRMYXllciAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5jYW52YXM7XHJcbiAgfVxyXG59XHJcbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IFNoYXVuIG9uIDIvNS8xNVxyXG4gKiBcclxuICovXHJcblxyXG5pbXBvcnQge2ludGVyc2VjdHN9IGZyb20gJy4uL2NvbW1vbi5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTcHJpdGVSZW5kZXJlciB7XHJcbiAgY29uc3RydWN0b3IoY2FudmFzKSB7XHJcbiAgICB0aGlzLmVudGl0aWVzID0gW107XHJcbiAgICB0aGlzLmNvbnRleHQyZCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgdGhpcy5jYW52YXMgPSBjYW52YXM7XHJcbiAgfVxyXG5cclxuICBhZGRFbnRpdHkgKGVudGl0eSkge1xyXG4gICAgdGhpcy5lbnRpdGllcy5wdXNoKGVudGl0eSk7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIGNsZWFyICgpIHtcclxuICAgIHRoaXMuZW50aXRpZXMubGVuZ3RoID0gMDtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgZHJhdyAodmlld3BvcnQpIHtcclxuICAgIHZhciBlbnRpdHksIGltYWdlO1xyXG5cclxuICAgIHRoaXMuY29udGV4dDJkLmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcclxuXHJcbiAgICBmb3IodmFyIGkgPSAwLCBudW1FbnRpdGllcyA9IHRoaXMuZW50aXRpZXMubGVuZ3RoOyBpIDwgbnVtRW50aXRpZXM7IGkrKykge1xyXG4gICAgICBlbnRpdHkgPSB0aGlzLmVudGl0aWVzW2ldO1xyXG5cclxuICAgICAgaWYoIWVudGl0eS5hbmltYXRpb24pIHtcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYoIWludGVyc2VjdHMoZW50aXR5LCB2aWV3cG9ydCkpIHtcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaW1hZ2UgPSBlbnRpdHkuYW5pbWF0aW9uLmdldEltYWdlKCk7XHJcbiAgICAgIGlmKGltYWdlKSB7XHJcbiAgICAgICAgdGhpcy5jb250ZXh0MmQuZHJhd0ltYWdlKFxyXG4gICAgICAgICAgaW1hZ2UsXHJcbiAgICAgICAgICBlbnRpdHkueCAtIHZpZXdwb3J0LnggfHwgMCxcclxuICAgICAgICAgIGVudGl0eS55IC0gdmlld3BvcnQueSB8fCAwXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgZ2V0TGF5ZXIgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuY2FudmFzO1xyXG4gIH1cclxufVxyXG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBTaGF1biBvbiAzLzEvMTVcclxuICpcclxuICovXHJcblxyXG5pbXBvcnQgVXRpbCBmcm9tICcuLi91dGlsLmpzJztcclxuaW1wb3J0IHtyZXF1ZXN0R2V0fSBmcm9tICcuLi9ramF4LmpzJztcclxuaW1wb3J0IFJlc291cmNlIGZyb20gJy4vcmVzb3VyY2UuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odXJpKSB7XHJcbiAgcmV0dXJuIFJlc291cmNlKHJlcXVlc3RHZXQsIHVyaSlcclxuICAgIC5yZWFkeShmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcclxuICAgIH0pO1xyXG59O1xyXG5cclxuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IFNoYXVuIG9uIDUvMS8xNC5cbiAqL1xuXG52YXIgSU1BR0VfV0FJVF9JTlRFUlZBTCA9IDEwMDtcblxuZnVuY3Rpb24gd2FpdEZvckltYWdlIChpbWFnZSkge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgdmFyIGludGVydmFsSWQgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICAgIGlmKGltYWdlLmNvbXBsZXRlKSB7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZCk7XG4gICAgICAgIHJlc29sdmUoaW1hZ2UpO1xuICAgICAgfVxuICAgIH0sIElNQUdFX1dBSVRfSU5URVJWQUwpO1xuXG4gICAgaW1hZ2Uub25lcnJvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZCk7XG4gICAgICByZWplY3QoKTtcbiAgICB9O1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEltYWdlICh1cmkpIHtcbiAgdmFyIGltYWdlLCBwcm9taXNlO1xuXG4gIGltYWdlID0gbmV3IEltYWdlKCk7XG4gIGltYWdlLnNyYyA9IHVyaTtcblxuICBwcm9taXNlID0gd2FpdEZvckltYWdlKGltYWdlKTtcblxuICByZXR1cm4gcHJvbWlzZTtcbn1cbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IFNoYXVuIG9uIDEvMjUvMTVcclxuICpcclxuICovXHJcblxyXG5pbXBvcnQgUmVzb3VyY2UgZnJvbSAnLi9yZXNvdXJjZS5qcyc7XHJcbmltcG9ydCB7Z2V0SW1hZ2V9IGZyb20gJy4vaW1hZ2UtbG9hZGVyLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uICh1cmkpIHtcclxuICByZXR1cm4gUmVzb3VyY2UoZ2V0SW1hZ2UsIHVyaSk7XHJcbn07XHJcbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IFNoYXVuIG9uIDMvMS8xNVxyXG4gKlxyXG4gKi9cclxuXHJcbnZhciByZXNvdXJjZXMgPSB7fTtcclxuXHJcbi8qZnVuY3Rpb24gcmVnaXN0ZXIgKHJlc291cmNlKSB7XHJcbiAgdmFyIHNvdXJjZSA9IHJlc291cmNlLnNvdXJjZTtcclxuXHJcbiAgaWYoIXJlc291cmNlc1tzb3VyY2VdKSB7XHJcbiAgICByZXNvdXJjZXNbc291cmNlXSA9IFtdO1xyXG4gIH1cclxuXHJcbiAgcmVzb3VyY2VzW3NvdXJjZV0ucHVzaChyZXNvdXJjZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFJlc291cmNlcyAoc291cmNlKSB7XHJcbiAgaWYoIXNvdXJjZSkge1xyXG4gICAgcmV0dXJuIHJlc291cmNlcztcclxuICB9XHJcblxyXG4gIHJldHVybiByZXNvdXJjZXNbc291cmNlXTtcclxufSovXHJcblxyXG5mdW5jdGlvbiByZWdpc3RlciAocmVzb3VyY2UpIHtcclxuICByZXNvdXJjZXNbcmVzb3VyY2Uuc291cmNlXSA9IHJlc291cmNlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRSZXNvdXJjZShzb3VyY2UpIHtcclxuICByZXR1cm4gcmVzb3VyY2VzW3NvdXJjZV07XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICByZWdpc3RlcjogcmVnaXN0ZXIsXHJcbiAgZ2V0UmVzb3VyY2U6IGdldFJlc291cmNlXHJcbn07XHJcbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IFNoYXVuIG9uIDMvMy8xNVxyXG4gKlxyXG4gKi9cclxuXHJcbmltcG9ydCBVdGlsIGZyb20gJy4uL3V0aWwuanMnO1xyXG5pbXBvcnQgUmVzb3VyY2VSZWdpc3RyeSBmcm9tICcuL3Jlc291cmNlLXJlZ2lzdHJ5LmpzJztcclxuaW1wb3J0IHtpc0Z1bGxVcmx9IGZyb20gJy4uL2NvbW1vbi5qcyc7XHJcblxyXG52YXIgcmVzb3VyY2VQb29sID0ge307XHJcblxyXG4vLyBtZXRob2QgbXVzdCBiZSBhc3luY2hyb25vdXNcclxuZnVuY3Rpb24gUmVzb3VyY2UgKG1ldGhvZCwgc291cmNlKSB7XHJcbiAgdmFyIHN1Y2Nlc3NDYWxsYmFja3MgPSBbXSxcclxuICAgIGVycm9yQ2FsbGJhY2tzID0gW10sXHJcbiAgICByZXNvdXJjZSA9IHtcclxuICAgICAgcmVhZHk6IHJlYWR5LFxyXG4gICAgICBmZXRjaDogZmV0Y2gsXHJcbiAgICAgIHByb21pc2U6IG51bGwsXHJcbiAgICAgIHNvdXJjZTogc291cmNlXHJcbiAgICB9O1xyXG5cclxuICBpZighVXRpbC5pc0Z1bmN0aW9uKG1ldGhvZCkpIHtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHJlYWR5IChvblN1Y2Nlc3MsIG9uRXJyb3IpIHtcclxuICAgIGlmKFV0aWwuaXNBcnJheShvblN1Y2Nlc3MpKSB7XHJcbiAgICAgIHN1Y2Nlc3NDYWxsYmFja3MgPSBzdWNjZXNzQ2FsbGJhY2tzLmNvbmNhdChvblN1Y2Nlc3MpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc3VjY2Vzc0NhbGxiYWNrcy5wdXNoKG9uU3VjY2Vzcyk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYoVXRpbC5pc0FycmF5KG9uRXJyb3IpKSB7XHJcbiAgICAgIGVycm9yQ2FsbGJhY2tzID0gZXJyb3JDYWxsYmFja3MuY29uY2F0KG9uRXJyb3IpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZXJyb3JDYWxsYmFja3MucHVzaChvbkVycm9yKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzb3VyY2U7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBvblN1Y2Nlc3MgKHJlc3VsdCwgaW5kZXgpIHtcclxuICAgIHZhciBzdWNjZXNzQ2FsbGJhY2sgPSBzdWNjZXNzQ2FsbGJhY2tzW2luZGV4XTtcclxuICAgIGlmKCFzdWNjZXNzQ2FsbGJhY2spIHtcclxuICAgICAgaWYoaW5kZXggPCBzdWNjZXNzQ2FsbGJhY2tzLmxlbmd0aCkgeyBvbkVycm9yKHJlc3VsdCwgaW5kZXggKyAxKTsgfVxyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIG5ld1Jlc3VsdCA9IHN1Y2Nlc3NDYWxsYmFjayhyZXN1bHQpO1xyXG4gICAgaWYobmV3UmVzdWx0ICYmIG5ld1Jlc3VsdC5yZWFkeSkge1xyXG4gICAgICBuZXdSZXN1bHQucmVhZHkoZnVuY3Rpb24gKHJlc3VsdCkge1xyXG4gICAgICAgIG9uU3VjY2VzcyhyZXN1bHQsIGluZGV4ICsgMSk7XHJcbiAgICAgIH0sIGZ1bmN0aW9uIChyZXN1bHQpIHtcclxuICAgICAgICBvbkVycm9yKHJlc3VsdCwgaW5kZXggKyAxKTtcclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH0gZWxzZSBpZighbmV3UmVzdWx0KSB7XHJcbiAgICAgIG5ld1Jlc3VsdCA9IHJlc3VsdDtcclxuICAgIH1cclxuICAgIG9uU3VjY2VzcyhuZXdSZXN1bHQsIGluZGV4ICsgMSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBvbkVycm9yKHJlc3VsdCwgaW5kZXgpIHtcclxuICAgIHZhciBlcnJvckNhbGxiYWNrID0gZXJyb3JDYWxsYmFja3NbaW5kZXhdO1xyXG4gICAgaWYoIWVycm9yQ2FsbGJhY2spIHtcclxuICAgICAgaWYoaW5kZXggPCBlcnJvckNhbGxiYWNrcy5sZW5ndGgpIHsgb25FcnJvcihyZXN1bHQsIGluZGV4ICsgMSk7IH1cclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHJlc3VsdCA9IGVycm9yQ2FsbGJhY2socmVzdWx0KTtcclxuICAgIGlmKHJlc3VsdCAmJiByZXN1bHQucmVhZHkpIHtcclxuICAgICAgcmVzdWx0LnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIG9uU3VjY2VzcyhyZXN1bHQsIGluZGV4ICsgMSk7XHJcbiAgICAgIH0sIGZ1bmN0aW9uKHJlc3VsdCkge1xyXG4gICAgICAgIG9uRXJyb3IocmVzdWx0LCBpbmRleCArIDEpO1xyXG4gICAgICB9KTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgb25FcnJvcihyZXN1bHQsIGluZGV4ICsgMSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBmZXRjaCAoc291cmNlKSB7XHJcbiAgICB2YXIgcHJvbWlzZTtcclxuXHJcbiAgICBpZihSZXNvdXJjZS5iYXNlVXJpKSB7XHJcbiAgICAgIGlmKCFpc0Z1bGxVcmwoc291cmNlKSkge1xyXG4gICAgICAgIHNvdXJjZSA9IFJlc291cmNlLmJhc2VVcmkgKyAnLycgKyBzb3VyY2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcm9taXNlID0gbWV0aG9kKHNvdXJjZSk7XHJcblxyXG4gICAgaWYoIVV0aWwuaXNPYmplY3QocHJvbWlzZSkgfHwgIXByb21pc2UudGhlbikge1xyXG4gICAgICBVdGlsLmVycm9yKCdQcm92aWRlZCByZXNvdXJjZSBtZXRob2QgZGlkIG5vdCByZXR1cm4gYSB0aGVuYWJsZSBvYmplY3QnKTtcclxuICAgIH1cclxuXHJcbiAgICByZXNvdXJjZS5zb3VyY2UgPSBzb3VyY2U7XHJcbiAgICByZXNvdXJjZS5wcm9taXNlID0gcHJvbWlzZS50aGVuKFxyXG4gICAgICBmdW5jdGlvbihyZXN1bHQpIHtcclxuICAgICAgICBvblN1Y2Nlc3MocmVzdWx0LCAwKTtcclxuICAgICAgfSxcclxuICAgICAgZnVuY3Rpb24ocmVzdWx0KSB7XHJcbiAgICAgICAgb25FcnJvcihyZXN1bHQsIDApO1xyXG4gICAgICB9XHJcbiAgICApO1xyXG5cclxuICAgIHJldHVybiByZXNvdXJjZTtcclxuICB9XHJcblxyXG4gIC8vIFRPRE86IG1ha2UgYmV0dGVyXHJcbiAgaWYoc291cmNlKSB7XHJcbiAgICB2YXIgZnVsbFNvdXJjZSA9IHNvdXJjZTtcclxuICAgIGlmIChSZXNvdXJjZS5iYXNlVXJpKSB7XHJcbiAgICAgIGlmICghaXNGdWxsVXJsKHNvdXJjZSkpIHtcclxuICAgICAgICBmdWxsU291cmNlID0gUmVzb3VyY2UuYmFzZVVyaSArICcvJyArIHNvdXJjZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdmFyIGV4aXN0aW5nUmVzb3VyY2UgPSByZXNvdXJjZVBvb2xbZnVsbFNvdXJjZV07XHJcbiAgICBpZiAoZXhpc3RpbmdSZXNvdXJjZSkge1xyXG4gICAgICByZXR1cm4gZXhpc3RpbmdSZXNvdXJjZS5mZXRjaChzb3VyY2UpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy9SZXNvdXJjZVJlZ2lzdHJ5LnJlZ2lzdGVyKHJlc291cmNlKTtcclxuICByZXNvdXJjZVBvb2xbZnVsbFNvdXJjZV0gPSByZXNvdXJjZTtcclxuICByZXR1cm4gKHNvdXJjZSkgPyByZXNvdXJjZS5mZXRjaChzb3VyY2UpIDogcmVzb3VyY2U7XHJcbn1cclxuXHJcblJlc291cmNlLmJhc2VVcmkgPSAnJztcclxuUmVzb3VyY2UucG9vbCA9IHJlc291cmNlUG9vbDtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFJlc291cmNlO1xyXG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBTaGF1biBvbiAyLzEvMTVcclxuICogQmFzZWQgb24gdGhlIGphY2syZCBDaHJvbm8gb2JqZWN0XHJcbiAqIFxyXG4gKi9cclxuXHJcbmltcG9ydCBVdGlsIGZyb20gJy4vdXRpbC5qcyc7XHJcbmltcG9ydCB7bWVyZ2VPYmplY3R9IGZyb20gJy4vY29tbW9uLmpzJztcclxuXHJcbnZhciBpbnN0YW5jZTtcclxudmFyIE9ORV9TRUNPTkQgPSAxMDAwO1xyXG5cclxuZnVuY3Rpb24gU2NoZWR1bGVyKGNiLCByYXRlKSB7XHJcbiAgaWYoIWluc3RhbmNlKSB7XHJcbiAgICBpbnN0YW5jZSA9IGNyZWF0ZSgpO1xyXG4gIH1cclxuICBpZihjYikge1xyXG4gICAgaW5zdGFuY2Uuc2NoZWR1bGUoY2IsIHJhdGUpO1xyXG4gIH1cclxuICByZXR1cm4gaW5zdGFuY2U7XHJcbn1cclxuXHJcblNjaGVkdWxlci5pbnN0YW5jZSA9IGNyZWF0ZTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZSgpIHtcclxuICByZXR1cm4gbWVyZ2VPYmplY3Qoe1xyXG4gICAgc2NoZWR1bGVkOiBbXSxcclxuICAgIHNjaGVkdWxlOiBzY2hlZHVsZSxcclxuICAgIHVuc2NoZWR1bGU6IHVuc2NoZWR1bGUsXHJcbiAgICBzdGFydDogc3RhcnQsXHJcbiAgICBzdG9wOiBzdG9wLFxyXG4gICAgZnJhbWU6IGZyYW1lLFxyXG4gICAgaWQ6IGlkXHJcbiAgfSkuc3RhcnQoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2NoZWR1bGUoY2IsIHJhdGUpIHtcclxuICBmdW5jdGlvbiBzZXRSYXRlKG5ld1JhdGUpIHtcclxuICAgIHJhdGUgPSBuZXdSYXRlO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gbWFrZUZyYW1lKCkge1xyXG4gICAgdmFyIGNvdW50ID0gMSxcclxuICAgICAgdG90YWxEZWx0YVRpbWUgPSAwO1xyXG5cclxuICAgIHJldHVybiBmdW5jdGlvbihkZWx0YVRpbWUpIHtcclxuICAgICAgdG90YWxEZWx0YVRpbWUgKz0gZGVsdGFUaW1lO1xyXG4gICAgICBpZihjb3VudCAhPT0gcmF0ZSkge1xyXG4gICAgICAgIGNvdW50Kys7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIGNiKHRvdGFsRGVsdGFUaW1lLCBzZXRSYXRlKTtcclxuICAgICAgY291bnQgPSAxO1xyXG4gICAgICB0b3RhbERlbHRhVGltZSA9IDA7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgaWYoIVV0aWwuaXNGdW5jdGlvbihjYikpIHtcclxuICAgIFV0aWwuZXJyb3IoJ1NjaGVkdWxlcjogb25seSBmdW5jdGlvbnMgY2FuIGJlIHNjaGVkdWxlZC4nKTtcclxuICB9XHJcbiAgcmF0ZSA9IHJhdGUgfHwgMTtcclxuXHJcbiAgdGhpcy5zY2hlZHVsZWQucHVzaChtYWtlRnJhbWUoKSk7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpZCgpIHtcclxuICByZXR1cm4gdGhpcy5zY2hlZHVsZWQubGVuZ3RoO1xyXG59XHJcblxyXG5mdW5jdGlvbiB1bnNjaGVkdWxlKGlkKSB7XHJcbiAgdGhpcy5zY2hlZHVsZWQuc3BsaWNlKGlkIC0gMSwgMSk7XHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHN0YXJ0KCkge1xyXG4gIGlmKHRoaXMucnVubmluZykge1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBtZXJnZU9iamVjdCh7XHJcbiAgICBhY3R1YWxGcHM6IDAsXHJcbiAgICB0aWNrczogMCxcclxuICAgIGVsYXBzZWRTZWNvbmRzOiAwLFxyXG4gICAgcnVubmluZzogdHJ1ZSxcclxuICAgIGxhc3RVcGRhdGVUaW1lOiBuZXcgRGF0ZSgpLFxyXG4gICAgb25lU2Vjb25kVGltZXJJZDogd2luZG93LnNldEludGVydmFsKG9uT25lU2Vjb25kLmJpbmQodGhpcyksIE9ORV9TRUNPTkQpXHJcbiAgfSwgdGhpcyk7XHJcblxyXG4gIHJldHVybiB0aGlzLmZyYW1lKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHN0b3AoKSB7XHJcbiAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XHJcbiAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5vbmVTZWNvbmRUaW1lcklkKTtcclxuICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5hbmltYXRpb25GcmFtZUlkKTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNsZWFyKCkge1xyXG4gIHRoaXMuc2NoZWR1bGVkLmxlbmd0aCA9IDA7XHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGZyYW1lKCkge1xyXG4gIGV4ZWN1dGVGcmFtZUNhbGxiYWNrcy5iaW5kKHRoaXMpKGdldERlbHRhVGltZS5iaW5kKHRoaXMpKCkpO1xyXG4gIHRoaXMudGlja3MrKztcclxuXHJcbiAgaWYodGhpcy5ydW5uaW5nKSB7XHJcbiAgICB0aGlzLmFuaW1hdGlvbkZyYW1lSWQgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZyYW1lLmJpbmQodGhpcykpO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG9uT25lU2Vjb25kKCkge1xyXG4gIHRoaXMuYWN0dWFsRnBzID0gdGhpcy50aWNrcztcclxuICB0aGlzLnRpY2tzID0gMDtcclxuICB0aGlzLmVsYXBzZWRTZWNvbmRzKys7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGV4ZWN1dGVGcmFtZUNhbGxiYWNrcyhkZWx0YVRpbWUpIHtcclxuICB2YXIgc2NoZWR1bGVkID0gdGhpcy5zY2hlZHVsZWQ7XHJcblxyXG4gIGZvcih2YXIgaSA9IDAsIG51bVNjaGVkdWxlZCA9IHNjaGVkdWxlZC5sZW5ndGg7IGkgPCBudW1TY2hlZHVsZWQ7IGkrKykge1xyXG4gICAgc2NoZWR1bGVkW2ldKGRlbHRhVGltZSk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXREZWx0YVRpbWUoKSB7XHJcbiAgdmFyIG5vdyA9ICtuZXcgRGF0ZSgpO1xyXG4gIHZhciBkZWx0YVRpbWUgPSAobm93IC0gdGhpcy5sYXN0VXBkYXRlVGltZSkgLyBPTkVfU0VDT05EO1xyXG5cclxuICB0aGlzLmxhc3RVcGRhdGVUaW1lID0gbm93O1xyXG5cclxuICByZXR1cm4gZGVsdGFUaW1lO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBTY2hlZHVsZXI7XHJcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBzaGF1bndlc3Qgb24gNS8xMS8xNS5cbiAqL1xuXG5pbXBvcnQgVXRpbCBmcm9tICcuLi91dGlsLmpzJztcbmltcG9ydCB7aW5jbHVkZUluc3RhbmNlLCByZWdpc3Rlckluc3RhbmNlfSBmcm9tICcuLi9jb250YWluZXIuanMnO1xuXG5leHBvcnQgZnVuY3Rpb24gc2V0UHJvcChwcm9wLCBmdW5jKSB7XG4gIHJldHVybiBmdW5jdGlvbih2YWwsIGNvbnRhaW5lcikge1xuICAgIGNvbnRhaW5lcltwcm9wXSA9IGZ1bmModmFsLCBjb250YWluZXIpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbmNsdWRlUmVzb3VyY2UoaWQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICh2YWwpIHtcbiAgICB2YXIgcmVzb3VyY2UgPSBpbmNsdWRlSW5zdGFuY2UoaWQpO1xuICAgIGlmKHJlc291cmNlKSB7XG4gICAgICByZXNvdXJjZS5mZXRjaCh2YWwpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJSZXNvdXJjZShpZCwgcmVzb3VyY2VGYWN0b3J5LCBzY2hlbWEpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgc2NoZW1hOiBzY2hlbWEsXG4gICAgICBjYjogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICB2YXIgcmVzb3VyY2UgPSByZXNvdXJjZUZhY3RvcnkoKTtcbiAgICAgICAgcmVnaXN0ZXJJbnN0YW5jZShpZCwgcmVzb3VyY2UpO1xuICAgICAgICByZXNvdXJjZS5mZXRjaCh2YWwpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYXR0YWNoUmVzb3VyY2Uoa2V5LCByZXNvdXJjZUZhY3RvcnkpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHZhbCwgY29udGFpbmVyKSB7XG4gICAgY29udGFpbmVyW2tleV0gPSByZXNvdXJjZUZhY3RvcnkodmFsKTtcbiAgICByZXR1cm4gdmFsO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlclZhbHVlKGlkLCBzY2hlbWEpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBzY2hlbWE6IHNjaGVtYSxcbiAgICAgIGNiOiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIHJlZ2lzdGVySW5zdGFuY2UoaWQsIHZhbCk7XG4gICAgICB9XG4gICAgfVxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZWNobygpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHZhbCkge1xuICAgIGNvbnNvbGUubG9nKHZhbCk7XG4gIH1cbn0iLCIvKipcbiAqIENyZWF0ZWQgYnkgc2hhdW53ZXN0IG9uIDUvOS8xNS5cbiAqL1xuXG5pbXBvcnQgVXRpbCBmcm9tICcuLi91dGlsLmpzJztcbmltcG9ydCB7bWVyZ2VPYmplY3R9IGZyb20gJy4uL2NvbW1vbi5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNjaGVtYU1hcHBlciB7XG4gIGNvbnN0cnVjdG9yIChzY2hlbWEpIHtcbiAgICBpZih0eXBlb2Ygc2NoZW1hICE9ICdvYmplY3QnICYmIHR5cGVvZiBzY2hlbWEgIT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhyb3cgJ1NjaGVtYU1hcHBlcjogc2NoZW1hIG11c3QgYmUgYW4gb2JqZWN0IG9yIGZ1bmN0aW9uJztcbiAgICB9XG5cbiAgICB0aGlzLnNjaGVtYSA9IHNjaGVtYTtcbiAgfVxuXG4gIG1hcCAoZGF0YSkge1xuICAgIHJldHVybiBtYXBWYWx1ZShkYXRhLCB0aGlzLnNjaGVtYSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gbWFwQnlUeXBlKGRhdGEsIHNjaGVtYSkge1xuICBzd2l0Y2godHlwZW9mIGRhdGEpIHtcbiAgICBjYXNlICdvYmplY3QnOlxuICAgICAgcmV0dXJuIGl0ZXJhdGVLZXlzKGRhdGEsIHNjaGVtYSk7XG4gICAgY2FzZSAnYXJyYXknOlxuICAgICAgcmV0dXJuIGl0ZXJhdGVBcnJheShkYXRhLCBzY2hlbWEpO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZGF0YTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjbG9uZSh2YWwpIHtcbiAgaWYoVXRpbC5pc09iamVjdCh2YWwpKSB7XG4gICAgcmV0dXJuIG1lcmdlT2JqZWN0KHZhbCk7XG4gIH1cblxuICBpZihVdGlsLmlzQXJyYXkodmFsKSkge1xuICAgIHJldHVybiB2YWwuc2xpY2UoMCk7XG4gIH1cblxuICByZXR1cm4gdmFsO1xufVxuXG5mdW5jdGlvbiBtYXBWYWx1ZShkYXRhLCBzY2hlbWFPckZ1bmMsIGNvbnRhaW5lcikge1xuICB2YXIgbWFwcGVkRGF0YSwgcmVzdWx0O1xuXG4gIGlmKCFzY2hlbWFPckZ1bmMpIHtcbiAgICByZXR1cm4gY2xvbmUoZGF0YSk7XG4gIH1cblxuICBpZih0eXBlb2Ygc2NoZW1hT3JGdW5jID09ICdmdW5jdGlvbicpIHtcbiAgICBtYXBwZWREYXRhID0gY2xvbmUoZGF0YSk7XG4gICAgcmVzdWx0ID0gc2NoZW1hT3JGdW5jKG1hcHBlZERhdGEsIGNvbnRhaW5lcik7XG4gICAgaWYodHlwZW9mIHJlc3VsdCA9PSAnb2JqZWN0JyAmJiByZXN1bHQuY2IpIHtcbiAgICAgIG1hcHBlZERhdGEgPSBtYXBWYWx1ZShkYXRhLCByZXN1bHQuc2NoZW1hLCBjb250YWluZXIpO1xuICAgICAgcmVzdWx0LmNiKG1hcHBlZERhdGEpO1xuICAgIH1cbiAgICByZXR1cm4gbWFwcGVkRGF0YTtcbiAgfVxuXG4gIHJldHVybiBtYXBCeVR5cGUoZGF0YSwgc2NoZW1hT3JGdW5jKTtcbn1cblxuZnVuY3Rpb24gaXRlcmF0ZUtleXMgKG9iaiwgc2NoZW1hKSB7XG4gIHJldHVybiBPYmplY3RcbiAgICAua2V5cyhvYmopXG4gICAgLnJlZHVjZShmdW5jdGlvbihuZXdPYmosIGtleSkge1xuICAgICAgbmV3T2JqW2tleV0gPSBtYXBWYWx1ZShcbiAgICAgICAgb2JqW2tleV0sXG4gICAgICAgIHNjaGVtYS5oYXNPd25Qcm9wZXJ0eSgnKicpID9cbiAgICAgICAgICBzY2hlbWFbJyonXSA6XG4gICAgICAgICAgc2NoZW1hW2tleV0sXG4gICAgICAgIG5ld09ialxuICAgICAgKTtcbiAgICAgIHJldHVybiBuZXdPYmo7XG4gICAgfSwge30pO1xufVxuXG5mdW5jdGlvbiBpdGVyYXRlQXJyYXkgKGFyciwgc2NoZW1hKSB7XG4gIHJldHVybiBhcnJcbiAgICAucmVkdWNlKGZ1bmN0aW9uKG5ld0FyciwgdmFsLCBpbmRleCkge1xuICAgICAgbmV3QXJyLnB1c2gobWFwVmFsdWUoXG4gICAgICAgIGFycltpbmRleF0sXG4gICAgICAgIHNjaGVtYVswXSxcbiAgICAgICAgbmV3QXJyXG4gICAgICApKTtcbiAgICAgIHJldHVybiBuZXdBcnI7XG4gICAgfSwgW10pO1xufVxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgU2hhdW4gb24gNC8yMy8yMDE1LlxyXG4gKi9cclxuXHJcbnZhciB0eXBlcyA9IFsnQXJyYXknLCAnT2JqZWN0JywgJ0Jvb2xlYW4nLCAnQXJndW1lbnRzJywgJ0Z1bmN0aW9uJywgJ1N0cmluZycsICdOdW1iZXInLCAnRGF0ZScsICdSZWdFeHAnXTtcclxuXHJcbnZhciBVdGlsID0ge1xyXG4gIGlzRGVmaW5lZDogZnVuY3Rpb24gKHZhbHVlKSB7IHJldHVybiB0eXBlb2YgdmFsdWUgIT0gJ3VuZGVmaW5lZCcgfSxcclxuICBkZWY6IGZ1bmN0aW9uICh2YWx1ZSwgZGVmYXVsdFZhbHVlKSB7IHJldHVybiAodHlwZW9mIHZhbHVlID09ICd1bmRlZmluZWQnKSA/IGRlZmF1bHRWYWx1ZSA6IHZhbHVlIH0sXHJcbiAgZXJyb3I6IGZ1bmN0aW9uIChtZXNzYWdlKSB7IHRocm93IG5ldyBFcnJvcihpZCArICc6ICcgKyBtZXNzYWdlKSB9LFxyXG4gIHdhcm46IGZ1bmN0aW9uIChtZXNzYWdlKSB7IFV0aWwubG9nKCdXYXJuaW5nOiAnICsgbWVzc2FnZSkgfSxcclxuICBsb2c6IGZ1bmN0aW9uIChtZXNzYWdlKSB7IGlmKGNvbmZpZy5sb2cpIHsgY29uc29sZS5sb2coaWQgKyAnOiAnICsgbWVzc2FnZSkgfSB9LFxyXG4gIGFyZ3NUb0FycmF5OiBmdW5jdGlvbiAoYXJncykgeyByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJncykgfSxcclxuICByYW5kOiBmdW5jdGlvbiAobWF4LCBtaW4pIHsgLy8gbW92ZSB0byBleHRyYT9cclxuICAgIG1pbiA9IG1pbiB8fCAwO1xyXG4gICAgaWYobWluID4gbWF4KSB7IFV0aWwuZXJyb3IoJ3JhbmQ6IGludmFsaWQgcmFuZ2UuJyk7IH1cclxuICAgIHJldHVybiBNYXRoLmZsb29yKChNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKSkgKyAobWluKTtcclxuICB9XHJcbn07XHJcblxyXG5mb3IodmFyIGkgPSAwOyBpIDwgdHlwZXMubGVuZ3RoOyBpKyspIHtcclxuICBVdGlsWydpcycgKyB0eXBlc1tpXV0gPSAoZnVuY3Rpb24odHlwZSkge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaikge1xyXG4gICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT0gJ1tvYmplY3QgJyArIHR5cGUgKyAnXSc7XHJcbiAgICB9O1xyXG4gIH0pKHR5cGVzW2ldKTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgVXRpbDsiLCIvKipcbiAqIENyZWF0ZWQgYnkgc2hhdW53ZXN0IG9uIDUvNC8xNS5cbiAqL1xuXG5pbXBvcnQgZnJhZ21lbnQgZnJvbSAnLi4vZW5naW5lL2RlY29yYXRvcnMvZnJhZ21lbnQuanMnXG5pbXBvcnQgYXN5bmMgZnJvbSAnLi4vZW5naW5lL2RlY29yYXRvcnMvYXN5bmMuanMnXG5pbXBvcnQgU2NoZWR1bGVyIGZyb20gJy4uL2VuZ2luZS9zY2hlZHVsZXIuanMnXG5pbXBvcnQgSW1hZ2VSZW5kZXJlciBmcm9tICcuLi9lbmdpbmUvcmVuZGVyZXIvaW1hZ2UtcmVuZGVyZXIuanMnXG5pbXBvcnQgdmlld3BvcnQgZnJvbSAnLi4vdmlld3BvcnQuanMnXG5pbXBvcnQgSW1hZ2VSZXNvdXJjZSBmcm9tICcuLi9lbmdpbmUvcmVzb3VyY2VzL2ltYWdlLXJlc291cmNlLmpzJ1xuXG5AZnJhZ21lbnQoJ2NhbnZhcy1iYWNrZ3JvdW5kJylcbi8vQGNyZWF0ZSgnYmFja2dyb3VuZEltYWdlJywgSW1hZ2VSZXNvdXJjZSkgLy8gbWF5YmUgc2hvdWxkIGJlIGNyZWF0ZWQgZWxzZXdoZXJlLi4uXG5AYXN5bmMoJ2JhY2tncm91bmRJbWFnZScpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCYWNrZ3JvdW5kTGF5ZXIge1xuICBjb25zdHJ1Y3RvciAoY2FudmFzLCBiYWNrZ3JvdW5kSW1hZ2VQcm9taXNlKSB7XG4gICAgdmFyIHJlbmRlcmVyID0gbmV3IEltYWdlUmVuZGVyZXIoY2FudmFzKTtcblxuICAgIFNjaGVkdWxlcihmdW5jdGlvbiAoKSB7XG4gICAgICByZW5kZXJlci5kcmF3KHZpZXdwb3J0KTtcbiAgICB9KTtcblxuICAgIGJhY2tncm91bmRJbWFnZVByb21pc2UudGhlbihmdW5jdGlvbihiYWNrZ3JvdW5kSW1hZ2VSZXNvdXJjZSkge1xuICAgICAgYmFja2dyb3VuZEltYWdlUmVzb3VyY2UucmVhZHkoZnVuY3Rpb24oYmFja2dyb3VuZEltYWdlKSB7XG4gICAgICAgIHJlbmRlcmVyLnNldEltYWdlKGJhY2tncm91bmRJbWFnZSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxufSIsIi8qKlxuICogQ3JlYXRlZCBieSBzaGF1bndlc3Qgb24gNS80LzE1LlxuICovXG5cbmltcG9ydCBmcmFnbWVudCBmcm9tICcuLi9lbmdpbmUvZGVjb3JhdG9ycy9mcmFnbWVudC5qcyc7XG5pbXBvcnQgYXN5bmMgZnJvbSAnLi4vZW5naW5lL2RlY29yYXRvcnMvYXN5bmMuanMnO1xuaW1wb3J0IFNjaGVkdWxlciBmcm9tICcuLi9lbmdpbmUvc2NoZWR1bGVyLmpzJztcbmltcG9ydCBDb2xsaXNpb25SZW5kZXJlciBmcm9tICcuLi9lbmdpbmUvcmVuZGVyZXIvY29sbGlzaW9uLXJlbmRlcmVyLmpzJztcbmltcG9ydCB2aWV3cG9ydCBmcm9tICcuLi92aWV3cG9ydC5qcyc7XG5cbkBmcmFnbWVudCgnY2FudmFzLWNvbGxpZGVycycpXG5AYXN5bmMoJ2NvbGxpZGVycycpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb2xsaXNpb25MYXllciB7XG4gIGNvbnN0cnVjdG9yKGNhbnZhcywgY29sbGlkZXJzUHJvbWlzZSkge1xuICAgIHZhciByZW5kZXJlciA9IG5ldyBDb2xsaXNpb25SZW5kZXJlcihjYW52YXMpO1xuXG4gICAgU2NoZWR1bGVyKGZ1bmN0aW9uICgpIHtcbiAgICAgIHJlbmRlcmVyLmRyYXcodmlld3BvcnQpO1xuICAgIH0pO1xuXG4gICAgY29sbGlkZXJzUHJvbWlzZS50aGVuKGZ1bmN0aW9uKGNvbGxpZGVycykge1xuICAgICByZW5kZXJlci5zZXRDb2xsaWRlcnMoY29sbGlkZXJzKTtcbiAgICB9KTtcblxuICAgIHRoaXMucmVuZGVyZXIgPSByZW5kZXJlcjtcbiAgfVxufSIsIi8qKlxuICogQ3JlYXRlZCBieSBzaGF1bndlc3Qgb24gNS80LzE1LlxuICovXG5cbmltcG9ydCBhc3luYyBmcm9tICcuLi9lbmdpbmUvZGVjb3JhdG9ycy9hc3luYy5qcydcbmltcG9ydCBmcmFnbWVudCBmcm9tICcuLi9lbmdpbmUvZGVjb3JhdG9ycy9mcmFnbWVudC5qcydcbmltcG9ydCBTY2hlZHVsZXIgZnJvbSAnLi4vZW5naW5lL3NjaGVkdWxlci5qcydcbmltcG9ydCBTcHJpdGVSZW5kZXJlciBmcm9tICcuLi9lbmdpbmUvcmVuZGVyZXIvc3ByaXRlLXJlbmRlcmVyLmpzJ1xuaW1wb3J0IHZpZXdwb3J0IGZyb20gJy4uL3ZpZXdwb3J0LmpzJ1xuXG5AZnJhZ21lbnQoJ2NhbnZhcy1lbnRpdGllcycpXG5AYXN5bmMoJ3Nwcml0ZXMnKVxuQGFzeW5jKCdzcHJpdGVUeXBlcycpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTcHJpdGVMYXllciB7XG4gIGNvbnN0cnVjdG9yKGNhbnZhcywgc3ByaXRlc1Byb21pc2UsIHNwcml0ZVR5cGVzUHJvbWlzZSkge1xuICAgIHZhciByZW5kZXJlciA9IG5ldyBTcHJpdGVSZW5kZXJlcihjYW52YXMpO1xuXG4gICAgU2NoZWR1bGVyKGZ1bmN0aW9uICgpIHtcbiAgICAgIHJlbmRlcmVyLmRyYXcodmlld3BvcnQpO1xuICAgIH0pO1xuXG4gICAgcmVuZGVyZXIuY2xlYXIoKTtcblxuICAgIC8vIHRoaXMgc3R1ZmYgc2hvdWxkIHByb2JhYmx5IGJlIG1vdmVkIG91dCBvZiBoZXJlXG4gICAgc3ByaXRlc1Byb21pc2UudGhlbihmdW5jdGlvbihzcHJpdGVzKSB7XG4gICAgICBzcHJpdGVzLmZvckVhY2goZnVuY3Rpb24oc3ByaXRlKSB7XG4gICAgICAgIC8vIG5vdCBxdWl0ZSByaWdodC4uLiBlYWNoIGluZGl2aWR1YWwgc3ByaXRlIHNob3VsZCBoYXZlIGl0cyBvd24gYW5pbWF0aW9uIG9iamVjdFxuICAgICAgICBzcHJpdGVUeXBlc1Byb21pc2UudGhlbihmdW5jdGlvbihzcHJpdGVUeXBlcykge1xuICAgICAgICAgIHZhciBzcHJpdGVUeXBlID0gc3ByaXRlVHlwZXNbc3ByaXRlLnNyY0lkXTtcblxuICAgICAgICAgIHNwcml0ZVR5cGUuc3ByaXRlU2hlZXQucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzcHJpdGVUeXBlLmFuaW1hdGlvbi5wbGF5KCdydW4nKTtcbiAgICAgICAgICAgIHJlbmRlcmVyLmFkZEVudGl0eShzcHJpdGVUeXBlKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHRoaXMucmVuZGVyZXIgPSByZW5kZXJlcjtcbiAgfVxufVxuXG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgc2hhdW53ZXN0IG9uIDUvOS8xNS5cbiAqL1xuXG5pbXBvcnQgQmFja2dyb3VuZExheWVyIGZyb20gJy4vbGF5ZXJzL2JhY2tncm91bmQtbGF5ZXIuanMnO1xuaW1wb3J0IENvbGxpc2lvbkxheWVyIGZyb20gJy4vbGF5ZXJzL2NvbGxpc2lvbi1sYXllci5qcyc7XG5pbXBvcnQgU3ByaXRlTGF5ZXIgZnJvbSAnLi9sYXllcnMvc3ByaXRlLWxheWVyLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gU2NlbmUgKCkge1xuICBuZXcgQmFja2dyb3VuZExheWVyKCk7XG4gIG5ldyBDb2xsaXNpb25MYXllcigpO1xuICBuZXcgU3ByaXRlTGF5ZXIoKTtcbn0iLCIvKipcbiAqIENyZWF0ZWQgYnkgc2hhdW53ZXN0IG9uIDUvOS8xNS5cbiAqL1xuXG5pbXBvcnQgU2NoZW1hTWFwcGVyIGZyb20gJy4uL2VuZ2luZS9zY2hlbWEvc2NoZW1hLW1hcHBlci5qcyc7XG5pbXBvcnQgSW1hZ2VSZXNvdXJjZSBmcm9tICcuLi9lbmdpbmUvcmVzb3VyY2VzL2ltYWdlLXJlc291cmNlLmpzJztcbmltcG9ydCBIdHRwUmVzb3VyY2UgZnJvbSAnLi4vZW5naW5lL3Jlc291cmNlcy9odHRwLXJlc291cmNlLmpzJztcbmltcG9ydCB7cmVnaXN0ZXJSZXNvdXJjZSwgcmVnaXN0ZXJWYWx1ZX0gZnJvbSAnLi4vZW5naW5lL3NjaGVtYS9oZWxwZXIuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBTY2VuZVNjaGVtYSgpIHtcbiAgcmV0dXJuIEh0dHBSZXNvdXJjZSgna2l0dHktd29ybGQuanNvbicpXG4gICAgLnJlYWR5KGZ1bmN0aW9uKHNjZW5lRGF0YSkge1xuICAgICAgdmFyIHNjaGVtYSA9IGdldFNjZW5lU2NoZW1hKCk7XG4gICAgICB2YXIgc2NlbmUgPSBzY2hlbWEubWFwKHNjZW5lRGF0YSk7XG4gICAgICBjb25zb2xlLmxvZyhzY2VuZSk7XG4gICAgICAvL1NjZW5lKHNjZW5lKTtcbiAgICB9KTtcbn1cblxuXG5mdW5jdGlvbiBnZXRTY2VuZVNjaGVtYSgpIHtcbiAgcmV0dXJuIG5ldyBTY2hlbWFNYXBwZXIoe1xuICAgIGxheWVyRGVmaW5pdGlvbnM6IHtcbiAgICAgIGJhY2tncm91bmQ6IHtcbiAgICAgICAgYmFja2dyb3VuZFVybDogcmVnaXN0ZXJSZXNvdXJjZSgnYmFja2dyb3VuZEltYWdlJywgSW1hZ2VSZXNvdXJjZSlcbiAgICAgIH0sXG4gICAgICBlbnRpdGllczoge1xuICAgICAgICBzcHJpdGVzOiByZWdpc3RlclZhbHVlKCdzcHJpdGVzJylcbiAgICAgIH0sXG4gICAgICBjb2xsaXNpb25zOiB7XG4gICAgICAgIGNvbGxpZGVyczogcmVnaXN0ZXJWYWx1ZSgnY29sbGlkZXJzJylcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufSIsIi8qKlxuICogQ3JlYXRlZCBieSBzaGF1bndlc3Qgb24gNS85LzE1LlxuICovXG5cbmltcG9ydCBTY2hlbWFNYXBwZXIgZnJvbSAnLi4vZW5naW5lL3NjaGVtYS9zY2hlbWEtbWFwcGVyLmpzJztcbmltcG9ydCBJbWFnZVJlc291cmNlIGZyb20gJy4uL2VuZ2luZS9yZXNvdXJjZXMvaW1hZ2UtcmVzb3VyY2UuanMnO1xuaW1wb3J0IEh0dHBSZXNvdXJjZSBmcm9tICcuLi9lbmdpbmUvcmVzb3VyY2VzL2h0dHAtcmVzb3VyY2UuanMnO1xuaW1wb3J0IGZyYW1lU2V0IGZyb20gJy4uL2FuaW1hdGlvbi9mcmFtZS1zZXQuanMnO1xuaW1wb3J0IHNwcml0ZUFuaW1hdGlvbiBmcm9tICcuLi9hbmltYXRpb24vc3ByaXRlLWFuaW1hdGlvbi5qcyc7XG5pbXBvcnQge2F0dGFjaFJlc291cmNlLCByZWdpc3RlclZhbHVlfSBmcm9tICcuLi9lbmdpbmUvc2NoZW1hL2hlbHBlci5qcyc7XG5cbi8vdmFyIHNwcml0ZVNjaGVtYSA9IFNwcml0ZVNjaGVtYSgpO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBTcHJpdGVTY2hlbWEoKSB7XG4gIHJldHVybiBIdHRwUmVzb3VyY2UoJ2tpdHR5Lmpzb24nKVxuICAgIC5yZWFkeShmdW5jdGlvbihzcHJpdGVEYXRhKSB7XG4gICAgICB2YXIgc3ByaXRlU2NoZW1hID0gZ2V0U3ByaXRlU2NoZW1hKCk7XG4gICAgICB2YXIgc3ByaXRlID0gc3ByaXRlU2NoZW1hLm1hcChzcHJpdGVEYXRhKTtcbiAgICAgIGNvbnNvbGUubG9nKHNwcml0ZSk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUFuaW1hdGlvbih1cmksIGNvbnRhaW5lcikge1xuICBjb250YWluZXJbJ3Nwcml0ZVNoZWV0J10gPSBJbWFnZVJlc291cmNlKHVyaSkucmVhZHkoZnVuY3Rpb24oc3ByaXRlU2hlZXQpIHtcbiAgICBjb250YWluZXJbJ2FuaW1hdGlvbiddID0gc3ByaXRlQW5pbWF0aW9uKGZyYW1lU2V0KGNvbnRhaW5lciwgc3ByaXRlU2hlZXQpKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFNwcml0ZVNjaGVtYSgpIHtcbiAgcmV0dXJuIG5ldyBTY2hlbWFNYXBwZXIocmVnaXN0ZXJWYWx1ZSgnc3ByaXRlVHlwZXMnLCB7XG4gICAgJyonOiB7XG4gICAgICAvL3Nwcml0ZVNoZWV0VXJsOiBhdHRhY2hSZXNvdXJjZSgnc3ByaXRlU2hlZXQnLCBJbWFnZVJlc291cmNlKVxuICAgICAgc3ByaXRlU2hlZXRVcmw6IGNyZWF0ZUFuaW1hdGlvblxuICAgIH1cbiAgfSkpO1xufVxuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IHNoYXVud2VzdCBvbiA1LzQvMTUuXG4gKi9cblxuZXhwb3J0IGRlZmF1bHQge1xuICB4OiAwLFxuICB5OiAwLFxuICB3aWR0aDogNjAwLFxuICBoZWlnaHQ6IDQwMFxufTsiXX0=

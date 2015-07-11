(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

/**
 * Created by Shaun on 4/23/2015.
 */

var _Fragment = require('./engine/fragments.js');

var _getSceneSchema = require('./schema/scene-schema.js');

var _getSceneSchema2 = _interopRequireWildcard(_getSceneSchema);

var _Frame = require('./engine/frame.js');

var _Frame2 = _interopRequireWildcard(_Frame);

var _Input = require('./engine/input.js');

var _Input2 = _interopRequireWildcard(_Input);

var _Viewport = require('./viewport.js');

var _Viewport2 = _interopRequireWildcard(_Viewport);

var _clearContext = require('./canvas-renderer.js');

var _sequence = require('./func.js');

var scene = _getSceneSchema2['default']('assets/kitty-world.json');

function getPositionFromMaxMargin(spritePos, spriteSize, maxMargin) {
  return spritePos + spriteSize - maxMargin;
}

function getPositionFromMinMargin(spritePos, minMargin) {
  return spritePos - minMargin;
}

function applyFriction(velocity, friction, elapsed) {
  return velocity * Math.pow(1 - friction, elapsed);
}

function halt(velocity, haltTarget) {
  return Math.abs(velocity) < haltTarget ? 0 : velocity;
}

function clampVelocity(velocity, maxVelocity) {
  return velocity > 0 ? Math.min(velocity, maxVelocity) : Math.max(velocity, -maxVelocity);
}

function applyAcceleration(velocity, acceleration, elapsed) {
  return velocity + acceleration * elapsed;
}

function getPositionDelta(val, velocity, elapsed) {
  return val + Math.round(velocity * elapsed);
}

function getVelocityX(sprite, elapsed) {
  var velX0 = halt(sprite.velocityX, 1);
  var velX1 = applyAcceleration(velX0, sprite.accelerationX, elapsed);
  var velX2 = applyFriction(velX1, sprite.frictionX, elapsed);
  return clampVelocity(velX2, sprite.maxVelocityX);
}

function getVelocityY(sprite, elapsed) {
  var velY0 = halt(sprite.velocityY, 1);
  var velY1 = applyAcceleration(velY0, sprite.accelerationY, elapsed);
  var velY2 = applyFriction(velY1, sprite.frictionY, elapsed);
  return clampVelocity(velY2, sprite.maxVelocityY);
}

function getInnerDiff(val, size, minBound, maxBound) {
  var max = val + size;
  return val < minBound && val - minBound || max > maxBound && max - maxBound || 0;
}

function getOuterDiff(val, size, minBound, maxBound) {
  var max = val + size;
  return val < minBound && max > minBound && max - minBound || val < maxBound && max > maxBound && val - maxBound || 0;
}

function resolveCollision(diff, val) {
  return val - diff;
}

/*function getCollisionResolve(colliders, sprite) {
  return colliders
    .reduce(function (resolve, collider) {
      const diffX = (sprite.y >= collider.y && sprite.y <= collider.y + collider.height) ?
        getOuterDiff(
          sprite.x,
          sprite.width,
          collider.x,
          collider.x + collider.width
        ) : 0;

      resolve.x = (diffX) ? resolveCollision(diffX, sprite.x) : resolve.x;

      const diffY = (sprite.x >= collider.x && sprite.x <= collider.x + collider.width) ?
        getOuterDiff(
          sprite.y,
          sprite.height,
          collider.y,
          collider.y + collider.height
        ) : 0;

      resolve.y = (diffY) ? resolveCollision(diffY, sprite.y) : resolve.y;

      return resolve;
    }, {x: sprite.x, y: sprite.y});
}*/

function getCollisionResolve(colliders, position, range, size) {
  return colliders.filter(function (collider) {
    return range >= collider.rangeMin && range <= collider.rangeMax;
  }).reduce(function (positionDelta, collider) {
    var diff = getOuterDiff(position, size, collider.positionMin, collider.positionMax);

    return diff ? position - diff : positionDelta;
  }, position);
}

/*function getCollisionResolveY() {
   return colliders
    .reduce(function (resolve, collider) {
      const diffX = (sprite.y >= collider.y && sprite.y <= collider.y + collider.height) ?
        getOuterDiff(
          sprite.x,
          sprite.width,
          collider.x,
          collider.x + collider.width
        ) : 0;

      resolve.x = (diffX) ? resolveCollision(diffX, sprite.x) : resolve.x;

      const diffY = (sprite.x >= collider.x && sprite.x <= collider.x + collider.width) ?
        getOuterDiff(
          sprite.y,
          sprite.height,
          collider.y,
          collider.y + collider.height
        ) : 0;

      resolve.y = (diffY) ? resolveCollision(diffY, sprite.y) : resolve.y;

      return resolve;
    }, {x: sprite.x, y: sprite.y});
}*/

function applyAnimation(sprite) {
  var sequence = sprite.type.frameSet[getAnimation(sprite)];
  var frameIndex = getFrameIndex(sprite.animation.currentIndex, sequence);
  sprite.animation.currentIndex = frameIndex;

  return getFrame(frameIndex, sequence);
}

function getFrameIndex(currentIndex, sequence) {
  var index = currentIndex || 0;
  return index < sequence.frames.length - 1 ? index + 1 : 0;
}

function getAnimation(sprite) {
  return 'run';
}

function getFrame(index, sequence) {
  return sequence.frames[index];
}

function render(context2d, point, image, viewport) {
  if (!image) {
    return;
  }
  context2d.drawImage(image, point.x - viewport.x || 0, point.y - viewport.y || 0);
}

var getInputs = _Input2['default']();
var getFrames = _Frame2['default']();
var viewport = _Viewport2['default'];
var fpsUI = _Fragment.Fragment('fps');

getFrames(function (elapsed, fps) {
  fpsUI.textContent = fps;
  return true;
});

scene.then(function (scene) {
  var sceneBounds = Object.freeze({
    width: scene.sceneWidth,
    height: scene.sceneHeight
  });

  var canvas = _Fragment.Fragment('canvas-entities');
  var context2d = canvas.getContext('2d');
  var colliders = Object.freeze(scene.colliders);

  var collidersX = colliders.map(function (collider) {
    return {
      positionMin: collider.x,
      positionMax: collider.x + collider.width,
      rangeMin: collider.y,
      rangeMax: collider.y + collider.height
    };
  });

  var collidersY = colliders.map(function (collider) {
    return {
      positionMin: collider.y,
      positionMax: collider.y + collider.height,
      rangeMin: collider.x,
      rangeMax: collider.x + collider.width
    };
  });

  var sprites = Object.freeze(scene.sprites);
  var player = sprites[0];

  getFrames(function (elapsed) {
    _clearContext.clearContext(context2d, canvas.width, canvas.height);

    var inputs = getInputs();

    if (inputs[37]) {
      player.velocityX = -100;
    } else if (inputs[39]) {
      player.velocityX = 100;
    }

    sprites.forEach(function (sprite) {
      var velocityX = getVelocityX(sprite, elapsed);
      var x = getPositionDelta(sprite.x, velocityX, elapsed);
      var boundsDiffX = getInnerDiff(x, sprite.width, 0, sceneBounds.width);
      var x2 = resolveCollision(boundsDiffX, x);

      sprite.velocityX = velocityX;
      sprite.x = x2;

      sprite.velocityY = getVelocityY(sprite, elapsed);
      sprite.y = getPositionDelta(sprite.y, sprite.velocityY, elapsed);
      var diffY = getInnerDiff(sprite.y, sprite.height, 0, sceneBounds.height);
      sprite.y = resolveCollision(diffY, sprite.y);

      //const resolve = getCollisionResolve(colliders, sprite);
      var resolveX = getCollisionResolve(collidersX, sprite.x, sprite.y, sprite.width);
      sprite.x = resolveX;

      var resolveY = getCollisionResolve(collidersY, sprite.y, sprite.x, sprite.height);
      sprite.y = resolveY;

      if (sprite === player) {
        var minMargin = viewport.marginLeft;
        var maxMargin = viewport.width - viewport.marginRight;
        var viewportDiffX = getInnerDiff(sprite.x, sprite.width, viewport.x + minMargin, viewport.x + maxMargin);

        if (viewportDiffX > 0 && sprite.velocityX > 0) {
          viewport.x = getPositionFromMaxMargin(sprite.x, sprite.width, maxMargin);
        } else if (viewportDiffX < 0 && sprite.velocityX < 0) {
          viewport.x = getPositionFromMinMargin(sprite.x, minMargin);
        }
      }

      var frame = applyAnimation(sprite);
      var pos = { x: sprite.x, y: sprite.y };

      render(context2d, pos, frame, viewport);
    });

    return true;
  });

  return scene;
}).then(function (scene) {
  var backgroundImage = scene.backgroundImage;

  var canvas = _Fragment.Fragment('canvas-background');
  var context2d = canvas.getContext('2d');

  getFrames(function () {
    _clearContext.clearContext(context2d, canvas.width, canvas.height);
    render(context2d, { x: 0, y: 0 }, backgroundImage, viewport);
    return true;
  });
  return scene;
});

},{"./canvas-renderer.js":4,"./engine/fragments.js":6,"./engine/frame.js":7,"./engine/input.js":9,"./func.js":14,"./schema/scene-schema.js":15,"./viewport.js":17}],2:[function(require,module,exports){
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
  return Object.keys(spriteDefinition.animations).reduce(function (frameSet, frameSetId) {
    var frameSequence = buildFrameSequence(spriteDefinition.animations[frameSetId], spriteDefinition.frameSize, spriteSheet);

    frameSequence.frames = frameSequence.frames.map(function (frame) {
      return _getCanvas$getTransparentImage.getTransparentImage(spriteDefinition.transparentColor, frame);
    });

    frameSet[frameSetId] = frameSequence;

    return frameSet;
  }, {});
};

;
module.exports = exports['default'];

},{"../engine/common.js":5}],3:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _Scheduler = require('../engine/scheduler.js');

var _Scheduler2 = _interopRequireWildcard(_Scheduler);

exports['default'] = function (frameSet) {
  var currentFrameSequence = frameSet.run,
      //null,
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
    },
    getNext: function getNext() {
      currentFrame = currentFrameSequence.frames[currentFrameIndex];
      if (++currentFrameIndex >= currentFrameSequence.frames.length) {
        currentFrameIndex = 0;
      }
      return currentFrame;
    }
  };
};

module.exports = exports['default'];

},{"../engine/scheduler.js":10}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Created by shaunwest on 6/29/15.
 */

exports.clearContext = clearContext;

function clearContext(context2d, width, height) {
  context2d.clearRect(0, 0, width, height);
}

},{}],5:[function(require,module,exports){
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

},{"./util.js":12}],6:[function(require,module,exports){
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
  return allDataElements.filter(function (element) {
    if (element.hasAttribute('data-' + name)) {
      return element;
    }
  });
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
exports["default"] = Frame;
/**
 * Created by shaunwest on 6/20/15.
 */

var MS_PER_SECOND = 1000;

function getDeltaTime(now, lastUpdateTime) {
  return (now - lastUpdateTime) / MS_PER_SECOND;
}

// STATEFUL
function FrameLoop(start) {
  var cbs = [],
      last = start,
      fps = 0,
      frameCount = 0;
  var intervalId = setInterval(function () {
    fps = frameCount;
    frameCount = 0;
  }, MS_PER_SECOND);

  (function loop() {
    frameCount++;

    cbs = cbs.map(function (cb) {
      return cb(fps, last) && cb;
    }).filter(function (cb) {
      return cb;
    });

    last = +new Date();
    requestAnimationFrame(loop);
  })();

  return function (cb) {
    cbs.push(cb);
  };
}

function Frame() {
  var frameLoop = FrameLoop(+new Date());

  return function (cb) {
    frameLoop(function (fps, lastUpdateTime) {
      var elapsed = getDeltaTime(+new Date(), lastUpdateTime);
      return cb(elapsed, fps);
    });
  };
}

module.exports = exports["default"];

},{}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = getImage;
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

module.exports = exports["default"];

},{}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
/**
 * Created by shaunwest on 6/28/15.
 */

exports['default'] = Input;

function Input() {
  var keys = {};

  window.addEventListener('keydown', function (event) {
    keys[event.keyCode] = true;
  });
  window.addEventListener('keyup', function (event) {
    keys[event.keyCode] = false;
  });

  return function () {
    return keys;
  };
}

module.exports = exports['default'];

},{}],10:[function(require,module,exports){
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

// get rid of instance stuff. Just use the di container's registerSingleton/use
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

},{"./common.js":5,"./util.js":12}],11:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = fetchJSON;
/**
 * Created by shaunwest on 6/11/15.
 */

var _Valve = require('../valve.js');

var _Valve2 = _interopRequireWildcard(_Valve);

function fetchJSON(uri) {
  //return Valve.create(fetch(uri).then(response => response.json()));
  return fetch(uri).then(function (response) {
    return response.json();
  });
}

module.exports = exports['default'];

},{"../valve.js":13}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, '__esModule', {
  value: true
});
/**
 * Created by shaunwest on 6/20/15.
 *
 * TODO: dispose()
 */

/**
 *
var valve = Valve.create(function (emit, error) {
  setInterval(function () {
    error('hello');
  }, 500);
}).then(function (msg) {
  return msg + ' Shaun';
}).then(function (newMsg) {
  return new Promise(function (resolve) {
    setInterval(function () {
      resolve(newMsg + '!!!!');
    }, 500);
  });
}).then(
  function (newerMsg) {
    console.log(newerMsg);
  }, function (msg) {
    console.log(msg);
  });
*/

function cloneArray(array) {
  return array.slice(0);
}

function handleAll(thenables, doApply) {
  return Valve.create(function (emit) {
    var count = thenables.length;
    var values = [];

    function checkCount() {
      if (--count === 0) {
        doApply ? emit.apply(null, values) : emit(values);
      }
    }

    thenables.forEach(function (thenable, index) {
      if (!thenable) {
        throw 'Implement error scenario';
        return;
      }

      if (!thenable.then) {
        values[index] = thenable;
        checkCount();
        return;
      }

      thenable.then(function (value) {
        values[index] = value;
        checkCount();
      });
    });
  });
}

function iterate(iterator, value, attached, failed) {
  var item = iterator.next();
  if (item.done) {
    return;
  }

  var listener = failed ? item.value.fail : item.value.success;

  if (value && value.then) {
    if (value.attached) {
      attached = attached.concat(value.attached);
    }

    value.then(function (value) {
      iterate(iterator, listener.apply(null, [value].concat(attached)), attached, failed);
    }, function (value) {
      iterate(iterator, listener.apply(null, [value].concat(attached)), attached, true);
    });
    return;
  }
  iterate(iterator, listener.apply(null, [value].concat(attached)), attached, failed);
}

var Valve = (function () {
  function Valve(executor) {
    _classCallCheck(this, Valve);

    this.started = false;
    this.attached = [];
    this.listeners = [];
    this.executor = executor;
  }

  _createClass(Valve, [{
    key: 'execute',
    value: function execute() {
      var _this = this;

      // Iterate over listeners on next run of
      // the js event loop
      // TODO: node support
      setTimeout(function () {
        _this.executor(
        // Emit
        function (value) {
          iterate(_this.listeners[Symbol.iterator](), value, _this.attached);
        },
        // Error
        function (value) {
          iterate(_this.listeners[Symbol.iterator](), value, _this.attached, true);
        });
      }, 1);
    }
  }, {
    key: 'clone',
    value: function clone(onSuccess, onFailure) {
      var newValve = new Valve(this.executor);
      newValve.listeners = cloneArray(this.listeners);
      newValve.attached = cloneArray(this.attached);
      newValve.started = this.started;
      return onSuccess ? newValve.then(onSuccess, onFailure) : newValve;
    }
  }, {
    key: 'attach',
    value: function attach(value) {
      this.attached.push(value);
      return this;
    }
  }, {
    key: 'then',
    value: function then(onSuccess, onFailure) {
      if (typeof onSuccess !== 'function') {
        throw 'Valve: then() requires a function as first argument.';
      }
      this.listeners.push({
        success: onSuccess,
        fail: onFailure || function (value) {
          return value;
        }
      });

      if (!this.started) {
        this.execute();
        this.started = true;
      }

      return this;
    }
  }], [{
    key: 'create',

    //TODO: error scenario
    value: function create(executor) {
      if (executor.then) {
        return new Valve(function (emit) {
          executor.then(emit);
        });
      }
      return new Valve(executor);
    }
  }, {
    key: 'all',

    //TODO: error scenario
    value: function all(thenables) {
      return handleAll(thenables);
    }
  }, {
    key: 'applyAll',
    value: function applyAll(thenables) {
      return handleAll(thenables, true);
    }
  }]);

  return Valve;
})();

exports['default'] = Valve;
module.exports = exports['default'];

},{}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Created by shaunwest on 7/8/15.
 */

exports.flip = flip;
exports.compose = compose;

function flip(fn) {
  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return fn.apply(this, args.reverse());
  };
}

function compose() {
  for (var _len2 = arguments.length, fns = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    fns[_key2] = arguments[_key2];
  }

  return function (result) {
    return fns.reduceRight(function (result, fn) {
      return fn.call(this, result);
    }, result);
  };
}

var sequence = flip(compose);
exports.sequence = sequence;

},{}],15:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = getSceneSchema;
/**
 * Created by shaunwest on 5/9/15.
 */

var _fetchJSON = require('../engine/schema/fetch-schema.js');

var _fetchJSON2 = _interopRequireWildcard(_fetchJSON);

var _getImage = require('../engine/image-loader.js');

var _getImage2 = _interopRequireWildcard(_getImage);

var _getSpriteSchema = require('../schema/sprite-schema.js');

var _getSpriteSchema2 = _interopRequireWildcard(_getSpriteSchema);

var _spriteAnimation = require('../animation/sprite-animation.js');

var _spriteAnimation2 = _interopRequireWildcard(_spriteAnimation);

function getSceneSchema(uri) {
  return _fetchJSON2['default'](uri).then(function (scene) {
    return _getImage2['default'](scene.background.backgroundUrl).then(function (backgroundImage) {
      scene.backgroundImage = backgroundImage;
      return getSpriteTypes(scene.sprites).then(function (sprites) {
        scene.sprites = sprites;
        return scene;
      });
    });
  }).then(function (scene) {
    return Object.freeze(scene);
  });
}

function getSpriteTypes(sprites) {
  return Promise.all(sprites.map(getSpriteType));
}

function getSpriteType(sprite) {
  return _getSpriteSchema2['default'](sprite.srcUrl).then(function (type) {
    sprite.type = type;
    //sprite.animation = spriteAnimation(type.frameSet);
    sprite.animation = {};
    sprite.velocityX = 0;
    sprite.velocityY = 500;
    sprite.accelerationX = 0;
    sprite.accelerationY = 0;
    sprite.maxVelocityX = 500;
    sprite.maxVelocityY = 500;
    sprite.frictionX = 0.99;
    sprite.frictionY = 0.5;
    return sprite;
  });
}
module.exports = exports['default'];

},{"../animation/sprite-animation.js":3,"../engine/image-loader.js":8,"../engine/schema/fetch-schema.js":11,"../schema/sprite-schema.js":16}],16:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = getSpriteSchema;
/**
 * Created by shaunwest on 5/9/15.
 */

var _frameSet = require('../animation/frame-set.js');

var _frameSet2 = _interopRequireWildcard(_frameSet);

var _fetchJSON = require('../engine/schema/fetch-schema.js');

var _fetchJSON2 = _interopRequireWildcard(_fetchJSON);

var _getImage = require('../engine/image-loader.js');

var _getImage2 = _interopRequireWildcard(_getImage);

function getSpriteSchema(uri) {
  return _fetchJSON2['default'](uri).then(function (sprite) {
    return _getImage2['default'](sprite.spriteSheetUrl).then(function (spriteSheet) {
      sprite.spriteSheet = spriteSheet;
      sprite.frameSet = _frameSet2['default'](sprite, spriteSheet);
      return sprite;
    });
  });
}

module.exports = exports['default'];

},{"../animation/frame-set.js":2,"../engine/image-loader.js":8,"../engine/schema/fetch-schema.js":11}],17:[function(require,module,exports){
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
  marginLeft: 64,
  marginRight: 64,
  width: 300,
  height: 400
};
module.exports = exports["default"];

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvbWFpbi5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy9hbmltYXRpb24vZnJhbWUtc2V0LmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2FuaW1hdGlvbi9zcHJpdGUtYW5pbWF0aW9uLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2NhbnZhcy1yZW5kZXJlci5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy9lbmdpbmUvY29tbW9uLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9mcmFnbWVudHMuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL2ZyYW1lLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9pbWFnZS1sb2FkZXIuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL2lucHV0LmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9zY2hlZHVsZXIuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL3NjaGVtYS9mZXRjaC1zY2hlbWEuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL3V0aWwuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL3ZhbHZlLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2Z1bmMuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvc2NoZW1hL3NjZW5lLXNjaGVtYS5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy9zY2hlbWEvc3ByaXRlLXNjaGVtYS5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy92aWV3cG9ydC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O3dCQ0l1Qix1QkFBdUI7OzhCQUNuQiwwQkFBMEI7Ozs7cUJBQ25DLG1CQUFtQjs7OztxQkFDbkIsbUJBQW1COzs7O3dCQUNoQixlQUFlOzs7OzRCQUNULHNCQUFzQjs7d0JBQzFCLFdBQVc7O0FBRWxDLElBQU0sS0FBSyxHQUFHLDRCQUFlLHlCQUF5QixDQUFDLENBQUM7O0FBRXhELFNBQVMsd0JBQXdCLENBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUU7QUFDbEUsU0FBTyxBQUFDLFNBQVMsR0FBRyxVQUFVLEdBQUksU0FBUyxDQUFDO0NBQzdDOztBQUVELFNBQVMsd0JBQXdCLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRTtBQUN0RCxTQUFPLFNBQVMsR0FBRyxTQUFTLENBQUM7Q0FDOUI7O0FBRUQsU0FBUyxhQUFhLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUU7QUFDbEQsU0FBTyxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0NBQ25EOztBQUVELFNBQVMsSUFBSSxDQUFDLFFBQVEsRUFBRSxVQUFVLEVBQUU7QUFDbEMsU0FBTyxBQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsVUFBVSxHQUFJLENBQUMsR0FBRyxRQUFRLENBQUM7Q0FDekQ7O0FBRUQsU0FBUyxhQUFhLENBQUMsUUFBUSxFQUFFLFdBQVcsRUFBRTtBQUM1QyxTQUFPLEFBQUMsUUFBUSxHQUFHLENBQUMsR0FDbEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLEdBQy9CLElBQUksQ0FBQyxHQUFHLENBQUMs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QUFDO0FBQ3ZCLFVBQU0sQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDO0FBQ3pCLFVBQU0sQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDO0FBQ3pCLFVBQU0sQ0FBQyxZQUFZLEdBQUcsR0FBRyxDQUFDO0FBQzFCLFVBQU0sQ0FBQyxZQUFZLEdBQUcsR0FBRyxDQUFDO0FBQzFCLFVBQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO0FBQ3hCLFVBQU0sQ0FBQyxTQUFTLEdBQUcsR0FBSSxDQUFDO0FBQ3hCLFdBQU8sTUFBTSxDQUFDO0dBQ2YsQ0FBQyxDQUFDO0NBQ047Ozs7Ozs7Ozs7O3FCQ3ZDdUIsZUFBZTs7Ozs7d0JBSmxCLDJCQUEyQjs7Ozt5QkFDMUIsa0NBQWtDOzs7O3dCQUNuQywyQkFBMkI7Ozs7QUFFakMsU0FBUyxlQUFlLENBQUMsR0FBRyxFQUFFO0FBQzNDLFNBQU8sdUJBQVUsR0FBRyxDQUFDLENBQ2xCLElBQUksQ0FBQyxVQUFVLE1BQU0sRUFBRTtBQUN0QixXQUFPLHNCQUFTLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FDbkMsSUFBSSxDQUFDLFVBQVUsV0FBVyxFQUFFO0FBQzNCLFlBQU0sQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO0FBQ2pDLFlBQU0sQ0FBQyxRQUFRLEdBQUcsc0JBQVMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0FBQ2hELGFBQU8sTUFBTSxDQUFDO0tBQ2YsQ0FBQyxDQUFDO0dBQ04sQ0FBQyxDQUFDO0NBQ047Ozs7Ozs7Ozs7Ozs7O3FCQ2RjO0FBQ2IsR0FBQyxFQUFFLENBQUM7QUFDSixHQUFDLEVBQUUsQ0FBQztBQUNKLFlBQVUsRUFBRSxFQUFFO0FBQ2QsYUFBVyxFQUFFLEVBQUU7QUFDZixPQUFLLEVBQUUsR0FBRztBQUNWLFFBQU0sRUFBRSxHQUFHO0NBQ1oiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgU2hhdW4gb24gNC8yMy8yMDE1LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7RnJhZ21lbnR9IGZyb20gJy4vZW5naW5lL2ZyYWdtZW50cy5qcyc7XHJcbmltcG9ydCBnZXRTY2VuZVNjaGVtYSBmcm9tICcuL3NjaGVtYS9zY2VuZS1zY2hlbWEuanMnO1xyXG5pbXBvcnQgRnJhbWUgZnJvbSAnLi9lbmdpbmUvZnJhbWUuanMnO1xyXG5pbXBvcnQgSW5wdXQgZnJvbSAnLi9lbmdpbmUvaW5wdXQuanMnO1xyXG5pbXBvcnQgVmlld3BvcnQgZnJvbSAnLi92aWV3cG9ydC5qcyc7XHJcbmltcG9ydCB7Y2xlYXJDb250ZXh0fSBmcm9tICcuL2NhbnZhcy1yZW5kZXJlci5qcyc7XHJcbmltcG9ydCB7c2VxdWVuY2V9IGZyb20gJy4vZnVuYy5qcyc7XHJcblxyXG5jb25zdCBzY2VuZSA9IGdldFNjZW5lU2NoZW1hKCdhc3NldHMva2l0dHktd29ybGQuanNvbicpO1xyXG5cclxuZnVuY3Rpb24gZ2V0UG9zaXRpb25Gcm9tTWF4TWFyZ2luKHNwcml0ZVBvcywgc3ByaXRlU2l6ZSwgbWF4TWFyZ2luKSB7XHJcbiAgcmV0dXJuIChzcHJpdGVQb3MgKyBzcHJpdGVTaXplKSAtIG1heE1hcmdpbjtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0UG9zaXRpb25Gcm9tTWluTWFyZ2luKHNwcml0ZVBvcywgbWluTWFyZ2luKSB7XHJcbiAgcmV0dXJuIHNwcml0ZVBvcyAtIG1pbk1hcmdpbjtcclxufVxyXG5cclxuZnVuY3Rpb24gYXBwbHlGcmljdGlvbih2ZWxvY2l0eSwgZnJpY3Rpb24sIGVsYXBzZWQpIHtcclxuICByZXR1cm4gdmVsb2NpdHkgKiBNYXRoLnBvdygxIC0gZnJpY3Rpb24sIGVsYXBzZWQpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBoYWx0KHZlbG9jaXR5LCBoYWx0VGFyZ2V0KSB7XHJcbiAgcmV0dXJuIChNYXRoLmFicyh2ZWxvY2l0eSkgPCBoYWx0VGFyZ2V0KSA/IDAgOiB2ZWxvY2l0eTtcclxufVxyXG5cclxuZnVuY3Rpb24gY2xhbXBWZWxvY2l0eSh2ZWxvY2l0eSwgbWF4VmVsb2NpdHkpIHtcclxuICByZXR1cm4gKHZlbG9jaXR5ID4gMCkgP1xyXG4gICAgTWF0aC5taW4odmVsb2NpdHksIG1heFZlbG9jaXR5KSA6XHJcbiAgICBNYXRoLm1heCh2ZWxvY2l0eSwgLW1heFZlbG9jaXR5KTtcclxufVxyXG5cclxuZnVuY3Rpb24gYXBwbHlBY2NlbGVyYXRpb24odmVsb2NpdHksIGFjY2VsZXJhdGlvbiwgZWxhcHNlZCkge1xyXG4gIHJldHVybiB2ZWxvY2l0eSArIChhY2NlbGVyYXRpb24gKiBlbGFwc2VkKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0UG9zaXRpb25EZWx0YSh2YWwsIHZlbG9jaXR5LCBlbGFwc2VkKSB7XHJcbiAgcmV0dXJuIHZhbCArIE1hdGgucm91bmQodmVsb2NpdHkgKiBlbGFwc2VkKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0VmVsb2NpdHlYKHNwcml0ZSwgZWxhcHNlZCkge1xyXG4gIGNvbnN0IHZlbFgwID0gaGFsdChzcHJpdGUudmVsb2NpdHlYLCAxKTtcclxuICBjb25zdCB2ZWxYMSA9IGFwcGx5QWNjZWxlcmF0aW9uKHZlbFgwLCBzcHJpdGUuYWNjZWxlcmF0aW9uWCwgZWxhcHNlZCk7XHJcbiAgY29uc3QgdmVsWDIgPSBhcHBseUZyaWN0aW9uKHZlbFgxLCBzcHJpdGUuZnJpY3Rpb25YLCBlbGFwc2VkKTtcclxuICByZXR1cm4gY2xhbXBWZWxvY2l0eSh2ZWxYMiwgc3ByaXRlLm1heFZlbG9jaXR5WCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFZlbG9jaXR5WShzcHJpdGUsIGVsYXBzZWQpIHtcclxuICBjb25zdCB2ZWxZMCA9IGhhbHQoc3ByaXRlLnZlbG9jaXR5WSwgMSk7XHJcbiAgY29uc3QgdmVsWTEgPSBhcHBseUFjY2VsZXJhdGlvbih2ZWxZMCwgc3ByaXRlLmFjY2VsZXJhdGlvblksIGVsYXBzZWQpO1xyXG4gIGNvbnN0IHZlbFkyID0gYXBwbHlGcmljdGlvbih2ZWxZMSwgc3ByaXRlLmZyaWN0aW9uWSwgZWxhcHNlZCk7XHJcbiAgcmV0dXJuIGNsYW1wVmVsb2NpdHkodmVsWTIsIHNwcml0ZS5tYXhWZWxvY2l0eVkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRJbm5lckRpZmYodmFsLCBzaXplLCBtaW5Cb3VuZCwgbWF4Qm91bmQpIHtcclxuICBjb25zdCBtYXggPSB2YWwgKyBzaXplO1xyXG4gIHJldHVybiAodmFsIDwgbWluQm91bmQgJiYgdmFsIC0gbWluQm91bmQgfHxcclxuICAgIG1heCA+IG1heEJvdW5kICYmIG1heCAtIG1heEJvdW5kIHx8XHJcbiAgICAwKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0T3V0ZXJEaWZmKHZhbCwgc2l6ZSwgbWluQm91bmQsIG1heEJvdW5kKSB7XHJcbiAgY29uc3QgbWF4ID0gdmFsICsgc2l6ZTtcclxuICByZXR1cm4gKHZhbCA8IG1pbkJvdW5kICYmIG1heCA+IG1pbkJvdW5kICYmIG1heCAtIG1pbkJvdW5kIHx8XHJcbiAgICB2YWwgPCBtYXhCb3VuZCAmJiBtYXggPiBtYXhCb3VuZCAmJiB2YWwgLSBtYXhCb3VuZCB8fFxyXG4gICAgMCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlc29sdmVDb2xsaXNpb24oZGlmZiwgdmFsKSB7XHJcbiAgcmV0dXJuIHZhbCAtIGRpZmY7XHJcbn1cclxuXHJcbi8qZnVuY3Rpb24gZ2V0Q29sbGlzaW9uUmVzb2x2ZShjb2xsaWRlcnMsIHNwcml0ZSkge1xyXG4gIHJldHVybiBjb2xsaWRlcnNcclxuICAgIC5yZWR1Y2UoZnVuY3Rpb24gKHJlc29sdmUsIGNvbGxpZGVyKSB7XHJcbiAgICAgIGNvbnN0IGRpZmZYID0gKHNwcml0ZS55ID49IGNvbGxpZGVyLnkgJiYgc3ByaXRlLnkgPD0gY29sbGlkZXIueSArIGNvbGxpZGVyLmhlaWdodCkgP1xyXG4gICAgICAgIGdldE91dGVyRGlmZihcclxuICAgICAgICAgIHNwcml0ZS54LFxyXG4gICAgICAgICAgc3ByaXRlLndpZHRoLFxyXG4gICAgICAgICAgY29sbGlkZXIueCxcclxuICAgICAgICAgIGNvbGxpZGVyLnggKyBjb2xsaWRlci53aWR0aFxyXG4gICAgICAgICkgOiAwO1xyXG5cclxuICAgICAgcmVzb2x2ZS54ID0gKGRpZmZYKSA/IHJlc29sdmVDb2xsaXNpb24oZGlmZlgsIHNwcml0ZS54KSA6IHJlc29sdmUueDtcclxuXHJcbiAgICAgIGNvbnN0IGRpZmZZID0gKHNwcml0ZS54ID49IGNvbGxpZGVyLnggJiYgc3ByaXRlLnggPD0gY29sbGlkZXIueCArIGNvbGxpZGVyLndpZHRoKSA/XHJcbiAgICAgICAgZ2V0T3V0ZXJEaWZmKFxyXG4gICAgICAgICAgc3ByaXRlLnksXHJcbiAgICAgICAgICBzcHJpdGUuaGVpZ2h0LFxyXG4gICAgICAgICAgY29sbGlkZXIueSxcclxuICAgICAgICAgIGNvbGxpZGVyLnkgKyBjb2xsaWRlci5oZWlnaHRcclxuICAgICAgICApIDogMDtcclxuXHJcbiAgICAgIHJlc29sdmUueSA9IChkaWZmWSkgPyByZXNvbHZlQ29sbGlzaW9uKGRpZmZZLCBzcHJpdGUueSkgOiByZXNvbHZlLnk7XHJcblxyXG4gICAgICByZXR1cm4gcmVzb2x2ZTtcclxuICAgIH0sIHt4OiBzcHJpdGUueCwgeTogc3ByaXRlLnl9KTtcclxufSovXHJcblxyXG5mdW5jdGlvbiBnZXRDb2xsaXNpb25SZXNvbHZlKGNvbGxpZGVycywgcG9zaXRpb24sIHJhbmdlLCBzaXplKSB7XHJcbiAgcmV0dXJuIGNvbGxpZGVyc1xyXG4gICAgLmZpbHRlcihmdW5jdGlvbiAoY29sbGlkZXIpIHtcclxuICAgICAgcmV0dXJuIChyYW5nZSA+PSBjb2xsaWRlci5yYW5nZU1pbiAmJiByYW5nZSA8PSBjb2xsaWRlci5yYW5nZU1heCk7XHJcbiAgICB9KVxyXG4gICAgLnJlZHVjZShmdW5jdGlvbiAocG9zaXRpb25EZWx0YSwgY29sbGlkZXIpIHtcclxuICAgICAgY29uc3QgZGlmZiA9IGdldE91dGVyRGlmZihcclxuICAgICAgICAgIHBvc2l0aW9uLFxyXG4gICAgICAgICAgc2l6ZSxcclxuICAgICAgICAgIGNvbGxpZGVyLnBvc2l0aW9uTWluLFxyXG4gICAgICAgICAgY29sbGlkZXIucG9zaXRpb25NYXhcclxuICAgICAgKTtcclxuXHJcbiAgICAgIHJldHVybiAoZGlmZikgP1xyXG4gICAgICAgIHBvc2l0aW9uIC0gZGlmZiA6XHJcbiAgICAgICAgcG9zaXRpb25EZWx0YTtcclxuICAgIH0sIHBvc2l0aW9uKTtcclxufVxyXG5cclxuLypmdW5jdGlvbiBnZXRDb2xsaXNpb25SZXNvbHZlWSgpIHtcclxuICAgcmV0dXJuIGNvbGxpZGVyc1xyXG4gICAgLnJlZHVjZShmdW5jdGlvbiAocmVzb2x2ZSwgY29sbGlkZXIpIHtcclxuICAgICAgY29uc3QgZGlmZlggPSAoc3ByaXRlLnkgPj0gY29sbGlkZXIueSAmJiBzcHJpdGUueSA8PSBjb2xsaWRlci55ICsgY29sbGlkZXIuaGVpZ2h0KSA/XHJcbiAgICAgICAgZ2V0T3V0ZXJEaWZmKFxyXG4gICAgICAgICAgc3ByaXRlLngsXHJcbiAgICAgICAgICBzcHJpdGUud2lkdGgsXHJcbiAgICAgICAgICBjb2xsaWRlci54LFxyXG4gICAgICAgICAgY29sbGlkZXIueCArIGNvbGxpZGVyLndpZHRoXHJcbiAgICAgICAgKSA6IDA7XHJcblxyXG4gICAgICByZXNvbHZlLnggPSAoZGlmZlgpID8gcmVzb2x2ZUNvbGxpc2lvbihkaWZmWCwgc3ByaXRlLngpIDogcmVzb2x2ZS54O1xyXG5cclxuICAgICAgY29uc3QgZGlmZlkgPSAoc3ByaXRlLnggPj0gY29sbGlkZXIueCAmJiBzcHJpdGUueCA8PSBjb2xsaWRlci54ICsgY29sbGlkZXIud2lkdGgpID9cclxuICAgICAgICBnZXRPdXRlckRpZmYoXHJcbiAgICAgICAgICBzcHJpdGUueSxcclxuICAgICAgICAgIHNwcml0ZS5oZWlnaHQsXHJcbiAgICAgICAgICBjb2xsaWRlci55LFxyXG4gICAgICAgICAgY29sbGlkZXIueSArIGNvbGxpZGVyLmhlaWdodFxyXG4gICAgICAgICkgOiAwO1xyXG5cclxuICAgICAgcmVzb2x2ZS55ID0gKGRpZmZZKSA/IHJlc29sdmVDb2xsaXNpb24oZGlmZlksIHNwcml0ZS55KSA6IHJlc29sdmUueTtcclxuXHJcbiAgICAgIHJldHVybiByZXNvbHZlO1xyXG4gICAgfSwge3g6IHNwcml0ZS54LCB5OiBzcHJpdGUueX0pO1xyXG59Ki9cclxuXHJcbmZ1bmN0aW9uIGFwcGx5QW5pbWF0aW9uKHNwcml0ZSkge1xyXG4gIGNvbnN0IHNlcXVlbmNlID0gc3ByaXRlLnR5cGUuZnJhbWVTZXRbZ2V0QW5pbWF0aW9uKHNwcml0ZSldO1xyXG4gIGNvbnN0IGZyYW1lSW5kZXggPSBnZXRGcmFtZUluZGV4KHNwcml0ZS5hbmltYXRpb24uY3VycmVudEluZGV4LCBzZXF1ZW5jZSk7XHJcbiAgc3ByaXRlLmFuaW1hdGlvbi5jdXJyZW50SW5kZXggPSBmcmFtZUluZGV4O1xyXG5cclxuICByZXR1cm4gZ2V0RnJhbWUoZnJhbWVJbmRleCwgc2VxdWVuY2UpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZyYW1lSW5kZXgoY3VycmVudEluZGV4LCBzZXF1ZW5jZSkge1xyXG4gIGNvbnN0IGluZGV4ID0gY3VycmVudEluZGV4IHx8IDA7XHJcbiAgcmV0dXJuIChpbmRleCA8IHNlcXVlbmNlLmZyYW1lcy5sZW5ndGggLSAxKSA/XHJcbiAgICBpbmRleCArIDEgOiAwO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRBbmltYXRpb24oc3ByaXRlKSB7XHJcbiAgcmV0dXJuICdydW4nO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGcmFtZShpbmRleCwgc2VxdWVuY2UpIHtcclxuICByZXR1cm4gc2VxdWVuY2UuZnJhbWVzW2luZGV4XTtcclxufVxyXG5cclxuZnVuY3Rpb24gcmVuZGVyKGNvbnRleHQyZCwgcG9pbnQsIGltYWdlLCB2aWV3cG9ydCkge1xyXG4gIGlmKCFpbWFnZSkge1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuICBjb250ZXh0MmQuZHJhd0ltYWdlKFxyXG4gICAgaW1hZ2UsXHJcbiAgICBwb2ludC54IC0gdmlld3BvcnQueCB8fCAwLFxyXG4gICAgcG9pbnQueSAtIHZpZXdwb3J0LnkgfHwgMFxyXG4gICk7XHJcbn1cclxuXHJcbmNvbnN0IGdldElucHV0cyA9IElucHV0KCk7XHJcbmNvbnN0IGdldEZyYW1lcyA9IEZyYW1lKCk7XHJcbmNvbnN0IHZpZXdwb3J0ID0gVmlld3BvcnQ7XHJcbmNvbnN0IGZwc1VJID0gRnJhZ21lbnQoJ2ZwcycpO1xyXG5cclxuZ2V0RnJhbWVzKGZ1bmN0aW9uIChlbGFwc2VkLCBmcHMpIHtcclxuICBmcHNVSS50ZXh0Q29udGVudCA9IGZwcztcclxuICByZXR1cm4gdHJ1ZTtcclxufSk7XHJcblxyXG5zY2VuZVxyXG4gIC50aGVuKGZ1bmN0aW9uIChzY2VuZSkge1xyXG4gICAgY29uc3Qgc2NlbmVCb3VuZHMgPSBPYmplY3QuZnJlZXplKHtcclxuICAgICAgd2lkdGg6IHNjZW5lLnNjZW5lV2lkdGgsXHJcbiAgICAgIGhlaWdodDogc2NlbmUuc2NlbmVIZWlnaHRcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IGNhbnZhcyA9IEZyYWdtZW50KCdjYW52YXMtZW50aXRpZXMnKTtcclxuICAgIGNvbnN0IGNvbnRleHQyZCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgY29uc3QgY29sbGlkZXJzID0gT2JqZWN0LmZyZWV6ZShzY2VuZS5jb2xsaWRlcnMpO1xyXG5cclxuICAgIGNvbnN0IGNvbGxpZGVyc1ggPSBjb2xsaWRlcnMubWFwKGZ1bmN0aW9uIChjb2xsaWRlcikge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHBvc2l0aW9uTWluOiBjb2xsaWRlci54LFxyXG4gICAgICAgIHBvc2l0aW9uTWF4OiBjb2xsaWRlci54ICsgY29sbGlkZXIud2lkdGgsXHJcbiAgICAgICAgcmFuZ2VNaW46IGNvbGxpZGVyLnksXHJcbiAgICAgICAgcmFuZ2VNYXg6IGNvbGxpZGVyLnkgKyBjb2xsaWRlci5oZWlnaHRcclxuICAgICAgfTtcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IGNvbGxpZGVyc1kgPSBjb2xsaWRlcnMubWFwKGZ1bmN0aW9uIChjb2xsaWRlcikge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHBvc2l0aW9uTWluOiBjb2xsaWRlci55LFxyXG4gICAgICAgIHBvc2l0aW9uTWF4OiBjb2xsaWRlci55ICsgY29sbGlkZXIuaGVpZ2h0LFxyXG4gICAgICAgIHJhbmdlTWluOiBjb2xsaWRlci54LFxyXG4gICAgICAgIHJhbmdlTWF4OiBjb2xsaWRlci54ICsgY29sbGlkZXIud2lkdGhcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3Qgc3ByaXRlcyA9IE9iamVjdC5mcmVlemUoc2NlbmUuc3ByaXRlcyk7XHJcbiAgICBjb25zdCBwbGF5ZXIgPSBzcHJpdGVzWzBdO1xyXG5cclxuICAgIGdldEZyYW1lcyhmdW5jdGlvbiAoZWxhcHNlZCkge1xyXG4gICAgICBjbGVhckNvbnRleHQoY29udGV4dDJkLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xyXG5cclxuICAgICAgY29uc3QgaW5wdXRzID0gZ2V0SW5wdXRzKCk7XHJcblxyXG4gICAgICBpZiAoaW5wdXRzWzM3XSkge1xyXG4gICAgICAgIHBsYXllci52ZWxvY2l0eVggPSAtMTAwO1xyXG4gICAgICB9IGVsc2UgaWYgKGlucHV0c1szOV0pIHtcclxuICAgICAgICBwbGF5ZXIudmVsb2NpdHlYID0gMTAwO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzcHJpdGVzLmZvckVhY2goZnVuY3Rpb24gKHNwcml0ZSkge1xyXG4gICAgICAgIGNvbnN0IHZlbG9jaXR5WCA9IGdldFZlbG9jaXR5WChzcHJpdGUsIGVsYXBzZWQpO1xyXG4gICAgICAgIGNvbnN0IHggPSBnZXRQb3NpdGlvbkRlbHRhKHNwcml0ZS54LCB2ZWxvY2l0eVgsIGVsYXBzZWQpO1xyXG4gICAgICAgIGNvbnN0IGJvdW5kc0RpZmZYID0gZ2V0SW5uZXJEaWZmKHgsIHNwcml0ZS53aWR0aCwgMCwgc2NlbmVCb3VuZHMud2lkdGgpO1xyXG4gICAgICAgIGNvbnN0IHgyID0gcmVzb2x2ZUNvbGxpc2lvbihib3VuZHNEaWZmWCwgeCk7XHJcblxyXG4gICAgICAgIHNwcml0ZS52ZWxvY2l0eVggPSB2ZWxvY2l0eVg7XHJcbiAgICAgICAgc3ByaXRlLnggPSB4MjtcclxuXHJcbiAgICAgICAgc3ByaXRlLnZlbG9jaXR5WSA9IGdldFZlbG9jaXR5WShzcHJpdGUsIGVsYXBzZWQpO1xyXG4gICAgICAgIHNwcml0ZS55ID0gZ2V0UG9zaXRpb25EZWx0YShzcHJpdGUueSwgc3ByaXRlLnZlbG9jaXR5WSwgZWxhcHNlZCk7XHJcbiAgICAgICAgY29uc3QgZGlmZlkgPSBnZXRJbm5lckRpZmYoc3ByaXRlLnksIHNwcml0ZS5oZWlnaHQsIDAsIHNjZW5lQm91bmRzLmhlaWdodCk7XHJcbiAgICAgICAgc3ByaXRlLnkgPSByZXNvbHZlQ29sbGlzaW9uKGRpZmZZLCBzcHJpdGUueSk7XHJcblxyXG4gICAgICAgIC8vY29uc3QgcmVzb2x2ZSA9IGdldENvbGxpc2lvblJlc29sdmUoY29sbGlkZXJzLCBzcHJpdGUpO1xyXG4gICAgICAgIGNvbnN0IHJlc29sdmVYID0gZ2V0Q29sbGlzaW9uUmVzb2x2ZShjb2xsaWRlcnNYLCBzcHJpdGUueCwgc3ByaXRlLnksIHNwcml0ZS53aWR0aCk7XHJcbiAgICAgICAgc3ByaXRlLnggPSByZXNvbHZlWDtcclxuXHJcbiAgICAgICAgY29uc3QgcmVzb2x2ZVkgPSBnZXRDb2xsaXNpb25SZXNvbHZlKGNvbGxpZGVyc1ksIHNwcml0ZS55LCBzcHJpdGUueCwgc3ByaXRlLmhlaWdodCk7XHJcbiAgICAgICAgc3ByaXRlLnkgPSByZXNvbHZlWTtcclxuXHJcbiAgICAgICAgaWYgKHNwcml0ZSA9PT0gcGxheWVyKSB7XHJcbiAgICAgICAgICBjb25zdCBtaW5NYXJnaW4gPSB2aWV3cG9ydC5tYXJnaW5MZWZ0O1xyXG4gICAgICAgICAgY29uc3QgbWF4TWFyZ2luID0gdmlld3BvcnQud2lkdGggLSB2aWV3cG9ydC5tYXJnaW5SaWdodDtcclxuICAgICAgICAgIGNvbnN0IHZpZXdwb3J0RGlmZlggPSBnZXRJbm5lckRpZmYoXHJcbiAgICAgICAgICAgIHNwcml0ZS54LFxyXG4gICAgICAgICAgICBzcHJpdGUud2lkdGgsXHJcbiAgICAgICAgICAgIHZpZXdwb3J0LnggKyBtaW5NYXJnaW4sXHJcbiAgICAgICAgICAgIHZpZXdwb3J0LnggKyBtYXhNYXJnaW5cclxuICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgaWYgKHZpZXdwb3J0RGlmZlggPiAwICYmIHNwcml0ZS52ZWxvY2l0eVggPiAwKSB7XHJcbiAgICAgICAgICAgIHZpZXdwb3J0LnggPSBnZXRQb3NpdGlvbkZyb21NYXhNYXJnaW4oc3ByaXRlLngsIHNwcml0ZS53aWR0aCwgbWF4TWFyZ2luKTtcclxuICAgICAgICAgIH0gZWxzZSBpZiAodmlld3BvcnREaWZmWCA8IDAgJiYgc3ByaXRlLnZlbG9jaXR5WCA8IDApIHtcclxuICAgICAgICAgICAgdmlld3BvcnQueCA9IGdldFBvc2l0aW9uRnJvbU1pbk1hcmdpbihzcHJpdGUueCwgbWluTWFyZ2luKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGZyYW1lID0gYXBwbHlBbmltYXRpb24oc3ByaXRlKTtcclxuICAgICAgICBjb25zdCBwb3MgPSB7eDogc3ByaXRlLngsIHk6IHNwcml0ZS55fTtcclxuXHJcbiAgICAgICAgcmVuZGVyKGNvbnRleHQyZCwgcG9zLCBmcmFtZSwgdmlld3BvcnQpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHNjZW5lO1xyXG4gIH0pXHJcbiAgLnRoZW4oZnVuY3Rpb24gKHNjZW5lKSB7XHJcbiAgICBjb25zdCBiYWNrZ3JvdW5kSW1hZ2UgPSBzY2VuZS5iYWNrZ3JvdW5kSW1hZ2U7XHJcblxyXG4gICAgY29uc3QgY2FudmFzID0gRnJhZ21lbnQoJ2NhbnZhcy1iYWNrZ3JvdW5kJyk7XHJcbiAgICBjb25zdCBjb250ZXh0MmQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuXHJcbiAgICBnZXRGcmFtZXMoZnVuY3Rpb24gKCkge1xyXG4gICAgICBjbGVhckNvbnRleHQoY29udGV4dDJkLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xyXG4gICAgICByZW5kZXIoY29udGV4dDJkLCB7eDogMCwgeTogMH0sIGJhY2tncm91bmRJbWFnZSwgdmlld3BvcnQpO1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIHNjZW5lO1xyXG4gIH0pO1xyXG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBTaGF1biBvbiAzLzEvMTVcclxuICpcclxuICovXHJcblxyXG5pbXBvcnQge2dldENhbnZhcywgZ2V0VHJhbnNwYXJlbnRJbWFnZX0gZnJvbSAnLi4vZW5naW5lL2NvbW1vbi5qcyc7XHJcblxyXG5jb25zdCBERUZBVUxUX1JBVEUgPSA1O1xyXG5cclxuZnVuY3Rpb24gYnVpbGRGcmFtZVNlcXVlbmNlKGZyYW1lU2V0RGVmaW5pdGlvbiwgZnJhbWVTaXplLCBzcHJpdGVTaGVldCkge1xyXG4gIHZhciBmcmFtZVdpZHRoID0gZnJhbWVTaXplLndpZHRoO1xyXG4gIHZhciBmcmFtZUhlaWdodCA9IGZyYW1lU2l6ZS5oZWlnaHQ7XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICByYXRlOiBmcmFtZVNldERlZmluaXRpb24ucmF0ZSB8fCBERUZBVUxUX1JBVEUsXHJcbiAgICBmcmFtZXM6IGZyYW1lU2V0RGVmaW5pdGlvbi5mcmFtZXNcclxuICAgICAgLm1hcChmdW5jdGlvbihmcmFtZURlZmluaXRpb24pIHtcclxuICAgICAgICB2YXIgZnJhbWUgPSBnZXRDYW52YXMoZnJhbWVXaWR0aCwgZnJhbWVIZWlnaHQpO1xyXG5cclxuICAgICAgICBmcmFtZVxyXG4gICAgICAgICAgLmdldENvbnRleHQoJzJkJylcclxuICAgICAgICAgIC5kcmF3SW1hZ2UoXHJcbiAgICAgICAgICAgIHNwcml0ZVNoZWV0LFxyXG4gICAgICAgICAgICBmcmFtZURlZmluaXRpb24ueCwgZnJhbWVEZWZpbml0aW9uLnksXHJcbiAgICAgICAgICAgIGZyYW1lV2lkdGgsIGZyYW1lSGVpZ2h0LFxyXG4gICAgICAgICAgICAwLCAwLFxyXG4gICAgICAgICAgICBmcmFtZVdpZHRoLCBmcmFtZUhlaWdodFxyXG4gICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGZyYW1lO1xyXG4gICAgICB9KVxyXG4gIH07XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChzcHJpdGVEZWZpbml0aW9uLCBzcHJpdGVTaGVldCkge1xyXG4gIHJldHVybiBPYmplY3RcclxuICAgIC5rZXlzKHNwcml0ZURlZmluaXRpb24uYW5pbWF0aW9ucylcclxuICAgIC5yZWR1Y2UoZnVuY3Rpb24oZnJhbWVTZXQsIGZyYW1lU2V0SWQpIHtcclxuICAgICAgdmFyIGZyYW1lU2VxdWVuY2UgPSBidWlsZEZyYW1lU2VxdWVuY2UoXHJcbiAgICAgICAgc3ByaXRlRGVmaW5pdGlvbi5hbmltYXRpb25zW2ZyYW1lU2V0SWRdLFxyXG4gICAgICAgIHNwcml0ZURlZmluaXRpb24uZnJhbWVTaXplLFxyXG4gICAgICAgIHNwcml0ZVNoZWV0XHJcbiAgICAgICk7XHJcblxyXG4gICAgICBmcmFtZVNlcXVlbmNlLmZyYW1lcyA9IGZyYW1lU2VxdWVuY2UuZnJhbWVzXHJcbiAgICAgICAgLm1hcChmdW5jdGlvbihmcmFtZSkge1xyXG4gICAgICAgICAgcmV0dXJuIGdldFRyYW5zcGFyZW50SW1hZ2Uoc3ByaXRlRGVmaW5pdGlvbi50cmFuc3BhcmVudENvbG9yLCBmcmFtZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICBmcmFtZVNldFtmcmFtZVNldElkXSA9IGZyYW1lU2VxdWVuY2U7XHJcblxyXG4gICAgICByZXR1cm4gZnJhbWVTZXQ7XHJcbiAgICB9LCB7fSk7XHJcbn07XHJcbiIsImltcG9ydCBTY2hlZHVsZXIgZnJvbSAnLi4vZW5naW5lL3NjaGVkdWxlci5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoZnJhbWVTZXQpIHtcclxuICB2YXIgY3VycmVudEZyYW1lU2VxdWVuY2UgPSBmcmFtZVNldFsncnVuJ10sIC8vbnVsbCxcclxuICAgIGN1cnJlbnRGcmFtZUluZGV4ID0gMCxcclxuICAgIGN1cnJlbnRGcmFtZSA9IG51bGwsXHJcbiAgICBmcmFtZUNhbGxiYWNrID0gbnVsbDtcclxuXHJcbiAgdmFyIHNjaGVkdWxlcklkID0gU2NoZWR1bGVyKGZ1bmN0aW9uKGRlbHRhVGltZSwgc2V0UmF0ZSkge1xyXG4gICAgaWYoIWN1cnJlbnRGcmFtZVNlcXVlbmNlKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBpZighY3VycmVudEZyYW1lKSB7XHJcbiAgICAgIHNldFJhdGUoY3VycmVudEZyYW1lU2VxdWVuY2UucmF0ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgY3VycmVudEZyYW1lID0gY3VycmVudEZyYW1lU2VxdWVuY2UuZnJhbWVzW2N1cnJlbnRGcmFtZUluZGV4XTtcclxuICAgIGlmKGZyYW1lQ2FsbGJhY2spIHtcclxuICAgICAgZnJhbWVDYWxsYmFjayhjdXJyZW50RnJhbWUpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmKCsrY3VycmVudEZyYW1lSW5kZXggPj0gY3VycmVudEZyYW1lU2VxdWVuY2UuZnJhbWVzLmxlbmd0aCkge1xyXG4gICAgICBjdXJyZW50RnJhbWVJbmRleCA9IDA7XHJcbiAgICB9XHJcbiAgfSlcclxuICAgIC5pZCgpO1xyXG5cclxuICByZXR1cm4ge1xyXG4gICAgcGxheTogZnVuY3Rpb24oZnJhbWVTZXRJZCkge1xyXG4gICAgICBjdXJyZW50RnJhbWVTZXF1ZW5jZSA9IGZyYW1lU2V0W2ZyYW1lU2V0SWRdO1xyXG4gICAgICBjdXJyZW50RnJhbWVJbmRleCA9IDA7XHJcbiAgICAgIGN1cnJlbnRGcmFtZSA9IG51bGw7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuICAgIG9uRnJhbWU6IGZ1bmN0aW9uKGNiKSB7XHJcbiAgICAgIGZyYW1lQ2FsbGJhY2sgPSBjYjtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG4gICAgc3RvcDogZnVuY3Rpb24oKSB7XHJcbiAgICAgIGN1cnJlbnRGcmFtZVNlcXVlbmNlID0gbnVsbDtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG4gICAga2lsbDogZnVuY3Rpb24oKSB7XHJcbiAgICAgIFNjaGVkdWxlci51bnNjaGVkdWxlKHNjaGVkdWxlcklkKTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG4gICAgY3VycmVudEZyYW1lSW5kZXg6IGZ1bmN0aW9uKCkge1xyXG4gICAgICByZXR1cm4gY3VycmVudEZyYW1lSW5kZXg7XHJcbiAgICB9LFxyXG4gICAgZ2V0SW1hZ2U6IGZ1bmN0aW9uKCkge1xyXG4gICAgICByZXR1cm4gY3VycmVudEZyYW1lO1xyXG4gICAgfSxcclxuICAgIGdldE5leHQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICBjdXJyZW50RnJhbWUgPSBjdXJyZW50RnJhbWVTZXF1ZW5jZS5mcmFtZXNbY3VycmVudEZyYW1lSW5kZXhdO1xyXG4gICAgICBpZigrK2N1cnJlbnRGcmFtZUluZGV4ID49IGN1cnJlbnRGcmFtZVNlcXVlbmNlLmZyYW1lcy5sZW5ndGgpIHtcclxuICAgICAgICBjdXJyZW50RnJhbWVJbmRleCA9IDA7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGN1cnJlbnRGcmFtZTtcclxuICAgIH1cclxuICB9O1xyXG59XHJcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBzaGF1bndlc3Qgb24gNi8yOS8xNS5cbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gY2xlYXJDb250ZXh0KGNvbnRleHQyZCwgd2lkdGgsIGhlaWdodCkge1xuICBjb250ZXh0MmQuY2xlYXJSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xufSIsIlxyXG5pbXBvcnQgVXRpbCBmcm9tICcuL3V0aWwuanMnO1xyXG5cclxuLy8gUmV0dXJuIGV2ZXJ5dGhpbmcgYmVmb3JlIHRoZSBsYXN0IHNsYXNoIG9mIGEgdXJsXHJcbi8vIGUuZy4gaHR0cDovL2Zvby9iYXIvYmF6Lmpzb24gPT4gaHR0cDovL2Zvby9iYXJcclxuZXhwb3J0IGZ1bmN0aW9uIGdldEJhc2VVcmwodXJsKSB7XHJcbiAgdmFyIG4gPSB1cmwubGFzdEluZGV4T2YoJy8nKTtcclxuICByZXR1cm4gdXJsLnN1YnN0cmluZygwLCBuKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGlzRnVsbFVybCh1cmwpIHtcclxuICByZXR1cm4gKHVybC5zdWJzdHJpbmcoMCwgNykgPT09ICdodHRwOi8vJyB8fFxyXG4gICAgdXJsLnN1YnN0cmluZygwLCA4KSA9PT0gJ2h0dHBzOi8vJyk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVVcmwodXJsLCBiYXNlVXJsKSB7XHJcbiAgaWYoYmFzZVVybCAmJiAhaXNGdWxsVXJsKHVybCkpIHtcclxuICAgIHJldHVybiBiYXNlVXJsICsgJy8nICsgdXJsO1xyXG4gIH1cclxuICByZXR1cm4gdXJsO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VPYmplY3Qoc291cmNlLCBkZXN0aW5hdGlvbiwgYWxsb3dXcmFwLCBleGNlcHRpb25PbkNvbGxpc2lvbnMpIHtcclxuICBzb3VyY2UgPSBzb3VyY2UgfHwge307IC8vUG9vbC5nZXRPYmplY3QoKTtcclxuICBkZXN0aW5hdGlvbiA9IGRlc3RpbmF0aW9uIHx8IHt9OyAvL1Bvb2wuZ2V0T2JqZWN0KCk7XHJcblxyXG4gIE9iamVjdC5rZXlzKHNvdXJjZSkuZm9yRWFjaChmdW5jdGlvbihwcm9wKSB7XHJcbiAgICBhc3NpZ25Qcm9wZXJ0eShzb3VyY2UsIGRlc3RpbmF0aW9uLCBwcm9wLCBhbGxvd1dyYXAsIGV4Y2VwdGlvbk9uQ29sbGlzaW9ucyk7XHJcbiAgfSk7XHJcblxyXG4gIHJldHVybiBkZXN0aW5hdGlvbjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGFzc2lnblByb3BlcnR5KHNvdXJjZSwgZGVzdGluYXRpb24sIHByb3AsIGFsbG93V3JhcCwgZXhjZXB0aW9uT25Db2xsaXNpb25zKSB7XHJcbiAgaWYoZGVzdGluYXRpb24uaGFzT3duUHJvcGVydHkocHJvcCkpIHtcclxuICAgIGlmKGFsbG93V3JhcCkge1xyXG4gICAgICBkZXN0aW5hdGlvbltwcm9wXSA9IEZ1bmMud3JhcChkZXN0aW5hdGlvbltwcm9wXSwgc291cmNlW3Byb3BdKTtcclxuICAgICAgVXRpbC5sb2coJ01lcmdlOiB3cmFwcGVkIFxcJycgKyBwcm9wICsgJ1xcJycpO1xyXG4gICAgfSBlbHNlIGlmKGV4Y2VwdGlvbk9uQ29sbGlzaW9ucykge1xyXG4gICAgICBVdGlsLmVycm9yKCdGYWlsZWQgdG8gbWVyZ2UgbWl4aW4uIE1ldGhvZCBcXCcnICtcclxuICAgICAgcHJvcCArICdcXCcgY2F1c2VkIGEgbmFtZSBjb2xsaXNpb24uJyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBkZXN0aW5hdGlvbltwcm9wXSA9IHNvdXJjZVtwcm9wXTtcclxuICAgICAgVXRpbC5sb2coJ01lcmdlOiBvdmVyd3JvdGUgXFwnJyArIHByb3AgKyAnXFwnJyk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZGVzdGluYXRpb247XHJcbiAgfVxyXG5cclxuICBkZXN0aW5hdGlvbltwcm9wXSA9IHNvdXJjZVtwcm9wXTtcclxuXHJcbiAgcmV0dXJuIGRlc3RpbmF0aW9uO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2FudmFzKHdpZHRoLCBoZWlnaHQpIHtcclxuICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcblxyXG4gIGNhbnZhcy53aWR0aCA9IHdpZHRoIHx8IDUwMDtcclxuICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0IHx8IDUwMDtcclxuXHJcbiAgcmV0dXJuIGNhbnZhcztcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGludGVyc2VjdHMocmVjdEEsIHJlY3RCKSB7XHJcbiAgcmV0dXJuICEoXHJcbiAgICByZWN0QS54ICsgcmVjdEEud2lkdGggPCByZWN0Qi54IHx8XHJcbiAgICByZWN0QS55ICsgcmVjdEEuaGVpZ2h0IDwgcmVjdEIueSB8fFxyXG4gICAgcmVjdEEueCA+IHJlY3RCLnggKyByZWN0Qi53aWR0aCB8fFxyXG4gICAgcmVjdEEueSA+IHJlY3RCLnkgKyByZWN0Qi5oZWlnaHRcclxuICApO1xyXG59XHJcblxyXG4vLyBNYWtlIHRoZSBnaXZlbiBSR0IgdmFsdWUgdHJhbnNwYXJlbnQgaW4gdGhlIGdpdmVuIGltYWdlLlxyXG4vLyBSZXR1cm5zIGEgbmV3IGltYWdlLlxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0VHJhbnNwYXJlbnRJbWFnZSh0cmFuc1JHQiwgaW1hZ2UpIHtcclxuICB2YXIgciwgZywgYiwgbmV3SW1hZ2UsIGRhdGFMZW5ndGg7XHJcbiAgdmFyIHdpZHRoID0gaW1hZ2Uud2lkdGg7XHJcbiAgdmFyIGhlaWdodCA9IGltYWdlLmhlaWdodDtcclxuICB2YXIgaW1hZ2VEYXRhID0gaW1hZ2VcclxuICAgIC5nZXRDb250ZXh0KCcyZCcpXHJcbiAgICAuZ2V0SW1hZ2VEYXRhKDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xyXG5cclxuICBpZih0cmFuc1JHQikge1xyXG4gICAgZGF0YUxlbmd0aCA9IHdpZHRoICogaGVpZ2h0ICogNDtcclxuXHJcbiAgICBmb3IodmFyIGluZGV4ID0gMDsgaW5kZXggPCBkYXRhTGVuZ3RoOyBpbmRleCs9NCkge1xyXG4gICAgICByID0gaW1hZ2VEYXRhLmRhdGFbaW5kZXhdO1xyXG4gICAgICBnID0gaW1hZ2VEYXRhLmRhdGFbaW5kZXggKyAxXTtcclxuICAgICAgYiA9IGltYWdlRGF0YS5kYXRhW2luZGV4ICsgMl07XHJcbiAgICAgIGlmKHIgPT09IHRyYW5zUkdCWzBdICYmIGcgPT09IHRyYW5zUkdCWzFdICYmIGIgPT09IHRyYW5zUkdCWzJdKSB7XHJcbiAgICAgICAgaW1hZ2VEYXRhLmRhdGFbaW5kZXggKyAzXSA9IDA7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIG5ld0ltYWdlID0gZ2V0Q2FudmFzKHdpZHRoLCBoZWlnaHQpO1xyXG4gIG5ld0ltYWdlXHJcbiAgICAuZ2V0Q29udGV4dCgnMmQnKVxyXG4gICAgLnB1dEltYWdlRGF0YShpbWFnZURhdGEsIDAsIDApO1xyXG5cclxuICByZXR1cm4gbmV3SW1hZ2U7XHJcbn1cclxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgU2hhdW4gb24gNC8yMy8yMDE1LlxyXG4gKi9cclxuXHJcbnZhciBhbGxEYXRhRWxlbWVudHM7XHJcblxyXG5mdW5jdGlvbiBoYXNEYXRhQXR0cmlidXRlKGVsZW1lbnQpIHtcclxuICB2YXIgYXR0cmlidXRlcyA9IGVsZW1lbnQuYXR0cmlidXRlcztcclxuICBmb3IodmFyIGkgPSAwLCBudW1BdHRyaWJ1dGVzID0gYXR0cmlidXRlcy5sZW5ndGg7IGkgPCBudW1BdHRyaWJ1dGVzOyBpKyspIHtcclxuICAgIGlmKGF0dHJpYnV0ZXNbaV0ubmFtZS5zdWJzdHIoMCwgNCkgPT09ICdkYXRhJykge1xyXG4gICAgICByZXR1cm4gZWxlbWVudDtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBmaW5kRGF0YUVsZW1lbnRzIChwYXJlbnRFbGVtZW50KSB7XHJcbiAgdmFyIGFsbEVsZW1lbnRzLCBlbGVtZW50LCBkYXRhRWxlbWVudHMgPSBbXTtcclxuXHJcbiAgaWYoIXBhcmVudEVsZW1lbnQpIHtcclxuICAgIHZhciBodG1sID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2h0bWwnKTtcclxuICAgIGlmKCFodG1sWzBdKSB7XHJcbiAgICAgIHJldHVybiBkYXRhRWxlbWVudHM7XHJcbiAgICB9XHJcbiAgICBwYXJlbnRFbGVtZW50ID0gaHRtbFswXTtcclxuICB9XHJcblxyXG4gIGFsbEVsZW1lbnRzID0gcGFyZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCcqJyk7XHJcbiAgZm9yKHZhciBpID0gMCwgbnVtRWxlbWVudHMgPSBhbGxFbGVtZW50cy5sZW5ndGg7IGkgPCBudW1FbGVtZW50czsgaSsrKSB7XHJcbiAgICBlbGVtZW50ID0gYWxsRWxlbWVudHNbaV07XHJcbiAgICBpZihoYXNEYXRhQXR0cmlidXRlKGVsZW1lbnQpKSB7XHJcbiAgICAgIGRhdGFFbGVtZW50cy5wdXNoKGVsZW1lbnQpO1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gZGF0YUVsZW1lbnRzO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gRnJhZ21lbnRzIChuYW1lKSB7XHJcbiAgaWYoIWFsbERhdGFFbGVtZW50cykge1xyXG4gICAgY2FjaGVEYXRhRWxlbWVudHMoKTtcclxuICB9XHJcbiAgcmV0dXJuIGFsbERhdGFFbGVtZW50cy5maWx0ZXIoZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgaWYoZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2RhdGEtJyArIG5hbWUpKSB7XHJcbiAgICAgIHJldHVybiBlbGVtZW50O1xyXG4gICAgfVxyXG4gIH0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gRnJhZ21lbnQgKG5hbWUpIHtcclxuICByZXR1cm4gRnJhZ21lbnRzKG5hbWUpWzBdO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY2FjaGVEYXRhRWxlbWVudHMoKSB7XHJcbiAgYWxsRGF0YUVsZW1lbnRzID0gZmluZERhdGFFbGVtZW50cygpO1xyXG59XHJcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBzaGF1bndlc3Qgb24gNi8yMC8xNS5cbiAqL1xuXG5jb25zdCBNU19QRVJfU0VDT05EID0gMTAwMDtcblxuZnVuY3Rpb24gZ2V0RGVsdGFUaW1lKG5vdywgbGFzdFVwZGF0ZVRpbWUpIHtcbiAgcmV0dXJuIChub3cgLSBsYXN0VXBkYXRlVGltZSkgLyBNU19QRVJfU0VDT05EO1xufVxuXG4vLyBTVEFURUZVTFxuZnVuY3Rpb24gRnJhbWVMb29wKHN0YXJ0KSB7XG4gIGxldCBjYnMgPSBbXSwgbGFzdCA9IHN0YXJ0LCBmcHMgPSAwLCBmcmFtZUNvdW50ID0gMDtcbiAgbGV0IGludGVydmFsSWQgPSBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgZnBzID0gZnJhbWVDb3VudDtcbiAgICBmcmFtZUNvdW50ID0gMDtcbiAgfSwgTVNfUEVSX1NFQ09ORCk7XG5cbiAgKGZ1bmN0aW9uIGxvb3AoKSB7XG4gICAgZnJhbWVDb3VudCsrO1xuXG4gICAgY2JzID0gY2JzXG4gICAgICAubWFwKGZ1bmN0aW9uIChjYikge1xuICAgICAgICByZXR1cm4gY2IoZnBzLCBsYXN0KSAmJiBjYjtcbiAgICAgIH0pXG4gICAgICAuZmlsdGVyKGZ1bmN0aW9uIChjYikge1xuICAgICAgICByZXR1cm4gY2I7XG4gICAgICB9KTtcblxuICAgIGxhc3QgPSArbmV3IERhdGUoKTtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUobG9vcCk7XG4gIH0pKCk7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChjYikge1xuICAgIGNicy5wdXNoKGNiKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gRnJhbWUoKSB7XG4gIGNvbnN0IGZyYW1lTG9vcCA9IEZyYW1lTG9vcCgrbmV3IERhdGUoKSk7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChjYikge1xuICAgIGZyYW1lTG9vcChmdW5jdGlvbiAoZnBzLCBsYXN0VXBkYXRlVGltZSkge1xuICAgICAgY29uc3QgZWxhcHNlZCA9IGdldERlbHRhVGltZSgrbmV3IERhdGUoKSwgbGFzdFVwZGF0ZVRpbWUpO1xuICAgICAgcmV0dXJuIGNiKGVsYXBzZWQsIGZwcyk7XG4gICAgfSk7XG4gIH1cbn1cbiIsIi8qKlxuICogQ3JlYXRlZCBieSBTaGF1biBvbiA1LzEvMTQuXG4gKi9cblxudmFyIElNQUdFX1dBSVRfSU5URVJWQUwgPSAxMDA7XG5cbmZ1bmN0aW9uIHdhaXRGb3JJbWFnZSAoaW1hZ2UpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgIHZhciBpbnRlcnZhbElkID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgICBpZihpbWFnZS5jb21wbGV0ZSkge1xuICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsSWQpO1xuICAgICAgICByZXNvbHZlKGltYWdlKTtcbiAgICAgIH1cbiAgICB9LCBJTUFHRV9XQUlUX0lOVEVSVkFMKTtcblxuICAgIGltYWdlLm9uZXJyb3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBjbGVhckludGVydmFsKGludGVydmFsSWQpO1xuICAgICAgcmVqZWN0KCk7XG4gICAgfTtcbiAgfSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdldEltYWdlICh1cmkpIHtcbiAgdmFyIGltYWdlLCBwcm9taXNlO1xuXG4gIGltYWdlID0gbmV3IEltYWdlKCk7XG4gIGltYWdlLnNyYyA9IHVyaTtcblxuICBwcm9taXNlID0gd2FpdEZvckltYWdlKGltYWdlKTtcblxuICByZXR1cm4gcHJvbWlzZTtcbn1cbiIsIi8qKlxuICogQ3JlYXRlZCBieSBzaGF1bndlc3Qgb24gNi8yOC8xNS5cbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBJbnB1dCgpIHtcbiAgdmFyIGtleXMgPSB7fTtcblxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uIChldmVudCkge1xuICAgIGtleXNbZXZlbnQua2V5Q29kZV0gPSB0cnVlO1xuICB9KTtcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAga2V5c1tldmVudC5rZXlDb2RlXSA9IGZhbHNlO1xuICB9KTtcblxuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBrZXlzO1xuICB9O1xufVxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgU2hhdW4gb24gMi8xLzE1XHJcbiAqIEJhc2VkIG9uIHRoZSBqYWNrMmQgQ2hyb25vIG9iamVjdFxyXG4gKiBcclxuICovXHJcblxyXG5pbXBvcnQgVXRpbCBmcm9tICcuL3V0aWwuanMnO1xyXG5pbXBvcnQge21lcmdlT2JqZWN0fSBmcm9tICcuL2NvbW1vbi5qcyc7XHJcblxyXG52YXIgaW5zdGFuY2U7XHJcbnZhciBPTkVfU0VDT05EID0gMTAwMDtcclxuXHJcbi8vIGdldCByaWQgb2YgaW5zdGFuY2Ugc3R1ZmYuIEp1c3QgdXNlIHRoZSBkaSBjb250YWluZXIncyByZWdpc3RlclNpbmdsZXRvbi91c2VcclxuZnVuY3Rpb24gU2NoZWR1bGVyKGNiLCByYXRlKSB7XHJcbiAgaWYoIWluc3RhbmNlKSB7XHJcbiAgICBpbnN0YW5jZSA9IGNyZWF0ZSgpO1xyXG4gIH1cclxuICBpZihjYikge1xyXG4gICAgaW5zdGFuY2Uuc2NoZWR1bGUoY2IsIHJhdGUpO1xyXG4gIH1cclxuICByZXR1cm4gaW5zdGFuY2U7XHJcbn1cclxuXHJcblNjaGVkdWxlci5pbnN0YW5jZSA9IGNyZWF0ZTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZSgpIHtcclxuICByZXR1cm4gbWVyZ2VPYmplY3Qoe1xyXG4gICAgc2NoZWR1bGVkOiBbXSxcclxuICAgIHNjaGVkdWxlOiBzY2hlZHVsZSxcclxuICAgIHVuc2NoZWR1bGU6IHVuc2NoZWR1bGUsXHJcbiAgICBzdGFydDogc3RhcnQsXHJcbiAgICBzdG9wOiBzdG9wLFxyXG4gICAgZnJhbWU6IGZyYW1lLFxyXG4gICAgaWQ6IGlkXHJcbiAgfSkuc3RhcnQoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2NoZWR1bGUoY2IsIHJhdGUpIHtcclxuICBmdW5jdGlvbiBzZXRSYXRlKG5ld1JhdGUpIHtcclxuICAgIHJhdGUgPSBuZXdSYXRlO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gbWFrZUZyYW1lKCkge1xyXG4gICAgdmFyIGNvdW50ID0gMSxcclxuICAgICAgdG90YWxEZWx0YVRpbWUgPSAwO1xyXG5cclxuICAgIHJldHVybiBmdW5jdGlvbihkZWx0YVRpbWUpIHtcclxuICAgICAgdG90YWxEZWx0YVRpbWUgKz0gZGVsdGFUaW1lO1xyXG4gICAgICBpZihjb3VudCAhPT0gcmF0ZSkge1xyXG4gICAgICAgIGNvdW50Kys7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIGNiKHRvdGFsRGVsdGFUaW1lLCBzZXRSYXRlKTtcclxuICAgICAgY291bnQgPSAxO1xyXG4gICAgICB0b3RhbERlbHRhVGltZSA9IDA7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgaWYoIVV0aWwuaXNGdW5jdGlvbihjYikpIHtcclxuICAgIFV0aWwuZXJyb3IoJ1NjaGVkdWxlcjogb25seSBmdW5jdGlvbnMgY2FuIGJlIHNjaGVkdWxlZC4nKTtcclxuICB9XHJcbiAgcmF0ZSA9IHJhdGUgfHwgMTtcclxuXHJcbiAgdGhpcy5zY2hlZHVsZWQucHVzaChtYWtlRnJhbWUoKSk7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpZCgpIHtcclxuICByZXR1cm4gdGhpcy5zY2hlZHVsZWQubGVuZ3RoO1xyXG59XHJcblxyXG5mdW5jdGlvbiB1bnNjaGVkdWxlKGlkKSB7XHJcbiAgdGhpcy5zY2hlZHVsZWQuc3BsaWNlKGlkIC0gMSwgMSk7XHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHN0YXJ0KCkge1xyXG4gIGlmKHRoaXMucnVubmluZykge1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBtZXJnZU9iamVjdCh7XHJcbiAgICBhY3R1YWxGcHM6IDAsXHJcbiAgICB0aWNrczogMCxcclxuICAgIGVsYXBzZWRTZWNvbmRzOiAwLFxyXG4gICAgcnVubmluZzogdHJ1ZSxcclxuICAgIGxhc3RVcGRhdGVUaW1lOiBuZXcgRGF0ZSgpLFxyXG4gICAgb25lU2Vjb25kVGltZXJJZDogd2luZG93LnNldEludGVydmFsKG9uT25lU2Vjb25kLmJpbmQodGhpcyksIE9ORV9TRUNPTkQpXHJcbiAgfSwgdGhpcyk7XHJcblxyXG4gIHJldHVybiB0aGlzLmZyYW1lKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHN0b3AoKSB7XHJcbiAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XHJcbiAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5vbmVTZWNvbmRUaW1lcklkKTtcclxuICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5hbmltYXRpb25GcmFtZUlkKTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNsZWFyKCkge1xyXG4gIHRoaXMuc2NoZWR1bGVkLmxlbmd0aCA9IDA7XHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGZyYW1lKCkge1xyXG4gIGV4ZWN1dGVGcmFtZUNhbGxiYWNrcy5iaW5kKHRoaXMpKGdldERlbHRhVGltZS5iaW5kKHRoaXMpKCkpO1xyXG4gIHRoaXMudGlja3MrKztcclxuXHJcbiAgaWYodGhpcy5ydW5uaW5nKSB7XHJcbiAgICB0aGlzLmFuaW1hdGlvbkZyYW1lSWQgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZyYW1lLmJpbmQodGhpcykpO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG9uT25lU2Vjb25kKCkge1xyXG4gIHRoaXMuYWN0dWFsRnBzID0gdGhpcy50aWNrcztcclxuICB0aGlzLnRpY2tzID0gMDtcclxuICB0aGlzLmVsYXBzZWRTZWNvbmRzKys7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGV4ZWN1dGVGcmFtZUNhbGxiYWNrcyhkZWx0YVRpbWUpIHtcclxuICB2YXIgc2NoZWR1bGVkID0gdGhpcy5zY2hlZHVsZWQ7XHJcblxyXG4gIGZvcih2YXIgaSA9IDAsIG51bVNjaGVkdWxlZCA9IHNjaGVkdWxlZC5sZW5ndGg7IGkgPCBudW1TY2hlZHVsZWQ7IGkrKykge1xyXG4gICAgc2NoZWR1bGVkW2ldKGRlbHRhVGltZSk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXREZWx0YVRpbWUoKSB7XHJcbiAgdmFyIG5vdyA9ICtuZXcgRGF0ZSgpO1xyXG4gIHZhciBkZWx0YVRpbWUgPSAobm93IC0gdGhpcy5sYXN0VXBkYXRlVGltZSkgLyBPTkVfU0VDT05EO1xyXG5cclxuICB0aGlzLmxhc3RVcGRhdGVUaW1lID0gbm93O1xyXG5cclxuICByZXR1cm4gZGVsdGFUaW1lO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBTY2hlZHVsZXI7XHJcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBzaGF1bndlc3Qgb24gNi8xMS8xNS5cbiAqL1xuXG5cbmltcG9ydCBWYWx2ZSBmcm9tICcuLi92YWx2ZS5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGZldGNoSlNPTih1cmkpIHtcbiAgLy9yZXR1cm4gVmFsdmUuY3JlYXRlKGZldGNoKHVyaSkudGhlbihyZXNwb25zZSA9PiByZXNwb25zZS5qc29uKCkpKTtcbiAgcmV0dXJuIGZldGNoKHVyaSkudGhlbihyZXNwb25zZSA9PiByZXNwb25zZS5qc29uKCkpO1xufSIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IFNoYXVuIG9uIDQvMjMvMjAxNS5cclxuICovXHJcblxyXG52YXIgdHlwZXMgPSBbJ0FycmF5JywgJ09iamVjdCcsICdCb29sZWFuJywgJ0FyZ3VtZW50cycsICdGdW5jdGlvbicsICdTdHJpbmcnLCAnTnVtYmVyJywgJ0RhdGUnLCAnUmVnRXhwJ107XHJcblxyXG52YXIgVXRpbCA9IHtcclxuICBpc0RlZmluZWQ6IGZ1bmN0aW9uICh2YWx1ZSkgeyByZXR1cm4gdHlwZW9mIHZhbHVlICE9ICd1bmRlZmluZWQnIH0sXHJcbiAgZGVmOiBmdW5jdGlvbiAodmFsdWUsIGRlZmF1bHRWYWx1ZSkgeyByZXR1cm4gKHR5cGVvZiB2YWx1ZSA9PSAndW5kZWZpbmVkJykgPyBkZWZhdWx0VmFsdWUgOiB2YWx1ZSB9LFxyXG4gIGVycm9yOiBmdW5jdGlvbiAobWVzc2FnZSkgeyB0aHJvdyBuZXcgRXJyb3IoaWQgKyAnOiAnICsgbWVzc2FnZSkgfSxcclxuICB3YXJuOiBmdW5jdGlvbiAobWVzc2FnZSkgeyBVdGlsLmxvZygnV2FybmluZzogJyArIG1lc3NhZ2UpIH0sXHJcbiAgbG9nOiBmdW5jdGlvbiAobWVzc2FnZSkgeyBpZihjb25maWcubG9nKSB7IGNvbnNvbGUubG9nKGlkICsgJzogJyArIG1lc3NhZ2UpIH0gfSxcclxuICBhcmdzVG9BcnJheTogZnVuY3Rpb24gKGFyZ3MpIHsgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3MpIH0sXHJcbiAgcmFuZDogZnVuY3Rpb24gKG1heCwgbWluKSB7IC8vIG1vdmUgdG8gZXh0cmE/XHJcbiAgICBtaW4gPSBtaW4gfHwgMDtcclxuICAgIGlmKG1pbiA+IG1heCkgeyBVdGlsLmVycm9yKCdyYW5kOiBpbnZhbGlkIHJhbmdlLicpOyB9XHJcbiAgICByZXR1cm4gTWF0aC5mbG9vcigoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSkpICsgKG1pbik7XHJcbiAgfVxyXG59O1xyXG5cclxuZm9yKHZhciBpID0gMDsgaSA8IHR5cGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgVXRpbFsnaXMnICsgdHlwZXNbaV1dID0gKGZ1bmN0aW9uKHR5cGUpIHtcclxuICAgIHJldHVybiBmdW5jdGlvbihvYmopIHtcclxuICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09ICdbb2JqZWN0ICcgKyB0eXBlICsgJ10nO1xyXG4gICAgfTtcclxuICB9KSh0eXBlc1tpXSk7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFV0aWw7IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IHNoYXVud2VzdCBvbiA2LzIwLzE1LlxuICpcbiAqIFRPRE86IGRpc3Bvc2UoKVxuICovXG5cbi8qKlxuICpcbnZhciB2YWx2ZSA9IFZhbHZlLmNyZWF0ZShmdW5jdGlvbiAoZW1pdCwgZXJyb3IpIHtcbiAgc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuICAgIGVycm9yKCdoZWxsbycpO1xuICB9LCA1MDApO1xufSkudGhlbihmdW5jdGlvbiAobXNnKSB7XG4gIHJldHVybiBtc2cgKyAnIFNoYXVuJztcbn0pLnRoZW4oZnVuY3Rpb24gKG5ld01zZykge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcbiAgICBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgICByZXNvbHZlKG5ld01zZyArICchISEhJyk7XG4gICAgfSwgNTAwKTtcbiAgfSk7XG59KS50aGVuKFxuICBmdW5jdGlvbiAobmV3ZXJNc2cpIHtcbiAgICBjb25zb2xlLmxvZyhuZXdlck1zZyk7XG4gIH0sIGZ1bmN0aW9uIChtc2cpIHtcbiAgICBjb25zb2xlLmxvZyhtc2cpO1xuICB9KTtcbiovXG5cbmZ1bmN0aW9uIGNsb25lQXJyYXkoYXJyYXkpIHtcbiAgcmV0dXJuIGFycmF5LnNsaWNlKDApO1xufVxuXG5mdW5jdGlvbiBoYW5kbGVBbGwodGhlbmFibGVzLCBkb0FwcGx5KSB7XG4gIHJldHVybiBWYWx2ZS5jcmVhdGUoZnVuY3Rpb24gKGVtaXQpIHtcbiAgICB2YXIgY291bnQgPSB0aGVuYWJsZXMubGVuZ3RoO1xuICAgIHZhciB2YWx1ZXMgPSBbXTtcblxuICAgIGZ1bmN0aW9uIGNoZWNrQ291bnQoKSB7XG4gICAgICBpZigtLWNvdW50ID09PSAwKSB7XG4gICAgICAgIChkb0FwcGx5KSA/XG4gICAgICAgICAgZW1pdC5hcHBseShudWxsLCB2YWx1ZXMpIDpcbiAgICAgICAgICBlbWl0KHZhbHVlcyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhlbmFibGVzLmZvckVhY2goZnVuY3Rpb24gKHRoZW5hYmxlLCBpbmRleCkge1xuICAgICAgaWYoIXRoZW5hYmxlKSB7XG4gICAgICAgIHRocm93ICdJbXBsZW1lbnQgZXJyb3Igc2NlbmFyaW8nO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmKCF0aGVuYWJsZS50aGVuKSB7XG4gICAgICAgIHZhbHVlc1tpbmRleF0gPSB0aGVuYWJsZTtcbiAgICAgICAgY2hlY2tDb3VudCgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRoZW5hYmxlLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHZhbHVlc1tpbmRleF0gPSB2YWx1ZTtcbiAgICAgICAgY2hlY2tDb3VudCgpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pXG59XG5cbmZ1bmN0aW9uIGl0ZXJhdGUoaXRlcmF0b3IsIHZhbHVlLCBhdHRhY2hlZCwgZmFpbGVkKSB7XG4gIGxldCBpdGVtID0gaXRlcmF0b3IubmV4dCgpO1xuICBpZiAoaXRlbS5kb25lKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgbGV0IGxpc3RlbmVyID0gKGZhaWxlZCkgP1xuICAgIGl0ZW0udmFsdWUuZmFpbCA6XG4gICAgaXRlbS52YWx1ZS5zdWNjZXNzO1xuXG4gIGlmICh2YWx1ZSAmJiB2YWx1ZS50aGVuKSB7XG4gICAgaWYodmFsdWUuYXR0YWNoZWQpIHtcbiAgICAgIGF0dGFjaGVkID0gYXR0YWNoZWQuY29uY2F0KHZhbHVlLmF0dGFjaGVkKTtcbiAgICB9XG5cbiAgICB2YWx1ZS50aGVuKFxuICAgICAgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIGl0ZXJhdGUoaXRlcmF0b3IsIGxpc3RlbmVyLmFwcGx5KG51bGwsIFt2YWx1ZV0uY29uY2F0KGF0dGFjaGVkKSksIGF0dGFjaGVkLCBmYWlsZWQpO1xuICAgICAgfSxcbiAgICAgIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICBpdGVyYXRlKGl0ZXJhdG9yLCBsaXN0ZW5lci5hcHBseShudWxsLCBbdmFsdWVdLmNvbmNhdChhdHRhY2hlZCkpLCBhdHRhY2hlZCwgdHJ1ZSk7XG4gICAgICB9XG4gICAgKTtcbiAgICByZXR1cm47XG4gIH1cbiAgaXRlcmF0ZShpdGVyYXRvciwgbGlzdGVuZXIuYXBwbHkobnVsbCwgW3ZhbHVlXS5jb25jYXQoYXR0YWNoZWQpKSwgYXR0YWNoZWQsIGZhaWxlZCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFZhbHZlIHtcbiAgY29uc3RydWN0b3IoZXhlY3V0b3IpIHtcbiAgICB0aGlzLnN0YXJ0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLmF0dGFjaGVkID0gW107XG4gICAgdGhpcy5saXN0ZW5lcnMgPSBbXTtcbiAgICB0aGlzLmV4ZWN1dG9yID0gZXhlY3V0b3I7XG4gIH1cblxuICBleGVjdXRlKCkge1xuICAgIC8vIEl0ZXJhdGUgb3ZlciBsaXN0ZW5lcnMgb24gbmV4dCBydW4gb2ZcbiAgICAvLyB0aGUganMgZXZlbnQgbG9vcFxuICAgIC8vIFRPRE86IG5vZGUgc3VwcG9ydFxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5leGVjdXRvcihcbiAgICAgICAgLy8gRW1pdFxuICAgICAgICAodmFsdWUpID0+IHtcbiAgICAgICAgICBpdGVyYXRlKHRoaXMubGlzdGVuZXJzW1N5bWJvbC5pdGVyYXRvcl0oKSwgdmFsdWUsIHRoaXMuYXR0YWNoZWQpO1xuICAgICAgICB9LFxuICAgICAgICAvLyBFcnJvclxuICAgICAgICAodmFsdWUpID0+IHtcbiAgICAgICAgICBpdGVyYXRlKHRoaXMubGlzdGVuZXJzW1N5bWJvbC5pdGVyYXRvcl0oKSwgdmFsdWUsIHRoaXMuYXR0YWNoZWQsIHRydWUpO1xuICAgICAgICB9XG4gICAgICApO1xuICAgIH0sIDEpO1xuICB9XG5cbiAgLy9UT0RPOiBlcnJvciBzY2VuYXJpb1xuICBzdGF0aWMgY3JlYXRlKGV4ZWN1dG9yKSB7XG4gICAgaWYoZXhlY3V0b3IudGhlbikge1xuICAgICAgcmV0dXJuIG5ldyBWYWx2ZShmdW5jdGlvbiAoZW1pdCkge1xuICAgICAgICBleGVjdXRvci50aGVuKGVtaXQpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVmFsdmUoZXhlY3V0b3IpO1xuICB9XG5cbiAgLy9UT0RPOiBlcnJvciBzY2VuYXJpb1xuICBzdGF0aWMgYWxsKHRoZW5hYmxlcykge1xuICAgIHJldHVybiBoYW5kbGVBbGwodGhlbmFibGVzKTtcbiAgfVxuXG4gIHN0YXRpYyBhcHBseUFsbCh0aGVuYWJsZXMpIHtcbiAgICByZXR1cm4gaGFuZGxlQWxsKHRoZW5hYmxlcywgdHJ1ZSk7XG4gIH1cblxuICBjbG9uZShvblN1Y2Nlc3MsIG9uRmFpbHVyZSkge1xuICAgIHZhciBuZXdWYWx2ZSA9IG5ldyBWYWx2ZSh0aGlzLmV4ZWN1dG9yKTtcbiAgICBuZXdWYWx2ZS5saXN0ZW5lcnMgPSBjbG9uZUFycmF5KHRoaXMubGlzdGVuZXJzKTtcbiAgICBuZXdWYWx2ZS5hdHRhY2hlZCA9IGNsb25lQXJyYXkodGhpcy5hdHRhY2hlZCk7XG4gICAgbmV3VmFsdmUuc3RhcnRlZCA9IHRoaXMuc3RhcnRlZDtcbiAgICByZXR1cm4gKG9uU3VjY2VzcykgPyBuZXdWYWx2ZS50aGVuKG9uU3VjY2Vzcywgb25GYWlsdXJlKSA6IG5ld1ZhbHZlO1xuICB9XG5cbiAgYXR0YWNoKHZhbHVlKSB7XG4gICAgdGhpcy5hdHRhY2hlZC5wdXNoKHZhbHVlKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHRoZW4ob25TdWNjZXNzLCBvbkZhaWx1cmUpIHtcbiAgICBpZih0eXBlb2Ygb25TdWNjZXNzICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyAnVmFsdmU6IHRoZW4oKSByZXF1aXJlcyBhIGZ1bmN0aW9uIGFzIGZpcnN0IGFyZ3VtZW50LidcbiAgICB9XG4gICAgdGhpcy5saXN0ZW5lcnMucHVzaCh7XG4gICAgICBzdWNjZXNzOiBvblN1Y2Nlc3MsXG4gICAgICBmYWlsOiBvbkZhaWx1cmUgfHwgZnVuY3Rpb24gKHZhbHVlKSB7IHJldHVybiB2YWx1ZTsgfVxuICAgIH0pO1xuXG4gICAgaWYoIXRoaXMuc3RhcnRlZCkge1xuICAgICAgdGhpcy5leGVjdXRlKCk7XG4gICAgICB0aGlzLnN0YXJ0ZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IHNoYXVud2VzdCBvbiA3LzgvMTUuXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGZsaXAgKGZuKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmdzLnJldmVyc2UoKSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBvc2UgKC4uLmZucykge1xuICByZXR1cm4gZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgIHJldHVybiBmbnMucmVkdWNlUmlnaHQoZnVuY3Rpb24gKHJlc3VsdCwgZm4pIHtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoaXMsIHJlc3VsdCk7XG4gICAgfSwgcmVzdWx0KTtcbiAgfTtcbn1cblxuZXhwb3J0IHZhciBzZXF1ZW5jZSA9IGZsaXAoY29tcG9zZSk7XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgc2hhdW53ZXN0IG9uIDUvOS8xNS5cbiAqL1xuXG5pbXBvcnQgZmV0Y2hKU09OIGZyb20gJy4uL2VuZ2luZS9zY2hlbWEvZmV0Y2gtc2NoZW1hLmpzJztcbmltcG9ydCBnZXRJbWFnZSBmcm9tICcuLi9lbmdpbmUvaW1hZ2UtbG9hZGVyLmpzJztcbmltcG9ydCBnZXRTcHJpdGVTY2hlbWEgZnJvbSAnLi4vc2NoZW1hL3Nwcml0ZS1zY2hlbWEuanMnO1xuaW1wb3J0IHNwcml0ZUFuaW1hdGlvbiBmcm9tICcuLi9hbmltYXRpb24vc3ByaXRlLWFuaW1hdGlvbi5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdldFNjZW5lU2NoZW1hKHVyaSkge1xuICByZXR1cm4gZmV0Y2hKU09OKHVyaSlcbiAgICAudGhlbihmdW5jdGlvbiAoc2NlbmUpIHtcbiAgICAgIHJldHVybiBnZXRJbWFnZShzY2VuZS5iYWNrZ3JvdW5kLmJhY2tncm91bmRVcmwpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uIChiYWNrZ3JvdW5kSW1hZ2UpIHtcbiAgICAgICAgICBzY2VuZS5iYWNrZ3JvdW5kSW1hZ2UgPSBiYWNrZ3JvdW5kSW1hZ2U7XG4gICAgICAgICAgcmV0dXJuIGdldFNwcml0ZVR5cGVzKHNjZW5lLnNwcml0ZXMpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoc3ByaXRlcykge1xuICAgICAgICAgICAgICBzY2VuZS5zcHJpdGVzID0gc3ByaXRlcztcbiAgICAgICAgICAgICAgcmV0dXJuIHNjZW5lO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0pXG4gICAgLnRoZW4oZnVuY3Rpb24gKHNjZW5lKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmZyZWV6ZShzY2VuZSk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFNwcml0ZVR5cGVzKHNwcml0ZXMpIHtcbiAgcmV0dXJuIFByb21pc2UuYWxsKHNwcml0ZXMubWFwKGdldFNwcml0ZVR5cGUpKTtcbn1cblxuZnVuY3Rpb24gZ2V0U3ByaXRlVHlwZShzcHJpdGUpIHtcbiAgcmV0dXJuIGdldFNwcml0ZVNjaGVtYShzcHJpdGUuc3JjVXJsKVxuICAgIC50aGVuKGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgIHNwcml0ZS50eXBlID0gdHlwZTtcbiAgICAgIC8vc3ByaXRlLmFuaW1hdGlvbiA9IHNwcml0ZUFuaW1hdGlvbih0eXBlLmZyYW1lU2V0KTtcbiAgICAgIHNwcml0ZS5hbmltYXRpb24gPSB7fTtcbiAgICAgIHNwcml0ZS52ZWxvY2l0eVggPSAwO1xuICAgICAgc3ByaXRlLnZlbG9jaXR5WSA9IDUwMDtcbiAgICAgIHNwcml0ZS5hY2NlbGVyYXRpb25YID0gMDtcbiAgICAgIHNwcml0ZS5hY2NlbGVyYXRpb25ZID0gMDtcbiAgICAgIHNwcml0ZS5tYXhWZWxvY2l0eVggPSA1MDA7XG4gICAgICBzcHJpdGUubWF4VmVsb2NpdHlZID0gNTAwO1xuICAgICAgc3ByaXRlLmZyaWN0aW9uWCA9IDAuOTk7XG4gICAgICBzcHJpdGUuZnJpY3Rpb25ZID0gMC41MDtcbiAgICAgIHJldHVybiBzcHJpdGU7XG4gICAgfSk7XG59XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgc2hhdW53ZXN0IG9uIDUvOS8xNS5cbiAqL1xuXG5pbXBvcnQgZnJhbWVTZXQgZnJvbSAnLi4vYW5pbWF0aW9uL2ZyYW1lLXNldC5qcyc7XG5pbXBvcnQgZmV0Y2hKU09OIGZyb20gJy4uL2VuZ2luZS9zY2hlbWEvZmV0Y2gtc2NoZW1hLmpzJztcbmltcG9ydCBnZXRJbWFnZSBmcm9tICcuLi9lbmdpbmUvaW1hZ2UtbG9hZGVyLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0U3ByaXRlU2NoZW1hKHVyaSkge1xuICByZXR1cm4gZmV0Y2hKU09OKHVyaSlcbiAgICAudGhlbihmdW5jdGlvbiAoc3ByaXRlKSB7XG4gICAgICByZXR1cm4gZ2V0SW1hZ2Uoc3ByaXRlLnNwcml0ZVNoZWV0VXJsKVxuICAgICAgICAudGhlbihmdW5jdGlvbiAoc3ByaXRlU2hlZXQpIHtcbiAgICAgICAgICBzcHJpdGUuc3ByaXRlU2hlZXQgPSBzcHJpdGVTaGVldDtcbiAgICAgICAgICBzcHJpdGUuZnJhbWVTZXQgPSBmcmFtZVNldChzcHJpdGUsIHNwcml0ZVNoZWV0KTtcbiAgICAgICAgICByZXR1cm4gc3ByaXRlO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn1cbiIsIi8qKlxuICogQ3JlYXRlZCBieSBzaGF1bndlc3Qgb24gNS80LzE1LlxuICovXG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgeDogMCxcbiAgeTogMCxcbiAgbWFyZ2luTGVmdDogNjQsXG4gIG1hcmdpblJpZ2h0OiA2NCxcbiAgd2lkdGg6IDMwMCxcbiAgaGVpZ2h0OiA0MDBcbn07Il19

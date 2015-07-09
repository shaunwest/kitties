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

var scene = _getSceneSchema2['default']('assets/kitty-world.json');

function applyInputToSprite(inputs, sprite) {
  if (inputs[37]) {
    sprite.velocityX = -100;
  } else if (inputs[39]) {
    sprite.velocityX = 100;
  }
}

function getPositionFromMaxMargin(spritePos, spriteSize, maxMargin) {
  return spritePos + spriteSize - maxMargin;
}

function getPositionFromMinMargin(spritePos, minMargin) {
  return spritePos - minMargin;
}

/*function applyTargetToViewport(diff, velocity, spritePos, spriteSize, minMargin, maxMargin) {
  if (diff > 0 && velocity > 0) {
    return (spritePos + spriteSize) - maxMargin;
  } else if (diff < 0 && velocity < 0) {
    return spritePos - minMargin;
  }
}*/

/*function applyTargetToViewport(sprite, viewport) {
  const marginRight = viewport.width - viewport.marginRight;
  const diffX = getInnerDiff(
    sprite.x,
    sprite.width,
    viewport.x + viewport.marginLeft,
    viewport.x + marginRight
  );

  if (diffX > 0 && sprite.velocityX > 0) {
    viewport.x = (sprite.x + sprite.width) - marginRight;
  } else if (diffX < 0 && sprite.velocityX < 0) {
    viewport.x = sprite.x - viewport.marginLeft;
  }

  console.log(diffX);
}*/

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

/*function getInnerDiff(val, size, minBound, maxBound) {
  const max = val + size;
  return (val < minBound && max > minBound && val - minBound ||
    val < maxBound && max > maxBound && max - maxBound ||
    0);
}*/

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

/*function applySceneBounds(bounds, sprite) {
  const diffX = getInnerDiff(sprite.x, sprite.width, 0, bounds.width);
  sprite.x = resolveCollision(diffX, sprite.x);

  const diffY = getInnerDiff(sprite.y, sprite.height, 0, bounds.height);
  sprite.y = resolveCollision(diffY, sprite.y);
}*/

function getCollisonResolve(colliders, sprite) {
  return colliders.reduce(function (resolve, collider) {
    var diffX = sprite.y >= collider.y && sprite.y <= collider.y + collider.height ? getOuterDiff(sprite.x, sprite.width, collider.x, collider.x + collider.width) : 0;

    resolve.x = diffX ? resolveCollision(diffX, sprite.x) : resolve.x;

    var diffY = sprite.x >= collider.x && sprite.x <= collider.x + collider.width ? getOuterDiff(sprite.y, sprite.height, collider.y, collider.y + collider.height) : 0;

    resolve.y = diffY ? resolveCollision(diffY, sprite.y) : resolve.y;

    return resolve;
  }, { x: sprite.x, y: sprite.y });
}

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
  var sprites = Object.freeze(scene.sprites);
  var player = sprites[0];

  getFrames(function (elapsed) {
    _clearContext.clearContext(context2d, canvas.width, canvas.height);

    applyInputToSprite(getInputs(), player);

    sprites.forEach(function (sprite) {
      sprite.velocityX = getVelocityX(sprite, elapsed);
      sprite.x = getPositionDelta(sprite.x, sprite.velocityX, elapsed);

      sprite.velocityY = getVelocityY(sprite, elapsed);
      sprite.y = getPositionDelta(sprite.y, sprite.velocityY, elapsed);

      var diffX = getInnerDiff(sprite.x, sprite.width, 0, sceneBounds.width);
      sprite.x = resolveCollision(diffX, sprite.x);

      var diffY = getInnerDiff(sprite.y, sprite.height, 0, sceneBounds.height);
      sprite.y = resolveCollision(diffY, sprite.y);

      var resolve = getCollisonResolve(colliders, sprite);
      sprite.x = resolve.x;
      sprite.y = resolve.y;

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

},{"./canvas-renderer.js":4,"./engine/fragments.js":6,"./engine/frame.js":7,"./engine/input.js":9,"./schema/scene-schema.js":14,"./viewport.js":16}],2:[function(require,module,exports){
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

},{"../animation/sprite-animation.js":3,"../engine/image-loader.js":8,"../engine/schema/fetch-schema.js":11,"../schema/sprite-schema.js":15}],15:[function(require,module,exports){
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

},{"../animation/frame-set.js":2,"../engine/image-loader.js":8,"../engine/schema/fetch-schema.js":11}],16:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvbWFpbi5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy9hbmltYXRpb24vZnJhbWUtc2V0LmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2FuaW1hdGlvbi9zcHJpdGUtYW5pbWF0aW9uLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2NhbnZhcy1yZW5kZXJlci5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy9lbmdpbmUvY29tbW9uLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9mcmFnbWVudHMuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL2ZyYW1lLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9pbWFnZS1sb2FkZXIuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL2lucHV0LmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9zY2hlZHVsZXIuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL3NjaGVtYS9mZXRjaC1zY2hlbWEuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL3V0aWwuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL3ZhbHZlLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL3NjaGVtYS9zY2VuZS1zY2hlbWEuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvc2NoZW1hL3Nwcml0ZS1zY2hlbWEuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvdmlld3BvcnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozt3QkNJdUIsdUJBQXVCOzs4QkFDbkIsMEJBQTBCOzs7O3FCQUNuQyxtQkFBbUI7Ozs7cUJBQ25CLG1CQUFtQjs7Ozt3QkFDaEIsZUFBZTs7Ozs0QkFDVCxzQkFBc0I7O0FBRWpELElBQU0sS0FBSyxHQUFHLDRCQUFlLHlCQUF5QixDQUFDLENBQUM7O0FBRXhELFNBQVMsa0JBQWtCLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRTtBQUMxQyxNQUFJLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUNkLFVBQU0sQ0FBQyxTQUFTLEdBQUcsQ0FBQyxHQUFHLENBQUM7R0FDekIsTUFBTSxJQUFJLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUNyQixVQUFNLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQztHQUN4QjtDQUNGOztBQUVELFNBQVMsd0JBQXdCLENBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUU7QUFDbEUsU0FBTyxBQUFDLFNBQVMsR0FBRyxVQUFVLEdBQUksU0FBUyxDQUFDO0NBQzdDOztBQUVELFNBQVMsd0JBQXdCLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRTtBQUN0RCxTQUFPLFNBQVMsR0FBRyxTQUFTLENBQUM7Q0FDOUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUE0QkQsU0FBUyxhQUFhLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUU7QUFDbEQsU0FBTyxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0NBQ25EOztBQUVELFNBQVMsSUFBSSxDQUFDLFFBQVEsRUFBRSxVQUFVLEVBQUU7QUFDbEMsU0FBTyxBQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsVUFB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QUFFLENBQUM7QUFDSixHQUFDLEVBQUUsQ0FBQztBQUNKLFlBQVUsRUFBRSxFQUFFO0FBQ2QsYUFBVyxFQUFFLEVBQUU7QUFDZixPQUFLLEVBQUUsR0FBRztBQUNWLFFBQU0sRUFBRSxHQUFHO0NBQ1oiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgU2hhdW4gb24gNC8yMy8yMDE1LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7RnJhZ21lbnR9IGZyb20gJy4vZW5naW5lL2ZyYWdtZW50cy5qcyc7XHJcbmltcG9ydCBnZXRTY2VuZVNjaGVtYSBmcm9tICcuL3NjaGVtYS9zY2VuZS1zY2hlbWEuanMnO1xyXG5pbXBvcnQgRnJhbWUgZnJvbSAnLi9lbmdpbmUvZnJhbWUuanMnO1xyXG5pbXBvcnQgSW5wdXQgZnJvbSAnLi9lbmdpbmUvaW5wdXQuanMnO1xyXG5pbXBvcnQgVmlld3BvcnQgZnJvbSAnLi92aWV3cG9ydC5qcyc7XHJcbmltcG9ydCB7Y2xlYXJDb250ZXh0fSBmcm9tICcuL2NhbnZhcy1yZW5kZXJlci5qcyc7XHJcblxyXG5jb25zdCBzY2VuZSA9IGdldFNjZW5lU2NoZW1hKCdhc3NldHMva2l0dHktd29ybGQuanNvbicpO1xyXG5cclxuZnVuY3Rpb24gYXBwbHlJbnB1dFRvU3ByaXRlKGlucHV0cywgc3ByaXRlKSB7XHJcbiAgaWYgKGlucHV0c1szN10pIHtcclxuICAgIHNwcml0ZS52ZWxvY2l0eVggPSAtMTAwO1xyXG4gIH0gZWxzZSBpZiAoaW5wdXRzWzM5XSkge1xyXG4gICAgc3ByaXRlLnZlbG9jaXR5WCA9IDEwMDtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFBvc2l0aW9uRnJvbU1heE1hcmdpbihzcHJpdGVQb3MsIHNwcml0ZVNpemUsIG1heE1hcmdpbikge1xyXG4gIHJldHVybiAoc3ByaXRlUG9zICsgc3ByaXRlU2l6ZSkgLSBtYXhNYXJnaW47XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFBvc2l0aW9uRnJvbU1pbk1hcmdpbihzcHJpdGVQb3MsIG1pbk1hcmdpbikge1xyXG4gIHJldHVybiBzcHJpdGVQb3MgLSBtaW5NYXJnaW47XHJcbn1cclxuXHJcbi8qZnVuY3Rpb24gYXBwbHlUYXJnZXRUb1ZpZXdwb3J0KGRpZmYsIHZlbG9jaXR5LCBzcHJpdGVQb3MsIHNwcml0ZVNpemUsIG1pbk1hcmdpbiwgbWF4TWFyZ2luKSB7XHJcbiAgaWYgKGRpZmYgPiAwICYmIHZlbG9jaXR5ID4gMCkge1xyXG4gICAgcmV0dXJuIChzcHJpdGVQb3MgKyBzcHJpdGVTaXplKSAtIG1heE1hcmdpbjtcclxuICB9IGVsc2UgaWYgKGRpZmYgPCAwICYmIHZlbG9jaXR5IDwgMCkge1xyXG4gICAgcmV0dXJuIHNwcml0ZVBvcyAtIG1pbk1hcmdpbjtcclxuICB9XHJcbn0qL1xyXG5cclxuLypmdW5jdGlvbiBhcHBseVRhcmdldFRvVmlld3BvcnQoc3ByaXRlLCB2aWV3cG9ydCkge1xyXG4gIGNvbnN0IG1hcmdpblJpZ2h0ID0gdmlld3BvcnQud2lkdGggLSB2aWV3cG9ydC5tYXJnaW5SaWdodDtcclxuICBjb25zdCBkaWZmWCA9IGdldElubmVyRGlmZihcclxuICAgIHNwcml0ZS54LFxyXG4gICAgc3ByaXRlLndpZHRoLFxyXG4gICAgdmlld3BvcnQueCArIHZpZXdwb3J0Lm1hcmdpbkxlZnQsXHJcbiAgICB2aWV3cG9ydC54ICsgbWFyZ2luUmlnaHRcclxuICApO1xyXG5cclxuICBpZiAoZGlmZlggPiAwICYmIHNwcml0ZS52ZWxvY2l0eVggPiAwKSB7XHJcbiAgICB2aWV3cG9ydC54ID0gKHNwcml0ZS54ICsgc3ByaXRlLndpZHRoKSAtIG1hcmdpblJpZ2h0O1xyXG4gIH0gZWxzZSBpZiAoZGlmZlggPCAwICYmIHNwcml0ZS52ZWxvY2l0eVggPCAwKSB7XHJcbiAgICB2aWV3cG9ydC54ID0gc3ByaXRlLnggLSB2aWV3cG9ydC5tYXJnaW5MZWZ0O1xyXG4gIH1cclxuXHJcbiAgY29uc29sZS5sb2coZGlmZlgpO1xyXG59Ki9cclxuXHJcbmZ1bmN0aW9uIGFwcGx5RnJpY3Rpb24odmVsb2NpdHksIGZyaWN0aW9uLCBlbGFwc2VkKSB7XHJcbiAgcmV0dXJuIHZlbG9jaXR5ICogTWF0aC5wb3coMSAtIGZyaWN0aW9uLCBlbGFwc2VkKTtcclxufVxyXG5cclxuZnVuY3Rpb24gaGFsdCh2ZWxvY2l0eSwgaGFsdFRhcmdldCkge1xyXG4gIHJldHVybiAoTWF0aC5hYnModmVsb2NpdHkpIDwgaGFsdFRhcmdldCkgPyAwIDogdmVsb2NpdHk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNsYW1wVmVsb2NpdHkodmVsb2NpdHksIG1heFZlbG9jaXR5KSB7XHJcbiAgcmV0dXJuICh2ZWxvY2l0eSA+IDApID9cclxuICAgIE1hdGgubWluKHZlbG9jaXR5LCBtYXhWZWxvY2l0eSkgOlxyXG4gICAgTWF0aC5tYXgodmVsb2NpdHksIC1tYXhWZWxvY2l0eSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFwcGx5QWNjZWxlcmF0aW9uKHZlbG9jaXR5LCBhY2NlbGVyYXRpb24sIGVsYXBzZWQpIHtcclxuICByZXR1cm4gdmVsb2NpdHkgKyAoYWNjZWxlcmF0aW9uICogZWxhcHNlZCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFBvc2l0aW9uRGVsdGEodmFsLCB2ZWxvY2l0eSwgZWxhcHNlZCkge1xyXG4gIHJldHVybiB2YWwgKyBNYXRoLnJvdW5kKHZlbG9jaXR5ICogZWxhcHNlZCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFZlbG9jaXR5WChzcHJpdGUsIGVsYXBzZWQpIHtcclxuICBjb25zdCB2ZWxYMCA9IGhhbHQoc3ByaXRlLnZlbG9jaXR5WCwgMSk7XHJcbiAgY29uc3QgdmVsWDEgPSBhcHBseUFjY2VsZXJhdGlvbih2ZWxYMCwgc3ByaXRlLmFjY2VsZXJhdGlvblgsIGVsYXBzZWQpO1xyXG4gIGNvbnN0IHZlbFgyID0gYXBwbHlGcmljdGlvbih2ZWxYMSwgc3ByaXRlLmZyaWN0aW9uWCwgZWxhcHNlZCk7XHJcbiAgcmV0dXJuIGNsYW1wVmVsb2NpdHkodmVsWDIsIHNwcml0ZS5tYXhWZWxvY2l0eVgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRWZWxvY2l0eVkoc3ByaXRlLCBlbGFwc2VkKSB7XHJcbiAgY29uc3QgdmVsWTAgPSBoYWx0KHNwcml0ZS52ZWxvY2l0eVksIDEpO1xyXG4gIGNvbnN0IHZlbFkxID0gYXBwbHlBY2NlbGVyYXRpb24odmVsWTAsIHNwcml0ZS5hY2NlbGVyYXRpb25ZLCBlbGFwc2VkKTtcclxuICBjb25zdCB2ZWxZMiA9IGFwcGx5RnJpY3Rpb24odmVsWTEsIHNwcml0ZS5mcmljdGlvblksIGVsYXBzZWQpO1xyXG4gIHJldHVybiBjbGFtcFZlbG9jaXR5KHZlbFkyLCBzcHJpdGUubWF4VmVsb2NpdHlZKTtcclxufVxyXG5cclxuLypmdW5jdGlvbiBnZXRJbm5lckRpZmYodmFsLCBzaXplLCBtaW5Cb3VuZCwgbWF4Qm91bmQpIHtcclxuICBjb25zdCBtYXggPSB2YWwgKyBzaXplO1xyXG4gIHJldHVybiAodmFsIDwgbWluQm91bmQgJiYgbWF4ID4gbWluQm91bmQgJiYgdmFsIC0gbWluQm91bmQgfHxcclxuICAgIHZhbCA8IG1heEJvdW5kICYmIG1heCA+IG1heEJvdW5kICYmIG1heCAtIG1heEJvdW5kIHx8XHJcbiAgICAwKTtcclxufSovXHJcblxyXG5mdW5jdGlvbiBnZXRJbm5lckRpZmYodmFsLCBzaXplLCBtaW5Cb3VuZCwgbWF4Qm91bmQpIHtcclxuICBjb25zdCBtYXggPSB2YWwgKyBzaXplO1xyXG4gIHJldHVybiAodmFsIDwgbWluQm91bmQgJiYgdmFsIC0gbWluQm91bmQgfHxcclxuICAgIG1heCA+IG1heEJvdW5kICYmIG1heCAtIG1heEJvdW5kIHx8XHJcbiAgICAwKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0T3V0ZXJEaWZmKHZhbCwgc2l6ZSwgbWluQm91bmQsIG1heEJvdW5kKSB7XHJcbiAgY29uc3QgbWF4ID0gdmFsICsgc2l6ZTtcclxuICByZXR1cm4gKHZhbCA8IG1pbkJvdW5kICYmIG1heCA+IG1pbkJvdW5kICYmIG1heCAtIG1pbkJvdW5kIHx8XHJcbiAgICB2YWwgPCBtYXhCb3VuZCAmJiBtYXggPiBtYXhCb3VuZCAmJiB2YWwgLSBtYXhCb3VuZCB8fFxyXG4gICAgMCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlc29sdmVDb2xsaXNpb24oZGlmZiwgdmFsKSB7XHJcbiAgcmV0dXJuIHZhbCAtIGRpZmY7XHJcbn1cclxuXHJcbi8qZnVuY3Rpb24gYXBwbHlTY2VuZUJvdW5kcyhib3VuZHMsIHNwcml0ZSkge1xyXG4gIGNvbnN0IGRpZmZYID0gZ2V0SW5uZXJEaWZmKHNwcml0ZS54LCBzcHJpdGUud2lkdGgsIDAsIGJvdW5kcy53aWR0aCk7XHJcbiAgc3ByaXRlLnggPSByZXNvbHZlQ29sbGlzaW9uKGRpZmZYLCBzcHJpdGUueCk7XHJcblxyXG4gIGNvbnN0IGRpZmZZID0gZ2V0SW5uZXJEaWZmKHNwcml0ZS55LCBzcHJpdGUuaGVpZ2h0LCAwLCBib3VuZHMuaGVpZ2h0KTtcclxuICBzcHJpdGUueSA9IHJlc29sdmVDb2xsaXNpb24oZGlmZlksIHNwcml0ZS55KTtcclxufSovXHJcblxyXG5mdW5jdGlvbiBnZXRDb2xsaXNvblJlc29sdmUoY29sbGlkZXJzLCBzcHJpdGUpIHtcclxuICByZXR1cm4gY29sbGlkZXJzXHJcbiAgICAucmVkdWNlKGZ1bmN0aW9uIChyZXNvbHZlLCBjb2xsaWRlcikge1xyXG4gICAgICBjb25zdCBkaWZmWCA9IChzcHJpdGUueSA+PSBjb2xsaWRlci55ICYmIHNwcml0ZS55IDw9IGNvbGxpZGVyLnkgKyBjb2xsaWRlci5oZWlnaHQpID9cclxuICAgICAgICBnZXRPdXRlckRpZmYoXHJcbiAgICAgICAgICBzcHJpdGUueCxcclxuICAgICAgICAgIHNwcml0ZS53aWR0aCxcclxuICAgICAgICAgIGNvbGxpZGVyLngsXHJcbiAgICAgICAgICBjb2xsaWRlci54ICsgY29sbGlkZXIud2lkdGhcclxuICAgICAgICApIDogMDtcclxuXHJcbiAgICAgIHJlc29sdmUueCA9IChkaWZmWCkgPyByZXNvbHZlQ29sbGlzaW9uKGRpZmZYLCBzcHJpdGUueCkgOiByZXNvbHZlLng7XHJcblxyXG4gICAgICBjb25zdCBkaWZmWSA9IChzcHJpdGUueCA+PSBjb2xsaWRlci54ICYmIHNwcml0ZS54IDw9IGNvbGxpZGVyLnggKyBjb2xsaWRlci53aWR0aCkgP1xyXG4gICAgICAgIGdldE91dGVyRGlmZihcclxuICAgICAgICAgIHNwcml0ZS55LFxyXG4gICAgICAgICAgc3ByaXRlLmhlaWdodCxcclxuICAgICAgICAgIGNvbGxpZGVyLnksXHJcbiAgICAgICAgICBjb2xsaWRlci55ICsgY29sbGlkZXIuaGVpZ2h0XHJcbiAgICAgICAgKSA6IDA7XHJcblxyXG4gICAgICByZXNvbHZlLnkgPSAoZGlmZlkpID8gcmVzb2x2ZUNvbGxpc2lvbihkaWZmWSwgc3ByaXRlLnkpIDogcmVzb2x2ZS55O1xyXG5cclxuICAgICAgcmV0dXJuIHJlc29sdmU7XHJcbiAgICB9LCB7eDogc3ByaXRlLngsIHk6IHNwcml0ZS55fSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFwcGx5QW5pbWF0aW9uKHNwcml0ZSkge1xyXG4gIGNvbnN0IHNlcXVlbmNlID0gc3ByaXRlLnR5cGUuZnJhbWVTZXRbZ2V0QW5pbWF0aW9uKHNwcml0ZSldO1xyXG4gIGNvbnN0IGZyYW1lSW5kZXggPSBnZXRGcmFtZUluZGV4KHNwcml0ZS5hbmltYXRpb24uY3VycmVudEluZGV4LCBzZXF1ZW5jZSk7XHJcbiAgc3ByaXRlLmFuaW1hdGlvbi5jdXJyZW50SW5kZXggPSBmcmFtZUluZGV4O1xyXG5cclxuICByZXR1cm4gZ2V0RnJhbWUoZnJhbWVJbmRleCwgc2VxdWVuY2UpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZyYW1lSW5kZXgoY3VycmVudEluZGV4LCBzZXF1ZW5jZSkge1xyXG4gIGNvbnN0IGluZGV4ID0gY3VycmVudEluZGV4IHx8IDA7XHJcbiAgcmV0dXJuIChpbmRleCA8IHNlcXVlbmNlLmZyYW1lcy5sZW5ndGggLSAxKSA/XHJcbiAgICBpbmRleCArIDEgOiAwO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRBbmltYXRpb24oc3ByaXRlKSB7XHJcbiAgcmV0dXJuICdydW4nO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGcmFtZShpbmRleCwgc2VxdWVuY2UpIHtcclxuICByZXR1cm4gc2VxdWVuY2UuZnJhbWVzW2luZGV4XTtcclxufVxyXG5cclxuZnVuY3Rpb24gcmVuZGVyKGNvbnRleHQyZCwgcG9pbnQsIGltYWdlLCB2aWV3cG9ydCkge1xyXG4gIGlmKCFpbWFnZSkge1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuICBjb250ZXh0MmQuZHJhd0ltYWdlKFxyXG4gICAgaW1hZ2UsXHJcbiAgICBwb2ludC54IC0gdmlld3BvcnQueCB8fCAwLFxyXG4gICAgcG9pbnQueSAtIHZpZXdwb3J0LnkgfHwgMFxyXG4gICk7XHJcbn1cclxuXHJcbmNvbnN0IGdldElucHV0cyA9IElucHV0KCk7XHJcbmNvbnN0IGdldEZyYW1lcyA9IEZyYW1lKCk7XHJcbmNvbnN0IHZpZXdwb3J0ID0gVmlld3BvcnQ7XHJcbmNvbnN0IGZwc1VJID0gRnJhZ21lbnQoJ2ZwcycpO1xyXG5cclxuZ2V0RnJhbWVzKGZ1bmN0aW9uIChlbGFwc2VkLCBmcHMpIHtcclxuICBmcHNVSS50ZXh0Q29udGVudCA9IGZwcztcclxuICByZXR1cm4gdHJ1ZTtcclxufSk7XHJcblxyXG5zY2VuZVxyXG4gIC50aGVuKGZ1bmN0aW9uIChzY2VuZSkge1xyXG4gICAgY29uc3Qgc2NlbmVCb3VuZHMgPSBPYmplY3QuZnJlZXplKHtcclxuICAgICAgd2lkdGg6IHNjZW5lLnNjZW5lV2lkdGgsXHJcbiAgICAgIGhlaWdodDogc2NlbmUuc2NlbmVIZWlnaHRcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IGNhbnZhcyA9IEZyYWdtZW50KCdjYW52YXMtZW50aXRpZXMnKTtcclxuICAgIGNvbnN0IGNvbnRleHQyZCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgY29uc3QgY29sbGlkZXJzID0gT2JqZWN0LmZyZWV6ZShzY2VuZS5jb2xsaWRlcnMpO1xyXG4gICAgY29uc3Qgc3ByaXRlcyA9IE9iamVjdC5mcmVlemUoc2NlbmUuc3ByaXRlcyk7XHJcbiAgICBjb25zdCBwbGF5ZXIgPSBzcHJpdGVzWzBdO1xyXG5cclxuICAgIGdldEZyYW1lcyhmdW5jdGlvbiAoZWxhcHNlZCkge1xyXG4gICAgICBjbGVhckNvbnRleHQoY29udGV4dDJkLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xyXG5cclxuICAgICAgYXBwbHlJbnB1dFRvU3ByaXRlKGdldElucHV0cygpLCBwbGF5ZXIpO1xyXG5cclxuICAgICAgc3ByaXRlcy5mb3JFYWNoKGZ1bmN0aW9uIChzcHJpdGUpIHtcclxuICAgICAgICBzcHJpdGUudmVsb2NpdHlYID0gZ2V0VmVsb2NpdHlYKHNwcml0ZSwgZWxhcHNlZCk7XHJcbiAgICAgICAgc3ByaXRlLnggPSBnZXRQb3NpdGlvbkRlbHRhKHNwcml0ZS54LCBzcHJpdGUudmVsb2NpdHlYLCBlbGFwc2VkKTtcclxuXHJcbiAgICAgICAgc3ByaXRlLnZlbG9jaXR5WSA9IGdldFZlbG9jaXR5WShzcHJpdGUsIGVsYXBzZWQpO1xyXG4gICAgICAgIHNwcml0ZS55ID0gZ2V0UG9zaXRpb25EZWx0YShzcHJpdGUueSwgc3ByaXRlLnZlbG9jaXR5WSwgZWxhcHNlZCk7XHJcblxyXG4gICAgICAgIGNvbnN0IGRpZmZYID0gZ2V0SW5uZXJEaWZmKHNwcml0ZS54LCBzcHJpdGUud2lkdGgsIDAsIHNjZW5lQm91bmRzLndpZHRoKTtcclxuICAgICAgICBzcHJpdGUueCA9IHJlc29sdmVDb2xsaXNpb24oZGlmZlgsIHNwcml0ZS54KTtcclxuXHJcbiAgICAgICAgY29uc3QgZGlmZlkgPSBnZXRJbm5lckRpZmYoc3ByaXRlLnksIHNwcml0ZS5oZWlnaHQsIDAsIHNjZW5lQm91bmRzLmhlaWdodCk7XHJcbiAgICAgICAgc3ByaXRlLnkgPSByZXNvbHZlQ29sbGlzaW9uKGRpZmZZLCBzcHJpdGUueSk7XHJcblxyXG4gICAgICAgIGNvbnN0IHJlc29sdmUgPSBnZXRDb2xsaXNvblJlc29sdmUoY29sbGlkZXJzLCBzcHJpdGUpO1xyXG4gICAgICAgIHNwcml0ZS54ID0gcmVzb2x2ZS54O1xyXG4gICAgICAgIHNwcml0ZS55ID0gcmVzb2x2ZS55O1xyXG5cclxuICAgICAgICBpZiAoc3ByaXRlID09PSBwbGF5ZXIpIHtcclxuICAgICAgICAgIGNvbnN0IG1pbk1hcmdpbiA9IHZpZXdwb3J0Lm1hcmdpbkxlZnQ7XHJcbiAgICAgICAgICBjb25zdCBtYXhNYXJnaW4gPSB2aWV3cG9ydC53aWR0aCAtIHZpZXdwb3J0Lm1hcmdpblJpZ2h0O1xyXG4gICAgICAgICAgY29uc3Qgdmlld3BvcnREaWZmWCA9IGdldElubmVyRGlmZihcclxuICAgICAgICAgICAgc3ByaXRlLngsXHJcbiAgICAgICAgICAgIHNwcml0ZS53aWR0aCxcclxuICAgICAgICAgICAgdmlld3BvcnQueCArIG1pbk1hcmdpbixcclxuICAgICAgICAgICAgdmlld3BvcnQueCArIG1heE1hcmdpblxyXG4gICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICBpZiAodmlld3BvcnREaWZmWCA+IDAgJiYgc3ByaXRlLnZlbG9jaXR5WCA+IDApIHtcclxuICAgICAgICAgICAgdmlld3BvcnQueCA9IGdldFBvc2l0aW9uRnJvbU1heE1hcmdpbihzcHJpdGUueCwgc3ByaXRlLndpZHRoLCBtYXhNYXJnaW4pO1xyXG4gICAgICAgICAgfSBlbHNlIGlmICh2aWV3cG9ydERpZmZYIDwgMCAmJiBzcHJpdGUudmVsb2NpdHlYIDwgMCkge1xyXG4gICAgICAgICAgICB2aWV3cG9ydC54ID0gZ2V0UG9zaXRpb25Gcm9tTWluTWFyZ2luKHNwcml0ZS54LCBtaW5NYXJnaW4pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZnJhbWUgPSBhcHBseUFuaW1hdGlvbihzcHJpdGUpO1xyXG4gICAgICAgIGNvbnN0IHBvcyA9IHt4OiBzcHJpdGUueCwgeTogc3ByaXRlLnl9O1xyXG5cclxuICAgICAgICByZW5kZXIoY29udGV4dDJkLCBwb3MsIGZyYW1lLCB2aWV3cG9ydCk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gc2NlbmU7XHJcbiAgfSlcclxuICAudGhlbihmdW5jdGlvbiAoc2NlbmUpIHtcclxuICAgIGNvbnN0IGJhY2tncm91bmRJbWFnZSA9IHNjZW5lLmJhY2tncm91bmRJbWFnZTtcclxuXHJcbiAgICBjb25zdCBjYW52YXMgPSBGcmFnbWVudCgnY2FudmFzLWJhY2tncm91bmQnKTtcclxuICAgIGNvbnN0IGNvbnRleHQyZCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG5cclxuICAgIGdldEZyYW1lcyhmdW5jdGlvbiAoKSB7XHJcbiAgICAgIGNsZWFyQ29udGV4dChjb250ZXh0MmQsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XHJcbiAgICAgIHJlbmRlcihjb250ZXh0MmQsIHt4OiAwLCB5OiAwfSwgYmFja2dyb3VuZEltYWdlLCB2aWV3cG9ydCk7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gc2NlbmU7XHJcbiAgfSk7XHJcbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IFNoYXVuIG9uIDMvMS8xNVxyXG4gKlxyXG4gKi9cclxuXHJcbmltcG9ydCB7Z2V0Q2FudmFzLCBnZXRUcmFuc3BhcmVudEltYWdlfSBmcm9tICcuLi9lbmdpbmUvY29tbW9uLmpzJztcclxuXHJcbmNvbnN0IERFRkFVTFRfUkFURSA9IDU7XHJcblxyXG5mdW5jdGlvbiBidWlsZEZyYW1lU2VxdWVuY2UoZnJhbWVTZXREZWZpbml0aW9uLCBmcmFtZVNpemUsIHNwcml0ZVNoZWV0KSB7XHJcbiAgdmFyIGZyYW1lV2lkdGggPSBmcmFtZVNpemUud2lkdGg7XHJcbiAgdmFyIGZyYW1lSGVpZ2h0ID0gZnJhbWVTaXplLmhlaWdodDtcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIHJhdGU6IGZyYW1lU2V0RGVmaW5pdGlvbi5yYXRlIHx8IERFRkFVTFRfUkFURSxcclxuICAgIGZyYW1lczogZnJhbWVTZXREZWZpbml0aW9uLmZyYW1lc1xyXG4gICAgICAubWFwKGZ1bmN0aW9uKGZyYW1lRGVmaW5pdGlvbikge1xyXG4gICAgICAgIHZhciBmcmFtZSA9IGdldENhbnZhcyhmcmFtZVdpZHRoLCBmcmFtZUhlaWdodCk7XHJcblxyXG4gICAgICAgIGZyYW1lXHJcbiAgICAgICAgICAuZ2V0Q29udGV4dCgnMmQnKVxyXG4gICAgICAgICAgLmRyYXdJbWFnZShcclxuICAgICAgICAgICAgc3ByaXRlU2hlZXQsXHJcbiAgICAgICAgICAgIGZyYW1lRGVmaW5pdGlvbi54LCBmcmFtZURlZmluaXRpb24ueSxcclxuICAgICAgICAgICAgZnJhbWVXaWR0aCwgZnJhbWVIZWlnaHQsXHJcbiAgICAgICAgICAgIDAsIDAsXHJcbiAgICAgICAgICAgIGZyYW1lV2lkdGgsIGZyYW1lSGVpZ2h0XHJcbiAgICAgICAgICApO1xyXG5cclxuICAgICAgICByZXR1cm4gZnJhbWU7XHJcbiAgICAgIH0pXHJcbiAgfTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKHNwcml0ZURlZmluaXRpb24sIHNwcml0ZVNoZWV0KSB7XHJcbiAgcmV0dXJuIE9iamVjdFxyXG4gICAgLmtleXMoc3ByaXRlRGVmaW5pdGlvbi5hbmltYXRpb25zKVxyXG4gICAgLnJlZHVjZShmdW5jdGlvbihmcmFtZVNldCwgZnJhbWVTZXRJZCkge1xyXG4gICAgICB2YXIgZnJhbWVTZXF1ZW5jZSA9IGJ1aWxkRnJhbWVTZXF1ZW5jZShcclxuICAgICAgICBzcHJpdGVEZWZpbml0aW9uLmFuaW1hdGlvbnNbZnJhbWVTZXRJZF0sXHJcbiAgICAgICAgc3ByaXRlRGVmaW5pdGlvbi5mcmFtZVNpemUsXHJcbiAgICAgICAgc3ByaXRlU2hlZXRcclxuICAgICAgKTtcclxuXHJcbiAgICAgIGZyYW1lU2VxdWVuY2UuZnJhbWVzID0gZnJhbWVTZXF1ZW5jZS5mcmFtZXNcclxuICAgICAgICAubWFwKGZ1bmN0aW9uKGZyYW1lKSB7XHJcbiAgICAgICAgICByZXR1cm4gZ2V0VHJhbnNwYXJlbnRJbWFnZShzcHJpdGVEZWZpbml0aW9uLnRyYW5zcGFyZW50Q29sb3IsIGZyYW1lKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgIGZyYW1lU2V0W2ZyYW1lU2V0SWRdID0gZnJhbWVTZXF1ZW5jZTtcclxuXHJcbiAgICAgIHJldHVybiBmcmFtZVNldDtcclxuICAgIH0sIHt9KTtcclxufTtcclxuIiwiaW1wb3J0IFNjaGVkdWxlciBmcm9tICcuLi9lbmdpbmUvc2NoZWR1bGVyLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChmcmFtZVNldCkge1xyXG4gIHZhciBjdXJyZW50RnJhbWVTZXF1ZW5jZSA9IGZyYW1lU2V0WydydW4nXSwgLy9udWxsLFxyXG4gICAgY3VycmVudEZyYW1lSW5kZXggPSAwLFxyXG4gICAgY3VycmVudEZyYW1lID0gbnVsbCxcclxuICAgIGZyYW1lQ2FsbGJhY2sgPSBudWxsO1xyXG5cclxuICB2YXIgc2NoZWR1bGVySWQgPSBTY2hlZHVsZXIoZnVuY3Rpb24oZGVsdGFUaW1lLCBzZXRSYXRlKSB7XHJcbiAgICBpZighY3VycmVudEZyYW1lU2VxdWVuY2UpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmKCFjdXJyZW50RnJhbWUpIHtcclxuICAgICAgc2V0UmF0ZShjdXJyZW50RnJhbWVTZXF1ZW5jZS5yYXRlKTtcclxuICAgIH1cclxuXHJcbiAgICBjdXJyZW50RnJhbWUgPSBjdXJyZW50RnJhbWVTZXF1ZW5jZS5mcmFtZXNbY3VycmVudEZyYW1lSW5kZXhdO1xyXG4gICAgaWYoZnJhbWVDYWxsYmFjaykge1xyXG4gICAgICBmcmFtZUNhbGxiYWNrKGN1cnJlbnRGcmFtZSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYoKytjdXJyZW50RnJhbWVJbmRleCA+PSBjdXJyZW50RnJhbWVTZXF1ZW5jZS5mcmFtZXMubGVuZ3RoKSB7XHJcbiAgICAgIGN1cnJlbnRGcmFtZUluZGV4ID0gMDtcclxuICAgIH1cclxuICB9KVxyXG4gICAgLmlkKCk7XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBwbGF5OiBmdW5jdGlvbihmcmFtZVNldElkKSB7XHJcbiAgICAgIGN1cnJlbnRGcmFtZVNlcXVlbmNlID0gZnJhbWVTZXRbZnJhbWVTZXRJZF07XHJcbiAgICAgIGN1cnJlbnRGcmFtZUluZGV4ID0gMDtcclxuICAgICAgY3VycmVudEZyYW1lID0gbnVsbDtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG4gICAgb25GcmFtZTogZnVuY3Rpb24oY2IpIHtcclxuICAgICAgZnJhbWVDYWxsYmFjayA9IGNiO1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcbiAgICBzdG9wOiBmdW5jdGlvbigpIHtcclxuICAgICAgY3VycmVudEZyYW1lU2VxdWVuY2UgPSBudWxsO1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcbiAgICBraWxsOiBmdW5jdGlvbigpIHtcclxuICAgICAgU2NoZWR1bGVyLnVuc2NoZWR1bGUoc2NoZWR1bGVySWQpO1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcbiAgICBjdXJyZW50RnJhbWVJbmRleDogZnVuY3Rpb24oKSB7XHJcbiAgICAgIHJldHVybiBjdXJyZW50RnJhbWVJbmRleDtcclxuICAgIH0sXHJcbiAgICBnZXRJbWFnZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgIHJldHVybiBjdXJyZW50RnJhbWU7XHJcbiAgICB9LFxyXG4gICAgZ2V0TmV4dDogZnVuY3Rpb24oKSB7XHJcbiAgICAgIGN1cnJlbnRGcmFtZSA9IGN1cnJlbnRGcmFtZVNlcXVlbmNlLmZyYW1lc1tjdXJyZW50RnJhbWVJbmRleF07XHJcbiAgICAgIGlmKCsrY3VycmVudEZyYW1lSW5kZXggPj0gY3VycmVudEZyYW1lU2VxdWVuY2UuZnJhbWVzLmxlbmd0aCkge1xyXG4gICAgICAgIGN1cnJlbnRGcmFtZUluZGV4ID0gMDtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gY3VycmVudEZyYW1lO1xyXG4gICAgfVxyXG4gIH07XHJcbn1cclxuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IHNoYXVud2VzdCBvbiA2LzI5LzE1LlxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBjbGVhckNvbnRleHQoY29udGV4dDJkLCB3aWR0aCwgaGVpZ2h0KSB7XG4gIGNvbnRleHQyZC5jbGVhclJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCk7XG59IiwiXHJcbmltcG9ydCBVdGlsIGZyb20gJy4vdXRpbC5qcyc7XHJcblxyXG4vLyBSZXR1cm4gZXZlcnl0aGluZyBiZWZvcmUgdGhlIGxhc3Qgc2xhc2ggb2YgYSB1cmxcclxuLy8gZS5nLiBodHRwOi8vZm9vL2Jhci9iYXouanNvbiA9PiBodHRwOi8vZm9vL2JhclxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0QmFzZVVybCh1cmwpIHtcclxuICB2YXIgbiA9IHVybC5sYXN0SW5kZXhPZignLycpO1xyXG4gIHJldHVybiB1cmwuc3Vic3RyaW5nKDAsIG4pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaXNGdWxsVXJsKHVybCkge1xyXG4gIHJldHVybiAodXJsLnN1YnN0cmluZygwLCA3KSA9PT0gJ2h0dHA6Ly8nIHx8XHJcbiAgICB1cmwuc3Vic3RyaW5nKDAsIDgpID09PSAnaHR0cHM6Ly8nKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZVVybCh1cmwsIGJhc2VVcmwpIHtcclxuICBpZihiYXNlVXJsICYmICFpc0Z1bGxVcmwodXJsKSkge1xyXG4gICAgcmV0dXJuIGJhc2VVcmwgKyAnLycgKyB1cmw7XHJcbiAgfVxyXG4gIHJldHVybiB1cmw7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBtZXJnZU9iamVjdChzb3VyY2UsIGRlc3RpbmF0aW9uLCBhbGxvd1dyYXAsIGV4Y2VwdGlvbk9uQ29sbGlzaW9ucykge1xyXG4gIHNvdXJjZSA9IHNvdXJjZSB8fCB7fTsgLy9Qb29sLmdldE9iamVjdCgpO1xyXG4gIGRlc3RpbmF0aW9uID0gZGVzdGluYXRpb24gfHwge307IC8vUG9vbC5nZXRPYmplY3QoKTtcclxuXHJcbiAgT2JqZWN0LmtleXMoc291cmNlKS5mb3JFYWNoKGZ1bmN0aW9uKHByb3ApIHtcclxuICAgIGFzc2lnblByb3BlcnR5KHNvdXJjZSwgZGVzdGluYXRpb24sIHByb3AsIGFsbG93V3JhcCwgZXhjZXB0aW9uT25Db2xsaXNpb25zKTtcclxuICB9KTtcclxuXHJcbiAgcmV0dXJuIGRlc3RpbmF0aW9uO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gYXNzaWduUHJvcGVydHkoc291cmNlLCBkZXN0aW5hdGlvbiwgcHJvcCwgYWxsb3dXcmFwLCBleGNlcHRpb25PbkNvbGxpc2lvbnMpIHtcclxuICBpZihkZXN0aW5hdGlvbi5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xyXG4gICAgaWYoYWxsb3dXcmFwKSB7XHJcbiAgICAgIGRlc3RpbmF0aW9uW3Byb3BdID0gRnVuYy53cmFwKGRlc3RpbmF0aW9uW3Byb3BdLCBzb3VyY2VbcHJvcF0pO1xyXG4gICAgICBVdGlsLmxvZygnTWVyZ2U6IHdyYXBwZWQgXFwnJyArIHByb3AgKyAnXFwnJyk7XHJcbiAgICB9IGVsc2UgaWYoZXhjZXB0aW9uT25Db2xsaXNpb25zKSB7XHJcbiAgICAgIFV0aWwuZXJyb3IoJ0ZhaWxlZCB0byBtZXJnZSBtaXhpbi4gTWV0aG9kIFxcJycgK1xyXG4gICAgICBwcm9wICsgJ1xcJyBjYXVzZWQgYSBuYW1lIGNvbGxpc2lvbi4nKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGRlc3RpbmF0aW9uW3Byb3BdID0gc291cmNlW3Byb3BdO1xyXG4gICAgICBVdGlsLmxvZygnTWVyZ2U6IG92ZXJ3cm90ZSBcXCcnICsgcHJvcCArICdcXCcnKTtcclxuICAgIH1cclxuICAgIHJldHVybiBkZXN0aW5hdGlvbjtcclxuICB9XHJcblxyXG4gIGRlc3RpbmF0aW9uW3Byb3BdID0gc291cmNlW3Byb3BdO1xyXG5cclxuICByZXR1cm4gZGVzdGluYXRpb247XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRDYW52YXMod2lkdGgsIGhlaWdodCkge1xyXG4gIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuXHJcbiAgY2FudmFzLndpZHRoID0gd2lkdGggfHwgNTAwO1xyXG4gIGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQgfHwgNTAwO1xyXG5cclxuICByZXR1cm4gY2FudmFzO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaW50ZXJzZWN0cyhyZWN0QSwgcmVjdEIpIHtcclxuICByZXR1cm4gIShcclxuICAgIHJlY3RBLnggKyByZWN0QS53aWR0aCA8IHJlY3RCLnggfHxcclxuICAgIHJlY3RBLnkgKyByZWN0QS5oZWlnaHQgPCByZWN0Qi55IHx8XHJcbiAgICByZWN0QS54ID4gcmVjdEIueCArIHJlY3RCLndpZHRoIHx8XHJcbiAgICByZWN0QS55ID4gcmVjdEIueSArIHJlY3RCLmhlaWdodFxyXG4gICk7XHJcbn1cclxuXHJcbi8vIE1ha2UgdGhlIGdpdmVuIFJHQiB2YWx1ZSB0cmFuc3BhcmVudCBpbiB0aGUgZ2l2ZW4gaW1hZ2UuXHJcbi8vIFJldHVybnMgYSBuZXcgaW1hZ2UuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRUcmFuc3BhcmVudEltYWdlKHRyYW5zUkdCLCBpbWFnZSkge1xyXG4gIHZhciByLCBnLCBiLCBuZXdJbWFnZSwgZGF0YUxlbmd0aDtcclxuICB2YXIgd2lkdGggPSBpbWFnZS53aWR0aDtcclxuICB2YXIgaGVpZ2h0ID0gaW1hZ2UuaGVpZ2h0O1xyXG4gIHZhciBpbWFnZURhdGEgPSBpbWFnZVxyXG4gICAgLmdldENvbnRleHQoJzJkJylcclxuICAgIC5nZXRJbWFnZURhdGEoMCwgMCwgd2lkdGgsIGhlaWdodCk7XHJcblxyXG4gIGlmKHRyYW5zUkdCKSB7XHJcbiAgICBkYXRhTGVuZ3RoID0gd2lkdGggKiBoZWlnaHQgKiA0O1xyXG5cclxuICAgIGZvcih2YXIgaW5kZXggPSAwOyBpbmRleCA8IGRhdGFMZW5ndGg7IGluZGV4Kz00KSB7XHJcbiAgICAgIHIgPSBpbWFnZURhdGEuZGF0YVtpbmRleF07XHJcbiAgICAgIGcgPSBpbWFnZURhdGEuZGF0YVtpbmRleCArIDFdO1xyXG4gICAgICBiID0gaW1hZ2VEYXRhLmRhdGFbaW5kZXggKyAyXTtcclxuICAgICAgaWYociA9PT0gdHJhbnNSR0JbMF0gJiYgZyA9PT0gdHJhbnNSR0JbMV0gJiYgYiA9PT0gdHJhbnNSR0JbMl0pIHtcclxuICAgICAgICBpbWFnZURhdGEuZGF0YVtpbmRleCArIDNdID0gMDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgbmV3SW1hZ2UgPSBnZXRDYW52YXMod2lkdGgsIGhlaWdodCk7XHJcbiAgbmV3SW1hZ2VcclxuICAgIC5nZXRDb250ZXh0KCcyZCcpXHJcbiAgICAucHV0SW1hZ2VEYXRhKGltYWdlRGF0YSwgMCwgMCk7XHJcblxyXG4gIHJldHVybiBuZXdJbWFnZTtcclxufVxyXG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBTaGF1biBvbiA0LzIzLzIwMTUuXHJcbiAqL1xyXG5cclxudmFyIGFsbERhdGFFbGVtZW50cztcclxuXHJcbmZ1bmN0aW9uIGhhc0RhdGFBdHRyaWJ1dGUoZWxlbWVudCkge1xyXG4gIHZhciBhdHRyaWJ1dGVzID0gZWxlbWVudC5hdHRyaWJ1dGVzO1xyXG4gIGZvcih2YXIgaSA9IDAsIG51bUF0dHJpYnV0ZXMgPSBhdHRyaWJ1dGVzLmxlbmd0aDsgaSA8IG51bUF0dHJpYnV0ZXM7IGkrKykge1xyXG4gICAgaWYoYXR0cmlidXRlc1tpXS5uYW1lLnN1YnN0cigwLCA0KSA9PT0gJ2RhdGEnKSB7XHJcbiAgICAgIHJldHVybiBlbGVtZW50O1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGZpbmREYXRhRWxlbWVudHMgKHBhcmVudEVsZW1lbnQpIHtcclxuICB2YXIgYWxsRWxlbWVudHMsIGVsZW1lbnQsIGRhdGFFbGVtZW50cyA9IFtdO1xyXG5cclxuICBpZighcGFyZW50RWxlbWVudCkge1xyXG4gICAgdmFyIGh0bWwgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaHRtbCcpO1xyXG4gICAgaWYoIWh0bWxbMF0pIHtcclxuICAgICAgcmV0dXJuIGRhdGFFbGVtZW50cztcclxuICAgIH1cclxuICAgIHBhcmVudEVsZW1lbnQgPSBodG1sWzBdO1xyXG4gIH1cclxuXHJcbiAgYWxsRWxlbWVudHMgPSBwYXJlbnRFbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyonKTtcclxuICBmb3IodmFyIGkgPSAwLCBudW1FbGVtZW50cyA9IGFsbEVsZW1lbnRzLmxlbmd0aDsgaSA8IG51bUVsZW1lbnRzOyBpKyspIHtcclxuICAgIGVsZW1lbnQgPSBhbGxFbGVtZW50c1tpXTtcclxuICAgIGlmKGhhc0RhdGFBdHRyaWJ1dGUoZWxlbWVudCkpIHtcclxuICAgICAgZGF0YUVsZW1lbnRzLnB1c2goZWxlbWVudCk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBkYXRhRWxlbWVudHM7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBGcmFnbWVudHMgKG5hbWUpIHtcclxuICBpZighYWxsRGF0YUVsZW1lbnRzKSB7XHJcbiAgICBjYWNoZURhdGFFbGVtZW50cygpO1xyXG4gIH1cclxuICByZXR1cm4gYWxsRGF0YUVsZW1lbnRzLmZpbHRlcihmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICBpZihlbGVtZW50Lmhhc0F0dHJpYnV0ZSgnZGF0YS0nICsgbmFtZSkpIHtcclxuICAgICAgcmV0dXJuIGVsZW1lbnQ7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBGcmFnbWVudCAobmFtZSkge1xyXG4gIHJldHVybiBGcmFnbWVudHMobmFtZSlbMF07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjYWNoZURhdGFFbGVtZW50cygpIHtcclxuICBhbGxEYXRhRWxlbWVudHMgPSBmaW5kRGF0YUVsZW1lbnRzKCk7XHJcbn1cclxuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IHNoYXVud2VzdCBvbiA2LzIwLzE1LlxuICovXG5cbmNvbnN0IE1TX1BFUl9TRUNPTkQgPSAxMDAwO1xuXG5mdW5jdGlvbiBnZXREZWx0YVRpbWUobm93LCBsYXN0VXBkYXRlVGltZSkge1xuICByZXR1cm4gKG5vdyAtIGxhc3RVcGRhdGVUaW1lKSAvIE1TX1BFUl9TRUNPTkQ7XG59XG5cbi8vIFNUQVRFRlVMXG5mdW5jdGlvbiBGcmFtZUxvb3Aoc3RhcnQpIHtcbiAgbGV0IGNicyA9IFtdLCBsYXN0ID0gc3RhcnQsIGZwcyA9IDAsIGZyYW1lQ291bnQgPSAwO1xuICBsZXQgaW50ZXJ2YWxJZCA9IHNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcbiAgICBmcHMgPSBmcmFtZUNvdW50O1xuICAgIGZyYW1lQ291bnQgPSAwO1xuICB9LCBNU19QRVJfU0VDT05EKTtcblxuICAoZnVuY3Rpb24gbG9vcCgpIHtcbiAgICBmcmFtZUNvdW50Kys7XG5cbiAgICBjYnMgPSBjYnNcbiAgICAgIC5tYXAoZnVuY3Rpb24gKGNiKSB7XG4gICAgICAgIHJldHVybiBjYihmcHMsIGxhc3QpICYmIGNiO1xuICAgICAgfSlcbiAgICAgIC5maWx0ZXIoZnVuY3Rpb24gKGNiKSB7XG4gICAgICAgIHJldHVybiBjYjtcbiAgICAgIH0pO1xuXG4gICAgbGFzdCA9ICtuZXcgRGF0ZSgpO1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShsb29wKTtcbiAgfSkoKTtcblxuICByZXR1cm4gZnVuY3Rpb24gKGNiKSB7XG4gICAgY2JzLnB1c2goY2IpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBGcmFtZSgpIHtcbiAgY29uc3QgZnJhbWVMb29wID0gRnJhbWVMb29wKCtuZXcgRGF0ZSgpKTtcblxuICByZXR1cm4gZnVuY3Rpb24gKGNiKSB7XG4gICAgZnJhbWVMb29wKGZ1bmN0aW9uIChmcHMsIGxhc3RVcGRhdGVUaW1lKSB7XG4gICAgICBjb25zdCBlbGFwc2VkID0gZ2V0RGVsdGFUaW1lKCtuZXcgRGF0ZSgpLCBsYXN0VXBkYXRlVGltZSk7XG4gICAgICByZXR1cm4gY2IoZWxhcHNlZCwgZnBzKTtcbiAgICB9KTtcbiAgfVxufVxuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IFNoYXVuIG9uIDUvMS8xNC5cbiAqL1xuXG52YXIgSU1BR0VfV0FJVF9JTlRFUlZBTCA9IDEwMDtcblxuZnVuY3Rpb24gd2FpdEZvckltYWdlIChpbWFnZSkge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgdmFyIGludGVydmFsSWQgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICAgIGlmKGltYWdlLmNvbXBsZXRlKSB7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZCk7XG4gICAgICAgIHJlc29sdmUoaW1hZ2UpO1xuICAgICAgfVxuICAgIH0sIElNQUdFX1dBSVRfSU5URVJWQUwpO1xuXG4gICAgaW1hZ2Uub25lcnJvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZCk7XG4gICAgICByZWplY3QoKTtcbiAgICB9O1xuICB9KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0SW1hZ2UgKHVyaSkge1xuICB2YXIgaW1hZ2UsIHByb21pc2U7XG5cbiAgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgaW1hZ2Uuc3JjID0gdXJpO1xuXG4gIHByb21pc2UgPSB3YWl0Rm9ySW1hZ2UoaW1hZ2UpO1xuXG4gIHJldHVybiBwcm9taXNlO1xufVxuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IHNoYXVud2VzdCBvbiA2LzI4LzE1LlxuICovXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIElucHV0KCkge1xuICB2YXIga2V5cyA9IHt9O1xuXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAga2V5c1tldmVudC5rZXlDb2RlXSA9IHRydWU7XG4gIH0pO1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICBrZXlzW2V2ZW50LmtleUNvZGVdID0gZmFsc2U7XG4gIH0pO1xuXG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGtleXM7XG4gIH07XG59XG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBTaGF1biBvbiAyLzEvMTVcclxuICogQmFzZWQgb24gdGhlIGphY2syZCBDaHJvbm8gb2JqZWN0XHJcbiAqIFxyXG4gKi9cclxuXHJcbmltcG9ydCBVdGlsIGZyb20gJy4vdXRpbC5qcyc7XHJcbmltcG9ydCB7bWVyZ2VPYmplY3R9IGZyb20gJy4vY29tbW9uLmpzJztcclxuXHJcbnZhciBpbnN0YW5jZTtcclxudmFyIE9ORV9TRUNPTkQgPSAxMDAwO1xyXG5cclxuLy8gZ2V0IHJpZCBvZiBpbnN0YW5jZSBzdHVmZi4gSnVzdCB1c2UgdGhlIGRpIGNvbnRhaW5lcidzIHJlZ2lzdGVyU2luZ2xldG9uL3VzZVxyXG5mdW5jdGlvbiBTY2hlZHVsZXIoY2IsIHJhdGUpIHtcclxuICBpZighaW5zdGFuY2UpIHtcclxuICAgIGluc3RhbmNlID0gY3JlYXRlKCk7XHJcbiAgfVxyXG4gIGlmKGNiKSB7XHJcbiAgICBpbnN0YW5jZS5zY2hlZHVsZShjYiwgcmF0ZSk7XHJcbiAgfVxyXG4gIHJldHVybiBpbnN0YW5jZTtcclxufVxyXG5cclxuU2NoZWR1bGVyLmluc3RhbmNlID0gY3JlYXRlO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlKCkge1xyXG4gIHJldHVybiBtZXJnZU9iamVjdCh7XHJcbiAgICBzY2hlZHVsZWQ6IFtdLFxyXG4gICAgc2NoZWR1bGU6IHNjaGVkdWxlLFxyXG4gICAgdW5zY2hlZHVsZTogdW5zY2hlZHVsZSxcclxuICAgIHN0YXJ0OiBzdGFydCxcclxuICAgIHN0b3A6IHN0b3AsXHJcbiAgICBmcmFtZTogZnJhbWUsXHJcbiAgICBpZDogaWRcclxuICB9KS5zdGFydCgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzY2hlZHVsZShjYiwgcmF0ZSkge1xyXG4gIGZ1bmN0aW9uIHNldFJhdGUobmV3UmF0ZSkge1xyXG4gICAgcmF0ZSA9IG5ld1JhdGU7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBtYWtlRnJhbWUoKSB7XHJcbiAgICB2YXIgY291bnQgPSAxLFxyXG4gICAgICB0b3RhbERlbHRhVGltZSA9IDA7XHJcblxyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKGRlbHRhVGltZSkge1xyXG4gICAgICB0b3RhbERlbHRhVGltZSArPSBkZWx0YVRpbWU7XHJcbiAgICAgIGlmKGNvdW50ICE9PSByYXRlKSB7XHJcbiAgICAgICAgY291bnQrKztcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgY2IodG90YWxEZWx0YVRpbWUsIHNldFJhdGUpO1xyXG4gICAgICBjb3VudCA9IDE7XHJcbiAgICAgIHRvdGFsRGVsdGFUaW1lID0gMDtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBpZighVXRpbC5pc0Z1bmN0aW9uKGNiKSkge1xyXG4gICAgVXRpbC5lcnJvcignU2NoZWR1bGVyOiBvbmx5IGZ1bmN0aW9ucyBjYW4gYmUgc2NoZWR1bGVkLicpO1xyXG4gIH1cclxuICByYXRlID0gcmF0ZSB8fCAxO1xyXG5cclxuICB0aGlzLnNjaGVkdWxlZC5wdXNoKG1ha2VGcmFtZSgpKTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlkKCkge1xyXG4gIHJldHVybiB0aGlzLnNjaGVkdWxlZC5sZW5ndGg7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHVuc2NoZWR1bGUoaWQpIHtcclxuICB0aGlzLnNjaGVkdWxlZC5zcGxpY2UoaWQgLSAxLCAxKTtcclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuZnVuY3Rpb24gc3RhcnQoKSB7XHJcbiAgaWYodGhpcy5ydW5uaW5nKSB7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIG1lcmdlT2JqZWN0KHtcclxuICAgIGFjdHVhbEZwczogMCxcclxuICAgIHRpY2tzOiAwLFxyXG4gICAgZWxhcHNlZFNlY29uZHM6IDAsXHJcbiAgICBydW5uaW5nOiB0cnVlLFxyXG4gICAgbGFzdFVwZGF0ZVRpbWU6IG5ldyBEYXRlKCksXHJcbiAgICBvbmVTZWNvbmRUaW1lcklkOiB3aW5kb3cuc2V0SW50ZXJ2YWwob25PbmVTZWNvbmQuYmluZCh0aGlzKSwgT05FX1NFQ09ORClcclxuICB9LCB0aGlzKTtcclxuXHJcbiAgcmV0dXJuIHRoaXMuZnJhbWUoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gc3RvcCgpIHtcclxuICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcclxuICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLm9uZVNlY29uZFRpbWVySWQpO1xyXG4gIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLmFuaW1hdGlvbkZyYW1lSWQpO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuZnVuY3Rpb24gY2xlYXIoKSB7XHJcbiAgdGhpcy5zY2hlZHVsZWQubGVuZ3RoID0gMDtcclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuZnVuY3Rpb24gZnJhbWUoKSB7XHJcbiAgZXhlY3V0ZUZyYW1lQ2FsbGJhY2tzLmJpbmQodGhpcykoZ2V0RGVsdGFUaW1lLmJpbmQodGhpcykoKSk7XHJcbiAgdGhpcy50aWNrcysrO1xyXG5cclxuICBpZih0aGlzLnJ1bm5pbmcpIHtcclxuICAgIHRoaXMuYW5pbWF0aW9uRnJhbWVJZCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnJhbWUuYmluZCh0aGlzKSk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuZnVuY3Rpb24gb25PbmVTZWNvbmQoKSB7XHJcbiAgdGhpcy5hY3R1YWxGcHMgPSB0aGlzLnRpY2tzO1xyXG4gIHRoaXMudGlja3MgPSAwO1xyXG4gIHRoaXMuZWxhcHNlZFNlY29uZHMrKztcclxufVxyXG5cclxuZnVuY3Rpb24gZXhlY3V0ZUZyYW1lQ2FsbGJhY2tzKGRlbHRhVGltZSkge1xyXG4gIHZhciBzY2hlZHVsZWQgPSB0aGlzLnNjaGVkdWxlZDtcclxuXHJcbiAgZm9yKHZhciBpID0gMCwgbnVtU2NoZWR1bGVkID0gc2NoZWR1bGVkLmxlbmd0aDsgaSA8IG51bVNjaGVkdWxlZDsgaSsrKSB7XHJcbiAgICBzY2hlZHVsZWRbaV0oZGVsdGFUaW1lKTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldERlbHRhVGltZSgpIHtcclxuICB2YXIgbm93ID0gK25ldyBEYXRlKCk7XHJcbiAgdmFyIGRlbHRhVGltZSA9IChub3cgLSB0aGlzLmxhc3RVcGRhdGVUaW1lKSAvIE9ORV9TRUNPTkQ7XHJcblxyXG4gIHRoaXMubGFzdFVwZGF0ZVRpbWUgPSBub3c7XHJcblxyXG4gIHJldHVybiBkZWx0YVRpbWU7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFNjaGVkdWxlcjtcclxuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IHNoYXVud2VzdCBvbiA2LzExLzE1LlxuICovXG5cblxuaW1wb3J0IFZhbHZlIGZyb20gJy4uL3ZhbHZlLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZmV0Y2hKU09OKHVyaSkge1xuICAvL3JldHVybiBWYWx2ZS5jcmVhdGUoZmV0Y2godXJpKS50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlLmpzb24oKSkpO1xuICByZXR1cm4gZmV0Y2godXJpKS50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlLmpzb24oKSk7XG59IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgU2hhdW4gb24gNC8yMy8yMDE1LlxyXG4gKi9cclxuXHJcbnZhciB0eXBlcyA9IFsnQXJyYXknLCAnT2JqZWN0JywgJ0Jvb2xlYW4nLCAnQXJndW1lbnRzJywgJ0Z1bmN0aW9uJywgJ1N0cmluZycsICdOdW1iZXInLCAnRGF0ZScsICdSZWdFeHAnXTtcclxuXHJcbnZhciBVdGlsID0ge1xyXG4gIGlzRGVmaW5lZDogZnVuY3Rpb24gKHZhbHVlKSB7IHJldHVybiB0eXBlb2YgdmFsdWUgIT0gJ3VuZGVmaW5lZCcgfSxcclxuICBkZWY6IGZ1bmN0aW9uICh2YWx1ZSwgZGVmYXVsdFZhbHVlKSB7IHJldHVybiAodHlwZW9mIHZhbHVlID09ICd1bmRlZmluZWQnKSA/IGRlZmF1bHRWYWx1ZSA6IHZhbHVlIH0sXHJcbiAgZXJyb3I6IGZ1bmN0aW9uIChtZXNzYWdlKSB7IHRocm93IG5ldyBFcnJvcihpZCArICc6ICcgKyBtZXNzYWdlKSB9LFxyXG4gIHdhcm46IGZ1bmN0aW9uIChtZXNzYWdlKSB7IFV0aWwubG9nKCdXYXJuaW5nOiAnICsgbWVzc2FnZSkgfSxcclxuICBsb2c6IGZ1bmN0aW9uIChtZXNzYWdlKSB7IGlmKGNvbmZpZy5sb2cpIHsgY29uc29sZS5sb2coaWQgKyAnOiAnICsgbWVzc2FnZSkgfSB9LFxyXG4gIGFyZ3NUb0FycmF5OiBmdW5jdGlvbiAoYXJncykgeyByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJncykgfSxcclxuICByYW5kOiBmdW5jdGlvbiAobWF4LCBtaW4pIHsgLy8gbW92ZSB0byBleHRyYT9cclxuICAgIG1pbiA9IG1pbiB8fCAwO1xyXG4gICAgaWYobWluID4gbWF4KSB7IFV0aWwuZXJyb3IoJ3JhbmQ6IGludmFsaWQgcmFuZ2UuJyk7IH1cclxuICAgIHJldHVybiBNYXRoLmZsb29yKChNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKSkgKyAobWluKTtcclxuICB9XHJcbn07XHJcblxyXG5mb3IodmFyIGkgPSAwOyBpIDwgdHlwZXMubGVuZ3RoOyBpKyspIHtcclxuICBVdGlsWydpcycgKyB0eXBlc1tpXV0gPSAoZnVuY3Rpb24odHlwZSkge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaikge1xyXG4gICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT0gJ1tvYmplY3QgJyArIHR5cGUgKyAnXSc7XHJcbiAgICB9O1xyXG4gIH0pKHR5cGVzW2ldKTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgVXRpbDsiLCIvKipcbiAqIENyZWF0ZWQgYnkgc2hhdW53ZXN0IG9uIDYvMjAvMTUuXG4gKlxuICogVE9ETzogZGlzcG9zZSgpXG4gKi9cblxuLyoqXG4gKlxudmFyIHZhbHZlID0gVmFsdmUuY3JlYXRlKGZ1bmN0aW9uIChlbWl0LCBlcnJvcikge1xuICBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgZXJyb3IoJ2hlbGxvJyk7XG4gIH0sIDUwMCk7XG59KS50aGVuKGZ1bmN0aW9uIChtc2cpIHtcbiAgcmV0dXJuIG1zZyArICcgU2hhdW4nO1xufSkudGhlbihmdW5jdGlvbiAobmV3TXNnKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuICAgIHNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcbiAgICAgIHJlc29sdmUobmV3TXNnICsgJyEhISEnKTtcbiAgICB9LCA1MDApO1xuICB9KTtcbn0pLnRoZW4oXG4gIGZ1bmN0aW9uIChuZXdlck1zZykge1xuICAgIGNvbnNvbGUubG9nKG5ld2VyTXNnKTtcbiAgfSwgZnVuY3Rpb24gKG1zZykge1xuICAgIGNvbnNvbGUubG9nKG1zZyk7XG4gIH0pO1xuKi9cblxuZnVuY3Rpb24gY2xvbmVBcnJheShhcnJheSkge1xuICByZXR1cm4gYXJyYXkuc2xpY2UoMCk7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZUFsbCh0aGVuYWJsZXMsIGRvQXBwbHkpIHtcbiAgcmV0dXJuIFZhbHZlLmNyZWF0ZShmdW5jdGlvbiAoZW1pdCkge1xuICAgIHZhciBjb3VudCA9IHRoZW5hYmxlcy5sZW5ndGg7XG4gICAgdmFyIHZhbHVlcyA9IFtdO1xuXG4gICAgZnVuY3Rpb24gY2hlY2tDb3VudCgpIHtcbiAgICAgIGlmKC0tY291bnQgPT09IDApIHtcbiAgICAgICAgKGRvQXBwbHkpID9cbiAgICAgICAgICBlbWl0LmFwcGx5KG51bGwsIHZhbHVlcykgOlxuICAgICAgICAgIGVtaXQodmFsdWVzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGVuYWJsZXMuZm9yRWFjaChmdW5jdGlvbiAodGhlbmFibGUsIGluZGV4KSB7XG4gICAgICBpZighdGhlbmFibGUpIHtcbiAgICAgICAgdGhyb3cgJ0ltcGxlbWVudCBlcnJvciBzY2VuYXJpbyc7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYoIXRoZW5hYmxlLnRoZW4pIHtcbiAgICAgICAgdmFsdWVzW2luZGV4XSA9IHRoZW5hYmxlO1xuICAgICAgICBjaGVja0NvdW50KCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhlbmFibGUudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdmFsdWVzW2luZGV4XSA9IHZhbHVlO1xuICAgICAgICBjaGVja0NvdW50KCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSlcbn1cblxuZnVuY3Rpb24gaXRlcmF0ZShpdGVyYXRvciwgdmFsdWUsIGF0dGFjaGVkLCBmYWlsZWQpIHtcbiAgbGV0IGl0ZW0gPSBpdGVyYXRvci5uZXh0KCk7XG4gIGlmIChpdGVtLmRvbmUpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBsZXQgbGlzdGVuZXIgPSAoZmFpbGVkKSA/XG4gICAgaXRlbS52YWx1ZS5mYWlsIDpcbiAgICBpdGVtLnZhbHVlLnN1Y2Nlc3M7XG5cbiAgaWYgKHZhbHVlICYmIHZhbHVlLnRoZW4pIHtcbiAgICBpZih2YWx1ZS5hdHRhY2hlZCkge1xuICAgICAgYXR0YWNoZWQgPSBhdHRhY2hlZC5jb25jYXQodmFsdWUuYXR0YWNoZWQpO1xuICAgIH1cblxuICAgIHZhbHVlLnRoZW4oXG4gICAgICBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgaXRlcmF0ZShpdGVyYXRvciwgbGlzdGVuZXIuYXBwbHkobnVsbCwgW3ZhbHVlXS5jb25jYXQoYXR0YWNoZWQpKSwgYXR0YWNoZWQsIGZhaWxlZCk7XG4gICAgICB9LFxuICAgICAgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIGl0ZXJhdGUoaXRlcmF0b3IsIGxpc3RlbmVyLmFwcGx5KG51bGwsIFt2YWx1ZV0uY29uY2F0KGF0dGFjaGVkKSksIGF0dGFjaGVkLCB0cnVlKTtcbiAgICAgIH1cbiAgICApO1xuICAgIHJldHVybjtcbiAgfVxuICBpdGVyYXRlKGl0ZXJhdG9yLCBsaXN0ZW5lci5hcHBseShudWxsLCBbdmFsdWVdLmNvbmNhdChhdHRhY2hlZCkpLCBhdHRhY2hlZCwgZmFpbGVkKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmFsdmUge1xuICBjb25zdHJ1Y3RvcihleGVjdXRvcikge1xuICAgIHRoaXMuc3RhcnRlZCA9IGZhbHNlO1xuICAgIHRoaXMuYXR0YWNoZWQgPSBbXTtcbiAgICB0aGlzLmxpc3RlbmVycyA9IFtdO1xuICAgIHRoaXMuZXhlY3V0b3IgPSBleGVjdXRvcjtcbiAgfVxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgLy8gSXRlcmF0ZSBvdmVyIGxpc3RlbmVycyBvbiBuZXh0IHJ1biBvZlxuICAgIC8vIHRoZSBqcyBldmVudCBsb29wXG4gICAgLy8gVE9ETzogbm9kZSBzdXBwb3J0XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLmV4ZWN1dG9yKFxuICAgICAgICAvLyBFbWl0XG4gICAgICAgICh2YWx1ZSkgPT4ge1xuICAgICAgICAgIGl0ZXJhdGUodGhpcy5saXN0ZW5lcnNbU3ltYm9sLml0ZXJhdG9yXSgpLCB2YWx1ZSwgdGhpcy5hdHRhY2hlZCk7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIEVycm9yXG4gICAgICAgICh2YWx1ZSkgPT4ge1xuICAgICAgICAgIGl0ZXJhdGUodGhpcy5saXN0ZW5lcnNbU3ltYm9sLml0ZXJhdG9yXSgpLCB2YWx1ZSwgdGhpcy5hdHRhY2hlZCwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfSwgMSk7XG4gIH1cblxuICAvL1RPRE86IGVycm9yIHNjZW5hcmlvXG4gIHN0YXRpYyBjcmVhdGUoZXhlY3V0b3IpIHtcbiAgICBpZihleGVjdXRvci50aGVuKSB7XG4gICAgICByZXR1cm4gbmV3IFZhbHZlKGZ1bmN0aW9uIChlbWl0KSB7XG4gICAgICAgIGV4ZWN1dG9yLnRoZW4oZW1pdCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBWYWx2ZShleGVjdXRvcik7XG4gIH1cblxuICAvL1RPRE86IGVycm9yIHNjZW5hcmlvXG4gIHN0YXRpYyBhbGwodGhlbmFibGVzKSB7XG4gICAgcmV0dXJuIGhhbmRsZUFsbCh0aGVuYWJsZXMpO1xuICB9XG5cbiAgc3RhdGljIGFwcGx5QWxsKHRoZW5hYmxlcykge1xuICAgIHJldHVybiBoYW5kbGVBbGwodGhlbmFibGVzLCB0cnVlKTtcbiAgfVxuXG4gIGNsb25lKG9uU3VjY2Vzcywgb25GYWlsdXJlKSB7XG4gICAgdmFyIG5ld1ZhbHZlID0gbmV3IFZhbHZlKHRoaXMuZXhlY3V0b3IpO1xuICAgIG5ld1ZhbHZlLmxpc3RlbmVycyA9IGNsb25lQXJyYXkodGhpcy5saXN0ZW5lcnMpO1xuICAgIG5ld1ZhbHZlLmF0dGFjaGVkID0gY2xvbmVBcnJheSh0aGlzLmF0dGFjaGVkKTtcbiAgICBuZXdWYWx2ZS5zdGFydGVkID0gdGhpcy5zdGFydGVkO1xuICAgIHJldHVybiAob25TdWNjZXNzKSA/IG5ld1ZhbHZlLnRoZW4ob25TdWNjZXNzLCBvbkZhaWx1cmUpIDogbmV3VmFsdmU7XG4gIH1cblxuICBhdHRhY2godmFsdWUpIHtcbiAgICB0aGlzLmF0dGFjaGVkLnB1c2godmFsdWUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgdGhlbihvblN1Y2Nlc3MsIG9uRmFpbHVyZSkge1xuICAgIGlmKHR5cGVvZiBvblN1Y2Nlc3MgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93ICdWYWx2ZTogdGhlbigpIHJlcXVpcmVzIGEgZnVuY3Rpb24gYXMgZmlyc3QgYXJndW1lbnQuJ1xuICAgIH1cbiAgICB0aGlzLmxpc3RlbmVycy5wdXNoKHtcbiAgICAgIHN1Y2Nlc3M6IG9uU3VjY2VzcyxcbiAgICAgIGZhaWw6IG9uRmFpbHVyZSB8fCBmdW5jdGlvbiAodmFsdWUpIHsgcmV0dXJuIHZhbHVlOyB9XG4gICAgfSk7XG5cbiAgICBpZighdGhpcy5zdGFydGVkKSB7XG4gICAgICB0aGlzLmV4ZWN1dGUoKTtcbiAgICAgIHRoaXMuc3RhcnRlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn0iLCIvKipcbiAqIENyZWF0ZWQgYnkgc2hhdW53ZXN0IG9uIDUvOS8xNS5cbiAqL1xuXG5pbXBvcnQgZmV0Y2hKU09OIGZyb20gJy4uL2VuZ2luZS9zY2hlbWEvZmV0Y2gtc2NoZW1hLmpzJztcbmltcG9ydCBnZXRJbWFnZSBmcm9tICcuLi9lbmdpbmUvaW1hZ2UtbG9hZGVyLmpzJztcbmltcG9ydCBnZXRTcHJpdGVTY2hlbWEgZnJvbSAnLi4vc2NoZW1hL3Nwcml0ZS1zY2hlbWEuanMnO1xuaW1wb3J0IHNwcml0ZUFuaW1hdGlvbiBmcm9tICcuLi9hbmltYXRpb24vc3ByaXRlLWFuaW1hdGlvbi5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdldFNjZW5lU2NoZW1hKHVyaSkge1xuICByZXR1cm4gZmV0Y2hKU09OKHVyaSlcbiAgICAudGhlbihmdW5jdGlvbiAoc2NlbmUpIHtcbiAgICAgIHJldHVybiBnZXRJbWFnZShzY2VuZS5iYWNrZ3JvdW5kLmJhY2tncm91bmRVcmwpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uIChiYWNrZ3JvdW5kSW1hZ2UpIHtcbiAgICAgICAgICBzY2VuZS5iYWNrZ3JvdW5kSW1hZ2UgPSBiYWNrZ3JvdW5kSW1hZ2U7XG4gICAgICAgICAgcmV0dXJuIGdldFNwcml0ZVR5cGVzKHNjZW5lLnNwcml0ZXMpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoc3ByaXRlcykge1xuICAgICAgICAgICAgICBzY2VuZS5zcHJpdGVzID0gc3ByaXRlcztcbiAgICAgICAgICAgICAgcmV0dXJuIHNjZW5lO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0pXG4gICAgLnRoZW4oZnVuY3Rpb24gKHNjZW5lKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmZyZWV6ZShzY2VuZSk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFNwcml0ZVR5cGVzKHNwcml0ZXMpIHtcbiAgcmV0dXJuIFByb21pc2UuYWxsKHNwcml0ZXMubWFwKGdldFNwcml0ZVR5cGUpKTtcbn1cblxuZnVuY3Rpb24gZ2V0U3ByaXRlVHlwZShzcHJpdGUpIHtcbiAgcmV0dXJuIGdldFNwcml0ZVNjaGVtYShzcHJpdGUuc3JjVXJsKVxuICAgIC50aGVuKGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgIHNwcml0ZS50eXBlID0gdHlwZTtcbiAgICAgIC8vc3ByaXRlLmFuaW1hdGlvbiA9IHNwcml0ZUFuaW1hdGlvbih0eXBlLmZyYW1lU2V0KTtcbiAgICAgIHNwcml0ZS5hbmltYXRpb24gPSB7fTtcbiAgICAgIHNwcml0ZS52ZWxvY2l0eVggPSAwO1xuICAgICAgc3ByaXRlLnZlbG9jaXR5WSA9IDUwMDtcbiAgICAgIHNwcml0ZS5hY2NlbGVyYXRpb25YID0gMDtcbiAgICAgIHNwcml0ZS5hY2NlbGVyYXRpb25ZID0gMDtcbiAgICAgIHNwcml0ZS5tYXhWZWxvY2l0eVggPSA1MDA7XG4gICAgICBzcHJpdGUubWF4VmVsb2NpdHlZID0gNTAwO1xuICAgICAgc3ByaXRlLmZyaWN0aW9uWCA9IDAuOTk7XG4gICAgICBzcHJpdGUuZnJpY3Rpb25ZID0gMC41MDtcbiAgICAgIHJldHVybiBzcHJpdGU7XG4gICAgfSk7XG59XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgc2hhdW53ZXN0IG9uIDUvOS8xNS5cbiAqL1xuXG5pbXBvcnQgZnJhbWVTZXQgZnJvbSAnLi4vYW5pbWF0aW9uL2ZyYW1lLXNldC5qcyc7XG5pbXBvcnQgZmV0Y2hKU09OIGZyb20gJy4uL2VuZ2luZS9zY2hlbWEvZmV0Y2gtc2NoZW1hLmpzJztcbmltcG9ydCBnZXRJbWFnZSBmcm9tICcuLi9lbmdpbmUvaW1hZ2UtbG9hZGVyLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0U3ByaXRlU2NoZW1hKHVyaSkge1xuICByZXR1cm4gZmV0Y2hKU09OKHVyaSlcbiAgICAudGhlbihmdW5jdGlvbiAoc3ByaXRlKSB7XG4gICAgICByZXR1cm4gZ2V0SW1hZ2Uoc3ByaXRlLnNwcml0ZVNoZWV0VXJsKVxuICAgICAgICAudGhlbihmdW5jdGlvbiAoc3ByaXRlU2hlZXQpIHtcbiAgICAgICAgICBzcHJpdGUuc3ByaXRlU2hlZXQgPSBzcHJpdGVTaGVldDtcbiAgICAgICAgICBzcHJpdGUuZnJhbWVTZXQgPSBmcmFtZVNldChzcHJpdGUsIHNwcml0ZVNoZWV0KTtcbiAgICAgICAgICByZXR1cm4gc3ByaXRlO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn1cbiIsIi8qKlxuICogQ3JlYXRlZCBieSBzaGF1bndlc3Qgb24gNS80LzE1LlxuICovXG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgeDogMCxcbiAgeTogMCxcbiAgbWFyZ2luTGVmdDogNjQsXG4gIG1hcmdpblJpZ2h0OiA2NCxcbiAgd2lkdGg6IDMwMCxcbiAgaGVpZ2h0OiA0MDBcbn07Il19

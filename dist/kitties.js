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

var _clearContext$render$renderRects$renderLines = require('./canvas-renderer.js');

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

function getPositionDelta(position, velocity, elapsed) {
  return position + Math.round(velocity * elapsed);
}

function getVelocity(sprite, dim, elapsed) {
  var velocity = halt(sprite.velocity[dim], 1);
  velocity = applyAcceleration(velocity, sprite.acceleration[dim], elapsed);
  velocity = applyFriction(velocity, sprite.friction[dim], elapsed);
  return clampVelocity(velocity, sprite.maxVelocity[dim]);
}

function getInnerDiff(position, size, minBound, maxBound) {
  var max = position + size;
  return position < minBound && position - minBound || max > maxBound && max - maxBound || 0;
}

function getOuterDiff(position, size, minBound, maxBound) {
  var max = position + size;
  return position < minBound && max > minBound && max - minBound || position < maxBound && max > maxBound && position - maxBound || 0;
}

function resolveCollision(diff, val) {
  return val - diff;
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

function log(val) {
  console.log(val);
  return val;
}

function getCollisions(rect, colliders) {
  return colliders.filter(function (collider) {
    return !(rect.x > collider.x + collider.width || rect.x + rect.width < collider.x || rect.y > collider.y + collider.height || rect.y + rect.height < collider.y);
  });
}

function getOverlaps(rect, colliders) {
  return colliders.map(function (collider) {
    var xMin = collider.x + collider.width - rect.x;
    var xMax = collider.x - (rect.x + rect.width);
    var yMin = collider.y + collider.height - rect.y;
    var yMax = collider.y - (rect.y + rect.height);
    return {
      x: Math.abs(xMax) < Math.abs(xMin) ? xMax : xMin,
      y: Math.abs(yMax) < Math.abs(yMin) ? yMax : yMin
    };
  });
}

function getCombineds(overlaps) {
  return overlaps.reduce(function (combined, overlap) {
    var last = combined[combined.length - 1];
    if (!last) {
      combined.push({ x: overlap.x, y: overlap.y });
      return combined;
    }

    if (!last._combined && overlap.x === last.x) {
      if (Math.abs(overlap.y) > Math.abs(last.y)) {
        last.y = overlap.y;
        last._combined = true;
      }
    } else if (!last._combined && overlap.y === last.y) {
      if (Math.abs(overlap.x) > Math.abs(last.x)) {
        last.x = overlap.x;
        last._combined = true;
      }
    } else {
      combined.push({ x: overlap.x, y: overlap.y });
    }

    return combined;
  }, []);
}

function getResolution(combineds) {
  return combineds.reduce(function (resolution, combined) {
    if (Math.abs(combined.x) < Math.abs(combined.y)) {
      resolution.x = combined.x;
    } else {
      resolution.y = combined.y;
    }
    return resolution;
  }, { x: 0, y: 0 });
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
    _clearContext$render$renderRects$renderLines.clearContext(context2d, canvas.width, canvas.height);

    var inputs = getInputs();

    player.velocity.y = 300;

    var speed = 50;
    if (inputs[37]) {
      player.velocity.x = -speed;
    } else if (inputs[39]) {
      player.velocity.x = speed;
    }

    if (inputs[38]) {
      player.velocity.y = -speed;
    } else if (inputs[40]) {
      player.velocity.y = speed;
    }

    sprites.forEach(function (sprite) {
      var velocityX = getVelocity(sprite, 'x', elapsed);
      var x = getPositionDelta(sprite.x, velocityX, elapsed);

      var boundsDiffX = getInnerDiff(x, sprite.width, 0, sceneBounds.width);
      var x1 = resolveCollision(boundsDiffX, x);

      var velocityY = getVelocity(sprite, 'y', elapsed);
      var y = getPositionDelta(sprite.y, velocityY, elapsed);

      var boundsDiffY = getInnerDiff(y, sprite.height, 0, sceneBounds.height);
      var y1 = resolveCollision(boundsDiffY, y);

      var x2 = x1;
      var y2 = y1;

      // mutate sprite
      sprite.velocity.x = velocityX;
      sprite.x = x2;
      sprite.velocity.y = velocityY;
      sprite.y = y2;

      var collisions = getCollisions(sprite, colliders);
      var overlaps = getOverlaps(sprite, collisions);
      var combined = getCombineds(overlaps);
      var resolution = getResolution(combined);

      sprite.x += resolution.x;
      sprite.y += resolution.y;

      if (sprite === player) {
        var minMargin = viewport.marginLeft;
        var maxMargin = viewport.width - viewport.marginRight;
        var viewportDiffX = getInnerDiff(sprite.x, sprite.width, viewport.x + minMargin, viewport.x + maxMargin);

        // mutate viewport
        if (viewportDiffX > 0 && sprite.velocity.x > 0) {
          viewport.x = getPositionFromMaxMargin(sprite.x, sprite.width, maxMargin);
        } else if (viewportDiffX < 0 && sprite.velocity.x < 0) {
          viewport.x = getPositionFromMinMargin(sprite.x, minMargin);
        }
      }

      var frame = applyAnimation(sprite);
      var pos = { x: sprite.x, y: sprite.y };

      _clearContext$render$renderRects$renderLines.render(context2d, pos, frame, viewport);
      _clearContext$render$renderRects$renderLines.renderRects(context2d, colliders, viewport);
      _clearContext$render$renderRects$renderLines.renderRects(context2d, sprites, viewport);
    });

    return true;
  });

  return scene;
}).then(function (scene) {
  var backgroundImage = scene.backgroundImage;

  var canvas = _Fragment.Fragment('canvas-background');
  var context2d = canvas.getContext('2d');

  getFrames(function () {
    _clearContext$render$renderRects$renderLines.clearContext(context2d, canvas.width, canvas.height);
    //render(context2d, {x: 0, y: 0}, backgroundImage, viewport);
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
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
/**
 * Created by shaunwest on 6/29/15.
 */

exports.clearContext = clearContext;
exports.render = render;
exports.renderRects = renderRects;
exports.renderLines = renderLines;

function clearContext(context2d, width, height) {
  context2d.clearRect(0, 0, width, height);
}

function render(context2d, point, image, viewport) {
  if (!image) {
    return;
  }
  context2d.drawImage(image, point.x - viewport.x || 0, point.y - viewport.y || 0);
}

function renderRects(context2d, rects, viewport, color) {
  color = color || '#000000';
  rects.forEach(function (rect) {
    context2d.strokeStyle = color;
    context2d.strokeRect(rect.x - viewport.x, rect.y - viewport.y, rect.width, rect.height);
  });
}

function renderLines(context2d, lines, viewport) {
  lines.forEach(function (line) {
    context2d.beginPath();
    context2d.moveTo(line.x1 - viewport.x, line.y1 - viewport.y);
    context2d.lineTo(line.x2 - viewport.x, line.y2 - viewport.y);
    context2d.stroke();
  });
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
    sprite.velocity = { x: 0, y: 0 };
    sprite.acceleration = { x: 0, y: 0 };
    sprite.maxVelocity = { x: 500, y: 500 };
    //sprite.friction = { x: 0.99, y: 0.50 };
    sprite.friction = { x: 0.99, y: 0.99 };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvbWFpbi5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy9hbmltYXRpb24vZnJhbWUtc2V0LmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2FuaW1hdGlvbi9zcHJpdGUtYW5pbWF0aW9uLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2NhbnZhcy1yZW5kZXJlci5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy9lbmdpbmUvY29tbW9uLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9mcmFnbWVudHMuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL2ZyYW1lLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9pbWFnZS1sb2FkZXIuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL2lucHV0LmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9zY2hlZHVsZXIuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL3NjaGVtYS9mZXRjaC1zY2hlbWEuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL3V0aWwuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL3ZhbHZlLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2Z1bmMuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvc2NoZW1hL3NjZW5lLXNjaGVtYS5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy9zY2hlbWEvc3ByaXRlLXNjaGVtYS5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy92aWV3cG9ydC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O3dCQ0l1Qix1QkFBdUI7OzhCQUNuQiwwQkFBMEI7Ozs7cUJBQ25DLG1CQUFtQjs7OztxQkFDbkIsbUJBQW1COzs7O3dCQUNoQixlQUFlOzs7OzJEQUN5QixzQkFBc0I7O3dCQUM1RCxXQUFXOztBQUVsQyxJQUFNLEtBQUssR0FBRyw0QkFBZSx5QkFBeUIsQ0FBQyxDQUFDOztBQUV4RCxTQUFTLHdCQUF3QixDQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFO0FBQ2xFLFNBQU8sQUFBQyxTQUFTLEdBQUcsVUFBVSxHQUFJLFNBQVMsQ0FBQztDQUM3Qzs7QUFFRCxTQUFTLHdCQUF3QixDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUU7QUFDdEQsU0FBTyxTQUFTLEdBQUcsU0FBUyxDQUFDO0NBQzlCOztBQUVELFNBQVMsYUFBYSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFO0FBQ2xELFNBQU8sUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztDQUNuRDs7QUFFRCxTQUFTLElBQUksQ0FBQyxRQUFRLEVBQUUsVUFBVSxFQUFFO0FBQ2xDLFNBQU8sQUFBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLFVBQVUsR0FBSSxDQUFDLEdBQUcsUUFBUSxDQUFDO0NBQ3pEOztBQUVELFNBQVMsYUFBYSxDQUFDLFFBQVEsRUFBRSxXQUFXLEVBQUU7QUFDNUMsU0FBTyxBQUFDLFFBQVEsR0FBRyxDQUFDLEdBQ2xCLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxHQUMvQixJQUFJLENBQUMsR0FBRyxDQUFD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R0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQzs7QUFFeEMsVUFBTSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDO0FBQ3ZDLFdBQU8sTUFBTSxDQUFDO0dBQ2YsQ0FBQyxDQUFDO0NBQ047Ozs7Ozs7Ozs7O3FCQ3BDdUIsZUFBZTs7Ozs7d0JBSmxCLDJCQUEyQjs7Ozt5QkFDMUIsa0NBQWtDOzs7O3dCQUNuQywyQkFBMkI7Ozs7QUFFakMsU0FBUyxlQUFlLENBQUMsR0FBRyxFQUFFO0FBQzNDLFNBQU8sdUJBQVUsR0FBRyxDQUFDLENBQ2xCLElBQUksQ0FBQyxVQUFVLE1BQU0sRUFBRTtBQUN0QixXQUFPLHNCQUFTLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FDbkMsSUFBSSxDQUFDLFVBQVUsV0FBVyxFQUFFO0FBQzNCLFlBQU0sQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO0FBQ2pDLFlBQU0sQ0FBQyxRQUFRLEdBQUcsc0JBQVMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0FBQ2hELGFBQU8sTUFBTSxDQUFDO0tBQ2YsQ0FBQyxDQUFDO0dBQ04sQ0FBQyxDQUFDO0NBQ047Ozs7Ozs7Ozs7Ozs7O3FCQ2RjO0FBQ2IsR0FBQyxFQUFFLENBQUM7QUFDSixHQUFDLEVBQUUsQ0FBQztBQUNKLFlBQVUsRUFBRSxFQUFFO0FBQ2QsYUFBVyxFQUFFLEVBQUU7QUFDZixPQUFLLEVBQUUsR0FBRztBQUNWLFFBQU0sRUFBRSxHQUFHO0NBQ1oiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgU2hhdW4gb24gNC8yMy8yMDE1LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7RnJhZ21lbnR9IGZyb20gJy4vZW5naW5lL2ZyYWdtZW50cy5qcyc7XHJcbmltcG9ydCBnZXRTY2VuZVNjaGVtYSBmcm9tICcuL3NjaGVtYS9zY2VuZS1zY2hlbWEuanMnO1xyXG5pbXBvcnQgRnJhbWUgZnJvbSAnLi9lbmdpbmUvZnJhbWUuanMnO1xyXG5pbXBvcnQgSW5wdXQgZnJvbSAnLi9lbmdpbmUvaW5wdXQuanMnO1xyXG5pbXBvcnQgVmlld3BvcnQgZnJvbSAnLi92aWV3cG9ydC5qcyc7XHJcbmltcG9ydCB7Y2xlYXJDb250ZXh0LCByZW5kZXIsIHJlbmRlclJlY3RzLCByZW5kZXJMaW5lc30gZnJvbSAnLi9jYW52YXMtcmVuZGVyZXIuanMnO1xyXG5pbXBvcnQge3NlcXVlbmNlfSBmcm9tICcuL2Z1bmMuanMnO1xyXG5cclxuY29uc3Qgc2NlbmUgPSBnZXRTY2VuZVNjaGVtYSgnYXNzZXRzL2tpdHR5LXdvcmxkLmpzb24nKTtcclxuXHJcbmZ1bmN0aW9uIGdldFBvc2l0aW9uRnJvbU1heE1hcmdpbihzcHJpdGVQb3MsIHNwcml0ZVNpemUsIG1heE1hcmdpbikge1xyXG4gIHJldHVybiAoc3ByaXRlUG9zICsgc3ByaXRlU2l6ZSkgLSBtYXhNYXJnaW47XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFBvc2l0aW9uRnJvbU1pbk1hcmdpbihzcHJpdGVQb3MsIG1pbk1hcmdpbikge1xyXG4gIHJldHVybiBzcHJpdGVQb3MgLSBtaW5NYXJnaW47XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFwcGx5RnJpY3Rpb24odmVsb2NpdHksIGZyaWN0aW9uLCBlbGFwc2VkKSB7XHJcbiAgcmV0dXJuIHZlbG9jaXR5ICogTWF0aC5wb3coMSAtIGZyaWN0aW9uLCBlbGFwc2VkKTtcclxufVxyXG5cclxuZnVuY3Rpb24gaGFsdCh2ZWxvY2l0eSwgaGFsdFRhcmdldCkge1xyXG4gIHJldHVybiAoTWF0aC5hYnModmVsb2NpdHkpIDwgaGFsdFRhcmdldCkgPyAwIDogdmVsb2NpdHk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNsYW1wVmVsb2NpdHkodmVsb2NpdHksIG1heFZlbG9jaXR5KSB7XHJcbiAgcmV0dXJuICh2ZWxvY2l0eSA+IDApID9cclxuICAgIE1hdGgubWluKHZlbG9jaXR5LCBtYXhWZWxvY2l0eSkgOlxyXG4gICAgTWF0aC5tYXgodmVsb2NpdHksIC1tYXhWZWxvY2l0eSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFwcGx5QWNjZWxlcmF0aW9uKHZlbG9jaXR5LCBhY2NlbGVyYXRpb24sIGVsYXBzZWQpIHtcclxuICByZXR1cm4gdmVsb2NpdHkgKyAoYWNjZWxlcmF0aW9uICogZWxhcHNlZCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFBvc2l0aW9uRGVsdGEocG9zaXRpb24sIHZlbG9jaXR5LCBlbGFwc2VkKSB7XHJcbiAgcmV0dXJuIHBvc2l0aW9uICsgTWF0aC5yb3VuZCh2ZWxvY2l0eSAqIGVsYXBzZWQpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRWZWxvY2l0eShzcHJpdGUsIGRpbSwgZWxhcHNlZCkge1xyXG4gIGxldCB2ZWxvY2l0eSA9IGhhbHQoc3ByaXRlLnZlbG9jaXR5W2RpbV0sIDEpO1xyXG4gIHZlbG9jaXR5ID0gYXBwbHlBY2NlbGVyYXRpb24odmVsb2NpdHksIHNwcml0ZS5hY2NlbGVyYXRpb25bZGltXSwgZWxhcHNlZCk7XHJcbiAgdmVsb2NpdHkgPSBhcHBseUZyaWN0aW9uKHZlbG9jaXR5LCBzcHJpdGUuZnJpY3Rpb25bZGltXSwgZWxhcHNlZCk7XHJcbiAgcmV0dXJuIGNsYW1wVmVsb2NpdHkodmVsb2NpdHksIHNwcml0ZS5tYXhWZWxvY2l0eVtkaW1dKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0SW5uZXJEaWZmKHBvc2l0aW9uLCBzaXplLCBtaW5Cb3VuZCwgbWF4Qm91bmQpIHtcclxuICBjb25zdCBtYXggPSBwb3NpdGlvbiArIHNpemU7XHJcbiAgcmV0dXJuIChwb3NpdGlvbiA8IG1pbkJvdW5kICYmIHBvc2l0aW9uIC0gbWluQm91bmQgfHxcclxuICAgIG1heCA+IG1heEJvdW5kICYmIG1heCAtIG1heEJvdW5kIHx8XHJcbiAgICAwKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0T3V0ZXJEaWZmKHBvc2l0aW9uLCBzaXplLCBtaW5Cb3VuZCwgbWF4Qm91bmQpIHtcclxuICBjb25zdCBtYXggPSBwb3NpdGlvbiArIHNpemU7XHJcbiAgcmV0dXJuIChwb3NpdGlvbiA8IG1pbkJvdW5kICYmIG1heCA+IG1pbkJvdW5kICYmIG1heCAtIG1pbkJvdW5kIHx8XHJcbiAgICBwb3NpdGlvbiA8IG1heEJvdW5kICYmIG1heCA+IG1heEJvdW5kICYmIHBvc2l0aW9uIC0gbWF4Qm91bmQgfHxcclxuICAgIDApO1xyXG59XHJcblxyXG5mdW5jdGlvbiByZXNvbHZlQ29sbGlzaW9uKGRpZmYsIHZhbCkge1xyXG4gIHJldHVybiB2YWwgLSBkaWZmO1xyXG59XHJcblxyXG5mdW5jdGlvbiBhcHBseUFuaW1hdGlvbihzcHJpdGUpIHtcclxuICBjb25zdCBzZXF1ZW5jZSA9IHNwcml0ZS50eXBlLmZyYW1lU2V0W2dldEFuaW1hdGlvbihzcHJpdGUpXTtcclxuICBjb25zdCBmcmFtZUluZGV4ID0gZ2V0RnJhbWVJbmRleChzcHJpdGUuYW5pbWF0aW9uLmN1cnJlbnRJbmRleCwgc2VxdWVuY2UpO1xyXG4gIHNwcml0ZS5hbmltYXRpb24uY3VycmVudEluZGV4ID0gZnJhbWVJbmRleDtcclxuXHJcbiAgcmV0dXJuIGdldEZyYW1lKGZyYW1lSW5kZXgsIHNlcXVlbmNlKVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGcmFtZUluZGV4KGN1cnJlbnRJbmRleCwgc2VxdWVuY2UpIHtcclxuICBjb25zdCBpbmRleCA9IGN1cnJlbnRJbmRleCB8fCAwO1xyXG4gIHJldHVybiAoaW5kZXggPCBzZXF1ZW5jZS5mcmFtZXMubGVuZ3RoIC0gMSkgP1xyXG4gICAgaW5kZXggKyAxIDogMDtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0QW5pbWF0aW9uKHNwcml0ZSkge1xyXG4gIHJldHVybiAncnVuJztcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0RnJhbWUoaW5kZXgsIHNlcXVlbmNlKSB7XHJcbiAgcmV0dXJuIHNlcXVlbmNlLmZyYW1lc1tpbmRleF07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGxvZyh2YWwpIHtcclxuICBjb25zb2xlLmxvZyh2YWwpO1xyXG4gIHJldHVybiB2YWw7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldENvbGxpc2lvbnMocmVjdCwgY29sbGlkZXJzKSB7XHJcbiAgcmV0dXJuIGNvbGxpZGVycy5maWx0ZXIoZnVuY3Rpb24gKGNvbGxpZGVyKSB7XHJcbiAgICByZXR1cm4gIShyZWN0LnggPiBjb2xsaWRlci54ICsgY29sbGlkZXIud2lkdGggfHxcclxuICAgICAgICByZWN0LnggKyByZWN0LndpZHRoIDwgY29sbGlkZXIueCB8fFxyXG4gICAgICAgIHJlY3QueSA+IGNvbGxpZGVyLnkgKyBjb2xsaWRlci5oZWlnaHQgfHxcclxuICAgICAgICByZWN0LnkgKyByZWN0LmhlaWdodCA8IGNvbGxpZGVyLnkpO1xyXG4gIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRPdmVybGFwcyhyZWN0LCBjb2xsaWRlcnMpIHtcclxuICByZXR1cm4gY29sbGlkZXJzLm1hcChmdW5jdGlvbiAoY29sbGlkZXIpIHtcclxuICAgIGNvbnN0IHhNaW4gPSAoY29sbGlkZXIueCArIGNvbGxpZGVyLndpZHRoKSAtIHJlY3QueDtcclxuICAgIGNvbnN0IHhNYXggPSBjb2xsaWRlci54IC0gKHJlY3QueCArIHJlY3Qud2lkdGgpO1xyXG4gICAgY29uc3QgeU1pbiA9IChjb2xsaWRlci55ICsgY29sbGlkZXIuaGVpZ2h0KSAtIHJlY3QueTtcclxuICAgIGNvbnN0IHlNYXggPSBjb2xsaWRlci55IC0gKHJlY3QueSArIHJlY3QuaGVpZ2h0KTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHg6IE1hdGguYWJzKHhNYXgpIDwgTWF0aC5hYnMoeE1pbikgPyB4TWF4IDogeE1pbixcclxuICAgICAgeTogTWF0aC5hYnMoeU1heCkgPCBNYXRoLmFicyh5TWluKSA/IHlNYXggOiB5TWluXHJcbiAgICB9O1xyXG4gIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRDb21iaW5lZHMob3ZlcmxhcHMpIHtcclxuICByZXR1cm4gb3ZlcmxhcHMucmVkdWNlKGZ1bmN0aW9uIChjb21iaW5lZCwgb3ZlcmxhcCkge1xyXG4gICAgY29uc3QgbGFzdCA9IGNvbWJpbmVkW2NvbWJpbmVkLmxlbmd0aCAtIDFdO1xyXG4gICAgaWYgKCFsYXN0KSB7XHJcbiAgICAgIGNvbWJpbmVkLnB1c2goe3g6IG92ZXJsYXAueCwgeTogb3ZlcmxhcC55fSk7XHJcbiAgICAgIHJldHVybiBjb21iaW5lZDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWxhc3QuX2NvbWJpbmVkICYmIG92ZXJsYXAueCA9PT0gbGFzdC54KSB7XHJcbiAgICAgIGlmIChNYXRoLmFicyhvdmVybGFwLnkpID4gTWF0aC5hYnMobGFzdC55KSkge1xyXG4gICAgICAgIGxhc3QueSA9IG92ZXJsYXAueTtcclxuICAgICAgICBsYXN0Ll9jb21iaW5lZCA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAoIWxhc3QuX2NvbWJpbmVkICYmIG92ZXJsYXAueSA9PT0gbGFzdC55KSB7XHJcbiAgICAgIGlmIChNYXRoLmFicyhvdmVybGFwLngpID4gTWF0aC5hYnMobGFzdC54KSkge1xyXG4gICAgICAgIGxhc3QueCA9IG92ZXJsYXAueDtcclxuICAgICAgICBsYXN0Ll9jb21iaW5lZCA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbWJpbmVkLnB1c2goe3g6IG92ZXJsYXAueCwgeTogb3ZlcmxhcC55fSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGNvbWJpbmVkO1xyXG4gIH0sIFtdKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0UmVzb2x1dGlvbihjb21iaW5lZHMpIHtcclxuICByZXR1cm4gY29tYmluZWRzLnJlZHVjZShmdW5jdGlvbiAocmVzb2x1dGlvbiwgY29tYmluZWQpIHtcclxuICAgIGlmIChNYXRoLmFicyhjb21iaW5lZC54KSA8IE1hdGguYWJzKGNvbWJpbmVkLnkpKSB7XHJcbiAgICAgIHJlc29sdXRpb24ueCA9IGNvbWJpbmVkLng7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXNvbHV0aW9uLnkgPSBjb21iaW5lZC55O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc29sdXRpb247XHJcbiAgfSwge3g6IDAsIHk6IDB9KTtcclxufVxyXG5cclxuY29uc3QgZ2V0SW5wdXRzID0gSW5wdXQoKTtcclxuY29uc3QgZ2V0RnJhbWVzID0gRnJhbWUoKTtcclxuY29uc3Qgdmlld3BvcnQgPSBWaWV3cG9ydDtcclxuY29uc3QgZnBzVUkgPSBGcmFnbWVudCgnZnBzJyk7XHJcblxyXG5nZXRGcmFtZXMoZnVuY3Rpb24gKGVsYXBzZWQsIGZwcykge1xyXG4gIGZwc1VJLnRleHRDb250ZW50ID0gZnBzO1xyXG4gIHJldHVybiB0cnVlO1xyXG59KTtcclxuXHJcbnNjZW5lXHJcbiAgLnRoZW4oZnVuY3Rpb24gKHNjZW5lKSB7XHJcbiAgICBjb25zdCBzY2VuZUJvdW5kcyA9IE9iamVjdC5mcmVlemUoe1xyXG4gICAgICB3aWR0aDogc2NlbmUuc2NlbmVXaWR0aCxcclxuICAgICAgaGVpZ2h0OiBzY2VuZS5zY2VuZUhlaWdodFxyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgY2FudmFzID0gRnJhZ21lbnQoJ2NhbnZhcy1lbnRpdGllcycpO1xyXG4gICAgY29uc3QgY29udGV4dDJkID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICBjb25zdCBjb2xsaWRlcnMgPSBPYmplY3QuZnJlZXplKHNjZW5lLmNvbGxpZGVycyk7XHJcblxyXG4gICAgY29uc3Qgc3ByaXRlcyA9IE9iamVjdC5mcmVlemUoc2NlbmUuc3ByaXRlcyk7XHJcbiAgICBjb25zdCBwbGF5ZXIgPSBzcHJpdGVzWzBdO1xyXG5cclxuICAgIGdldEZyYW1lcyhmdW5jdGlvbiAoZWxhcHNlZCkge1xyXG4gICAgICBjbGVhckNvbnRleHQoY29udGV4dDJkLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xyXG5cclxuICAgICAgY29uc3QgaW5wdXRzID0gZ2V0SW5wdXRzKCk7XHJcblxyXG4gICAgICBwbGF5ZXIudmVsb2NpdHkueSA9IDMwMDtcclxuXHJcbiAgICAgIGNvbnN0IHNwZWVkID0gNTA7XHJcbiAgICAgIGlmIChpbnB1dHNbMzddKSB7XHJcbiAgICAgICAgcGxheWVyLnZlbG9jaXR5LnggPSAtc3BlZWQ7XHJcbiAgICAgIH0gZWxzZSBpZiAoaW5wdXRzWzM5XSkge1xyXG4gICAgICAgIHBsYXllci52ZWxvY2l0eS54ID0gc3BlZWQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChpbnB1dHNbMzhdKSB7XHJcbiAgICAgICAgcGxheWVyLnZlbG9jaXR5LnkgPSAtc3BlZWQ7XHJcbiAgICAgIH0gZWxzZSBpZiAoaW5wdXRzWzQwXSkge1xyXG4gICAgICAgIHBsYXllci52ZWxvY2l0eS55ID0gc3BlZWQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHNwcml0ZXMuZm9yRWFjaChmdW5jdGlvbiAoc3ByaXRlKSB7XHJcbiAgICAgICAgY29uc3QgdmVsb2NpdHlYID0gZ2V0VmVsb2NpdHkoc3ByaXRlLCAneCcsIGVsYXBzZWQpO1xyXG4gICAgICAgIGNvbnN0IHggPSBnZXRQb3NpdGlvbkRlbHRhKHNwcml0ZS54LCB2ZWxvY2l0eVgsIGVsYXBzZWQpO1xyXG5cclxuICAgICAgICBjb25zdCBib3VuZHNEaWZmWCA9IGdldElubmVyRGlmZih4LCBzcHJpdGUud2lkdGgsIDAsIHNjZW5lQm91bmRzLndpZHRoKTtcclxuICAgICAgICBjb25zdCB4MSA9IHJlc29sdmVDb2xsaXNpb24oYm91bmRzRGlmZlgsIHgpO1xyXG5cclxuICAgICAgICBjb25zdCB2ZWxvY2l0eVkgPSBnZXRWZWxvY2l0eShzcHJpdGUsICd5JywgZWxhcHNlZCk7XHJcbiAgICAgICAgY29uc3QgeSA9IGdldFBvc2l0aW9uRGVsdGEoc3ByaXRlLnksIHZlbG9jaXR5WSwgZWxhcHNlZCk7XHJcblxyXG4gICAgICAgIGNvbnN0IGJvdW5kc0RpZmZZID0gZ2V0SW5uZXJEaWZmKHksIHNwcml0ZS5oZWlnaHQsIDAsIHNjZW5lQm91bmRzLmhlaWdodCk7XHJcbiAgICAgICAgY29uc3QgeTEgPSByZXNvbHZlQ29sbGlzaW9uKGJvdW5kc0RpZmZZLCB5KTtcclxuXHJcbiAgICAgICAgbGV0IHgyID0geDE7XHJcbiAgICAgICAgbGV0IHkyID0geTE7XHJcblxyXG4gICAgICAgIC8vIG11dGF0ZSBzcHJpdGVcclxuICAgICAgICBzcHJpdGUudmVsb2NpdHkueCA9IHZlbG9jaXR5WDtcclxuICAgICAgICBzcHJpdGUueCA9IHgyO1xyXG4gICAgICAgIHNwcml0ZS52ZWxvY2l0eS55ID0gdmVsb2NpdHlZO1xyXG4gICAgICAgIHNwcml0ZS55ID0geTI7XHJcblxyXG5cclxuICAgICAgICBjb25zdCBjb2xsaXNpb25zID0gZ2V0Q29sbGlzaW9ucyhzcHJpdGUsIGNvbGxpZGVycyk7XHJcbiAgICAgICAgY29uc3Qgb3ZlcmxhcHMgPSBnZXRPdmVybGFwcyhzcHJpdGUsIGNvbGxpc2lvbnMpO1xyXG4gICAgICAgIGNvbnN0IGNvbWJpbmVkID0gZ2V0Q29tYmluZWRzKG92ZXJsYXBzKTtcclxuICAgICAgICBjb25zdCByZXNvbHV0aW9uID0gZ2V0UmVzb2x1dGlvbihjb21iaW5lZCk7XHJcblxyXG4gICAgICAgIHNwcml0ZS54ICs9IHJlc29sdXRpb24ueDtcclxuICAgICAgICBzcHJpdGUueSArPSByZXNvbHV0aW9uLnk7XHJcblxyXG4gICAgICAgIGlmIChzcHJpdGUgPT09IHBsYXllcikge1xyXG4gICAgICAgICAgY29uc3QgbWluTWFyZ2luID0gdmlld3BvcnQubWFyZ2luTGVmdDtcclxuICAgICAgICAgIGNvbnN0IG1heE1hcmdpbiA9IHZpZXdwb3J0LndpZHRoIC0gdmlld3BvcnQubWFyZ2luUmlnaHQ7XHJcbiAgICAgICAgICBjb25zdCB2aWV3cG9ydERpZmZYID0gZ2V0SW5uZXJEaWZmKFxyXG4gICAgICAgICAgICBzcHJpdGUueCxcclxuICAgICAgICAgICAgc3ByaXRlLndpZHRoLFxyXG4gICAgICAgICAgICB2aWV3cG9ydC54ICsgbWluTWFyZ2luLFxyXG4gICAgICAgICAgICB2aWV3cG9ydC54ICsgbWF4TWFyZ2luXHJcbiAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgIC8vIG11dGF0ZSB2aWV3cG9ydFxyXG4gICAgICAgICAgaWYgKHZpZXdwb3J0RGlmZlggPiAwICYmIHNwcml0ZS52ZWxvY2l0eS54ID4gMCkge1xyXG4gICAgICAgICAgICB2aWV3cG9ydC54ID0gZ2V0UG9zaXRpb25Gcm9tTWF4TWFyZ2luKHNwcml0ZS54LCBzcHJpdGUud2lkdGgsIG1heE1hcmdpbik7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKHZpZXdwb3J0RGlmZlggPCAwICYmIHNwcml0ZS52ZWxvY2l0eS54IDwgMCkge1xyXG4gICAgICAgICAgICB2aWV3cG9ydC54ID0gZ2V0UG9zaXRpb25Gcm9tTWluTWFyZ2luKHNwcml0ZS54LCBtaW5NYXJnaW4pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZnJhbWUgPSBhcHBseUFuaW1hdGlvbihzcHJpdGUpO1xyXG4gICAgICAgIGNvbnN0IHBvcyA9IHt4OiBzcHJpdGUueCwgeTogc3ByaXRlLnl9O1xyXG5cclxuICAgICAgICByZW5kZXIoY29udGV4dDJkLCBwb3MsIGZyYW1lLCB2aWV3cG9ydCk7XHJcbiAgICAgICAgcmVuZGVyUmVjdHMoY29udGV4dDJkLCBjb2xsaWRlcnMsIHZpZXdwb3J0KTtcclxuICAgICAgICByZW5kZXJSZWN0cyhjb250ZXh0MmQsIHNwcml0ZXMsIHZpZXdwb3J0KTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiBzY2VuZTtcclxuICB9KVxyXG4gIC50aGVuKGZ1bmN0aW9uIChzY2VuZSkge1xyXG4gICAgY29uc3QgYmFja2dyb3VuZEltYWdlID0gc2NlbmUuYmFja2dyb3VuZEltYWdlO1xyXG5cclxuICAgIGNvbnN0IGNhbnZhcyA9IEZyYWdtZW50KCdjYW52YXMtYmFja2dyb3VuZCcpO1xyXG4gICAgY29uc3QgY29udGV4dDJkID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcblxyXG4gICAgZ2V0RnJhbWVzKGZ1bmN0aW9uICgpIHtcclxuICAgICAgY2xlYXJDb250ZXh0KGNvbnRleHQyZCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcclxuICAgICAgLy9yZW5kZXIoY29udGV4dDJkLCB7eDogMCwgeTogMH0sIGJhY2tncm91bmRJbWFnZSwgdmlld3BvcnQpO1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIHNjZW5lO1xyXG4gIH0pO1xyXG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBTaGF1biBvbiAzLzEvMTVcclxuICpcclxuICovXHJcblxyXG5pbXBvcnQge2dldENhbnZhcywgZ2V0VHJhbnNwYXJlbnRJbWFnZX0gZnJvbSAnLi4vZW5naW5lL2NvbW1vbi5qcyc7XHJcblxyXG5jb25zdCBERUZBVUxUX1JBVEUgPSA1O1xyXG5cclxuZnVuY3Rpb24gYnVpbGRGcmFtZVNlcXVlbmNlKGZyYW1lU2V0RGVmaW5pdGlvbiwgZnJhbWVTaXplLCBzcHJpdGVTaGVldCkge1xyXG4gIHZhciBmcmFtZVdpZHRoID0gZnJhbWVTaXplLndpZHRoO1xyXG4gIHZhciBmcmFtZUhlaWdodCA9IGZyYW1lU2l6ZS5oZWlnaHQ7XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICByYXRlOiBmcmFtZVNldERlZmluaXRpb24ucmF0ZSB8fCBERUZBVUxUX1JBVEUsXHJcbiAgICBmcmFtZXM6IGZyYW1lU2V0RGVmaW5pdGlvbi5mcmFtZXNcclxuICAgICAgLm1hcChmdW5jdGlvbihmcmFtZURlZmluaXRpb24pIHtcclxuICAgICAgICB2YXIgZnJhbWUgPSBnZXRDYW52YXMoZnJhbWVXaWR0aCwgZnJhbWVIZWlnaHQpO1xyXG5cclxuICAgICAgICBmcmFtZVxyXG4gICAgICAgICAgLmdldENvbnRleHQoJzJkJylcclxuICAgICAgICAgIC5kcmF3SW1hZ2UoXHJcbiAgICAgICAgICAgIHNwcml0ZVNoZWV0LFxyXG4gICAgICAgICAgICBmcmFtZURlZmluaXRpb24ueCwgZnJhbWVEZWZpbml0aW9uLnksXHJcbiAgICAgICAgICAgIGZyYW1lV2lkdGgsIGZyYW1lSGVpZ2h0LFxyXG4gICAgICAgICAgICAwLCAwLFxyXG4gICAgICAgICAgICBmcmFtZVdpZHRoLCBmcmFtZUhlaWdodFxyXG4gICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGZyYW1lO1xyXG4gICAgICB9KVxyXG4gIH07XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChzcHJpdGVEZWZpbml0aW9uLCBzcHJpdGVTaGVldCkge1xyXG4gIHJldHVybiBPYmplY3RcclxuICAgIC5rZXlzKHNwcml0ZURlZmluaXRpb24uYW5pbWF0aW9ucylcclxuICAgIC5yZWR1Y2UoZnVuY3Rpb24oZnJhbWVTZXQsIGZyYW1lU2V0SWQpIHtcclxuICAgICAgdmFyIGZyYW1lU2VxdWVuY2UgPSBidWlsZEZyYW1lU2VxdWVuY2UoXHJcbiAgICAgICAgc3ByaXRlRGVmaW5pdGlvbi5hbmltYXRpb25zW2ZyYW1lU2V0SWRdLFxyXG4gICAgICAgIHNwcml0ZURlZmluaXRpb24uZnJhbWVTaXplLFxyXG4gICAgICAgIHNwcml0ZVNoZWV0XHJcbiAgICAgICk7XHJcblxyXG4gICAgICBmcmFtZVNlcXVlbmNlLmZyYW1lcyA9IGZyYW1lU2VxdWVuY2UuZnJhbWVzXHJcbiAgICAgICAgLm1hcChmdW5jdGlvbihmcmFtZSkge1xyXG4gICAgICAgICAgcmV0dXJuIGdldFRyYW5zcGFyZW50SW1hZ2Uoc3ByaXRlRGVmaW5pdGlvbi50cmFuc3BhcmVudENvbG9yLCBmcmFtZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICBmcmFtZVNldFtmcmFtZVNldElkXSA9IGZyYW1lU2VxdWVuY2U7XHJcblxyXG4gICAgICByZXR1cm4gZnJhbWVTZXQ7XHJcbiAgICB9LCB7fSk7XHJcbn07XHJcbiIsImltcG9ydCBTY2hlZHVsZXIgZnJvbSAnLi4vZW5naW5lL3NjaGVkdWxlci5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoZnJhbWVTZXQpIHtcclxuICB2YXIgY3VycmVudEZyYW1lU2VxdWVuY2UgPSBmcmFtZVNldFsncnVuJ10sIC8vbnVsbCxcclxuICAgIGN1cnJlbnRGcmFtZUluZGV4ID0gMCxcclxuICAgIGN1cnJlbnRGcmFtZSA9IG51bGwsXHJcbiAgICBmcmFtZUNhbGxiYWNrID0gbnVsbDtcclxuXHJcbiAgdmFyIHNjaGVkdWxlcklkID0gU2NoZWR1bGVyKGZ1bmN0aW9uKGRlbHRhVGltZSwgc2V0UmF0ZSkge1xyXG4gICAgaWYoIWN1cnJlbnRGcmFtZVNlcXVlbmNlKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBpZighY3VycmVudEZyYW1lKSB7XHJcbiAgICAgIHNldFJhdGUoY3VycmVudEZyYW1lU2VxdWVuY2UucmF0ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgY3VycmVudEZyYW1lID0gY3VycmVudEZyYW1lU2VxdWVuY2UuZnJhbWVzW2N1cnJlbnRGcmFtZUluZGV4XTtcclxuICAgIGlmKGZyYW1lQ2FsbGJhY2spIHtcclxuICAgICAgZnJhbWVDYWxsYmFjayhjdXJyZW50RnJhbWUpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmKCsrY3VycmVudEZyYW1lSW5kZXggPj0gY3VycmVudEZyYW1lU2VxdWVuY2UuZnJhbWVzLmxlbmd0aCkge1xyXG4gICAgICBjdXJyZW50RnJhbWVJbmRleCA9IDA7XHJcbiAgICB9XHJcbiAgfSlcclxuICAgIC5pZCgpO1xyXG5cclxuICByZXR1cm4ge1xyXG4gICAgcGxheTogZnVuY3Rpb24oZnJhbWVTZXRJZCkge1xyXG4gICAgICBjdXJyZW50RnJhbWVTZXF1ZW5jZSA9IGZyYW1lU2V0W2ZyYW1lU2V0SWRdO1xyXG4gICAgICBjdXJyZW50RnJhbWVJbmRleCA9IDA7XHJcbiAgICAgIGN1cnJlbnRGcmFtZSA9IG51bGw7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuICAgIG9uRnJhbWU6IGZ1bmN0aW9uKGNiKSB7XHJcbiAgICAgIGZyYW1lQ2FsbGJhY2sgPSBjYjtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG4gICAgc3RvcDogZnVuY3Rpb24oKSB7XHJcbiAgICAgIGN1cnJlbnRGcmFtZVNlcXVlbmNlID0gbnVsbDtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG4gICAga2lsbDogZnVuY3Rpb24oKSB7XHJcbiAgICAgIFNjaGVkdWxlci51bnNjaGVkdWxlKHNjaGVkdWxlcklkKTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG4gICAgY3VycmVudEZyYW1lSW5kZXg6IGZ1bmN0aW9uKCkge1xyXG4gICAgICByZXR1cm4gY3VycmVudEZyYW1lSW5kZXg7XHJcbiAgICB9LFxyXG4gICAgZ2V0SW1hZ2U6IGZ1bmN0aW9uKCkge1xyXG4gICAgICByZXR1cm4gY3VycmVudEZyYW1lO1xyXG4gICAgfSxcclxuICAgIGdldE5leHQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICBjdXJyZW50RnJhbWUgPSBjdXJyZW50RnJhbWVTZXF1ZW5jZS5mcmFtZXNbY3VycmVudEZyYW1lSW5kZXhdO1xyXG4gICAgICBpZigrK2N1cnJlbnRGcmFtZUluZGV4ID49IGN1cnJlbnRGcmFtZVNlcXVlbmNlLmZyYW1lcy5sZW5ndGgpIHtcclxuICAgICAgICBjdXJyZW50RnJhbWVJbmRleCA9IDA7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGN1cnJlbnRGcmFtZTtcclxuICAgIH1cclxuICB9O1xyXG59XHJcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBzaGF1bndlc3Qgb24gNi8yOS8xNS5cbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gY2xlYXJDb250ZXh0KGNvbnRleHQyZCwgd2lkdGgsIGhlaWdodCkge1xuICBjb250ZXh0MmQuY2xlYXJSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyKGNvbnRleHQyZCwgcG9pbnQsIGltYWdlLCB2aWV3cG9ydCkge1xuICBpZighaW1hZ2UpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgY29udGV4dDJkLmRyYXdJbWFnZShcbiAgICBpbWFnZSxcbiAgICBwb2ludC54IC0gdmlld3BvcnQueCB8fCAwLFxuICAgIHBvaW50LnkgLSB2aWV3cG9ydC55IHx8IDBcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlclJlY3RzKGNvbnRleHQyZCwgcmVjdHMsIHZpZXdwb3J0LCBjb2xvcikge1xuICBjb2xvciA9IGNvbG9yIHx8ICcjMDAwMDAwJztcbiAgcmVjdHMuZm9yRWFjaChmdW5jdGlvbiAocmVjdCkge1xuICAgIGNvbnRleHQyZC5zdHJva2VTdHlsZSA9IGNvbG9yO1xuICAgIGNvbnRleHQyZC5zdHJva2VSZWN0KHJlY3QueCAtIHZpZXdwb3J0LngsIHJlY3QueSAtIHZpZXdwb3J0LnksIHJlY3Qud2lkdGgsIHJlY3QuaGVpZ2h0KTtcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJMaW5lcyhjb250ZXh0MmQsIGxpbmVzLCB2aWV3cG9ydCkge1xuICBsaW5lcy5mb3JFYWNoKGZ1bmN0aW9uIChsaW5lKSB7XG4gICAgY29udGV4dDJkLmJlZ2luUGF0aCgpO1xuICAgIGNvbnRleHQyZC5tb3ZlVG8obGluZS54MSAtIHZpZXdwb3J0LngsIGxpbmUueTEgLSB2aWV3cG9ydC55KTtcbiAgICBjb250ZXh0MmQubGluZVRvKGxpbmUueDIgLSB2aWV3cG9ydC54LCBsaW5lLnkyIC0gdmlld3BvcnQueSk7XG4gICAgY29udGV4dDJkLnN0cm9rZSgpO1xuICB9KTtcbn1cbiIsIlxyXG5pbXBvcnQgVXRpbCBmcm9tICcuL3V0aWwuanMnO1xyXG5cclxuLy8gUmV0dXJuIGV2ZXJ5dGhpbmcgYmVmb3JlIHRoZSBsYXN0IHNsYXNoIG9mIGEgdXJsXHJcbi8vIGUuZy4gaHR0cDovL2Zvby9iYXIvYmF6Lmpzb24gPT4gaHR0cDovL2Zvby9iYXJcclxuZXhwb3J0IGZ1bmN0aW9uIGdldEJhc2VVcmwodXJsKSB7XHJcbiAgdmFyIG4gPSB1cmwubGFzdEluZGV4T2YoJy8nKTtcclxuICByZXR1cm4gdXJsLnN1YnN0cmluZygwLCBuKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGlzRnVsbFVybCh1cmwpIHtcclxuICByZXR1cm4gKHVybC5zdWJzdHJpbmcoMCwgNykgPT09ICdodHRwOi8vJyB8fFxyXG4gICAgdXJsLnN1YnN0cmluZygwLCA4KSA9PT0gJ2h0dHBzOi8vJyk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVVcmwodXJsLCBiYXNlVXJsKSB7XHJcbiAgaWYoYmFzZVVybCAmJiAhaXNGdWxsVXJsKHVybCkpIHtcclxuICAgIHJldHVybiBiYXNlVXJsICsgJy8nICsgdXJsO1xyXG4gIH1cclxuICByZXR1cm4gdXJsO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VPYmplY3Qoc291cmNlLCBkZXN0aW5hdGlvbiwgYWxsb3dXcmFwLCBleGNlcHRpb25PbkNvbGxpc2lvbnMpIHtcclxuICBzb3VyY2UgPSBzb3VyY2UgfHwge307IC8vUG9vbC5nZXRPYmplY3QoKTtcclxuICBkZXN0aW5hdGlvbiA9IGRlc3RpbmF0aW9uIHx8IHt9OyAvL1Bvb2wuZ2V0T2JqZWN0KCk7XHJcblxyXG4gIE9iamVjdC5rZXlzKHNvdXJjZSkuZm9yRWFjaChmdW5jdGlvbihwcm9wKSB7XHJcbiAgICBhc3NpZ25Qcm9wZXJ0eShzb3VyY2UsIGRlc3RpbmF0aW9uLCBwcm9wLCBhbGxvd1dyYXAsIGV4Y2VwdGlvbk9uQ29sbGlzaW9ucyk7XHJcbiAgfSk7XHJcblxyXG4gIHJldHVybiBkZXN0aW5hdGlvbjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGFzc2lnblByb3BlcnR5KHNvdXJjZSwgZGVzdGluYXRpb24sIHByb3AsIGFsbG93V3JhcCwgZXhjZXB0aW9uT25Db2xsaXNpb25zKSB7XHJcbiAgaWYoZGVzdGluYXRpb24uaGFzT3duUHJvcGVydHkocHJvcCkpIHtcclxuICAgIGlmKGFsbG93V3JhcCkge1xyXG4gICAgICBkZXN0aW5hdGlvbltwcm9wXSA9IEZ1bmMud3JhcChkZXN0aW5hdGlvbltwcm9wXSwgc291cmNlW3Byb3BdKTtcclxuICAgICAgVXRpbC5sb2coJ01lcmdlOiB3cmFwcGVkIFxcJycgKyBwcm9wICsgJ1xcJycpO1xyXG4gICAgfSBlbHNlIGlmKGV4Y2VwdGlvbk9uQ29sbGlzaW9ucykge1xyXG4gICAgICBVdGlsLmVycm9yKCdGYWlsZWQgdG8gbWVyZ2UgbWl4aW4uIE1ldGhvZCBcXCcnICtcclxuICAgICAgcHJvcCArICdcXCcgY2F1c2VkIGEgbmFtZSBjb2xsaXNpb24uJyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBkZXN0aW5hdGlvbltwcm9wXSA9IHNvdXJjZVtwcm9wXTtcclxuICAgICAgVXRpbC5sb2coJ01lcmdlOiBvdmVyd3JvdGUgXFwnJyArIHByb3AgKyAnXFwnJyk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZGVzdGluYXRpb247XHJcbiAgfVxyXG5cclxuICBkZXN0aW5hdGlvbltwcm9wXSA9IHNvdXJjZVtwcm9wXTtcclxuXHJcbiAgcmV0dXJuIGRlc3RpbmF0aW9uO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2FudmFzKHdpZHRoLCBoZWlnaHQpIHtcclxuICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcblxyXG4gIGNhbnZhcy53aWR0aCA9IHdpZHRoIHx8IDUwMDtcclxuICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0IHx8IDUwMDtcclxuXHJcbiAgcmV0dXJuIGNhbnZhcztcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGludGVyc2VjdHMocmVjdEEsIHJlY3RCKSB7XHJcbiAgcmV0dXJuICEoXHJcbiAgICByZWN0QS54ICsgcmVjdEEud2lkdGggPCByZWN0Qi54IHx8XHJcbiAgICByZWN0QS55ICsgcmVjdEEuaGVpZ2h0IDwgcmVjdEIueSB8fFxyXG4gICAgcmVjdEEueCA+IHJlY3RCLnggKyByZWN0Qi53aWR0aCB8fFxyXG4gICAgcmVjdEEueSA+IHJlY3RCLnkgKyByZWN0Qi5oZWlnaHRcclxuICApO1xyXG59XHJcblxyXG4vLyBNYWtlIHRoZSBnaXZlbiBSR0IgdmFsdWUgdHJhbnNwYXJlbnQgaW4gdGhlIGdpdmVuIGltYWdlLlxyXG4vLyBSZXR1cm5zIGEgbmV3IGltYWdlLlxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0VHJhbnNwYXJlbnRJbWFnZSh0cmFuc1JHQiwgaW1hZ2UpIHtcclxuICB2YXIgciwgZywgYiwgbmV3SW1hZ2UsIGRhdGFMZW5ndGg7XHJcbiAgdmFyIHdpZHRoID0gaW1hZ2Uud2lkdGg7XHJcbiAgdmFyIGhlaWdodCA9IGltYWdlLmhlaWdodDtcclxuICB2YXIgaW1hZ2VEYXRhID0gaW1hZ2VcclxuICAgIC5nZXRDb250ZXh0KCcyZCcpXHJcbiAgICAuZ2V0SW1hZ2VEYXRhKDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xyXG5cclxuICBpZih0cmFuc1JHQikge1xyXG4gICAgZGF0YUxlbmd0aCA9IHdpZHRoICogaGVpZ2h0ICogNDtcclxuXHJcbiAgICBmb3IodmFyIGluZGV4ID0gMDsgaW5kZXggPCBkYXRhTGVuZ3RoOyBpbmRleCs9NCkge1xyXG4gICAgICByID0gaW1hZ2VEYXRhLmRhdGFbaW5kZXhdO1xyXG4gICAgICBnID0gaW1hZ2VEYXRhLmRhdGFbaW5kZXggKyAxXTtcclxuICAgICAgYiA9IGltYWdlRGF0YS5kYXRhW2luZGV4ICsgMl07XHJcbiAgICAgIGlmKHIgPT09IHRyYW5zUkdCWzBdICYmIGcgPT09IHRyYW5zUkdCWzFdICYmIGIgPT09IHRyYW5zUkdCWzJdKSB7XHJcbiAgICAgICAgaW1hZ2VEYXRhLmRhdGFbaW5kZXggKyAzXSA9IDA7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIG5ld0ltYWdlID0gZ2V0Q2FudmFzKHdpZHRoLCBoZWlnaHQpO1xyXG4gIG5ld0ltYWdlXHJcbiAgICAuZ2V0Q29udGV4dCgnMmQnKVxyXG4gICAgLnB1dEltYWdlRGF0YShpbWFnZURhdGEsIDAsIDApO1xyXG5cclxuICByZXR1cm4gbmV3SW1hZ2U7XHJcbn1cclxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgU2hhdW4gb24gNC8yMy8yMDE1LlxyXG4gKi9cclxuXHJcbnZhciBhbGxEYXRhRWxlbWVudHM7XHJcblxyXG5mdW5jdGlvbiBoYXNEYXRhQXR0cmlidXRlKGVsZW1lbnQpIHtcclxuICB2YXIgYXR0cmlidXRlcyA9IGVsZW1lbnQuYXR0cmlidXRlcztcclxuICBmb3IodmFyIGkgPSAwLCBudW1BdHRyaWJ1dGVzID0gYXR0cmlidXRlcy5sZW5ndGg7IGkgPCBudW1BdHRyaWJ1dGVzOyBpKyspIHtcclxuICAgIGlmKGF0dHJpYnV0ZXNbaV0ubmFtZS5zdWJzdHIoMCwgNCkgPT09ICdkYXRhJykge1xyXG4gICAgICByZXR1cm4gZWxlbWVudDtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBmaW5kRGF0YUVsZW1lbnRzIChwYXJlbnRFbGVtZW50KSB7XHJcbiAgdmFyIGFsbEVsZW1lbnRzLCBlbGVtZW50LCBkYXRhRWxlbWVudHMgPSBbXTtcclxuXHJcbiAgaWYoIXBhcmVudEVsZW1lbnQpIHtcclxuICAgIHZhciBodG1sID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2h0bWwnKTtcclxuICAgIGlmKCFodG1sWzBdKSB7XHJcbiAgICAgIHJldHVybiBkYXRhRWxlbWVudHM7XHJcbiAgICB9XHJcbiAgICBwYXJlbnRFbGVtZW50ID0gaHRtbFswXTtcclxuICB9XHJcblxyXG4gIGFsbEVsZW1lbnRzID0gcGFyZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCcqJyk7XHJcbiAgZm9yKHZhciBpID0gMCwgbnVtRWxlbWVudHMgPSBhbGxFbGVtZW50cy5sZW5ndGg7IGkgPCBudW1FbGVtZW50czsgaSsrKSB7XHJcbiAgICBlbGVtZW50ID0gYWxsRWxlbWVudHNbaV07XHJcbiAgICBpZihoYXNEYXRhQXR0cmlidXRlKGVsZW1lbnQpKSB7XHJcbiAgICAgIGRhdGFFbGVtZW50cy5wdXNoKGVsZW1lbnQpO1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gZGF0YUVsZW1lbnRzO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gRnJhZ21lbnRzIChuYW1lKSB7XHJcbiAgaWYoIWFsbERhdGFFbGVtZW50cykge1xyXG4gICAgY2FjaGVEYXRhRWxlbWVudHMoKTtcclxuICB9XHJcbiAgcmV0dXJuIGFsbERhdGFFbGVtZW50cy5maWx0ZXIoZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgaWYoZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2RhdGEtJyArIG5hbWUpKSB7XHJcbiAgICAgIHJldHVybiBlbGVtZW50O1xyXG4gICAgfVxyXG4gIH0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gRnJhZ21lbnQgKG5hbWUpIHtcclxuICByZXR1cm4gRnJhZ21lbnRzKG5hbWUpWzBdO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY2FjaGVEYXRhRWxlbWVudHMoKSB7XHJcbiAgYWxsRGF0YUVsZW1lbnRzID0gZmluZERhdGFFbGVtZW50cygpO1xyXG59XHJcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBzaGF1bndlc3Qgb24gNi8yMC8xNS5cbiAqL1xuXG5jb25zdCBNU19QRVJfU0VDT05EID0gMTAwMDtcblxuZnVuY3Rpb24gZ2V0RGVsdGFUaW1lKG5vdywgbGFzdFVwZGF0ZVRpbWUpIHtcbiAgcmV0dXJuIChub3cgLSBsYXN0VXBkYXRlVGltZSkgLyBNU19QRVJfU0VDT05EO1xufVxuXG4vLyBTVEFURUZVTFxuZnVuY3Rpb24gRnJhbWVMb29wKHN0YXJ0KSB7XG4gIGxldCBjYnMgPSBbXSwgbGFzdCA9IHN0YXJ0LCBmcHMgPSAwLCBmcmFtZUNvdW50ID0gMDtcbiAgbGV0IGludGVydmFsSWQgPSBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgZnBzID0gZnJhbWVDb3VudDtcbiAgICBmcmFtZUNvdW50ID0gMDtcbiAgfSwgTVNfUEVSX1NFQ09ORCk7XG5cbiAgKGZ1bmN0aW9uIGxvb3AoKSB7XG4gICAgZnJhbWVDb3VudCsrO1xuXG4gICAgY2JzID0gY2JzXG4gICAgICAubWFwKGZ1bmN0aW9uIChjYikge1xuICAgICAgICByZXR1cm4gY2IoZnBzLCBsYXN0KSAmJiBjYjtcbiAgICAgIH0pXG4gICAgICAuZmlsdGVyKGZ1bmN0aW9uIChjYikge1xuICAgICAgICByZXR1cm4gY2I7XG4gICAgICB9KTtcblxuICAgIGxhc3QgPSArbmV3IERhdGUoKTtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUobG9vcCk7XG4gIH0pKCk7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChjYikge1xuICAgIGNicy5wdXNoKGNiKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gRnJhbWUoKSB7XG4gIGNvbnN0IGZyYW1lTG9vcCA9IEZyYW1lTG9vcCgrbmV3IERhdGUoKSk7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChjYikge1xuICAgIGZyYW1lTG9vcChmdW5jdGlvbiAoZnBzLCBsYXN0VXBkYXRlVGltZSkge1xuICAgICAgY29uc3QgZWxhcHNlZCA9IGdldERlbHRhVGltZSgrbmV3IERhdGUoKSwgbGFzdFVwZGF0ZVRpbWUpO1xuICAgICAgcmV0dXJuIGNiKGVsYXBzZWQsIGZwcyk7XG4gICAgfSk7XG4gIH1cbn1cbiIsIi8qKlxuICogQ3JlYXRlZCBieSBTaGF1biBvbiA1LzEvMTQuXG4gKi9cblxudmFyIElNQUdFX1dBSVRfSU5URVJWQUwgPSAxMDA7XG5cbmZ1bmN0aW9uIHdhaXRGb3JJbWFnZSAoaW1hZ2UpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgIHZhciBpbnRlcnZhbElkID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgICBpZihpbWFnZS5jb21wbGV0ZSkge1xuICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsSWQpO1xuICAgICAgICByZXNvbHZlKGltYWdlKTtcbiAgICAgIH1cbiAgICB9LCBJTUFHRV9XQUlUX0lOVEVSVkFMKTtcblxuICAgIGltYWdlLm9uZXJyb3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBjbGVhckludGVydmFsKGludGVydmFsSWQpO1xuICAgICAgcmVqZWN0KCk7XG4gICAgfTtcbiAgfSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdldEltYWdlICh1cmkpIHtcbiAgdmFyIGltYWdlLCBwcm9taXNlO1xuXG4gIGltYWdlID0gbmV3IEltYWdlKCk7XG4gIGltYWdlLnNyYyA9IHVyaTtcblxuICBwcm9taXNlID0gd2FpdEZvckltYWdlKGltYWdlKTtcblxuICByZXR1cm4gcHJvbWlzZTtcbn1cbiIsIi8qKlxuICogQ3JlYXRlZCBieSBzaGF1bndlc3Qgb24gNi8yOC8xNS5cbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBJbnB1dCgpIHtcbiAgdmFyIGtleXMgPSB7fTtcblxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uIChldmVudCkge1xuICAgIGtleXNbZXZlbnQua2V5Q29kZV0gPSB0cnVlO1xuICB9KTtcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAga2V5c1tldmVudC5rZXlDb2RlXSA9IGZhbHNlO1xuICB9KTtcblxuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBrZXlzO1xuICB9O1xufVxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgU2hhdW4gb24gMi8xLzE1XHJcbiAqIEJhc2VkIG9uIHRoZSBqYWNrMmQgQ2hyb25vIG9iamVjdFxyXG4gKiBcclxuICovXHJcblxyXG5pbXBvcnQgVXRpbCBmcm9tICcuL3V0aWwuanMnO1xyXG5pbXBvcnQge21lcmdlT2JqZWN0fSBmcm9tICcuL2NvbW1vbi5qcyc7XHJcblxyXG52YXIgaW5zdGFuY2U7XHJcbnZhciBPTkVfU0VDT05EID0gMTAwMDtcclxuXHJcbi8vIGdldCByaWQgb2YgaW5zdGFuY2Ugc3R1ZmYuIEp1c3QgdXNlIHRoZSBkaSBjb250YWluZXIncyByZWdpc3RlclNpbmdsZXRvbi91c2VcclxuZnVuY3Rpb24gU2NoZWR1bGVyKGNiLCByYXRlKSB7XHJcbiAgaWYoIWluc3RhbmNlKSB7XHJcbiAgICBpbnN0YW5jZSA9IGNyZWF0ZSgpO1xyXG4gIH1cclxuICBpZihjYikge1xyXG4gICAgaW5zdGFuY2Uuc2NoZWR1bGUoY2IsIHJhdGUpO1xyXG4gIH1cclxuICByZXR1cm4gaW5zdGFuY2U7XHJcbn1cclxuXHJcblNjaGVkdWxlci5pbnN0YW5jZSA9IGNyZWF0ZTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZSgpIHtcclxuICByZXR1cm4gbWVyZ2VPYmplY3Qoe1xyXG4gICAgc2NoZWR1bGVkOiBbXSxcclxuICAgIHNjaGVkdWxlOiBzY2hlZHVsZSxcclxuICAgIHVuc2NoZWR1bGU6IHVuc2NoZWR1bGUsXHJcbiAgICBzdGFydDogc3RhcnQsXHJcbiAgICBzdG9wOiBzdG9wLFxyXG4gICAgZnJhbWU6IGZyYW1lLFxyXG4gICAgaWQ6IGlkXHJcbiAgfSkuc3RhcnQoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2NoZWR1bGUoY2IsIHJhdGUpIHtcclxuICBmdW5jdGlvbiBzZXRSYXRlKG5ld1JhdGUpIHtcclxuICAgIHJhdGUgPSBuZXdSYXRlO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gbWFrZUZyYW1lKCkge1xyXG4gICAgdmFyIGNvdW50ID0gMSxcclxuICAgICAgdG90YWxEZWx0YVRpbWUgPSAwO1xyXG5cclxuICAgIHJldHVybiBmdW5jdGlvbihkZWx0YVRpbWUpIHtcclxuICAgICAgdG90YWxEZWx0YVRpbWUgKz0gZGVsdGFUaW1lO1xyXG4gICAgICBpZihjb3VudCAhPT0gcmF0ZSkge1xyXG4gICAgICAgIGNvdW50Kys7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIGNiKHRvdGFsRGVsdGFUaW1lLCBzZXRSYXRlKTtcclxuICAgICAgY291bnQgPSAxO1xyXG4gICAgICB0b3RhbERlbHRhVGltZSA9IDA7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgaWYoIVV0aWwuaXNGdW5jdGlvbihjYikpIHtcclxuICAgIFV0aWwuZXJyb3IoJ1NjaGVkdWxlcjogb25seSBmdW5jdGlvbnMgY2FuIGJlIHNjaGVkdWxlZC4nKTtcclxuICB9XHJcbiAgcmF0ZSA9IHJhdGUgfHwgMTtcclxuXHJcbiAgdGhpcy5zY2hlZHVsZWQucHVzaChtYWtlRnJhbWUoKSk7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpZCgpIHtcclxuICByZXR1cm4gdGhpcy5zY2hlZHVsZWQubGVuZ3RoO1xyXG59XHJcblxyXG5mdW5jdGlvbiB1bnNjaGVkdWxlKGlkKSB7XHJcbiAgdGhpcy5zY2hlZHVsZWQuc3BsaWNlKGlkIC0gMSwgMSk7XHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHN0YXJ0KCkge1xyXG4gIGlmKHRoaXMucnVubmluZykge1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBtZXJnZU9iamVjdCh7XHJcbiAgICBhY3R1YWxGcHM6IDAsXHJcbiAgICB0aWNrczogMCxcclxuICAgIGVsYXBzZWRTZWNvbmRzOiAwLFxyXG4gICAgcnVubmluZzogdHJ1ZSxcclxuICAgIGxhc3RVcGRhdGVUaW1lOiBuZXcgRGF0ZSgpLFxyXG4gICAgb25lU2Vjb25kVGltZXJJZDogd2luZG93LnNldEludGVydmFsKG9uT25lU2Vjb25kLmJpbmQodGhpcyksIE9ORV9TRUNPTkQpXHJcbiAgfSwgdGhpcyk7XHJcblxyXG4gIHJldHVybiB0aGlzLmZyYW1lKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHN0b3AoKSB7XHJcbiAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XHJcbiAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5vbmVTZWNvbmRUaW1lcklkKTtcclxuICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5hbmltYXRpb25GcmFtZUlkKTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNsZWFyKCkge1xyXG4gIHRoaXMuc2NoZWR1bGVkLmxlbmd0aCA9IDA7XHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGZyYW1lKCkge1xyXG4gIGV4ZWN1dGVGcmFtZUNhbGxiYWNrcy5iaW5kKHRoaXMpKGdldERlbHRhVGltZS5iaW5kKHRoaXMpKCkpO1xyXG4gIHRoaXMudGlja3MrKztcclxuXHJcbiAgaWYodGhpcy5ydW5uaW5nKSB7XHJcbiAgICB0aGlzLmFuaW1hdGlvbkZyYW1lSWQgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZyYW1lLmJpbmQodGhpcykpO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG9uT25lU2Vjb25kKCkge1xyXG4gIHRoaXMuYWN0dWFsRnBzID0gdGhpcy50aWNrcztcclxuICB0aGlzLnRpY2tzID0gMDtcclxuICB0aGlzLmVsYXBzZWRTZWNvbmRzKys7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGV4ZWN1dGVGcmFtZUNhbGxiYWNrcyhkZWx0YVRpbWUpIHtcclxuICB2YXIgc2NoZWR1bGVkID0gdGhpcy5zY2hlZHVsZWQ7XHJcblxyXG4gIGZvcih2YXIgaSA9IDAsIG51bVNjaGVkdWxlZCA9IHNjaGVkdWxlZC5sZW5ndGg7IGkgPCBudW1TY2hlZHVsZWQ7IGkrKykge1xyXG4gICAgc2NoZWR1bGVkW2ldKGRlbHRhVGltZSk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXREZWx0YVRpbWUoKSB7XHJcbiAgdmFyIG5vdyA9ICtuZXcgRGF0ZSgpO1xyXG4gIHZhciBkZWx0YVRpbWUgPSAobm93IC0gdGhpcy5sYXN0VXBkYXRlVGltZSkgLyBPTkVfU0VDT05EO1xyXG5cclxuICB0aGlzLmxhc3RVcGRhdGVUaW1lID0gbm93O1xyXG5cclxuICByZXR1cm4gZGVsdGFUaW1lO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBTY2hlZHVsZXI7XHJcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBzaGF1bndlc3Qgb24gNi8xMS8xNS5cbiAqL1xuXG5cbmltcG9ydCBWYWx2ZSBmcm9tICcuLi92YWx2ZS5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGZldGNoSlNPTih1cmkpIHtcbiAgLy9yZXR1cm4gVmFsdmUuY3JlYXRlKGZldGNoKHVyaSkudGhlbihyZXNwb25zZSA9PiByZXNwb25zZS5qc29uKCkpKTtcbiAgcmV0dXJuIGZldGNoKHVyaSkudGhlbihyZXNwb25zZSA9PiByZXNwb25zZS5qc29uKCkpO1xufSIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IFNoYXVuIG9uIDQvMjMvMjAxNS5cclxuICovXHJcblxyXG52YXIgdHlwZXMgPSBbJ0FycmF5JywgJ09iamVjdCcsICdCb29sZWFuJywgJ0FyZ3VtZW50cycsICdGdW5jdGlvbicsICdTdHJpbmcnLCAnTnVtYmVyJywgJ0RhdGUnLCAnUmVnRXhwJ107XHJcblxyXG52YXIgVXRpbCA9IHtcclxuICBpc0RlZmluZWQ6IGZ1bmN0aW9uICh2YWx1ZSkgeyByZXR1cm4gdHlwZW9mIHZhbHVlICE9ICd1bmRlZmluZWQnIH0sXHJcbiAgZGVmOiBmdW5jdGlvbiAodmFsdWUsIGRlZmF1bHRWYWx1ZSkgeyByZXR1cm4gKHR5cGVvZiB2YWx1ZSA9PSAndW5kZWZpbmVkJykgPyBkZWZhdWx0VmFsdWUgOiB2YWx1ZSB9LFxyXG4gIGVycm9yOiBmdW5jdGlvbiAobWVzc2FnZSkgeyB0aHJvdyBuZXcgRXJyb3IoaWQgKyAnOiAnICsgbWVzc2FnZSkgfSxcclxuICB3YXJuOiBmdW5jdGlvbiAobWVzc2FnZSkgeyBVdGlsLmxvZygnV2FybmluZzogJyArIG1lc3NhZ2UpIH0sXHJcbiAgbG9nOiBmdW5jdGlvbiAobWVzc2FnZSkgeyBpZihjb25maWcubG9nKSB7IGNvbnNvbGUubG9nKGlkICsgJzogJyArIG1lc3NhZ2UpIH0gfSxcclxuICBhcmdzVG9BcnJheTogZnVuY3Rpb24gKGFyZ3MpIHsgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3MpIH0sXHJcbiAgcmFuZDogZnVuY3Rpb24gKG1heCwgbWluKSB7IC8vIG1vdmUgdG8gZXh0cmE/XHJcbiAgICBtaW4gPSBtaW4gfHwgMDtcclxuICAgIGlmKG1pbiA+IG1heCkgeyBVdGlsLmVycm9yKCdyYW5kOiBpbnZhbGlkIHJhbmdlLicpOyB9XHJcbiAgICByZXR1cm4gTWF0aC5mbG9vcigoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSkpICsgKG1pbik7XHJcbiAgfVxyXG59O1xyXG5cclxuZm9yKHZhciBpID0gMDsgaSA8IHR5cGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgVXRpbFsnaXMnICsgdHlwZXNbaV1dID0gKGZ1bmN0aW9uKHR5cGUpIHtcclxuICAgIHJldHVybiBmdW5jdGlvbihvYmopIHtcclxuICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09ICdbb2JqZWN0ICcgKyB0eXBlICsgJ10nO1xyXG4gICAgfTtcclxuICB9KSh0eXBlc1tpXSk7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFV0aWw7IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IHNoYXVud2VzdCBvbiA2LzIwLzE1LlxuICpcbiAqIFRPRE86IGRpc3Bvc2UoKVxuICovXG5cbi8qKlxuICpcbnZhciB2YWx2ZSA9IFZhbHZlLmNyZWF0ZShmdW5jdGlvbiAoZW1pdCwgZXJyb3IpIHtcbiAgc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuICAgIGVycm9yKCdoZWxsbycpO1xuICB9LCA1MDApO1xufSkudGhlbihmdW5jdGlvbiAobXNnKSB7XG4gIHJldHVybiBtc2cgKyAnIFNoYXVuJztcbn0pLnRoZW4oZnVuY3Rpb24gKG5ld01zZykge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcbiAgICBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgICByZXNvbHZlKG5ld01zZyArICchISEhJyk7XG4gICAgfSwgNTAwKTtcbiAgfSk7XG59KS50aGVuKFxuICBmdW5jdGlvbiAobmV3ZXJNc2cpIHtcbiAgICBjb25zb2xlLmxvZyhuZXdlck1zZyk7XG4gIH0sIGZ1bmN0aW9uIChtc2cpIHtcbiAgICBjb25zb2xlLmxvZyhtc2cpO1xuICB9KTtcbiovXG5cbmZ1bmN0aW9uIGNsb25lQXJyYXkoYXJyYXkpIHtcbiAgcmV0dXJuIGFycmF5LnNsaWNlKDApO1xufVxuXG5mdW5jdGlvbiBoYW5kbGVBbGwodGhlbmFibGVzLCBkb0FwcGx5KSB7XG4gIHJldHVybiBWYWx2ZS5jcmVhdGUoZnVuY3Rpb24gKGVtaXQpIHtcbiAgICB2YXIgY291bnQgPSB0aGVuYWJsZXMubGVuZ3RoO1xuICAgIHZhciB2YWx1ZXMgPSBbXTtcblxuICAgIGZ1bmN0aW9uIGNoZWNrQ291bnQoKSB7XG4gICAgICBpZigtLWNvdW50ID09PSAwKSB7XG4gICAgICAgIChkb0FwcGx5KSA/XG4gICAgICAgICAgZW1pdC5hcHBseShudWxsLCB2YWx1ZXMpIDpcbiAgICAgICAgICBlbWl0KHZhbHVlcyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhlbmFibGVzLmZvckVhY2goZnVuY3Rpb24gKHRoZW5hYmxlLCBpbmRleCkge1xuICAgICAgaWYoIXRoZW5hYmxlKSB7XG4gICAgICAgIHRocm93ICdJbXBsZW1lbnQgZXJyb3Igc2NlbmFyaW8nO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmKCF0aGVuYWJsZS50aGVuKSB7XG4gICAgICAgIHZhbHVlc1tpbmRleF0gPSB0aGVuYWJsZTtcbiAgICAgICAgY2hlY2tDb3VudCgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRoZW5hYmxlLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHZhbHVlc1tpbmRleF0gPSB2YWx1ZTtcbiAgICAgICAgY2hlY2tDb3VudCgpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pXG59XG5cbmZ1bmN0aW9uIGl0ZXJhdGUoaXRlcmF0b3IsIHZhbHVlLCBhdHRhY2hlZCwgZmFpbGVkKSB7XG4gIGxldCBpdGVtID0gaXRlcmF0b3IubmV4dCgpO1xuICBpZiAoaXRlbS5kb25lKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgbGV0IGxpc3RlbmVyID0gKGZhaWxlZCkgP1xuICAgIGl0ZW0udmFsdWUuZmFpbCA6XG4gICAgaXRlbS52YWx1ZS5zdWNjZXNzO1xuXG4gIGlmICh2YWx1ZSAmJiB2YWx1ZS50aGVuKSB7XG4gICAgaWYodmFsdWUuYXR0YWNoZWQpIHtcbiAgICAgIGF0dGFjaGVkID0gYXR0YWNoZWQuY29uY2F0KHZhbHVlLmF0dGFjaGVkKTtcbiAgICB9XG5cbiAgICB2YWx1ZS50aGVuKFxuICAgICAgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIGl0ZXJhdGUoaXRlcmF0b3IsIGxpc3RlbmVyLmFwcGx5KG51bGwsIFt2YWx1ZV0uY29uY2F0KGF0dGFjaGVkKSksIGF0dGFjaGVkLCBmYWlsZWQpO1xuICAgICAgfSxcbiAgICAgIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICBpdGVyYXRlKGl0ZXJhdG9yLCBsaXN0ZW5lci5hcHBseShudWxsLCBbdmFsdWVdLmNvbmNhdChhdHRhY2hlZCkpLCBhdHRhY2hlZCwgdHJ1ZSk7XG4gICAgICB9XG4gICAgKTtcbiAgICByZXR1cm47XG4gIH1cbiAgaXRlcmF0ZShpdGVyYXRvciwgbGlzdGVuZXIuYXBwbHkobnVsbCwgW3ZhbHVlXS5jb25jYXQoYXR0YWNoZWQpKSwgYXR0YWNoZWQsIGZhaWxlZCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFZhbHZlIHtcbiAgY29uc3RydWN0b3IoZXhlY3V0b3IpIHtcbiAgICB0aGlzLnN0YXJ0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLmF0dGFjaGVkID0gW107XG4gICAgdGhpcy5saXN0ZW5lcnMgPSBbXTtcbiAgICB0aGlzLmV4ZWN1dG9yID0gZXhlY3V0b3I7XG4gIH1cblxuICBleGVjdXRlKCkge1xuICAgIC8vIEl0ZXJhdGUgb3ZlciBsaXN0ZW5lcnMgb24gbmV4dCBydW4gb2ZcbiAgICAvLyB0aGUganMgZXZlbnQgbG9vcFxuICAgIC8vIFRPRE86IG5vZGUgc3VwcG9ydFxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5leGVjdXRvcihcbiAgICAgICAgLy8gRW1pdFxuICAgICAgICAodmFsdWUpID0+IHtcbiAgICAgICAgICBpdGVyYXRlKHRoaXMubGlzdGVuZXJzW1N5bWJvbC5pdGVyYXRvcl0oKSwgdmFsdWUsIHRoaXMuYXR0YWNoZWQpO1xuICAgICAgICB9LFxuICAgICAgICAvLyBFcnJvclxuICAgICAgICAodmFsdWUpID0+IHtcbiAgICAgICAgICBpdGVyYXRlKHRoaXMubGlzdGVuZXJzW1N5bWJvbC5pdGVyYXRvcl0oKSwgdmFsdWUsIHRoaXMuYXR0YWNoZWQsIHRydWUpO1xuICAgICAgICB9XG4gICAgICApO1xuICAgIH0sIDEpO1xuICB9XG5cbiAgLy9UT0RPOiBlcnJvciBzY2VuYXJpb1xuICBzdGF0aWMgY3JlYXRlKGV4ZWN1dG9yKSB7XG4gICAgaWYoZXhlY3V0b3IudGhlbikge1xuICAgICAgcmV0dXJuIG5ldyBWYWx2ZShmdW5jdGlvbiAoZW1pdCkge1xuICAgICAgICBleGVjdXRvci50aGVuKGVtaXQpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVmFsdmUoZXhlY3V0b3IpO1xuICB9XG5cbiAgLy9UT0RPOiBlcnJvciBzY2VuYXJpb1xuICBzdGF0aWMgYWxsKHRoZW5hYmxlcykge1xuICAgIHJldHVybiBoYW5kbGVBbGwodGhlbmFibGVzKTtcbiAgfVxuXG4gIHN0YXRpYyBhcHBseUFsbCh0aGVuYWJsZXMpIHtcbiAgICByZXR1cm4gaGFuZGxlQWxsKHRoZW5hYmxlcywgdHJ1ZSk7XG4gIH1cblxuICBjbG9uZShvblN1Y2Nlc3MsIG9uRmFpbHVyZSkge1xuICAgIHZhciBuZXdWYWx2ZSA9IG5ldyBWYWx2ZSh0aGlzLmV4ZWN1dG9yKTtcbiAgICBuZXdWYWx2ZS5saXN0ZW5lcnMgPSBjbG9uZUFycmF5KHRoaXMubGlzdGVuZXJzKTtcbiAgICBuZXdWYWx2ZS5hdHRhY2hlZCA9IGNsb25lQXJyYXkodGhpcy5hdHRhY2hlZCk7XG4gICAgbmV3VmFsdmUuc3RhcnRlZCA9IHRoaXMuc3RhcnRlZDtcbiAgICByZXR1cm4gKG9uU3VjY2VzcykgPyBuZXdWYWx2ZS50aGVuKG9uU3VjY2Vzcywgb25GYWlsdXJlKSA6IG5ld1ZhbHZlO1xuICB9XG5cbiAgYXR0YWNoKHZhbHVlKSB7XG4gICAgdGhpcy5hdHRhY2hlZC5wdXNoKHZhbHVlKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHRoZW4ob25TdWNjZXNzLCBvbkZhaWx1cmUpIHtcbiAgICBpZih0eXBlb2Ygb25TdWNjZXNzICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyAnVmFsdmU6IHRoZW4oKSByZXF1aXJlcyBhIGZ1bmN0aW9uIGFzIGZpcnN0IGFyZ3VtZW50LidcbiAgICB9XG4gICAgdGhpcy5saXN0ZW5lcnMucHVzaCh7XG4gICAgICBzdWNjZXNzOiBvblN1Y2Nlc3MsXG4gICAgICBmYWlsOiBvbkZhaWx1cmUgfHwgZnVuY3Rpb24gKHZhbHVlKSB7IHJldHVybiB2YWx1ZTsgfVxuICAgIH0pO1xuXG4gICAgaWYoIXRoaXMuc3RhcnRlZCkge1xuICAgICAgdGhpcy5leGVjdXRlKCk7XG4gICAgICB0aGlzLnN0YXJ0ZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IHNoYXVud2VzdCBvbiA3LzgvMTUuXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGZsaXAgKGZuKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmdzLnJldmVyc2UoKSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBvc2UgKC4uLmZucykge1xuICByZXR1cm4gZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgIHJldHVybiBmbnMucmVkdWNlUmlnaHQoZnVuY3Rpb24gKHJlc3VsdCwgZm4pIHtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoaXMsIHJlc3VsdCk7XG4gICAgfSwgcmVzdWx0KTtcbiAgfTtcbn1cblxuZXhwb3J0IHZhciBzZXF1ZW5jZSA9IGZsaXAoY29tcG9zZSk7XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgc2hhdW53ZXN0IG9uIDUvOS8xNS5cbiAqL1xuXG5pbXBvcnQgZmV0Y2hKU09OIGZyb20gJy4uL2VuZ2luZS9zY2hlbWEvZmV0Y2gtc2NoZW1hLmpzJztcbmltcG9ydCBnZXRJbWFnZSBmcm9tICcuLi9lbmdpbmUvaW1hZ2UtbG9hZGVyLmpzJztcbmltcG9ydCBnZXRTcHJpdGVTY2hlbWEgZnJvbSAnLi4vc2NoZW1hL3Nwcml0ZS1zY2hlbWEuanMnO1xuaW1wb3J0IHNwcml0ZUFuaW1hdGlvbiBmcm9tICcuLi9hbmltYXRpb24vc3ByaXRlLWFuaW1hdGlvbi5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdldFNjZW5lU2NoZW1hKHVyaSkge1xuICByZXR1cm4gZmV0Y2hKU09OKHVyaSlcbiAgICAudGhlbihmdW5jdGlvbiAoc2NlbmUpIHtcbiAgICAgIHJldHVybiBnZXRJbWFnZShzY2VuZS5iYWNrZ3JvdW5kLmJhY2tncm91bmRVcmwpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uIChiYWNrZ3JvdW5kSW1hZ2UpIHtcbiAgICAgICAgICBzY2VuZS5iYWNrZ3JvdW5kSW1hZ2UgPSBiYWNrZ3JvdW5kSW1hZ2U7XG4gICAgICAgICAgcmV0dXJuIGdldFNwcml0ZVR5cGVzKHNjZW5lLnNwcml0ZXMpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoc3ByaXRlcykge1xuICAgICAgICAgICAgICBzY2VuZS5zcHJpdGVzID0gc3ByaXRlcztcbiAgICAgICAgICAgICAgcmV0dXJuIHNjZW5lO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0pXG4gICAgLnRoZW4oZnVuY3Rpb24gKHNjZW5lKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmZyZWV6ZShzY2VuZSk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFNwcml0ZVR5cGVzKHNwcml0ZXMpIHtcbiAgcmV0dXJuIFByb21pc2UuYWxsKHNwcml0ZXMubWFwKGdldFNwcml0ZVR5cGUpKTtcbn1cblxuZnVuY3Rpb24gZ2V0U3ByaXRlVHlwZShzcHJpdGUpIHtcbiAgcmV0dXJuIGdldFNwcml0ZVNjaGVtYShzcHJpdGUuc3JjVXJsKVxuICAgIC50aGVuKGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgIHNwcml0ZS50eXBlID0gdHlwZTtcbiAgICAgIC8vc3ByaXRlLmFuaW1hdGlvbiA9IHNwcml0ZUFuaW1hdGlvbih0eXBlLmZyYW1lU2V0KTtcbiAgICAgIHNwcml0ZS5hbmltYXRpb24gPSB7fTtcbiAgICAgIHNwcml0ZS52ZWxvY2l0eSA9IHsgeDogMCwgeTogMCB9O1xuICAgICAgc3ByaXRlLmFjY2VsZXJhdGlvbiA9IHsgeDogMCwgeTogMCB9O1xuICAgICAgc3ByaXRlLm1heFZlbG9jaXR5ID0geyB4OiA1MDAsIHk6IDUwMCB9O1xuICAgICAgLy9zcHJpdGUuZnJpY3Rpb24gPSB7IHg6IDAuOTksIHk6IDAuNTAgfTtcbiAgICAgIHNwcml0ZS5mcmljdGlvbiA9IHsgeDogMC45OSwgeTogMC45OSB9O1xuICAgICAgcmV0dXJuIHNwcml0ZTtcbiAgICB9KTtcbn1cbiIsIi8qKlxuICogQ3JlYXRlZCBieSBzaGF1bndlc3Qgb24gNS85LzE1LlxuICovXG5cbmltcG9ydCBmcmFtZVNldCBmcm9tICcuLi9hbmltYXRpb24vZnJhbWUtc2V0LmpzJztcbmltcG9ydCBmZXRjaEpTT04gZnJvbSAnLi4vZW5naW5lL3NjaGVtYS9mZXRjaC1zY2hlbWEuanMnO1xuaW1wb3J0IGdldEltYWdlIGZyb20gJy4uL2VuZ2luZS9pbWFnZS1sb2FkZXIuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBnZXRTcHJpdGVTY2hlbWEodXJpKSB7XG4gIHJldHVybiBmZXRjaEpTT04odXJpKVxuICAgIC50aGVuKGZ1bmN0aW9uIChzcHJpdGUpIHtcbiAgICAgIHJldHVybiBnZXRJbWFnZShzcHJpdGUuc3ByaXRlU2hlZXRVcmwpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uIChzcHJpdGVTaGVldCkge1xuICAgICAgICAgIHNwcml0ZS5zcHJpdGVTaGVldCA9IHNwcml0ZVNoZWV0O1xuICAgICAgICAgIHNwcml0ZS5mcmFtZVNldCA9IGZyYW1lU2V0KHNwcml0ZSwgc3ByaXRlU2hlZXQpO1xuICAgICAgICAgIHJldHVybiBzcHJpdGU7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IHNoYXVud2VzdCBvbiA1LzQvMTUuXG4gKi9cblxuZXhwb3J0IGRlZmF1bHQge1xuICB4OiAwLFxuICB5OiAwLFxuICBtYXJnaW5MZWZ0OiA2NCxcbiAgbWFyZ2luUmlnaHQ6IDY0LFxuICB3aWR0aDogMzAwLFxuICBoZWlnaHQ6IDQwMFxufTsiXX0=

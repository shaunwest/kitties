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

var _clearContext$render$renderRects = require('./canvas-renderer.js');

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

/*function getOuterDiff(position, size, minBound, maxBound) {
  const max = position + size;
  return (position < minBound && max > minBound && max - minBound ||
    position < maxBound && max > maxBound && position - maxBound ||
    0);
}*/

function getOuterDiff(position, size, minBound, maxBound) {
  var max = position + size;
  return position < minBound && max > minBound && max - minBound || position < maxBound && max > maxBound && position - maxBound || 0;
}

function resolveCollision(diff, val) {
  return val - diff;
}

function getCollidersInRange(rangeMin, rangeMax, colliders) {
  return colliders.filter(function (collider) {
    return inRange(rangeMin, rangeMax, collider);
  });
}

function inRange(rangeMin, rangeMax, collider) {
  return rangeMin < collider.rangeMax && rangeMax > collider.rangeMin;
}

function getMinPositionDiff(min, colliderMax) {
  return colliderMax - min;
}

function getMaxPositionDiff(max, colliderMin) {
  return colliderMin - max;
}

function getIntersectedColliders(colliders, positionMin, positionMax, rangeMin, rangeMax) {
  return colliders.filter(function (collider) {
    return rangeMin < collider.rangeMax && rangeMax > collider.rangeMin;
  }).map(function (collider) {
    return {
      positionMin: collider.positionMax - positionMin,
      positionMax: collider.positionMin - positionMax
    };
  }).filter(function (diff) {
    return diff.positionMin > 0 && diff.positionMax < 0;
  }).map(function (diff) {
    return Math.max(diff.positionMin, diff.positionMax);
  });

  /*.filter(collider =>
    rangeMin <= collider.rangeMax &&
    rangeMax >= collider.rangeMin &&
    positionMin <= collider.positionMax &&
    positionMax >= collider.positionMin
  );*/
}

function resolveCollisions(position, colliders) {
  // fixme: not returning??
  colliders.reduce(function (positionDelta, collider) {
    var diff = getOuterDiff(position, size, collider.positionMin, collider.positionMax);
    return diff ? position - diff : positionDelta;
  }, position);
}

function getCollisionResolve(colliders, position, size, rangeMin, rangeMax) {
  return colliders.filter(function (collider) {
    return rangeMin <= collider.rangeMax && rangeMax >= collider.rangeMin;
  }).reduce(function (positionDelta, collider) {
    var diff = getOuterDiff(position, size, collider.positionMin, collider.positionMax);

    return diff ? position - diff : positionDelta;
  }, position);
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
      x: collider.x,
      y: collider.y,
      width: collider.width,
      height: collider.height,
      positionMin: collider.x,
      positionMax: collider.x + collider.width,
      rangeMin: collider.y,
      rangeMax: collider.y + collider.height
    };
  });

  var collidersY = colliders.map(function (collider) {
    return {
      x: collider.x,
      y: collider.y,
      width: collider.width,
      height: collider.height,
      positionMin: collider.y,
      positionMax: collider.y + collider.height,
      rangeMin: collider.x,
      rangeMax: collider.x + collider.width
    };
  });

  var sprites = Object.freeze(scene.sprites);
  var player = sprites[0];

  getFrames(function (elapsed) {
    _clearContext$render$renderRects.clearContext(context2d, canvas.width, canvas.height);

    var inputs = getInputs();

    player.velocity.y = 300;

    if (inputs[37]) {
      player.velocity.x = -100;
    } else if (inputs[39]) {
      player.velocity.x = 100;
    }

    if (inputs[38]) {
      player.velocity.y = -500;
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

      var vals = getCollidersInRange(y1, y1 + sprite.height, collidersX).map(function (collider) {
        var maxDiff = getMaxPositionDiff(x1 + sprite.width, collider.positionMin);
        var minDiff = getMinPositionDiff(x1, collider.positionMax);

        return Math.min(Math.abs(maxDiff), Math.abs(minDiff));
      });

      console.log(vals);

      //const x2 = getCollisionResolve(collidersX, x1, sprite.width, y1, y1 + sprite.height);
      //const y2 = getCollisionResolve(collidersY, y1, sprite.height, x1, x1 + sprite.width);

      /*const intersectedCollidersX = getIntersectedColliders(
        collidersX,
        x1, x1 + sprite.width,
        y1, y1 + sprite.height
      );
        console.log('X', intersectedCollidersX);
        const x2 = (intersectedCollidersX.length) ? x1 + Math.min.apply(null, intersectedCollidersX) : x1;
        const intersectedCollidersY = getIntersectedColliders(
        collidersY,
        y1, y1 + sprite.height,
        x2, x2 + sprite.width
      );
        console.log('Y', intersectedCollidersY);
        const y2 = (intersectedCollidersY.length) ? y1 + Math.min.apply(null, intersectedCollidersY) : y1;*/
      //const intersectedCollidersY = getIntersectedColliders(collidersY, y1, y1 + sprite.height, x1, x1 + sprite.width);
      //const x2 = resolveCollisions(x1, intersectionsX);
      //const y2 = resolveCollisions(y1, intersectionsY);

      // mutate sprite
      sprite.velocity.x = velocityX;
      sprite.x = x2;
      sprite.velocity.y = velocityY;
      sprite.y = y2;

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

      _clearContext$render$renderRects.render(context2d, pos, frame, viewport);
      _clearContext$render$renderRects.renderRects(context2d, colliders, viewport);
      //renderRects(context2d, intersectedColliders, viewport, '#ff0000');
      _clearContext$render$renderRects.renderRects(context2d, sprites, viewport);
    });

    return true;
  });

  return scene;
}).then(function (scene) {
  var backgroundImage = scene.backgroundImage;

  var canvas = _Fragment.Fragment('canvas-background');
  var context2d = canvas.getContext('2d');

  getFrames(function () {
    _clearContext$render$renderRects.clearContext(context2d, canvas.width, canvas.height);
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
    sprite.friction = { x: 0.99, y: 0.5 };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvbWFpbi5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy9hbmltYXRpb24vZnJhbWUtc2V0LmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2FuaW1hdGlvbi9zcHJpdGUtYW5pbWF0aW9uLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2NhbnZhcy1yZW5kZXJlci5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy9lbmdpbmUvY29tbW9uLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9mcmFnbWVudHMuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL2ZyYW1lLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9pbWFnZS1sb2FkZXIuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL2lucHV0LmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9zY2hlZHVsZXIuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL3NjaGVtYS9mZXRjaC1zY2hlbWEuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL3V0aWwuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL3ZhbHZlLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2Z1bmMuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvc2NoZW1hL3NjZW5lLXNjaGVtYS5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy9zY2hlbWEvc3ByaXRlLXNjaGVtYS5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy92aWV3cG9ydC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O3dCQ0l1Qix1QkFBdUI7OzhCQUNuQiwwQkFBMEI7Ozs7cUJBQ25DLG1CQUFtQjs7OztxQkFDbkIsbUJBQW1COzs7O3dCQUNoQixlQUFlOzs7OytDQUNZLHNCQUFzQjs7d0JBQy9DLFdBQVc7O0FBRWxDLElBQU0sS0FBSyxHQUFHLDRCQUFlLHlCQUF5QixDQUFDLENBQUM7O0FBRXhELFNBQVMsd0JBQXdCLENBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUU7QUFDbEUsU0FBTyxBQUFDLFNBQVMsR0FBRyxVQUFVLEdBQUksU0FBUyxDQUFDO0NBQzdDOztBQUVELFNBQVMsd0JBQXdCLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRTtBQUN0RCxTQUFPLFNBQVMsR0FBRyxTQUFTLENBQUM7Q0FDOUI7O0FBRUQsU0FBUyxhQUFhLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUU7QUFDbEQsU0FBTyxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0NBQ25EOztBQUVELFNBQVMsSUFBSSxDQUFDLFFBQVEsRUFBRSxVQUFVLEVBQUU7QUFDbEMsU0FBTyxBQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsVUFBVSxHQUFJLENBQUMsR0FBRyxRQUFRLENBQUM7Q0FDekQ7O0FBRUQsU0FBUyxhQUFhLENBQUMsUUFBUSxFQUFFLFdBQVcsRUFBRTtBQUM1QyxTQUFPLEFBQUMsUUFBUSxHQUFHLENBQUMsR0FDbEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLEdBQy9CLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsV0FBVyxDQUFDLENBQUM7Q0FDcEM7O0FBRUQsU0FBUyxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRTtBQUMxRCxTQUFPLFFBQVEsR0FBSSxZQUFZLEdBQUcsT0FBTyxBQUFDLENBQUM7Q0FDNUM7O0FBRUQsU0FBUyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRTtBQUNyRCxTQUFPLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsQ0FBQztDQUNsRDs7QUFFRCxTQUFTLFdBQVcsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRTtBQUN6QyxNQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUM3QyxVQUFRLEdBQUcsaUJBQWlCLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDMUUsVUFBUSxHQUFHLGFBQWEsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUNsRSxTQUFPLGFBQWEsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0NBQ3pEOztBQUVELFNBQVMsWUFBWSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRTtBQUN4RCxNQUFNLEdBQUcsR0FBRyxRQUFRLEdBQUcsSUFBSSxDQUFDO0FBQzVCLFNBQVEsUUFBUSxHQUFHLFFBQVEsSUFBSSxRQUFRLEdBQUcsUUFBUSxJQUNoRCxHQUFHLEdBQUcsUUFBUSxJQUFJLEdBQUcsR0FBRyxRQUFRLElBQ2hDLENBQUMsQ0FBRTtDQUNOOzs7Ozs7Ozs7QUFTRCxTQUFTLFlBQVksQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUU7QUFDeEQsTUFBTSxHQUFHLEdBQUcsUUFBUSxHQUFHLElBQUksQ0FBQztBQUM1QixTQUFRLFFBQVEsR0FBRyxRQUFRLElBQUksR0FBRyxHQUFHLFFBQVEsSUFBSSxHQUFHLEdBQUcsUUFBUSxJQUM3RCxRQUFRLEdBQUcsUUFBUSxJQUFJLEdBQUcsR0FBRyxRQUFRLElBQUksUUFBUSxHQUFHLFFBQVEsSUFDNUQsQ0FBQyxDQUFFO0NBQ047O0FBRUQsU0FBUyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFO0FBQ25DLFNBQU8sR0FBRyxHQUFHLElBQUksQ0FBQztDQUNuQjs7QUFFRCxTQUFTLG1CQUFtQixDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFO0FBQzFELFNBQU8sU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVLFFBQVEsRUFBRTtBQUMxQyxXQUFPLE9BQU8sQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0dBQzlDLENBQUMsQ0FBQztDQUNKOztBQUVELFNBQVMsT0FBTyxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFO0FBQzdDLFNBQVEsUUFBUSxHQUFHLFFBQVEsQ0FBQyxRQUFRLElBQ2xDLFFBQVEsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFFO0NBQ2pDOztBQUVELFNBQVMsa0JBQWtCLENBQUMsR0FBRyxFQUFFLFdBQVcsRUFBRTtBQUM1QyxTQUFPLFdBQVcsR0FBRyxHQUFHLENBQUM7Q0FDMUI7O0FBRUQsU0FBUyxrQkFBa0IsQ0FBQyxHQUFHLEVBQUUsV0FBVyxFQUFFO0FBQzVDLFNBQU8sV0FBVyxHQUFHLEdBQUcsQ0FBQztDQUMxQjs7QUFFRCxTQUFTLHVCQUF1QixDQUFDLFNBQVMsRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUU7QUFDeEYsU0FBTyxTQUFTLENBQ2IsTUFBTSxDQUFDLFVBQVUsUUFBUSxFQUFFO0FBQzFCLFdBQVEsUUFBUSxHQUFHLFFBQVEsQ0FBQyxRQUFRLElBQ2xDLFFBQVEsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFFO0dBQ2pDLENBQUMsQ0FDRCxHQUFHLENBQUMsVUFBVSxRQUFRLEVBQUU7QUFDdkIsV0FBTztBQUNMLGlCQUFXLEVBQUUsUUFBUSxDQUFDLFdBQVcsR0FBRyxXQUFXO0FBQy9DLGlCQUFXLEVBQUUsUUFBUSxDQUFDLFdBQVcsR0FBRyxXQUFXO0tBQ2hELENBQUM7R0FDSCxDQUFDLENBQ0QsTUFBTSxDQUFDLFVBQVUsSUFBSSxFQUFFO0FBQ3RCLFdBQVEsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUU7R0FDdkQsQ0FBQyxDQUNELEdBQUcsQ0FBQyxVQUFVLElBQUksRUFBRTtBQUNuQixXQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7R0FDckQsQ0FBQyxDQUFDOzs7Ozs7OztDQVFOOztBQUVELFNBQVMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRTs7QUFFOUMsV0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVLGFBQWEsRUFBRSxRQUFRLEVBQUU7QUFDbEQsUUFBTSxJQUFJLEdBQUcsWUFBWSxDQUN2QixRQUFRLEVBQ1IsSUFBSSxFQUNKLFFBQVEsQ0FBQyxXQUFXLEVBQ3BCLFFBQVEsQ0FBQyxXQUFXLENBQ3JCLENBQUM7QUFDRixXQUFPLEFBQUMsSUFBSSxHQUNSLFFBQVEsR0FBRyxJQUFJLEdBQ2YsYUFBYSxDQUFDO0dBQ25CLEVBQUUsUUFBUSxDQUFDLENBQUM7Q0FDZDs7QUFFRCxTQUFTLG1CQUFtQixDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUU7QUFDMUUsU0FBTyxTQUFTLENBQ2IsTUFBTSxDQUFDLFVBQUEsUUFBUTtXQUNkLFFBQVEsSUFBSSxRQUFRLENBQUMsUUFBUSxJQUFJLFFBQVEsSUFBSSxRQUFRLENBQUMsUUFBUTtHQUFBLENBQy9ELENBQ0EsTUFBTSxDQUFDLFVBQUMsYUFBYSxFQUFFLFFBQVEsRUFBSztBQUNuQyxRQUFNLElBQUksR0FBRyxZQUFZLENBQ3JCLFFBQVEsRUFDUixJQUFJLEVBQ0osUUFBUSxDQUFDLFdBQVcsRUFDcEIsUUFBUSxDQUFDLFdBQVcsQ0FDdkIsQ0FBQzs7QUFFRixXQUFPLEFBQUMsSUFBSSxHQUNWLFFBQVEsR0FBRyxJQUFJLEdBQ2YsYUFBYSxDQUFDO0dBQ2pCLEVBQUUsUUFBUSxDQUFDLENBQUM7Q0FDaEI7O0FBRUQsU0FBUyxjQUFjLENBQUMsTUFBTSxFQUFFO0FBQzlCLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQzVELE1BQU0sVUFBVSxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUMsQ0FBQztBQUMxRSxRQUFNLENBQUMsU0FBUyxDQUFDLFlBQVksR0FBRyxVQUFVLENBQUM7O0FBRTNDLFNBQU8sUUFBUSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQTtDQUN0Qzs7QUFFRCxTQUFTLGFBQWEsQ0FBQyxZQUFZLEVBQUUsUUFBUSxFQUFFO0FBQzdDLE1BQU0sS0FBSyxHQUFHLFlBQVksSUFBSSxDQUFDLENBQUM7QUFDaEMsU0FBTyxBQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQ3hDLEtBQUssR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ2pCOztBQUVELFNBQVMsWUFBWSxDQUFDLE1BQU0sRUFBRTtBQUM1QixTQUFPLEtBQUssQ0FBQztDQUNkOztBQUVELFNBQVMsUUFBUSxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUU7QUFDakMsU0FBTyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0NBQy9COztBQUVELElBQU0sU0FBUyxHQUFHLG9CQUFPLENBQUM7QUFDMUIsSUFBTSxTQUFTLEdBQUcsb0JBQU8sQ0FBQztBQUMxQixJQUFNLFFBQVEsd0JBQVcsQ0FBQztBQUMxQixJQUFNLEtBQUssR0FBRyxVQWpMTixRQUFRLENBaUxPLEtBQUssQ0FBQyxDQUFDOztBQUU5QixTQUFTLENBQUMsVUFBVSxPQUFPLEVBQUUsR0FBRyxFQUFFO0FBQ2hDLE9BQUssQ0FBQyxXQUFXLEdBQUcsR0FBRyxDQUFDO0FBQ3hCLFNBQU8sSUFBSSxDQUFDO0NBQ2IsQ0FBQyxDQUFDOztBQUVILEtBQUssQ0FDRixJQUFJLENBQUMsVUFBVSxLQUFLLEVBQUU7QUFDckIsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUNoQyxTQUFLLEVBQUUsS0FBSyxDQUFDLFVBQVU7QUFDdkIsVUFBTSxFQUFFLEtBQUssQ0FBQyxXQUFXO0dBQzFCLENBQUMsQ0FBQzs7QUFFSCxNQUFNLE1BQU0sR0FBRyxVQS9MWCxRQUFRLENBK0xZLGlCQUFpQixDQUFDLENBQUM7QUFDM0MsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMxQyxNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQzs7QUFFakQsTUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFBLFFBQVEsRUFBSTtBQUMzQyxXQUFPO0FBQ0wsT0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ2IsT0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ2IsV0FBSyxFQUFFLFFBQVEsQ0FBQyxLQUFLO0FBQ3JCLFlBQU0sRUFBRSxRQUFRLENBQUMsTUFBTTtBQUN2QixpQkFBVyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ3ZCLGlCQUFXLEVBQUUsUUFBUSxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsS0FBSztBQUN4QyxjQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDcEIsY0FBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU07S0FDdkMsQ0FBQztHQUNILENBQUMsQ0FBQzs7QUFFSCxNQUFNLFVBQVUsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQUEsUUFBUSxFQUFJO0FBQzNDLFdBQU87QUFDTCxPQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDYixPQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDYixXQUFLLEVBQUUsUUFBUSxDQUFDLEtBQUs7QUFDckIsWUFBTSxFQUFFLFFBQVEsQ0FBQyxNQUFNO0FBQ3ZCLGlCQUFXLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDdkIsaUJBQVcsRUFBRSxRQUFRLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNO0FBQ3pDLGNBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUNwQixjQUFRLEVBQUUsUUFBUSxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsS0FBSztLQUN0QyxDQUFBO0dBQ0YsQ0FBQyxDQUFDOztBQUVILE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzdDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFMUIsV0FBUyxDQUFDLFVBQVUsT0FBTyxFQUFFO0FBQzNCLHFDQTVORSxZQUFZLENBNE5ELFNBQVMsRUFBRSxNQUFNLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUFFckQsUUFBTSxNQUFNLEdBQUcsU0FBUyxFQUFFLENBQUM7O0FBRTNCLFVBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQzs7QUFFeEIsUUFBSSxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDZCxZQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQztLQUMxQixNQUFNLElBQUksTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ3JCLFlBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztLQUN6Qjs7QUFFRCxRQUFJLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUNkLFlBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDO0tBQzFCOztBQUVELFdBQU8sQ0FBQyxPQUFPLENBQUMsVUFBVSxNQUFNLEVBQUU7QUFDaEMsVUFBTSxTQUFTLEdBQUcsV0FBVyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDcEQsVUFBTSxDQUFDLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7O0FBRXpELFVBQU0sV0FBVyxHQUFHLFlBQVksQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3hFLFVBQU0sRUFBRSxHQUFHLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQzs7QUFFNUMsVUFBTSxTQUFTLEdBQUcsV0FBVyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDcEQsVUFBTSxDQUFDLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7O0FBRXpELFVBQU0sV0FBVyxHQUFHLFlBQVksQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzFFLFVBQU0sRUFBRSxHQUFHLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQzs7QUFFNUMsVUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQ1osVUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDOztBQUVaLFVBQUksSUFBSSxHQUFHLG1CQUFtQixDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FDL0QsR0FBRyxDQUFDLFVBQVUsUUFBUSxFQUFFO0FBQ3ZCLFlBQUksT0FBTyxHQUFHLGtCQUFrQixDQUFDLEVBQUUsR0FBRyxNQUFNLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUMxRSxZQUFJLE9BQU8sR0FBRyxrQkFBa0IsQ0FBQyxFQUFFLEVBQUUsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDOztBQUUzRCxlQUFRLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUU7T0FDekQsQ0FBQyxDQUFDOztBQUVMLGFBQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTZCbEIsWUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDO0FBQzlCLFlBQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ2QsWUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDO0FBQzlCLFlBQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDOztBQUVkLFVBQUksTUFBTSxLQUFLLE1BQU0sRUFBRTtBQUNyQixZQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDO0FBQ3RDLFlBQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQztBQUN4RCxZQUFNLGFBQWEsR0FBRyxZQUFZLENBQ2hDLE1BQU0sQ0FBQyxDQUFDLEVBQ1IsTUFBTSxDQUFDLEtBQUssRUFDWixRQUFRLENBQUMsQ0FBQyxHQUFHLFNBQVMsRUFDdEIsUUFBUSxDQUFDLENBQUMsR0FBRyxTQUFTLENBQ3ZCLENBQUM7OztBQUdGLFlBQUksYUFBYSxHQUFHLENBQUMsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDOUMsa0JBQVEsQ0FBQyxDQUFDLEdBQUcsd0JBQXdCLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1NBQzFFLE1BQU0sSUFBSSxhQUFhLEdBQUcsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUNyRCxrQkFBUSxDQUFDLENBQUMsR0FBRyx3QkFBd0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1NBQzVEO09BQ0Y7O0FBRUQsVUFBTSxLQUFLLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3JDLFVBQU0sR0FBRyxHQUFHLEVBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUMsQ0FBQzs7QUFFdkMsdUNBM1RjLE1BQU0sQ0EyVGIsU0FBUyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDeEMsdUNBNVRzQixXQUFXLENBNFRyQixTQUFTLEVBQUUsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDOztBQUU1Qyx1Q0E5VHNCLFdBQVcsQ0E4VHJCLFNBQVMsRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDM0MsQ0FBQyxDQUFDOztBQUVILFdBQU8sSUFBSSxDQUFDO0dBQ2IsQ0FBQyxDQUFDOztBQUVILFNBQU8sS0FBSyxDQUFDO0NBQ2QsQ0FBQyxDQUNELElBQUksQ0FBQyxVQUFVLEtBQUssRUFBRTtBQUNyQixNQUFNLGVBQWUsR0FBRyxLQUFLLENBQUMsZUFBZSxDQUFDOztBQUU5QyxNQUFNLE1BQU0sR0FBRyxVQTlVWCxRQUFRLENBOFVZLG1CQUFtQixDQUFDLENBQUM7QUFDN0MsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFMUMsV0FBUyxDQUFDLFlBQVk7QUFDcEIscUNBN1VFLFlBQVksQ0E2VUQsU0FBUyxFQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUVyRCxXQUFPLElBQUksQ0FBQztHQUNiLENBQUMsQ0FBQztBQUNILFNBQU8sS0FBSyxDQUFDO0NBQ2QsQ0FBQyxDQUFDOzs7Ozs7Ozs7Ozs7OzZDQ3RWd0MscUJBQXFCOztBQUVsRSxJQUFNLFlBQVksR0FBRyxDQUFDLENBQUM7O0FBRXZCLFNBQVMsa0JBQWtCLENBQUMsa0JBQWtCLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRTtBQUN0RSxNQUFJLFVBQVUsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDO0FBQ2pDLE1BQUksV0FBVyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUM7O0FBRW5DLFNBQU87QUFDTCxRQUFJLEVBQUUsa0JBQWtCLENBQUMsSUFBSSxJQUFJLFlBQVk7QUFDN0MsVUFBTSxFQUFFLGtCQUFrQixDQUFDLE1BQU0sQ0FDOUIsR0FBRyxDQUFDLFVBQVMsZUFBZSxFQUFFO0FBQzdCLFVBQUksS0FBSyxHQUFHLCtCQVpaLFNBQVMsQ0FZYSxVQUFVLEVBQUUsV0FBVyxDQUFDLENBQUM7O0FBRS9DLFdBQUssQ0FDRixVQUFVLENBQUMsSUFBSSxDQUFDLENBQ2hCLFNBQVMsQ0FDUixXQUFXLEVBQ1gsZUFBZSxDQUFDLENBQUMsRUFBRSxlQUFlLENBQUMsQ0FBQyxFQUNwQyxVQUFVLEVBQUUsV0FBVyxFQUN2QixDQUFDLEVBQUUsQ0FBQyxFQUNKLFVBQVUsRUFBRSxXQUFXLENBQ3hCLENBQUM7O0FBRUosYUFBTyxLQUFLLENBQUM7S0FDZCxDQUFDO0dBQ0wsQ0FBQztDQUNIOztxQkFFYyxVQUFVLGdCQUFnQixFQUFFLFdBQVcsRUFBRTtBQUN0RCxTQUFPLE1BQU0sQ0FDVixJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQ2pDLE1BQU0sQ0FBQyxVQUFTLFFBQVEsRUFBRSxVQUFVLEVBQUU7QUFDckMsUUFBSSxhQUFhLEdBQUcsa0JBQWtCLENBQ3BDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsRUFDdkMsZ0JBQWdCLENBQUMsU0FBUyxFQUMxQixXQUFXLENBQ1osQ0FBQzs7QUFFRixpQkFBYSxDQUFDLE1BQU0sR0FBRyxhQUFhLENBQUMsTUFBTSxDQUN4QyxHQUFHLENBQUMsVUFBUyxLQUFLLEVBQUU7QUFDbkIsYUFBTywrQkF6Q0UsbUJBQW1CLENBeUNELGdCQUFnQixDQUFDLGdCQUFnQixFQUFFLEtBQUssQ0FBQyxDQUFDO0tBQ3RFLENBQUMsQ0FBQzs7QUFFTCxZQUFRLENBQUMsVUFBVSxDQUFDLEdBQUcsYUFBYSxDQUFDOztBQUVyQyxXQUFPLFFBQVEsQ0FBQztHQUNqQixFQUFFLEVBQUUsQ0FBQyxDQUFDO0NBQ1Y7O0FBQUEsQ0FBQzs7Ozs7Ozs7Ozs7O3lCQ3JEb0Isd0JBQXdCOzs7O3FCQUUvQixVQUFVLFFBQVEsRUFBRTtBQUNqQyxNQUFJLG9CQUFvQixHQUFHLFFBQVEsSUFBTzs7QUFDeEMsbUJBQWlCLEdBQUcsQ0FBQztNQUNyQixZQUFZLEdBQUcsSUFBSTtNQUNuQixhQUFhLEdBQUcsSUFBSSxDQUFDOztBQUV2QixNQUFJLFdBQVcsR0FBRyx1QkFBVSxVQUFTLFNBQVMsRUFBRSxPQUFPLEVBQUU7QUFDdkQsUUFBRyxDQUFDLG9CQUFvQixFQUFFO0FBQ3hCLGFBQU87S0FDUjs7QUFFRCxRQUFHLENBQUMsWUFBWSxFQUFFO0FBQ2hCLGFBQU8sQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNwQzs7QUFFRCxnQkFBWSxHQUFHLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQzlELFFBQUcsYUFBYSxFQUFFO0FBQ2hCLG1CQUFhLENBQUMsWUFBWSxDQUFDLENBQUM7S0FDN0I7O0FBRUQsUUFBRyxFQUFFLGlCQUFpQixJQUFJLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7QUFDNUQsdUJBQWlCLEdBQUcsQ0FBQyxDQUFDO0tBQ3ZCO0dBQ0YsQ0FBQyxDQUNDLEVBQUUsRUFBRSxDQUFDOztBQUVSLFNBQU87QUFDTCxRQUFJLEVBQUUsY0FBUyxVQUFVLEVBQUU7QUFDekIsMEJBQW9CLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzVDLHVCQUFpQixHQUFHLENBQUMsQ0FBQztBQUN0QixrQkFBWSxHQUFHLElBQUksQ0FBQztBQUNwQixhQUFPLElBQUksQ0FBQztLQUNiO0FBQ0QsV0FBTyxFQUFFLGlCQUFTLEVBQUUsRUFBRTtBQUNwQixtQkFBYSxHQUFHLEVBQUUsQ0FBQztBQUNuQixhQUFPLElBQUksQ0FBQztLQUNiO0FBQ0QsUUFBSSxFQUFFLGdCQUFXO0FBQ2YsMEJBQW9CLEdBQUcsSUFBSSxDQUFDO0FBQzVCLGFBQU8sSUFBSSxDQUFDO0tBQ2I7QUFDRCxRQUFJLEVBQUUsZ0JBQVc7QUFDZiw2QkFBVSxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDbEMsYUFBTyxJQUFJLENBQUM7S0FDYjtBQUNELHFCQUFpQjs7Ozs7Ozs7OztPQUFFLFlBQVc7QUFDNUIsYUFBTyxpQkFBaUIsQ0FBQztLQUMxQixDQUFBO0FBQ0QsWUFBUSxFQUFFLG9CQUFXO0FBQ25CLGFBQU8sWUFBWSxDQUFDO0tBQ3JCO0FBQ0QsV0FBTyxFQUFFLG1CQUFXO0FBQ2xCLGtCQUFZLEdBQUcsb0JBQW9CLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDOUQsVUFBRyxFQUFFLGlCQUFpQixJQUFJLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7QUFDNUQseUJBQWlCLEdBQUcsQ0FBQyxDQUFDO09BQ3ZCO0FBQ0QsYUFBTyxZQUFZLENBQUM7S0FDckI7R0FDRixDQUFDO0NBQ0g7Ozs7Ozs7Ozs7Ozs7O1FDekRlLFlBQVksR0FBWixZQUFZO1FBSVosTUFBTSxHQUFOLE1BQU07UUFXTixXQUFXLEdBQVgsV0FBVzs7QUFmcEIsU0FBUyxZQUFZLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUU7QUFDckQsV0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztDQUMxQzs7QUFFTSxTQUFTLE1BQU0sQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUU7QUFDeEQsTUFBRyxDQUFDLEtBQUssRUFBRTtBQUNULFdBQU87R0FDUjtBQUNELFdBQVMsQ0FBQyxTQUFTLENBQ2pCLEtBQUssRUFDTCxLQUFLLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUN6QixLQUFLLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUMxQixDQUFDO0NBQ0g7O0FBRU0sU0FBUyxXQUFXLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFO0FBQzdELE9BQUssR0FBRyxLQUFLLElBQUksU0FBUyxDQUFDO0FBQzNCLE9BQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxJQUFJLEVBQUU7QUFDNUIsYUFBUyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7QUFDOUIsYUFBUyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0dBQ3pGLENBQUMsQ0FBQztDQUNKOzs7Ozs7Ozs7Ozs7O1FDcEJlLFVBQVUsR0FBVixVQUFVO1FBS1YsU0FBUyxHQUFULFNBQVM7UUFLVCxZQUFZLEdBQVosWUFBWTtRQU9aLFdBQVcsR0FBWCxXQUFXO1FBV1gsY0FBYyxHQUFkLGNBQWM7UUFvQmQsU0FBUyxHQUFULFNBQVM7UUFTVCxVQUFVLEdBQVYsVUFBVTs7OztRQVdWLG1CQUFtQixHQUFuQixtQkFBbUI7O29CQXhFbEIsV0FBVzs7OztBQUlyQixTQUFTLFVBQVUsQ0FBQyxHQUFHLEVBQUU7QUFDOUIsTUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM3QixTQUFPLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQzVCOztBQUVNLFNBQVMsU0FBUyxDQUFDLEdBQUcsRUFBRTtBQUM3QixTQUFRLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLFNBQVMsSUFDdkMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssVUFBVSxDQUFFO0NBQ3ZDOztBQUVNLFNBQVMsWUFBWSxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUU7QUFDekMsTUFBRyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDN0IsV0FBTyxPQUFPLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztHQUM1QjtBQUNELFNBQU8sR0FBRyxDQUFDO0NBQ1o7O0FBRU0sU0FBUyxXQUFXLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUscUJBQXFCLEVBQUU7QUFDakYsUUFBTSxHQUFHLE1BQU0sSUFBSSxFQUFFLENBQUM7QUFDdEIsYUFBVyxHQUFHLFdBQVcsSUFBSSxFQUFFLENBQUM7O0FBRWhDLFFBQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVMsSUFBSSxFQUFFO0FBQ3pDLGtCQUFjLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLHFCQUFxQixDQUFDLENBQUM7R0FDN0UsQ0FBQyxDQUFDOztBQUVILFNBQU8sV0FBVyxDQUFDO0NBQ3BCOztBQUVNLFNBQVMsY0FBYyxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxxQkFBcUIsRUFBRTtBQUMxRixNQUFHLFdBQVcsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDbkMsUUFBRyxTQUFTLEVBQUU7QUFDWixpQkFBVyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQy9ELHdCQUFLLEdBQUcsQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUM7S0FDN0MsTUFBTSxJQUFHLHFCQUFxQixFQUFFO0FBQy9CLHdCQUFLLEtBQUssQ0FBQyxrQ0FBa0MsR0FDN0MsSUFBSSxHQUFHLDZCQUE2QixDQUFDLENBQUM7S0FDdkMsTUFBTTtBQUNMLGlCQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2pDLHdCQUFLLEdBQUcsQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUM7S0FDL0M7QUFDRCxXQUFPLFdBQVcsQ0FBQztHQUNwQjs7QUFFRCxhQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUVqQyxTQUFPLFdBQVcsQ0FBQztDQUNwQjs7QUFFTSxTQUFTLFNBQVMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFO0FBQ3ZDLE1BQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7O0FBRTlDLFFBQU0sQ0FBQyxLQUFLLEdBQUcsS0FBSyxJQUFJLEdBQUcsQ0FBQztBQUM1QixRQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sSUFBSSxHQUFHLENBQUM7O0FBRTlCLFNBQU8sTUFBTSxDQUFDO0NBQ2Y7O0FBRU0sU0FBUyxVQUFVLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRTtBQUN2QyxTQUFPLEVBQ0wsS0FBSyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDLElBQy9CLEtBQUssQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsQ0FBQyxJQUNoQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLEtBQUssSUFDL0IsS0FBSyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUEsQUFDakMsQ0FBQztDQUNIOztBQUlNLFNBQVMsbUJBQW1CLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRTtBQUNuRCxNQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxVQUFVLENBQUM7QUFDbEMsTUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQztBQUN4QixNQUFJLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO0FBQzFCLE1BQUksU0FBUyxHQUFHLEtBQUssQ0FDbEIsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUNoQixZQUFZLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7O0FBRXJDLE1BQUcsUUFBUSxFQUFFO0FBQ1gsY0FBVSxHQUFHLEtBQUssR0FBRyxNQUFNLEdBQUcsQ0FBQyxDQUFDOztBQUVoQyxTQUFJLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsVUFBVSxFQUFFLEtBQUssSUFBRSxDQUFDLEVBQUU7QUFDL0MsT0FBQyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDMUIsT0FBQyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzlCLE9BQUMsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM5QixVQUFHLENBQUMsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQzlELGlCQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7T0FDL0I7S0FDRjtHQUNGOztBQUVELFVBQVEsR0FBRyxTQUFTLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ3BDLFVBQVEsQ0FDTCxVQUFVLENBQUMsSUFBSSxDQUFDLENBQ2hCLFlBQVksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDOztBQUVqQyxTQUFPLFFBQVEsQ0FBQztDQUNqQjs7Ozs7Ozs7UUNyRmUsZ0JBQWdCLEdBQWhCLGdCQUFnQjtRQXFCaEIsU0FBUyxHQUFULFNBQVM7UUFXVCxRQUFRLEdBQVIsUUFBUTtRQUlSLGlCQUFpQixHQUFqQixpQkFBaUI7Ozs7O0FBL0NqQyxJQUFJLGVBQWUsQ0FBQzs7QUFFcEIsU0FBUyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUU7QUFDakMsTUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQztBQUNwQyxPQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxhQUFhLEdBQUcsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsYUFBYSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3hFLFFBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLE1BQU0sRUFBRTtBQUM3QyxhQUFPLE9BQU8sQ0FBQztLQUNoQjtHQUNGO0NBQ0Y7O0FBRU0sU0FBUyxnQkFBZ0IsQ0FBRSxhQUFhLEVBQUU7QUFDL0MsTUFBSSxXQUFXO01BQUUsT0FBTztNQUFFLFlBQVksR0FBRyxFQUFFLENBQUM7O0FBRTVDLE1BQUcsQ0FBQyxhQUFhLEVBQUU7QUFDakIsUUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2pELFFBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDWCxhQUFPLFlBQVksQ0FBQztLQUNyQjtBQUNELGlCQUFhLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0dBQ3pCOztBQUVELGFBQVcsR0FBRyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbEQsT0FBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsV0FBVyxHQUFHLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLFdBQVcsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUNyRSxXQUFPLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3pCLFFBQUcsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDNUIsa0JBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDNUI7R0FDRjtBQUNELFNBQU8sWUFBWSxDQUFDO0NBQ3JCOztBQUVNLFNBQVMsU0FBUyxDQUFFLElBQUksRUFBRTtBQUMvQixNQUFHLENBQUMsZUFBZSxFQUFFO0FBQ25CLHFCQUFpQixFQUFFLENBQUM7R0FDckI7QUFDRCxTQUFPLGVBQWUsQ0FBQyxNQUFNLENBQUMsVUFBUyxPQUFPLEVBQUU7QUFDOUMsUUFBRyxPQUFPLENBQUMsWUFBWSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsRUFBRTtBQUN2QyxhQUFPLE9BQU8sQ0FBQztLQUNoQjtHQUNGLENBQUMsQ0FBQztDQUNKOztBQUVNLFNBQVMsUUFBUSxDQUFFLElBQUksRUFBRTtBQUM5QixTQUFPLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUMzQjs7QUFFTSxTQUFTLGlCQUFpQixHQUFHO0FBQ2xDLGlCQUFlLEdBQUcsZ0JBQWdCLEVBQUUsQ0FBQztDQUN0Qzs7Ozs7Ozs7cUJDZnVCLEtBQUs7Ozs7O0FBbEM3QixJQUFNLGFBQWEsR0FBRyxJQUFJLENBQUM7O0FBRTNCLFNBQVMsWUFBWSxDQUFDLEdBQUcsRUFBRSxjQUFjLEVBQUU7QUFDekMsU0FBTyxDQUFDLEdBQUcsR0FBRyxjQUFjLENBQUEsR0FBSSxhQUFhLENBQUM7Q0FDL0M7OztBQUdELFNBQVMsU0FBUyxDQUFDLEtBQUssRUFBRTtBQUN4QixNQUFJLEdBQUcsR0FBRyxFQUFFO01BQUUsSUFBSSxHQUFHLEtBQUs7TUFBRSxHQUFHLEdBQUcsQ0FBQztNQUFFLFVBQVUsR0FBRyxDQUFDLENBQUM7QUFDcEQsTUFBSSxVQUFVLEdBQUcsV0FBVyxDQUFDLFlBQVk7QUFDdkMsT0FBRyxHQUFHLFVBQVUsQ0FBQztBQUNqQixjQUFVLEdBQUcsQ0FBQyxDQUFDO0dBQ2hCLEVBQUUsYUFBYSxDQUFDLENBQUM7O0FBRWxCLEdBQUMsU0FBUyxJQUFJLEdBQUc7QUFDZixjQUFVLEVBQUUsQ0FBQzs7QUFFYixPQUFHLEdBQUcsR0FBRyxDQUNOLEdBQUcsQ0FBQyxVQUFVLEVBQUUsRUFBRTtBQUNqQixhQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0tBQzVCLENBQUMsQ0FDRCxNQUFNLENBQUMsVUFBVSxFQUFFLEVBQUU7QUFDcEIsYUFBTyxFQUFFLENBQUM7S0FDWCxDQUFDLENBQUM7O0FBRUwsUUFBSSxHQUFHLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztBQUNuQix5QkFBcUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUM3QixDQUFBLEVBQUcsQ0FBQzs7QUFFTCxTQUFPLFVBQVUsRUFBRSxFQUFFO0FBQ25CLE9BQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7R0FDZCxDQUFDO0NBQ0g7O0FBRWMsU0FBUyxLQUFLLEdBQUc7QUFDOUIsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDOztBQUV6QyxTQUFPLFVBQVUsRUFBRSxFQUFFO0FBQ25CLGFBQVMsQ0FBQyxVQUFVLEdBQUcsRUFBRSxjQUFjLEVBQUU7QUFDdkMsVUFBTSxPQUFPLEdBQUcsWUFBWSxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsRUFBRSxjQUFjLENBQUMsQ0FBQztBQUMxRCxhQUFPLEVBQUUsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7S0FDekIsQ0FBQyxDQUFDO0dBQ0osQ0FBQTtDQUNGOzs7Ozs7Ozs7O3FCQ3pCdUIsUUFBUTs7Ozs7QUFsQmhDLElBQUksbUJBQW1CLEdBQUcsR0FBRyxDQUFDOztBQUU5QixTQUFTLFlBQVksQ0FBRSxLQUFLLEVBQUU7QUFDNUIsU0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFTLE9BQU8sRUFBRSxNQUFNLEVBQUU7QUFDM0MsUUFBSSxVQUFVLEdBQUcsV0FBVyxDQUFDLFlBQVc7QUFDdEMsVUFBRyxLQUFLLENBQUMsUUFBUSxFQUFFO0FBQ2pCLHFCQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDMUIsZUFBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO09BQ2hCO0tBQ0YsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDOztBQUV4QixTQUFLLENBQUMsT0FBTyxHQUFHLFlBQVk7QUFDMUIsbUJBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUMxQixZQUFNLEVBQUUsQ0FBQztLQUNWLENBQUM7R0FDSCxDQUFDLENBQUM7Q0FDSjs7QUFFYyxTQUFTLFFBQVEsQ0FBRSxHQUFHLEVBQUU7QUFDckMsTUFBSSxLQUFLLEVBQUUsT0FBTyxDQUFDOztBQUVuQixPQUFLLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQztBQUNwQixPQUFLLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQzs7QUFFaEIsU0FBTyxHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFOUIsU0FBTyxPQUFPLENBQUM7Q0FDaEI7Ozs7Ozs7Ozs7Ozs7O3FCQzNCdUIsS0FBSzs7QUFBZCxTQUFTLEtBQUssR0FBRztBQUM5QixNQUFJLElBQUksR0FBRyxFQUFFLENBQUM7O0FBRWQsUUFBTSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxVQUFVLEtBQUssRUFBRTtBQUNsRCxRQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQztHQUM1QixDQUFDLENBQUM7QUFDSCxRQUFNLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLFVBQVUsS0FBSyxFQUFFO0FBQ2hELFFBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsS0FBSyxDQUFDO0dBQzdCLENBQUMsQ0FBQzs7QUFFSCxTQUFPLFlBQVk7QUFDakIsV0FBTyxJQUFJLENBQUM7R0FDYixDQUFDO0NBQ0g7Ozs7Ozs7Ozs7Ozs7Ozs7OztvQkNYZ0IsV0FBVzs7OzsyQkFDRixhQUFhOztBQUV2QyxJQUFJLFFBQVEsQ0FBQztBQUNiLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQzs7O0FBR3RCLFNBQVMsU0FBUyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUU7QUFDM0IsTUFBRyxDQUFDLFFBQVEsRUFBRTtBQUNaLFlBQVEsR0FBRyxNQUFNLEVBQUUsQ0FBQztHQUNyQjtBQUNELE1BQUcsRUFBRSxFQUFFO0FBQ0wsWUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7R0FDN0I7QUFDRCxTQUFPLFFBQVEsQ0FBQztDQUNqQjs7QUFFRCxTQUFTLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQzs7QUFFNUIsU0FBUyxNQUFNLEdBQUc7QUFDaEIsU0FBTyxhQW5CRCxXQUFXLENBbUJFO0FBQ2pCLGFBQVMsRUFBRSxFQUFFO0FBQ2IsWUFBUSxFQUFFLFFBQVE7QUFDbEIsY0FBVSxFQUFFLFVBQVU7QUFDdEIsU0FBSyxFQUFFLEtBQUs7QUFDWixRQUFJLEVBQUUsSUFBSTtBQUNWLFNBQUssRUFBRSxLQUFLO0FBQ1osTUFBRSxFQUFFLEVBQUU7R0FDUCxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7Q0FDWjs7QUFFRCxTQUFTLFFBQVEsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFO0FBQzFCLFdBQVMsT0FBTyxDQUFDLE9BQU8sRUFBRTtBQUN4QixRQUFJLEdBQUcsT0FBTyxDQUFDO0dBQ2hCOztBQUVELFdBQVMsU0FBUyxHQUFHO0FBQ25CLFFBQUksS0FBSyxHQUFHLENBQUM7UUFDWCxjQUFjLEdBQUcsQ0FBQyxDQUFDOztBQUVyQixXQUFPLFVBQVMsU0FBUyxFQUFFO0FBQ3pCLG9CQUFjLElBQUksU0FBUyxDQUFDO0FBQzVCLFVBQUcsS0FBSyxLQUFLLElBQUksRUFBRTtBQUNqQixhQUFLLEVBQUUsQ0FBQztBQUNSLGVBQU87T0FDUjtBQUNELFFBQUUsQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDNUIsV0FBSyxHQUFHLENBQUMsQ0FBQztBQUNWLG9CQUFjLEdBQUcsQ0FBQyxDQUFDO0tBQ3BCLENBQUM7R0FDSDs7QUFFRCxNQUFHLENBQUMsa0JBQUssVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ3ZCLHNCQUFLLEtBQUssQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDO0dBQzNEO0FBQ0QsTUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLENBQUM7O0FBRWpCLE1BQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7O0FBRWpDLFNBQU8sSUFBSSxDQUFDO0NBQ2I7O0FBRUQsU0FBUyxFQUFFLEdBQUc7QUFDWixTQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDO0NBQzlCOztBQUVELFNBQVMsVUFBVSxDQUFDLEVBQUUsRUFBRTtBQUN0QixNQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2pDLFNBQU8sSUFBSSxDQUFDO0NBQ2I7O0FBRUQsU0FBUyxLQUFLLEdBQUc7QUFDZixNQUFHLElBQUksQ0FBQyxPQUFPLEVBQUU7QUFDZixXQUFPLElBQUksQ0FBQztHQUNiOztBQUVELGVBM0VNLFdBQVcsQ0EyRUw7QUFDVixhQUFTLEVBQUUsQ0FBQztBQUNaLFNBQUssRUFBRSxDQUFDO0FBQ1Isa0JBQWMsRUFBRSxDQUFDO0FBQ2pCLFdBQU8sRUFBRSxJQUFJO0FBQ2Isa0JBQWMsRUFBRSxJQUFJLElBQUksRUFBRTtBQUMxQixvQkFBZ0IsRUFBRSxNQUFNLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsVUFBVSxDQUFDO0dBQ3pFLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRVQsU0FBTyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7Q0FDckI7O0FBRUQsU0FBUyxJQUFJLEdBQUc7QUFDZCxNQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztBQUNyQixRQUFNLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQzVDLFFBQU0sQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzs7QUFFbkQsU0FBTyxJQUFJLENBQUM7Q0FDYjs7QUFFRCxTQUFTLEtBQUssR0FBRztBQUNmLE1BQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUMxQixTQUFPLElBQUksQ0FBQztDQUNiOztBQUVELFNBQVMsS0FBSyxHQUFHO0FBQ2YsdUJBQXFCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzVELE1BQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQzs7QUFFYixNQUFHLElBQUksQ0FBQyxPQUFPLEVBQUU7QUFDZixRQUFJLENBQUMsZ0JBQWdCLEdBQUcsTUFBTSxDQUFDLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztHQUN4RTs7QUFFRCxTQUFPLElBQUksQ0FBQztDQUNiOztBQUVELFNBQVMsV0FBVyxHQUFHO0FBQ3JCLE1BQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUM1QixNQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztBQUNmLE1BQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztDQUN2Qjs7QUFFRCxTQUFTLHFCQUFxQixDQUFDLFNBQVMsRUFBRTtBQUN4QyxNQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDOztBQUUvQixPQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxZQUFZLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsWUFBWSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3JFLGFBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztHQUN6QjtDQUNGOztBQUVELFNBQVMsWUFBWSxHQUFHO0FBQ3RCLE1BQUksR0FBRyxHQUFHLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztBQUN0QixNQUFJLFNBQVMsR0FBRyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFBLEdBQUksVUFBVSxDQUFDOztBQUV6RCxNQUFJLENBQUMsY0FBYyxHQUFHLEdBQUcsQ0FBQzs7QUFFMUIsU0FBTyxTQUFTLENBQUM7Q0FDbEI7O3FCQUVjLFNBQVM7Ozs7Ozs7Ozs7O3FCQ3RJQSxTQUFTOzs7OztxQkFGZixhQUFhOzs7O0FBRWhCLFNBQVMsU0FBUyxDQUFDLEdBQUcsRUFBRTs7QUFFckMsU0FBTyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUEsUUFBUTtXQUFJLFFBQVEsQ0FBQyxJQUFJLEVBQUU7R0FBQSxDQUFDLENBQUM7Q0FDckQ7Ozs7Ozs7Ozs7Ozs7O0FDTkQsSUFBSSxLQUFLLEdBQUcsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDOztBQUUxRyxJQUFJLElBQUksR0FBRztBQUNULFdBQVMsRUFBRSxtQkFBVSxLQUFLLEVBQUU7QUFBRSxXQUFPLE9BQU8sS0FBSyxJQUFJLFdBQVcsQ0FBQTtHQUFFO0FBQ2xFLEtBQUcsRUFBRSxhQUFVLEtBQUssRUFBRSxZQUFZLEVBQUU7QUFBRSxXQUFPLEFBQUMsT0FBTyxLQUFLLElBQUksV0FBVyxHQUFJLFlBQVksR0FBRyxLQUFLLENBQUE7R0FBRTtBQUNuRyxPQUFLLEVBQUUsZUFBVSxPQUFPLEVBQUU7QUFBRSxVQUFNLElBQUksS0FBSyxDQUFDLEVBQUUsR0FBRyxJQUFJLEdBQUcsT0FBTyxDQUFDLENBQUE7R0FBRTtBQUNsRSxNQUFJLEVBQUUsY0FBVSxPQUFPLEVBQUU7QUFBRSxRQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsQ0FBQTtHQUFFO0FBQzVELEtBQUcsRUFBRSxhQUFVLE9BQU8sRUFBRTtBQUFFLFFBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRTtBQUFFLGFBQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLElBQUksR0FBRyxPQUFPLENBQUMsQ0FBQTtLQUFFO0dBQUU7QUFDL0UsYUFBVyxFQUFFLHFCQUFVLElBQUksRUFBRTtBQUFFLFdBQU8sS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0dBQUU7QUFDeEUsTUFBSSxFQUFFLGNBQVUsR0FBRyxFQUFFLEdBQUcsRUFBRTs7QUFDeEIsT0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFDZixRQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUU7QUFBRSxVQUFJLENBQUMsS0FBSyxDQUFDLHNCQUFzQixDQUFDLENBQUM7S0FBRTtBQUNyRCxXQUFPLElBQUksQ0FBQyxLQUFLLENBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBLEFBQUMsQ0FBRSxHQUFJLEdBQUcsQUFBQyxDQUFDO0dBQzlEO0NBQ0YsQ0FBQzs7QUFFRixLQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUNwQyxNQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBUyxJQUFJLEVBQUU7QUFDdEMsV0FBTyxVQUFTLEdBQUcsRUFBRTtBQUNuQixhQUFPLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxVQUFVLEdBQUcsSUFBSSxHQUFHLEdBQUcsQ0FBQztLQUN2RSxDQUFDO0dBQ0gsQ0FBQSxDQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ2Q7O3FCQUVjLElBQUk7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDQW5CLFNBQVMsVUFBVSxDQUFDLEtBQUssRUFBRTtBQUN6QixTQUFPLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDdkI7O0FBRUQsU0FBUyxTQUFTLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRTtBQUNyQyxTQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBVSxJQUFJLEVBQUU7QUFDbEMsUUFBSSxLQUFLLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUM3QixRQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7O0FBRWhCLGFBQVMsVUFBVSxHQUFHO0FBQ3BCLFVBQUcsRUFBRSxLQUFLLEtBQUssQ0FBQyxFQUFFO0FBQ2hCLEFBQUMsZUFBTyxHQUNOLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxHQUN4QixJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7T0FDaEI7S0FDRjs7QUFFRCxhQUFTLENBQUMsT0FBTyxDQUFDLFVBQVUsUUFBUSxFQUFFLEtBQUssRUFBRTtBQUMzQyxVQUFHLENBQUMsUUFBUSxFQUFFO0FBQ1osY0FBTSwwQkFBMEIsQ0FBQztBQUNqQyxlQUFPO09BQ1I7O0FBRUQsVUFBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUU7QUFDakIsY0FBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLFFBQVEsQ0FBQztBQUN6QixrQkFBVSxFQUFFLENBQUM7QUFDYixlQUFPO09BQ1I7O0FBRUQsY0FBUSxDQUFDLElBQUksQ0FBQyxVQUFVLEtBQUssRUFBRTtBQUM3QixjQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsS0FBSyxDQUFDO0FBQ3RCLGtCQUFVLEVBQUUsQ0FBQztPQUNkLENBQUMsQ0FBQztLQUNKLENBQUMsQ0FBQztHQUNKLENBQUMsQ0FBQTtDQUNIOztBQUVELFNBQVMsT0FBTyxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRTtBQUNsRCxNQUFJLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDM0IsTUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO0FBQ2IsV0FBTztHQUNSOztBQUVELE1BQUksUUFBUSxHQUFHLEFBQUMsTUFBTSxHQUNwQixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksR0FDZixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQzs7QUFFckIsTUFBSSxLQUFLLElBQUksS0FBSyxDQUFDLElBQUksRUFBRTtBQUN2QixRQUFHLEtBQUssQ0FBQyxRQUFRLEVBQUU7QUFDakIsY0FBUSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQzVDOztBQUVELFNBQUssQ0FBQyxJQUFJLENBQ1IsVUFBVSxLQUFLLEVBQUU7QUFDZixhQUFPLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0tBQ3JGLEVBQ0QsVUFBVSxLQUFLLEVBQUU7QUFDZixhQUFPLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQ25GLENBQ0YsQ0FBQztBQUNGLFdBQU87R0FDUjtBQUNELFNBQU8sQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7Q0FDckY7O0lBRW9CLEtBQUs7QUFDYixXQURRLEtBQUssQ0FDWixRQUFRLEVBQUU7MEJBREgsS0FBSzs7QUFFdEIsUUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7QUFDckIsUUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7QUFDbkIsUUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7QUFDcEIsUUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7R0FDMUI7O2VBTmtCLEtBQUs7O1dBUWpCLG1CQUFHOzs7Ozs7QUFJUixnQkFBVSxDQUFDLFlBQU07QUFDZixjQUFLLFFBQVE7O0FBRVgsa0JBQUMsS0FBSyxFQUFLO0FBQ1QsaUJBQU8sQ0FBQyxNQUFLLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsTUFBSyxRQUFRLENBQUMsQ0FBQztTQUNsRTs7QUFFRCxrQkFBQyxLQUFLLEVBQUs7QUFDVCxpQkFBTyxDQUFDLE1BQUssU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxNQUFLLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUN4RSxDQUNGLENBQUM7T0FDSCxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQ1A7OztXQXFCSSxlQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUU7QUFDMUIsVUFBSSxRQUFRLEdBQUcsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3hDLGNBQVEsQ0FBQyxTQUFTLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNoRCxjQUFRLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDOUMsY0FBUSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO0FBQ2hDLGFBQU8sQUFBQyxTQUFTLEdBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLEdBQUcsUUFBUSxDQUFDO0tBQ3JFOzs7V0FFSyxnQkFBQyxLQUFLLEVBQUU7QUFDWixVQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMxQixhQUFPLElBQUksQ0FBQztLQUNiOzs7V0FFRyxjQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUU7QUFDekIsVUFBRyxPQUFPLFNBQVMsS0FBSyxVQUFVLEVBQUU7QUFDbEMsY0FBTSxzREFBc0QsQ0FBQTtPQUM3RDtBQUNELFVBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO0FBQ2xCLGVBQU8sRUFBRSxTQUFTO0FBQ2xCLFlBQUksRUFBRSxTQUFTLElBQUksVUFBVSxLQUFLLEVBQUU7QUFBRSxpQkFBTyxLQUFLLENBQUM7U0FBRTtPQUN0RCxDQUFDLENBQUM7O0FBRUgsVUFBRyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7QUFDaEIsWUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ2YsWUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7T0FDckI7O0FBRUQsYUFBTyxJQUFJLENBQUM7S0FDYjs7Ozs7V0E5Q1ksZ0JBQUMsUUFBUSxFQUFFO0FBQ3RCLFVBQUcsUUFBUSxDQUFDLElBQUksRUFBRTtBQUNoQixlQUFPLElBQUksS0FBSyxDQUFDLFVBQVUsSUFBSSxFQUFFO0FBQy9CLGtCQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3JCLENBQUMsQ0FBQztPQUNKO0FBQ0QsYUFBTyxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUM1Qjs7Ozs7V0FHUyxhQUFDLFNBQVMsRUFBRTtBQUNwQixhQUFPLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUM3Qjs7O1dBRWMsa0JBQUMsU0FBUyxFQUFFO0FBQ3pCLGFBQU8sU0FBUyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztLQUNuQzs7O1NBM0NrQixLQUFLOzs7cUJBQUwsS0FBSzs7Ozs7Ozs7Ozs7OztRQ3pGVixJQUFJLEdBQUosSUFBSTtRQU1KLE9BQU8sR0FBUCxPQUFPOztBQU5oQixTQUFTLElBQUksQ0FBRSxFQUFFLEVBQUU7QUFDeEIsU0FBTyxZQUFtQjtzQ0FBTixJQUFJO0FBQUosVUFBSTs7O0FBQ3RCLFdBQU8sRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7R0FDdkMsQ0FBQTtDQUNGOztBQUVNLFNBQVMsT0FBTyxHQUFVO3FDQUFMLEdBQUc7QUFBSCxPQUFHOzs7QUFDN0IsU0FBTyxVQUFVLE1BQU0sRUFBRTtBQUN2QixXQUFPLEdBQUcsQ0FBQyxXQUFXLENBQUMsVUFBVSxNQUFNLEVBQUUsRUFBRSxFQUFFO0FBQzNDLGFBQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7S0FDOUIsRUFBRSxNQUFNLENBQUMsQ0FBQztHQUNaLENBQUM7Q0FDSDs7QUFFTSxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFBekIsUUFBUSxHQUFSLFFBQVE7Ozs7Ozs7Ozs7cUJDVEssY0FBYzs7Ozs7eUJBTGhCLGtDQUFrQzs7Ozt3QkFDbkMsMkJBQTJCOzs7OytCQUNwQiw0QkFBNEI7Ozs7K0JBQzVCLGtDQUFrQzs7OztBQUUvQyxTQUFTLGNBQWMsQ0FBQyxHQUFHLEVBQUU7QUFDMUMsU0FBTyx1QkFBVSxHQUFHLENBQUMsQ0FDbEIsSUFBSSxDQUFDLFVBQVUsS0FBSyxFQUFFO0FBQ3JCLFdBQU8sc0JBQVMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsQ0FDNUMsSUFBSSxDQUFDLFVBQVUsZUFBZSxFQUFFO0FBQy9CLFdBQUssQ0FBQyxlQUFlLEdBQUcsZUFBZSxDQUFDO0FBQ3hDLGFBQU8sY0FBYyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FDakMsSUFBSSxDQUFDLFVBQVUsT0FBTyxFQUFFO0FBQ3ZCLGFBQUssQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQ3hCLGVBQU8sS0FBSyxDQUFDO09BQ2QsQ0FBQyxDQUFDO0tBQ04sQ0FBQyxDQUFDO0dBQ04sQ0FBQyxDQUNELElBQUksQ0FBQyxVQUFVLEtBQUssRUFBRTtBQUNyQixXQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7R0FDN0IsQ0FBQyxDQUFDO0NBQ047O0FBRUQsU0FBUyxjQUFjLENBQUMsT0FBTyxFQUFFO0FBQy9CLFNBQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7Q0FDaEQ7O0FBRUQsU0FBUyxhQUFhLENBQUMsTUFBTSxFQUFFO0FBQzdCLFNBQU8sNkJBQWdCLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FDbEMsSUFBSSxDQUFDLFVBQVMsSUFBSSxFQUFFO0FBQ25CLFVBQU0sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDOztBQUVuQixVQUFNLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztBQUN0QixVQUFNLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDakMsVUFBTSxDQUFDLFlBQVksR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ3JDLFVBQU0sQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUN4QyxVQUFNLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBSSxFQUFFLENBQUM7QUFDdkMsV0FBTyxNQUFNLENBQUM7R0FDZixDQUFDLENBQUM7Q0FDTjs7Ozs7Ozs7Ozs7cUJDbkN1QixlQUFlOzs7Ozt3QkFKbEIsMkJBQTJCOzs7O3lCQUMxQixrQ0FBa0M7Ozs7d0JBQ25DLDJCQUEyQjs7OztBQUVqQyxTQUFTLGVBQWUsQ0FBQyxHQUFHLEVBQUU7QUFDM0MsU0FBTyx1QkFBVSxHQUFHLENBQUMsQ0FDbEIsSUFBSSxDQUFDLFVBQVUsTUFBTSxFQUFFO0FBQ3RCLFdBQU8sc0JBQVMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUNuQyxJQUFJLENBQUMsVUFBVSxXQUFXLEVBQUU7QUFDM0IsWUFBTSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7QUFDakMsWUFBTSxDQUFDLFFBQVEsR0FBRyxzQkFBUyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFDaEQsYUFBTyxNQUFNLENBQUM7S0FDZixDQUFDLENBQUM7R0FDTixDQUFDLENBQUM7Q0FDTjs7Ozs7Ozs7Ozs7Ozs7cUJDZGM7QUFDYixHQUFDLEVBQUUsQ0FBQztBQUNKLEdBQUMsRUFBRSxDQUFDO0FBQ0osWUFBVSxFQUFFLEVBQUU7QUFDZCxhQUFXLEVBQUUsRUFBRTtBQUNmLE9BQUssRUFBRSxHQUFHO0FBQ1YsUUFBTSxFQUFFLEdBQUc7Q0FDWiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcclxuICogQ3JlYXRlZCBieSBTaGF1biBvbiA0LzIzLzIwMTUuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtGcmFnbWVudH0gZnJvbSAnLi9lbmdpbmUvZnJhZ21lbnRzLmpzJztcclxuaW1wb3J0IGdldFNjZW5lU2NoZW1hIGZyb20gJy4vc2NoZW1hL3NjZW5lLXNjaGVtYS5qcyc7XHJcbmltcG9ydCBGcmFtZSBmcm9tICcuL2VuZ2luZS9mcmFtZS5qcyc7XHJcbmltcG9ydCBJbnB1dCBmcm9tICcuL2VuZ2luZS9pbnB1dC5qcyc7XHJcbmltcG9ydCBWaWV3cG9ydCBmcm9tICcuL3ZpZXdwb3J0LmpzJztcclxuaW1wb3J0IHtjbGVhckNvbnRleHQsIHJlbmRlciwgcmVuZGVyUmVjdHN9IGZyb20gJy4vY2FudmFzLXJlbmRlcmVyLmpzJztcclxuaW1wb3J0IHtzZXF1ZW5jZX0gZnJvbSAnLi9mdW5jLmpzJztcclxuXHJcbmNvbnN0IHNjZW5lID0gZ2V0U2NlbmVTY2hlbWEoJ2Fzc2V0cy9raXR0eS13b3JsZC5qc29uJyk7XHJcblxyXG5mdW5jdGlvbiBnZXRQb3NpdGlvbkZyb21NYXhNYXJnaW4oc3ByaXRlUG9zLCBzcHJpdGVTaXplLCBtYXhNYXJnaW4pIHtcclxuICByZXR1cm4gKHNwcml0ZVBvcyArIHNwcml0ZVNpemUpIC0gbWF4TWFyZ2luO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRQb3NpdGlvbkZyb21NaW5NYXJnaW4oc3ByaXRlUG9zLCBtaW5NYXJnaW4pIHtcclxuICByZXR1cm4gc3ByaXRlUG9zIC0gbWluTWFyZ2luO1xyXG59XHJcblxyXG5mdW5jdGlvbiBhcHBseUZyaWN0aW9uKHZlbG9jaXR5LCBmcmljdGlvbiwgZWxhcHNlZCkge1xyXG4gIHJldHVybiB2ZWxvY2l0eSAqIE1hdGgucG93KDEgLSBmcmljdGlvbiwgZWxhcHNlZCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhhbHQodmVsb2NpdHksIGhhbHRUYXJnZXQpIHtcclxuICByZXR1cm4gKE1hdGguYWJzKHZlbG9jaXR5KSA8IGhhbHRUYXJnZXQpID8gMCA6IHZlbG9jaXR5O1xyXG59XHJcblxyXG5mdW5jdGlvbiBjbGFtcFZlbG9jaXR5KHZlbG9jaXR5LCBtYXhWZWxvY2l0eSkge1xyXG4gIHJldHVybiAodmVsb2NpdHkgPiAwKSA/XHJcbiAgICBNYXRoLm1pbih2ZWxvY2l0eSwgbWF4VmVsb2NpdHkpIDpcclxuICAgIE1hdGgubWF4KHZlbG9jaXR5LCAtbWF4VmVsb2NpdHkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBhcHBseUFjY2VsZXJhdGlvbih2ZWxvY2l0eSwgYWNjZWxlcmF0aW9uLCBlbGFwc2VkKSB7XHJcbiAgcmV0dXJuIHZlbG9jaXR5ICsgKGFjY2VsZXJhdGlvbiAqIGVsYXBzZWQpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRQb3NpdGlvbkRlbHRhKHBvc2l0aW9uLCB2ZWxvY2l0eSwgZWxhcHNlZCkge1xyXG4gIHJldHVybiBwb3NpdGlvbiArIE1hdGgucm91bmQodmVsb2NpdHkgKiBlbGFwc2VkKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0VmVsb2NpdHkoc3ByaXRlLCBkaW0sIGVsYXBzZWQpIHtcclxuICBsZXQgdmVsb2NpdHkgPSBoYWx0KHNwcml0ZS52ZWxvY2l0eVtkaW1dLCAxKTtcclxuICB2ZWxvY2l0eSA9IGFwcGx5QWNjZWxlcmF0aW9uKHZlbG9jaXR5LCBzcHJpdGUuYWNjZWxlcmF0aW9uW2RpbV0sIGVsYXBzZWQpO1xyXG4gIHZlbG9jaXR5ID0gYXBwbHlGcmljdGlvbih2ZWxvY2l0eSwgc3ByaXRlLmZyaWN0aW9uW2RpbV0sIGVsYXBzZWQpO1xyXG4gIHJldHVybiBjbGFtcFZlbG9jaXR5KHZlbG9jaXR5LCBzcHJpdGUubWF4VmVsb2NpdHlbZGltXSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldElubmVyRGlmZihwb3NpdGlvbiwgc2l6ZSwgbWluQm91bmQsIG1heEJvdW5kKSB7XHJcbiAgY29uc3QgbWF4ID0gcG9zaXRpb24gKyBzaXplO1xyXG4gIHJldHVybiAocG9zaXRpb24gPCBtaW5Cb3VuZCAmJiBwb3NpdGlvbiAtIG1pbkJvdW5kIHx8XHJcbiAgICBtYXggPiBtYXhCb3VuZCAmJiBtYXggLSBtYXhCb3VuZCB8fFxyXG4gICAgMCk7XHJcbn1cclxuXHJcbi8qZnVuY3Rpb24gZ2V0T3V0ZXJEaWZmKHBvc2l0aW9uLCBzaXplLCBtaW5Cb3VuZCwgbWF4Qm91bmQpIHtcclxuICBjb25zdCBtYXggPSBwb3NpdGlvbiArIHNpemU7XHJcbiAgcmV0dXJuIChwb3NpdGlvbiA8IG1pbkJvdW5kICYmIG1heCA+IG1pbkJvdW5kICYmIG1heCAtIG1pbkJvdW5kIHx8XHJcbiAgICBwb3NpdGlvbiA8IG1heEJvdW5kICYmIG1heCA+IG1heEJvdW5kICYmIHBvc2l0aW9uIC0gbWF4Qm91bmQgfHxcclxuICAgIDApO1xyXG59Ki9cclxuXHJcbmZ1bmN0aW9uIGdldE91dGVyRGlmZihwb3NpdGlvbiwgc2l6ZSwgbWluQm91bmQsIG1heEJvdW5kKSB7XHJcbiAgY29uc3QgbWF4ID0gcG9zaXRpb24gKyBzaXplO1xyXG4gIHJldHVybiAocG9zaXRpb24gPCBtaW5Cb3VuZCAmJiBtYXggPiBtaW5Cb3VuZCAmJiBtYXggLSBtaW5Cb3VuZCB8fFxyXG4gICAgcG9zaXRpb24gPCBtYXhCb3VuZCAmJiBtYXggPiBtYXhCb3VuZCAmJiBwb3NpdGlvbiAtIG1heEJvdW5kIHx8XHJcbiAgICAwKTtcclxufVxyXG5cclxuZnVuY3Rpb24gcmVzb2x2ZUNvbGxpc2lvbihkaWZmLCB2YWwpIHtcclxuICByZXR1cm4gdmFsIC0gZGlmZjtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Q29sbGlkZXJzSW5SYW5nZShyYW5nZU1pbiwgcmFuZ2VNYXgsIGNvbGxpZGVycykge1xyXG4gIHJldHVybiBjb2xsaWRlcnMuZmlsdGVyKGZ1bmN0aW9uIChjb2xsaWRlcikge1xyXG4gICAgcmV0dXJuIGluUmFuZ2UocmFuZ2VNaW4sIHJhbmdlTWF4LCBjb2xsaWRlcik7XHJcbiAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluUmFuZ2UocmFuZ2VNaW4sIHJhbmdlTWF4LCBjb2xsaWRlcikge1xyXG4gIHJldHVybiAocmFuZ2VNaW4gPCBjb2xsaWRlci5yYW5nZU1heCAmJlxyXG4gICAgcmFuZ2VNYXggPiBjb2xsaWRlci5yYW5nZU1pbik7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldE1pblBvc2l0aW9uRGlmZihtaW4sIGNvbGxpZGVyTWF4KSB7XHJcbiAgcmV0dXJuIGNvbGxpZGVyTWF4IC0gbWluO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRNYXhQb3NpdGlvbkRpZmYobWF4LCBjb2xsaWRlck1pbikge1xyXG4gIHJldHVybiBjb2xsaWRlck1pbiAtIG1heDtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0SW50ZXJzZWN0ZWRDb2xsaWRlcnMoY29sbGlkZXJzLCBwb3NpdGlvbk1pbiwgcG9zaXRpb25NYXgsIHJhbmdlTWluLCByYW5nZU1heCkge1xyXG4gIHJldHVybiBjb2xsaWRlcnNcclxuICAgIC5maWx0ZXIoZnVuY3Rpb24gKGNvbGxpZGVyKSB7XHJcbiAgICAgIHJldHVybiAocmFuZ2VNaW4gPCBjb2xsaWRlci5yYW5nZU1heCAmJlxyXG4gICAgICAgIHJhbmdlTWF4ID4gY29sbGlkZXIucmFuZ2VNaW4pO1xyXG4gICAgfSlcclxuICAgIC5tYXAoZnVuY3Rpb24gKGNvbGxpZGVyKSB7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgcG9zaXRpb25NaW46IGNvbGxpZGVyLnBvc2l0aW9uTWF4IC0gcG9zaXRpb25NaW4sXHJcbiAgICAgICAgcG9zaXRpb25NYXg6IGNvbGxpZGVyLnBvc2l0aW9uTWluIC0gcG9zaXRpb25NYXhcclxuICAgICAgfTtcclxuICAgIH0pXHJcbiAgICAuZmlsdGVyKGZ1bmN0aW9uIChkaWZmKSB7XHJcbiAgICAgIHJldHVybiAoZGlmZi5wb3NpdGlvbk1pbiA+IDAgJiYgZGlmZi5wb3NpdGlvbk1heCA8IDApO1xyXG4gICAgfSlcclxuICAgIC5tYXAoZnVuY3Rpb24gKGRpZmYpIHtcclxuICAgICAgcmV0dXJuIE1hdGgubWF4KGRpZmYucG9zaXRpb25NaW4sIGRpZmYucG9zaXRpb25NYXgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLyouZmlsdGVyKGNvbGxpZGVyID0+XHJcbiAgICAgIHJhbmdlTWluIDw9IGNvbGxpZGVyLnJhbmdlTWF4ICYmXHJcbiAgICAgIHJhbmdlTWF4ID49IGNvbGxpZGVyLnJhbmdlTWluICYmXHJcbiAgICAgIHBvc2l0aW9uTWluIDw9IGNvbGxpZGVyLnBvc2l0aW9uTWF4ICYmXHJcbiAgICAgIHBvc2l0aW9uTWF4ID49IGNvbGxpZGVyLnBvc2l0aW9uTWluXHJcbiAgICApOyovXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlc29sdmVDb2xsaXNpb25zKHBvc2l0aW9uLCBjb2xsaWRlcnMpIHtcclxuICAvLyBmaXhtZTogbm90IHJldHVybmluZz8/XHJcbiAgY29sbGlkZXJzLnJlZHVjZShmdW5jdGlvbiAocG9zaXRpb25EZWx0YSwgY29sbGlkZXIpIHtcclxuICAgIGNvbnN0IGRpZmYgPSBnZXRPdXRlckRpZmYoXHJcbiAgICAgIHBvc2l0aW9uLFxyXG4gICAgICBzaXplLFxyXG4gICAgICBjb2xsaWRlci5wb3NpdGlvbk1pbixcclxuICAgICAgY29sbGlkZXIucG9zaXRpb25NYXhcclxuICAgICk7XHJcbiAgICByZXR1cm4gKGRpZmYpID9cclxuICAgICAgICBwb3NpdGlvbiAtIGRpZmYgOlxyXG4gICAgICAgIHBvc2l0aW9uRGVsdGE7XHJcbiAgfSwgcG9zaXRpb24pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRDb2xsaXNpb25SZXNvbHZlKGNvbGxpZGVycywgcG9zaXRpb24sIHNpemUsIHJhbmdlTWluLCByYW5nZU1heCkge1xyXG4gIHJldHVybiBjb2xsaWRlcnNcclxuICAgIC5maWx0ZXIoY29sbGlkZXIgPT5cclxuICAgICAgcmFuZ2VNaW4gPD0gY29sbGlkZXIucmFuZ2VNYXggJiYgcmFuZ2VNYXggPj0gY29sbGlkZXIucmFuZ2VNaW5cclxuICAgIClcclxuICAgIC5yZWR1Y2UoKHBvc2l0aW9uRGVsdGEsIGNvbGxpZGVyKSA9PiB7XHJcbiAgICAgIGNvbnN0IGRpZmYgPSBnZXRPdXRlckRpZmYoXHJcbiAgICAgICAgICBwb3NpdGlvbixcclxuICAgICAgICAgIHNpemUsXHJcbiAgICAgICAgICBjb2xsaWRlci5wb3NpdGlvbk1pbixcclxuICAgICAgICAgIGNvbGxpZGVyLnBvc2l0aW9uTWF4XHJcbiAgICAgICk7XHJcblxyXG4gICAgICByZXR1cm4gKGRpZmYpID9cclxuICAgICAgICBwb3NpdGlvbiAtIGRpZmYgOlxyXG4gICAgICAgIHBvc2l0aW9uRGVsdGE7XHJcbiAgICB9LCBwb3NpdGlvbik7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFwcGx5QW5pbWF0aW9uKHNwcml0ZSkge1xyXG4gIGNvbnN0IHNlcXVlbmNlID0gc3ByaXRlLnR5cGUuZnJhbWVTZXRbZ2V0QW5pbWF0aW9uKHNwcml0ZSldO1xyXG4gIGNvbnN0IGZyYW1lSW5kZXggPSBnZXRGcmFtZUluZGV4KHNwcml0ZS5hbmltYXRpb24uY3VycmVudEluZGV4LCBzZXF1ZW5jZSk7XHJcbiAgc3ByaXRlLmFuaW1hdGlvbi5jdXJyZW50SW5kZXggPSBmcmFtZUluZGV4O1xyXG5cclxuICByZXR1cm4gZ2V0RnJhbWUoZnJhbWVJbmRleCwgc2VxdWVuY2UpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZyYW1lSW5kZXgoY3VycmVudEluZGV4LCBzZXF1ZW5jZSkge1xyXG4gIGNvbnN0IGluZGV4ID0gY3VycmVudEluZGV4IHx8IDA7XHJcbiAgcmV0dXJuIChpbmRleCA8IHNlcXVlbmNlLmZyYW1lcy5sZW5ndGggLSAxKSA/XHJcbiAgICBpbmRleCArIDEgOiAwO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRBbmltYXRpb24oc3ByaXRlKSB7XHJcbiAgcmV0dXJuICdydW4nO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGcmFtZShpbmRleCwgc2VxdWVuY2UpIHtcclxuICByZXR1cm4gc2VxdWVuY2UuZnJhbWVzW2luZGV4XTtcclxufVxyXG5cclxuY29uc3QgZ2V0SW5wdXRzID0gSW5wdXQoKTtcclxuY29uc3QgZ2V0RnJhbWVzID0gRnJhbWUoKTtcclxuY29uc3Qgdmlld3BvcnQgPSBWaWV3cG9ydDtcclxuY29uc3QgZnBzVUkgPSBGcmFnbWVudCgnZnBzJyk7XHJcblxyXG5nZXRGcmFtZXMoZnVuY3Rpb24gKGVsYXBzZWQsIGZwcykge1xyXG4gIGZwc1VJLnRleHRDb250ZW50ID0gZnBzO1xyXG4gIHJldHVybiB0cnVlO1xyXG59KTtcclxuXHJcbnNjZW5lXHJcbiAgLnRoZW4oZnVuY3Rpb24gKHNjZW5lKSB7XHJcbiAgICBjb25zdCBzY2VuZUJvdW5kcyA9IE9iamVjdC5mcmVlemUoe1xyXG4gICAgICB3aWR0aDogc2NlbmUuc2NlbmVXaWR0aCxcclxuICAgICAgaGVpZ2h0OiBzY2VuZS5zY2VuZUhlaWdodFxyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgY2FudmFzID0gRnJhZ21lbnQoJ2NhbnZhcy1lbnRpdGllcycpO1xyXG4gICAgY29uc3QgY29udGV4dDJkID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICBjb25zdCBjb2xsaWRlcnMgPSBPYmplY3QuZnJlZXplKHNjZW5lLmNvbGxpZGVycyk7XHJcblxyXG4gICAgY29uc3QgY29sbGlkZXJzWCA9IGNvbGxpZGVycy5tYXAoY29sbGlkZXIgPT4ge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHg6IGNvbGxpZGVyLngsXHJcbiAgICAgICAgeTogY29sbGlkZXIueSxcclxuICAgICAgICB3aWR0aDogY29sbGlkZXIud2lkdGgsXHJcbiAgICAgICAgaGVpZ2h0OiBjb2xsaWRlci5oZWlnaHQsXHJcbiAgICAgICAgcG9zaXRpb25NaW46IGNvbGxpZGVyLngsXHJcbiAgICAgICAgcG9zaXRpb25NYXg6IGNvbGxpZGVyLnggKyBjb2xsaWRlci53aWR0aCxcclxuICAgICAgICByYW5nZU1pbjogY29sbGlkZXIueSxcclxuICAgICAgICByYW5nZU1heDogY29sbGlkZXIueSArIGNvbGxpZGVyLmhlaWdodFxyXG4gICAgICB9O1xyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgY29sbGlkZXJzWSA9IGNvbGxpZGVycy5tYXAoY29sbGlkZXIgPT4ge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHg6IGNvbGxpZGVyLngsXHJcbiAgICAgICAgeTogY29sbGlkZXIueSxcclxuICAgICAgICB3aWR0aDogY29sbGlkZXIud2lkdGgsXHJcbiAgICAgICAgaGVpZ2h0OiBjb2xsaWRlci5oZWlnaHQsXHJcbiAgICAgICAgcG9zaXRpb25NaW46IGNvbGxpZGVyLnksXHJcbiAgICAgICAgcG9zaXRpb25NYXg6IGNvbGxpZGVyLnkgKyBjb2xsaWRlci5oZWlnaHQsXHJcbiAgICAgICAgcmFuZ2VNaW46IGNvbGxpZGVyLngsXHJcbiAgICAgICAgcmFuZ2VNYXg6IGNvbGxpZGVyLnggKyBjb2xsaWRlci53aWR0aFxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBzcHJpdGVzID0gT2JqZWN0LmZyZWV6ZShzY2VuZS5zcHJpdGVzKTtcclxuICAgIGNvbnN0IHBsYXllciA9IHNwcml0ZXNbMF07XHJcblxyXG4gICAgZ2V0RnJhbWVzKGZ1bmN0aW9uIChlbGFwc2VkKSB7XHJcbiAgICAgIGNsZWFyQ29udGV4dChjb250ZXh0MmQsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XHJcblxyXG4gICAgICBjb25zdCBpbnB1dHMgPSBnZXRJbnB1dHMoKTtcclxuXHJcbiAgICAgIHBsYXllci52ZWxvY2l0eS55ID0gMzAwO1xyXG5cclxuICAgICAgaWYgKGlucHV0c1szN10pIHtcclxuICAgICAgICBwbGF5ZXIudmVsb2NpdHkueCA9IC0xMDA7XHJcbiAgICAgIH0gZWxzZSBpZiAoaW5wdXRzWzM5XSkge1xyXG4gICAgICAgIHBsYXllci52ZWxvY2l0eS54ID0gMTAwO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoaW5wdXRzWzM4XSkge1xyXG4gICAgICAgIHBsYXllci52ZWxvY2l0eS55ID0gLTUwMDtcclxuICAgICAgfVxyXG5cclxuICAgICAgc3ByaXRlcy5mb3JFYWNoKGZ1bmN0aW9uIChzcHJpdGUpIHtcclxuICAgICAgICBjb25zdCB2ZWxvY2l0eVggPSBnZXRWZWxvY2l0eShzcHJpdGUsICd4JywgZWxhcHNlZCk7XHJcbiAgICAgICAgY29uc3QgeCA9IGdldFBvc2l0aW9uRGVsdGEoc3ByaXRlLngsIHZlbG9jaXR5WCwgZWxhcHNlZCk7XHJcblxyXG4gICAgICAgIGNvbnN0IGJvdW5kc0RpZmZYID0gZ2V0SW5uZXJEaWZmKHgsIHNwcml0ZS53aWR0aCwgMCwgc2NlbmVCb3VuZHMud2lkdGgpO1xyXG4gICAgICAgIGNvbnN0IHgxID0gcmVzb2x2ZUNvbGxpc2lvbihib3VuZHNEaWZmWCwgeCk7XHJcblxyXG4gICAgICAgIGNvbnN0IHZlbG9jaXR5WSA9IGdldFZlbG9jaXR5KHNwcml0ZSwgJ3knLCBlbGFwc2VkKTtcclxuICAgICAgICBjb25zdCB5ID0gZ2V0UG9zaXRpb25EZWx0YShzcHJpdGUueSwgdmVsb2NpdHlZLCBlbGFwc2VkKTtcclxuXHJcbiAgICAgICAgY29uc3QgYm91bmRzRGlmZlkgPSBnZXRJbm5lckRpZmYoeSwgc3ByaXRlLmhlaWdodCwgMCwgc2NlbmVCb3VuZHMuaGVpZ2h0KTtcclxuICAgICAgICBjb25zdCB5MSA9IHJlc29sdmVDb2xsaXNpb24oYm91bmRzRGlmZlksIHkpO1xyXG5cclxuICAgICAgICBsZXQgeDIgPSB4MTtcclxuICAgICAgICBsZXQgeTIgPSB5MTtcclxuXHJcbiAgICAgICAgbGV0IHZhbHMgPSBnZXRDb2xsaWRlcnNJblJhbmdlKHkxLCB5MSArIHNwcml0ZS5oZWlnaHQsIGNvbGxpZGVyc1gpXHJcbiAgICAgICAgICAubWFwKGZ1bmN0aW9uIChjb2xsaWRlcikge1xyXG4gICAgICAgICAgICBsZXQgbWF4RGlmZiA9IGdldE1heFBvc2l0aW9uRGlmZih4MSArIHNwcml0ZS53aWR0aCwgY29sbGlkZXIucG9zaXRpb25NaW4pO1xyXG4gICAgICAgICAgICBsZXQgbWluRGlmZiA9IGdldE1pblBvc2l0aW9uRGlmZih4MSwgY29sbGlkZXIucG9zaXRpb25NYXgpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIChNYXRoLm1pbihNYXRoLmFicyhtYXhEaWZmKSwgTWF0aC5hYnMobWluRGlmZikpKTtcclxuICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZyh2YWxzKTtcclxuXHJcbiAgICAgICAgLy9jb25zdCB4MiA9IGdldENvbGxpc2lvblJlc29sdmUoY29sbGlkZXJzWCwgeDEsIHNwcml0ZS53aWR0aCwgeTEsIHkxICsgc3ByaXRlLmhlaWdodCk7XHJcbiAgICAgICAgLy9jb25zdCB5MiA9IGdldENvbGxpc2lvblJlc29sdmUoY29sbGlkZXJzWSwgeTEsIHNwcml0ZS5oZWlnaHQsIHgxLCB4MSArIHNwcml0ZS53aWR0aCk7XHJcblxyXG4gICAgICAgIC8qY29uc3QgaW50ZXJzZWN0ZWRDb2xsaWRlcnNYID0gZ2V0SW50ZXJzZWN0ZWRDb2xsaWRlcnMoXHJcbiAgICAgICAgICBjb2xsaWRlcnNYLFxyXG4gICAgICAgICAgeDEsIHgxICsgc3ByaXRlLndpZHRoLFxyXG4gICAgICAgICAgeTEsIHkxICsgc3ByaXRlLmhlaWdodFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdYJywgaW50ZXJzZWN0ZWRDb2xsaWRlcnNYKTtcclxuXHJcbiAgICAgICAgY29uc3QgeDIgPSAoaW50ZXJzZWN0ZWRDb2xsaWRlcnNYLmxlbmd0aCkgPyB4MSArIE1hdGgubWluLmFwcGx5KG51bGwsIGludGVyc2VjdGVkQ29sbGlkZXJzWCkgOiB4MTtcclxuXHJcbiAgICAgICAgY29uc3QgaW50ZXJzZWN0ZWRDb2xsaWRlcnNZID0gZ2V0SW50ZXJzZWN0ZWRDb2xsaWRlcnMoXHJcbiAgICAgICAgICBjb2xsaWRlcnNZLFxyXG4gICAgICAgICAgeTEsIHkxICsgc3ByaXRlLmhlaWdodCxcclxuICAgICAgICAgIHgyLCB4MiArIHNwcml0ZS53aWR0aFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdZJywgaW50ZXJzZWN0ZWRDb2xsaWRlcnNZKTtcclxuXHJcbiAgICAgICAgY29uc3QgeTIgPSAoaW50ZXJzZWN0ZWRDb2xsaWRlcnNZLmxlbmd0aCkgPyB5MSArIE1hdGgubWluLmFwcGx5KG51bGwsIGludGVyc2VjdGVkQ29sbGlkZXJzWSkgOiB5MTsqL1xyXG4gICAgICAgIC8vY29uc3QgaW50ZXJzZWN0ZWRDb2xsaWRlcnNZID0gZ2V0SW50ZXJzZWN0ZWRDb2xsaWRlcnMoY29sbGlkZXJzWSwgeTEsIHkxICsgc3ByaXRlLmhlaWdodCwgeDEsIHgxICsgc3ByaXRlLndpZHRoKTtcclxuICAgICAgICAvL2NvbnN0IHgyID0gcmVzb2x2ZUNvbGxpc2lvbnMoeDEsIGludGVyc2VjdGlvbnNYKTtcclxuICAgICAgICAvL2NvbnN0IHkyID0gcmVzb2x2ZUNvbGxpc2lvbnMoeTEsIGludGVyc2VjdGlvbnNZKTtcclxuXHJcbiAgICAgICAgLy8gbXV0YXRlIHNwcml0ZVxyXG4gICAgICAgIHNwcml0ZS52ZWxvY2l0eS54ID0gdmVsb2NpdHlYO1xyXG4gICAgICAgIHNwcml0ZS54ID0geDI7XHJcbiAgICAgICAgc3ByaXRlLnZlbG9jaXR5LnkgPSB2ZWxvY2l0eVk7XHJcbiAgICAgICAgc3ByaXRlLnkgPSB5MjtcclxuXHJcbiAgICAgICAgaWYgKHNwcml0ZSA9PT0gcGxheWVyKSB7XHJcbiAgICAgICAgICBjb25zdCBtaW5NYXJnaW4gPSB2aWV3cG9ydC5tYXJnaW5MZWZ0O1xyXG4gICAgICAgICAgY29uc3QgbWF4TWFyZ2luID0gdmlld3BvcnQud2lkdGggLSB2aWV3cG9ydC5tYXJnaW5SaWdodDtcclxuICAgICAgICAgIGNvbnN0IHZpZXdwb3J0RGlmZlggPSBnZXRJbm5lckRpZmYoXHJcbiAgICAgICAgICAgIHNwcml0ZS54LFxyXG4gICAgICAgICAgICBzcHJpdGUud2lkdGgsXHJcbiAgICAgICAgICAgIHZpZXdwb3J0LnggKyBtaW5NYXJnaW4sXHJcbiAgICAgICAgICAgIHZpZXdwb3J0LnggKyBtYXhNYXJnaW5cclxuICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgLy8gbXV0YXRlIHZpZXdwb3J0XHJcbiAgICAgICAgICBpZiAodmlld3BvcnREaWZmWCA+IDAgJiYgc3ByaXRlLnZlbG9jaXR5LnggPiAwKSB7XHJcbiAgICAgICAgICAgIHZpZXdwb3J0LnggPSBnZXRQb3NpdGlvbkZyb21NYXhNYXJnaW4oc3ByaXRlLngsIHNwcml0ZS53aWR0aCwgbWF4TWFyZ2luKTtcclxuICAgICAgICAgIH0gZWxzZSBpZiAodmlld3BvcnREaWZmWCA8IDAgJiYgc3ByaXRlLnZlbG9jaXR5LnggPCAwKSB7XHJcbiAgICAgICAgICAgIHZpZXdwb3J0LnggPSBnZXRQb3NpdGlvbkZyb21NaW5NYXJnaW4oc3ByaXRlLngsIG1pbk1hcmdpbik7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBmcmFtZSA9IGFwcGx5QW5pbWF0aW9uKHNwcml0ZSk7XHJcbiAgICAgICAgY29uc3QgcG9zID0ge3g6IHNwcml0ZS54LCB5OiBzcHJpdGUueX07XHJcblxyXG4gICAgICAgIHJlbmRlcihjb250ZXh0MmQsIHBvcywgZnJhbWUsIHZpZXdwb3J0KTtcclxuICAgICAgICByZW5kZXJSZWN0cyhjb250ZXh0MmQsIGNvbGxpZGVycywgdmlld3BvcnQpO1xyXG4gICAgICAgIC8vcmVuZGVyUmVjdHMoY29udGV4dDJkLCBpbnRlcnNlY3RlZENvbGxpZGVycywgdmlld3BvcnQsICcjZmYwMDAwJyk7XHJcbiAgICAgICAgcmVuZGVyUmVjdHMoY29udGV4dDJkLCBzcHJpdGVzLCB2aWV3cG9ydCk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gc2NlbmU7XHJcbiAgfSlcclxuICAudGhlbihmdW5jdGlvbiAoc2NlbmUpIHtcclxuICAgIGNvbnN0IGJhY2tncm91bmRJbWFnZSA9IHNjZW5lLmJhY2tncm91bmRJbWFnZTtcclxuXHJcbiAgICBjb25zdCBjYW52YXMgPSBGcmFnbWVudCgnY2FudmFzLWJhY2tncm91bmQnKTtcclxuICAgIGNvbnN0IGNvbnRleHQyZCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG5cclxuICAgIGdldEZyYW1lcyhmdW5jdGlvbiAoKSB7XHJcbiAgICAgIGNsZWFyQ29udGV4dChjb250ZXh0MmQsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XHJcbiAgICAgIC8vcmVuZGVyKGNvbnRleHQyZCwge3g6IDAsIHk6IDB9LCBiYWNrZ3JvdW5kSW1hZ2UsIHZpZXdwb3J0KTtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBzY2VuZTtcclxuICB9KTtcclxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgU2hhdW4gb24gMy8xLzE1XHJcbiAqXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtnZXRDYW52YXMsIGdldFRyYW5zcGFyZW50SW1hZ2V9IGZyb20gJy4uL2VuZ2luZS9jb21tb24uanMnO1xyXG5cclxuY29uc3QgREVGQVVMVF9SQVRFID0gNTtcclxuXHJcbmZ1bmN0aW9uIGJ1aWxkRnJhbWVTZXF1ZW5jZShmcmFtZVNldERlZmluaXRpb24sIGZyYW1lU2l6ZSwgc3ByaXRlU2hlZXQpIHtcclxuICB2YXIgZnJhbWVXaWR0aCA9IGZyYW1lU2l6ZS53aWR0aDtcclxuICB2YXIgZnJhbWVIZWlnaHQgPSBmcmFtZVNpemUuaGVpZ2h0O1xyXG5cclxuICByZXR1cm4ge1xyXG4gICAgcmF0ZTogZnJhbWVTZXREZWZpbml0aW9uLnJhdGUgfHwgREVGQVVMVF9SQVRFLFxyXG4gICAgZnJhbWVzOiBmcmFtZVNldERlZmluaXRpb24uZnJhbWVzXHJcbiAgICAgIC5tYXAoZnVuY3Rpb24oZnJhbWVEZWZpbml0aW9uKSB7XHJcbiAgICAgICAgdmFyIGZyYW1lID0gZ2V0Q2FudmFzKGZyYW1lV2lkdGgsIGZyYW1lSGVpZ2h0KTtcclxuXHJcbiAgICAgICAgZnJhbWVcclxuICAgICAgICAgIC5nZXRDb250ZXh0KCcyZCcpXHJcbiAgICAgICAgICAuZHJhd0ltYWdlKFxyXG4gICAgICAgICAgICBzcHJpdGVTaGVldCxcclxuICAgICAgICAgICAgZnJhbWVEZWZpbml0aW9uLngsIGZyYW1lRGVmaW5pdGlvbi55LFxyXG4gICAgICAgICAgICBmcmFtZVdpZHRoLCBmcmFtZUhlaWdodCxcclxuICAgICAgICAgICAgMCwgMCxcclxuICAgICAgICAgICAgZnJhbWVXaWR0aCwgZnJhbWVIZWlnaHRcclxuICAgICAgICAgICk7XHJcblxyXG4gICAgICAgIHJldHVybiBmcmFtZTtcclxuICAgICAgfSlcclxuICB9O1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoc3ByaXRlRGVmaW5pdGlvbiwgc3ByaXRlU2hlZXQpIHtcclxuICByZXR1cm4gT2JqZWN0XHJcbiAgICAua2V5cyhzcHJpdGVEZWZpbml0aW9uLmFuaW1hdGlvbnMpXHJcbiAgICAucmVkdWNlKGZ1bmN0aW9uKGZyYW1lU2V0LCBmcmFtZVNldElkKSB7XHJcbiAgICAgIHZhciBmcmFtZVNlcXVlbmNlID0gYnVpbGRGcmFtZVNlcXVlbmNlKFxyXG4gICAgICAgIHNwcml0ZURlZmluaXRpb24uYW5pbWF0aW9uc1tmcmFtZVNldElkXSxcclxuICAgICAgICBzcHJpdGVEZWZpbml0aW9uLmZyYW1lU2l6ZSxcclxuICAgICAgICBzcHJpdGVTaGVldFxyXG4gICAgICApO1xyXG5cclxuICAgICAgZnJhbWVTZXF1ZW5jZS5mcmFtZXMgPSBmcmFtZVNlcXVlbmNlLmZyYW1lc1xyXG4gICAgICAgIC5tYXAoZnVuY3Rpb24oZnJhbWUpIHtcclxuICAgICAgICAgIHJldHVybiBnZXRUcmFuc3BhcmVudEltYWdlKHNwcml0ZURlZmluaXRpb24udHJhbnNwYXJlbnRDb2xvciwgZnJhbWUpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgZnJhbWVTZXRbZnJhbWVTZXRJZF0gPSBmcmFtZVNlcXVlbmNlO1xyXG5cclxuICAgICAgcmV0dXJuIGZyYW1lU2V0O1xyXG4gICAgfSwge30pO1xyXG59O1xyXG4iLCJpbXBvcnQgU2NoZWR1bGVyIGZyb20gJy4uL2VuZ2luZS9zY2hlZHVsZXIuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKGZyYW1lU2V0KSB7XHJcbiAgdmFyIGN1cnJlbnRGcmFtZVNlcXVlbmNlID0gZnJhbWVTZXRbJ3J1biddLCAvL251bGwsXHJcbiAgICBjdXJyZW50RnJhbWVJbmRleCA9IDAsXHJcbiAgICBjdXJyZW50RnJhbWUgPSBudWxsLFxyXG4gICAgZnJhbWVDYWxsYmFjayA9IG51bGw7XHJcblxyXG4gIHZhciBzY2hlZHVsZXJJZCA9IFNjaGVkdWxlcihmdW5jdGlvbihkZWx0YVRpbWUsIHNldFJhdGUpIHtcclxuICAgIGlmKCFjdXJyZW50RnJhbWVTZXF1ZW5jZSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgaWYoIWN1cnJlbnRGcmFtZSkge1xyXG4gICAgICBzZXRSYXRlKGN1cnJlbnRGcmFtZVNlcXVlbmNlLnJhdGUpO1xyXG4gICAgfVxyXG5cclxuICAgIGN1cnJlbnRGcmFtZSA9IGN1cnJlbnRGcmFtZVNlcXVlbmNlLmZyYW1lc1tjdXJyZW50RnJhbWVJbmRleF07XHJcbiAgICBpZihmcmFtZUNhbGxiYWNrKSB7XHJcbiAgICAgIGZyYW1lQ2FsbGJhY2soY3VycmVudEZyYW1lKTtcclxuICAgIH1cclxuXHJcbiAgICBpZigrK2N1cnJlbnRGcmFtZUluZGV4ID49IGN1cnJlbnRGcmFtZVNlcXVlbmNlLmZyYW1lcy5sZW5ndGgpIHtcclxuICAgICAgY3VycmVudEZyYW1lSW5kZXggPSAwO1xyXG4gICAgfVxyXG4gIH0pXHJcbiAgICAuaWQoKTtcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIHBsYXk6IGZ1bmN0aW9uKGZyYW1lU2V0SWQpIHtcclxuICAgICAgY3VycmVudEZyYW1lU2VxdWVuY2UgPSBmcmFtZVNldFtmcmFtZVNldElkXTtcclxuICAgICAgY3VycmVudEZyYW1lSW5kZXggPSAwO1xyXG4gICAgICBjdXJyZW50RnJhbWUgPSBudWxsO1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcbiAgICBvbkZyYW1lOiBmdW5jdGlvbihjYikge1xyXG4gICAgICBmcmFtZUNhbGxiYWNrID0gY2I7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuICAgIHN0b3A6IGZ1bmN0aW9uKCkge1xyXG4gICAgICBjdXJyZW50RnJhbWVTZXF1ZW5jZSA9IG51bGw7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuICAgIGtpbGw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICBTY2hlZHVsZXIudW5zY2hlZHVsZShzY2hlZHVsZXJJZCk7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuICAgIGN1cnJlbnRGcmFtZUluZGV4OiBmdW5jdGlvbigpIHtcclxuICAgICAgcmV0dXJuIGN1cnJlbnRGcmFtZUluZGV4O1xyXG4gICAgfSxcclxuICAgIGdldEltYWdlOiBmdW5jdGlvbigpIHtcclxuICAgICAgcmV0dXJuIGN1cnJlbnRGcmFtZTtcclxuICAgIH0sXHJcbiAgICBnZXROZXh0OiBmdW5jdGlvbigpIHtcclxuICAgICAgY3VycmVudEZyYW1lID0gY3VycmVudEZyYW1lU2VxdWVuY2UuZnJhbWVzW2N1cnJlbnRGcmFtZUluZGV4XTtcclxuICAgICAgaWYoKytjdXJyZW50RnJhbWVJbmRleCA+PSBjdXJyZW50RnJhbWVTZXF1ZW5jZS5mcmFtZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgY3VycmVudEZyYW1lSW5kZXggPSAwO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBjdXJyZW50RnJhbWU7XHJcbiAgICB9XHJcbiAgfTtcclxufVxyXG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgc2hhdW53ZXN0IG9uIDYvMjkvMTUuXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGNsZWFyQ29udGV4dChjb250ZXh0MmQsIHdpZHRoLCBoZWlnaHQpIHtcbiAgY29udGV4dDJkLmNsZWFyUmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlcihjb250ZXh0MmQsIHBvaW50LCBpbWFnZSwgdmlld3BvcnQpIHtcbiAgaWYoIWltYWdlKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnRleHQyZC5kcmF3SW1hZ2UoXG4gICAgaW1hZ2UsXG4gICAgcG9pbnQueCAtIHZpZXdwb3J0LnggfHwgMCxcbiAgICBwb2ludC55IC0gdmlld3BvcnQueSB8fCAwXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJSZWN0cyhjb250ZXh0MmQsIHJlY3RzLCB2aWV3cG9ydCwgY29sb3IpIHtcbiAgY29sb3IgPSBjb2xvciB8fCAnIzAwMDAwMCc7XG4gIHJlY3RzLmZvckVhY2goZnVuY3Rpb24gKHJlY3QpIHtcbiAgICBjb250ZXh0MmQuc3Ryb2tlU3R5bGUgPSBjb2xvcjtcbiAgICBjb250ZXh0MmQuc3Ryb2tlUmVjdChyZWN0LnggLSB2aWV3cG9ydC54LCByZWN0LnkgLSB2aWV3cG9ydC55LCByZWN0LndpZHRoLCByZWN0LmhlaWdodCk7XG4gIH0pO1xufVxuIiwiXHJcbmltcG9ydCBVdGlsIGZyb20gJy4vdXRpbC5qcyc7XHJcblxyXG4vLyBSZXR1cm4gZXZlcnl0aGluZyBiZWZvcmUgdGhlIGxhc3Qgc2xhc2ggb2YgYSB1cmxcclxuLy8gZS5nLiBodHRwOi8vZm9vL2Jhci9iYXouanNvbiA9PiBodHRwOi8vZm9vL2JhclxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0QmFzZVVybCh1cmwpIHtcclxuICB2YXIgbiA9IHVybC5sYXN0SW5kZXhPZignLycpO1xyXG4gIHJldHVybiB1cmwuc3Vic3RyaW5nKDAsIG4pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaXNGdWxsVXJsKHVybCkge1xyXG4gIHJldHVybiAodXJsLnN1YnN0cmluZygwLCA3KSA9PT0gJ2h0dHA6Ly8nIHx8XHJcbiAgICB1cmwuc3Vic3RyaW5nKDAsIDgpID09PSAnaHR0cHM6Ly8nKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZVVybCh1cmwsIGJhc2VVcmwpIHtcclxuICBpZihiYXNlVXJsICYmICFpc0Z1bGxVcmwodXJsKSkge1xyXG4gICAgcmV0dXJuIGJhc2VVcmwgKyAnLycgKyB1cmw7XHJcbiAgfVxyXG4gIHJldHVybiB1cmw7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBtZXJnZU9iamVjdChzb3VyY2UsIGRlc3RpbmF0aW9uLCBhbGxvd1dyYXAsIGV4Y2VwdGlvbk9uQ29sbGlzaW9ucykge1xyXG4gIHNvdXJjZSA9IHNvdXJjZSB8fCB7fTsgLy9Qb29sLmdldE9iamVjdCgpO1xyXG4gIGRlc3RpbmF0aW9uID0gZGVzdGluYXRpb24gfHwge307IC8vUG9vbC5nZXRPYmplY3QoKTtcclxuXHJcbiAgT2JqZWN0LmtleXMoc291cmNlKS5mb3JFYWNoKGZ1bmN0aW9uKHByb3ApIHtcclxuICAgIGFzc2lnblByb3BlcnR5KHNvdXJjZSwgZGVzdGluYXRpb24sIHByb3AsIGFsbG93V3JhcCwgZXhjZXB0aW9uT25Db2xsaXNpb25zKTtcclxuICB9KTtcclxuXHJcbiAgcmV0dXJuIGRlc3RpbmF0aW9uO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gYXNzaWduUHJvcGVydHkoc291cmNlLCBkZXN0aW5hdGlvbiwgcHJvcCwgYWxsb3dXcmFwLCBleGNlcHRpb25PbkNvbGxpc2lvbnMpIHtcclxuICBpZihkZXN0aW5hdGlvbi5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xyXG4gICAgaWYoYWxsb3dXcmFwKSB7XHJcbiAgICAgIGRlc3RpbmF0aW9uW3Byb3BdID0gRnVuYy53cmFwKGRlc3RpbmF0aW9uW3Byb3BdLCBzb3VyY2VbcHJvcF0pO1xyXG4gICAgICBVdGlsLmxvZygnTWVyZ2U6IHdyYXBwZWQgXFwnJyArIHByb3AgKyAnXFwnJyk7XHJcbiAgICB9IGVsc2UgaWYoZXhjZXB0aW9uT25Db2xsaXNpb25zKSB7XHJcbiAgICAgIFV0aWwuZXJyb3IoJ0ZhaWxlZCB0byBtZXJnZSBtaXhpbi4gTWV0aG9kIFxcJycgK1xyXG4gICAgICBwcm9wICsgJ1xcJyBjYXVzZWQgYSBuYW1lIGNvbGxpc2lvbi4nKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGRlc3RpbmF0aW9uW3Byb3BdID0gc291cmNlW3Byb3BdO1xyXG4gICAgICBVdGlsLmxvZygnTWVyZ2U6IG92ZXJ3cm90ZSBcXCcnICsgcHJvcCArICdcXCcnKTtcclxuICAgIH1cclxuICAgIHJldHVybiBkZXN0aW5hdGlvbjtcclxuICB9XHJcblxyXG4gIGRlc3RpbmF0aW9uW3Byb3BdID0gc291cmNlW3Byb3BdO1xyXG5cclxuICByZXR1cm4gZGVzdGluYXRpb247XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRDYW52YXMod2lkdGgsIGhlaWdodCkge1xyXG4gIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuXHJcbiAgY2FudmFzLndpZHRoID0gd2lkdGggfHwgNTAwO1xyXG4gIGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQgfHwgNTAwO1xyXG5cclxuICByZXR1cm4gY2FudmFzO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaW50ZXJzZWN0cyhyZWN0QSwgcmVjdEIpIHtcclxuICByZXR1cm4gIShcclxuICAgIHJlY3RBLnggKyByZWN0QS53aWR0aCA8IHJlY3RCLnggfHxcclxuICAgIHJlY3RBLnkgKyByZWN0QS5oZWlnaHQgPCByZWN0Qi55IHx8XHJcbiAgICByZWN0QS54ID4gcmVjdEIueCArIHJlY3RCLndpZHRoIHx8XHJcbiAgICByZWN0QS55ID4gcmVjdEIueSArIHJlY3RCLmhlaWdodFxyXG4gICk7XHJcbn1cclxuXHJcbi8vIE1ha2UgdGhlIGdpdmVuIFJHQiB2YWx1ZSB0cmFuc3BhcmVudCBpbiB0aGUgZ2l2ZW4gaW1hZ2UuXHJcbi8vIFJldHVybnMgYSBuZXcgaW1hZ2UuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRUcmFuc3BhcmVudEltYWdlKHRyYW5zUkdCLCBpbWFnZSkge1xyXG4gIHZhciByLCBnLCBiLCBuZXdJbWFnZSwgZGF0YUxlbmd0aDtcclxuICB2YXIgd2lkdGggPSBpbWFnZS53aWR0aDtcclxuICB2YXIgaGVpZ2h0ID0gaW1hZ2UuaGVpZ2h0O1xyXG4gIHZhciBpbWFnZURhdGEgPSBpbWFnZVxyXG4gICAgLmdldENvbnRleHQoJzJkJylcclxuICAgIC5nZXRJbWFnZURhdGEoMCwgMCwgd2lkdGgsIGhlaWdodCk7XHJcblxyXG4gIGlmKHRyYW5zUkdCKSB7XHJcbiAgICBkYXRhTGVuZ3RoID0gd2lkdGggKiBoZWlnaHQgKiA0O1xyXG5cclxuICAgIGZvcih2YXIgaW5kZXggPSAwOyBpbmRleCA8IGRhdGFMZW5ndGg7IGluZGV4Kz00KSB7XHJcbiAgICAgIHIgPSBpbWFnZURhdGEuZGF0YVtpbmRleF07XHJcbiAgICAgIGcgPSBpbWFnZURhdGEuZGF0YVtpbmRleCArIDFdO1xyXG4gICAgICBiID0gaW1hZ2VEYXRhLmRhdGFbaW5kZXggKyAyXTtcclxuICAgICAgaWYociA9PT0gdHJhbnNSR0JbMF0gJiYgZyA9PT0gdHJhbnNSR0JbMV0gJiYgYiA9PT0gdHJhbnNSR0JbMl0pIHtcclxuICAgICAgICBpbWFnZURhdGEuZGF0YVtpbmRleCArIDNdID0gMDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgbmV3SW1hZ2UgPSBnZXRDYW52YXMod2lkdGgsIGhlaWdodCk7XHJcbiAgbmV3SW1hZ2VcclxuICAgIC5nZXRDb250ZXh0KCcyZCcpXHJcbiAgICAucHV0SW1hZ2VEYXRhKGltYWdlRGF0YSwgMCwgMCk7XHJcblxyXG4gIHJldHVybiBuZXdJbWFnZTtcclxufVxyXG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBTaGF1biBvbiA0LzIzLzIwMTUuXHJcbiAqL1xyXG5cclxudmFyIGFsbERhdGFFbGVtZW50cztcclxuXHJcbmZ1bmN0aW9uIGhhc0RhdGFBdHRyaWJ1dGUoZWxlbWVudCkge1xyXG4gIHZhciBhdHRyaWJ1dGVzID0gZWxlbWVudC5hdHRyaWJ1dGVzO1xyXG4gIGZvcih2YXIgaSA9IDAsIG51bUF0dHJpYnV0ZXMgPSBhdHRyaWJ1dGVzLmxlbmd0aDsgaSA8IG51bUF0dHJpYnV0ZXM7IGkrKykge1xyXG4gICAgaWYoYXR0cmlidXRlc1tpXS5uYW1lLnN1YnN0cigwLCA0KSA9PT0gJ2RhdGEnKSB7XHJcbiAgICAgIHJldHVybiBlbGVtZW50O1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGZpbmREYXRhRWxlbWVudHMgKHBhcmVudEVsZW1lbnQpIHtcclxuICB2YXIgYWxsRWxlbWVudHMsIGVsZW1lbnQsIGRhdGFFbGVtZW50cyA9IFtdO1xyXG5cclxuICBpZighcGFyZW50RWxlbWVudCkge1xyXG4gICAgdmFyIGh0bWwgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaHRtbCcpO1xyXG4gICAgaWYoIWh0bWxbMF0pIHtcclxuICAgICAgcmV0dXJuIGRhdGFFbGVtZW50cztcclxuICAgIH1cclxuICAgIHBhcmVudEVsZW1lbnQgPSBodG1sWzBdO1xyXG4gIH1cclxuXHJcbiAgYWxsRWxlbWVudHMgPSBwYXJlbnRFbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyonKTtcclxuICBmb3IodmFyIGkgPSAwLCBudW1FbGVtZW50cyA9IGFsbEVsZW1lbnRzLmxlbmd0aDsgaSA8IG51bUVsZW1lbnRzOyBpKyspIHtcclxuICAgIGVsZW1lbnQgPSBhbGxFbGVtZW50c1tpXTtcclxuICAgIGlmKGhhc0RhdGFBdHRyaWJ1dGUoZWxlbWVudCkpIHtcclxuICAgICAgZGF0YUVsZW1lbnRzLnB1c2goZWxlbWVudCk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBkYXRhRWxlbWVudHM7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBGcmFnbWVudHMgKG5hbWUpIHtcclxuICBpZighYWxsRGF0YUVsZW1lbnRzKSB7XHJcbiAgICBjYWNoZURhdGFFbGVtZW50cygpO1xyXG4gIH1cclxuICByZXR1cm4gYWxsRGF0YUVsZW1lbnRzLmZpbHRlcihmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICBpZihlbGVtZW50Lmhhc0F0dHJpYnV0ZSgnZGF0YS0nICsgbmFtZSkpIHtcclxuICAgICAgcmV0dXJuIGVsZW1lbnQ7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBGcmFnbWVudCAobmFtZSkge1xyXG4gIHJldHVybiBGcmFnbWVudHMobmFtZSlbMF07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjYWNoZURhdGFFbGVtZW50cygpIHtcclxuICBhbGxEYXRhRWxlbWVudHMgPSBmaW5kRGF0YUVsZW1lbnRzKCk7XHJcbn1cclxuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IHNoYXVud2VzdCBvbiA2LzIwLzE1LlxuICovXG5cbmNvbnN0IE1TX1BFUl9TRUNPTkQgPSAxMDAwO1xuXG5mdW5jdGlvbiBnZXREZWx0YVRpbWUobm93LCBsYXN0VXBkYXRlVGltZSkge1xuICByZXR1cm4gKG5vdyAtIGxhc3RVcGRhdGVUaW1lKSAvIE1TX1BFUl9TRUNPTkQ7XG59XG5cbi8vIFNUQVRFRlVMXG5mdW5jdGlvbiBGcmFtZUxvb3Aoc3RhcnQpIHtcbiAgbGV0IGNicyA9IFtdLCBsYXN0ID0gc3RhcnQsIGZwcyA9IDAsIGZyYW1lQ291bnQgPSAwO1xuICBsZXQgaW50ZXJ2YWxJZCA9IHNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcbiAgICBmcHMgPSBmcmFtZUNvdW50O1xuICAgIGZyYW1lQ291bnQgPSAwO1xuICB9LCBNU19QRVJfU0VDT05EKTtcblxuICAoZnVuY3Rpb24gbG9vcCgpIHtcbiAgICBmcmFtZUNvdW50Kys7XG5cbiAgICBjYnMgPSBjYnNcbiAgICAgIC5tYXAoZnVuY3Rpb24gKGNiKSB7XG4gICAgICAgIHJldHVybiBjYihmcHMsIGxhc3QpICYmIGNiO1xuICAgICAgfSlcbiAgICAgIC5maWx0ZXIoZnVuY3Rpb24gKGNiKSB7XG4gICAgICAgIHJldHVybiBjYjtcbiAgICAgIH0pO1xuXG4gICAgbGFzdCA9ICtuZXcgRGF0ZSgpO1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShsb29wKTtcbiAgfSkoKTtcblxuICByZXR1cm4gZnVuY3Rpb24gKGNiKSB7XG4gICAgY2JzLnB1c2goY2IpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBGcmFtZSgpIHtcbiAgY29uc3QgZnJhbWVMb29wID0gRnJhbWVMb29wKCtuZXcgRGF0ZSgpKTtcblxuICByZXR1cm4gZnVuY3Rpb24gKGNiKSB7XG4gICAgZnJhbWVMb29wKGZ1bmN0aW9uIChmcHMsIGxhc3RVcGRhdGVUaW1lKSB7XG4gICAgICBjb25zdCBlbGFwc2VkID0gZ2V0RGVsdGFUaW1lKCtuZXcgRGF0ZSgpLCBsYXN0VXBkYXRlVGltZSk7XG4gICAgICByZXR1cm4gY2IoZWxhcHNlZCwgZnBzKTtcbiAgICB9KTtcbiAgfVxufVxuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IFNoYXVuIG9uIDUvMS8xNC5cbiAqL1xuXG52YXIgSU1BR0VfV0FJVF9JTlRFUlZBTCA9IDEwMDtcblxuZnVuY3Rpb24gd2FpdEZvckltYWdlIChpbWFnZSkge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgdmFyIGludGVydmFsSWQgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICAgIGlmKGltYWdlLmNvbXBsZXRlKSB7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZCk7XG4gICAgICAgIHJlc29sdmUoaW1hZ2UpO1xuICAgICAgfVxuICAgIH0sIElNQUdFX1dBSVRfSU5URVJWQUwpO1xuXG4gICAgaW1hZ2Uub25lcnJvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZCk7XG4gICAgICByZWplY3QoKTtcbiAgICB9O1xuICB9KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0SW1hZ2UgKHVyaSkge1xuICB2YXIgaW1hZ2UsIHByb21pc2U7XG5cbiAgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgaW1hZ2Uuc3JjID0gdXJpO1xuXG4gIHByb21pc2UgPSB3YWl0Rm9ySW1hZ2UoaW1hZ2UpO1xuXG4gIHJldHVybiBwcm9taXNlO1xufVxuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IHNoYXVud2VzdCBvbiA2LzI4LzE1LlxuICovXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIElucHV0KCkge1xuICB2YXIga2V5cyA9IHt9O1xuXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAga2V5c1tldmVudC5rZXlDb2RlXSA9IHRydWU7XG4gIH0pO1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICBrZXlzW2V2ZW50LmtleUNvZGVdID0gZmFsc2U7XG4gIH0pO1xuXG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGtleXM7XG4gIH07XG59XG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBTaGF1biBvbiAyLzEvMTVcclxuICogQmFzZWQgb24gdGhlIGphY2syZCBDaHJvbm8gb2JqZWN0XHJcbiAqIFxyXG4gKi9cclxuXHJcbmltcG9ydCBVdGlsIGZyb20gJy4vdXRpbC5qcyc7XHJcbmltcG9ydCB7bWVyZ2VPYmplY3R9IGZyb20gJy4vY29tbW9uLmpzJztcclxuXHJcbnZhciBpbnN0YW5jZTtcclxudmFyIE9ORV9TRUNPTkQgPSAxMDAwO1xyXG5cclxuLy8gZ2V0IHJpZCBvZiBpbnN0YW5jZSBzdHVmZi4gSnVzdCB1c2UgdGhlIGRpIGNvbnRhaW5lcidzIHJlZ2lzdGVyU2luZ2xldG9uL3VzZVxyXG5mdW5jdGlvbiBTY2hlZHVsZXIoY2IsIHJhdGUpIHtcclxuICBpZighaW5zdGFuY2UpIHtcclxuICAgIGluc3RhbmNlID0gY3JlYXRlKCk7XHJcbiAgfVxyXG4gIGlmKGNiKSB7XHJcbiAgICBpbnN0YW5jZS5zY2hlZHVsZShjYiwgcmF0ZSk7XHJcbiAgfVxyXG4gIHJldHVybiBpbnN0YW5jZTtcclxufVxyXG5cclxuU2NoZWR1bGVyLmluc3RhbmNlID0gY3JlYXRlO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlKCkge1xyXG4gIHJldHVybiBtZXJnZU9iamVjdCh7XHJcbiAgICBzY2hlZHVsZWQ6IFtdLFxyXG4gICAgc2NoZWR1bGU6IHNjaGVkdWxlLFxyXG4gICAgdW5zY2hlZHVsZTogdW5zY2hlZHVsZSxcclxuICAgIHN0YXJ0OiBzdGFydCxcclxuICAgIHN0b3A6IHN0b3AsXHJcbiAgICBmcmFtZTogZnJhbWUsXHJcbiAgICBpZDogaWRcclxuICB9KS5zdGFydCgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzY2hlZHVsZShjYiwgcmF0ZSkge1xyXG4gIGZ1bmN0aW9uIHNldFJhdGUobmV3UmF0ZSkge1xyXG4gICAgcmF0ZSA9IG5ld1JhdGU7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBtYWtlRnJhbWUoKSB7XHJcbiAgICB2YXIgY291bnQgPSAxLFxyXG4gICAgICB0b3RhbERlbHRhVGltZSA9IDA7XHJcblxyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKGRlbHRhVGltZSkge1xyXG4gICAgICB0b3RhbERlbHRhVGltZSArPSBkZWx0YVRpbWU7XHJcbiAgICAgIGlmKGNvdW50ICE9PSByYXRlKSB7XHJcbiAgICAgICAgY291bnQrKztcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgY2IodG90YWxEZWx0YVRpbWUsIHNldFJhdGUpO1xyXG4gICAgICBjb3VudCA9IDE7XHJcbiAgICAgIHRvdGFsRGVsdGFUaW1lID0gMDtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBpZighVXRpbC5pc0Z1bmN0aW9uKGNiKSkge1xyXG4gICAgVXRpbC5lcnJvcignU2NoZWR1bGVyOiBvbmx5IGZ1bmN0aW9ucyBjYW4gYmUgc2NoZWR1bGVkLicpO1xyXG4gIH1cclxuICByYXRlID0gcmF0ZSB8fCAxO1xyXG5cclxuICB0aGlzLnNjaGVkdWxlZC5wdXNoKG1ha2VGcmFtZSgpKTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlkKCkge1xyXG4gIHJldHVybiB0aGlzLnNjaGVkdWxlZC5sZW5ndGg7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHVuc2NoZWR1bGUoaWQpIHtcclxuICB0aGlzLnNjaGVkdWxlZC5zcGxpY2UoaWQgLSAxLCAxKTtcclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuZnVuY3Rpb24gc3RhcnQoKSB7XHJcbiAgaWYodGhpcy5ydW5uaW5nKSB7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIG1lcmdlT2JqZWN0KHtcclxuICAgIGFjdHVhbEZwczogMCxcclxuICAgIHRpY2tzOiAwLFxyXG4gICAgZWxhcHNlZFNlY29uZHM6IDAsXHJcbiAgICBydW5uaW5nOiB0cnVlLFxyXG4gICAgbGFzdFVwZGF0ZVRpbWU6IG5ldyBEYXRlKCksXHJcbiAgICBvbmVTZWNvbmRUaW1lcklkOiB3aW5kb3cuc2V0SW50ZXJ2YWwob25PbmVTZWNvbmQuYmluZCh0aGlzKSwgT05FX1NFQ09ORClcclxuICB9LCB0aGlzKTtcclxuXHJcbiAgcmV0dXJuIHRoaXMuZnJhbWUoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gc3RvcCgpIHtcclxuICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcclxuICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLm9uZVNlY29uZFRpbWVySWQpO1xyXG4gIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLmFuaW1hdGlvbkZyYW1lSWQpO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuZnVuY3Rpb24gY2xlYXIoKSB7XHJcbiAgdGhpcy5zY2hlZHVsZWQubGVuZ3RoID0gMDtcclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuZnVuY3Rpb24gZnJhbWUoKSB7XHJcbiAgZXhlY3V0ZUZyYW1lQ2FsbGJhY2tzLmJpbmQodGhpcykoZ2V0RGVsdGFUaW1lLmJpbmQodGhpcykoKSk7XHJcbiAgdGhpcy50aWNrcysrO1xyXG5cclxuICBpZih0aGlzLnJ1bm5pbmcpIHtcclxuICAgIHRoaXMuYW5pbWF0aW9uRnJhbWVJZCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnJhbWUuYmluZCh0aGlzKSk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuZnVuY3Rpb24gb25PbmVTZWNvbmQoKSB7XHJcbiAgdGhpcy5hY3R1YWxGcHMgPSB0aGlzLnRpY2tzO1xyXG4gIHRoaXMudGlja3MgPSAwO1xyXG4gIHRoaXMuZWxhcHNlZFNlY29uZHMrKztcclxufVxyXG5cclxuZnVuY3Rpb24gZXhlY3V0ZUZyYW1lQ2FsbGJhY2tzKGRlbHRhVGltZSkge1xyXG4gIHZhciBzY2hlZHVsZWQgPSB0aGlzLnNjaGVkdWxlZDtcclxuXHJcbiAgZm9yKHZhciBpID0gMCwgbnVtU2NoZWR1bGVkID0gc2NoZWR1bGVkLmxlbmd0aDsgaSA8IG51bVNjaGVkdWxlZDsgaSsrKSB7XHJcbiAgICBzY2hlZHVsZWRbaV0oZGVsdGFUaW1lKTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldERlbHRhVGltZSgpIHtcclxuICB2YXIgbm93ID0gK25ldyBEYXRlKCk7XHJcbiAgdmFyIGRlbHRhVGltZSA9IChub3cgLSB0aGlzLmxhc3RVcGRhdGVUaW1lKSAvIE9ORV9TRUNPTkQ7XHJcblxyXG4gIHRoaXMubGFzdFVwZGF0ZVRpbWUgPSBub3c7XHJcblxyXG4gIHJldHVybiBkZWx0YVRpbWU7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFNjaGVkdWxlcjtcclxuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IHNoYXVud2VzdCBvbiA2LzExLzE1LlxuICovXG5cblxuaW1wb3J0IFZhbHZlIGZyb20gJy4uL3ZhbHZlLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZmV0Y2hKU09OKHVyaSkge1xuICAvL3JldHVybiBWYWx2ZS5jcmVhdGUoZmV0Y2godXJpKS50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlLmpzb24oKSkpO1xuICByZXR1cm4gZmV0Y2godXJpKS50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlLmpzb24oKSk7XG59IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgU2hhdW4gb24gNC8yMy8yMDE1LlxyXG4gKi9cclxuXHJcbnZhciB0eXBlcyA9IFsnQXJyYXknLCAnT2JqZWN0JywgJ0Jvb2xlYW4nLCAnQXJndW1lbnRzJywgJ0Z1bmN0aW9uJywgJ1N0cmluZycsICdOdW1iZXInLCAnRGF0ZScsICdSZWdFeHAnXTtcclxuXHJcbnZhciBVdGlsID0ge1xyXG4gIGlzRGVmaW5lZDogZnVuY3Rpb24gKHZhbHVlKSB7IHJldHVybiB0eXBlb2YgdmFsdWUgIT0gJ3VuZGVmaW5lZCcgfSxcclxuICBkZWY6IGZ1bmN0aW9uICh2YWx1ZSwgZGVmYXVsdFZhbHVlKSB7IHJldHVybiAodHlwZW9mIHZhbHVlID09ICd1bmRlZmluZWQnKSA/IGRlZmF1bHRWYWx1ZSA6IHZhbHVlIH0sXHJcbiAgZXJyb3I6IGZ1bmN0aW9uIChtZXNzYWdlKSB7IHRocm93IG5ldyBFcnJvcihpZCArICc6ICcgKyBtZXNzYWdlKSB9LFxyXG4gIHdhcm46IGZ1bmN0aW9uIChtZXNzYWdlKSB7IFV0aWwubG9nKCdXYXJuaW5nOiAnICsgbWVzc2FnZSkgfSxcclxuICBsb2c6IGZ1bmN0aW9uIChtZXNzYWdlKSB7IGlmKGNvbmZpZy5sb2cpIHsgY29uc29sZS5sb2coaWQgKyAnOiAnICsgbWVzc2FnZSkgfSB9LFxyXG4gIGFyZ3NUb0FycmF5OiBmdW5jdGlvbiAoYXJncykgeyByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJncykgfSxcclxuICByYW5kOiBmdW5jdGlvbiAobWF4LCBtaW4pIHsgLy8gbW92ZSB0byBleHRyYT9cclxuICAgIG1pbiA9IG1pbiB8fCAwO1xyXG4gICAgaWYobWluID4gbWF4KSB7IFV0aWwuZXJyb3IoJ3JhbmQ6IGludmFsaWQgcmFuZ2UuJyk7IH1cclxuICAgIHJldHVybiBNYXRoLmZsb29yKChNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKSkgKyAobWluKTtcclxuICB9XHJcbn07XHJcblxyXG5mb3IodmFyIGkgPSAwOyBpIDwgdHlwZXMubGVuZ3RoOyBpKyspIHtcclxuICBVdGlsWydpcycgKyB0eXBlc1tpXV0gPSAoZnVuY3Rpb24odHlwZSkge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaikge1xyXG4gICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT0gJ1tvYmplY3QgJyArIHR5cGUgKyAnXSc7XHJcbiAgICB9O1xyXG4gIH0pKHR5cGVzW2ldKTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgVXRpbDsiLCIvKipcbiAqIENyZWF0ZWQgYnkgc2hhdW53ZXN0IG9uIDYvMjAvMTUuXG4gKlxuICogVE9ETzogZGlzcG9zZSgpXG4gKi9cblxuLyoqXG4gKlxudmFyIHZhbHZlID0gVmFsdmUuY3JlYXRlKGZ1bmN0aW9uIChlbWl0LCBlcnJvcikge1xuICBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgZXJyb3IoJ2hlbGxvJyk7XG4gIH0sIDUwMCk7XG59KS50aGVuKGZ1bmN0aW9uIChtc2cpIHtcbiAgcmV0dXJuIG1zZyArICcgU2hhdW4nO1xufSkudGhlbihmdW5jdGlvbiAobmV3TXNnKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuICAgIHNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcbiAgICAgIHJlc29sdmUobmV3TXNnICsgJyEhISEnKTtcbiAgICB9LCA1MDApO1xuICB9KTtcbn0pLnRoZW4oXG4gIGZ1bmN0aW9uIChuZXdlck1zZykge1xuICAgIGNvbnNvbGUubG9nKG5ld2VyTXNnKTtcbiAgfSwgZnVuY3Rpb24gKG1zZykge1xuICAgIGNvbnNvbGUubG9nKG1zZyk7XG4gIH0pO1xuKi9cblxuZnVuY3Rpb24gY2xvbmVBcnJheShhcnJheSkge1xuICByZXR1cm4gYXJyYXkuc2xpY2UoMCk7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZUFsbCh0aGVuYWJsZXMsIGRvQXBwbHkpIHtcbiAgcmV0dXJuIFZhbHZlLmNyZWF0ZShmdW5jdGlvbiAoZW1pdCkge1xuICAgIHZhciBjb3VudCA9IHRoZW5hYmxlcy5sZW5ndGg7XG4gICAgdmFyIHZhbHVlcyA9IFtdO1xuXG4gICAgZnVuY3Rpb24gY2hlY2tDb3VudCgpIHtcbiAgICAgIGlmKC0tY291bnQgPT09IDApIHtcbiAgICAgICAgKGRvQXBwbHkpID9cbiAgICAgICAgICBlbWl0LmFwcGx5KG51bGwsIHZhbHVlcykgOlxuICAgICAgICAgIGVtaXQodmFsdWVzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGVuYWJsZXMuZm9yRWFjaChmdW5jdGlvbiAodGhlbmFibGUsIGluZGV4KSB7XG4gICAgICBpZighdGhlbmFibGUpIHtcbiAgICAgICAgdGhyb3cgJ0ltcGxlbWVudCBlcnJvciBzY2VuYXJpbyc7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYoIXRoZW5hYmxlLnRoZW4pIHtcbiAgICAgICAgdmFsdWVzW2luZGV4XSA9IHRoZW5hYmxlO1xuICAgICAgICBjaGVja0NvdW50KCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhlbmFibGUudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdmFsdWVzW2luZGV4XSA9IHZhbHVlO1xuICAgICAgICBjaGVja0NvdW50KCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSlcbn1cblxuZnVuY3Rpb24gaXRlcmF0ZShpdGVyYXRvciwgdmFsdWUsIGF0dGFjaGVkLCBmYWlsZWQpIHtcbiAgbGV0IGl0ZW0gPSBpdGVyYXRvci5uZXh0KCk7XG4gIGlmIChpdGVtLmRvbmUpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBsZXQgbGlzdGVuZXIgPSAoZmFpbGVkKSA/XG4gICAgaXRlbS52YWx1ZS5mYWlsIDpcbiAgICBpdGVtLnZhbHVlLnN1Y2Nlc3M7XG5cbiAgaWYgKHZhbHVlICYmIHZhbHVlLnRoZW4pIHtcbiAgICBpZih2YWx1ZS5hdHRhY2hlZCkge1xuICAgICAgYXR0YWNoZWQgPSBhdHRhY2hlZC5jb25jYXQodmFsdWUuYXR0YWNoZWQpO1xuICAgIH1cblxuICAgIHZhbHVlLnRoZW4oXG4gICAgICBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgaXRlcmF0ZShpdGVyYXRvciwgbGlzdGVuZXIuYXBwbHkobnVsbCwgW3ZhbHVlXS5jb25jYXQoYXR0YWNoZWQpKSwgYXR0YWNoZWQsIGZhaWxlZCk7XG4gICAgICB9LFxuICAgICAgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIGl0ZXJhdGUoaXRlcmF0b3IsIGxpc3RlbmVyLmFwcGx5KG51bGwsIFt2YWx1ZV0uY29uY2F0KGF0dGFjaGVkKSksIGF0dGFjaGVkLCB0cnVlKTtcbiAgICAgIH1cbiAgICApO1xuICAgIHJldHVybjtcbiAgfVxuICBpdGVyYXRlKGl0ZXJhdG9yLCBsaXN0ZW5lci5hcHBseShudWxsLCBbdmFsdWVdLmNvbmNhdChhdHRhY2hlZCkpLCBhdHRhY2hlZCwgZmFpbGVkKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmFsdmUge1xuICBjb25zdHJ1Y3RvcihleGVjdXRvcikge1xuICAgIHRoaXMuc3RhcnRlZCA9IGZhbHNlO1xuICAgIHRoaXMuYXR0YWNoZWQgPSBbXTtcbiAgICB0aGlzLmxpc3RlbmVycyA9IFtdO1xuICAgIHRoaXMuZXhlY3V0b3IgPSBleGVjdXRvcjtcbiAgfVxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgLy8gSXRlcmF0ZSBvdmVyIGxpc3RlbmVycyBvbiBuZXh0IHJ1biBvZlxuICAgIC8vIHRoZSBqcyBldmVudCBsb29wXG4gICAgLy8gVE9ETzogbm9kZSBzdXBwb3J0XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLmV4ZWN1dG9yKFxuICAgICAgICAvLyBFbWl0XG4gICAgICAgICh2YWx1ZSkgPT4ge1xuICAgICAgICAgIGl0ZXJhdGUodGhpcy5saXN0ZW5lcnNbU3ltYm9sLml0ZXJhdG9yXSgpLCB2YWx1ZSwgdGhpcy5hdHRhY2hlZCk7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIEVycm9yXG4gICAgICAgICh2YWx1ZSkgPT4ge1xuICAgICAgICAgIGl0ZXJhdGUodGhpcy5saXN0ZW5lcnNbU3ltYm9sLml0ZXJhdG9yXSgpLCB2YWx1ZSwgdGhpcy5hdHRhY2hlZCwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfSwgMSk7XG4gIH1cblxuICAvL1RPRE86IGVycm9yIHNjZW5hcmlvXG4gIHN0YXRpYyBjcmVhdGUoZXhlY3V0b3IpIHtcbiAgICBpZihleGVjdXRvci50aGVuKSB7XG4gICAgICByZXR1cm4gbmV3IFZhbHZlKGZ1bmN0aW9uIChlbWl0KSB7XG4gICAgICAgIGV4ZWN1dG9yLnRoZW4oZW1pdCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBWYWx2ZShleGVjdXRvcik7XG4gIH1cblxuICAvL1RPRE86IGVycm9yIHNjZW5hcmlvXG4gIHN0YXRpYyBhbGwodGhlbmFibGVzKSB7XG4gICAgcmV0dXJuIGhhbmRsZUFsbCh0aGVuYWJsZXMpO1xuICB9XG5cbiAgc3RhdGljIGFwcGx5QWxsKHRoZW5hYmxlcykge1xuICAgIHJldHVybiBoYW5kbGVBbGwodGhlbmFibGVzLCB0cnVlKTtcbiAgfVxuXG4gIGNsb25lKG9uU3VjY2Vzcywgb25GYWlsdXJlKSB7XG4gICAgdmFyIG5ld1ZhbHZlID0gbmV3IFZhbHZlKHRoaXMuZXhlY3V0b3IpO1xuICAgIG5ld1ZhbHZlLmxpc3RlbmVycyA9IGNsb25lQXJyYXkodGhpcy5saXN0ZW5lcnMpO1xuICAgIG5ld1ZhbHZlLmF0dGFjaGVkID0gY2xvbmVBcnJheSh0aGlzLmF0dGFjaGVkKTtcbiAgICBuZXdWYWx2ZS5zdGFydGVkID0gdGhpcy5zdGFydGVkO1xuICAgIHJldHVybiAob25TdWNjZXNzKSA/IG5ld1ZhbHZlLnRoZW4ob25TdWNjZXNzLCBvbkZhaWx1cmUpIDogbmV3VmFsdmU7XG4gIH1cblxuICBhdHRhY2godmFsdWUpIHtcbiAgICB0aGlzLmF0dGFjaGVkLnB1c2godmFsdWUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgdGhlbihvblN1Y2Nlc3MsIG9uRmFpbHVyZSkge1xuICAgIGlmKHR5cGVvZiBvblN1Y2Nlc3MgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93ICdWYWx2ZTogdGhlbigpIHJlcXVpcmVzIGEgZnVuY3Rpb24gYXMgZmlyc3QgYXJndW1lbnQuJ1xuICAgIH1cbiAgICB0aGlzLmxpc3RlbmVycy5wdXNoKHtcbiAgICAgIHN1Y2Nlc3M6IG9uU3VjY2VzcyxcbiAgICAgIGZhaWw6IG9uRmFpbHVyZSB8fCBmdW5jdGlvbiAodmFsdWUpIHsgcmV0dXJuIHZhbHVlOyB9XG4gICAgfSk7XG5cbiAgICBpZighdGhpcy5zdGFydGVkKSB7XG4gICAgICB0aGlzLmV4ZWN1dGUoKTtcbiAgICAgIHRoaXMuc3RhcnRlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn0iLCIvKipcbiAqIENyZWF0ZWQgYnkgc2hhdW53ZXN0IG9uIDcvOC8xNS5cbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZmxpcCAoZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3MucmV2ZXJzZSgpKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcG9zZSAoLi4uZm5zKSB7XG4gIHJldHVybiBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgcmV0dXJuIGZucy5yZWR1Y2VSaWdodChmdW5jdGlvbiAocmVzdWx0LCBmbikge1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhpcywgcmVzdWx0KTtcbiAgICB9LCByZXN1bHQpO1xuICB9O1xufVxuXG5leHBvcnQgdmFyIHNlcXVlbmNlID0gZmxpcChjb21wb3NlKTtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBzaGF1bndlc3Qgb24gNS85LzE1LlxuICovXG5cbmltcG9ydCBmZXRjaEpTT04gZnJvbSAnLi4vZW5naW5lL3NjaGVtYS9mZXRjaC1zY2hlbWEuanMnO1xuaW1wb3J0IGdldEltYWdlIGZyb20gJy4uL2VuZ2luZS9pbWFnZS1sb2FkZXIuanMnO1xuaW1wb3J0IGdldFNwcml0ZVNjaGVtYSBmcm9tICcuLi9zY2hlbWEvc3ByaXRlLXNjaGVtYS5qcyc7XG5pbXBvcnQgc3ByaXRlQW5pbWF0aW9uIGZyb20gJy4uL2FuaW1hdGlvbi9zcHJpdGUtYW5pbWF0aW9uLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0U2NlbmVTY2hlbWEodXJpKSB7XG4gIHJldHVybiBmZXRjaEpTT04odXJpKVxuICAgIC50aGVuKGZ1bmN0aW9uIChzY2VuZSkge1xuICAgICAgcmV0dXJuIGdldEltYWdlKHNjZW5lLmJhY2tncm91bmQuYmFja2dyb3VuZFVybClcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGJhY2tncm91bmRJbWFnZSkge1xuICAgICAgICAgIHNjZW5lLmJhY2tncm91bmRJbWFnZSA9IGJhY2tncm91bmRJbWFnZTtcbiAgICAgICAgICByZXR1cm4gZ2V0U3ByaXRlVHlwZXMoc2NlbmUuc3ByaXRlcylcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChzcHJpdGVzKSB7XG4gICAgICAgICAgICAgIHNjZW5lLnNwcml0ZXMgPSBzcHJpdGVzO1xuICAgICAgICAgICAgICByZXR1cm4gc2NlbmU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSlcbiAgICAudGhlbihmdW5jdGlvbiAoc2NlbmUpIHtcbiAgICAgIHJldHVybiBPYmplY3QuZnJlZXplKHNjZW5lKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0U3ByaXRlVHlwZXMoc3ByaXRlcykge1xuICByZXR1cm4gUHJvbWlzZS5hbGwoc3ByaXRlcy5tYXAoZ2V0U3ByaXRlVHlwZSkpO1xufVxuXG5mdW5jdGlvbiBnZXRTcHJpdGVUeXBlKHNwcml0ZSkge1xuICByZXR1cm4gZ2V0U3ByaXRlU2NoZW1hKHNwcml0ZS5zcmNVcmwpXG4gICAgLnRoZW4oZnVuY3Rpb24odHlwZSkge1xuICAgICAgc3ByaXRlLnR5cGUgPSB0eXBlO1xuICAgICAgLy9zcHJpdGUuYW5pbWF0aW9uID0gc3ByaXRlQW5pbWF0aW9uKHR5cGUuZnJhbWVTZXQpO1xuICAgICAgc3ByaXRlLmFuaW1hdGlvbiA9IHt9O1xuICAgICAgc3ByaXRlLnZlbG9jaXR5ID0geyB4OiAwLCB5OiAwIH07XG4gICAgICBzcHJpdGUuYWNjZWxlcmF0aW9uID0geyB4OiAwLCB5OiAwIH07XG4gICAgICBzcHJpdGUubWF4VmVsb2NpdHkgPSB7IHg6IDUwMCwgeTogNTAwIH07XG4gICAgICBzcHJpdGUuZnJpY3Rpb24gPSB7IHg6IDAuOTksIHk6IDAuNTAgfTtcbiAgICAgIHJldHVybiBzcHJpdGU7XG4gICAgfSk7XG59XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgc2hhdW53ZXN0IG9uIDUvOS8xNS5cbiAqL1xuXG5pbXBvcnQgZnJhbWVTZXQgZnJvbSAnLi4vYW5pbWF0aW9uL2ZyYW1lLXNldC5qcyc7XG5pbXBvcnQgZmV0Y2hKU09OIGZyb20gJy4uL2VuZ2luZS9zY2hlbWEvZmV0Y2gtc2NoZW1hLmpzJztcbmltcG9ydCBnZXRJbWFnZSBmcm9tICcuLi9lbmdpbmUvaW1hZ2UtbG9hZGVyLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0U3ByaXRlU2NoZW1hKHVyaSkge1xuICByZXR1cm4gZmV0Y2hKU09OKHVyaSlcbiAgICAudGhlbihmdW5jdGlvbiAoc3ByaXRlKSB7XG4gICAgICByZXR1cm4gZ2V0SW1hZ2Uoc3ByaXRlLnNwcml0ZVNoZWV0VXJsKVxuICAgICAgICAudGhlbihmdW5jdGlvbiAoc3ByaXRlU2hlZXQpIHtcbiAgICAgICAgICBzcHJpdGUuc3ByaXRlU2hlZXQgPSBzcHJpdGVTaGVldDtcbiAgICAgICAgICBzcHJpdGUuZnJhbWVTZXQgPSBmcmFtZVNldChzcHJpdGUsIHNwcml0ZVNoZWV0KTtcbiAgICAgICAgICByZXR1cm4gc3ByaXRlO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn1cbiIsIi8qKlxuICogQ3JlYXRlZCBieSBzaGF1bndlc3Qgb24gNS80LzE1LlxuICovXG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgeDogMCxcbiAgeTogMCxcbiAgbWFyZ2luTGVmdDogNjQsXG4gIG1hcmdpblJpZ2h0OiA2NCxcbiAgd2lkdGg6IDMwMCxcbiAgaGVpZ2h0OiA0MDBcbn07Il19

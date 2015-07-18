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

function getSlope(line) {
  var denom = line.x2 - line.x1;
  return (line.y2 - line.y1) / denom;
}

function lineIntersectsRect(line, rect) {
  return lineIntersectsSegment(line, rect.x, rect.y, rect.x + rect.width, rect.y) || // top
  lineIntersectsSegment(line, rect.x, rect.y, rect.x, rect.y + rect.height) || // left
  lineIntersectsSegment(line, rect.x, rect.y + rect.height, rect.x + rect.width, rect.y + rect.height) || // bottom
  lineIntersectsSegment(line, rect.x + rect.width, rect.y, rect.x + rect.width, rect.y + rect.height); // right
}

function lineIntersectsSegment(line, x1, y1, x2, y2) {
  // TODO: precalculate some of this shit
  var denom = (line.x1 - line.x2) * (y1 - y2) - (line.y1 - line.y2) * (x1 - x2);

  if (denom === 0) {
    return false;
  }

  var x = Math.floor(((line.x1 * line.y2 - line.y1 * line.x2) * (x1 - x2) - (line.x1 - line.x2) * (x1 * y2 - y1 * x2)) / denom);
  var y = Math.floor(((line.x1 * line.y2 - line.y1 * line.x2) * (y1 - y2) - (line.y1 - line.y2) * (x1 * y2 - y1 * x2)) / denom);

  var maxX = Math.max(x1, x2);
  var minX = Math.min(x1, x2);
  var maxY = Math.max(y1, y2);
  var minY = Math.min(y1, y2);

  if (x <= maxX && x >= minX && y <= maxY && y >= minY) {
    return { x: x, y: y };
  }

  return false;
}

function segmentIntersectsSegment(line, x1, y1, x2, y2) {
  var intersects = lineIntersectsSegment(line, x1, y1, x2, y2);

  if (!intersects) {
    return false;
  }

  if (!(intersects.x >= Math.min(line.x1, line.x2) && intersects.x <= Math.max(line.x1, line.x2) && intersects.y >= Math.min(line.y1, line.y2) && intersects.y <= Math.max(line.y1, line.y2))) {
    return false;
  }
  return intersects;
}

/*function collisions(sprite, colliders) {
  colliders.forEach(function (collider) {
    if (sprite.y - sprite.lastY > 0) {
      let halfWidth = sprite.width / 2;
      let intersects = segmentIntersectsSegment(collider, sprite.x + halfWidth, sprite.y, sprite.x + halfWidth, sprite.y + sprite.height);
      if(intersects) {
        sprite.y = intersects.y - sprite.height;
      }
    }

    if (sprite.x - sprite.lastX > 0) {
      let halfHeight = sprite.height / 2;
      let intersects = segmentIntersectsSegment(collider, sprite.x, sprite.y + halfHeight, sprite.x + sprite.width, sprite.y + halfHeight);
      if(intersects) {
        sprite.x = intersects.x - sprite.width;
      }
    }
  });
}*/

function log(msg) {}

function collisions(sprite, colliders) {
  var dirY = sprite.y - sprite.lastY;
  var dirX = sprite.x - sprite.lastX;

  colliders.forEach(function (collider) {
    var intersects = undefined,
        x = undefined,
        y = undefined;

    if (!collider.slope) {
      intersects = segmentIntersectsSegment(collider, sprite.x, sprite.y, sprite.x + sprite.width, sprite.y); // top
      if (intersects) {
        log('top', intersects);
        sprite.x = intersects.x;
      }

      if (intersects = segmentIntersectsSegment(collider, sprite.x, sprite.y + sprite.height, sprite.x + sprite.width, sprite.y + sprite.height)) {
        // bottom
        log('bottom', intersects);
        sprite.x = intersects.x - sprite.width - 1;
      }
    }

    intersects = segmentIntersectsSegment(collider, sprite.x, sprite.y, sprite.x, sprite.y + sprite.height); // left
    if (intersects) {
      log('left', intersects);
      sprite.y = intersects.y - sprite.height - 1;
    }

    if (intersects = segmentIntersectsSegment(collider, sprite.x + sprite.width, sprite.y, sprite.x + sprite.width, sprite.y + sprite.height)) {
      // right
      log('right', intersects);
      sprite.y = intersects.y - sprite.height - 1;
    }
  });
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

  /*
  const collidersX = colliders.map(collider => {
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
    const collidersY = colliders.map(collider => {
    return {
      x: collider.x,
      y: collider.y,
      width: collider.width,
      height: collider.height,
      positionMin: collider.y,
      positionMax: collider.y + collider.height,
      rangeMin: collider.x,
      rangeMax: collider.x + collider.width
    }
  });
  */

  var sprites = Object.freeze(scene.sprites);
  var player = sprites[0];

  getFrames(function (elapsed) {
    _clearContext$render$renderRects$renderLines.clearContext(context2d, canvas.width, canvas.height);

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
      sprite.lastX = sprite.x;
      sprite.lastY = sprite.y;

      var velocityX = getVelocity(sprite, 'x', elapsed);
      var x = getPositionDelta(sprite.x, velocityX, elapsed);

      var boundsDiffX = getInnerDiff(x, sprite.width, 0, sceneBounds.width);
      var x1 = resolveCollision(boundsDiffX, x);

      var velocityY = getVelocity(sprite, 'y', elapsed);
      var y = getPositionDelta(sprite.y, velocityY, elapsed);

      var boundsDiffY = getInnerDiff(y, sprite.height, 0, sceneBounds.height);
      var y1 = resolveCollision(boundsDiffY, y);

      /*colliders.forEach(function (collider) {
        console.log(lineIntersectsRect(collider, sprite));
      });*/

      var x2 = x1;
      var y2 = y1;

      /*
      let vals = getCollidersInRange(y1, y1 + sprite.height, collidersX)
        .map(function (collider) {
          let maxDiff = getMaxPositionDiff(x1 + sprite.width, collider.positionMin);
          let minDiff = getMinPositionDiff(x1, collider.positionMax);
            return (Math.min(Math.abs(maxDiff), Math.abs(minDiff)));
        });
      */

      // mutate sprite
      sprite.velocity.x = velocityX;
      sprite.x = x2;
      sprite.velocity.y = velocityY;
      sprite.y = y2;

      collisions(sprite, colliders);

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
      //renderRects(context2d, colliders, viewport);
      _clearContext$render$renderRects$renderLines.renderLines(context2d, colliders, viewport);
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

//console.log(msg);

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvbWFpbi5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy9hbmltYXRpb24vZnJhbWUtc2V0LmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2FuaW1hdGlvbi9zcHJpdGUtYW5pbWF0aW9uLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2NhbnZhcy1yZW5kZXJlci5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy9lbmdpbmUvY29tbW9uLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9mcmFnbWVudHMuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL2ZyYW1lLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9pbWFnZS1sb2FkZXIuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL2lucHV0LmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9zY2hlZHVsZXIuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL3NjaGVtYS9mZXRjaC1zY2hlbWEuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL3V0aWwuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL3ZhbHZlLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2Z1bmMuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvc2NoZW1hL3NjZW5lLXNjaGVtYS5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy9zY2hlbWEvc3ByaXRlLXNjaGVtYS5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy92aWV3cG9ydC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O3dCQ0l1Qix1QkFBdUI7OzhCQUNuQiwwQkFBMEI7Ozs7cUJBQ25DLG1CQUFtQjs7OztxQkFDbkIsbUJBQW1COzs7O3dCQUNoQixlQUFlOzs7OzJEQUN5QixzQkFBc0I7O3dCQUM1RCxXQUFXOztBQUVsQyxJQUFNLEtBQUssR0FBRyw0QkFBZSx5QkFBeUIsQ0FBQyxDQUFDOztBQUV4RCxTQUFTLHdCQUF3QixDQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFO0FBQ2xFLFNBQU8sQUFBQyxTQUFTLEdBQUcsVUFBVSxHQUFJLFNBQVMsQ0FBQztDQUM3Qzs7QUFFRCxTQUFTLHdCQUF3QixDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUU7QUFDdEQsU0FBTyxTQUFTLEdBQUcsU0FBUyxDQUFDO0NBQzlCOztBQUVELFNBQVMsYUFBYSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFO0FBQ2xELFNBQU8sUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztDQUNuRDs7QUFFRCxTQUFTLElBQUksQ0FBQyxRQUFRLEVBQUUsVUFBVSxFQUFFO0FBQ2xDLFNBQU8sQUFBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLFVBQVUsR0FBSSxDQUFDLEdBQUcsUUFBUSxDQUFDO0NBQ3pEOztBQUVELFNBQVMsYUFBYSxDQUFDLFFBQVEsRUFBRSxXQUFXLEVBQUU7QUFDNUMsU0FBTyxBQUFDLFFBQVEsR0FBRyxDQUFDLEdBQ2xCLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxHQUMvQixJQUFJLENBQUMsR0FBRyxDQUFD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QUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFBLElBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQSxBQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUEsSUFBSyxFQUFFLEdBQUcsRUFBRSxDQUFBLEFBQUMsQ0FBQzs7QUFFaEYsTUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFO0FBQ2YsV0FBTyxLQUFLLENBQUM7R0FDZDs7QUFFRCxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFBLElBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQSxBQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUEsSUFBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUEsQUFBQyxDQUFBLEdBQUksS0FBSyxDQUFDLENBQUM7QUFDaEksTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQSxJQUFLLEVBQUUsR0FBRyxFQUFFLENBQUEsQUFBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFBLElBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBLEFBQUMsQ0FBQSxHQUFJLEtBQUssQ0FBQyxDQUFDOztBQUVoSSxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUM5QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUM5QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUM5QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQzs7QUFFOUIsTUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLElBQ3hCLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksRUFBRztBQUN6QixXQUFPLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUM7R0FDckI7O0FBRUQsU0FBTyxLQUFLLENBQUM7Q0FDZDs7QUFFRCxTQUFTLHdCQUF3QixDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUU7QUFDdEQsTUFBSSxVQUFVLEdBQUcscUJBQXFCLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDOztBQUU3RCxNQUFJLENBQUMsVUFBVSxFQUFFO0FBQ2YsV0FBTyxLQUFLLENBQUM7R0FDZDs7QUFFRCxNQUFJLEVBQUUsVUFBVSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUM5QyxVQUFVLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLElBQzFDLFVBQVUsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsSUFDMUMsVUFBVSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFB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SUFBSSxDQUFDLFVBQVUsTUFBTSxFQUFFO0FBQ3RCLFdBQU8sc0JBQVMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUNuQyxJQUFJLENBQUMsVUFBVSxXQUFXLEVBQUU7QUFDM0IsWUFBTSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7QUFDakMsWUFBTSxDQUFDLFFBQVEsR0FBRyxzQkFBUyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFDaEQsYUFBTyxNQUFNLENBQUM7S0FDZixDQUFDLENBQUM7R0FDTixDQUFDLENBQUM7Q0FDTjs7Ozs7Ozs7Ozs7Ozs7cUJDZGM7QUFDYixHQUFDLEVBQUUsQ0FBQztBQUNKLEdBQUMsRUFBRSxDQUFDO0FBQ0osWUFBVSxFQUFFLEVBQUU7QUFDZCxhQUFXLEVBQUUsRUFBRTtBQUNmLE9BQUssRUFBRSxHQUFHO0FBQ1YsUUFBTSxFQUFFLEdBQUc7Q0FDWiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcclxuICogQ3JlYXRlZCBieSBTaGF1biBvbiA0LzIzLzIwMTUuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtGcmFnbWVudH0gZnJvbSAnLi9lbmdpbmUvZnJhZ21lbnRzLmpzJztcclxuaW1wb3J0IGdldFNjZW5lU2NoZW1hIGZyb20gJy4vc2NoZW1hL3NjZW5lLXNjaGVtYS5qcyc7XHJcbmltcG9ydCBGcmFtZSBmcm9tICcuL2VuZ2luZS9mcmFtZS5qcyc7XHJcbmltcG9ydCBJbnB1dCBmcm9tICcuL2VuZ2luZS9pbnB1dC5qcyc7XHJcbmltcG9ydCBWaWV3cG9ydCBmcm9tICcuL3ZpZXdwb3J0LmpzJztcclxuaW1wb3J0IHtjbGVhckNvbnRleHQsIHJlbmRlciwgcmVuZGVyUmVjdHMsIHJlbmRlckxpbmVzfSBmcm9tICcuL2NhbnZhcy1yZW5kZXJlci5qcyc7XHJcbmltcG9ydCB7c2VxdWVuY2V9IGZyb20gJy4vZnVuYy5qcyc7XHJcblxyXG5jb25zdCBzY2VuZSA9IGdldFNjZW5lU2NoZW1hKCdhc3NldHMva2l0dHktd29ybGQuanNvbicpO1xyXG5cclxuZnVuY3Rpb24gZ2V0UG9zaXRpb25Gcm9tTWF4TWFyZ2luKHNwcml0ZVBvcywgc3ByaXRlU2l6ZSwgbWF4TWFyZ2luKSB7XHJcbiAgcmV0dXJuIChzcHJpdGVQb3MgKyBzcHJpdGVTaXplKSAtIG1heE1hcmdpbjtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0UG9zaXRpb25Gcm9tTWluTWFyZ2luKHNwcml0ZVBvcywgbWluTWFyZ2luKSB7XHJcbiAgcmV0dXJuIHNwcml0ZVBvcyAtIG1pbk1hcmdpbjtcclxufVxyXG5cclxuZnVuY3Rpb24gYXBwbHlGcmljdGlvbih2ZWxvY2l0eSwgZnJpY3Rpb24sIGVsYXBzZWQpIHtcclxuICByZXR1cm4gdmVsb2NpdHkgKiBNYXRoLnBvdygxIC0gZnJpY3Rpb24sIGVsYXBzZWQpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBoYWx0KHZlbG9jaXR5LCBoYWx0VGFyZ2V0KSB7XHJcbiAgcmV0dXJuIChNYXRoLmFicyh2ZWxvY2l0eSkgPCBoYWx0VGFyZ2V0KSA/IDAgOiB2ZWxvY2l0eTtcclxufVxyXG5cclxuZnVuY3Rpb24gY2xhbXBWZWxvY2l0eSh2ZWxvY2l0eSwgbWF4VmVsb2NpdHkpIHtcclxuICByZXR1cm4gKHZlbG9jaXR5ID4gMCkgP1xyXG4gICAgTWF0aC5taW4odmVsb2NpdHksIG1heFZlbG9jaXR5KSA6XHJcbiAgICBNYXRoLm1heCh2ZWxvY2l0eSwgLW1heFZlbG9jaXR5KTtcclxufVxyXG5cclxuZnVuY3Rpb24gYXBwbHlBY2NlbGVyYXRpb24odmVsb2NpdHksIGFjY2VsZXJhdGlvbiwgZWxhcHNlZCkge1xyXG4gIHJldHVybiB2ZWxvY2l0eSArIChhY2NlbGVyYXRpb24gKiBlbGFwc2VkKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0UG9zaXRpb25EZWx0YShwb3NpdGlvbiwgdmVsb2NpdHksIGVsYXBzZWQpIHtcclxuICByZXR1cm4gcG9zaXRpb24gKyBNYXRoLnJvdW5kKHZlbG9jaXR5ICogZWxhcHNlZCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFZlbG9jaXR5KHNwcml0ZSwgZGltLCBlbGFwc2VkKSB7XHJcbiAgbGV0IHZlbG9jaXR5ID0gaGFsdChzcHJpdGUudmVsb2NpdHlbZGltXSwgMSk7XHJcbiAgdmVsb2NpdHkgPSBhcHBseUFjY2VsZXJhdGlvbih2ZWxvY2l0eSwgc3ByaXRlLmFjY2VsZXJhdGlvbltkaW1dLCBlbGFwc2VkKTtcclxuICB2ZWxvY2l0eSA9IGFwcGx5RnJpY3Rpb24odmVsb2NpdHksIHNwcml0ZS5mcmljdGlvbltkaW1dLCBlbGFwc2VkKTtcclxuICByZXR1cm4gY2xhbXBWZWxvY2l0eSh2ZWxvY2l0eSwgc3ByaXRlLm1heFZlbG9jaXR5W2RpbV0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRJbm5lckRpZmYocG9zaXRpb24sIHNpemUsIG1pbkJvdW5kLCBtYXhCb3VuZCkge1xyXG4gIGNvbnN0IG1heCA9IHBvc2l0aW9uICsgc2l6ZTtcclxuICByZXR1cm4gKHBvc2l0aW9uIDwgbWluQm91bmQgJiYgcG9zaXRpb24gLSBtaW5Cb3VuZCB8fFxyXG4gICAgbWF4ID4gbWF4Qm91bmQgJiYgbWF4IC0gbWF4Qm91bmQgfHxcclxuICAgIDApO1xyXG59XHJcblxyXG4vKmZ1bmN0aW9uIGdldE91dGVyRGlmZihwb3NpdGlvbiwgc2l6ZSwgbWluQm91bmQsIG1heEJvdW5kKSB7XHJcbiAgY29uc3QgbWF4ID0gcG9zaXRpb24gKyBzaXplO1xyXG4gIHJldHVybiAocG9zaXRpb24gPCBtaW5Cb3VuZCAmJiBtYXggPiBtaW5Cb3VuZCAmJiBtYXggLSBtaW5Cb3VuZCB8fFxyXG4gICAgcG9zaXRpb24gPCBtYXhCb3VuZCAmJiBtYXggPiBtYXhCb3VuZCAmJiBwb3NpdGlvbiAtIG1heEJvdW5kIHx8XHJcbiAgICAwKTtcclxufSovXHJcblxyXG5mdW5jdGlvbiBnZXRPdXRlckRpZmYocG9zaXRpb24sIHNpemUsIG1pbkJvdW5kLCBtYXhCb3VuZCkge1xyXG4gIGNvbnN0IG1heCA9IHBvc2l0aW9uICsgc2l6ZTtcclxuICByZXR1cm4gKHBvc2l0aW9uIDwgbWluQm91bmQgJiYgbWF4ID4gbWluQm91bmQgJiYgbWF4IC0gbWluQm91bmQgfHxcclxuICAgIHBvc2l0aW9uIDwgbWF4Qm91bmQgJiYgbWF4ID4gbWF4Qm91bmQgJiYgcG9zaXRpb24gLSBtYXhCb3VuZCB8fFxyXG4gICAgMCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlc29sdmVDb2xsaXNpb24oZGlmZiwgdmFsKSB7XHJcbiAgcmV0dXJuIHZhbCAtIGRpZmY7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldENvbGxpZGVyc0luUmFuZ2UocmFuZ2VNaW4sIHJhbmdlTWF4LCBjb2xsaWRlcnMpIHtcclxuICByZXR1cm4gY29sbGlkZXJzLmZpbHRlcihmdW5jdGlvbiAoY29sbGlkZXIpIHtcclxuICAgIHJldHVybiBpblJhbmdlKHJhbmdlTWluLCByYW5nZU1heCwgY29sbGlkZXIpO1xyXG4gIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpblJhbmdlKHJhbmdlTWluLCByYW5nZU1heCwgY29sbGlkZXIpIHtcclxuICByZXR1cm4gKHJhbmdlTWluIDwgY29sbGlkZXIucmFuZ2VNYXggJiZcclxuICAgIHJhbmdlTWF4ID4gY29sbGlkZXIucmFuZ2VNaW4pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRNaW5Qb3NpdGlvbkRpZmYobWluLCBjb2xsaWRlck1heCkge1xyXG4gIHJldHVybiBjb2xsaWRlck1heCAtIG1pbjtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0TWF4UG9zaXRpb25EaWZmKG1heCwgY29sbGlkZXJNaW4pIHtcclxuICByZXR1cm4gY29sbGlkZXJNaW4gLSBtYXg7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEludGVyc2VjdGVkQ29sbGlkZXJzKGNvbGxpZGVycywgcG9zaXRpb25NaW4sIHBvc2l0aW9uTWF4LCByYW5nZU1pbiwgcmFuZ2VNYXgpIHtcclxuICByZXR1cm4gY29sbGlkZXJzXHJcbiAgICAuZmlsdGVyKGZ1bmN0aW9uIChjb2xsaWRlcikge1xyXG4gICAgICByZXR1cm4gKHJhbmdlTWluIDwgY29sbGlkZXIucmFuZ2VNYXggJiZcclxuICAgICAgICByYW5nZU1heCA+IGNvbGxpZGVyLnJhbmdlTWluKTtcclxuICAgIH0pXHJcbiAgICAubWFwKGZ1bmN0aW9uIChjb2xsaWRlcikge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHBvc2l0aW9uTWluOiBjb2xsaWRlci5wb3NpdGlvbk1heCAtIHBvc2l0aW9uTWluLFxyXG4gICAgICAgIHBvc2l0aW9uTWF4OiBjb2xsaWRlci5wb3NpdGlvbk1pbiAtIHBvc2l0aW9uTWF4XHJcbiAgICAgIH07XHJcbiAgICB9KVxyXG4gICAgLmZpbHRlcihmdW5jdGlvbiAoZGlmZikge1xyXG4gICAgICByZXR1cm4gKGRpZmYucG9zaXRpb25NaW4gPiAwICYmIGRpZmYucG9zaXRpb25NYXggPCAwKTtcclxuICAgIH0pXHJcbiAgICAubWFwKGZ1bmN0aW9uIChkaWZmKSB7XHJcbiAgICAgIHJldHVybiBNYXRoLm1heChkaWZmLnBvc2l0aW9uTWluLCBkaWZmLnBvc2l0aW9uTWF4KTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8qLmZpbHRlcihjb2xsaWRlciA9PlxyXG4gICAgICByYW5nZU1pbiA8PSBjb2xsaWRlci5yYW5nZU1heCAmJlxyXG4gICAgICByYW5nZU1heCA+PSBjb2xsaWRlci5yYW5nZU1pbiAmJlxyXG4gICAgICBwb3NpdGlvbk1pbiA8PSBjb2xsaWRlci5wb3NpdGlvbk1heCAmJlxyXG4gICAgICBwb3NpdGlvbk1heCA+PSBjb2xsaWRlci5wb3NpdGlvbk1pblxyXG4gICAgKTsqL1xyXG59XHJcblxyXG5mdW5jdGlvbiByZXNvbHZlQ29sbGlzaW9ucyhwb3NpdGlvbiwgY29sbGlkZXJzKSB7XHJcbiAgLy8gZml4bWU6IG5vdCByZXR1cm5pbmc/P1xyXG4gIGNvbGxpZGVycy5yZWR1Y2UoZnVuY3Rpb24gKHBvc2l0aW9uRGVsdGEsIGNvbGxpZGVyKSB7XHJcbiAgICBjb25zdCBkaWZmID0gZ2V0T3V0ZXJEaWZmKFxyXG4gICAgICBwb3NpdGlvbixcclxuICAgICAgc2l6ZSxcclxuICAgICAgY29sbGlkZXIucG9zaXRpb25NaW4sXHJcbiAgICAgIGNvbGxpZGVyLnBvc2l0aW9uTWF4XHJcbiAgICApO1xyXG4gICAgcmV0dXJuIChkaWZmKSA/XHJcbiAgICAgICAgcG9zaXRpb24gLSBkaWZmIDpcclxuICAgICAgICBwb3NpdGlvbkRlbHRhO1xyXG4gIH0sIHBvc2l0aW9uKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Q29sbGlzaW9uUmVzb2x2ZShjb2xsaWRlcnMsIHBvc2l0aW9uLCBzaXplLCByYW5nZU1pbiwgcmFuZ2VNYXgpIHtcclxuICByZXR1cm4gY29sbGlkZXJzXHJcbiAgICAuZmlsdGVyKGNvbGxpZGVyID0+XHJcbiAgICAgIHJhbmdlTWluIDw9IGNvbGxpZGVyLnJhbmdlTWF4ICYmIHJhbmdlTWF4ID49IGNvbGxpZGVyLnJhbmdlTWluXHJcbiAgICApXHJcbiAgICAucmVkdWNlKChwb3NpdGlvbkRlbHRhLCBjb2xsaWRlcikgPT4ge1xyXG4gICAgICBjb25zdCBkaWZmID0gZ2V0T3V0ZXJEaWZmKFxyXG4gICAgICAgICAgcG9zaXRpb24sXHJcbiAgICAgICAgICBzaXplLFxyXG4gICAgICAgICAgY29sbGlkZXIucG9zaXRpb25NaW4sXHJcbiAgICAgICAgICBjb2xsaWRlci5wb3NpdGlvbk1heFxyXG4gICAgICApO1xyXG5cclxuICAgICAgcmV0dXJuIChkaWZmKSA/XHJcbiAgICAgICAgcG9zaXRpb24gLSBkaWZmIDpcclxuICAgICAgICBwb3NpdGlvbkRlbHRhO1xyXG4gICAgfSwgcG9zaXRpb24pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBhcHBseUFuaW1hdGlvbihzcHJpdGUpIHtcclxuICBjb25zdCBzZXF1ZW5jZSA9IHNwcml0ZS50eXBlLmZyYW1lU2V0W2dldEFuaW1hdGlvbihzcHJpdGUpXTtcclxuICBjb25zdCBmcmFtZUluZGV4ID0gZ2V0RnJhbWVJbmRleChzcHJpdGUuYW5pbWF0aW9uLmN1cnJlbnRJbmRleCwgc2VxdWVuY2UpO1xyXG4gIHNwcml0ZS5hbmltYXRpb24uY3VycmVudEluZGV4ID0gZnJhbWVJbmRleDtcclxuXHJcbiAgcmV0dXJuIGdldEZyYW1lKGZyYW1lSW5kZXgsIHNlcXVlbmNlKVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGcmFtZUluZGV4KGN1cnJlbnRJbmRleCwgc2VxdWVuY2UpIHtcclxuICBjb25zdCBpbmRleCA9IGN1cnJlbnRJbmRleCB8fCAwO1xyXG4gIHJldHVybiAoaW5kZXggPCBzZXF1ZW5jZS5mcmFtZXMubGVuZ3RoIC0gMSkgP1xyXG4gICAgaW5kZXggKyAxIDogMDtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0QW5pbWF0aW9uKHNwcml0ZSkge1xyXG4gIHJldHVybiAncnVuJztcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0RnJhbWUoaW5kZXgsIHNlcXVlbmNlKSB7XHJcbiAgcmV0dXJuIHNlcXVlbmNlLmZyYW1lc1tpbmRleF07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFNsb3BlKGxpbmUpIHtcclxuICBjb25zdCBkZW5vbSA9IChsaW5lLngyIC0gbGluZS54MSk7XHJcbiAgcmV0dXJuIChsaW5lLnkyIC0gbGluZS55MSkgLyBkZW5vbTtcclxufVxyXG5cclxuZnVuY3Rpb24gbGluZUludGVyc2VjdHNSZWN0KGxpbmUsIHJlY3QpIHtcclxuICByZXR1cm4gbGluZUludGVyc2VjdHNTZWdtZW50KGxpbmUsIHJlY3QueCwgcmVjdC55LCByZWN0LnggKyByZWN0LndpZHRoLCByZWN0LnkpIHx8IC8vIHRvcFxyXG4gICAgbGluZUludGVyc2VjdHNTZWdtZW50KGxpbmUsIHJlY3QueCwgcmVjdC55LCByZWN0LngsIHJlY3QueSArIHJlY3QuaGVpZ2h0KSB8fCAvLyBsZWZ0XHJcbiAgICBsaW5lSW50ZXJzZWN0c1NlZ21lbnQobGluZSwgcmVjdC54LCByZWN0LnkgKyByZWN0LmhlaWdodCwgcmVjdC54ICsgcmVjdC53aWR0aCwgcmVjdC55ICsgcmVjdC5oZWlnaHQpIHx8IC8vIGJvdHRvbVxyXG4gICAgbGluZUludGVyc2VjdHNTZWdtZW50KGxpbmUsIHJlY3QueCArIHJlY3Qud2lkdGgsIHJlY3QueSwgcmVjdC54ICsgcmVjdC53aWR0aCwgcmVjdC55ICsgcmVjdC5oZWlnaHQpOyAvLyByaWdodFxyXG59XHJcblxyXG5mdW5jdGlvbiBsaW5lSW50ZXJzZWN0c1NlZ21lbnQobGluZSwgeDEsIHkxLCB4MiwgeTIpIHtcclxuICAvLyBUT0RPOiBwcmVjYWxjdWxhdGUgc29tZSBvZiB0aGlzIHNoaXRcclxuICBjb25zdCBkZW5vbSA9IChsaW5lLngxIC0gbGluZS54MikgKiAoeTEgLSB5MikgLSAobGluZS55MSAtIGxpbmUueTIpICogKHgxIC0geDIpO1xyXG5cclxuICBpZiAoZGVub20gPT09IDApIHtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHggPSBNYXRoLmZsb29yKCgobGluZS54MSAqIGxpbmUueTIgLSBsaW5lLnkxICogbGluZS54MikgKiAoeDEgLSB4MikgLSAobGluZS54MSAtIGxpbmUueDIpICogKHgxICogeTIgLSB5MSAqIHgyKSkgLyBkZW5vbSk7XHJcbiAgY29uc3QgeSA9IE1hdGguZmxvb3IoKChsaW5lLngxICogbGluZS55MiAtIGxpbmUueTEgKiBsaW5lLngyKSAqICh5MSAtIHkyKSAtIChsaW5lLnkxIC0gbGluZS55MikgKiAoeDEgKiB5MiAtIHkxICogeDIpKSAvIGRlbm9tKTtcclxuXHJcbiAgY29uc3QgbWF4WCA9IE1hdGgubWF4KHgxLCB4Mik7XHJcbiAgY29uc3QgbWluWCA9IE1hdGgubWluKHgxLCB4Mik7XHJcbiAgY29uc3QgbWF4WSA9IE1hdGgubWF4KHkxLCB5Mik7XHJcbiAgY29uc3QgbWluWSA9IE1hdGgubWluKHkxLCB5Mik7XHJcblxyXG4gIGlmICh4IDw9IG1heFggJiYgeCA+PSBtaW5YICYmXHJcbiAgICB5IDw9IG1heFkgJiYgeSA+PSBtaW5ZICkge1xyXG4gICAgcmV0dXJuIHt4OiB4LCB5OiB5fTtcclxuICB9XHJcblxyXG4gIHJldHVybiBmYWxzZTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2VnbWVudEludGVyc2VjdHNTZWdtZW50KGxpbmUsIHgxLCB5MSwgeDIsIHkyKSB7XHJcbiAgdmFyIGludGVyc2VjdHMgPSBsaW5lSW50ZXJzZWN0c1NlZ21lbnQobGluZSwgeDEsIHkxLCB4MiwgeTIpO1xyXG5cclxuICBpZiAoIWludGVyc2VjdHMpIHtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIGlmICghKGludGVyc2VjdHMueCA+PSBNYXRoLm1pbihsaW5lLngxLCBsaW5lLngyKSAmJlxyXG4gICAgaW50ZXJzZWN0cy54IDw9IE1hdGgubWF4KGxpbmUueDEsIGxpbmUueDIpICYmXHJcbiAgICBpbnRlcnNlY3RzLnkgPj0gTWF0aC5taW4obGluZS55MSwgbGluZS55MikgJiZcclxuICAgIGludGVyc2VjdHMueSA8PSBNYXRoLm1heChsaW5lLnkxLCBsaW5lLnkyKSkpIHtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbiAgcmV0dXJuIGludGVyc2VjdHM7XHJcbn1cclxuXHJcbi8qZnVuY3Rpb24gY29sbGlzaW9ucyhzcHJpdGUsIGNvbGxpZGVycykge1xyXG4gIGNvbGxpZGVycy5mb3JFYWNoKGZ1bmN0aW9uIChjb2xsaWRlcikge1xyXG4gICAgaWYgKHNwcml0ZS55IC0gc3ByaXRlLmxhc3RZID4gMCkge1xyXG4gICAgICBsZXQgaGFsZldpZHRoID0gc3ByaXRlLndpZHRoIC8gMjtcclxuICAgICAgbGV0IGludGVyc2VjdHMgPSBzZWdtZW50SW50ZXJzZWN0c1NlZ21lbnQoY29sbGlkZXIsIHNwcml0ZS54ICsgaGFsZldpZHRoLCBzcHJpdGUueSwgc3ByaXRlLnggKyBoYWxmV2lkdGgsIHNwcml0ZS55ICsgc3ByaXRlLmhlaWdodCk7XHJcbiAgICAgIGlmKGludGVyc2VjdHMpIHtcclxuICAgICAgICBzcHJpdGUueSA9IGludGVyc2VjdHMueSAtIHNwcml0ZS5oZWlnaHQ7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoc3ByaXRlLnggLSBzcHJpdGUubGFzdFggPiAwKSB7XHJcbiAgICAgIGxldCBoYWxmSGVpZ2h0ID0gc3ByaXRlLmhlaWdodCAvIDI7XHJcbiAgICAgIGxldCBpbnRlcnNlY3RzID0gc2VnbWVudEludGVyc2VjdHNTZWdtZW50KGNvbGxpZGVyLCBzcHJpdGUueCwgc3ByaXRlLnkgKyBoYWxmSGVpZ2h0LCBzcHJpdGUueCArIHNwcml0ZS53aWR0aCwgc3ByaXRlLnkgKyBoYWxmSGVpZ2h0KTtcclxuICAgICAgaWYoaW50ZXJzZWN0cykge1xyXG4gICAgICAgIHNwcml0ZS54ID0gaW50ZXJzZWN0cy54IC0gc3ByaXRlLndpZHRoO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSk7XHJcbn0qL1xyXG5cclxuZnVuY3Rpb24gbG9nKG1zZykge1xyXG4gIC8vY29uc29sZS5sb2cobXNnKTtcclxufVxyXG5cclxuZnVuY3Rpb24gY29sbGlzaW9ucyhzcHJpdGUsIGNvbGxpZGVycykge1xyXG4gIGNvbnN0IGRpclkgPSBzcHJpdGUueSAtIHNwcml0ZS5sYXN0WTtcclxuICBjb25zdCBkaXJYID0gc3ByaXRlLnggLSBzcHJpdGUubGFzdFg7XHJcblxyXG4gIGNvbGxpZGVycy5mb3JFYWNoKGZ1bmN0aW9uIChjb2xsaWRlcikge1xyXG4gICAgbGV0IGludGVyc2VjdHMsIHgsIHk7XHJcblxyXG4gICAgaWYoIWNvbGxpZGVyLnNsb3BlKSB7XHJcbiAgICAgIGludGVyc2VjdHMgPSBzZWdtZW50SW50ZXJzZWN0c1NlZ21lbnQoY29sbGlkZXIsIHNwcml0ZS54LCBzcHJpdGUueSwgc3ByaXRlLnggKyBzcHJpdGUud2lkdGgsIHNwcml0ZS55KTsgLy8gdG9wXHJcbiAgICAgIGlmIChpbnRlcnNlY3RzKSB7XHJcbiAgICAgICAgbG9nKCd0b3AnLCBpbnRlcnNlY3RzKTtcclxuICAgICAgICBzcHJpdGUueCA9IGludGVyc2VjdHMueDtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGludGVyc2VjdHMgPSBzZWdtZW50SW50ZXJzZWN0c1NlZ21lbnQoY29sbGlkZXIsIHNwcml0ZS54LCBzcHJpdGUueSArIHNwcml0ZS5oZWlnaHQsIHNwcml0ZS54ICsgc3ByaXRlLndpZHRoLCBzcHJpdGUueSArIHNwcml0ZS5oZWlnaHQpKSB7IC8vIGJvdHRvbVxyXG4gICAgICAgIGxvZygnYm90dG9tJywgaW50ZXJzZWN0cyk7XHJcbiAgICAgICAgc3ByaXRlLnggPSBpbnRlcnNlY3RzLnggLSBzcHJpdGUud2lkdGggLSAxO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaW50ZXJzZWN0cyA9IHNlZ21lbnRJbnRlcnNlY3RzU2VnbWVudChjb2xsaWRlciwgc3ByaXRlLngsIHNwcml0ZS55LCBzcHJpdGUueCwgc3ByaXRlLnkgKyBzcHJpdGUuaGVpZ2h0KTsgLy8gbGVmdFxyXG4gICAgaWYgKGludGVyc2VjdHMpIHtcclxuICAgICAgbG9nKCdsZWZ0JywgaW50ZXJzZWN0cyk7XHJcbiAgICAgIHNwcml0ZS55ID0gaW50ZXJzZWN0cy55IC0gc3ByaXRlLmhlaWdodCAtIDE7XHJcbiAgICB9XHJcblxyXG4gICAgaWYoaW50ZXJzZWN0cyA9IHNlZ21lbnRJbnRlcnNlY3RzU2VnbWVudChjb2xsaWRlciwgc3ByaXRlLnggKyBzcHJpdGUud2lkdGgsIHNwcml0ZS55LCBzcHJpdGUueCArIHNwcml0ZS53aWR0aCwgc3ByaXRlLnkgKyBzcHJpdGUuaGVpZ2h0KSkgey8vIHJpZ2h0XHJcbiAgICAgIGxvZygncmlnaHQnLCBpbnRlcnNlY3RzKTtcclxuICAgICAgc3ByaXRlLnkgPSBpbnRlcnNlY3RzLnkgLSBzcHJpdGUuaGVpZ2h0IC0gMTtcclxuICAgIH1cclxuXHJcblxyXG4gIH0pO1xyXG59XHJcblxyXG5jb25zdCBnZXRJbnB1dHMgPSBJbnB1dCgpO1xyXG5jb25zdCBnZXRGcmFtZXMgPSBGcmFtZSgpO1xyXG5jb25zdCB2aWV3cG9ydCA9IFZpZXdwb3J0O1xyXG5jb25zdCBmcHNVSSA9IEZyYWdtZW50KCdmcHMnKTtcclxuXHJcbmdldEZyYW1lcyhmdW5jdGlvbiAoZWxhcHNlZCwgZnBzKSB7XHJcbiAgZnBzVUkudGV4dENvbnRlbnQgPSBmcHM7XHJcbiAgcmV0dXJuIHRydWU7XHJcbn0pO1xyXG5cclxuc2NlbmVcclxuICAudGhlbihmdW5jdGlvbiAoc2NlbmUpIHtcclxuICAgIGNvbnN0IHNjZW5lQm91bmRzID0gT2JqZWN0LmZyZWV6ZSh7XHJcbiAgICAgIHdpZHRoOiBzY2VuZS5zY2VuZVdpZHRoLFxyXG4gICAgICBoZWlnaHQ6IHNjZW5lLnNjZW5lSGVpZ2h0XHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBjYW52YXMgPSBGcmFnbWVudCgnY2FudmFzLWVudGl0aWVzJyk7XHJcbiAgICBjb25zdCBjb250ZXh0MmQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgIGNvbnN0IGNvbGxpZGVycyA9IE9iamVjdC5mcmVlemUoc2NlbmUuY29sbGlkZXJzKTtcclxuXHJcbiAgICAvKlxyXG4gICAgY29uc3QgY29sbGlkZXJzWCA9IGNvbGxpZGVycy5tYXAoY29sbGlkZXIgPT4ge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHg6IGNvbGxpZGVyLngsXHJcbiAgICAgICAgeTogY29sbGlkZXIueSxcclxuICAgICAgICB3aWR0aDogY29sbGlkZXIud2lkdGgsXHJcbiAgICAgICAgaGVpZ2h0OiBjb2xsaWRlci5oZWlnaHQsXHJcbiAgICAgICAgcG9zaXRpb25NaW46IGNvbGxpZGVyLngsXHJcbiAgICAgICAgcG9zaXRpb25NYXg6IGNvbGxpZGVyLnggKyBjb2xsaWRlci53aWR0aCxcclxuICAgICAgICByYW5nZU1pbjogY29sbGlkZXIueSxcclxuICAgICAgICByYW5nZU1heDogY29sbGlkZXIueSArIGNvbGxpZGVyLmhlaWdodFxyXG4gICAgICB9O1xyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgY29sbGlkZXJzWSA9IGNvbGxpZGVycy5tYXAoY29sbGlkZXIgPT4ge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHg6IGNvbGxpZGVyLngsXHJcbiAgICAgICAgeTogY29sbGlkZXIueSxcclxuICAgICAgICB3aWR0aDogY29sbGlkZXIud2lkdGgsXHJcbiAgICAgICAgaGVpZ2h0OiBjb2xsaWRlci5oZWlnaHQsXHJcbiAgICAgICAgcG9zaXRpb25NaW46IGNvbGxpZGVyLnksXHJcbiAgICAgICAgcG9zaXRpb25NYXg6IGNvbGxpZGVyLnkgKyBjb2xsaWRlci5oZWlnaHQsXHJcbiAgICAgICAgcmFuZ2VNaW46IGNvbGxpZGVyLngsXHJcbiAgICAgICAgcmFuZ2VNYXg6IGNvbGxpZGVyLnggKyBjb2xsaWRlci53aWR0aFxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgICovXHJcblxyXG4gICAgY29uc3Qgc3ByaXRlcyA9IE9iamVjdC5mcmVlemUoc2NlbmUuc3ByaXRlcyk7XHJcbiAgICBjb25zdCBwbGF5ZXIgPSBzcHJpdGVzWzBdO1xyXG5cclxuICAgIGdldEZyYW1lcyhmdW5jdGlvbiAoZWxhcHNlZCkge1xyXG4gICAgICBjbGVhckNvbnRleHQoY29udGV4dDJkLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xyXG5cclxuICAgICAgY29uc3QgaW5wdXRzID0gZ2V0SW5wdXRzKCk7XHJcblxyXG4gICAgICBwbGF5ZXIudmVsb2NpdHkueSA9IDMwMDtcclxuXHJcbiAgICAgIGlmIChpbnB1dHNbMzddKSB7XHJcbiAgICAgICAgcGxheWVyLnZlbG9jaXR5LnggPSAtMTAwO1xyXG4gICAgICB9IGVsc2UgaWYgKGlucHV0c1szOV0pIHtcclxuICAgICAgICBwbGF5ZXIudmVsb2NpdHkueCA9IDEwMDtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGlucHV0c1szOF0pIHtcclxuICAgICAgICBwbGF5ZXIudmVsb2NpdHkueSA9IC01MDA7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHNwcml0ZXMuZm9yRWFjaChmdW5jdGlvbiAoc3ByaXRlKSB7XHJcbiAgICAgICAgc3ByaXRlLmxhc3RYID0gc3ByaXRlLng7XHJcbiAgICAgICAgc3ByaXRlLmxhc3RZID0gc3ByaXRlLnk7XHJcblxyXG4gICAgICAgIGNvbnN0IHZlbG9jaXR5WCA9IGdldFZlbG9jaXR5KHNwcml0ZSwgJ3gnLCBlbGFwc2VkKTtcclxuICAgICAgICBjb25zdCB4ID0gZ2V0UG9zaXRpb25EZWx0YShzcHJpdGUueCwgdmVsb2NpdHlYLCBlbGFwc2VkKTtcclxuXHJcbiAgICAgICAgY29uc3QgYm91bmRzRGlmZlggPSBnZXRJbm5lckRpZmYoeCwgc3ByaXRlLndpZHRoLCAwLCBzY2VuZUJvdW5kcy53aWR0aCk7XHJcbiAgICAgICAgY29uc3QgeDEgPSByZXNvbHZlQ29sbGlzaW9uKGJvdW5kc0RpZmZYLCB4KTtcclxuXHJcbiAgICAgICAgY29uc3QgdmVsb2NpdHlZID0gZ2V0VmVsb2NpdHkoc3ByaXRlLCAneScsIGVsYXBzZWQpO1xyXG4gICAgICAgIGNvbnN0IHkgPSBnZXRQb3NpdGlvbkRlbHRhKHNwcml0ZS55LCB2ZWxvY2l0eVksIGVsYXBzZWQpO1xyXG5cclxuICAgICAgICBjb25zdCBib3VuZHNEaWZmWSA9IGdldElubmVyRGlmZih5LCBzcHJpdGUuaGVpZ2h0LCAwLCBzY2VuZUJvdW5kcy5oZWlnaHQpO1xyXG4gICAgICAgIGNvbnN0IHkxID0gcmVzb2x2ZUNvbGxpc2lvbihib3VuZHNEaWZmWSwgeSk7XHJcblxyXG4gICAgICAgIC8qY29sbGlkZXJzLmZvckVhY2goZnVuY3Rpb24gKGNvbGxpZGVyKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhsaW5lSW50ZXJzZWN0c1JlY3QoY29sbGlkZXIsIHNwcml0ZSkpO1xyXG4gICAgICAgIH0pOyovXHJcblxyXG4gICAgICAgIGxldCB4MiA9IHgxO1xyXG4gICAgICAgIGxldCB5MiA9IHkxO1xyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgIGxldCB2YWxzID0gZ2V0Q29sbGlkZXJzSW5SYW5nZSh5MSwgeTEgKyBzcHJpdGUuaGVpZ2h0LCBjb2xsaWRlcnNYKVxyXG4gICAgICAgICAgLm1hcChmdW5jdGlvbiAoY29sbGlkZXIpIHtcclxuICAgICAgICAgICAgbGV0IG1heERpZmYgPSBnZXRNYXhQb3NpdGlvbkRpZmYoeDEgKyBzcHJpdGUud2lkdGgsIGNvbGxpZGVyLnBvc2l0aW9uTWluKTtcclxuICAgICAgICAgICAgbGV0IG1pbkRpZmYgPSBnZXRNaW5Qb3NpdGlvbkRpZmYoeDEsIGNvbGxpZGVyLnBvc2l0aW9uTWF4KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAoTWF0aC5taW4oTWF0aC5hYnMobWF4RGlmZiksIE1hdGguYWJzKG1pbkRpZmYpKSk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAqL1xyXG5cclxuICAgICAgICAvLyBtdXRhdGUgc3ByaXRlXHJcbiAgICAgICAgc3ByaXRlLnZlbG9jaXR5LnggPSB2ZWxvY2l0eVg7XHJcbiAgICAgICAgc3ByaXRlLnggPSB4MjtcclxuICAgICAgICBzcHJpdGUudmVsb2NpdHkueSA9IHZlbG9jaXR5WTtcclxuICAgICAgICBzcHJpdGUueSA9IHkyO1xyXG5cclxuICAgICAgICBjb2xsaXNpb25zKHNwcml0ZSwgY29sbGlkZXJzKTtcclxuXHJcbiAgICAgICAgaWYgKHNwcml0ZSA9PT0gcGxheWVyKSB7XHJcbiAgICAgICAgICBjb25zdCBtaW5NYXJnaW4gPSB2aWV3cG9ydC5tYXJnaW5MZWZ0O1xyXG4gICAgICAgICAgY29uc3QgbWF4TWFyZ2luID0gdmlld3BvcnQud2lkdGggLSB2aWV3cG9ydC5tYXJnaW5SaWdodDtcclxuICAgICAgICAgIGNvbnN0IHZpZXdwb3J0RGlmZlggPSBnZXRJbm5lckRpZmYoXHJcbiAgICAgICAgICAgIHNwcml0ZS54LFxyXG4gICAgICAgICAgICBzcHJpdGUud2lkdGgsXHJcbiAgICAgICAgICAgIHZpZXdwb3J0LnggKyBtaW5NYXJnaW4sXHJcbiAgICAgICAgICAgIHZpZXdwb3J0LnggKyBtYXhNYXJnaW5cclxuICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgLy8gbXV0YXRlIHZpZXdwb3J0XHJcbiAgICAgICAgICBpZiAodmlld3BvcnREaWZmWCA+IDAgJiYgc3ByaXRlLnZlbG9jaXR5LnggPiAwKSB7XHJcbiAgICAgICAgICAgIHZpZXdwb3J0LnggPSBnZXRQb3NpdGlvbkZyb21NYXhNYXJnaW4oc3ByaXRlLngsIHNwcml0ZS53aWR0aCwgbWF4TWFyZ2luKTtcclxuICAgICAgICAgIH0gZWxzZSBpZiAodmlld3BvcnREaWZmWCA8IDAgJiYgc3ByaXRlLnZlbG9jaXR5LnggPCAwKSB7XHJcbiAgICAgICAgICAgIHZpZXdwb3J0LnggPSBnZXRQb3NpdGlvbkZyb21NaW5NYXJnaW4oc3ByaXRlLngsIG1pbk1hcmdpbik7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBmcmFtZSA9IGFwcGx5QW5pbWF0aW9uKHNwcml0ZSk7XHJcbiAgICAgICAgY29uc3QgcG9zID0ge3g6IHNwcml0ZS54LCB5OiBzcHJpdGUueX07XHJcblxyXG4gICAgICAgIHJlbmRlcihjb250ZXh0MmQsIHBvcywgZnJhbWUsIHZpZXdwb3J0KTtcclxuICAgICAgICAvL3JlbmRlclJlY3RzKGNvbnRleHQyZCwgY29sbGlkZXJzLCB2aWV3cG9ydCk7XHJcbiAgICAgICAgcmVuZGVyTGluZXMoY29udGV4dDJkLCBjb2xsaWRlcnMsIHZpZXdwb3J0KTtcclxuICAgICAgICByZW5kZXJSZWN0cyhjb250ZXh0MmQsIHNwcml0ZXMsIHZpZXdwb3J0KTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiBzY2VuZTtcclxuICB9KVxyXG4gIC50aGVuKGZ1bmN0aW9uIChzY2VuZSkge1xyXG4gICAgY29uc3QgYmFja2dyb3VuZEltYWdlID0gc2NlbmUuYmFja2dyb3VuZEltYWdlO1xyXG5cclxuICAgIGNvbnN0IGNhbnZhcyA9IEZyYWdtZW50KCdjYW52YXMtYmFja2dyb3VuZCcpO1xyXG4gICAgY29uc3QgY29udGV4dDJkID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcblxyXG4gICAgZ2V0RnJhbWVzKGZ1bmN0aW9uICgpIHtcclxuICAgICAgY2xlYXJDb250ZXh0KGNvbnRleHQyZCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcclxuICAgICAgLy9yZW5kZXIoY29udGV4dDJkLCB7eDogMCwgeTogMH0sIGJhY2tncm91bmRJbWFnZSwgdmlld3BvcnQpO1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIHNjZW5lO1xyXG4gIH0pO1xyXG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBTaGF1biBvbiAzLzEvMTVcclxuICpcclxuICovXHJcblxyXG5pbXBvcnQge2dldENhbnZhcywgZ2V0VHJhbnNwYXJlbnRJbWFnZX0gZnJvbSAnLi4vZW5naW5lL2NvbW1vbi5qcyc7XHJcblxyXG5jb25zdCBERUZBVUxUX1JBVEUgPSA1O1xyXG5cclxuZnVuY3Rpb24gYnVpbGRGcmFtZVNlcXVlbmNlKGZyYW1lU2V0RGVmaW5pdGlvbiwgZnJhbWVTaXplLCBzcHJpdGVTaGVldCkge1xyXG4gIHZhciBmcmFtZVdpZHRoID0gZnJhbWVTaXplLndpZHRoO1xyXG4gIHZhciBmcmFtZUhlaWdodCA9IGZyYW1lU2l6ZS5oZWlnaHQ7XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICByYXRlOiBmcmFtZVNldERlZmluaXRpb24ucmF0ZSB8fCBERUZBVUxUX1JBVEUsXHJcbiAgICBmcmFtZXM6IGZyYW1lU2V0RGVmaW5pdGlvbi5mcmFtZXNcclxuICAgICAgLm1hcChmdW5jdGlvbihmcmFtZURlZmluaXRpb24pIHtcclxuICAgICAgICB2YXIgZnJhbWUgPSBnZXRDYW52YXMoZnJhbWVXaWR0aCwgZnJhbWVIZWlnaHQpO1xyXG5cclxuICAgICAgICBmcmFtZVxyXG4gICAgICAgICAgLmdldENvbnRleHQoJzJkJylcclxuICAgICAgICAgIC5kcmF3SW1hZ2UoXHJcbiAgICAgICAgICAgIHNwcml0ZVNoZWV0LFxyXG4gICAgICAgICAgICBmcmFtZURlZmluaXRpb24ueCwgZnJhbWVEZWZpbml0aW9uLnksXHJcbiAgICAgICAgICAgIGZyYW1lV2lkdGgsIGZyYW1lSGVpZ2h0LFxyXG4gICAgICAgICAgICAwLCAwLFxyXG4gICAgICAgICAgICBmcmFtZVdpZHRoLCBmcmFtZUhlaWdodFxyXG4gICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGZyYW1lO1xyXG4gICAgICB9KVxyXG4gIH07XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChzcHJpdGVEZWZpbml0aW9uLCBzcHJpdGVTaGVldCkge1xyXG4gIHJldHVybiBPYmplY3RcclxuICAgIC5rZXlzKHNwcml0ZURlZmluaXRpb24uYW5pbWF0aW9ucylcclxuICAgIC5yZWR1Y2UoZnVuY3Rpb24oZnJhbWVTZXQsIGZyYW1lU2V0SWQpIHtcclxuICAgICAgdmFyIGZyYW1lU2VxdWVuY2UgPSBidWlsZEZyYW1lU2VxdWVuY2UoXHJcbiAgICAgICAgc3ByaXRlRGVmaW5pdGlvbi5hbmltYXRpb25zW2ZyYW1lU2V0SWRdLFxyXG4gICAgICAgIHNwcml0ZURlZmluaXRpb24uZnJhbWVTaXplLFxyXG4gICAgICAgIHNwcml0ZVNoZWV0XHJcbiAgICAgICk7XHJcblxyXG4gICAgICBmcmFtZVNlcXVlbmNlLmZyYW1lcyA9IGZyYW1lU2VxdWVuY2UuZnJhbWVzXHJcbiAgICAgICAgLm1hcChmdW5jdGlvbihmcmFtZSkge1xyXG4gICAgICAgICAgcmV0dXJuIGdldFRyYW5zcGFyZW50SW1hZ2Uoc3ByaXRlRGVmaW5pdGlvbi50cmFuc3BhcmVudENvbG9yLCBmcmFtZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICBmcmFtZVNldFtmcmFtZVNldElkXSA9IGZyYW1lU2VxdWVuY2U7XHJcblxyXG4gICAgICByZXR1cm4gZnJhbWVTZXQ7XHJcbiAgICB9LCB7fSk7XHJcbn07XHJcbiIsImltcG9ydCBTY2hlZHVsZXIgZnJvbSAnLi4vZW5naW5lL3NjaGVkdWxlci5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoZnJhbWVTZXQpIHtcclxuICB2YXIgY3VycmVudEZyYW1lU2VxdWVuY2UgPSBmcmFtZVNldFsncnVuJ10sIC8vbnVsbCxcclxuICAgIGN1cnJlbnRGcmFtZUluZGV4ID0gMCxcclxuICAgIGN1cnJlbnRGcmFtZSA9IG51bGwsXHJcbiAgICBmcmFtZUNhbGxiYWNrID0gbnVsbDtcclxuXHJcbiAgdmFyIHNjaGVkdWxlcklkID0gU2NoZWR1bGVyKGZ1bmN0aW9uKGRlbHRhVGltZSwgc2V0UmF0ZSkge1xyXG4gICAgaWYoIWN1cnJlbnRGcmFtZVNlcXVlbmNlKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBpZighY3VycmVudEZyYW1lKSB7XHJcbiAgICAgIHNldFJhdGUoY3VycmVudEZyYW1lU2VxdWVuY2UucmF0ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgY3VycmVudEZyYW1lID0gY3VycmVudEZyYW1lU2VxdWVuY2UuZnJhbWVzW2N1cnJlbnRGcmFtZUluZGV4XTtcclxuICAgIGlmKGZyYW1lQ2FsbGJhY2spIHtcclxuICAgICAgZnJhbWVDYWxsYmFjayhjdXJyZW50RnJhbWUpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmKCsrY3VycmVudEZyYW1lSW5kZXggPj0gY3VycmVudEZyYW1lU2VxdWVuY2UuZnJhbWVzLmxlbmd0aCkge1xyXG4gICAgICBjdXJyZW50RnJhbWVJbmRleCA9IDA7XHJcbiAgICB9XHJcbiAgfSlcclxuICAgIC5pZCgpO1xyXG5cclxuICByZXR1cm4ge1xyXG4gICAgcGxheTogZnVuY3Rpb24oZnJhbWVTZXRJZCkge1xyXG4gICAgICBjdXJyZW50RnJhbWVTZXF1ZW5jZSA9IGZyYW1lU2V0W2ZyYW1lU2V0SWRdO1xyXG4gICAgICBjdXJyZW50RnJhbWVJbmRleCA9IDA7XHJcbiAgICAgIGN1cnJlbnRGcmFtZSA9IG51bGw7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuICAgIG9uRnJhbWU6IGZ1bmN0aW9uKGNiKSB7XHJcbiAgICAgIGZyYW1lQ2FsbGJhY2sgPSBjYjtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG4gICAgc3RvcDogZnVuY3Rpb24oKSB7XHJcbiAgICAgIGN1cnJlbnRGcmFtZVNlcXVlbmNlID0gbnVsbDtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG4gICAga2lsbDogZnVuY3Rpb24oKSB7XHJcbiAgICAgIFNjaGVkdWxlci51bnNjaGVkdWxlKHNjaGVkdWxlcklkKTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG4gICAgY3VycmVudEZyYW1lSW5kZXg6IGZ1bmN0aW9uKCkge1xyXG4gICAgICByZXR1cm4gY3VycmVudEZyYW1lSW5kZXg7XHJcbiAgICB9LFxyXG4gICAgZ2V0SW1hZ2U6IGZ1bmN0aW9uKCkge1xyXG4gICAgICByZXR1cm4gY3VycmVudEZyYW1lO1xyXG4gICAgfSxcclxuICAgIGdldE5leHQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICBjdXJyZW50RnJhbWUgPSBjdXJyZW50RnJhbWVTZXF1ZW5jZS5mcmFtZXNbY3VycmVudEZyYW1lSW5kZXhdO1xyXG4gICAgICBpZigrK2N1cnJlbnRGcmFtZUluZGV4ID49IGN1cnJlbnRGcmFtZVNlcXVlbmNlLmZyYW1lcy5sZW5ndGgpIHtcclxuICAgICAgICBjdXJyZW50RnJhbWVJbmRleCA9IDA7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGN1cnJlbnRGcmFtZTtcclxuICAgIH1cclxuICB9O1xyXG59XHJcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBzaGF1bndlc3Qgb24gNi8yOS8xNS5cbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gY2xlYXJDb250ZXh0KGNvbnRleHQyZCwgd2lkdGgsIGhlaWdodCkge1xuICBjb250ZXh0MmQuY2xlYXJSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyKGNvbnRleHQyZCwgcG9pbnQsIGltYWdlLCB2aWV3cG9ydCkge1xuICBpZighaW1hZ2UpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgY29udGV4dDJkLmRyYXdJbWFnZShcbiAgICBpbWFnZSxcbiAgICBwb2ludC54IC0gdmlld3BvcnQueCB8fCAwLFxuICAgIHBvaW50LnkgLSB2aWV3cG9ydC55IHx8IDBcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlclJlY3RzKGNvbnRleHQyZCwgcmVjdHMsIHZpZXdwb3J0LCBjb2xvcikge1xuICBjb2xvciA9IGNvbG9yIHx8ICcjMDAwMDAwJztcbiAgcmVjdHMuZm9yRWFjaChmdW5jdGlvbiAocmVjdCkge1xuICAgIGNvbnRleHQyZC5zdHJva2VTdHlsZSA9IGNvbG9yO1xuICAgIGNvbnRleHQyZC5zdHJva2VSZWN0KHJlY3QueCAtIHZpZXdwb3J0LngsIHJlY3QueSAtIHZpZXdwb3J0LnksIHJlY3Qud2lkdGgsIHJlY3QuaGVpZ2h0KTtcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJMaW5lcyhjb250ZXh0MmQsIGxpbmVzLCB2aWV3cG9ydCkge1xuICBsaW5lcy5mb3JFYWNoKGZ1bmN0aW9uIChsaW5lKSB7XG4gICAgY29udGV4dDJkLmJlZ2luUGF0aCgpO1xuICAgIGNvbnRleHQyZC5tb3ZlVG8obGluZS54MSAtIHZpZXdwb3J0LngsIGxpbmUueTEgLSB2aWV3cG9ydC55KTtcbiAgICBjb250ZXh0MmQubGluZVRvKGxpbmUueDIgLSB2aWV3cG9ydC54LCBsaW5lLnkyIC0gdmlld3BvcnQueSk7XG4gICAgY29udGV4dDJkLnN0cm9rZSgpO1xuICB9KTtcbn1cbiIsIlxyXG5pbXBvcnQgVXRpbCBmcm9tICcuL3V0aWwuanMnO1xyXG5cclxuLy8gUmV0dXJuIGV2ZXJ5dGhpbmcgYmVmb3JlIHRoZSBsYXN0IHNsYXNoIG9mIGEgdXJsXHJcbi8vIGUuZy4gaHR0cDovL2Zvby9iYXIvYmF6Lmpzb24gPT4gaHR0cDovL2Zvby9iYXJcclxuZXhwb3J0IGZ1bmN0aW9uIGdldEJhc2VVcmwodXJsKSB7XHJcbiAgdmFyIG4gPSB1cmwubGFzdEluZGV4T2YoJy8nKTtcclxuICByZXR1cm4gdXJsLnN1YnN0cmluZygwLCBuKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGlzRnVsbFVybCh1cmwpIHtcclxuICByZXR1cm4gKHVybC5zdWJzdHJpbmcoMCwgNykgPT09ICdodHRwOi8vJyB8fFxyXG4gICAgdXJsLnN1YnN0cmluZygwLCA4KSA9PT0gJ2h0dHBzOi8vJyk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVVcmwodXJsLCBiYXNlVXJsKSB7XHJcbiAgaWYoYmFzZVVybCAmJiAhaXNGdWxsVXJsKHVybCkpIHtcclxuICAgIHJldHVybiBiYXNlVXJsICsgJy8nICsgdXJsO1xyXG4gIH1cclxuICByZXR1cm4gdXJsO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VPYmplY3Qoc291cmNlLCBkZXN0aW5hdGlvbiwgYWxsb3dXcmFwLCBleGNlcHRpb25PbkNvbGxpc2lvbnMpIHtcclxuICBzb3VyY2UgPSBzb3VyY2UgfHwge307IC8vUG9vbC5nZXRPYmplY3QoKTtcclxuICBkZXN0aW5hdGlvbiA9IGRlc3RpbmF0aW9uIHx8IHt9OyAvL1Bvb2wuZ2V0T2JqZWN0KCk7XHJcblxyXG4gIE9iamVjdC5rZXlzKHNvdXJjZSkuZm9yRWFjaChmdW5jdGlvbihwcm9wKSB7XHJcbiAgICBhc3NpZ25Qcm9wZXJ0eShzb3VyY2UsIGRlc3RpbmF0aW9uLCBwcm9wLCBhbGxvd1dyYXAsIGV4Y2VwdGlvbk9uQ29sbGlzaW9ucyk7XHJcbiAgfSk7XHJcblxyXG4gIHJldHVybiBkZXN0aW5hdGlvbjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGFzc2lnblByb3BlcnR5KHNvdXJjZSwgZGVzdGluYXRpb24sIHByb3AsIGFsbG93V3JhcCwgZXhjZXB0aW9uT25Db2xsaXNpb25zKSB7XHJcbiAgaWYoZGVzdGluYXRpb24uaGFzT3duUHJvcGVydHkocHJvcCkpIHtcclxuICAgIGlmKGFsbG93V3JhcCkge1xyXG4gICAgICBkZXN0aW5hdGlvbltwcm9wXSA9IEZ1bmMud3JhcChkZXN0aW5hdGlvbltwcm9wXSwgc291cmNlW3Byb3BdKTtcclxuICAgICAgVXRpbC5sb2coJ01lcmdlOiB3cmFwcGVkIFxcJycgKyBwcm9wICsgJ1xcJycpO1xyXG4gICAgfSBlbHNlIGlmKGV4Y2VwdGlvbk9uQ29sbGlzaW9ucykge1xyXG4gICAgICBVdGlsLmVycm9yKCdGYWlsZWQgdG8gbWVyZ2UgbWl4aW4uIE1ldGhvZCBcXCcnICtcclxuICAgICAgcHJvcCArICdcXCcgY2F1c2VkIGEgbmFtZSBjb2xsaXNpb24uJyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBkZXN0aW5hdGlvbltwcm9wXSA9IHNvdXJjZVtwcm9wXTtcclxuICAgICAgVXRpbC5sb2coJ01lcmdlOiBvdmVyd3JvdGUgXFwnJyArIHByb3AgKyAnXFwnJyk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZGVzdGluYXRpb247XHJcbiAgfVxyXG5cclxuICBkZXN0aW5hdGlvbltwcm9wXSA9IHNvdXJjZVtwcm9wXTtcclxuXHJcbiAgcmV0dXJuIGRlc3RpbmF0aW9uO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2FudmFzKHdpZHRoLCBoZWlnaHQpIHtcclxuICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcblxyXG4gIGNhbnZhcy53aWR0aCA9IHdpZHRoIHx8IDUwMDtcclxuICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0IHx8IDUwMDtcclxuXHJcbiAgcmV0dXJuIGNhbnZhcztcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGludGVyc2VjdHMocmVjdEEsIHJlY3RCKSB7XHJcbiAgcmV0dXJuICEoXHJcbiAgICByZWN0QS54ICsgcmVjdEEud2lkdGggPCByZWN0Qi54IHx8XHJcbiAgICByZWN0QS55ICsgcmVjdEEuaGVpZ2h0IDwgcmVjdEIueSB8fFxyXG4gICAgcmVjdEEueCA+IHJlY3RCLnggKyByZWN0Qi53aWR0aCB8fFxyXG4gICAgcmVjdEEueSA+IHJlY3RCLnkgKyByZWN0Qi5oZWlnaHRcclxuICApO1xyXG59XHJcblxyXG4vLyBNYWtlIHRoZSBnaXZlbiBSR0IgdmFsdWUgdHJhbnNwYXJlbnQgaW4gdGhlIGdpdmVuIGltYWdlLlxyXG4vLyBSZXR1cm5zIGEgbmV3IGltYWdlLlxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0VHJhbnNwYXJlbnRJbWFnZSh0cmFuc1JHQiwgaW1hZ2UpIHtcclxuICB2YXIgciwgZywgYiwgbmV3SW1hZ2UsIGRhdGFMZW5ndGg7XHJcbiAgdmFyIHdpZHRoID0gaW1hZ2Uud2lkdGg7XHJcbiAgdmFyIGhlaWdodCA9IGltYWdlLmhlaWdodDtcclxuICB2YXIgaW1hZ2VEYXRhID0gaW1hZ2VcclxuICAgIC5nZXRDb250ZXh0KCcyZCcpXHJcbiAgICAuZ2V0SW1hZ2VEYXRhKDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xyXG5cclxuICBpZih0cmFuc1JHQikge1xyXG4gICAgZGF0YUxlbmd0aCA9IHdpZHRoICogaGVpZ2h0ICogNDtcclxuXHJcbiAgICBmb3IodmFyIGluZGV4ID0gMDsgaW5kZXggPCBkYXRhTGVuZ3RoOyBpbmRleCs9NCkge1xyXG4gICAgICByID0gaW1hZ2VEYXRhLmRhdGFbaW5kZXhdO1xyXG4gICAgICBnID0gaW1hZ2VEYXRhLmRhdGFbaW5kZXggKyAxXTtcclxuICAgICAgYiA9IGltYWdlRGF0YS5kYXRhW2luZGV4ICsgMl07XHJcbiAgICAgIGlmKHIgPT09IHRyYW5zUkdCWzBdICYmIGcgPT09IHRyYW5zUkdCWzFdICYmIGIgPT09IHRyYW5zUkdCWzJdKSB7XHJcbiAgICAgICAgaW1hZ2VEYXRhLmRhdGFbaW5kZXggKyAzXSA9IDA7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIG5ld0ltYWdlID0gZ2V0Q2FudmFzKHdpZHRoLCBoZWlnaHQpO1xyXG4gIG5ld0ltYWdlXHJcbiAgICAuZ2V0Q29udGV4dCgnMmQnKVxyXG4gICAgLnB1dEltYWdlRGF0YShpbWFnZURhdGEsIDAsIDApO1xyXG5cclxuICByZXR1cm4gbmV3SW1hZ2U7XHJcbn1cclxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgU2hhdW4gb24gNC8yMy8yMDE1LlxyXG4gKi9cclxuXHJcbnZhciBhbGxEYXRhRWxlbWVudHM7XHJcblxyXG5mdW5jdGlvbiBoYXNEYXRhQXR0cmlidXRlKGVsZW1lbnQpIHtcclxuICB2YXIgYXR0cmlidXRlcyA9IGVsZW1lbnQuYXR0cmlidXRlcztcclxuICBmb3IodmFyIGkgPSAwLCBudW1BdHRyaWJ1dGVzID0gYXR0cmlidXRlcy5sZW5ndGg7IGkgPCBudW1BdHRyaWJ1dGVzOyBpKyspIHtcclxuICAgIGlmKGF0dHJpYnV0ZXNbaV0ubmFtZS5zdWJzdHIoMCwgNCkgPT09ICdkYXRhJykge1xyXG4gICAgICByZXR1cm4gZWxlbWVudDtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBmaW5kRGF0YUVsZW1lbnRzIChwYXJlbnRFbGVtZW50KSB7XHJcbiAgdmFyIGFsbEVsZW1lbnRzLCBlbGVtZW50LCBkYXRhRWxlbWVudHMgPSBbXTtcclxuXHJcbiAgaWYoIXBhcmVudEVsZW1lbnQpIHtcclxuICAgIHZhciBodG1sID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2h0bWwnKTtcclxuICAgIGlmKCFodG1sWzBdKSB7XHJcbiAgICAgIHJldHVybiBkYXRhRWxlbWVudHM7XHJcbiAgICB9XHJcbiAgICBwYXJlbnRFbGVtZW50ID0gaHRtbFswXTtcclxuICB9XHJcblxyXG4gIGFsbEVsZW1lbnRzID0gcGFyZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCcqJyk7XHJcbiAgZm9yKHZhciBpID0gMCwgbnVtRWxlbWVudHMgPSBhbGxFbGVtZW50cy5sZW5ndGg7IGkgPCBudW1FbGVtZW50czsgaSsrKSB7XHJcbiAgICBlbGVtZW50ID0gYWxsRWxlbWVudHNbaV07XHJcbiAgICBpZihoYXNEYXRhQXR0cmlidXRlKGVsZW1lbnQpKSB7XHJcbiAgICAgIGRhdGFFbGVtZW50cy5wdXNoKGVsZW1lbnQpO1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gZGF0YUVsZW1lbnRzO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gRnJhZ21lbnRzIChuYW1lKSB7XHJcbiAgaWYoIWFsbERhdGFFbGVtZW50cykge1xyXG4gICAgY2FjaGVEYXRhRWxlbWVudHMoKTtcclxuICB9XHJcbiAgcmV0dXJuIGFsbERhdGFFbGVtZW50cy5maWx0ZXIoZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgaWYoZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2RhdGEtJyArIG5hbWUpKSB7XHJcbiAgICAgIHJldHVybiBlbGVtZW50O1xyXG4gICAgfVxyXG4gIH0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gRnJhZ21lbnQgKG5hbWUpIHtcclxuICByZXR1cm4gRnJhZ21lbnRzKG5hbWUpWzBdO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY2FjaGVEYXRhRWxlbWVudHMoKSB7XHJcbiAgYWxsRGF0YUVsZW1lbnRzID0gZmluZERhdGFFbGVtZW50cygpO1xyXG59XHJcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBzaGF1bndlc3Qgb24gNi8yMC8xNS5cbiAqL1xuXG5jb25zdCBNU19QRVJfU0VDT05EID0gMTAwMDtcblxuZnVuY3Rpb24gZ2V0RGVsdGFUaW1lKG5vdywgbGFzdFVwZGF0ZVRpbWUpIHtcbiAgcmV0dXJuIChub3cgLSBsYXN0VXBkYXRlVGltZSkgLyBNU19QRVJfU0VDT05EO1xufVxuXG4vLyBTVEFURUZVTFxuZnVuY3Rpb24gRnJhbWVMb29wKHN0YXJ0KSB7XG4gIGxldCBjYnMgPSBbXSwgbGFzdCA9IHN0YXJ0LCBmcHMgPSAwLCBmcmFtZUNvdW50ID0gMDtcbiAgbGV0IGludGVydmFsSWQgPSBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgZnBzID0gZnJhbWVDb3VudDtcbiAgICBmcmFtZUNvdW50ID0gMDtcbiAgfSwgTVNfUEVSX1NFQ09ORCk7XG5cbiAgKGZ1bmN0aW9uIGxvb3AoKSB7XG4gICAgZnJhbWVDb3VudCsrO1xuXG4gICAgY2JzID0gY2JzXG4gICAgICAubWFwKGZ1bmN0aW9uIChjYikge1xuICAgICAgICByZXR1cm4gY2IoZnBzLCBsYXN0KSAmJiBjYjtcbiAgICAgIH0pXG4gICAgICAuZmlsdGVyKGZ1bmN0aW9uIChjYikge1xuICAgICAgICByZXR1cm4gY2I7XG4gICAgICB9KTtcblxuICAgIGxhc3QgPSArbmV3IERhdGUoKTtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUobG9vcCk7XG4gIH0pKCk7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChjYikge1xuICAgIGNicy5wdXNoKGNiKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gRnJhbWUoKSB7XG4gIGNvbnN0IGZyYW1lTG9vcCA9IEZyYW1lTG9vcCgrbmV3IERhdGUoKSk7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChjYikge1xuICAgIGZyYW1lTG9vcChmdW5jdGlvbiAoZnBzLCBsYXN0VXBkYXRlVGltZSkge1xuICAgICAgY29uc3QgZWxhcHNlZCA9IGdldERlbHRhVGltZSgrbmV3IERhdGUoKSwgbGFzdFVwZGF0ZVRpbWUpO1xuICAgICAgcmV0dXJuIGNiKGVsYXBzZWQsIGZwcyk7XG4gICAgfSk7XG4gIH1cbn1cbiIsIi8qKlxuICogQ3JlYXRlZCBieSBTaGF1biBvbiA1LzEvMTQuXG4gKi9cblxudmFyIElNQUdFX1dBSVRfSU5URVJWQUwgPSAxMDA7XG5cbmZ1bmN0aW9uIHdhaXRGb3JJbWFnZSAoaW1hZ2UpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgIHZhciBpbnRlcnZhbElkID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgICBpZihpbWFnZS5jb21wbGV0ZSkge1xuICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsSWQpO1xuICAgICAgICByZXNvbHZlKGltYWdlKTtcbiAgICAgIH1cbiAgICB9LCBJTUFHRV9XQUlUX0lOVEVSVkFMKTtcblxuICAgIGltYWdlLm9uZXJyb3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBjbGVhckludGVydmFsKGludGVydmFsSWQpO1xuICAgICAgcmVqZWN0KCk7XG4gICAgfTtcbiAgfSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdldEltYWdlICh1cmkpIHtcbiAgdmFyIGltYWdlLCBwcm9taXNlO1xuXG4gIGltYWdlID0gbmV3IEltYWdlKCk7XG4gIGltYWdlLnNyYyA9IHVyaTtcblxuICBwcm9taXNlID0gd2FpdEZvckltYWdlKGltYWdlKTtcblxuICByZXR1cm4gcHJvbWlzZTtcbn1cbiIsIi8qKlxuICogQ3JlYXRlZCBieSBzaGF1bndlc3Qgb24gNi8yOC8xNS5cbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBJbnB1dCgpIHtcbiAgdmFyIGtleXMgPSB7fTtcblxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uIChldmVudCkge1xuICAgIGtleXNbZXZlbnQua2V5Q29kZV0gPSB0cnVlO1xuICB9KTtcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAga2V5c1tldmVudC5rZXlDb2RlXSA9IGZhbHNlO1xuICB9KTtcblxuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBrZXlzO1xuICB9O1xufVxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgU2hhdW4gb24gMi8xLzE1XHJcbiAqIEJhc2VkIG9uIHRoZSBqYWNrMmQgQ2hyb25vIG9iamVjdFxyXG4gKiBcclxuICovXHJcblxyXG5pbXBvcnQgVXRpbCBmcm9tICcuL3V0aWwuanMnO1xyXG5pbXBvcnQge21lcmdlT2JqZWN0fSBmcm9tICcuL2NvbW1vbi5qcyc7XHJcblxyXG52YXIgaW5zdGFuY2U7XHJcbnZhciBPTkVfU0VDT05EID0gMTAwMDtcclxuXHJcbi8vIGdldCByaWQgb2YgaW5zdGFuY2Ugc3R1ZmYuIEp1c3QgdXNlIHRoZSBkaSBjb250YWluZXIncyByZWdpc3RlclNpbmdsZXRvbi91c2VcclxuZnVuY3Rpb24gU2NoZWR1bGVyKGNiLCByYXRlKSB7XHJcbiAgaWYoIWluc3RhbmNlKSB7XHJcbiAgICBpbnN0YW5jZSA9IGNyZWF0ZSgpO1xyXG4gIH1cclxuICBpZihjYikge1xyXG4gICAgaW5zdGFuY2Uuc2NoZWR1bGUoY2IsIHJhdGUpO1xyXG4gIH1cclxuICByZXR1cm4gaW5zdGFuY2U7XHJcbn1cclxuXHJcblNjaGVkdWxlci5pbnN0YW5jZSA9IGNyZWF0ZTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZSgpIHtcclxuICByZXR1cm4gbWVyZ2VPYmplY3Qoe1xyXG4gICAgc2NoZWR1bGVkOiBbXSxcclxuICAgIHNjaGVkdWxlOiBzY2hlZHVsZSxcclxuICAgIHVuc2NoZWR1bGU6IHVuc2NoZWR1bGUsXHJcbiAgICBzdGFydDogc3RhcnQsXHJcbiAgICBzdG9wOiBzdG9wLFxyXG4gICAgZnJhbWU6IGZyYW1lLFxyXG4gICAgaWQ6IGlkXHJcbiAgfSkuc3RhcnQoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2NoZWR1bGUoY2IsIHJhdGUpIHtcclxuICBmdW5jdGlvbiBzZXRSYXRlKG5ld1JhdGUpIHtcclxuICAgIHJhdGUgPSBuZXdSYXRlO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gbWFrZUZyYW1lKCkge1xyXG4gICAgdmFyIGNvdW50ID0gMSxcclxuICAgICAgdG90YWxEZWx0YVRpbWUgPSAwO1xyXG5cclxuICAgIHJldHVybiBmdW5jdGlvbihkZWx0YVRpbWUpIHtcclxuICAgICAgdG90YWxEZWx0YVRpbWUgKz0gZGVsdGFUaW1lO1xyXG4gICAgICBpZihjb3VudCAhPT0gcmF0ZSkge1xyXG4gICAgICAgIGNvdW50Kys7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIGNiKHRvdGFsRGVsdGFUaW1lLCBzZXRSYXRlKTtcclxuICAgICAgY291bnQgPSAxO1xyXG4gICAgICB0b3RhbERlbHRhVGltZSA9IDA7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgaWYoIVV0aWwuaXNGdW5jdGlvbihjYikpIHtcclxuICAgIFV0aWwuZXJyb3IoJ1NjaGVkdWxlcjogb25seSBmdW5jdGlvbnMgY2FuIGJlIHNjaGVkdWxlZC4nKTtcclxuICB9XHJcbiAgcmF0ZSA9IHJhdGUgfHwgMTtcclxuXHJcbiAgdGhpcy5zY2hlZHVsZWQucHVzaChtYWtlRnJhbWUoKSk7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpZCgpIHtcclxuICByZXR1cm4gdGhpcy5zY2hlZHVsZWQubGVuZ3RoO1xyXG59XHJcblxyXG5mdW5jdGlvbiB1bnNjaGVkdWxlKGlkKSB7XHJcbiAgdGhpcy5zY2hlZHVsZWQuc3BsaWNlKGlkIC0gMSwgMSk7XHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHN0YXJ0KCkge1xyXG4gIGlmKHRoaXMucnVubmluZykge1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBtZXJnZU9iamVjdCh7XHJcbiAgICBhY3R1YWxGcHM6IDAsXHJcbiAgICB0aWNrczogMCxcclxuICAgIGVsYXBzZWRTZWNvbmRzOiAwLFxyXG4gICAgcnVubmluZzogdHJ1ZSxcclxuICAgIGxhc3RVcGRhdGVUaW1lOiBuZXcgRGF0ZSgpLFxyXG4gICAgb25lU2Vjb25kVGltZXJJZDogd2luZG93LnNldEludGVydmFsKG9uT25lU2Vjb25kLmJpbmQodGhpcyksIE9ORV9TRUNPTkQpXHJcbiAgfSwgdGhpcyk7XHJcblxyXG4gIHJldHVybiB0aGlzLmZyYW1lKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHN0b3AoKSB7XHJcbiAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XHJcbiAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5vbmVTZWNvbmRUaW1lcklkKTtcclxuICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5hbmltYXRpb25GcmFtZUlkKTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNsZWFyKCkge1xyXG4gIHRoaXMuc2NoZWR1bGVkLmxlbmd0aCA9IDA7XHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGZyYW1lKCkge1xyXG4gIGV4ZWN1dGVGcmFtZUNhbGxiYWNrcy5iaW5kKHRoaXMpKGdldERlbHRhVGltZS5iaW5kKHRoaXMpKCkpO1xyXG4gIHRoaXMudGlja3MrKztcclxuXHJcbiAgaWYodGhpcy5ydW5uaW5nKSB7XHJcbiAgICB0aGlzLmFuaW1hdGlvbkZyYW1lSWQgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZyYW1lLmJpbmQodGhpcykpO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG9uT25lU2Vjb25kKCkge1xyXG4gIHRoaXMuYWN0dWFsRnBzID0gdGhpcy50aWNrcztcclxuICB0aGlzLnRpY2tzID0gMDtcclxuICB0aGlzLmVsYXBzZWRTZWNvbmRzKys7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGV4ZWN1dGVGcmFtZUNhbGxiYWNrcyhkZWx0YVRpbWUpIHtcclxuICB2YXIgc2NoZWR1bGVkID0gdGhpcy5zY2hlZHVsZWQ7XHJcblxyXG4gIGZvcih2YXIgaSA9IDAsIG51bVNjaGVkdWxlZCA9IHNjaGVkdWxlZC5sZW5ndGg7IGkgPCBudW1TY2hlZHVsZWQ7IGkrKykge1xyXG4gICAgc2NoZWR1bGVkW2ldKGRlbHRhVGltZSk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXREZWx0YVRpbWUoKSB7XHJcbiAgdmFyIG5vdyA9ICtuZXcgRGF0ZSgpO1xyXG4gIHZhciBkZWx0YVRpbWUgPSAobm93IC0gdGhpcy5sYXN0VXBkYXRlVGltZSkgLyBPTkVfU0VDT05EO1xyXG5cclxuICB0aGlzLmxhc3RVcGRhdGVUaW1lID0gbm93O1xyXG5cclxuICByZXR1cm4gZGVsdGFUaW1lO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBTY2hlZHVsZXI7XHJcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBzaGF1bndlc3Qgb24gNi8xMS8xNS5cbiAqL1xuXG5cbmltcG9ydCBWYWx2ZSBmcm9tICcuLi92YWx2ZS5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGZldGNoSlNPTih1cmkpIHtcbiAgLy9yZXR1cm4gVmFsdmUuY3JlYXRlKGZldGNoKHVyaSkudGhlbihyZXNwb25zZSA9PiByZXNwb25zZS5qc29uKCkpKTtcbiAgcmV0dXJuIGZldGNoKHVyaSkudGhlbihyZXNwb25zZSA9PiByZXNwb25zZS5qc29uKCkpO1xufSIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IFNoYXVuIG9uIDQvMjMvMjAxNS5cclxuICovXHJcblxyXG52YXIgdHlwZXMgPSBbJ0FycmF5JywgJ09iamVjdCcsICdCb29sZWFuJywgJ0FyZ3VtZW50cycsICdGdW5jdGlvbicsICdTdHJpbmcnLCAnTnVtYmVyJywgJ0RhdGUnLCAnUmVnRXhwJ107XHJcblxyXG52YXIgVXRpbCA9IHtcclxuICBpc0RlZmluZWQ6IGZ1bmN0aW9uICh2YWx1ZSkgeyByZXR1cm4gdHlwZW9mIHZhbHVlICE9ICd1bmRlZmluZWQnIH0sXHJcbiAgZGVmOiBmdW5jdGlvbiAodmFsdWUsIGRlZmF1bHRWYWx1ZSkgeyByZXR1cm4gKHR5cGVvZiB2YWx1ZSA9PSAndW5kZWZpbmVkJykgPyBkZWZhdWx0VmFsdWUgOiB2YWx1ZSB9LFxyXG4gIGVycm9yOiBmdW5jdGlvbiAobWVzc2FnZSkgeyB0aHJvdyBuZXcgRXJyb3IoaWQgKyAnOiAnICsgbWVzc2FnZSkgfSxcclxuICB3YXJuOiBmdW5jdGlvbiAobWVzc2FnZSkgeyBVdGlsLmxvZygnV2FybmluZzogJyArIG1lc3NhZ2UpIH0sXHJcbiAgbG9nOiBmdW5jdGlvbiAobWVzc2FnZSkgeyBpZihjb25maWcubG9nKSB7IGNvbnNvbGUubG9nKGlkICsgJzogJyArIG1lc3NhZ2UpIH0gfSxcclxuICBhcmdzVG9BcnJheTogZnVuY3Rpb24gKGFyZ3MpIHsgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3MpIH0sXHJcbiAgcmFuZDogZnVuY3Rpb24gKG1heCwgbWluKSB7IC8vIG1vdmUgdG8gZXh0cmE/XHJcbiAgICBtaW4gPSBtaW4gfHwgMDtcclxuICAgIGlmKG1pbiA+IG1heCkgeyBVdGlsLmVycm9yKCdyYW5kOiBpbnZhbGlkIHJhbmdlLicpOyB9XHJcbiAgICByZXR1cm4gTWF0aC5mbG9vcigoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSkpICsgKG1pbik7XHJcbiAgfVxyXG59O1xyXG5cclxuZm9yKHZhciBpID0gMDsgaSA8IHR5cGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgVXRpbFsnaXMnICsgdHlwZXNbaV1dID0gKGZ1bmN0aW9uKHR5cGUpIHtcclxuICAgIHJldHVybiBmdW5jdGlvbihvYmopIHtcclxuICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09ICdbb2JqZWN0ICcgKyB0eXBlICsgJ10nO1xyXG4gICAgfTtcclxuICB9KSh0eXBlc1tpXSk7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFV0aWw7IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IHNoYXVud2VzdCBvbiA2LzIwLzE1LlxuICpcbiAqIFRPRE86IGRpc3Bvc2UoKVxuICovXG5cbi8qKlxuICpcbnZhciB2YWx2ZSA9IFZhbHZlLmNyZWF0ZShmdW5jdGlvbiAoZW1pdCwgZXJyb3IpIHtcbiAgc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuICAgIGVycm9yKCdoZWxsbycpO1xuICB9LCA1MDApO1xufSkudGhlbihmdW5jdGlvbiAobXNnKSB7XG4gIHJldHVybiBtc2cgKyAnIFNoYXVuJztcbn0pLnRoZW4oZnVuY3Rpb24gKG5ld01zZykge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcbiAgICBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgICByZXNvbHZlKG5ld01zZyArICchISEhJyk7XG4gICAgfSwgNTAwKTtcbiAgfSk7XG59KS50aGVuKFxuICBmdW5jdGlvbiAobmV3ZXJNc2cpIHtcbiAgICBjb25zb2xlLmxvZyhuZXdlck1zZyk7XG4gIH0sIGZ1bmN0aW9uIChtc2cpIHtcbiAgICBjb25zb2xlLmxvZyhtc2cpO1xuICB9KTtcbiovXG5cbmZ1bmN0aW9uIGNsb25lQXJyYXkoYXJyYXkpIHtcbiAgcmV0dXJuIGFycmF5LnNsaWNlKDApO1xufVxuXG5mdW5jdGlvbiBoYW5kbGVBbGwodGhlbmFibGVzLCBkb0FwcGx5KSB7XG4gIHJldHVybiBWYWx2ZS5jcmVhdGUoZnVuY3Rpb24gKGVtaXQpIHtcbiAgICB2YXIgY291bnQgPSB0aGVuYWJsZXMubGVuZ3RoO1xuICAgIHZhciB2YWx1ZXMgPSBbXTtcblxuICAgIGZ1bmN0aW9uIGNoZWNrQ291bnQoKSB7XG4gICAgICBpZigtLWNvdW50ID09PSAwKSB7XG4gICAgICAgIChkb0FwcGx5KSA/XG4gICAgICAgICAgZW1pdC5hcHBseShudWxsLCB2YWx1ZXMpIDpcbiAgICAgICAgICBlbWl0KHZhbHVlcyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhlbmFibGVzLmZvckVhY2goZnVuY3Rpb24gKHRoZW5hYmxlLCBpbmRleCkge1xuICAgICAgaWYoIXRoZW5hYmxlKSB7XG4gICAgICAgIHRocm93ICdJbXBsZW1lbnQgZXJyb3Igc2NlbmFyaW8nO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmKCF0aGVuYWJsZS50aGVuKSB7XG4gICAgICAgIHZhbHVlc1tpbmRleF0gPSB0aGVuYWJsZTtcbiAgICAgICAgY2hlY2tDb3VudCgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRoZW5hYmxlLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHZhbHVlc1tpbmRleF0gPSB2YWx1ZTtcbiAgICAgICAgY2hlY2tDb3VudCgpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pXG59XG5cbmZ1bmN0aW9uIGl0ZXJhdGUoaXRlcmF0b3IsIHZhbHVlLCBhdHRhY2hlZCwgZmFpbGVkKSB7XG4gIGxldCBpdGVtID0gaXRlcmF0b3IubmV4dCgpO1xuICBpZiAoaXRlbS5kb25lKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgbGV0IGxpc3RlbmVyID0gKGZhaWxlZCkgP1xuICAgIGl0ZW0udmFsdWUuZmFpbCA6XG4gICAgaXRlbS52YWx1ZS5zdWNjZXNzO1xuXG4gIGlmICh2YWx1ZSAmJiB2YWx1ZS50aGVuKSB7XG4gICAgaWYodmFsdWUuYXR0YWNoZWQpIHtcbiAgICAgIGF0dGFjaGVkID0gYXR0YWNoZWQuY29uY2F0KHZhbHVlLmF0dGFjaGVkKTtcbiAgICB9XG5cbiAgICB2YWx1ZS50aGVuKFxuICAgICAgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIGl0ZXJhdGUoaXRlcmF0b3IsIGxpc3RlbmVyLmFwcGx5KG51bGwsIFt2YWx1ZV0uY29uY2F0KGF0dGFjaGVkKSksIGF0dGFjaGVkLCBmYWlsZWQpO1xuICAgICAgfSxcbiAgICAgIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICBpdGVyYXRlKGl0ZXJhdG9yLCBsaXN0ZW5lci5hcHBseShudWxsLCBbdmFsdWVdLmNvbmNhdChhdHRhY2hlZCkpLCBhdHRhY2hlZCwgdHJ1ZSk7XG4gICAgICB9XG4gICAgKTtcbiAgICByZXR1cm47XG4gIH1cbiAgaXRlcmF0ZShpdGVyYXRvciwgbGlzdGVuZXIuYXBwbHkobnVsbCwgW3ZhbHVlXS5jb25jYXQoYXR0YWNoZWQpKSwgYXR0YWNoZWQsIGZhaWxlZCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFZhbHZlIHtcbiAgY29uc3RydWN0b3IoZXhlY3V0b3IpIHtcbiAgICB0aGlzLnN0YXJ0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLmF0dGFjaGVkID0gW107XG4gICAgdGhpcy5saXN0ZW5lcnMgPSBbXTtcbiAgICB0aGlzLmV4ZWN1dG9yID0gZXhlY3V0b3I7XG4gIH1cblxuICBleGVjdXRlKCkge1xuICAgIC8vIEl0ZXJhdGUgb3ZlciBsaXN0ZW5lcnMgb24gbmV4dCBydW4gb2ZcbiAgICAvLyB0aGUganMgZXZlbnQgbG9vcFxuICAgIC8vIFRPRE86IG5vZGUgc3VwcG9ydFxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5leGVjdXRvcihcbiAgICAgICAgLy8gRW1pdFxuICAgICAgICAodmFsdWUpID0+IHtcbiAgICAgICAgICBpdGVyYXRlKHRoaXMubGlzdGVuZXJzW1N5bWJvbC5pdGVyYXRvcl0oKSwgdmFsdWUsIHRoaXMuYXR0YWNoZWQpO1xuICAgICAgICB9LFxuICAgICAgICAvLyBFcnJvclxuICAgICAgICAodmFsdWUpID0+IHtcbiAgICAgICAgICBpdGVyYXRlKHRoaXMubGlzdGVuZXJzW1N5bWJvbC5pdGVyYXRvcl0oKSwgdmFsdWUsIHRoaXMuYXR0YWNoZWQsIHRydWUpO1xuICAgICAgICB9XG4gICAgICApO1xuICAgIH0sIDEpO1xuICB9XG5cbiAgLy9UT0RPOiBlcnJvciBzY2VuYXJpb1xuICBzdGF0aWMgY3JlYXRlKGV4ZWN1dG9yKSB7XG4gICAgaWYoZXhlY3V0b3IudGhlbikge1xuICAgICAgcmV0dXJuIG5ldyBWYWx2ZShmdW5jdGlvbiAoZW1pdCkge1xuICAgICAgICBleGVjdXRvci50aGVuKGVtaXQpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVmFsdmUoZXhlY3V0b3IpO1xuICB9XG5cbiAgLy9UT0RPOiBlcnJvciBzY2VuYXJpb1xuICBzdGF0aWMgYWxsKHRoZW5hYmxlcykge1xuICAgIHJldHVybiBoYW5kbGVBbGwodGhlbmFibGVzKTtcbiAgfVxuXG4gIHN0YXRpYyBhcHBseUFsbCh0aGVuYWJsZXMpIHtcbiAgICByZXR1cm4gaGFuZGxlQWxsKHRoZW5hYmxlcywgdHJ1ZSk7XG4gIH1cblxuICBjbG9uZShvblN1Y2Nlc3MsIG9uRmFpbHVyZSkge1xuICAgIHZhciBuZXdWYWx2ZSA9IG5ldyBWYWx2ZSh0aGlzLmV4ZWN1dG9yKTtcbiAgICBuZXdWYWx2ZS5saXN0ZW5lcnMgPSBjbG9uZUFycmF5KHRoaXMubGlzdGVuZXJzKTtcbiAgICBuZXdWYWx2ZS5hdHRhY2hlZCA9IGNsb25lQXJyYXkodGhpcy5hdHRhY2hlZCk7XG4gICAgbmV3VmFsdmUuc3RhcnRlZCA9IHRoaXMuc3RhcnRlZDtcbiAgICByZXR1cm4gKG9uU3VjY2VzcykgPyBuZXdWYWx2ZS50aGVuKG9uU3VjY2Vzcywgb25GYWlsdXJlKSA6IG5ld1ZhbHZlO1xuICB9XG5cbiAgYXR0YWNoKHZhbHVlKSB7XG4gICAgdGhpcy5hdHRhY2hlZC5wdXNoKHZhbHVlKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHRoZW4ob25TdWNjZXNzLCBvbkZhaWx1cmUpIHtcbiAgICBpZih0eXBlb2Ygb25TdWNjZXNzICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyAnVmFsdmU6IHRoZW4oKSByZXF1aXJlcyBhIGZ1bmN0aW9uIGFzIGZpcnN0IGFyZ3VtZW50LidcbiAgICB9XG4gICAgdGhpcy5saXN0ZW5lcnMucHVzaCh7XG4gICAgICBzdWNjZXNzOiBvblN1Y2Nlc3MsXG4gICAgICBmYWlsOiBvbkZhaWx1cmUgfHwgZnVuY3Rpb24gKHZhbHVlKSB7IHJldHVybiB2YWx1ZTsgfVxuICAgIH0pO1xuXG4gICAgaWYoIXRoaXMuc3RhcnRlZCkge1xuICAgICAgdGhpcy5leGVjdXRlKCk7XG4gICAgICB0aGlzLnN0YXJ0ZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IHNoYXVud2VzdCBvbiA3LzgvMTUuXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGZsaXAgKGZuKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmdzLnJldmVyc2UoKSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBvc2UgKC4uLmZucykge1xuICByZXR1cm4gZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgIHJldHVybiBmbnMucmVkdWNlUmlnaHQoZnVuY3Rpb24gKHJlc3VsdCwgZm4pIHtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoaXMsIHJlc3VsdCk7XG4gICAgfSwgcmVzdWx0KTtcbiAgfTtcbn1cblxuZXhwb3J0IHZhciBzZXF1ZW5jZSA9IGZsaXAoY29tcG9zZSk7XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgc2hhdW53ZXN0IG9uIDUvOS8xNS5cbiAqL1xuXG5pbXBvcnQgZmV0Y2hKU09OIGZyb20gJy4uL2VuZ2luZS9zY2hlbWEvZmV0Y2gtc2NoZW1hLmpzJztcbmltcG9ydCBnZXRJbWFnZSBmcm9tICcuLi9lbmdpbmUvaW1hZ2UtbG9hZGVyLmpzJztcbmltcG9ydCBnZXRTcHJpdGVTY2hlbWEgZnJvbSAnLi4vc2NoZW1hL3Nwcml0ZS1zY2hlbWEuanMnO1xuaW1wb3J0IHNwcml0ZUFuaW1hdGlvbiBmcm9tICcuLi9hbmltYXRpb24vc3ByaXRlLWFuaW1hdGlvbi5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdldFNjZW5lU2NoZW1hKHVyaSkge1xuICByZXR1cm4gZmV0Y2hKU09OKHVyaSlcbiAgICAudGhlbihmdW5jdGlvbiAoc2NlbmUpIHtcbiAgICAgIHJldHVybiBnZXRJbWFnZShzY2VuZS5iYWNrZ3JvdW5kLmJhY2tncm91bmRVcmwpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uIChiYWNrZ3JvdW5kSW1hZ2UpIHtcbiAgICAgICAgICBzY2VuZS5iYWNrZ3JvdW5kSW1hZ2UgPSBiYWNrZ3JvdW5kSW1hZ2U7XG4gICAgICAgICAgcmV0dXJuIGdldFNwcml0ZVR5cGVzKHNjZW5lLnNwcml0ZXMpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoc3ByaXRlcykge1xuICAgICAgICAgICAgICBzY2VuZS5zcHJpdGVzID0gc3ByaXRlcztcbiAgICAgICAgICAgICAgcmV0dXJuIHNjZW5lO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0pXG4gICAgLnRoZW4oZnVuY3Rpb24gKHNjZW5lKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmZyZWV6ZShzY2VuZSk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFNwcml0ZVR5cGVzKHNwcml0ZXMpIHtcbiAgcmV0dXJuIFByb21pc2UuYWxsKHNwcml0ZXMubWFwKGdldFNwcml0ZVR5cGUpKTtcbn1cblxuZnVuY3Rpb24gZ2V0U3ByaXRlVHlwZShzcHJpdGUpIHtcbiAgcmV0dXJuIGdldFNwcml0ZVNjaGVtYShzcHJpdGUuc3JjVXJsKVxuICAgIC50aGVuKGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgIHNwcml0ZS50eXBlID0gdHlwZTtcbiAgICAgIC8vc3ByaXRlLmFuaW1hdGlvbiA9IHNwcml0ZUFuaW1hdGlvbih0eXBlLmZyYW1lU2V0KTtcbiAgICAgIHNwcml0ZS5hbmltYXRpb24gPSB7fTtcbiAgICAgIHNwcml0ZS52ZWxvY2l0eSA9IHsgeDogMCwgeTogMCB9O1xuICAgICAgc3ByaXRlLmFjY2VsZXJhdGlvbiA9IHsgeDogMCwgeTogMCB9O1xuICAgICAgc3ByaXRlLm1heFZlbG9jaXR5ID0geyB4OiA1MDAsIHk6IDUwMCB9O1xuICAgICAgc3ByaXRlLmZyaWN0aW9uID0geyB4OiAwLjk5LCB5OiAwLjUwIH07XG4gICAgICByZXR1cm4gc3ByaXRlO1xuICAgIH0pO1xufVxuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IHNoYXVud2VzdCBvbiA1LzkvMTUuXG4gKi9cblxuaW1wb3J0IGZyYW1lU2V0IGZyb20gJy4uL2FuaW1hdGlvbi9mcmFtZS1zZXQuanMnO1xuaW1wb3J0IGZldGNoSlNPTiBmcm9tICcuLi9lbmdpbmUvc2NoZW1hL2ZldGNoLXNjaGVtYS5qcyc7XG5pbXBvcnQgZ2V0SW1hZ2UgZnJvbSAnLi4vZW5naW5lL2ltYWdlLWxvYWRlci5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdldFNwcml0ZVNjaGVtYSh1cmkpIHtcbiAgcmV0dXJuIGZldGNoSlNPTih1cmkpXG4gICAgLnRoZW4oZnVuY3Rpb24gKHNwcml0ZSkge1xuICAgICAgcmV0dXJuIGdldEltYWdlKHNwcml0ZS5zcHJpdGVTaGVldFVybClcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHNwcml0ZVNoZWV0KSB7XG4gICAgICAgICAgc3ByaXRlLnNwcml0ZVNoZWV0ID0gc3ByaXRlU2hlZXQ7XG4gICAgICAgICAgc3ByaXRlLmZyYW1lU2V0ID0gZnJhbWVTZXQoc3ByaXRlLCBzcHJpdGVTaGVldCk7XG4gICAgICAgICAgcmV0dXJuIHNwcml0ZTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgc2hhdW53ZXN0IG9uIDUvNC8xNS5cbiAqL1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIHg6IDAsXG4gIHk6IDAsXG4gIG1hcmdpbkxlZnQ6IDY0LFxuICBtYXJnaW5SaWdodDogNjQsXG4gIHdpZHRoOiAzMDAsXG4gIGhlaWdodDogNDAwXG59OyJdfQ==

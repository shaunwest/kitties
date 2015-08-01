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

function log(msg) {}

/*
function collisions(sprite, colliders) {
  const dirY = sprite.y - sprite.lastY;
  const dirX = sprite.x - sprite.lastX;

  colliders.forEach(function (collider) {
    let intersects, diffX, diffY;

    intersects = segmentIntersectsSegment(collider, sprite.x, sprite.y, sprite.x, sprite.y + sprite.height); // left
    if (intersects) {
      log('left', intersects);
      if(dirY < 0)
        sprite.y = intersects.y + 1;
      else if(dirY > 0)
        sprite.y = intersects.y - sprite.height - 1;
    }

    if(intersects = segmentIntersectsSegment(collider, sprite.x + sprite.width, sprite.y, sprite.x + sprite.width, sprite.y + sprite.height)) {// right
      log('right', intersects);
      if(dirY < 0)
        sprite.y = intersects.y + 1;
      else if(dirY > 0)
        sprite.y = intersects.y - sprite.height - 1;
    }


    if(!collider.slope) {
      intersects = segmentIntersectsSegment(collider, sprite.x, sprite.y, sprite.x + sprite.width, sprite.y); // top
      if (intersects) {
        log('top', intersects);
        if(dirX < 0)
          sprite.x = intersects.x + 1;
        else if(dirX > 0)
          sprite.x = intersects.x - sprite.width - 1;
      }

      if (intersects = segmentIntersectsSegment(collider, sprite.x, sprite.y + sprite.height, sprite.x + sprite.width, sprite.y + sprite.height)) { // bottom
        log('bottom', intersects);
        if(dirX < 0)
          sprite.x = intersects.x + 1;
        else if(dirX > 0)
          sprite.x = intersects.x - sprite.width - 1;
      }
    }
  });
}
*/

/*
function collisions(sprite, colliders) {
  return colliders.reduce(function (collisions, collider) {
    let intersects, x = collisions.x, y = collisions.y;

    intersects = segmentIntersectsSegment(collider, sprite.x, sprite.y, sprite.x, sprite.y + sprite.height); // left
    if (intersects) {
      y = intersects.y;
    }

    if(intersects = segmentIntersectsSegment(collider, sprite.x + sprite.width, sprite.y, sprite.x + sprite.width, sprite.y + sprite.height)) {// right
      y = intersects.y;
    }

    if(!collider.slope) {
      intersects = segmentIntersectsSegment(collider, sprite.x, sprite.y, sprite.x + sprite.width, sprite.y); // top
      if (intersects) {
        x = intersects.x;
      }

      if (intersects = segmentIntersectsSegment(collider, sprite.x, sprite.y + sprite.height, sprite.x + sprite.width, sprite.y + sprite.height)) { // bottom
        x = intersects.x;
      }
    }

    collisions.x = x;
    collisions.y = y;

    return collisions;
  }, {x: null, y: null});
}
*/

/*
function getCollisions(sprite, colliders) {
  return colliders.reduce(function (collisions, collider) {
    let intersects;
    const xMin = sprite.x;
    const yMin = sprite.y;
    const xMax = xMin + sprite.width;
    const yMax = yMin + sprite.height;

    // LEFT
    if (intersects = segmentIntersectsSegment(collider, xMin, yMin, xMin, yMax)) {
      collisions.push(intersects);
    }

    // RIGHT
    if(intersects = segmentIntersectsSegment(collider, xMax, yMin, xMax, yMax)) {
      collisions.push(intersects);
    }

    // TOP
    if (intersects = segmentIntersectsSegment(collider, xMin, yMin, xMax, yMin)) {
      collisions.push(intersects);
    }

    // BOTTOM
    if (intersects = segmentIntersectsSegment(collider, xMin, yMax, xMax, yMax)) {
      collisions.push(intersects);
    }

    return collisions;
  }, []);
}
*/

function getCollisions(rect, colliders) {
  return colliders.filter(function (collider) {
    return !(rect.x > collider.x + collider.width || rect.x + rect.width < collider.x || rect.y > collider.y + collider.height || rect.y + rect.height < collider.y);
  });
}

/*
function getProjectionVector(colliders, rect, xDir, yDir) {
  return colliders.reduce(function (vector, collider) {
    let xDiff = 0;
    let yDiff = 0;

    if (xDir < 0)
      xDiff = (collider.x + collider.width) - rect.x;
    else if (xDir > 0)
      xDiff = collider.x - (rect.x + rect.width);

    if (yDir < 0)
      yDiff = (collider.y + collider.height) - rect.y;
    else if (yDir > 0)
      yDiff = collider.y - (rect.y + rect.height);

    if (xDiff && yDiff) {
      if (Math.abs(xDiff) <= Math.abs(yDiff)) {
        vector.x = xDiff;
      }
      else {
        vector.y = yDiff;
      }
    } else if (xDiff) {
      vector.x = xDiff;
    } else if (yDiff) {
      vector.y = yDiff;
    }

    return vector;
  }, { x: 0, y: 0 });
}
*/

function getOverlaps(colliders, rect) {
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

function getFoo4(overlaps) {
  var resolution = overlaps.reduce(function (resolution, overlap) {
    var x = overlap.x,
        y = overlap.y;

    if (x === 0 || y === 0) {
      return resolution;
    }

    if (Math.abs(x) > Math.abs(y)) {
      if (Math.abs(y) < Math.abs(resolution.y) && x !== resolution.lastX && y !== resolution.lastY) {
        resolution.y = y;
      }
    } else {
      if (Math.abs(x) < Math.abs(resolution.x) && y !== resolution.lastY && x !== resolution.lastX) {
        resolution.x = x;
      }
    }

    resolution.lastX = x;
    resolution.lastY = y;

    console.log('x, y = ', x, y);
    console.log(resolution);

    return resolution;
  }, { x: 999999, y: 999999, lastX: null, lastY: null });

  return resolution;
}

function getFoo2(overlaps) {
  var resolution = overlaps.reduce(function (resolution, overlap) {
    var x = Math.abs(overlap.xMax) < Math.abs(overlap.xMin) ? overlap.xMax : overlap.xMin;

    var y = Math.abs(overlap.yMax) < Math.abs(overlap.yMin) ? overlap.yMax : overlap.yMin;

    if (x === 0 || y === 0) {
      return resolution;
    }

    if (Math.abs(x) < Math.abs(y)) {
      //if (typeof resolution.Y.y === 'undefined' || (Math.abs(y) > Math.abs(resolution.Y.y) && y !== resolution.X.y)) {
      //if (Math.abs(y) > Math.abs(resolution.Y.y) && (resolution.X.y === 0 || y !== resolution.X.y) && (resolution.Y.x === 0 || x !== resolution.Y.x)) {
      //if ((typeof resolution.Y.y === 'undefined' || Math.abs(y) > Math.abs(resolution.Y.y)) && y !== resolution.X.y && x !== resolution.X.x) {
      if (typeof resolution.Y.y === 'undefined' || Math.abs(y) > Math.abs(resolution.Y.y)) {
        resolution.Y.x = x;
        resolution.Y.y = y;
      }
    } else {
      ///if (typeof resolution.X.x === 'undefined' || (Math.abs(x) > Math.abs(resolution.X.x) && x !== resolution.Y.x)) {
      //if (Math.abs(x) > Math.abs(resolution.X.x) && (resolution.Y.y === 0 || y !== resolution.Y.y) && (resolution.X.x === 0 || x !== resolution.X.x)) {
      //if ((typeof resolution.X.x === 'undefined' || Math.abs(x) > Math.abs(resolution.X.x)) && y !== resolution.Y.y && x !== resolution.Y.x) {
      if (typeof resolution.X.x === 'undefined' || Math.abs(x) > Math.abs(resolution.X.x)) {
        resolution.X.x = x;
        resolution.X.y = y;
      }
    }

    console.log('x, y = ', x, y);
    console.log('X ', resolution.X, 'Y', resolution.Y);

    return resolution;
  }, {
    X: {},
    Y: {}
  });

  var x = 0,
      y = 0;
  var X = resolution.X;
  var Y = resolution.Y;

  /*
  if (X.x === 0 && X.y === 0) {
    x = 0;
    y = Y.y;
  }
  else if (Y.x === 0 && Y.y === 0) {
    x = X.x;
    y = 0;
  }
  else {
    x = Y.x;
    y = X.y;
  }
  */

  x = Y.x || 0;
  y = X.y || 0;

  console.log(x, y);

  return { x: x, y: y };
}

function getFoo3(overlaps) {
  var resolution = overlaps.reduce(function (resolution, overlap) {
    var x = Math.abs(overlap.xMax) < Math.abs(overlap.xMin) ? overlap.xMax : overlap.xMin;

    var y = Math.abs(overlap.yMax) < Math.abs(overlap.yMin) ? overlap.yMax : overlap.yMin;

    if (x === 0 || y === 0) {
      return resolution;
    }

    if (Math.abs(x) > Math.abs(y)) {
      if (Math.abs(y) < Math.abs(resolution.y) && x !== resolution.lastX && y !== resolution.lastY) {
        resolution.y = y;
      }
    } else {
      if (Math.abs(x) < Math.abs(resolution.x) && y !== resolution.lastY && x !== resolution.lastX) {
        resolution.x = x;
      }
    }

    resolution.lastX = x;
    resolution.lastY = y;

    console.log('x, y = ', x, y);
    console.log(resolution);

    return resolution;
  }, { x: 999999, y: 999999, lastX: null, lastY: null });

  return resolution;
}

function getFoo(projectionVectors) {
  return projectionVectors.reduce(function (acc, projectionVector) {
    var x = projectionVector.x;
    var xAbs = Math.abs(x);
    var y = projectionVector.y;
    var yAbs = Math.abs(y);

    if (x === acc.xLast) {} else if (y === acc.yLast) {} else {
      acc.xLast = x;
      acc.yLast = y;

      if (xAbs < yAbs) {
        acc.x = projectionVector.x;
      } else {
        acc.y = projectionVector.y;
      }
    }

    return acc;
  }, { x: null, y: null, xLast: null, yLast: null });
}

function getEqualVectors(projectVectors) {
  return projectVectors.reduce(function (acc, projectionVector) {
    if (acc.x === null) {
      acc.x = projectionVector.x;
    } else if (acc.x === projectionVector.x && acc.xMatch !== false) {
      acc.xMatch = true;
    } else {
      acc.xMatch = false;
    }

    if (acc.y === null) {
      acc.y = projectionVector.y;
    } else if (acc.y === projectionVector.y && acc.yMatch !== false) {
      acc.yMatch = true;
    } else {
      acc.yMatch = false;
    }

    return acc;
  }, { x: null, xMatch: null, y: null, yMatch: null });
}

function getFinalVector(projectionVectors) {
  var finalVector = projectionVectors.reduce(function (finalOverlap, projectionVector) {
    if (Math.abs(projectionVector.x) < Math.abs(projectionVector.y)) {
      if (!finalOverlap.x || Math.abs(projectionVector.x) < Math.abs(finalOverlap.x)) {
        finalOverlap.x = projectionVector.x;
      }
    } else {
      if (!finalOverlap.y || Math.abs(projectionVector.y) < Math.abs(finalOverlap.y)) {
        finalOverlap.y = projectionVector.y;
      }
    }

    return finalOverlap;
  }, { x: null, y: null });

  /*if (projectionVectors.length === 1) {
    if (Math.abs(finalVector.x) < Math.abs(finalVector.y)) {
      return {
        x: finalVector.x,
        y: null
      };
    } else {
      return {
        x: null,
        y: finalVector.y
      }
    }
  }
  else {
    return finalVector;
  }*/
  return finalVector;
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

      var x2 = x1;
      var y2 = y1;

      // mutate sprite
      sprite.velocity.x = velocityX;
      sprite.x = x2;
      sprite.velocity.y = velocityY;
      sprite.y = y2;

      //const yDir = sprite.y - sprite.lastY;
      //const xDir = sprite.x - sprite.lastX;

      var collisions = getCollisions(sprite, colliders);
      var overlaps = getOverlaps(collisions, sprite);
      var combined = getCombineds(overlaps);
      var resolution = getResolution(combined);

      sprite.x += resolution.x;
      sprite.y += resolution.y;

      //console.log('Overlaps', overlaps);
      //console.log('Combined', combined);
      //console.log('Resolution', resolution);

      //const projectionVectors = getProjectionVectors(overlaps);
      //const equalVectors = getEqualVectors(projectionVectors);
      //const finalVector = getFinalVector(projectionVectors);
      //const foo = getFoo3(overlaps);

      /*if (Math.abs(xOverlap) < Math.abs(yOverlap)) {
        sprite.x += xOverlap;
      } else {
        sprite.y += yOverlap;
      }*/

      /*if (equalVectors.xMatch) {
        sprite.x += equalVectors.x;
      } else if(equalVectors.yMatch) {
        sprite.y += equalVectors.y;
      } else if(finalVector.x) {
        sprite.x += finalVector.x;
      } else if(finalVector.y) {
        sprite.y += finalVector.y;
      }*/

      /*if (foo.y !== 999999)
        sprite.y += foo.y;
        console.log('y: ' + foo.y);
        if (foo.x !== 999999)
        sprite.x += foo.x;
        console.log('x: ' + foo.x);*/

      //sprite.x += foo.x;
      //console.log(equalVectors);
      //console.log(finalVector);

      /*
      if (finalOverlap.x && !finalOverlap.yMatch) {
        sprite.x += finalOverlap.x;
      }
        if (finalOverlap.y && !finalOverlap.xMatch) {
        sprite.y += finalOverlap.y;
      }*/

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
      //renderLines(context2d, colliders, viewport);
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

// do nothing

// do nothing

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvbWFpbi5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy9hbmltYXRpb24vZnJhbWUtc2V0LmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2FuaW1hdGlvbi9zcHJpdGUtYW5pbWF0aW9uLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2NhbnZhcy1yZW5kZXJlci5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy9lbmdpbmUvY29tbW9uLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9mcmFnbWVudHMuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL2ZyYW1lLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9pbWFnZS1sb2FkZXIuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL2lucHV0LmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2VuZ2luZS9zY2hlZHVsZXIuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL3NjaGVtYS9mZXRjaC1zY2hlbWEuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL3V0aWwuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvZW5naW5lL3ZhbHZlLmpzIiwiL1VzZXJzL3NoYXVud2VzdC9hcHBzL2tpdHRpZXMvc3JjL2Z1bmMuanMiLCIvVXNlcnMvc2hhdW53ZXN0L2FwcHMva2l0dGllcy9zcmMvc2NoZW1hL3NjZW5lLXNjaGVtYS5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy9zY2hlbWEvc3ByaXRlLXNjaGVtYS5qcyIsIi9Vc2Vycy9zaGF1bndlc3QvYXBwcy9raXR0aWVzL3NyYy92aWV3cG9ydC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O3dCQ0l1Qix1QkFBdUI7OzhCQUNuQiwwQkFBMEI7Ozs7cUJBQ25DLG1CQUFtQjs7OztxQkFDbkIsbUJBQW1COzs7O3dCQUNoQixlQUFlOzs7OzJEQUN5QixzQkFBc0I7O3dCQUM1RCxXQUFXOztBQUVsQyxJQUFNLEtBQUssR0FBRyw0QkFBZSx5QkFBeUIsQ0FBQyxDQUFDOztBQUV4RCxTQUFTLHdCQUF3QixDQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFO0FBQ2xFLFNBQU8sQUFBQyxTQUFTLEdBQUcsVUFBVSxHQUFJLFNBQVMsQ0FBQztDQUM3Qzs7QUFFRCxTQUFTLHdCQUF3QixDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUU7QUFDdEQsU0FBTyxTQUFTLEdBQUcsU0FBUyxDQUFDO0NBQzlCOztBQUVELFNBQVMsYUFBYSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFO0FBQ2xELFNBQU8sUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztDQUNuRDs7QUFFRCxTQUFTLElBQUksQ0FBQyxRQUFRLEVBQUUsVUFBVSxFQUFFO0FBQ2xDLFNBQU8sQUFBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLFVBQVUsR0FBSSxDQUFDLEdBQUcsUUFBUSxDQUFDO0NBQ3pEOztBQUVELFNBQVMsYUFBYSxDQUFDLFFBQVEsRUFBRSxXQUFXLEVBQUU7QUFDNUMsU0FBTyxBQUFDLFFBQVEsR0FBRyxDQUFDLEdBQ2xCLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxHQUMvQixJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0NBQ3BDOztBQUVELFNBQVMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUU7QUFDMUQsU0FBTyxRQUFRLEdBQUksWUFBWSxHQUFHLE9BQU8sQUFBQyxDQUFDO0NBQzVDOztBQUVELFNBQVMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUU7QUFDckQsU0FBTyxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLENBQUM7Q0FDbEQ7O0FBRUQsU0FBUyxXQUFXLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUU7QUFDekMsTUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDN0MsVUFBUSxHQUFHLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQzFFLFVBQVEsR0FBRyxhQUFhLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDbEUsU0FBTyxhQUFhLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztDQUN6RDs7QUFFRCxTQUFTLFlBQVksQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUU7QUFDeEQsTUFBTSxHQUFHLEdBQUcsUUFBUSxHQUFHLElBQUksQ0FBQztBQUM1QixTQUFRLFFBQVEsR0FBRyxRQUFRLElBQUksUUFBUSxHQUFHLFFBQVEsSUFDaEQsR0FBRyxHQUFHLFFBQVEsSUFBSSxHQUFHLEdBQUcsUUFBUSxJQUNoQyxDQUFDLENBQUU7Q0FDTjs7Ozs7Ozs7O0FBU0QsU0FBUyxZQUFZLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFO0FBQ3hELE1BQU0sR0FBRyxHQUFHLFFBQVEsR0FBRyxJQUFJLENBQUM7QUFDNUIsU0FBUSxRQUFRLEdBQUcsUUFBUSxJQUFJLEdBQUcsR0FBRyxRQUFRLElBQUksR0FBRyxHQUFHLFFBQVEsSUFDN0QsUUFBUSxHQUFHLFFBQVEsSUFBSSxHQUFHLEdBQUcsUUFBUSxJQUFJLFFBQVEsR0FBRyxRQUFRLElBQzVELENBQUMsQ0FBRTtDQUNOOztBQUVELFNBQVMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRTtBQUNuQyxTQUFPLEdBQUcsR0FBRyxJQUFJLENBQUM7Q0FDbkI7O0FBRUQsU0FBUyxtQkFBbUIsQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRTtBQUMxRCxTQUFPLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVSxRQUFRLEVBQUU7QUFDMUMsV0FBTyxPQUFPLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztHQUM5QyxDQUFDLENBQUM7Q0FDSjs7QUFFRCxTQUFTLE9BQU8sQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRTtBQUM3QyxTQUFRLFFBQVEsR0FBRyxRQUFRLENBQUMsUUFBUSxJQUNsQyxRQUFRLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBRTtDQUNqQzs7QUFFRCxTQUFTLGtCQUFrQixDQUFDLEdBQUcsRUFBRSxXQUFXLEVBQUU7QUFDNUMsU0FBTyxXQUFXLEdBQUcsR0FBRyxDQUFDO0NBQzFCOztBQUVELFNBQVMsa0JBQWtCLENBQUMsR0FBRyxFQUFFLFdBQVcsRUFBRTtBQUM1QyxTQUFPLFdBQVcsR0FBRyxHQUFHLENBQUM7Q0FDMUI7O0FBRUQsU0FBUyx1QkFBdUIsQ0FBQyxTQUFTLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFO0FBQ3hGLFNBQU8sU0FBUyxDQUNiLE1BQU0sQ0FBQyxVQUFVLFFBQVEsRUFBRTtBQUMxQixXQUFRLFFBQVEsR0FBRyxRQUFRLENBQUMsUUFBUSxJQUNsQyxRQUFRLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBRTtHQUNqQyxDQUFDLENBQ0QsR0FBRyxDQUFDLFVBQVUsUUFBUSxFQUFFO0FBQ3ZCLFdBQU87QUFDTCxpQkFBVyxFQUFFLFFBQVEsQ0FBQyxXQUFXLEdBQUcsV0FBVztBQUMvQyxpQkFBVyxFQUFFLFFBQVEsQ0FBQyxXQUFXLEdBQUcsV0FBVztLQUNoRCxDQUFDO0dBQ0gsQ0FBQyxDQUNELE1BQU0sQ0FBQyxVQUFVLElBQUksRUFBRTtBQUN0QixXQUFRLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFFO0dBQ3ZELENBQUMsQ0FDRCxHQUFHLENBQUMsVUFBVSxJQUFJLEVBQUU7QUFDbkIsV0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0dBQ3JELENBQUMsQ0FBQzs7Ozs7Ozs7Q0FRTjs7QUFFRCxTQUFTLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUU7O0FBRTlDLFdBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVSxhQUFhLEVBQUUsUUFBUSxFQUFFO0FBQ2xELFFBQU0sSUFBSSxHQUFHLFlBQVksQ0FDdkIsUUFBUSxFQUNSLElBQUksRUFDSixRQUFRLENBQUMsV0FBVyxFQUNwQixRQUFRLENBQUMsV0FBVyxDQUNyQixDQUFDO0FBQ0YsV0FBTyxBQUFDLElBQUksR0FDUixRQUFRLEdBQUcsSUFBSSxHQUNmLGFBQWEsQ0FBQztHQUNuQixFQUFFLFFBQVEsQ0FBQyxDQUFDO0NBQ2Q7O0FBRUQsU0FBUyxtQkFBbUIsQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFO0FBQzFFLFNBQU8sU0FBUyxDQUNiLE1BQU0sQ0FBQyxVQUFBLFFBQVE7V0FDZCxRQUFRLElBQUksUUFBUSxDQUFDLFFBQVEsSUFBSSxRQUFRLElBQUksUUFBUSxDQUFDLFFBQVE7R0FBQSxDQUMvRCxDQUNBLE1BQU0sQ0FBQyxVQUFDLGFBQWEsRUFBRSxRQUFRLEVBQUs7QUFDbkMsUUFBTSxJQUFJLEdBQUcsWUFBWSxDQUNyQixRQUFRLEVBQ1IsSUFBSSxFQUNKLFFBQVEsQ0FBQyxXQUFXLEVBQ3BCLFFBQVEsQ0FBQyxXQUFXLENBQ3ZCLENBQUM7O0FBRUYsV0FBTyxBQUFDLElBQUksR0FDVixRQUFRLEdBQUcsSUFBSSxHQUNmLGFBQWEsQ0FBQztHQUNqQixFQUFFLFFBQVEsQ0FBQyxDQUFDO0NBQ2hCOztBQUVELFNBQVMsY0FBYyxDQUFDLE1BQU0sRUFBRTtBQUM5QixNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUM1RCxNQUFNLFVBQVUsR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDMUUsUUFBTSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEdBQUcsVUFBVSxDQUFDOztBQUUzQyxTQUFPLFFBQVEsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUE7Q0FDdEM7O0FBRUQsU0FBUyxhQUFhLENBQUMsWUFBWSxFQUFFLFFBQVEsRUFBRTtBQUM3QyxNQUFNLEtBQUssR0FBRyxZQUFZLElBQUksQ0FBQyxDQUFDO0FBQ2hDLFNBQU8sQUFBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUN4QyxLQUFLLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUNqQjs7QUFFRCxTQUFTLFlBQVksQ0FBQyxNQUFNLEVBQUU7QUFDNUIsU0FBTyxLQUFLLENBQUM7Q0FDZDs7QUFFRCxTQUFTLFFBQVEsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFO0FBQ2pDLFNBQU8sUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztDQUMvQjs7QUFFRCxTQUFTLGtCQUFrQixDQUFDLElBQUksRUFBRSxJQUFJLEVBQUU7QUFDdEMsU0FBTyxxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQzdFLHVCQUFxQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7QUFDekUsdUJBQXFCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7QUFDcEcsdUJBQXFCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztDQUN2Rzs7QUFFRCxTQUFTLHFCQUFxQixDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUU7O0FBRW5ELE1BQU0sS0FBSyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFBLElBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQSxBQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUEsSUFBSyxFQUFFLEdBQUcsRUFBRSxDQUFBLEFBQUMsQ0FBQzs7QUFFaEYsTUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFO0FBQ2YsV0FBTyxLQUFLLENBQUM7R0FDZDs7QUFFRCxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFBLElBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQSxBQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUEsSUFBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUEsQUFBQyxDQUFBLEdBQUksS0FBSyxDQUFDLENBQUM7QUFDaEksTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQSxJQUFLLEVBQUUsR0FBRyxFQUFFLENBQUEsQUFBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFBLElBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBLEFBQUMsQ0FBQSxHQUFJLEtBQUssQ0FBQyxDQUFDOztBQUVoSSxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUM5QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUM5QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUM5QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQzs7QUFFOUIsTUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLElBQ3hCLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksRUFBRztBQUN6QixXQUFPLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUM7R0FDckI7O0FBRUQsU0FBTyxLQUFLLENBQUM7Q0FDZDs7QUFFRCxTQUFTLHdCQUF3QixDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUU7QUFDdEQsTUFBSSxVQUFVLEdBQUcscUJBQXFCLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDOztBQUU3RCxNQUFJLENBQUMsVUFBVSxFQUFFO0FBQ2YsV0FBTyxLQUFLLENBQUM7R0FDZDs7QUFFRCxNQUFJLEVBQUUsVUFBVSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUM5QyxVQUFVLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLElBQzFDLFVBQVUsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsSUFDMUMsVUFBVSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFBLEFBQUMsRUFBRTtBQUM3QyxXQUFPLEtBQUssQ0FBQztHQUNkO0FBQ0QsU0FBTyxVQUFVLENBQUM7Q0FDbkI7O0FBRUQsU0FBUyxHQUFHLENBQUMsR0FBRyxFQUFFLEVBRWpCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFxSEQsU0FBUyxhQUFhLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRTtBQUN0QyxTQUFPLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVSxRQUFRLEVBQUU7QUFDMUMsV0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsS0FBSyxJQUN6QyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLENBQUMsSUFDaEMsSUFBSSxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLElBQ3JDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFBLEFBQUMsQ0FBQztHQUN4QyxDQUFDLENBQUM7Q0FDSjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBb0NELFNBQVMsV0FBVyxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUU7QUFDcEMsU0FBTyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsUUFBUSxFQUFFO0FBQ3ZDLFFBQU0sSUFBSSxHQUFHLEFBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsS0FBSyxHQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDcEQsUUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUEsQUFBQyxDQUFDO0FBQ2hELFFBQU0sSUFBSSxHQUFHLEFBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxHQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDckQsUUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUEsQUFBQyxDQUFDO0FBQ2pE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LEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ3JDLFVBQU0sQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQzs7QUFFeEMsVUFBTSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDO0FBQ3ZDLFdBQU8sTUFBTSxDQUFDO0dBQ2YsQ0FBQyxDQUFDO0NBQ047Ozs7Ozs7Ozs7O3FCQ3BDdUIsZUFBZTs7Ozs7d0JBSmxCLDJCQUEyQjs7Ozt5QkFDMUIsa0NBQWtDOzs7O3dCQUNuQywyQkFBMkI7Ozs7QUFFakMsU0FBUyxlQUFlLENBQUMsR0FBRyxFQUFFO0FBQzNDLFNBQU8sdUJBQVUsR0FBRyxDQUFDLENBQ2xCLElBQUksQ0FBQyxVQUFVLE1BQU0sRUFBRTtBQUN0QixXQUFPLHNCQUFTLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FDbkMsSUFBSSxDQUFDLFVBQVUsV0FBVyxFQUFFO0FBQzNCLFlBQU0sQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO0FBQ2pDLFlBQU0sQ0FBQyxRQUFRLEdBQUcsc0JBQVMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0FBQ2hELGFBQU8sTUFBTSxDQUFDO0tBQ2YsQ0FBQyxDQUFDO0dBQ04sQ0FBQyxDQUFDO0NBQ047Ozs7Ozs7Ozs7Ozs7O3FCQ2RjO0FBQ2IsR0FBQyxFQUFFLENBQUM7QUFDSixHQUFDLEVBQUUsQ0FBQztBQUNKLFlBQVUsRUFBRSxFQUFFO0FBQ2QsYUFBVyxFQUFFLEVBQUU7QUFDZixPQUFLLEVBQUUsR0FBRztBQUNWLFFBQU0sRUFBRSxHQUFHO0NBQ1oiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgU2hhdW4gb24gNC8yMy8yMDE1LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7RnJhZ21lbnR9IGZyb20gJy4vZW5naW5lL2ZyYWdtZW50cy5qcyc7XHJcbmltcG9ydCBnZXRTY2VuZVNjaGVtYSBmcm9tICcuL3NjaGVtYS9zY2VuZS1zY2hlbWEuanMnO1xyXG5pbXBvcnQgRnJhbWUgZnJvbSAnLi9lbmdpbmUvZnJhbWUuanMnO1xyXG5pbXBvcnQgSW5wdXQgZnJvbSAnLi9lbmdpbmUvaW5wdXQuanMnO1xyXG5pbXBvcnQgVmlld3BvcnQgZnJvbSAnLi92aWV3cG9ydC5qcyc7XHJcbmltcG9ydCB7Y2xlYXJDb250ZXh0LCByZW5kZXIsIHJlbmRlclJlY3RzLCByZW5kZXJMaW5lc30gZnJvbSAnLi9jYW52YXMtcmVuZGVyZXIuanMnO1xyXG5pbXBvcnQge3NlcXVlbmNlfSBmcm9tICcuL2Z1bmMuanMnO1xyXG5cclxuY29uc3Qgc2NlbmUgPSBnZXRTY2VuZVNjaGVtYSgnYXNzZXRzL2tpdHR5LXdvcmxkLmpzb24nKTtcclxuXHJcbmZ1bmN0aW9uIGdldFBvc2l0aW9uRnJvbU1heE1hcmdpbihzcHJpdGVQb3MsIHNwcml0ZVNpemUsIG1heE1hcmdpbikge1xyXG4gIHJldHVybiAoc3ByaXRlUG9zICsgc3ByaXRlU2l6ZSkgLSBtYXhNYXJnaW47XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFBvc2l0aW9uRnJvbU1pbk1hcmdpbihzcHJpdGVQb3MsIG1pbk1hcmdpbikge1xyXG4gIHJldHVybiBzcHJpdGVQb3MgLSBtaW5NYXJnaW47XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFwcGx5RnJpY3Rpb24odmVsb2NpdHksIGZyaWN0aW9uLCBlbGFwc2VkKSB7XHJcbiAgcmV0dXJuIHZlbG9jaXR5ICogTWF0aC5wb3coMSAtIGZyaWN0aW9uLCBlbGFwc2VkKTtcclxufVxyXG5cclxuZnVuY3Rpb24gaGFsdCh2ZWxvY2l0eSwgaGFsdFRhcmdldCkge1xyXG4gIHJldHVybiAoTWF0aC5hYnModmVsb2NpdHkpIDwgaGFsdFRhcmdldCkgPyAwIDogdmVsb2NpdHk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNsYW1wVmVsb2NpdHkodmVsb2NpdHksIG1heFZlbG9jaXR5KSB7XHJcbiAgcmV0dXJuICh2ZWxvY2l0eSA+IDApID9cclxuICAgIE1hdGgubWluKHZlbG9jaXR5LCBtYXhWZWxvY2l0eSkgOlxyXG4gICAgTWF0aC5tYXgodmVsb2NpdHksIC1tYXhWZWxvY2l0eSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFwcGx5QWNjZWxlcmF0aW9uKHZlbG9jaXR5LCBhY2NlbGVyYXRpb24sIGVsYXBzZWQpIHtcclxuICByZXR1cm4gdmVsb2NpdHkgKyAoYWNjZWxlcmF0aW9uICogZWxhcHNlZCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFBvc2l0aW9uRGVsdGEocG9zaXRpb24sIHZlbG9jaXR5LCBlbGFwc2VkKSB7XHJcbiAgcmV0dXJuIHBvc2l0aW9uICsgTWF0aC5yb3VuZCh2ZWxvY2l0eSAqIGVsYXBzZWQpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRWZWxvY2l0eShzcHJpdGUsIGRpbSwgZWxhcHNlZCkge1xyXG4gIGxldCB2ZWxvY2l0eSA9IGhhbHQoc3ByaXRlLnZlbG9jaXR5W2RpbV0sIDEpO1xyXG4gIHZlbG9jaXR5ID0gYXBwbHlBY2NlbGVyYXRpb24odmVsb2NpdHksIHNwcml0ZS5hY2NlbGVyYXRpb25bZGltXSwgZWxhcHNlZCk7XHJcbiAgdmVsb2NpdHkgPSBhcHBseUZyaWN0aW9uKHZlbG9jaXR5LCBzcHJpdGUuZnJpY3Rpb25bZGltXSwgZWxhcHNlZCk7XHJcbiAgcmV0dXJuIGNsYW1wVmVsb2NpdHkodmVsb2NpdHksIHNwcml0ZS5tYXhWZWxvY2l0eVtkaW1dKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0SW5uZXJEaWZmKHBvc2l0aW9uLCBzaXplLCBtaW5Cb3VuZCwgbWF4Qm91bmQpIHtcclxuICBjb25zdCBtYXggPSBwb3NpdGlvbiArIHNpemU7XHJcbiAgcmV0dXJuIChwb3NpdGlvbiA8IG1pbkJvdW5kICYmIHBvc2l0aW9uIC0gbWluQm91bmQgfHxcclxuICAgIG1heCA+IG1heEJvdW5kICYmIG1heCAtIG1heEJvdW5kIHx8XHJcbiAgICAwKTtcclxufVxyXG5cclxuLypmdW5jdGlvbiBnZXRPdXRlckRpZmYocG9zaXRpb24sIHNpemUsIG1pbkJvdW5kLCBtYXhCb3VuZCkge1xyXG4gIGNvbnN0IG1heCA9IHBvc2l0aW9uICsgc2l6ZTtcclxuICByZXR1cm4gKHBvc2l0aW9uIDwgbWluQm91bmQgJiYgbWF4ID4gbWluQm91bmQgJiYgbWF4IC0gbWluQm91bmQgfHxcclxuICAgIHBvc2l0aW9uIDwgbWF4Qm91bmQgJiYgbWF4ID4gbWF4Qm91bmQgJiYgcG9zaXRpb24gLSBtYXhCb3VuZCB8fFxyXG4gICAgMCk7XHJcbn0qL1xyXG5cclxuZnVuY3Rpb24gZ2V0T3V0ZXJEaWZmKHBvc2l0aW9uLCBzaXplLCBtaW5Cb3VuZCwgbWF4Qm91bmQpIHtcclxuICBjb25zdCBtYXggPSBwb3NpdGlvbiArIHNpemU7XHJcbiAgcmV0dXJuIChwb3NpdGlvbiA8IG1pbkJvdW5kICYmIG1heCA+IG1pbkJvdW5kICYmIG1heCAtIG1pbkJvdW5kIHx8XHJcbiAgICBwb3NpdGlvbiA8IG1heEJvdW5kICYmIG1heCA+IG1heEJvdW5kICYmIHBvc2l0aW9uIC0gbWF4Qm91bmQgfHxcclxuICAgIDApO1xyXG59XHJcblxyXG5mdW5jdGlvbiByZXNvbHZlQ29sbGlzaW9uKGRpZmYsIHZhbCkge1xyXG4gIHJldHVybiB2YWwgLSBkaWZmO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRDb2xsaWRlcnNJblJhbmdlKHJhbmdlTWluLCByYW5nZU1heCwgY29sbGlkZXJzKSB7XHJcbiAgcmV0dXJuIGNvbGxpZGVycy5maWx0ZXIoZnVuY3Rpb24gKGNvbGxpZGVyKSB7XHJcbiAgICByZXR1cm4gaW5SYW5nZShyYW5nZU1pbiwgcmFuZ2VNYXgsIGNvbGxpZGVyKTtcclxuICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gaW5SYW5nZShyYW5nZU1pbiwgcmFuZ2VNYXgsIGNvbGxpZGVyKSB7XHJcbiAgcmV0dXJuIChyYW5nZU1pbiA8IGNvbGxpZGVyLnJhbmdlTWF4ICYmXHJcbiAgICByYW5nZU1heCA+IGNvbGxpZGVyLnJhbmdlTWluKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0TWluUG9zaXRpb25EaWZmKG1pbiwgY29sbGlkZXJNYXgpIHtcclxuICByZXR1cm4gY29sbGlkZXJNYXggLSBtaW47XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldE1heFBvc2l0aW9uRGlmZihtYXgsIGNvbGxpZGVyTWluKSB7XHJcbiAgcmV0dXJuIGNvbGxpZGVyTWluIC0gbWF4O1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRJbnRlcnNlY3RlZENvbGxpZGVycyhjb2xsaWRlcnMsIHBvc2l0aW9uTWluLCBwb3NpdGlvbk1heCwgcmFuZ2VNaW4sIHJhbmdlTWF4KSB7XHJcbiAgcmV0dXJuIGNvbGxpZGVyc1xyXG4gICAgLmZpbHRlcihmdW5jdGlvbiAoY29sbGlkZXIpIHtcclxuICAgICAgcmV0dXJuIChyYW5nZU1pbiA8IGNvbGxpZGVyLnJhbmdlTWF4ICYmXHJcbiAgICAgICAgcmFuZ2VNYXggPiBjb2xsaWRlci5yYW5nZU1pbik7XHJcbiAgICB9KVxyXG4gICAgLm1hcChmdW5jdGlvbiAoY29sbGlkZXIpIHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBwb3NpdGlvbk1pbjogY29sbGlkZXIucG9zaXRpb25NYXggLSBwb3NpdGlvbk1pbixcclxuICAgICAgICBwb3NpdGlvbk1heDogY29sbGlkZXIucG9zaXRpb25NaW4gLSBwb3NpdGlvbk1heFxyXG4gICAgICB9O1xyXG4gICAgfSlcclxuICAgIC5maWx0ZXIoZnVuY3Rpb24gKGRpZmYpIHtcclxuICAgICAgcmV0dXJuIChkaWZmLnBvc2l0aW9uTWluID4gMCAmJiBkaWZmLnBvc2l0aW9uTWF4IDwgMCk7XHJcbiAgICB9KVxyXG4gICAgLm1hcChmdW5jdGlvbiAoZGlmZikge1xyXG4gICAgICByZXR1cm4gTWF0aC5tYXgoZGlmZi5wb3NpdGlvbk1pbiwgZGlmZi5wb3NpdGlvbk1heCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvKi5maWx0ZXIoY29sbGlkZXIgPT5cclxuICAgICAgcmFuZ2VNaW4gPD0gY29sbGlkZXIucmFuZ2VNYXggJiZcclxuICAgICAgcmFuZ2VNYXggPj0gY29sbGlkZXIucmFuZ2VNaW4gJiZcclxuICAgICAgcG9zaXRpb25NaW4gPD0gY29sbGlkZXIucG9zaXRpb25NYXggJiZcclxuICAgICAgcG9zaXRpb25NYXggPj0gY29sbGlkZXIucG9zaXRpb25NaW5cclxuICAgICk7Ki9cclxufVxyXG5cclxuZnVuY3Rpb24gcmVzb2x2ZUNvbGxpc2lvbnMocG9zaXRpb24sIGNvbGxpZGVycykge1xyXG4gIC8vIGZpeG1lOiBub3QgcmV0dXJuaW5nPz9cclxuICBjb2xsaWRlcnMucmVkdWNlKGZ1bmN0aW9uIChwb3NpdGlvbkRlbHRhLCBjb2xsaWRlcikge1xyXG4gICAgY29uc3QgZGlmZiA9IGdldE91dGVyRGlmZihcclxuICAgICAgcG9zaXRpb24sXHJcbiAgICAgIHNpemUsXHJcbiAgICAgIGNvbGxpZGVyLnBvc2l0aW9uTWluLFxyXG4gICAgICBjb2xsaWRlci5wb3NpdGlvbk1heFxyXG4gICAgKTtcclxuICAgIHJldHVybiAoZGlmZikgP1xyXG4gICAgICAgIHBvc2l0aW9uIC0gZGlmZiA6XHJcbiAgICAgICAgcG9zaXRpb25EZWx0YTtcclxuICB9LCBwb3NpdGlvbik7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldENvbGxpc2lvblJlc29sdmUoY29sbGlkZXJzLCBwb3NpdGlvbiwgc2l6ZSwgcmFuZ2VNaW4sIHJhbmdlTWF4KSB7XHJcbiAgcmV0dXJuIGNvbGxpZGVyc1xyXG4gICAgLmZpbHRlcihjb2xsaWRlciA9PlxyXG4gICAgICByYW5nZU1pbiA8PSBjb2xsaWRlci5yYW5nZU1heCAmJiByYW5nZU1heCA+PSBjb2xsaWRlci5yYW5nZU1pblxyXG4gICAgKVxyXG4gICAgLnJlZHVjZSgocG9zaXRpb25EZWx0YSwgY29sbGlkZXIpID0+IHtcclxuICAgICAgY29uc3QgZGlmZiA9IGdldE91dGVyRGlmZihcclxuICAgICAgICAgIHBvc2l0aW9uLFxyXG4gICAgICAgICAgc2l6ZSxcclxuICAgICAgICAgIGNvbGxpZGVyLnBvc2l0aW9uTWluLFxyXG4gICAgICAgICAgY29sbGlkZXIucG9zaXRpb25NYXhcclxuICAgICAgKTtcclxuXHJcbiAgICAgIHJldHVybiAoZGlmZikgP1xyXG4gICAgICAgIHBvc2l0aW9uIC0gZGlmZiA6XHJcbiAgICAgICAgcG9zaXRpb25EZWx0YTtcclxuICAgIH0sIHBvc2l0aW9uKTtcclxufVxyXG5cclxuZnVuY3Rpb24gYXBwbHlBbmltYXRpb24oc3ByaXRlKSB7XHJcbiAgY29uc3Qgc2VxdWVuY2UgPSBzcHJpdGUudHlwZS5mcmFtZVNldFtnZXRBbmltYXRpb24oc3ByaXRlKV07XHJcbiAgY29uc3QgZnJhbWVJbmRleCA9IGdldEZyYW1lSW5kZXgoc3ByaXRlLmFuaW1hdGlvbi5jdXJyZW50SW5kZXgsIHNlcXVlbmNlKTtcclxuICBzcHJpdGUuYW5pbWF0aW9uLmN1cnJlbnRJbmRleCA9IGZyYW1lSW5kZXg7XHJcblxyXG4gIHJldHVybiBnZXRGcmFtZShmcmFtZUluZGV4LCBzZXF1ZW5jZSlcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0RnJhbWVJbmRleChjdXJyZW50SW5kZXgsIHNlcXVlbmNlKSB7XHJcbiAgY29uc3QgaW5kZXggPSBjdXJyZW50SW5kZXggfHwgMDtcclxuICByZXR1cm4gKGluZGV4IDwgc2VxdWVuY2UuZnJhbWVzLmxlbmd0aCAtIDEpID9cclxuICAgIGluZGV4ICsgMSA6IDA7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEFuaW1hdGlvbihzcHJpdGUpIHtcclxuICByZXR1cm4gJ3J1bic7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZyYW1lKGluZGV4LCBzZXF1ZW5jZSkge1xyXG4gIHJldHVybiBzZXF1ZW5jZS5mcmFtZXNbaW5kZXhdO1xyXG59XHJcblxyXG5mdW5jdGlvbiBsaW5lSW50ZXJzZWN0c1JlY3QobGluZSwgcmVjdCkge1xyXG4gIHJldHVybiBsaW5lSW50ZXJzZWN0c1NlZ21lbnQobGluZSwgcmVjdC54LCByZWN0LnksIHJlY3QueCArIHJlY3Qud2lkdGgsIHJlY3QueSkgfHwgLy8gdG9wXHJcbiAgICBsaW5lSW50ZXJzZWN0c1NlZ21lbnQobGluZSwgcmVjdC54LCByZWN0LnksIHJlY3QueCwgcmVjdC55ICsgcmVjdC5oZWlnaHQpIHx8IC8vIGxlZnRcclxuICAgIGxpbmVJbnRlcnNlY3RzU2VnbWVudChsaW5lLCByZWN0LngsIHJlY3QueSArIHJlY3QuaGVpZ2h0LCByZWN0LnggKyByZWN0LndpZHRoLCByZWN0LnkgKyByZWN0LmhlaWdodCkgfHwgLy8gYm90dG9tXHJcbiAgICBsaW5lSW50ZXJzZWN0c1NlZ21lbnQobGluZSwgcmVjdC54ICsgcmVjdC53aWR0aCwgcmVjdC55LCByZWN0LnggKyByZWN0LndpZHRoLCByZWN0LnkgKyByZWN0LmhlaWdodCk7IC8vIHJpZ2h0XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGxpbmVJbnRlcnNlY3RzU2VnbWVudChsaW5lLCB4MSwgeTEsIHgyLCB5Mikge1xyXG4gIC8vIFRPRE86IHByZWNhbGN1bGF0ZSBzb21lIG9mIHRoaXMgc2hpdFxyXG4gIGNvbnN0IGRlbm9tID0gKGxpbmUueDEgLSBsaW5lLngyKSAqICh5MSAtIHkyKSAtIChsaW5lLnkxIC0gbGluZS55MikgKiAoeDEgLSB4Mik7XHJcblxyXG4gIGlmIChkZW5vbSA9PT0gMCkge1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgeCA9IE1hdGguZmxvb3IoKChsaW5lLngxICogbGluZS55MiAtIGxpbmUueTEgKiBsaW5lLngyKSAqICh4MSAtIHgyKSAtIChsaW5lLngxIC0gbGluZS54MikgKiAoeDEgKiB5MiAtIHkxICogeDIpKSAvIGRlbm9tKTtcclxuICBjb25zdCB5ID0gTWF0aC5mbG9vcigoKGxpbmUueDEgKiBsaW5lLnkyIC0gbGluZS55MSAqIGxpbmUueDIpICogKHkxIC0geTIpIC0gKGxpbmUueTEgLSBsaW5lLnkyKSAqICh4MSAqIHkyIC0geTEgKiB4MikpIC8gZGVub20pO1xyXG5cclxuICBjb25zdCBtYXhYID0gTWF0aC5tYXgoeDEsIHgyKTtcclxuICBjb25zdCBtaW5YID0gTWF0aC5taW4oeDEsIHgyKTtcclxuICBjb25zdCBtYXhZID0gTWF0aC5tYXgoeTEsIHkyKTtcclxuICBjb25zdCBtaW5ZID0gTWF0aC5taW4oeTEsIHkyKTtcclxuXHJcbiAgaWYgKHggPD0gbWF4WCAmJiB4ID49IG1pblggJiZcclxuICAgIHkgPD0gbWF4WSAmJiB5ID49IG1pblkgKSB7XHJcbiAgICByZXR1cm4ge3g6IHgsIHk6IHl9O1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGZhbHNlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZWdtZW50SW50ZXJzZWN0c1NlZ21lbnQobGluZSwgeDEsIHkxLCB4MiwgeTIpIHtcclxuICB2YXIgaW50ZXJzZWN0cyA9IGxpbmVJbnRlcnNlY3RzU2VnbWVudChsaW5lLCB4MSwgeTEsIHgyLCB5Mik7XHJcblxyXG4gIGlmICghaW50ZXJzZWN0cykge1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgaWYgKCEoaW50ZXJzZWN0cy54ID49IE1hdGgubWluKGxpbmUueDEsIGxpbmUueDIpICYmXHJcbiAgICBpbnRlcnNlY3RzLnggPD0gTWF0aC5tYXgobGluZS54MSwgbGluZS54MikgJiZcclxuICAgIGludGVyc2VjdHMueSA+PSBNYXRoLm1pbihsaW5lLnkxLCBsaW5lLnkyKSAmJlxyXG4gICAgaW50ZXJzZWN0cy55IDw9IE1hdGgubWF4KGxpbmUueTEsIGxpbmUueTIpKSkge1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuICByZXR1cm4gaW50ZXJzZWN0cztcclxufVxyXG5cclxuZnVuY3Rpb24gbG9nKG1zZykge1xyXG4gIC8vY29uc29sZS5sb2cobXNnKTtcclxufVxyXG5cclxuLypcclxuZnVuY3Rpb24gY29sbGlzaW9ucyhzcHJpdGUsIGNvbGxpZGVycykge1xyXG4gIGNvbnN0IGRpclkgPSBzcHJpdGUueSAtIHNwcml0ZS5sYXN0WTtcclxuICBjb25zdCBkaXJYID0gc3ByaXRlLnggLSBzcHJpdGUubGFzdFg7XHJcblxyXG4gIGNvbGxpZGVycy5mb3JFYWNoKGZ1bmN0aW9uIChjb2xsaWRlcikge1xyXG4gICAgbGV0IGludGVyc2VjdHMsIGRpZmZYLCBkaWZmWTtcclxuXHJcbiAgICBpbnRlcnNlY3RzID0gc2VnbWVudEludGVyc2VjdHNTZWdtZW50KGNvbGxpZGVyLCBzcHJpdGUueCwgc3ByaXRlLnksIHNwcml0ZS54LCBzcHJpdGUueSArIHNwcml0ZS5oZWlnaHQpOyAvLyBsZWZ0XHJcbiAgICBpZiAoaW50ZXJzZWN0cykge1xyXG4gICAgICBsb2coJ2xlZnQnLCBpbnRlcnNlY3RzKTtcclxuICAgICAgaWYoZGlyWSA8IDApXHJcbiAgICAgICAgc3ByaXRlLnkgPSBpbnRlcnNlY3RzLnkgKyAxO1xyXG4gICAgICBlbHNlIGlmKGRpclkgPiAwKVxyXG4gICAgICAgIHNwcml0ZS55ID0gaW50ZXJzZWN0cy55IC0gc3ByaXRlLmhlaWdodCAtIDE7XHJcbiAgICB9XHJcblxyXG4gICAgaWYoaW50ZXJzZWN0cyA9IHNlZ21lbnRJbnRlcnNlY3RzU2VnbWVudChjb2xsaWRlciwgc3ByaXRlLnggKyBzcHJpdGUud2lkdGgsIHNwcml0ZS55LCBzcHJpdGUueCArIHNwcml0ZS53aWR0aCwgc3ByaXRlLnkgKyBzcHJpdGUuaGVpZ2h0KSkgey8vIHJpZ2h0XHJcbiAgICAgIGxvZygncmlnaHQnLCBpbnRlcnNlY3RzKTtcclxuICAgICAgaWYoZGlyWSA8IDApXHJcbiAgICAgICAgc3ByaXRlLnkgPSBpbnRlcnNlY3RzLnkgKyAxO1xyXG4gICAgICBlbHNlIGlmKGRpclkgPiAwKVxyXG4gICAgICAgIHNwcml0ZS55ID0gaW50ZXJzZWN0cy55IC0gc3ByaXRlLmhlaWdodCAtIDE7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIGlmKCFjb2xsaWRlci5zbG9wZSkge1xyXG4gICAgICBpbnRlcnNlY3RzID0gc2VnbWVudEludGVyc2VjdHNTZWdtZW50KGNvbGxpZGVyLCBzcHJpdGUueCwgc3ByaXRlLnksIHNwcml0ZS54ICsgc3ByaXRlLndpZHRoLCBzcHJpdGUueSk7IC8vIHRvcFxyXG4gICAgICBpZiAoaW50ZXJzZWN0cykge1xyXG4gICAgICAgIGxvZygndG9wJywgaW50ZXJzZWN0cyk7XHJcbiAgICAgICAgaWYoZGlyWCA8IDApXHJcbiAgICAgICAgICBzcHJpdGUueCA9IGludGVyc2VjdHMueCArIDE7XHJcbiAgICAgICAgZWxzZSBpZihkaXJYID4gMClcclxuICAgICAgICAgIHNwcml0ZS54ID0gaW50ZXJzZWN0cy54IC0gc3ByaXRlLndpZHRoIC0gMTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGludGVyc2VjdHMgPSBzZWdtZW50SW50ZXJzZWN0c1NlZ21lbnQoY29sbGlkZXIsIHNwcml0ZS54LCBzcHJpdGUueSArIHNwcml0ZS5oZWlnaHQsIHNwcml0ZS54ICsgc3ByaXRlLndpZHRoLCBzcHJpdGUueSArIHNwcml0ZS5oZWlnaHQpKSB7IC8vIGJvdHRvbVxyXG4gICAgICAgIGxvZygnYm90dG9tJywgaW50ZXJzZWN0cyk7XHJcbiAgICAgICAgaWYoZGlyWCA8IDApXHJcbiAgICAgICAgICBzcHJpdGUueCA9IGludGVyc2VjdHMueCArIDE7XHJcbiAgICAgICAgZWxzZSBpZihkaXJYID4gMClcclxuICAgICAgICAgIHNwcml0ZS54ID0gaW50ZXJzZWN0cy54IC0gc3ByaXRlLndpZHRoIC0gMTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0pO1xyXG59XHJcbiovXHJcblxyXG4vKlxyXG5mdW5jdGlvbiBjb2xsaXNpb25zKHNwcml0ZSwgY29sbGlkZXJzKSB7XHJcbiAgcmV0dXJuIGNvbGxpZGVycy5yZWR1Y2UoZnVuY3Rpb24gKGNvbGxpc2lvbnMsIGNvbGxpZGVyKSB7XHJcbiAgICBsZXQgaW50ZXJzZWN0cywgeCA9IGNvbGxpc2lvbnMueCwgeSA9IGNvbGxpc2lvbnMueTtcclxuXHJcbiAgICBpbnRlcnNlY3RzID0gc2VnbWVudEludGVyc2VjdHNTZWdtZW50KGNvbGxpZGVyLCBzcHJpdGUueCwgc3ByaXRlLnksIHNwcml0ZS54LCBzcHJpdGUueSArIHNwcml0ZS5oZWlnaHQpOyAvLyBsZWZ0XHJcbiAgICBpZiAoaW50ZXJzZWN0cykge1xyXG4gICAgICB5ID0gaW50ZXJzZWN0cy55O1xyXG4gICAgfVxyXG5cclxuICAgIGlmKGludGVyc2VjdHMgPSBzZWdtZW50SW50ZXJzZWN0c1NlZ21lbnQoY29sbGlkZXIsIHNwcml0ZS54ICsgc3ByaXRlLndpZHRoLCBzcHJpdGUueSwgc3ByaXRlLnggKyBzcHJpdGUud2lkdGgsIHNwcml0ZS55ICsgc3ByaXRlLmhlaWdodCkpIHsvLyByaWdodFxyXG4gICAgICB5ID0gaW50ZXJzZWN0cy55O1xyXG4gICAgfVxyXG5cclxuICAgIGlmKCFjb2xsaWRlci5zbG9wZSkge1xyXG4gICAgICBpbnRlcnNlY3RzID0gc2VnbWVudEludGVyc2VjdHNTZWdtZW50KGNvbGxpZGVyLCBzcHJpdGUueCwgc3ByaXRlLnksIHNwcml0ZS54ICsgc3ByaXRlLndpZHRoLCBzcHJpdGUueSk7IC8vIHRvcFxyXG4gICAgICBpZiAoaW50ZXJzZWN0cykge1xyXG4gICAgICAgIHggPSBpbnRlcnNlY3RzLng7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChpbnRlcnNlY3RzID0gc2VnbWVudEludGVyc2VjdHNTZWdtZW50KGNvbGxpZGVyLCBzcHJpdGUueCwgc3ByaXRlLnkgKyBzcHJpdGUuaGVpZ2h0LCBzcHJpdGUueCArIHNwcml0ZS53aWR0aCwgc3ByaXRlLnkgKyBzcHJpdGUuaGVpZ2h0KSkgeyAvLyBib3R0b21cclxuICAgICAgICB4ID0gaW50ZXJzZWN0cy54O1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29sbGlzaW9ucy54ID0geDtcclxuICAgIGNvbGxpc2lvbnMueSA9IHk7XHJcblxyXG4gICAgcmV0dXJuIGNvbGxpc2lvbnM7XHJcbiAgfSwge3g6IG51bGwsIHk6IG51bGx9KTtcclxufVxyXG4qL1xyXG5cclxuLypcclxuZnVuY3Rpb24gZ2V0Q29sbGlzaW9ucyhzcHJpdGUsIGNvbGxpZGVycykge1xyXG4gIHJldHVybiBjb2xsaWRlcnMucmVkdWNlKGZ1bmN0aW9uIChjb2xsaXNpb25zLCBjb2xsaWRlcikge1xyXG4gICAgbGV0IGludGVyc2VjdHM7XHJcbiAgICBjb25zdCB4TWluID0gc3ByaXRlLng7XHJcbiAgICBjb25zdCB5TWluID0gc3ByaXRlLnk7XHJcbiAgICBjb25zdCB4TWF4ID0geE1pbiArIHNwcml0ZS53aWR0aDtcclxuICAgIGNvbnN0IHlNYXggPSB5TWluICsgc3ByaXRlLmhlaWdodDtcclxuXHJcbiAgICAvLyBMRUZUXHJcbiAgICBpZiAoaW50ZXJzZWN0cyA9IHNlZ21lbnRJbnRlcnNlY3RzU2VnbWVudChjb2xsaWRlciwgeE1pbiwgeU1pbiwgeE1pbiwgeU1heCkpIHtcclxuICAgICAgY29sbGlzaW9ucy5wdXNoKGludGVyc2VjdHMpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFJJR0hUXHJcbiAgICBpZihpbnRlcnNlY3RzID0gc2VnbWVudEludGVyc2VjdHNTZWdtZW50KGNvbGxpZGVyLCB4TWF4LCB5TWluLCB4TWF4LCB5TWF4KSkge1xyXG4gICAgICBjb2xsaXNpb25zLnB1c2goaW50ZXJzZWN0cyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVE9QXHJcbiAgICBpZiAoaW50ZXJzZWN0cyA9IHNlZ21lbnRJbnRlcnNlY3RzU2VnbWVudChjb2xsaWRlciwgeE1pbiwgeU1pbiwgeE1heCwgeU1pbikpIHtcclxuICAgICAgY29sbGlzaW9ucy5wdXNoKGludGVyc2VjdHMpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEJPVFRPTVxyXG4gICAgaWYgKGludGVyc2VjdHMgPSBzZWdtZW50SW50ZXJzZWN0c1NlZ21lbnQoY29sbGlkZXIsIHhNaW4sIHlNYXgsIHhNYXgsIHlNYXgpKSB7XHJcbiAgICAgIGNvbGxpc2lvbnMucHVzaChpbnRlcnNlY3RzKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gY29sbGlzaW9ucztcclxuICB9LCBbXSk7XHJcbn1cclxuKi9cclxuXHJcbmZ1bmN0aW9uIGdldENvbGxpc2lvbnMocmVjdCwgY29sbGlkZXJzKSB7XHJcbiAgcmV0dXJuIGNvbGxpZGVycy5maWx0ZXIoZnVuY3Rpb24gKGNvbGxpZGVyKSB7XHJcbiAgICByZXR1cm4gIShyZWN0LnggPiBjb2xsaWRlci54ICsgY29sbGlkZXIud2lkdGggfHxcclxuICAgICAgICByZWN0LnggKyByZWN0LndpZHRoIDwgY29sbGlkZXIueCB8fFxyXG4gICAgICAgIHJlY3QueSA+IGNvbGxpZGVyLnkgKyBjb2xsaWRlci5oZWlnaHQgfHxcclxuICAgICAgICByZWN0LnkgKyByZWN0LmhlaWdodCA8IGNvbGxpZGVyLnkpO1xyXG4gIH0pO1xyXG59XHJcblxyXG4vKlxyXG5mdW5jdGlvbiBnZXRQcm9qZWN0aW9uVmVjdG9yKGNvbGxpZGVycywgcmVjdCwgeERpciwgeURpcikge1xyXG4gIHJldHVybiBjb2xsaWRlcnMucmVkdWNlKGZ1bmN0aW9uICh2ZWN0b3IsIGNvbGxpZGVyKSB7XHJcbiAgICBsZXQgeERpZmYgPSAwO1xyXG4gICAgbGV0IHlEaWZmID0gMDtcclxuXHJcbiAgICBpZiAoeERpciA8IDApXHJcbiAgICAgIHhEaWZmID0gKGNvbGxpZGVyLnggKyBjb2xsaWRlci53aWR0aCkgLSByZWN0Lng7XHJcbiAgICBlbHNlIGlmICh4RGlyID4gMClcclxuICAgICAgeERpZmYgPSBjb2xsaWRlci54IC0gKHJlY3QueCArIHJlY3Qud2lkdGgpO1xyXG5cclxuICAgIGlmICh5RGlyIDwgMClcclxuICAgICAgeURpZmYgPSAoY29sbGlkZXIueSArIGNvbGxpZGVyLmhlaWdodCkgLSByZWN0Lnk7XHJcbiAgICBlbHNlIGlmICh5RGlyID4gMClcclxuICAgICAgeURpZmYgPSBjb2xsaWRlci55IC0gKHJlY3QueSArIHJlY3QuaGVpZ2h0KTtcclxuXHJcbiAgICBpZiAoeERpZmYgJiYgeURpZmYpIHtcclxuICAgICAgaWYgKE1hdGguYWJzKHhEaWZmKSA8PSBNYXRoLmFicyh5RGlmZikpIHtcclxuICAgICAgICB2ZWN0b3IueCA9IHhEaWZmO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHZlY3Rvci55ID0geURpZmY7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAoeERpZmYpIHtcclxuICAgICAgdmVjdG9yLnggPSB4RGlmZjtcclxuICAgIH0gZWxzZSBpZiAoeURpZmYpIHtcclxuICAgICAgdmVjdG9yLnkgPSB5RGlmZjtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdmVjdG9yO1xyXG4gIH0sIHsgeDogMCwgeTogMCB9KTtcclxufVxyXG4qL1xyXG5cclxuZnVuY3Rpb24gZ2V0T3ZlcmxhcHMoY29sbGlkZXJzLCByZWN0KSB7XHJcbiAgcmV0dXJuIGNvbGxpZGVycy5tYXAoZnVuY3Rpb24gKGNvbGxpZGVyKSB7XHJcbiAgICBjb25zdCB4TWluID0gKGNvbGxpZGVyLnggKyBjb2xsaWRlci53aWR0aCkgLSByZWN0Lng7XHJcbiAgICBjb25zdCB4TWF4ID0gY29sbGlkZXIueCAtIChyZWN0LnggKyByZWN0LndpZHRoKTtcclxuICAgIGNvbnN0IHlNaW4gPSAoY29sbGlkZXIueSArIGNvbGxpZGVyLmhlaWdodCkgLSByZWN0Lnk7XHJcbiAgICBjb25zdCB5TWF4ID0gY29sbGlkZXIueSAtIChyZWN0LnkgKyByZWN0LmhlaWdodCk7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB4OiBNYXRoLmFicyh4TWF4KSA8IE1hdGguYWJzKHhNaW4pID8geE1heCA6IHhNaW4sXHJcbiAgICAgIHk6IE1hdGguYWJzKHlNYXgpIDwgTWF0aC5hYnMoeU1pbikgPyB5TWF4IDogeU1pblxyXG4gICAgfTtcclxuICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Q29tYmluZWRzKG92ZXJsYXBzKSB7XHJcbiAgcmV0dXJuIG92ZXJsYXBzLnJlZHVjZShmdW5jdGlvbiAoY29tYmluZWQsIG92ZXJsYXApIHtcclxuICAgIGNvbnN0IGxhc3QgPSBjb21iaW5lZFtjb21iaW5lZC5sZW5ndGggLSAxXTtcclxuICAgIGlmICghbGFzdCkge1xyXG4gICAgICBjb21iaW5lZC5wdXNoKHt4OiBvdmVybGFwLngsIHk6IG92ZXJsYXAueX0pO1xyXG4gICAgICByZXR1cm4gY29tYmluZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFsYXN0Ll9jb21iaW5lZCAmJiBvdmVybGFwLnggPT09IGxhc3QueCkge1xyXG4gICAgICBpZiAoTWF0aC5hYnMob3ZlcmxhcC55KSA+IE1hdGguYWJzKGxhc3QueSkpIHtcclxuICAgICAgICBsYXN0LnkgPSBvdmVybGFwLnk7XHJcbiAgICAgICAgbGFzdC5fY29tYmluZWQgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKCFsYXN0Ll9jb21iaW5lZCAmJiBvdmVybGFwLnkgPT09IGxhc3QueSkge1xyXG4gICAgICBpZiAoTWF0aC5hYnMob3ZlcmxhcC54KSA+IE1hdGguYWJzKGxhc3QueCkpIHtcclxuICAgICAgICBsYXN0LnggPSBvdmVybGFwLng7XHJcbiAgICAgICAgbGFzdC5fY29tYmluZWQgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb21iaW5lZC5wdXNoKHt4OiBvdmVybGFwLngsIHk6IG92ZXJsYXAueX0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBjb21iaW5lZDtcclxuICB9LCBbXSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFJlc29sdXRpb24oY29tYmluZWRzKSB7XHJcbiAgcmV0dXJuIGNvbWJpbmVkcy5yZWR1Y2UoZnVuY3Rpb24gKHJlc29sdXRpb24sIGNvbWJpbmVkKSB7XHJcbiAgICBpZiAoTWF0aC5hYnMoY29tYmluZWQueCkgPCBNYXRoLmFicyhjb21iaW5lZC55KSkge1xyXG4gICAgICByZXNvbHV0aW9uLnggPSBjb21iaW5lZC54O1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmVzb2x1dGlvbi55ID0gY29tYmluZWQueTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXNvbHV0aW9uO1xyXG4gIH0sIHt4OiAwLCB5OiAwfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZvbzQob3ZlcmxhcHMpIHtcclxuICB2YXIgcmVzb2x1dGlvbiA9IG92ZXJsYXBzXHJcbiAgICAucmVkdWNlKGZ1bmN0aW9uIChyZXNvbHV0aW9uLCBvdmVybGFwKSB7XHJcbiAgICAgIGNvbnN0IHggPSBvdmVybGFwLngsXHJcbiAgICAgICAgeSA9IG92ZXJsYXAueTtcclxuXHJcbiAgICAgIGlmICh4ID09PSAwIHx8IHkgPT09IDApIHtcclxuICAgICAgICByZXR1cm4gcmVzb2x1dGlvbjtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKE1hdGguYWJzKHgpID4gTWF0aC5hYnMoeSkpIHtcclxuICAgICAgICBpZiAoTWF0aC5hYnMoeSkgPCBNYXRoLmFicyhyZXNvbHV0aW9uLnkpICYmIHggIT09IHJlc29sdXRpb24ubGFzdFggJiYgeSAhPT0gcmVzb2x1dGlvbi5sYXN0WSkge1xyXG4gICAgICAgICAgcmVzb2x1dGlvbi55ID0geTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWYgKE1hdGguYWJzKHgpIDwgTWF0aC5hYnMocmVzb2x1dGlvbi54KSAmJiB5ICE9PSByZXNvbHV0aW9uLmxhc3RZICYmIHggIT09IHJlc29sdXRpb24ubGFzdFgpIHtcclxuICAgICAgICAgIHJlc29sdXRpb24ueCA9IHg7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICByZXNvbHV0aW9uLmxhc3RYID0geDtcclxuICAgICAgcmVzb2x1dGlvbi5sYXN0WSA9IHk7XHJcblxyXG4gICAgICBjb25zb2xlLmxvZygneCwgeSA9ICcsIHgsIHkpO1xyXG4gICAgICBjb25zb2xlLmxvZyhyZXNvbHV0aW9uKTtcclxuXHJcbiAgICAgIHJldHVybiByZXNvbHV0aW9uO1xyXG4gICAgfSwge3g6IDk5OTk5OSwgeTogOTk5OTk5LCBsYXN0WDogbnVsbCwgbGFzdFk6IG51bGx9KTtcclxuXHJcbiAgcmV0dXJuIHJlc29sdXRpb247XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZvbzIob3ZlcmxhcHMpIHtcclxuICB2YXIgcmVzb2x1dGlvbiA9IG92ZXJsYXBzXHJcbiAgICAucmVkdWNlKGZ1bmN0aW9uIChyZXNvbHV0aW9uLCBvdmVybGFwKSB7XHJcbiAgICAgIGNvbnN0IHggPSBNYXRoLmFicyhvdmVybGFwLnhNYXgpIDwgTWF0aC5hYnMob3ZlcmxhcC54TWluKSA/XHJcbiAgICAgICAgb3ZlcmxhcC54TWF4IDpcclxuICAgICAgICBvdmVybGFwLnhNaW47XHJcblxyXG4gICAgICBjb25zdCB5ID0gTWF0aC5hYnMob3ZlcmxhcC55TWF4KSA8IE1hdGguYWJzKG92ZXJsYXAueU1pbikgP1xyXG4gICAgICAgIG92ZXJsYXAueU1heCA6XHJcbiAgICAgICAgb3ZlcmxhcC55TWluO1xyXG5cclxuICAgICAgaWYgKHggPT09IDAgfHwgeSA9PT0gMCkge1xyXG4gICAgICAgIHJldHVybiByZXNvbHV0aW9uO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoTWF0aC5hYnMoeCkgPCBNYXRoLmFicyh5KSkge1xyXG4gICAgICAgIC8vaWYgKHR5cGVvZiByZXNvbHV0aW9uLlkueSA9PT0gJ3VuZGVmaW5lZCcgfHwgKE1hdGguYWJzKHkpID4gTWF0aC5hYnMocmVzb2x1dGlvbi5ZLnkpICYmIHkgIT09IHJlc29sdXRpb24uWC55KSkge1xyXG4gICAgICAgIC8vaWYgKE1hdGguYWJzKHkpID4gTWF0aC5hYnMocmVzb2x1dGlvbi5ZLnkpICYmIChyZXNvbHV0aW9uLlgueSA9PT0gMCB8fCB5ICE9PSByZXNvbHV0aW9uLlgueSkgJiYgKHJlc29sdXRpb24uWS54ID09PSAwIHx8IHggIT09IHJlc29sdXRpb24uWS54KSkge1xyXG4gICAgICAgIC8vaWYgKCh0eXBlb2YgcmVzb2x1dGlvbi5ZLnkgPT09ICd1bmRlZmluZWQnIHx8IE1hdGguYWJzKHkpID4gTWF0aC5hYnMocmVzb2x1dGlvbi5ZLnkpKSAmJiB5ICE9PSByZXNvbHV0aW9uLlgueSAmJiB4ICE9PSByZXNvbHV0aW9uLlgueCkge1xyXG4gICAgICAgIGlmICgodHlwZW9mIHJlc29sdXRpb24uWS55ID09PSAndW5kZWZpbmVkJyB8fCBNYXRoLmFicyh5KSA+IE1hdGguYWJzKHJlc29sdXRpb24uWS55KSkpIHtcclxuICAgICAgICAgIHJlc29sdXRpb24uWS54ID0geDtcclxuICAgICAgICAgIHJlc29sdXRpb24uWS55ID0geTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8vaWYgKHR5cGVvZiByZXNvbHV0aW9uLlgueCA9PT0gJ3VuZGVmaW5lZCcgfHwgKE1hdGguYWJzKHgpID4gTWF0aC5hYnMocmVzb2x1dGlvbi5YLngpICYmIHggIT09IHJlc29sdXRpb24uWS54KSkge1xyXG4gICAgICAgIC8vaWYgKE1hdGguYWJzKHgpID4gTWF0aC5hYnMocmVzb2x1dGlvbi5YLngpICYmIChyZXNvbHV0aW9uLlkueSA9PT0gMCB8fCB5ICE9PSByZXNvbHV0aW9uLlkueSkgJiYgKHJlc29sdXRpb24uWC54ID09PSAwIHx8IHggIT09IHJlc29sdXRpb24uWC54KSkge1xyXG4gICAgICAgIC8vaWYgKCh0eXBlb2YgcmVzb2x1dGlvbi5YLnggPT09ICd1bmRlZmluZWQnIHx8IE1hdGguYWJzKHgpID4gTWF0aC5hYnMocmVzb2x1dGlvbi5YLngpKSAmJiB5ICE9PSByZXNvbHV0aW9uLlkueSAmJiB4ICE9PSByZXNvbHV0aW9uLlkueCkge1xyXG4gICAgICAgIGlmICgodHlwZW9mIHJlc29sdXRpb24uWC54ID09PSAndW5kZWZpbmVkJyB8fCBNYXRoLmFicyh4KSA+IE1hdGguYWJzKHJlc29sdXRpb24uWC54KSkpIHtcclxuICAgICAgICAgIHJlc29sdXRpb24uWC54ID0geDtcclxuICAgICAgICAgIHJlc29sdXRpb24uWC55ID0geTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnNvbGUubG9nKCd4LCB5ID0gJywgeCwgeSk7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdYICcsIHJlc29sdXRpb24uWCwgJ1knLCByZXNvbHV0aW9uLlkpO1xyXG5cclxuICAgICAgcmV0dXJuIHJlc29sdXRpb247XHJcbiAgICB9LCB7XHJcbiAgICAgIFg6IHt9LFxyXG4gICAgICBZOiB7fVxyXG4gICAgfSk7XHJcblxyXG4gIGxldCB4ID0gMCwgeSA9IDA7XHJcbiAgY29uc3QgWCA9IHJlc29sdXRpb24uWDtcclxuICBjb25zdCBZID0gcmVzb2x1dGlvbi5ZO1xyXG5cclxuICAvKlxyXG4gIGlmIChYLnggPT09IDAgJiYgWC55ID09PSAwKSB7XHJcbiAgICB4ID0gMDtcclxuICAgIHkgPSBZLnk7XHJcbiAgfVxyXG4gIGVsc2UgaWYgKFkueCA9PT0gMCAmJiBZLnkgPT09IDApIHtcclxuICAgIHggPSBYLng7XHJcbiAgICB5ID0gMDtcclxuICB9XHJcbiAgZWxzZSB7XHJcbiAgICB4ID0gWS54O1xyXG4gICAgeSA9IFgueTtcclxuICB9XHJcbiAgKi9cclxuXHJcbiAgeCA9IFkueCB8fCAwO1xyXG4gIHkgPSBYLnkgfHwgMDtcclxuXHJcbiAgY29uc29sZS5sb2coeCwgeSk7XHJcblxyXG4gIHJldHVybiB7eDogeCwgeTogeX07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZvbzMob3ZlcmxhcHMpIHtcclxuICB2YXIgcmVzb2x1dGlvbiA9IG92ZXJsYXBzXHJcbiAgICAucmVkdWNlKGZ1bmN0aW9uIChyZXNvbHV0aW9uLCBvdmVybGFwKSB7XHJcbiAgICAgIGNvbnN0IHggPSBNYXRoLmFicyhvdmVybGFwLnhNYXgpIDwgTWF0aC5hYnMob3ZlcmxhcC54TWluKSA/XHJcbiAgICAgICAgb3ZlcmxhcC54TWF4IDpcclxuICAgICAgICBvdmVybGFwLnhNaW47XHJcblxyXG4gICAgICBjb25zdCB5ID0gTWF0aC5hYnMob3ZlcmxhcC55TWF4KSA8IE1hdGguYWJzKG92ZXJsYXAueU1pbikgP1xyXG4gICAgICAgIG92ZXJsYXAueU1heCA6XHJcbiAgICAgICAgb3ZlcmxhcC55TWluO1xyXG5cclxuICAgICAgaWYgKHggPT09IDAgfHwgeSA9PT0gMCkge1xyXG4gICAgICAgIHJldHVybiByZXNvbHV0aW9uO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoTWF0aC5hYnMoeCkgPiBNYXRoLmFicyh5KSkge1xyXG4gICAgICAgIGlmIChNYXRoLmFicyh5KSA8IE1hdGguYWJzKHJlc29sdXRpb24ueSkgJiYgeCAhPT0gcmVzb2x1dGlvbi5sYXN0WCAmJiB5ICE9PSByZXNvbHV0aW9uLmxhc3RZKSB7XHJcbiAgICAgICAgICByZXNvbHV0aW9uLnkgPSB5O1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBpZiAoTWF0aC5hYnMoeCkgPCBNYXRoLmFicyhyZXNvbHV0aW9uLngpICYmIHkgIT09IHJlc29sdXRpb24ubGFzdFkgJiYgeCAhPT0gcmVzb2x1dGlvbi5sYXN0WCkge1xyXG4gICAgICAgICAgcmVzb2x1dGlvbi54ID0geDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJlc29sdXRpb24ubGFzdFggPSB4O1xyXG4gICAgICByZXNvbHV0aW9uLmxhc3RZID0geTtcclxuXHJcbiAgICAgIGNvbnNvbGUubG9nKCd4LCB5ID0gJywgeCwgeSk7XHJcbiAgICAgIGNvbnNvbGUubG9nKHJlc29sdXRpb24pO1xyXG5cclxuICAgICAgcmV0dXJuIHJlc29sdXRpb247XHJcbiAgICB9LCB7eDogOTk5OTk5LCB5OiA5OTk5OTksIGxhc3RYOiBudWxsLCBsYXN0WTogbnVsbH0pO1xyXG5cclxuICByZXR1cm4gcmVzb2x1dGlvbjtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Rm9vKHByb2plY3Rpb25WZWN0b3JzKSB7XHJcbiAgcmV0dXJuIHByb2plY3Rpb25WZWN0b3JzLnJlZHVjZShmdW5jdGlvbiAoYWNjLCBwcm9qZWN0aW9uVmVjdG9yKSB7XHJcbiAgICBjb25zdCB4ID0gcHJvamVjdGlvblZlY3Rvci54O1xyXG4gICAgY29uc3QgeEFicyA9IE1hdGguYWJzKHgpO1xyXG4gICAgY29uc3QgeSA9IHByb2plY3Rpb25WZWN0b3IueTtcclxuICAgIGNvbnN0IHlBYnMgPSBNYXRoLmFicyh5KTtcclxuXHJcbiAgICBpZiAoeCA9PT0gYWNjLnhMYXN0KSB7XHJcbiAgICAgIC8vIGRvIG5vdGhpbmdcclxuICAgIH0gZWxzZSBpZih5ID09PSBhY2MueUxhc3QpIHtcclxuICAgICAgLy8gZG8gbm90aGluZ1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgYWNjLnhMYXN0ID0geDtcclxuICAgICAgYWNjLnlMYXN0ID0geTtcclxuXHJcbiAgICAgIGlmICh4QWJzIDwgeUFicykge1xyXG4gICAgICAgIGFjYy54ID0gcHJvamVjdGlvblZlY3Rvci54O1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGFjYy55ID0gcHJvamVjdGlvblZlY3Rvci55O1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGFjYztcclxuICB9LCB7eDogbnVsbCwgeTogbnVsbCwgeExhc3Q6IG51bGwsIHlMYXN0OiBudWxsfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEVxdWFsVmVjdG9ycyhwcm9qZWN0VmVjdG9ycykge1xyXG4gIHJldHVybiBwcm9qZWN0VmVjdG9ycy5yZWR1Y2UoZnVuY3Rpb24gKGFjYywgcHJvamVjdGlvblZlY3Rvcikge1xyXG4gICAgaWYgKGFjYy54ID09PSBudWxsKSB7XHJcbiAgICAgIGFjYy54ID0gcHJvamVjdGlvblZlY3Rvci54O1xyXG4gICAgfSBlbHNlIGlmKGFjYy54ID09PSBwcm9qZWN0aW9uVmVjdG9yLnggJiYgYWNjLnhNYXRjaCAhPT0gZmFsc2UpIHtcclxuICAgICAgYWNjLnhNYXRjaCA9IHRydWU7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBhY2MueE1hdGNoID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGFjYy55ID09PSBudWxsKSB7XHJcbiAgICAgIGFjYy55ID0gcHJvamVjdGlvblZlY3Rvci55O1xyXG4gICAgfSBlbHNlIGlmKGFjYy55ID09PSBwcm9qZWN0aW9uVmVjdG9yLnkgJiYgYWNjLnlNYXRjaCAhPT0gZmFsc2UpIHtcclxuICAgICAgYWNjLnlNYXRjaCA9IHRydWU7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBhY2MueU1hdGNoID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGFjYztcclxuICB9LCB7eDogbnVsbCwgeE1hdGNoOiBudWxsLCB5OiBudWxsLCB5TWF0Y2g6IG51bGx9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0RmluYWxWZWN0b3IocHJvamVjdGlvblZlY3RvcnMpIHtcclxuICBjb25zdCBmaW5hbFZlY3RvciA9IHByb2plY3Rpb25WZWN0b3JzLnJlZHVjZShmdW5jdGlvbiAoZmluYWxPdmVybGFwLCBwcm9qZWN0aW9uVmVjdG9yKSB7XHJcbiAgICBpZiAoTWF0aC5hYnMocHJvamVjdGlvblZlY3Rvci54KSA8IE1hdGguYWJzKHByb2plY3Rpb25WZWN0b3IueSkpIHtcclxuICAgICAgaWYgKCFmaW5hbE92ZXJsYXAueCB8fCBNYXRoLmFicyhwcm9qZWN0aW9uVmVjdG9yLngpIDwgTWF0aC5hYnMoZmluYWxPdmVybGFwLngpKSB7XHJcbiAgICAgICAgZmluYWxPdmVybGFwLnggPSBwcm9qZWN0aW9uVmVjdG9yLng7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmICghZmluYWxPdmVybGFwLnkgfHwgTWF0aC5hYnMocHJvamVjdGlvblZlY3Rvci55KSA8IE1hdGguYWJzKGZpbmFsT3ZlcmxhcC55KSkge1xyXG4gICAgICAgIGZpbmFsT3ZlcmxhcC55ID0gcHJvamVjdGlvblZlY3Rvci55O1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZpbmFsT3ZlcmxhcDtcclxuICB9LCB7eDogbnVsbCwgeTogbnVsbH0pO1xyXG5cclxuICAvKmlmIChwcm9qZWN0aW9uVmVjdG9ycy5sZW5ndGggPT09IDEpIHtcclxuICAgIGlmIChNYXRoLmFicyhmaW5hbFZlY3Rvci54KSA8IE1hdGguYWJzKGZpbmFsVmVjdG9yLnkpKSB7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgeDogZmluYWxWZWN0b3IueCxcclxuICAgICAgICB5OiBudWxsXHJcbiAgICAgIH07XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHg6IG51bGwsXHJcbiAgICAgICAgeTogZmluYWxWZWN0b3IueVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIGVsc2Uge1xyXG4gICAgcmV0dXJuIGZpbmFsVmVjdG9yO1xyXG4gIH0qL1xyXG4gIHJldHVybiBmaW5hbFZlY3RvcjtcclxufVxyXG5cclxuY29uc3QgZ2V0SW5wdXRzID0gSW5wdXQoKTtcclxuY29uc3QgZ2V0RnJhbWVzID0gRnJhbWUoKTtcclxuY29uc3Qgdmlld3BvcnQgPSBWaWV3cG9ydDtcclxuY29uc3QgZnBzVUkgPSBGcmFnbWVudCgnZnBzJyk7XHJcblxyXG5nZXRGcmFtZXMoZnVuY3Rpb24gKGVsYXBzZWQsIGZwcykge1xyXG4gIGZwc1VJLnRleHRDb250ZW50ID0gZnBzO1xyXG4gIHJldHVybiB0cnVlO1xyXG59KTtcclxuXHJcbnNjZW5lXHJcbiAgLnRoZW4oZnVuY3Rpb24gKHNjZW5lKSB7XHJcbiAgICBjb25zdCBzY2VuZUJvdW5kcyA9IE9iamVjdC5mcmVlemUoe1xyXG4gICAgICB3aWR0aDogc2NlbmUuc2NlbmVXaWR0aCxcclxuICAgICAgaGVpZ2h0OiBzY2VuZS5zY2VuZUhlaWdodFxyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgY2FudmFzID0gRnJhZ21lbnQoJ2NhbnZhcy1lbnRpdGllcycpO1xyXG4gICAgY29uc3QgY29udGV4dDJkID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICBjb25zdCBjb2xsaWRlcnMgPSBPYmplY3QuZnJlZXplKHNjZW5lLmNvbGxpZGVycyk7XHJcblxyXG4gICAgY29uc3Qgc3ByaXRlcyA9IE9iamVjdC5mcmVlemUoc2NlbmUuc3ByaXRlcyk7XHJcbiAgICBjb25zdCBwbGF5ZXIgPSBzcHJpdGVzWzBdO1xyXG5cclxuICAgIGdldEZyYW1lcyhmdW5jdGlvbiAoZWxhcHNlZCkge1xyXG4gICAgICBjbGVhckNvbnRleHQoY29udGV4dDJkLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xyXG5cclxuICAgICAgY29uc3QgaW5wdXRzID0gZ2V0SW5wdXRzKCk7XHJcblxyXG4gICAgICBwbGF5ZXIudmVsb2NpdHkueSA9IDMwMDtcclxuXHJcbiAgICAgIGNvbnN0IHNwZWVkID0gNTA7XHJcbiAgICAgIGlmIChpbnB1dHNbMzddKSB7XHJcbiAgICAgICAgcGxheWVyLnZlbG9jaXR5LnggPSAtc3BlZWQ7XHJcbiAgICAgIH0gZWxzZSBpZiAoaW5wdXRzWzM5XSkge1xyXG4gICAgICAgIHBsYXllci52ZWxvY2l0eS54ID0gc3BlZWQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChpbnB1dHNbMzhdKSB7XHJcbiAgICAgICAgcGxheWVyLnZlbG9jaXR5LnkgPSAtc3BlZWQ7XHJcbiAgICAgIH0gZWxzZSBpZiAoaW5wdXRzWzQwXSkge1xyXG4gICAgICAgIHBsYXllci52ZWxvY2l0eS55ID0gc3BlZWQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHNwcml0ZXMuZm9yRWFjaChmdW5jdGlvbiAoc3ByaXRlKSB7XHJcbiAgICAgICAgc3ByaXRlLmxhc3RYID0gc3ByaXRlLng7XHJcbiAgICAgICAgc3ByaXRlLmxhc3RZID0gc3ByaXRlLnk7XHJcblxyXG4gICAgICAgIGNvbnN0IHZlbG9jaXR5WCA9IGdldFZlbG9jaXR5KHNwcml0ZSwgJ3gnLCBlbGFwc2VkKTtcclxuICAgICAgICBjb25zdCB4ID0gZ2V0UG9zaXRpb25EZWx0YShzcHJpdGUueCwgdmVsb2NpdHlYLCBlbGFwc2VkKTtcclxuXHJcbiAgICAgICAgY29uc3QgYm91bmRzRGlmZlggPSBnZXRJbm5lckRpZmYoeCwgc3ByaXRlLndpZHRoLCAwLCBzY2VuZUJvdW5kcy53aWR0aCk7XHJcbiAgICAgICAgY29uc3QgeDEgPSByZXNvbHZlQ29sbGlzaW9uKGJvdW5kc0RpZmZYLCB4KTtcclxuXHJcbiAgICAgICAgY29uc3QgdmVsb2NpdHlZID0gZ2V0VmVsb2NpdHkoc3ByaXRlLCAneScsIGVsYXBzZWQpO1xyXG4gICAgICAgIGNvbnN0IHkgPSBnZXRQb3NpdGlvbkRlbHRhKHNwcml0ZS55LCB2ZWxvY2l0eVksIGVsYXBzZWQpO1xyXG5cclxuICAgICAgICBjb25zdCBib3VuZHNEaWZmWSA9IGdldElubmVyRGlmZih5LCBzcHJpdGUuaGVpZ2h0LCAwLCBzY2VuZUJvdW5kcy5oZWlnaHQpO1xyXG4gICAgICAgIGNvbnN0IHkxID0gcmVzb2x2ZUNvbGxpc2lvbihib3VuZHNEaWZmWSwgeSk7XHJcblxyXG4gICAgICAgIGxldCB4MiA9IHgxO1xyXG4gICAgICAgIGxldCB5MiA9IHkxO1xyXG5cclxuICAgICAgICAvLyBtdXRhdGUgc3ByaXRlXHJcbiAgICAgICAgc3ByaXRlLnZlbG9jaXR5LnggPSB2ZWxvY2l0eVg7XHJcbiAgICAgICAgc3ByaXRlLnggPSB4MjtcclxuICAgICAgICBzcHJpdGUudmVsb2NpdHkueSA9IHZlbG9jaXR5WTtcclxuICAgICAgICBzcHJpdGUueSA9IHkyO1xyXG5cclxuICAgICAgICAvL2NvbnN0IHlEaXIgPSBzcHJpdGUueSAtIHNwcml0ZS5sYXN0WTtcclxuICAgICAgICAvL2NvbnN0IHhEaXIgPSBzcHJpdGUueCAtIHNwcml0ZS5sYXN0WDtcclxuXHJcbiAgICAgICAgY29uc3QgY29sbGlzaW9ucyA9IGdldENvbGxpc2lvbnMoc3ByaXRlLCBjb2xsaWRlcnMpO1xyXG4gICAgICAgIGNvbnN0IG92ZXJsYXBzID0gZ2V0T3ZlcmxhcHMoY29sbGlzaW9ucywgc3ByaXRlKTtcclxuICAgICAgICBjb25zdCBjb21iaW5lZCA9IGdldENvbWJpbmVkcyhvdmVybGFwcyk7XHJcbiAgICAgICAgY29uc3QgcmVzb2x1dGlvbiA9IGdldFJlc29sdXRpb24oY29tYmluZWQpO1xyXG5cclxuICAgICAgICBzcHJpdGUueCArPSByZXNvbHV0aW9uLng7XHJcbiAgICAgICAgc3ByaXRlLnkgKz0gcmVzb2x1dGlvbi55O1xyXG5cclxuICAgICAgICAvL2NvbnNvbGUubG9nKCdPdmVybGFwcycsIG92ZXJsYXBzKTtcclxuICAgICAgICAvL2NvbnNvbGUubG9nKCdDb21iaW5lZCcsIGNvbWJpbmVkKTtcclxuICAgICAgICAvL2NvbnNvbGUubG9nKCdSZXNvbHV0aW9uJywgcmVzb2x1dGlvbik7XHJcblxyXG5cclxuXHJcbiAgICAgICAgLy9jb25zdCBwcm9qZWN0aW9uVmVjdG9ycyA9IGdldFByb2plY3Rpb25WZWN0b3JzKG92ZXJsYXBzKTtcclxuICAgICAgICAvL2NvbnN0IGVxdWFsVmVjdG9ycyA9IGdldEVxdWFsVmVjdG9ycyhwcm9qZWN0aW9uVmVjdG9ycyk7XHJcbiAgICAgICAgLy9jb25zdCBmaW5hbFZlY3RvciA9IGdldEZpbmFsVmVjdG9yKHByb2plY3Rpb25WZWN0b3JzKTtcclxuICAgICAgICAvL2NvbnN0IGZvbyA9IGdldEZvbzMob3ZlcmxhcHMpO1xyXG5cclxuICAgICAgICAvKmlmIChNYXRoLmFicyh4T3ZlcmxhcCkgPCBNYXRoLmFicyh5T3ZlcmxhcCkpIHtcclxuICAgICAgICAgIHNwcml0ZS54ICs9IHhPdmVybGFwO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzcHJpdGUueSArPSB5T3ZlcmxhcDtcclxuICAgICAgICB9Ki9cclxuXHJcbiAgICAgICAgLyppZiAoZXF1YWxWZWN0b3JzLnhNYXRjaCkge1xyXG4gICAgICAgICAgc3ByaXRlLnggKz0gZXF1YWxWZWN0b3JzLng7XHJcbiAgICAgICAgfSBlbHNlIGlmKGVxdWFsVmVjdG9ycy55TWF0Y2gpIHtcclxuICAgICAgICAgIHNwcml0ZS55ICs9IGVxdWFsVmVjdG9ycy55O1xyXG4gICAgICAgIH0gZWxzZSBpZihmaW5hbFZlY3Rvci54KSB7XHJcbiAgICAgICAgICBzcHJpdGUueCArPSBmaW5hbFZlY3Rvci54O1xyXG4gICAgICAgIH0gZWxzZSBpZihmaW5hbFZlY3Rvci55KSB7XHJcbiAgICAgICAgICBzcHJpdGUueSArPSBmaW5hbFZlY3Rvci55O1xyXG4gICAgICAgIH0qL1xyXG5cclxuXHJcblxyXG5cclxuICAgICAgICAvKmlmIChmb28ueSAhPT0gOTk5OTk5KVxyXG4gICAgICAgICAgc3ByaXRlLnkgKz0gZm9vLnk7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCd5OiAnICsgZm9vLnkpO1xyXG5cclxuICAgICAgICBpZiAoZm9vLnggIT09IDk5OTk5OSlcclxuICAgICAgICAgIHNwcml0ZS54ICs9IGZvby54O1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygneDogJyArIGZvby54KTsqL1xyXG5cclxuICAgICAgICAgIC8vc3ByaXRlLnggKz0gZm9vLng7XHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyhlcXVhbFZlY3RvcnMpO1xyXG4gICAgICAgIC8vY29uc29sZS5sb2coZmluYWxWZWN0b3IpO1xyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgIGlmIChmaW5hbE92ZXJsYXAueCAmJiAhZmluYWxPdmVybGFwLnlNYXRjaCkge1xyXG4gICAgICAgICAgc3ByaXRlLnggKz0gZmluYWxPdmVybGFwLng7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZmluYWxPdmVybGFwLnkgJiYgIWZpbmFsT3ZlcmxhcC54TWF0Y2gpIHtcclxuICAgICAgICAgIHNwcml0ZS55ICs9IGZpbmFsT3ZlcmxhcC55O1xyXG4gICAgICAgIH0qL1xyXG5cclxuICAgICAgICBpZiAoc3ByaXRlID09PSBwbGF5ZXIpIHtcclxuICAgICAgICAgIGNvbnN0IG1pbk1hcmdpbiA9IHZpZXdwb3J0Lm1hcmdpbkxlZnQ7XHJcbiAgICAgICAgICBjb25zdCBtYXhNYXJnaW4gPSB2aWV3cG9ydC53aWR0aCAtIHZpZXdwb3J0Lm1hcmdpblJpZ2h0O1xyXG4gICAgICAgICAgY29uc3Qgdmlld3BvcnREaWZmWCA9IGdldElubmVyRGlmZihcclxuICAgICAgICAgICAgc3ByaXRlLngsXHJcbiAgICAgICAgICAgIHNwcml0ZS53aWR0aCxcclxuICAgICAgICAgICAgdmlld3BvcnQueCArIG1pbk1hcmdpbixcclxuICAgICAgICAgICAgdmlld3BvcnQueCArIG1heE1hcmdpblxyXG4gICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAvLyBtdXRhdGUgdmlld3BvcnRcclxuICAgICAgICAgIGlmICh2aWV3cG9ydERpZmZYID4gMCAmJiBzcHJpdGUudmVsb2NpdHkueCA+IDApIHtcclxuICAgICAgICAgICAgdmlld3BvcnQueCA9IGdldFBvc2l0aW9uRnJvbU1heE1hcmdpbihzcHJpdGUueCwgc3ByaXRlLndpZHRoLCBtYXhNYXJnaW4pO1xyXG4gICAgICAgICAgfSBlbHNlIGlmICh2aWV3cG9ydERpZmZYIDwgMCAmJiBzcHJpdGUudmVsb2NpdHkueCA8IDApIHtcclxuICAgICAgICAgICAgdmlld3BvcnQueCA9IGdldFBvc2l0aW9uRnJvbU1pbk1hcmdpbihzcHJpdGUueCwgbWluTWFyZ2luKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGZyYW1lID0gYXBwbHlBbmltYXRpb24oc3ByaXRlKTtcclxuICAgICAgICBjb25zdCBwb3MgPSB7eDogc3ByaXRlLngsIHk6IHNwcml0ZS55fTtcclxuXHJcbiAgICAgICAgcmVuZGVyKGNvbnRleHQyZCwgcG9zLCBmcmFtZSwgdmlld3BvcnQpO1xyXG4gICAgICAgIHJlbmRlclJlY3RzKGNvbnRleHQyZCwgY29sbGlkZXJzLCB2aWV3cG9ydCk7XHJcbiAgICAgICAgLy9yZW5kZXJMaW5lcyhjb250ZXh0MmQsIGNvbGxpZGVycywgdmlld3BvcnQpO1xyXG4gICAgICAgIHJlbmRlclJlY3RzKGNvbnRleHQyZCwgc3ByaXRlcywgdmlld3BvcnQpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHNjZW5lO1xyXG4gIH0pXHJcbiAgLnRoZW4oZnVuY3Rpb24gKHNjZW5lKSB7XHJcbiAgICBjb25zdCBiYWNrZ3JvdW5kSW1hZ2UgPSBzY2VuZS5iYWNrZ3JvdW5kSW1hZ2U7XHJcblxyXG4gICAgY29uc3QgY2FudmFzID0gRnJhZ21lbnQoJ2NhbnZhcy1iYWNrZ3JvdW5kJyk7XHJcbiAgICBjb25zdCBjb250ZXh0MmQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuXHJcbiAgICBnZXRGcmFtZXMoZnVuY3Rpb24gKCkge1xyXG4gICAgICBjbGVhckNvbnRleHQoY29udGV4dDJkLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xyXG4gICAgICAvL3JlbmRlcihjb250ZXh0MmQsIHt4OiAwLCB5OiAwfSwgYmFja2dyb3VuZEltYWdlLCB2aWV3cG9ydCk7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gc2NlbmU7XHJcbiAgfSk7XHJcbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IFNoYXVuIG9uIDMvMS8xNVxyXG4gKlxyXG4gKi9cclxuXHJcbmltcG9ydCB7Z2V0Q2FudmFzLCBnZXRUcmFuc3BhcmVudEltYWdlfSBmcm9tICcuLi9lbmdpbmUvY29tbW9uLmpzJztcclxuXHJcbmNvbnN0IERFRkFVTFRfUkFURSA9IDU7XHJcblxyXG5mdW5jdGlvbiBidWlsZEZyYW1lU2VxdWVuY2UoZnJhbWVTZXREZWZpbml0aW9uLCBmcmFtZVNpemUsIHNwcml0ZVNoZWV0KSB7XHJcbiAgdmFyIGZyYW1lV2lkdGggPSBmcmFtZVNpemUud2lkdGg7XHJcbiAgdmFyIGZyYW1lSGVpZ2h0ID0gZnJhbWVTaXplLmhlaWdodDtcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIHJhdGU6IGZyYW1lU2V0RGVmaW5pdGlvbi5yYXRlIHx8IERFRkFVTFRfUkFURSxcclxuICAgIGZyYW1lczogZnJhbWVTZXREZWZpbml0aW9uLmZyYW1lc1xyXG4gICAgICAubWFwKGZ1bmN0aW9uKGZyYW1lRGVmaW5pdGlvbikge1xyXG4gICAgICAgIHZhciBmcmFtZSA9IGdldENhbnZhcyhmcmFtZVdpZHRoLCBmcmFtZUhlaWdodCk7XHJcblxyXG4gICAgICAgIGZyYW1lXHJcbiAgICAgICAgICAuZ2V0Q29udGV4dCgnMmQnKVxyXG4gICAgICAgICAgLmRyYXdJbWFnZShcclxuICAgICAgICAgICAgc3ByaXRlU2hlZXQsXHJcbiAgICAgICAgICAgIGZyYW1lRGVmaW5pdGlvbi54LCBmcmFtZURlZmluaXRpb24ueSxcclxuICAgICAgICAgICAgZnJhbWVXaWR0aCwgZnJhbWVIZWlnaHQsXHJcbiAgICAgICAgICAgIDAsIDAsXHJcbiAgICAgICAgICAgIGZyYW1lV2lkdGgsIGZyYW1lSGVpZ2h0XHJcbiAgICAgICAgICApO1xyXG5cclxuICAgICAgICByZXR1cm4gZnJhbWU7XHJcbiAgICAgIH0pXHJcbiAgfTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKHNwcml0ZURlZmluaXRpb24sIHNwcml0ZVNoZWV0KSB7XHJcbiAgcmV0dXJuIE9iamVjdFxyXG4gICAgLmtleXMoc3ByaXRlRGVmaW5pdGlvbi5hbmltYXRpb25zKVxyXG4gICAgLnJlZHVjZShmdW5jdGlvbihmcmFtZVNldCwgZnJhbWVTZXRJZCkge1xyXG4gICAgICB2YXIgZnJhbWVTZXF1ZW5jZSA9IGJ1aWxkRnJhbWVTZXF1ZW5jZShcclxuICAgICAgICBzcHJpdGVEZWZpbml0aW9uLmFuaW1hdGlvbnNbZnJhbWVTZXRJZF0sXHJcbiAgICAgICAgc3ByaXRlRGVmaW5pdGlvbi5mcmFtZVNpemUsXHJcbiAgICAgICAgc3ByaXRlU2hlZXRcclxuICAgICAgKTtcclxuXHJcbiAgICAgIGZyYW1lU2VxdWVuY2UuZnJhbWVzID0gZnJhbWVTZXF1ZW5jZS5mcmFtZXNcclxuICAgICAgICAubWFwKGZ1bmN0aW9uKGZyYW1lKSB7XHJcbiAgICAgICAgICByZXR1cm4gZ2V0VHJhbnNwYXJlbnRJbWFnZShzcHJpdGVEZWZpbml0aW9uLnRyYW5zcGFyZW50Q29sb3IsIGZyYW1lKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgIGZyYW1lU2V0W2ZyYW1lU2V0SWRdID0gZnJhbWVTZXF1ZW5jZTtcclxuXHJcbiAgICAgIHJldHVybiBmcmFtZVNldDtcclxuICAgIH0sIHt9KTtcclxufTtcclxuIiwiaW1wb3J0IFNjaGVkdWxlciBmcm9tICcuLi9lbmdpbmUvc2NoZWR1bGVyLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChmcmFtZVNldCkge1xyXG4gIHZhciBjdXJyZW50RnJhbWVTZXF1ZW5jZSA9IGZyYW1lU2V0WydydW4nXSwgLy9udWxsLFxyXG4gICAgY3VycmVudEZyYW1lSW5kZXggPSAwLFxyXG4gICAgY3VycmVudEZyYW1lID0gbnVsbCxcclxuICAgIGZyYW1lQ2FsbGJhY2sgPSBudWxsO1xyXG5cclxuICB2YXIgc2NoZWR1bGVySWQgPSBTY2hlZHVsZXIoZnVuY3Rpb24oZGVsdGFUaW1lLCBzZXRSYXRlKSB7XHJcbiAgICBpZighY3VycmVudEZyYW1lU2VxdWVuY2UpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmKCFjdXJyZW50RnJhbWUpIHtcclxuICAgICAgc2V0UmF0ZShjdXJyZW50RnJhbWVTZXF1ZW5jZS5yYXRlKTtcclxuICAgIH1cclxuXHJcbiAgICBjdXJyZW50RnJhbWUgPSBjdXJyZW50RnJhbWVTZXF1ZW5jZS5mcmFtZXNbY3VycmVudEZyYW1lSW5kZXhdO1xyXG4gICAgaWYoZnJhbWVDYWxsYmFjaykge1xyXG4gICAgICBmcmFtZUNhbGxiYWNrKGN1cnJlbnRGcmFtZSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYoKytjdXJyZW50RnJhbWVJbmRleCA+PSBjdXJyZW50RnJhbWVTZXF1ZW5jZS5mcmFtZXMubGVuZ3RoKSB7XHJcbiAgICAgIGN1cnJlbnRGcmFtZUluZGV4ID0gMDtcclxuICAgIH1cclxuICB9KVxyXG4gICAgLmlkKCk7XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBwbGF5OiBmdW5jdGlvbihmcmFtZVNldElkKSB7XHJcbiAgICAgIGN1cnJlbnRGcmFtZVNlcXVlbmNlID0gZnJhbWVTZXRbZnJhbWVTZXRJZF07XHJcbiAgICAgIGN1cnJlbnRGcmFtZUluZGV4ID0gMDtcclxuICAgICAgY3VycmVudEZyYW1lID0gbnVsbDtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG4gICAgb25GcmFtZTogZnVuY3Rpb24oY2IpIHtcclxuICAgICAgZnJhbWVDYWxsYmFjayA9IGNiO1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcbiAgICBzdG9wOiBmdW5jdGlvbigpIHtcclxuICAgICAgY3VycmVudEZyYW1lU2VxdWVuY2UgPSBudWxsO1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcbiAgICBraWxsOiBmdW5jdGlvbigpIHtcclxuICAgICAgU2NoZWR1bGVyLnVuc2NoZWR1bGUoc2NoZWR1bGVySWQpO1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcbiAgICBjdXJyZW50RnJhbWVJbmRleDogZnVuY3Rpb24oKSB7XHJcbiAgICAgIHJldHVybiBjdXJyZW50RnJhbWVJbmRleDtcclxuICAgIH0sXHJcbiAgICBnZXRJbWFnZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgIHJldHVybiBjdXJyZW50RnJhbWU7XHJcbiAgICB9LFxyXG4gICAgZ2V0TmV4dDogZnVuY3Rpb24oKSB7XHJcbiAgICAgIGN1cnJlbnRGcmFtZSA9IGN1cnJlbnRGcmFtZVNlcXVlbmNlLmZyYW1lc1tjdXJyZW50RnJhbWVJbmRleF07XHJcbiAgICAgIGlmKCsrY3VycmVudEZyYW1lSW5kZXggPj0gY3VycmVudEZyYW1lU2VxdWVuY2UuZnJhbWVzLmxlbmd0aCkge1xyXG4gICAgICAgIGN1cnJlbnRGcmFtZUluZGV4ID0gMDtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gY3VycmVudEZyYW1lO1xyXG4gICAgfVxyXG4gIH07XHJcbn1cclxuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IHNoYXVud2VzdCBvbiA2LzI5LzE1LlxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBjbGVhckNvbnRleHQoY29udGV4dDJkLCB3aWR0aCwgaGVpZ2h0KSB7XG4gIGNvbnRleHQyZC5jbGVhclJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXIoY29udGV4dDJkLCBwb2ludCwgaW1hZ2UsIHZpZXdwb3J0KSB7XG4gIGlmKCFpbWFnZSkge1xuICAgIHJldHVybjtcbiAgfVxuICBjb250ZXh0MmQuZHJhd0ltYWdlKFxuICAgIGltYWdlLFxuICAgIHBvaW50LnggLSB2aWV3cG9ydC54IHx8IDAsXG4gICAgcG9pbnQueSAtIHZpZXdwb3J0LnkgfHwgMFxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyUmVjdHMoY29udGV4dDJkLCByZWN0cywgdmlld3BvcnQsIGNvbG9yKSB7XG4gIGNvbG9yID0gY29sb3IgfHwgJyMwMDAwMDAnO1xuICByZWN0cy5mb3JFYWNoKGZ1bmN0aW9uIChyZWN0KSB7XG4gICAgY29udGV4dDJkLnN0cm9rZVN0eWxlID0gY29sb3I7XG4gICAgY29udGV4dDJkLnN0cm9rZVJlY3QocmVjdC54IC0gdmlld3BvcnQueCwgcmVjdC55IC0gdmlld3BvcnQueSwgcmVjdC53aWR0aCwgcmVjdC5oZWlnaHQpO1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlckxpbmVzKGNvbnRleHQyZCwgbGluZXMsIHZpZXdwb3J0KSB7XG4gIGxpbmVzLmZvckVhY2goZnVuY3Rpb24gKGxpbmUpIHtcbiAgICBjb250ZXh0MmQuYmVnaW5QYXRoKCk7XG4gICAgY29udGV4dDJkLm1vdmVUbyhsaW5lLngxIC0gdmlld3BvcnQueCwgbGluZS55MSAtIHZpZXdwb3J0LnkpO1xuICAgIGNvbnRleHQyZC5saW5lVG8obGluZS54MiAtIHZpZXdwb3J0LngsIGxpbmUueTIgLSB2aWV3cG9ydC55KTtcbiAgICBjb250ZXh0MmQuc3Ryb2tlKCk7XG4gIH0pO1xufVxuIiwiXHJcbmltcG9ydCBVdGlsIGZyb20gJy4vdXRpbC5qcyc7XHJcblxyXG4vLyBSZXR1cm4gZXZlcnl0aGluZyBiZWZvcmUgdGhlIGxhc3Qgc2xhc2ggb2YgYSB1cmxcclxuLy8gZS5nLiBodHRwOi8vZm9vL2Jhci9iYXouanNvbiA9PiBodHRwOi8vZm9vL2JhclxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0QmFzZVVybCh1cmwpIHtcclxuICB2YXIgbiA9IHVybC5sYXN0SW5kZXhPZignLycpO1xyXG4gIHJldHVybiB1cmwuc3Vic3RyaW5nKDAsIG4pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaXNGdWxsVXJsKHVybCkge1xyXG4gIHJldHVybiAodXJsLnN1YnN0cmluZygwLCA3KSA9PT0gJ2h0dHA6Ly8nIHx8XHJcbiAgICB1cmwuc3Vic3RyaW5nKDAsIDgpID09PSAnaHR0cHM6Ly8nKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZVVybCh1cmwsIGJhc2VVcmwpIHtcclxuICBpZihiYXNlVXJsICYmICFpc0Z1bGxVcmwodXJsKSkge1xyXG4gICAgcmV0dXJuIGJhc2VVcmwgKyAnLycgKyB1cmw7XHJcbiAgfVxyXG4gIHJldHVybiB1cmw7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBtZXJnZU9iamVjdChzb3VyY2UsIGRlc3RpbmF0aW9uLCBhbGxvd1dyYXAsIGV4Y2VwdGlvbk9uQ29sbGlzaW9ucykge1xyXG4gIHNvdXJjZSA9IHNvdXJjZSB8fCB7fTsgLy9Qb29sLmdldE9iamVjdCgpO1xyXG4gIGRlc3RpbmF0aW9uID0gZGVzdGluYXRpb24gfHwge307IC8vUG9vbC5nZXRPYmplY3QoKTtcclxuXHJcbiAgT2JqZWN0LmtleXMoc291cmNlKS5mb3JFYWNoKGZ1bmN0aW9uKHByb3ApIHtcclxuICAgIGFzc2lnblByb3BlcnR5KHNvdXJjZSwgZGVzdGluYXRpb24sIHByb3AsIGFsbG93V3JhcCwgZXhjZXB0aW9uT25Db2xsaXNpb25zKTtcclxuICB9KTtcclxuXHJcbiAgcmV0dXJuIGRlc3RpbmF0aW9uO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gYXNzaWduUHJvcGVydHkoc291cmNlLCBkZXN0aW5hdGlvbiwgcHJvcCwgYWxsb3dXcmFwLCBleGNlcHRpb25PbkNvbGxpc2lvbnMpIHtcclxuICBpZihkZXN0aW5hdGlvbi5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xyXG4gICAgaWYoYWxsb3dXcmFwKSB7XHJcbiAgICAgIGRlc3RpbmF0aW9uW3Byb3BdID0gRnVuYy53cmFwKGRlc3RpbmF0aW9uW3Byb3BdLCBzb3VyY2VbcHJvcF0pO1xyXG4gICAgICBVdGlsLmxvZygnTWVyZ2U6IHdyYXBwZWQgXFwnJyArIHByb3AgKyAnXFwnJyk7XHJcbiAgICB9IGVsc2UgaWYoZXhjZXB0aW9uT25Db2xsaXNpb25zKSB7XHJcbiAgICAgIFV0aWwuZXJyb3IoJ0ZhaWxlZCB0byBtZXJnZSBtaXhpbi4gTWV0aG9kIFxcJycgK1xyXG4gICAgICBwcm9wICsgJ1xcJyBjYXVzZWQgYSBuYW1lIGNvbGxpc2lvbi4nKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGRlc3RpbmF0aW9uW3Byb3BdID0gc291cmNlW3Byb3BdO1xyXG4gICAgICBVdGlsLmxvZygnTWVyZ2U6IG92ZXJ3cm90ZSBcXCcnICsgcHJvcCArICdcXCcnKTtcclxuICAgIH1cclxuICAgIHJldHVybiBkZXN0aW5hdGlvbjtcclxuICB9XHJcblxyXG4gIGRlc3RpbmF0aW9uW3Byb3BdID0gc291cmNlW3Byb3BdO1xyXG5cclxuICByZXR1cm4gZGVzdGluYXRpb247XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRDYW52YXMod2lkdGgsIGhlaWdodCkge1xyXG4gIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuXHJcbiAgY2FudmFzLndpZHRoID0gd2lkdGggfHwgNTAwO1xyXG4gIGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQgfHwgNTAwO1xyXG5cclxuICByZXR1cm4gY2FudmFzO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaW50ZXJzZWN0cyhyZWN0QSwgcmVjdEIpIHtcclxuICByZXR1cm4gIShcclxuICAgIHJlY3RBLnggKyByZWN0QS53aWR0aCA8IHJlY3RCLnggfHxcclxuICAgIHJlY3RBLnkgKyByZWN0QS5oZWlnaHQgPCByZWN0Qi55IHx8XHJcbiAgICByZWN0QS54ID4gcmVjdEIueCArIHJlY3RCLndpZHRoIHx8XHJcbiAgICByZWN0QS55ID4gcmVjdEIueSArIHJlY3RCLmhlaWdodFxyXG4gICk7XHJcbn1cclxuXHJcbi8vIE1ha2UgdGhlIGdpdmVuIFJHQiB2YWx1ZSB0cmFuc3BhcmVudCBpbiB0aGUgZ2l2ZW4gaW1hZ2UuXHJcbi8vIFJldHVybnMgYSBuZXcgaW1hZ2UuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRUcmFuc3BhcmVudEltYWdlKHRyYW5zUkdCLCBpbWFnZSkge1xyXG4gIHZhciByLCBnLCBiLCBuZXdJbWFnZSwgZGF0YUxlbmd0aDtcclxuICB2YXIgd2lkdGggPSBpbWFnZS53aWR0aDtcclxuICB2YXIgaGVpZ2h0ID0gaW1hZ2UuaGVpZ2h0O1xyXG4gIHZhciBpbWFnZURhdGEgPSBpbWFnZVxyXG4gICAgLmdldENvbnRleHQoJzJkJylcclxuICAgIC5nZXRJbWFnZURhdGEoMCwgMCwgd2lkdGgsIGhlaWdodCk7XHJcblxyXG4gIGlmKHRyYW5zUkdCKSB7XHJcbiAgICBkYXRhTGVuZ3RoID0gd2lkdGggKiBoZWlnaHQgKiA0O1xyXG5cclxuICAgIGZvcih2YXIgaW5kZXggPSAwOyBpbmRleCA8IGRhdGFMZW5ndGg7IGluZGV4Kz00KSB7XHJcbiAgICAgIHIgPSBpbWFnZURhdGEuZGF0YVtpbmRleF07XHJcbiAgICAgIGcgPSBpbWFnZURhdGEuZGF0YVtpbmRleCArIDFdO1xyXG4gICAgICBiID0gaW1hZ2VEYXRhLmRhdGFbaW5kZXggKyAyXTtcclxuICAgICAgaWYociA9PT0gdHJhbnNSR0JbMF0gJiYgZyA9PT0gdHJhbnNSR0JbMV0gJiYgYiA9PT0gdHJhbnNSR0JbMl0pIHtcclxuICAgICAgICBpbWFnZURhdGEuZGF0YVtpbmRleCArIDNdID0gMDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgbmV3SW1hZ2UgPSBnZXRDYW52YXMod2lkdGgsIGhlaWdodCk7XHJcbiAgbmV3SW1hZ2VcclxuICAgIC5nZXRDb250ZXh0KCcyZCcpXHJcbiAgICAucHV0SW1hZ2VEYXRhKGltYWdlRGF0YSwgMCwgMCk7XHJcblxyXG4gIHJldHVybiBuZXdJbWFnZTtcclxufVxyXG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBTaGF1biBvbiA0LzIzLzIwMTUuXHJcbiAqL1xyXG5cclxudmFyIGFsbERhdGFFbGVtZW50cztcclxuXHJcbmZ1bmN0aW9uIGhhc0RhdGFBdHRyaWJ1dGUoZWxlbWVudCkge1xyXG4gIHZhciBhdHRyaWJ1dGVzID0gZWxlbWVudC5hdHRyaWJ1dGVzO1xyXG4gIGZvcih2YXIgaSA9IDAsIG51bUF0dHJpYnV0ZXMgPSBhdHRyaWJ1dGVzLmxlbmd0aDsgaSA8IG51bUF0dHJpYnV0ZXM7IGkrKykge1xyXG4gICAgaWYoYXR0cmlidXRlc1tpXS5uYW1lLnN1YnN0cigwLCA0KSA9PT0gJ2RhdGEnKSB7XHJcbiAgICAgIHJldHVybiBlbGVtZW50O1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGZpbmREYXRhRWxlbWVudHMgKHBhcmVudEVsZW1lbnQpIHtcclxuICB2YXIgYWxsRWxlbWVudHMsIGVsZW1lbnQsIGRhdGFFbGVtZW50cyA9IFtdO1xyXG5cclxuICBpZighcGFyZW50RWxlbWVudCkge1xyXG4gICAgdmFyIGh0bWwgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaHRtbCcpO1xyXG4gICAgaWYoIWh0bWxbMF0pIHtcclxuICAgICAgcmV0dXJuIGRhdGFFbGVtZW50cztcclxuICAgIH1cclxuICAgIHBhcmVudEVsZW1lbnQgPSBodG1sWzBdO1xyXG4gIH1cclxuXHJcbiAgYWxsRWxlbWVudHMgPSBwYXJlbnRFbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyonKTtcclxuICBmb3IodmFyIGkgPSAwLCBudW1FbGVtZW50cyA9IGFsbEVsZW1lbnRzLmxlbmd0aDsgaSA8IG51bUVsZW1lbnRzOyBpKyspIHtcclxuICAgIGVsZW1lbnQgPSBhbGxFbGVtZW50c1tpXTtcclxuICAgIGlmKGhhc0RhdGFBdHRyaWJ1dGUoZWxlbWVudCkpIHtcclxuICAgICAgZGF0YUVsZW1lbnRzLnB1c2goZWxlbWVudCk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBkYXRhRWxlbWVudHM7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBGcmFnbWVudHMgKG5hbWUpIHtcclxuICBpZighYWxsRGF0YUVsZW1lbnRzKSB7XHJcbiAgICBjYWNoZURhdGFFbGVtZW50cygpO1xyXG4gIH1cclxuICByZXR1cm4gYWxsRGF0YUVsZW1lbnRzLmZpbHRlcihmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICBpZihlbGVtZW50Lmhhc0F0dHJpYnV0ZSgnZGF0YS0nICsgbmFtZSkpIHtcclxuICAgICAgcmV0dXJuIGVsZW1lbnQ7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBGcmFnbWVudCAobmFtZSkge1xyXG4gIHJldHVybiBGcmFnbWVudHMobmFtZSlbMF07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjYWNoZURhdGFFbGVtZW50cygpIHtcclxuICBhbGxEYXRhRWxlbWVudHMgPSBmaW5kRGF0YUVsZW1lbnRzKCk7XHJcbn1cclxuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IHNoYXVud2VzdCBvbiA2LzIwLzE1LlxuICovXG5cbmNvbnN0IE1TX1BFUl9TRUNPTkQgPSAxMDAwO1xuXG5mdW5jdGlvbiBnZXREZWx0YVRpbWUobm93LCBsYXN0VXBkYXRlVGltZSkge1xuICByZXR1cm4gKG5vdyAtIGxhc3RVcGRhdGVUaW1lKSAvIE1TX1BFUl9TRUNPTkQ7XG59XG5cbi8vIFNUQVRFRlVMXG5mdW5jdGlvbiBGcmFtZUxvb3Aoc3RhcnQpIHtcbiAgbGV0IGNicyA9IFtdLCBsYXN0ID0gc3RhcnQsIGZwcyA9IDAsIGZyYW1lQ291bnQgPSAwO1xuICBsZXQgaW50ZXJ2YWxJZCA9IHNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcbiAgICBmcHMgPSBmcmFtZUNvdW50O1xuICAgIGZyYW1lQ291bnQgPSAwO1xuICB9LCBNU19QRVJfU0VDT05EKTtcblxuICAoZnVuY3Rpb24gbG9vcCgpIHtcbiAgICBmcmFtZUNvdW50Kys7XG5cbiAgICBjYnMgPSBjYnNcbiAgICAgIC5tYXAoZnVuY3Rpb24gKGNiKSB7XG4gICAgICAgIHJldHVybiBjYihmcHMsIGxhc3QpICYmIGNiO1xuICAgICAgfSlcbiAgICAgIC5maWx0ZXIoZnVuY3Rpb24gKGNiKSB7XG4gICAgICAgIHJldHVybiBjYjtcbiAgICAgIH0pO1xuXG4gICAgbGFzdCA9ICtuZXcgRGF0ZSgpO1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShsb29wKTtcbiAgfSkoKTtcblxuICByZXR1cm4gZnVuY3Rpb24gKGNiKSB7XG4gICAgY2JzLnB1c2goY2IpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBGcmFtZSgpIHtcbiAgY29uc3QgZnJhbWVMb29wID0gRnJhbWVMb29wKCtuZXcgRGF0ZSgpKTtcblxuICByZXR1cm4gZnVuY3Rpb24gKGNiKSB7XG4gICAgZnJhbWVMb29wKGZ1bmN0aW9uIChmcHMsIGxhc3RVcGRhdGVUaW1lKSB7XG4gICAgICBjb25zdCBlbGFwc2VkID0gZ2V0RGVsdGFUaW1lKCtuZXcgRGF0ZSgpLCBsYXN0VXBkYXRlVGltZSk7XG4gICAgICByZXR1cm4gY2IoZWxhcHNlZCwgZnBzKTtcbiAgICB9KTtcbiAgfVxufVxuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IFNoYXVuIG9uIDUvMS8xNC5cbiAqL1xuXG52YXIgSU1BR0VfV0FJVF9JTlRFUlZBTCA9IDEwMDtcblxuZnVuY3Rpb24gd2FpdEZvckltYWdlIChpbWFnZSkge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgdmFyIGludGVydmFsSWQgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICAgIGlmKGltYWdlLmNvbXBsZXRlKSB7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZCk7XG4gICAgICAgIHJlc29sdmUoaW1hZ2UpO1xuICAgICAgfVxuICAgIH0sIElNQUdFX1dBSVRfSU5URVJWQUwpO1xuXG4gICAgaW1hZ2Uub25lcnJvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZCk7XG4gICAgICByZWplY3QoKTtcbiAgICB9O1xuICB9KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0SW1hZ2UgKHVyaSkge1xuICB2YXIgaW1hZ2UsIHByb21pc2U7XG5cbiAgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgaW1hZ2Uuc3JjID0gdXJpO1xuXG4gIHByb21pc2UgPSB3YWl0Rm9ySW1hZ2UoaW1hZ2UpO1xuXG4gIHJldHVybiBwcm9taXNlO1xufVxuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IHNoYXVud2VzdCBvbiA2LzI4LzE1LlxuICovXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIElucHV0KCkge1xuICB2YXIga2V5cyA9IHt9O1xuXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAga2V5c1tldmVudC5rZXlDb2RlXSA9IHRydWU7XG4gIH0pO1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICBrZXlzW2V2ZW50LmtleUNvZGVdID0gZmFsc2U7XG4gIH0pO1xuXG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGtleXM7XG4gIH07XG59XG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBTaGF1biBvbiAyLzEvMTVcclxuICogQmFzZWQgb24gdGhlIGphY2syZCBDaHJvbm8gb2JqZWN0XHJcbiAqIFxyXG4gKi9cclxuXHJcbmltcG9ydCBVdGlsIGZyb20gJy4vdXRpbC5qcyc7XHJcbmltcG9ydCB7bWVyZ2VPYmplY3R9IGZyb20gJy4vY29tbW9uLmpzJztcclxuXHJcbnZhciBpbnN0YW5jZTtcclxudmFyIE9ORV9TRUNPTkQgPSAxMDAwO1xyXG5cclxuLy8gZ2V0IHJpZCBvZiBpbnN0YW5jZSBzdHVmZi4gSnVzdCB1c2UgdGhlIGRpIGNvbnRhaW5lcidzIHJlZ2lzdGVyU2luZ2xldG9uL3VzZVxyXG5mdW5jdGlvbiBTY2hlZHVsZXIoY2IsIHJhdGUpIHtcclxuICBpZighaW5zdGFuY2UpIHtcclxuICAgIGluc3RhbmNlID0gY3JlYXRlKCk7XHJcbiAgfVxyXG4gIGlmKGNiKSB7XHJcbiAgICBpbnN0YW5jZS5zY2hlZHVsZShjYiwgcmF0ZSk7XHJcbiAgfVxyXG4gIHJldHVybiBpbnN0YW5jZTtcclxufVxyXG5cclxuU2NoZWR1bGVyLmluc3RhbmNlID0gY3JlYXRlO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlKCkge1xyXG4gIHJldHVybiBtZXJnZU9iamVjdCh7XHJcbiAgICBzY2hlZHVsZWQ6IFtdLFxyXG4gICAgc2NoZWR1bGU6IHNjaGVkdWxlLFxyXG4gICAgdW5zY2hlZHVsZTogdW5zY2hlZHVsZSxcclxuICAgIHN0YXJ0OiBzdGFydCxcclxuICAgIHN0b3A6IHN0b3AsXHJcbiAgICBmcmFtZTogZnJhbWUsXHJcbiAgICBpZDogaWRcclxuICB9KS5zdGFydCgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzY2hlZHVsZShjYiwgcmF0ZSkge1xyXG4gIGZ1bmN0aW9uIHNldFJhdGUobmV3UmF0ZSkge1xyXG4gICAgcmF0ZSA9IG5ld1JhdGU7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBtYWtlRnJhbWUoKSB7XHJcbiAgICB2YXIgY291bnQgPSAxLFxyXG4gICAgICB0b3RhbERlbHRhVGltZSA9IDA7XHJcblxyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKGRlbHRhVGltZSkge1xyXG4gICAgICB0b3RhbERlbHRhVGltZSArPSBkZWx0YVRpbWU7XHJcbiAgICAgIGlmKGNvdW50ICE9PSByYXRlKSB7XHJcbiAgICAgICAgY291bnQrKztcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgY2IodG90YWxEZWx0YVRpbWUsIHNldFJhdGUpO1xyXG4gICAgICBjb3VudCA9IDE7XHJcbiAgICAgIHRvdGFsRGVsdGFUaW1lID0gMDtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBpZighVXRpbC5pc0Z1bmN0aW9uKGNiKSkge1xyXG4gICAgVXRpbC5lcnJvcignU2NoZWR1bGVyOiBvbmx5IGZ1bmN0aW9ucyBjYW4gYmUgc2NoZWR1bGVkLicpO1xyXG4gIH1cclxuICByYXRlID0gcmF0ZSB8fCAxO1xyXG5cclxuICB0aGlzLnNjaGVkdWxlZC5wdXNoKG1ha2VGcmFtZSgpKTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlkKCkge1xyXG4gIHJldHVybiB0aGlzLnNjaGVkdWxlZC5sZW5ndGg7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHVuc2NoZWR1bGUoaWQpIHtcclxuICB0aGlzLnNjaGVkdWxlZC5zcGxpY2UoaWQgLSAxLCAxKTtcclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuZnVuY3Rpb24gc3RhcnQoKSB7XHJcbiAgaWYodGhpcy5ydW5uaW5nKSB7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIG1lcmdlT2JqZWN0KHtcclxuICAgIGFjdHVhbEZwczogMCxcclxuICAgIHRpY2tzOiAwLFxyXG4gICAgZWxhcHNlZFNlY29uZHM6IDAsXHJcbiAgICBydW5uaW5nOiB0cnVlLFxyXG4gICAgbGFzdFVwZGF0ZVRpbWU6IG5ldyBEYXRlKCksXHJcbiAgICBvbmVTZWNvbmRUaW1lcklkOiB3aW5kb3cuc2V0SW50ZXJ2YWwob25PbmVTZWNvbmQuYmluZCh0aGlzKSwgT05FX1NFQ09ORClcclxuICB9LCB0aGlzKTtcclxuXHJcbiAgcmV0dXJuIHRoaXMuZnJhbWUoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gc3RvcCgpIHtcclxuICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcclxuICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLm9uZVNlY29uZFRpbWVySWQpO1xyXG4gIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLmFuaW1hdGlvbkZyYW1lSWQpO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuZnVuY3Rpb24gY2xlYXIoKSB7XHJcbiAgdGhpcy5zY2hlZHVsZWQubGVuZ3RoID0gMDtcclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuZnVuY3Rpb24gZnJhbWUoKSB7XHJcbiAgZXhlY3V0ZUZyYW1lQ2FsbGJhY2tzLmJpbmQodGhpcykoZ2V0RGVsdGFUaW1lLmJpbmQodGhpcykoKSk7XHJcbiAgdGhpcy50aWNrcysrO1xyXG5cclxuICBpZih0aGlzLnJ1bm5pbmcpIHtcclxuICAgIHRoaXMuYW5pbWF0aW9uRnJhbWVJZCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnJhbWUuYmluZCh0aGlzKSk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuZnVuY3Rpb24gb25PbmVTZWNvbmQoKSB7XHJcbiAgdGhpcy5hY3R1YWxGcHMgPSB0aGlzLnRpY2tzO1xyXG4gIHRoaXMudGlja3MgPSAwO1xyXG4gIHRoaXMuZWxhcHNlZFNlY29uZHMrKztcclxufVxyXG5cclxuZnVuY3Rpb24gZXhlY3V0ZUZyYW1lQ2FsbGJhY2tzKGRlbHRhVGltZSkge1xyXG4gIHZhciBzY2hlZHVsZWQgPSB0aGlzLnNjaGVkdWxlZDtcclxuXHJcbiAgZm9yKHZhciBpID0gMCwgbnVtU2NoZWR1bGVkID0gc2NoZWR1bGVkLmxlbmd0aDsgaSA8IG51bVNjaGVkdWxlZDsgaSsrKSB7XHJcbiAgICBzY2hlZHVsZWRbaV0oZGVsdGFUaW1lKTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldERlbHRhVGltZSgpIHtcclxuICB2YXIgbm93ID0gK25ldyBEYXRlKCk7XHJcbiAgdmFyIGRlbHRhVGltZSA9IChub3cgLSB0aGlzLmxhc3RVcGRhdGVUaW1lKSAvIE9ORV9TRUNPTkQ7XHJcblxyXG4gIHRoaXMubGFzdFVwZGF0ZVRpbWUgPSBub3c7XHJcblxyXG4gIHJldHVybiBkZWx0YVRpbWU7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFNjaGVkdWxlcjtcclxuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IHNoYXVud2VzdCBvbiA2LzExLzE1LlxuICovXG5cblxuaW1wb3J0IFZhbHZlIGZyb20gJy4uL3ZhbHZlLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZmV0Y2hKU09OKHVyaSkge1xuICAvL3JldHVybiBWYWx2ZS5jcmVhdGUoZmV0Y2godXJpKS50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlLmpzb24oKSkpO1xuICByZXR1cm4gZmV0Y2godXJpKS50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlLmpzb24oKSk7XG59IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgU2hhdW4gb24gNC8yMy8yMDE1LlxyXG4gKi9cclxuXHJcbnZhciB0eXBlcyA9IFsnQXJyYXknLCAnT2JqZWN0JywgJ0Jvb2xlYW4nLCAnQXJndW1lbnRzJywgJ0Z1bmN0aW9uJywgJ1N0cmluZycsICdOdW1iZXInLCAnRGF0ZScsICdSZWdFeHAnXTtcclxuXHJcbnZhciBVdGlsID0ge1xyXG4gIGlzRGVmaW5lZDogZnVuY3Rpb24gKHZhbHVlKSB7IHJldHVybiB0eXBlb2YgdmFsdWUgIT0gJ3VuZGVmaW5lZCcgfSxcclxuICBkZWY6IGZ1bmN0aW9uICh2YWx1ZSwgZGVmYXVsdFZhbHVlKSB7IHJldHVybiAodHlwZW9mIHZhbHVlID09ICd1bmRlZmluZWQnKSA/IGRlZmF1bHRWYWx1ZSA6IHZhbHVlIH0sXHJcbiAgZXJyb3I6IGZ1bmN0aW9uIChtZXNzYWdlKSB7IHRocm93IG5ldyBFcnJvcihpZCArICc6ICcgKyBtZXNzYWdlKSB9LFxyXG4gIHdhcm46IGZ1bmN0aW9uIChtZXNzYWdlKSB7IFV0aWwubG9nKCdXYXJuaW5nOiAnICsgbWVzc2FnZSkgfSxcclxuICBsb2c6IGZ1bmN0aW9uIChtZXNzYWdlKSB7IGlmKGNvbmZpZy5sb2cpIHsgY29uc29sZS5sb2coaWQgKyAnOiAnICsgbWVzc2FnZSkgfSB9LFxyXG4gIGFyZ3NUb0FycmF5OiBmdW5jdGlvbiAoYXJncykgeyByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJncykgfSxcclxuICByYW5kOiBmdW5jdGlvbiAobWF4LCBtaW4pIHsgLy8gbW92ZSB0byBleHRyYT9cclxuICAgIG1pbiA9IG1pbiB8fCAwO1xyXG4gICAgaWYobWluID4gbWF4KSB7IFV0aWwuZXJyb3IoJ3JhbmQ6IGludmFsaWQgcmFuZ2UuJyk7IH1cclxuICAgIHJldHVybiBNYXRoLmZsb29yKChNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKSkgKyAobWluKTtcclxuICB9XHJcbn07XHJcblxyXG5mb3IodmFyIGkgPSAwOyBpIDwgdHlwZXMubGVuZ3RoOyBpKyspIHtcclxuICBVdGlsWydpcycgKyB0eXBlc1tpXV0gPSAoZnVuY3Rpb24odHlwZSkge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaikge1xyXG4gICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT0gJ1tvYmplY3QgJyArIHR5cGUgKyAnXSc7XHJcbiAgICB9O1xyXG4gIH0pKHR5cGVzW2ldKTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgVXRpbDsiLCIvKipcbiAqIENyZWF0ZWQgYnkgc2hhdW53ZXN0IG9uIDYvMjAvMTUuXG4gKlxuICogVE9ETzogZGlzcG9zZSgpXG4gKi9cblxuLyoqXG4gKlxudmFyIHZhbHZlID0gVmFsdmUuY3JlYXRlKGZ1bmN0aW9uIChlbWl0LCBlcnJvcikge1xuICBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgZXJyb3IoJ2hlbGxvJyk7XG4gIH0sIDUwMCk7XG59KS50aGVuKGZ1bmN0aW9uIChtc2cpIHtcbiAgcmV0dXJuIG1zZyArICcgU2hhdW4nO1xufSkudGhlbihmdW5jdGlvbiAobmV3TXNnKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuICAgIHNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcbiAgICAgIHJlc29sdmUobmV3TXNnICsgJyEhISEnKTtcbiAgICB9LCA1MDApO1xuICB9KTtcbn0pLnRoZW4oXG4gIGZ1bmN0aW9uIChuZXdlck1zZykge1xuICAgIGNvbnNvbGUubG9nKG5ld2VyTXNnKTtcbiAgfSwgZnVuY3Rpb24gKG1zZykge1xuICAgIGNvbnNvbGUubG9nKG1zZyk7XG4gIH0pO1xuKi9cblxuZnVuY3Rpb24gY2xvbmVBcnJheShhcnJheSkge1xuICByZXR1cm4gYXJyYXkuc2xpY2UoMCk7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZUFsbCh0aGVuYWJsZXMsIGRvQXBwbHkpIHtcbiAgcmV0dXJuIFZhbHZlLmNyZWF0ZShmdW5jdGlvbiAoZW1pdCkge1xuICAgIHZhciBjb3VudCA9IHRoZW5hYmxlcy5sZW5ndGg7XG4gICAgdmFyIHZhbHVlcyA9IFtdO1xuXG4gICAgZnVuY3Rpb24gY2hlY2tDb3VudCgpIHtcbiAgICAgIGlmKC0tY291bnQgPT09IDApIHtcbiAgICAgICAgKGRvQXBwbHkpID9cbiAgICAgICAgICBlbWl0LmFwcGx5KG51bGwsIHZhbHVlcykgOlxuICAgICAgICAgIGVtaXQodmFsdWVzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGVuYWJsZXMuZm9yRWFjaChmdW5jdGlvbiAodGhlbmFibGUsIGluZGV4KSB7XG4gICAgICBpZighdGhlbmFibGUpIHtcbiAgICAgICAgdGhyb3cgJ0ltcGxlbWVudCBlcnJvciBzY2VuYXJpbyc7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYoIXRoZW5hYmxlLnRoZW4pIHtcbiAgICAgICAgdmFsdWVzW2luZGV4XSA9IHRoZW5hYmxlO1xuICAgICAgICBjaGVja0NvdW50KCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhlbmFibGUudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdmFsdWVzW2luZGV4XSA9IHZhbHVlO1xuICAgICAgICBjaGVja0NvdW50KCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSlcbn1cblxuZnVuY3Rpb24gaXRlcmF0ZShpdGVyYXRvciwgdmFsdWUsIGF0dGFjaGVkLCBmYWlsZWQpIHtcbiAgbGV0IGl0ZW0gPSBpdGVyYXRvci5uZXh0KCk7XG4gIGlmIChpdGVtLmRvbmUpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBsZXQgbGlzdGVuZXIgPSAoZmFpbGVkKSA/XG4gICAgaXRlbS52YWx1ZS5mYWlsIDpcbiAgICBpdGVtLnZhbHVlLnN1Y2Nlc3M7XG5cbiAgaWYgKHZhbHVlICYmIHZhbHVlLnRoZW4pIHtcbiAgICBpZih2YWx1ZS5hdHRhY2hlZCkge1xuICAgICAgYXR0YWNoZWQgPSBhdHRhY2hlZC5jb25jYXQodmFsdWUuYXR0YWNoZWQpO1xuICAgIH1cblxuICAgIHZhbHVlLnRoZW4oXG4gICAgICBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgaXRlcmF0ZShpdGVyYXRvciwgbGlzdGVuZXIuYXBwbHkobnVsbCwgW3ZhbHVlXS5jb25jYXQoYXR0YWNoZWQpKSwgYXR0YWNoZWQsIGZhaWxlZCk7XG4gICAgICB9LFxuICAgICAgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIGl0ZXJhdGUoaXRlcmF0b3IsIGxpc3RlbmVyLmFwcGx5KG51bGwsIFt2YWx1ZV0uY29uY2F0KGF0dGFjaGVkKSksIGF0dGFjaGVkLCB0cnVlKTtcbiAgICAgIH1cbiAgICApO1xuICAgIHJldHVybjtcbiAgfVxuICBpdGVyYXRlKGl0ZXJhdG9yLCBsaXN0ZW5lci5hcHBseShudWxsLCBbdmFsdWVdLmNvbmNhdChhdHRhY2hlZCkpLCBhdHRhY2hlZCwgZmFpbGVkKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmFsdmUge1xuICBjb25zdHJ1Y3RvcihleGVjdXRvcikge1xuICAgIHRoaXMuc3RhcnRlZCA9IGZhbHNlO1xuICAgIHRoaXMuYXR0YWNoZWQgPSBbXTtcbiAgICB0aGlzLmxpc3RlbmVycyA9IFtdO1xuICAgIHRoaXMuZXhlY3V0b3IgPSBleGVjdXRvcjtcbiAgfVxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgLy8gSXRlcmF0ZSBvdmVyIGxpc3RlbmVycyBvbiBuZXh0IHJ1biBvZlxuICAgIC8vIHRoZSBqcyBldmVudCBsb29wXG4gICAgLy8gVE9ETzogbm9kZSBzdXBwb3J0XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLmV4ZWN1dG9yKFxuICAgICAgICAvLyBFbWl0XG4gICAgICAgICh2YWx1ZSkgPT4ge1xuICAgICAgICAgIGl0ZXJhdGUodGhpcy5saXN0ZW5lcnNbU3ltYm9sLml0ZXJhdG9yXSgpLCB2YWx1ZSwgdGhpcy5hdHRhY2hlZCk7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIEVycm9yXG4gICAgICAgICh2YWx1ZSkgPT4ge1xuICAgICAgICAgIGl0ZXJhdGUodGhpcy5saXN0ZW5lcnNbU3ltYm9sLml0ZXJhdG9yXSgpLCB2YWx1ZSwgdGhpcy5hdHRhY2hlZCwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfSwgMSk7XG4gIH1cblxuICAvL1RPRE86IGVycm9yIHNjZW5hcmlvXG4gIHN0YXRpYyBjcmVhdGUoZXhlY3V0b3IpIHtcbiAgICBpZihleGVjdXRvci50aGVuKSB7XG4gICAgICByZXR1cm4gbmV3IFZhbHZlKGZ1bmN0aW9uIChlbWl0KSB7XG4gICAgICAgIGV4ZWN1dG9yLnRoZW4oZW1pdCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBWYWx2ZShleGVjdXRvcik7XG4gIH1cblxuICAvL1RPRE86IGVycm9yIHNjZW5hcmlvXG4gIHN0YXRpYyBhbGwodGhlbmFibGVzKSB7XG4gICAgcmV0dXJuIGhhbmRsZUFsbCh0aGVuYWJsZXMpO1xuICB9XG5cbiAgc3RhdGljIGFwcGx5QWxsKHRoZW5hYmxlcykge1xuICAgIHJldHVybiBoYW5kbGVBbGwodGhlbmFibGVzLCB0cnVlKTtcbiAgfVxuXG4gIGNsb25lKG9uU3VjY2Vzcywgb25GYWlsdXJlKSB7XG4gICAgdmFyIG5ld1ZhbHZlID0gbmV3IFZhbHZlKHRoaXMuZXhlY3V0b3IpO1xuICAgIG5ld1ZhbHZlLmxpc3RlbmVycyA9IGNsb25lQXJyYXkodGhpcy5saXN0ZW5lcnMpO1xuICAgIG5ld1ZhbHZlLmF0dGFjaGVkID0gY2xvbmVBcnJheSh0aGlzLmF0dGFjaGVkKTtcbiAgICBuZXdWYWx2ZS5zdGFydGVkID0gdGhpcy5zdGFydGVkO1xuICAgIHJldHVybiAob25TdWNjZXNzKSA/IG5ld1ZhbHZlLnRoZW4ob25TdWNjZXNzLCBvbkZhaWx1cmUpIDogbmV3VmFsdmU7XG4gIH1cblxuICBhdHRhY2godmFsdWUpIHtcbiAgICB0aGlzLmF0dGFjaGVkLnB1c2godmFsdWUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgdGhlbihvblN1Y2Nlc3MsIG9uRmFpbHVyZSkge1xuICAgIGlmKHR5cGVvZiBvblN1Y2Nlc3MgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93ICdWYWx2ZTogdGhlbigpIHJlcXVpcmVzIGEgZnVuY3Rpb24gYXMgZmlyc3QgYXJndW1lbnQuJ1xuICAgIH1cbiAgICB0aGlzLmxpc3RlbmVycy5wdXNoKHtcbiAgICAgIHN1Y2Nlc3M6IG9uU3VjY2VzcyxcbiAgICAgIGZhaWw6IG9uRmFpbHVyZSB8fCBmdW5jdGlvbiAodmFsdWUpIHsgcmV0dXJuIHZhbHVlOyB9XG4gICAgfSk7XG5cbiAgICBpZighdGhpcy5zdGFydGVkKSB7XG4gICAgICB0aGlzLmV4ZWN1dGUoKTtcbiAgICAgIHRoaXMuc3RhcnRlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn0iLCIvKipcbiAqIENyZWF0ZWQgYnkgc2hhdW53ZXN0IG9uIDcvOC8xNS5cbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZmxpcCAoZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3MucmV2ZXJzZSgpKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcG9zZSAoLi4uZm5zKSB7XG4gIHJldHVybiBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgcmV0dXJuIGZucy5yZWR1Y2VSaWdodChmdW5jdGlvbiAocmVzdWx0LCBmbikge1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhpcywgcmVzdWx0KTtcbiAgICB9LCByZXN1bHQpO1xuICB9O1xufVxuXG5leHBvcnQgdmFyIHNlcXVlbmNlID0gZmxpcChjb21wb3NlKTtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBzaGF1bndlc3Qgb24gNS85LzE1LlxuICovXG5cbmltcG9ydCBmZXRjaEpTT04gZnJvbSAnLi4vZW5naW5lL3NjaGVtYS9mZXRjaC1zY2hlbWEuanMnO1xuaW1wb3J0IGdldEltYWdlIGZyb20gJy4uL2VuZ2luZS9pbWFnZS1sb2FkZXIuanMnO1xuaW1wb3J0IGdldFNwcml0ZVNjaGVtYSBmcm9tICcuLi9zY2hlbWEvc3ByaXRlLXNjaGVtYS5qcyc7XG5pbXBvcnQgc3ByaXRlQW5pbWF0aW9uIGZyb20gJy4uL2FuaW1hdGlvbi9zcHJpdGUtYW5pbWF0aW9uLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0U2NlbmVTY2hlbWEodXJpKSB7XG4gIHJldHVybiBmZXRjaEpTT04odXJpKVxuICAgIC50aGVuKGZ1bmN0aW9uIChzY2VuZSkge1xuICAgICAgcmV0dXJuIGdldEltYWdlKHNjZW5lLmJhY2tncm91bmQuYmFja2dyb3VuZFVybClcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGJhY2tncm91bmRJbWFnZSkge1xuICAgICAgICAgIHNjZW5lLmJhY2tncm91bmRJbWFnZSA9IGJhY2tncm91bmRJbWFnZTtcbiAgICAgICAgICByZXR1cm4gZ2V0U3ByaXRlVHlwZXMoc2NlbmUuc3ByaXRlcylcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChzcHJpdGVzKSB7XG4gICAgICAgICAgICAgIHNjZW5lLnNwcml0ZXMgPSBzcHJpdGVzO1xuICAgICAgICAgICAgICByZXR1cm4gc2NlbmU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSlcbiAgICAudGhlbihmdW5jdGlvbiAoc2NlbmUpIHtcbiAgICAgIHJldHVybiBPYmplY3QuZnJlZXplKHNjZW5lKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0U3ByaXRlVHlwZXMoc3ByaXRlcykge1xuICByZXR1cm4gUHJvbWlzZS5hbGwoc3ByaXRlcy5tYXAoZ2V0U3ByaXRlVHlwZSkpO1xufVxuXG5mdW5jdGlvbiBnZXRTcHJpdGVUeXBlKHNwcml0ZSkge1xuICByZXR1cm4gZ2V0U3ByaXRlU2NoZW1hKHNwcml0ZS5zcmNVcmwpXG4gICAgLnRoZW4oZnVuY3Rpb24odHlwZSkge1xuICAgICAgc3ByaXRlLnR5cGUgPSB0eXBlO1xuICAgICAgLy9zcHJpdGUuYW5pbWF0aW9uID0gc3ByaXRlQW5pbWF0aW9uKHR5cGUuZnJhbWVTZXQpO1xuICAgICAgc3ByaXRlLmFuaW1hdGlvbiA9IHt9O1xuICAgICAgc3ByaXRlLnZlbG9jaXR5ID0geyB4OiAwLCB5OiAwIH07XG4gICAgICBzcHJpdGUuYWNjZWxlcmF0aW9uID0geyB4OiAwLCB5OiAwIH07XG4gICAgICBzcHJpdGUubWF4VmVsb2NpdHkgPSB7IHg6IDUwMCwgeTogNTAwIH07XG4gICAgICAvL3Nwcml0ZS5mcmljdGlvbiA9IHsgeDogMC45OSwgeTogMC41MCB9O1xuICAgICAgc3ByaXRlLmZyaWN0aW9uID0geyB4OiAwLjk5LCB5OiAwLjk5IH07XG4gICAgICByZXR1cm4gc3ByaXRlO1xuICAgIH0pO1xufVxuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IHNoYXVud2VzdCBvbiA1LzkvMTUuXG4gKi9cblxuaW1wb3J0IGZyYW1lU2V0IGZyb20gJy4uL2FuaW1hdGlvbi9mcmFtZS1zZXQuanMnO1xuaW1wb3J0IGZldGNoSlNPTiBmcm9tICcuLi9lbmdpbmUvc2NoZW1hL2ZldGNoLXNjaGVtYS5qcyc7XG5pbXBvcnQgZ2V0SW1hZ2UgZnJvbSAnLi4vZW5naW5lL2ltYWdlLWxvYWRlci5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdldFNwcml0ZVNjaGVtYSh1cmkpIHtcbiAgcmV0dXJuIGZldGNoSlNPTih1cmkpXG4gICAgLnRoZW4oZnVuY3Rpb24gKHNwcml0ZSkge1xuICAgICAgcmV0dXJuIGdldEltYWdlKHNwcml0ZS5zcHJpdGVTaGVldFVybClcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHNwcml0ZVNoZWV0KSB7XG4gICAgICAgICAgc3ByaXRlLnNwcml0ZVNoZWV0ID0gc3ByaXRlU2hlZXQ7XG4gICAgICAgICAgc3ByaXRlLmZyYW1lU2V0ID0gZnJhbWVTZXQoc3ByaXRlLCBzcHJpdGVTaGVldCk7XG4gICAgICAgICAgcmV0dXJuIHNwcml0ZTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgc2hhdW53ZXN0IG9uIDUvNC8xNS5cbiAqL1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIHg6IDAsXG4gIHk6IDAsXG4gIG1hcmdpbkxlZnQ6IDY0LFxuICBtYXJnaW5SaWdodDogNjQsXG4gIHdpZHRoOiAzMDAsXG4gIGhlaWdodDogNDAwXG59OyJdfQ==

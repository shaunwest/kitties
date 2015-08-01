/**
 * Created by Shaun on 4/23/2015.
 */

import {Fragment} from './engine/fragments.js';
import getSceneSchema from './schema/scene-schema.js';
import Frame from './engine/frame.js';
import Input from './engine/input.js';
import Viewport from './viewport.js';
import {clearContext, render, renderRects, renderLines} from './canvas-renderer.js';
import {sequence} from './func.js';

const scene = getSceneSchema('assets/kitty-world.json');

function getPositionFromMaxMargin(spritePos, spriteSize, maxMargin) {
  return (spritePos + spriteSize) - maxMargin;
}

function getPositionFromMinMargin(spritePos, minMargin) {
  return spritePos - minMargin;
}

function applyFriction(velocity, friction, elapsed) {
  return velocity * Math.pow(1 - friction, elapsed);
}

function halt(velocity, haltTarget) {
  return (Math.abs(velocity) < haltTarget) ? 0 : velocity;
}

function clampVelocity(velocity, maxVelocity) {
  return (velocity > 0) ?
    Math.min(velocity, maxVelocity) :
    Math.max(velocity, -maxVelocity);
}

function applyAcceleration(velocity, acceleration, elapsed) {
  return velocity + (acceleration * elapsed);
}

function getPositionDelta(position, velocity, elapsed) {
  return position + Math.round(velocity * elapsed);
}

function getVelocity(sprite, dim, elapsed) {
  let velocity = halt(sprite.velocity[dim], 1);
  velocity = applyAcceleration(velocity, sprite.acceleration[dim], elapsed);
  velocity = applyFriction(velocity, sprite.friction[dim], elapsed);
  return clampVelocity(velocity, sprite.maxVelocity[dim]);
}

function getInnerDiff(position, size, minBound, maxBound) {
  const max = position + size;
  return (position < minBound && position - minBound ||
    max > maxBound && max - maxBound ||
    0);
}

/*function getOuterDiff(position, size, minBound, maxBound) {
  const max = position + size;
  return (position < minBound && max > minBound && max - minBound ||
    position < maxBound && max > maxBound && position - maxBound ||
    0);
}*/

function getOuterDiff(position, size, minBound, maxBound) {
  const max = position + size;
  return (position < minBound && max > minBound && max - minBound ||
    position < maxBound && max > maxBound && position - maxBound ||
    0);
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
  return (rangeMin < collider.rangeMax &&
    rangeMax > collider.rangeMin);
}

function getMinPositionDiff(min, colliderMax) {
  return colliderMax - min;
}

function getMaxPositionDiff(max, colliderMin) {
  return colliderMin - max;
}

function getIntersectedColliders(colliders, positionMin, positionMax, rangeMin, rangeMax) {
  return colliders
    .filter(function (collider) {
      return (rangeMin < collider.rangeMax &&
        rangeMax > collider.rangeMin);
    })
    .map(function (collider) {
      return {
        positionMin: collider.positionMax - positionMin,
        positionMax: collider.positionMin - positionMax
      };
    })
    .filter(function (diff) {
      return (diff.positionMin > 0 && diff.positionMax < 0);
    })
    .map(function (diff) {
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
    const diff = getOuterDiff(
      position,
      size,
      collider.positionMin,
      collider.positionMax
    );
    return (diff) ?
        position - diff :
        positionDelta;
  }, position);
}

function getCollisionResolve(colliders, position, size, rangeMin, rangeMax) {
  return colliders
    .filter(collider =>
      rangeMin <= collider.rangeMax && rangeMax >= collider.rangeMin
    )
    .reduce((positionDelta, collider) => {
      const diff = getOuterDiff(
          position,
          size,
          collider.positionMin,
          collider.positionMax
      );

      return (diff) ?
        position - diff :
        positionDelta;
    }, position);
}

function applyAnimation(sprite) {
  const sequence = sprite.type.frameSet[getAnimation(sprite)];
  const frameIndex = getFrameIndex(sprite.animation.currentIndex, sequence);
  sprite.animation.currentIndex = frameIndex;

  return getFrame(frameIndex, sequence)
}

function getFrameIndex(currentIndex, sequence) {
  const index = currentIndex || 0;
  return (index < sequence.frames.length - 1) ?
    index + 1 : 0;
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
  const denom = (line.x1 - line.x2) * (y1 - y2) - (line.y1 - line.y2) * (x1 - x2);

  if (denom === 0) {
    return false;
  }

  const x = Math.floor(((line.x1 * line.y2 - line.y1 * line.x2) * (x1 - x2) - (line.x1 - line.x2) * (x1 * y2 - y1 * x2)) / denom);
  const y = Math.floor(((line.x1 * line.y2 - line.y1 * line.x2) * (y1 - y2) - (line.y1 - line.y2) * (x1 * y2 - y1 * x2)) / denom);

  const maxX = Math.max(x1, x2);
  const minX = Math.min(x1, x2);
  const maxY = Math.max(y1, y2);
  const minY = Math.min(y1, y2);

  if (x <= maxX && x >= minX &&
    y <= maxY && y >= minY ) {
    return {x: x, y: y};
  }

  return false;
}

function segmentIntersectsSegment(line, x1, y1, x2, y2) {
  var intersects = lineIntersectsSegment(line, x1, y1, x2, y2);

  if (!intersects) {
    return false;
  }

  if (!(intersects.x >= Math.min(line.x1, line.x2) &&
    intersects.x <= Math.max(line.x1, line.x2) &&
    intersects.y >= Math.min(line.y1, line.y2) &&
    intersects.y <= Math.max(line.y1, line.y2))) {
    return false;
  }
  return intersects;
}

function log(msg) {
  //console.log(msg);
}

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
    return !(rect.x > collider.x + collider.width ||
        rect.x + rect.width < collider.x ||
        rect.y > collider.y + collider.height ||
        rect.y + rect.height < collider.y);
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
    const xMin = (collider.x + collider.width) - rect.x;
    const xMax = collider.x - (rect.x + rect.width);
    const yMin = (collider.y + collider.height) - rect.y;
    const yMax = collider.y - (rect.y + rect.height);
    return {
      x: Math.abs(xMax) < Math.abs(xMin) ? xMax : xMin,
      y: Math.abs(yMax) < Math.abs(yMin) ? yMax : yMin
    };
  });
}

function getCombineds(overlaps) {
  return overlaps.reduce(function (combined, overlap) {
    const last = combined[combined.length - 1];
    if (!last) {
      combined.push({x: overlap.x, y: overlap.y});
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
      combined.push({x: overlap.x, y: overlap.y});
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
  }, {x: 0, y: 0});
}

function getFoo4(overlaps) {
  var resolution = overlaps
    .reduce(function (resolution, overlap) {
      const x = overlap.x,
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
    }, {x: 999999, y: 999999, lastX: null, lastY: null});

  return resolution;
}

function getFoo2(overlaps) {
  var resolution = overlaps
    .reduce(function (resolution, overlap) {
      const x = Math.abs(overlap.xMax) < Math.abs(overlap.xMin) ?
        overlap.xMax :
        overlap.xMin;

      const y = Math.abs(overlap.yMax) < Math.abs(overlap.yMin) ?
        overlap.yMax :
        overlap.yMin;

      if (x === 0 || y === 0) {
        return resolution;
      }

      if (Math.abs(x) < Math.abs(y)) {
        //if (typeof resolution.Y.y === 'undefined' || (Math.abs(y) > Math.abs(resolution.Y.y) && y !== resolution.X.y)) {
        //if (Math.abs(y) > Math.abs(resolution.Y.y) && (resolution.X.y === 0 || y !== resolution.X.y) && (resolution.Y.x === 0 || x !== resolution.Y.x)) {
        //if ((typeof resolution.Y.y === 'undefined' || Math.abs(y) > Math.abs(resolution.Y.y)) && y !== resolution.X.y && x !== resolution.X.x) {
        if ((typeof resolution.Y.y === 'undefined' || Math.abs(y) > Math.abs(resolution.Y.y))) {
          resolution.Y.x = x;
          resolution.Y.y = y;
        }
      } else {
        ///if (typeof resolution.X.x === 'undefined' || (Math.abs(x) > Math.abs(resolution.X.x) && x !== resolution.Y.x)) {
        //if (Math.abs(x) > Math.abs(resolution.X.x) && (resolution.Y.y === 0 || y !== resolution.Y.y) && (resolution.X.x === 0 || x !== resolution.X.x)) {
        //if ((typeof resolution.X.x === 'undefined' || Math.abs(x) > Math.abs(resolution.X.x)) && y !== resolution.Y.y && x !== resolution.Y.x) {
        if ((typeof resolution.X.x === 'undefined' || Math.abs(x) > Math.abs(resolution.X.x))) {
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

  let x = 0, y = 0;
  const X = resolution.X;
  const Y = resolution.Y;

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

  return {x: x, y: y};
}

function getFoo3(overlaps) {
  var resolution = overlaps
    .reduce(function (resolution, overlap) {
      const x = Math.abs(overlap.xMax) < Math.abs(overlap.xMin) ?
        overlap.xMax :
        overlap.xMin;

      const y = Math.abs(overlap.yMax) < Math.abs(overlap.yMin) ?
        overlap.yMax :
        overlap.yMin;

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
    }, {x: 999999, y: 999999, lastX: null, lastY: null});

  return resolution;
}

function getFoo(projectionVectors) {
  return projectionVectors.reduce(function (acc, projectionVector) {
    const x = projectionVector.x;
    const xAbs = Math.abs(x);
    const y = projectionVector.y;
    const yAbs = Math.abs(y);

    if (x === acc.xLast) {
      // do nothing
    } else if(y === acc.yLast) {
      // do nothing
    } else {
      acc.xLast = x;
      acc.yLast = y;

      if (xAbs < yAbs) {
        acc.x = projectionVector.x;
      } else {
        acc.y = projectionVector.y;
      }
    }

    return acc;
  }, {x: null, y: null, xLast: null, yLast: null});
}

function getEqualVectors(projectVectors) {
  return projectVectors.reduce(function (acc, projectionVector) {
    if (acc.x === null) {
      acc.x = projectionVector.x;
    } else if(acc.x === projectionVector.x && acc.xMatch !== false) {
      acc.xMatch = true;
    } else {
      acc.xMatch = false;
    }

    if (acc.y === null) {
      acc.y = projectionVector.y;
    } else if(acc.y === projectionVector.y && acc.yMatch !== false) {
      acc.yMatch = true;
    } else {
      acc.yMatch = false;
    }

    return acc;
  }, {x: null, xMatch: null, y: null, yMatch: null});
}

function getFinalVector(projectionVectors) {
  const finalVector = projectionVectors.reduce(function (finalOverlap, projectionVector) {
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
  }, {x: null, y: null});

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

const getInputs = Input();
const getFrames = Frame();
const viewport = Viewport;
const fpsUI = Fragment('fps');

getFrames(function (elapsed, fps) {
  fpsUI.textContent = fps;
  return true;
});

scene
  .then(function (scene) {
    const sceneBounds = Object.freeze({
      width: scene.sceneWidth,
      height: scene.sceneHeight
    });

    const canvas = Fragment('canvas-entities');
    const context2d = canvas.getContext('2d');
    const colliders = Object.freeze(scene.colliders);

    const sprites = Object.freeze(scene.sprites);
    const player = sprites[0];

    getFrames(function (elapsed) {
      clearContext(context2d, canvas.width, canvas.height);

      const inputs = getInputs();

      player.velocity.y = 300;

      const speed = 50;
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

        const velocityX = getVelocity(sprite, 'x', elapsed);
        const x = getPositionDelta(sprite.x, velocityX, elapsed);

        const boundsDiffX = getInnerDiff(x, sprite.width, 0, sceneBounds.width);
        const x1 = resolveCollision(boundsDiffX, x);

        const velocityY = getVelocity(sprite, 'y', elapsed);
        const y = getPositionDelta(sprite.y, velocityY, elapsed);

        const boundsDiffY = getInnerDiff(y, sprite.height, 0, sceneBounds.height);
        const y1 = resolveCollision(boundsDiffY, y);

        let x2 = x1;
        let y2 = y1;

        // mutate sprite
        sprite.velocity.x = velocityX;
        sprite.x = x2;
        sprite.velocity.y = velocityY;
        sprite.y = y2;

        //const yDir = sprite.y - sprite.lastY;
        //const xDir = sprite.x - sprite.lastX;

        const collisions = getCollisions(sprite, colliders);
        const overlaps = getOverlaps(collisions, sprite);
        const combined = getCombineds(overlaps);
        const resolution = getResolution(combined);

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
          const minMargin = viewport.marginLeft;
          const maxMargin = viewport.width - viewport.marginRight;
          const viewportDiffX = getInnerDiff(
            sprite.x,
            sprite.width,
            viewport.x + minMargin,
            viewport.x + maxMargin
          );

          // mutate viewport
          if (viewportDiffX > 0 && sprite.velocity.x > 0) {
            viewport.x = getPositionFromMaxMargin(sprite.x, sprite.width, maxMargin);
          } else if (viewportDiffX < 0 && sprite.velocity.x < 0) {
            viewport.x = getPositionFromMinMargin(sprite.x, minMargin);
          }
        }

        const frame = applyAnimation(sprite);
        const pos = {x: sprite.x, y: sprite.y};

        render(context2d, pos, frame, viewport);
        renderRects(context2d, colliders, viewport);
        //renderLines(context2d, colliders, viewport);
        renderRects(context2d, sprites, viewport);
      });

      return true;
    });

    return scene;
  })
  .then(function (scene) {
    const backgroundImage = scene.backgroundImage;

    const canvas = Fragment('canvas-background');
    const context2d = canvas.getContext('2d');

    getFrames(function () {
      clearContext(context2d, canvas.width, canvas.height);
      //render(context2d, {x: 0, y: 0}, backgroundImage, viewport);
      return true;
    });
    return scene;
  });

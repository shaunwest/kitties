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

function getSlope(line) {
  const denom = (line.x2 - line.x1);
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

function log(msg) {
  //console.log(msg);
}

function collisions(sprite, colliders) {
  const dirY = sprite.y - sprite.lastY;
  const dirX = sprite.x - sprite.lastX;

  colliders.forEach(function (collider) {
    let intersects, x, y;

    if(!collider.slope) {
      intersects = segmentIntersectsSegment(collider, sprite.x, sprite.y, sprite.x + sprite.width, sprite.y); // top
      if (intersects) {
        log('top', intersects);
        sprite.x = intersects.x;
      }

      if (intersects = segmentIntersectsSegment(collider, sprite.x, sprite.y + sprite.height, sprite.x + sprite.width, sprite.y + sprite.height)) { // bottom
        log('bottom', intersects);
        sprite.x = intersects.x - sprite.width - 1;
      }
    }

    intersects = segmentIntersectsSegment(collider, sprite.x, sprite.y, sprite.x, sprite.y + sprite.height); // left
    if (intersects) {
      log('left', intersects);
      sprite.y = intersects.y - sprite.height - 1;
    }

    if(intersects = segmentIntersectsSegment(collider, sprite.x + sprite.width, sprite.y, sprite.x + sprite.width, sprite.y + sprite.height)) {// right
      log('right', intersects);
      sprite.y = intersects.y - sprite.height - 1;
    }


  });
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

    const sprites = Object.freeze(scene.sprites);
    const player = sprites[0];

    getFrames(function (elapsed) {
      clearContext(context2d, canvas.width, canvas.height);

      const inputs = getInputs();

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

        const velocityX = getVelocity(sprite, 'x', elapsed);
        const x = getPositionDelta(sprite.x, velocityX, elapsed);

        const boundsDiffX = getInnerDiff(x, sprite.width, 0, sceneBounds.width);
        const x1 = resolveCollision(boundsDiffX, x);

        const velocityY = getVelocity(sprite, 'y', elapsed);
        const y = getPositionDelta(sprite.y, velocityY, elapsed);

        const boundsDiffY = getInnerDiff(y, sprite.height, 0, sceneBounds.height);
        const y1 = resolveCollision(boundsDiffY, y);

        /*colliders.forEach(function (collider) {
          console.log(lineIntersectsRect(collider, sprite));
        });*/

        let x2 = x1;
        let y2 = y1;

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
        //renderRects(context2d, colliders, viewport);
        renderLines(context2d, colliders, viewport);
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

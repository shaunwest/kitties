/**
 * Created by Shaun on 4/23/2015.
 */

import {Fragment} from './engine/fragments.js';
import getSceneSchema from './schema/scene-schema.js';
import Frame from './engine/frame.js';
import Input from './engine/input.js';
import Viewport from './viewport.js';
import {clearContext, render, renderRects} from './canvas-renderer.js';
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

        let vals = getCollidersInRange(y1, y1 + sprite.height, collidersX)
          .map(function (collider) {
            let maxDiff = getMaxPositionDiff(x1 + sprite.width, collider.positionMin);
            let minDiff = getMinPositionDiff(x1, collider.positionMax);

            return (Math.min(Math.abs(maxDiff), Math.abs(minDiff)));
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
        //renderRects(context2d, intersectedColliders, viewport, '#ff0000');
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

/**
 * Created by Shaun on 4/23/2015.
 */

import {Fragment} from './engine/fragments.js';
import getSceneSchema from './schema/scene-schema.js';
import Frame from './engine/frame.js';
import Input from './engine/input.js';
import Viewport from './viewport.js';
import {clearContext} from './canvas-renderer.js';
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

function getPositionDelta(val, velocity, elapsed) {
  return val + Math.round(velocity * elapsed);
}

function getVelocityX(sprite, elapsed) {
  const velX0 = halt(sprite.velocityX, 1);
  const velX1 = applyAcceleration(velX0, sprite.accelerationX, elapsed);
  const velX2 = applyFriction(velX1, sprite.frictionX, elapsed);
  return clampVelocity(velX2, sprite.maxVelocityX);
}

function getVelocityY(sprite, elapsed) {
  const velY0 = halt(sprite.velocityY, 1);
  const velY1 = applyAcceleration(velY0, sprite.accelerationY, elapsed);
  const velY2 = applyFriction(velY1, sprite.frictionY, elapsed);
  return clampVelocity(velY2, sprite.maxVelocityY);
}

function getInnerDiff(val, size, minBound, maxBound) {
  const max = val + size;
  return (val < minBound && val - minBound ||
    max > maxBound && max - maxBound ||
    0);
}

function getOuterDiff(val, size, minBound, maxBound) {
  const max = val + size;
  return (val < minBound && max > minBound && max - minBound ||
    val < maxBound && max > maxBound && val - maxBound ||
    0);
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
  return colliders
    .filter(function (collider) {
      return (range >= collider.rangeMin && range <= collider.rangeMax);
    })
    .reduce(function (positionDelta, collider) {
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

function render(context2d, point, image, viewport) {
  if(!image) {
    return;
  }
  context2d.drawImage(
    image,
    point.x - viewport.x || 0,
    point.y - viewport.y || 0
  );
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

    const collidersX = colliders.map(function (collider) {
      return {
        positionMin: collider.x,
        positionMax: collider.x + collider.width,
        rangeMin: collider.y,
        rangeMax: collider.y + collider.height
      };
    });

    const collidersY = colliders.map(function (collider) {
      return {
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

      if (inputs[37]) {
        player.velocityX = -100;
      } else if (inputs[39]) {
        player.velocityX = 100;
      }

      sprites.forEach(function (sprite) {
        const velocityX = getVelocityX(sprite, elapsed);
        const x = getPositionDelta(sprite.x, velocityX, elapsed);
        const boundsDiffX = getInnerDiff(x, sprite.width, 0, sceneBounds.width);
        const x2 = resolveCollision(boundsDiffX, x);

        sprite.velocityX = velocityX;
        sprite.x = x2;

        sprite.velocityY = getVelocityY(sprite, elapsed);
        sprite.y = getPositionDelta(sprite.y, sprite.velocityY, elapsed);
        const diffY = getInnerDiff(sprite.y, sprite.height, 0, sceneBounds.height);
        sprite.y = resolveCollision(diffY, sprite.y);

        //const resolve = getCollisionResolve(colliders, sprite);
        const resolveX = getCollisionResolve(collidersX, sprite.x, sprite.y, sprite.width);
        sprite.x = resolveX;

        const resolveY = getCollisionResolve(collidersY, sprite.y, sprite.x, sprite.height);
        sprite.y = resolveY;

        if (sprite === player) {
          const minMargin = viewport.marginLeft;
          const maxMargin = viewport.width - viewport.marginRight;
          const viewportDiffX = getInnerDiff(
            sprite.x,
            sprite.width,
            viewport.x + minMargin,
            viewport.x + maxMargin
          );

          if (viewportDiffX > 0 && sprite.velocityX > 0) {
            viewport.x = getPositionFromMaxMargin(sprite.x, sprite.width, maxMargin);
          } else if (viewportDiffX < 0 && sprite.velocityX < 0) {
            viewport.x = getPositionFromMinMargin(sprite.x, minMargin);
          }
        }

        const frame = applyAnimation(sprite);
        const pos = {x: sprite.x, y: sprite.y};

        render(context2d, pos, frame, viewport);
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
      render(context2d, {x: 0, y: 0}, backgroundImage, viewport);
      return true;
    });
    return scene;
  });

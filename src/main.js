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

function getOuterDiff(position, size, minBound, maxBound) {
  const max = position + size;
  return (position < minBound && max > minBound && max - minBound ||
    position < maxBound && max > maxBound && position - maxBound ||
    0);
}

function resolveCollision(diff, val) {
  return val - diff;
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

function log(val) {
  console.log(val);
  return val;
}

function getCollisions(rect, colliders) {
  return colliders.filter(function (collider) {
    return !(rect.x > collider.x + collider.width ||
        rect.x + rect.width < collider.x ||
        rect.y > collider.y + collider.height ||
        rect.y + rect.height < collider.y);
  });
}

function getOverlaps(rect, colliders) {
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


        const collisions = getCollisions(sprite, colliders);
        const overlaps = getOverlaps(sprite, collisions);
        const combined = getCombineds(overlaps);
        const resolution = getResolution(combined);

        sprite.x += resolution.x;
        sprite.y += resolution.y;

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

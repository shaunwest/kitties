/**
 * Created by Shaun on 4/23/2015.
 */

import {Fragment} from './engine/fragments.js';
import getSceneSchema from './schema/scene-schema.js';
import Frame from './engine/frame.js';
import Input from './engine/input.js';
import Viewport from './viewport.js';
import {clearContext} from './canvas-renderer.js';

const scene = getSceneSchema('assets/kitty-world.json');

function applyInputToSprite(inputs, sprite) {
  if(inputs[37]) {
    sprite.x--;
  } else if(inputs[39]) {
    sprite.x++;
  }
}

function applyInputToViewport(keys, targetSprite, viewport) {
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

// Entities
scene
  .then(function (scene) {
    // make values immutable where possible
    const bounds = Object.freeze({
      width: scene.sceneWidth,
      height: scene.sceneHeight
    });

    const viewport = Viewport;

    const canvas = Fragment('canvas-entities');
    const context2d = canvas.getContext('2d');
    const colliders = Object.freeze(scene.colliders);
    const sprites = Object.freeze(scene.sprites);

    const player = sprites[0];

    getFrames(function (fps) {
      clearContext(context2d, canvas.width, canvas.height);

      applyInputToSprite(getInputs(), player);
      applyInputToViewport(getInputs(), player, viewport);

      sprites.forEach(function (sprite) {
        /*
        applyAI(sprite);
        applyPhysics(sprite);

        getEnvCollisions(sprite, bounds, colliders)
          .then(function (collisions) {
            resolveEnvCollisions(sprite, collisions);
          });

        getSpriteCollisions(sprite, sprites)
          .then(function (collisions) {
            resolveSpriteCollisions(sprite, collisions);
          });

        setAnimation(sprite);
        */
        const pos = {x: sprite.x, y: sprite.y};
        render(context2d, pos, sprite.animation.getNext(), viewport);
      });

      return true;
    });

    return scene;
  });
  //.then(background);

//doSpriteStuff(sprites, world.collisions, sceneBounds)

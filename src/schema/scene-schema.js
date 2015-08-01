/**
 * Created by shaunwest on 5/9/15.
 */

import fetchJSON from '../engine/schema/fetch-schema.js';
import getImage from '../engine/image-loader.js';
import getSpriteSchema from '../schema/sprite-schema.js';
import spriteAnimation from '../animation/sprite-animation.js';

export default function getSceneSchema(uri) {
  return fetchJSON(uri)
    .then(function (scene) {
      return getImage(scene.background.backgroundUrl)
        .then(function (backgroundImage) {
          scene.backgroundImage = backgroundImage;
          return getSpriteTypes(scene.sprites)
            .then(function (sprites) {
              scene.sprites = sprites;
              return scene;
            });
        });
    })
    .then(function (scene) {
      return Object.freeze(scene);
    });
}

function getSpriteTypes(sprites) {
  return Promise.all(sprites.map(getSpriteType));
}

function getSpriteType(sprite) {
  return getSpriteSchema(sprite.srcUrl)
    .then(function(type) {
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

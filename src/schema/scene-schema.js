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
      sprite.velocityX = 0;
      sprite.velocityY = 500;
      sprite.accelerationX = 0;
      sprite.accelerationY = 0;
      sprite.maxVelocityX = 500;
      sprite.maxVelocityY = 500;
      sprite.frictionX = 0.99;
      sprite.frictionY = 0.50;
      return sprite;
    });
}

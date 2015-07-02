/**
 * Created by shaunwest on 5/9/15.
 */

import fetchJSON from '../engine/schema/fetch-schema.js';
import getImage from '../engine/image-loader.js';
import getSpriteSchema from '../schema/sprite-schema.js';
import spriteAnimation from '../animation/sprite-animation.js';
import mapSchema from '../engine/schema/schema-mapper.js';
import {setProp} from '../engine/schema/register.js';

export default function getSceneSchema(uri) {
  return fetchJSON(uri)
    /*.then(function (json) {
      return mapSchema(json, {
        background: {
          backgroundUrl: setProp('backgroundSource', getImage)
        },
        entities: {
          sprites: setProp('spritesSource', getSpriteTypes)
        }
      });
    })*/
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
      /*return type.spriteSheet
        .then(function(spriteSheet) {
          sprite.animation = spriteAnimation(type.frameSet);
          return sprite;
        });*/
      sprite.animation = spriteAnimation(type.frameSet);
      return sprite;
    });
}

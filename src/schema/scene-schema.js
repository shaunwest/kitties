/**
 * Created by shaunwest on 5/9/15.
 */

import fetchSchema from '../engine/schema/fetch-schema.js';
import getImage from '../engine/image-loader.js';
import getSpriteSchema from '../schema/sprite-schema.js';
import spriteAnimation from '../animation/sprite-animation.js';
import Valve from '../engine/valve.js';


function getSpriteType(sprite) {
  return getSpriteSchema(sprite.srcId)
    .then(function(type) {
      sprite.type = type;
      return type.spriteSheet
        .then(function(spriteSheet) {
          sprite.animation = spriteAnimation(type.frameSet);
          return sprite;
        });
    });
}

function getSprites(id, schema) {
  return function(val, container) {
    return {
      schema: schema,
      cb: function (sprites) {
        container['spritesSource'] = Valve.all(sprites.map(getSpriteType));
      }
    };
  }
}

function getBackground(id, promiseFactory, schema) {
  return function(val, container) {
    return {
      schema: schema,
      cb: function (backgroundUrl) {
        container['backgroundSource'] = Valve.create(promiseFactory(backgroundUrl));
      }
    }
  }
}

export default function getSceneSchema(uri) {
  return fetchSchema(uri, {
    layerDefinitions: {
      background: {
        backgroundUrl: getBackground('backgroundImage', getImage)
      },
      entities: {
        sprites: getSprites('sprites')
      }
    }
  });
}
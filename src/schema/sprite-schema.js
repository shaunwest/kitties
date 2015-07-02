/**
 * Created by shaunwest on 5/9/15.
 */

import frameSet from '../animation/frame-set.js';
import fetchJSON from '../engine/schema/fetch-schema.js';
import getImage from '../engine/image-loader.js';
import mapSchema from '../engine/schema/schema-mapper.js';

export default function getSpriteSchema(uri) {
  /*return fetchJSON(uri)
    .then(function (json) {
      return mapSchema(json, {
        spriteSheetUrl: createAnimation()
      });
    });*/
  return fetchJSON(uri)
    .then(function (sprite) {
      return getImage(sprite.spriteSheetUrl)
        .then(function (spriteSheet) {
          sprite.spriteSheet = spriteSheet;
          sprite.frameSet = frameSet(sprite, spriteSheet);
          return sprite;
        });
    });
}

/*function createAnimation(schema) {
  return function(data, container) {
    return {
      schema: schema,
      cb: function(uri) {
        container['spriteSheet'] = getImage(uri)
          .then(function(spriteSheet) {
            container['frameSet'] = frameSet(container, spriteSheet);
            return spriteSheet;
          });
      }
    }
  }
}*/

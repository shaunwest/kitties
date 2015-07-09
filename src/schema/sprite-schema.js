/**
 * Created by shaunwest on 5/9/15.
 */

import frameSet from '../animation/frame-set.js';
import fetchJSON from '../engine/schema/fetch-schema.js';
import getImage from '../engine/image-loader.js';

export default function getSpriteSchema(uri) {
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

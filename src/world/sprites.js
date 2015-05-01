/**
 * Created by Shaun on 3/7/15
 *
 */

import {mergeObject} from '../common.js';
import HttpResource from '../resources/http-resource.js';
import MultiResource from '../resources/multi-resource.js';
import Sprite from './sprite.js';
import SpriteAnimation from './sprite-animation.js';

export default function (spritesData) {
  return MultiResource(spritesData)
    .each(function(spriteData) {
      return HttpResource(spriteData.src)
        .ready(Sprite)
        .ready(function (sprite) {
          sprite = mergeObject(spriteData, sprite);
          sprite.animation = SpriteAnimation(sprite.frameSet);

          return sprite;
        });
  });
};

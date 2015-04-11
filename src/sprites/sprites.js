/**
 * Created by Shaun on 3/7/15
 *
 */

register('sprites.Sprites', ['_', 'resources.*', '*'], function(_, resources, sprites) {
  'use strict';

  return function (spritesData) {
    return resources.MultiResource(spritesData)
      .each(function(spriteData) {
        return resources.HttpResource(spriteData.src)
          .ready(sprites.Sprite)
          .ready(function (sprite) {
            sprite = _.assign(sprite, spriteData);
            sprite.animation = sprites.SpriteAnimation(sprite.frameSet);

            return sprite;
          });
    });
  };
});
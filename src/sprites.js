/**
 * Created by Shaun on 3/7/15
 *
 */

register('Sprites', ['Obj', 'Resource', 'HttpResource', 'Sprite', 'SpriteAnimation'],
  function(Obj, Resource, HttpResource, Sprite, SpriteAnimation) {
  'use strict';

  return function (spritesData) {
    //spritesData
      //.forEach(function (spriteData) {
        return HttpResource(spritesData[0].src)
          .ready(Sprite).ready(function (sprite) {
            sprite = Obj.merge(spritesData[0], sprite);
            sprite.animation = SpriteAnimation(sprite.frameSet).play('run');

            return sprite;
          });
      //});
  };

  /*return function (spritesData) {
    return spritesData
      .reduce(function (resourcePool, spriteData) {
        HttpResource(spriteData.src)
          .ready(function (spriteDefinition) {
            resourcePool.add(Sprite(spriteDefinition)
              .ready(function (sprite) {
                sprite = Obj.merge(spriteData, sprite);
                sprite.animation = SpriteAnimation(sprite.frameSet).play('run');

                return sprite;
              }));
          });

        return resourcePool;
      }, Resource());
  };*/
});
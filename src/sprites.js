/**
 * Created by Shaun on 3/7/15
 *
 */

register('Sprites', ['Obj', 'Resource', 'HttpResource', 'Sprite', 'SpriteAnimation'],
  function(Obj, Resource, HttpResource, Sprite, SpriteAnimation) {
  'use strict';

  return function (spritesData, baseUrl) {
    var resourcePool = Resource();

    spritesData.forEach(function(spriteData) {
      //FIXME: hardcoded path
      //return HttpResource('assets/' + spriteData.src)
      return HttpResource(spriteData.src)
        .ready(function(spriteDefinition) {
          var spriteResource = Sprite(spriteDefinition, baseUrl)
            .ready(function(sprite) {
              sprite = Obj.clone(sprite);
              sprite.x = spriteData.x;
              sprite.y = spriteData.y;
              sprite.width = spriteData.width;
              sprite.height = spriteData.height;
              sprite.animation = SpriteAnimation(sprite.frameSet)
                .play('run');

              return sprite;
            });

          resourcePool.add(spriteResource);
        });
    });

    return resourcePool;
  };
});
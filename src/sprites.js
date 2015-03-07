

register('Sprites', ['Resource', 'HttpResource', 'SpriteResource', 'SpriteAnimation'],
  function(Resource, HttpResource, SpriteResource, SpriteAnimation) {
  'use strict';

  return function (spritesData, baseUrl) {
    var resourcePool = Resource();

    spritesData.forEach(function(spriteData) {
      return HttpResource('assets/' + spriteData.src)
        .ready(function(spriteDefinition) {
          var spriteResource = SpriteResource(spriteDefinition, baseUrl)
            .ready(function(sprite) {
              sprite.animation = SpriteAnimation(sprite.frameSet)
                .play('run');

              return sprite;
            });

          resourcePool.add(spriteResource);
        });
    });

    return resourcePool;
    /*return HttpResource(spriteData)
      .ready(function(spriteDefinition) {
        var sprite = Merge(spriteData);
        sprite.definition = spriteDefinition;
        return sprite;
      });*/
  };
});
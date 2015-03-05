

register('Sprite', ['Merge', 'SpriteResource'], function(Merge, SpriteResource) {
  'use strict';

  return function (spriteData, baseUrl) {
    return SpriteResource(spriteData.src, baseUrl)
      .ready(function(spriteDefinition) {
        var sprite = Merge(spriteData);
        sprite.definition = spriteDefinition;
        return sprite;
      });
  };
});
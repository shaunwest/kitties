

register('Sprite', ['Merge', 'SpriteDefinition'], function(Merge, SpriteDefinition) {
  'use strict';

  return function (spriteData, baseUrl) {
    return SpriteDefinition(spriteData.src, baseUrl)
      .then(function(spriteDefinition) {
        var sprite = Merge(spriteData);
        sprite.definition = spriteDefinition;
        return sprite;
      });
  };
});
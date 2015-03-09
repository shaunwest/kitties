/**
 * Created by Shaun on 3/7/15
 *
 */

register('Sprites', ['Obj', 'Resource', 'HttpResource', 'Sprite', 'SpriteAnimation'],
  function(Obj, Resource, HttpResource, Sprite, SpriteAnimation) {
  'use strict';

  return function (spritesData) {
    var sources = spritesData.map(function (spriteData) {
      return spriteData.src;
    });
    return HttpResource(sources)
      .ready(Sprite).ready(function (sprite) {
        sprite = Obj.merge(spritesData[0], sprite);
        sprite.animation = SpriteAnimation(sprite.frameSet).play('run');

        return sprite;
      });
  };

    /*
  // New proposal
  return function (spritesData) {
    return MultiResource(spritesData).each(function(spriteData) {
      return HttpResource(spriteData.src)
        .ready(Sprite).ready(function (sprite) {
          sprite = Obj.merge(spritesData[0], sprite);
          sprite.animation = SpriteAnimation(sprite.frameSet).play('run');

          return sprite;
        });
    });
  }*/
});
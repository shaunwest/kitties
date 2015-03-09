/**
 * Created by Shaun on 3/7/15
 *
 */

/* What to do about longass dependency lists?
*  Proposal:
*  register('myPackage.Sprites', ['Obj'], function(Obj) {
*    var MultiResource = use('MultiResource');
*    var HttpResource = use('HttpResource');
*    var Sprite = use('Sprite');
*    ...
*    OR
*    var myPackage = use('myPackage');
*    myPackage.MultiResource(...);
*    ...
*  });
*
*  ALTERNATIVE:
*  register('myPackage.Sprites', ['Obj', 'myPackage.*'], function(Obj, myPackage) {
*    myPackage.MultiResource(...);
*    ...
*  });
*
*  Anything within myPackage can be imported with a use() call
*
*  Problems:
*  1. use is asynchronous, so everything in this package needs to already be loaded
*  2. circular dependency issues will probably arise
*
*/
register('Sprites', ['Obj', 'MultiResource', 'HttpResource', 'Sprite', 'SpriteAnimation'], function(Obj, MultiResource, HttpResource, Sprite, SpriteAnimation) {
  'use strict';

  return function (spritesData) {
    return MultiResource(spritesData)
      .each(function(spriteData) {
        return HttpResource(spriteData.src)
          .ready(Sprite)
          .ready(function (sprite) {
            sprite = Obj.merge(spriteData, sprite);
            sprite.animation = SpriteAnimation(sprite.frameSet);

            return sprite;
          });
    });
  };
});
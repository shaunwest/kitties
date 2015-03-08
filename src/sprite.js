/**
 * Created by Shaun on 5/31/14.
 *
 */

register('Sprite', [
  'Obj',
  'ImageResource',
  'FrameSet'
],
function (Obj, ImageResource, FrameSet) {
  'use strict';

  return function (spriteDefinition) {
    return ImageResource(spriteDefinition.spriteSheetUrl)
      .ready(function (spriteSheet) {
        return {
          spriteSheet: spriteSheet,
          definition: spriteDefinition,
          frameSet: FrameSet(spriteDefinition, spriteSheet)
        };
      });
  };
});
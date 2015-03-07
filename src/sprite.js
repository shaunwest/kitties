/**
 * Created by Shaun on 5/31/14.
 *
 */

register('Sprite', [
  'HttpResource',
  'Merge',
  'ImageResource',
  'FrameSet',
  'Common'
],
function(HttpResource, Merge, ImageResource, FrameSet, Common) {
  'use strict';

  return function (spriteDefinition, baseUrl) {
    var spriteSheetUri;

    spriteDefinition = Merge(spriteDefinition);
    /*spriteSheetUri = spriteDefinition.spriteSheetUrl;

    if(!Common.isFullUrl(spriteSheetUri)) {
      spriteSheetUri = baseUrl + '/' + spriteSheetUri;
    }*/

    return ImageResource(spriteDefinition.spriteSheetUrl)
      .ready(function(spriteSheet) {
        spriteDefinition.frameSet = FrameSet(spriteDefinition, spriteSheet);
        return spriteDefinition;
      });
  };
});
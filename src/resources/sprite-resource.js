/**
 * Created by Shaun on 5/31/14.
 *
 */

/*
* These aren't really resources. They just build definitions or other assets into actual
* game objects. 
*/
register('SpriteResource', [
  'HttpResource',
  'Merge',
  'ImageResource',
  'FrameSet',
  'Common'
],
function(HttpResource, Merge, ImageResource, FrameSet, Common) {
  'use strict';

  var DEFAULT_RATE = 5;

  //return function (uri, baseUrl) {
  return function (spriteDefinition, baseUrl) {
    var fullSpriteDefinitionUrl;

    function buildSpriteDefinition(spriteDefinition) {
      var spriteSheetUri;

      spriteDefinition = Merge(spriteDefinition);
      spriteSheetUri = spriteDefinition.spriteSheetUrl;

      if(!Common.isFullUrl(spriteSheetUri)) {
        spriteSheetUri = baseUrl + '/' + spriteSheetUri;
      }

      return ImageResource(spriteSheetUri)
        .ready(function(spriteSheet) {
          spriteDefinition.frameSet = FrameSet(spriteDefinition, spriteSheet);
          return spriteDefinition;
        });
    }

    //baseUrl = spriteDefinition.baseUrl;

    /*if(spriteDefinition.src) {
      fullSpriteDefinitionUrl = Common.normalizeUrl(
        spriteDefinition.src, 
        baseUrl
      );

      return HttpResource(fullSpriteDefinitionUrl)
        .ready(buildSpriteDefinition);
    }*/

    return buildSpriteDefinition(spriteDefinition);
  }; 
});
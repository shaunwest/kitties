/**
 * Created by Shaun on 3/1/15
 *
 */

register('SpriteSheetResource', ['ImageResource'], function(ImageResource) {
  'use strict';

  /*function getSpriteSheet(baseUrl, spriteDefinition) {
    if(!spriteDefinition.spriteSheetUrl) {
      return null;
    }

    if(!Common.isFullUrl(spriteDefinition.spriteSheetUrl)) {
      spriteDefinition.spriteSheetUrl = baseUrl + '/' + spriteDefinition.spriteSheetUrl;
    }

    return SpriteSheet(spriteDefinition.spriteSheetUrl)
      .then(function(spriteSheet) {
        spriteDefinition.spriteSheet = spriteSheet;
        return spriteDefinition;
      });
  }*/

 

  return function(uri) {
    return ImageResource(uri)
      .ready(function(spriteSheetImage) {
        return spriteSheetImage;
      });
  }; 
})
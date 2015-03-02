/**
 * Created by Shaun on 3/1/15
 *
 */

register('SpriteSheet', ['ImageLoader'], function(ImageLoader) {
  'use strict';

  return function(uri) {
    return ImageLoader(uri)
      .then(function(spriteSheet) {
        return spriteSheet;
      }, function() {
        Util.warn('sprite sheet not found at ' + uri);
      }); 
  }; 
})
/**
 * Created by Shaun on 1/25/15
 *
 */

register('BackgroundImage', [
  'Util',
  'ImageLoader'
],
function(Util, ImageLoader) {
  'use strict';

  return function(imageUrl) {
    if(!imageUrl) {
      return;
    }

    return ImageLoader(imageUrl)
      .then(function(image) {
        return image;
      }, function() {
        Util.warn('Error loading background at \'' + imageUrl + '\'');
        return null;
      });  
  };
});
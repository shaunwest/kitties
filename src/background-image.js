/**
 * Created by Shaun on 1/25/15
 *
 */

register('BackgroundImage', [
  'Util',
  'ImageLoader',
  'Common'
],
function(Util, ImageLoader, Common) {
  'use strict';

  return function(imageUrl, baseUrl) {
    if(!imageUrl) {
      return;
    }

    if(baseUrl && !Common.isFullUrl(imageUrl)) {
      imageUrl = baseUrl + '/' + imageUrl;
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
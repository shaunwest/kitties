/**
 * Created by Shaun on 1/25/15
 *
 */

register('ImageResource', ['ImageLoader', 'Resource'], function(ImageLoader, Resource) {
  'use strict';

  return function (uri) {
    return Resource(uri, ImageLoader);
  };
});
/**
 * Created by Shaun on 5/1/14.
 */

register('ImageLoader', function () {
  'use strict';

  var IMAGE_WAIT_INTERVAL = 100;

  function waitForImage (image) {
    return new Promise(function(resolve, reject) {
      var intervalId = setInterval(function() {
        if(image.complete) {
          clearInterval(intervalId);
          resolve(image);
        }
      }, IMAGE_WAIT_INTERVAL);

      image.onerror = function () {
        clearInterval(intervalId);
        reject();
      };
    });
  }

  return function (uri) {
    var image, promise;

    image = new Image();
    image.src = uri;

    promise = waitForImage(image);

    return promise;
  };
});
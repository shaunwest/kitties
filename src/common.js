register('Common', function() {
  'use strict';

  // Return everything before the last slash of a url
  // e.g. http://foo/bar/baz.json => http://foo/bar
  function getBaseUrl(url) {
    var n = url.lastIndexOf('/');
    return url.substring(0, n); 
  }

  function isFullUrl(url) {
    return (url.substring(0, 7) === 'http://' || 
      url.substring(0, 8) === 'https://');
  }

  function getCanvas(width, height) {
    var canvas = document.createElement('canvas');

    canvas.width = width || 500;
    canvas.height = height || 500;

    return canvas;
  }

  // Make the given RGB value transparent in the given image.
  // Returns a new image.
  function getTransparentImage(transRGB, image) {
    var r, g, b, newImage, dataLength;
    var width = image.width;
    var height = image.height;
    var imageData = image
      .getContext('2d')
      .getImageData(0, 0, width, height);

    if(transRGB) {
      dataLength = width * height * 4;

      for(var index = 0; index < dataLength; index+=4) {
        r = imageData.data[index];
        g = imageData.data[index + 1];
        b = imageData.data[index + 2];
        if(r === transRGB[0] && g === transRGB[1] && b === transRGB[2]) {
          imageData.data[index + 3] = 0;
        }
      }
    } 

    newImage = getCanvas(width, height);
    newImage
      .getContext('2d')
      .putImageData(imageData, 0, 0);

    return newImage;
  }

  return {
    getBaseUrl: getBaseUrl,
    isFullUrl: isFullUrl,
    getCanvas: getCanvas,
    getTransparentImage: getTransparentImage
  };
});
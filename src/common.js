
import Util from './util.js';

// Return everything before the last slash of a url
// e.g. http://foo/bar/baz.json => http://foo/bar
export function getBaseUrl(url) {
  var n = url.lastIndexOf('/');
  return url.substring(0, n);
}

export function isFullUrl(url) {
  return (url.substring(0, 7) === 'http://' ||
    url.substring(0, 8) === 'https://');
}

export function normalizeUrl(url, baseUrl) {
  if(baseUrl && !isFullUrl(url)) {
    return baseUrl + '/' + url;
  }
  return url;
}

export function mergeObject(source, destination, allowWrap, exceptionOnCollisions) {
  source = source || {}; //Pool.getObject();
  destination = destination || {}; //Pool.getObject();

  Object.keys(source).forEach(function(prop) {
    assignProperty(source, destination, prop, allowWrap, exceptionOnCollisions);
  });

  return destination;
}

export function assignProperty(source, destination, prop, allowWrap, exceptionOnCollisions) {
  if(destination.hasOwnProperty(prop)) {
    if(allowWrap) {
      destination[prop] = Func.wrap(destination[prop], source[prop]);
      Util.log('Merge: wrapped \'' + prop + '\'');
    } else if(exceptionOnCollisions) {
      Util.error('Failed to merge mixin. Method \'' +
      prop + '\' caused a name collision.');
    } else {
      destination[prop] = source[prop];
      Util.log('Merge: overwrote \'' + prop + '\'');
    }
    return destination;
  }

  destination[prop] = source[prop];

  return destination;
}

export function getCanvas(width, height) {
  var canvas = document.createElement('canvas');

  canvas.width = width || 500;
  canvas.height = height || 500;

  return canvas;
}

export function intersects(rectA, rectB) {
  return !(
    rectA.x + rectA.width < rectB.x ||
    rectA.y + rectA.height < rectB.y ||
    rectA.x > rectB.x + rectB.width ||
    rectA.y > rectB.y + rectB.height
  );
}

// Make the given RGB value transparent in the given image.
// Returns a new image.
export function getTransparentImage(transRGB, image) {
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

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

  return {
    getBaseUrl: getBaseUrl,
    isFullUrl: isFullUrl,
    getCanvas: getCanvas
  };
});
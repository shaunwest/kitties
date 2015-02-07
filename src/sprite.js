/**
 * Created by Shaun on 5/31/14.
 *
 */

register('Sprite', [
  'Util',
  'Http',
  'Merge',
  'ImageLoader',
  'Common'
],
function(Util, Http, Merge, ImageLoader, Common) {
  'use strict';

  var DEFAULT_RATE = 5;

  // Main function. Gets sprite data and calls support functions to build frames.
  function load(spriteUrl) {
    var sprite = this;

    // Re-work to better use Promises, like scene.js
    function onGetSprite(response) {
      Merge(response.data, sprite);

      return getSpriteSheet(sprite.spriteSheetUrl, sprite.baseUrl)
        .then(function(spriteSheet) {
          return Object
            .keys(sprite.frameSetDefinitions)
            .reduce(compileFramesets.bind(undefined, spriteSheet, sprite), {});
        });
    }

    function onGetSpriteError(response) {
      Util.warn('Error loading sprite at \'' + spriteUrl + '\'');
    }

    sprite.url = spriteUrl;
    sprite.baseUrl = Common.getBaseUrl(spriteUrl);

    return new Promise(function(resolve) {
      Http.get(spriteUrl)
        .then(onGetSprite, onGetSpriteError)
        .then(function(frameSet) {
          sprite.frameSet = frameSet;
          resolve(sprite);
        });
    });
  } 

  // Build frame set and store it
  function compileFramesets(spriteSheet, sprite, frameSets, frameSetId) {
    var frameSet = getFrameSet(
        sprite.frameSetDefinitions[frameSetId],
        spriteSheet, 
        sprite.frameWidth, 
        sprite.frameHeight
      );

    frameSet.frames = frameSet.frames
      .map(getTransparentImage.bind(undefined, sprite.transparentColor));

    frameSets[frameSetId] = frameSet;
    
    return frameSets;
  }

  // Download a sprite sheet
  function getSpriteSheet(spriteSheetUrl, baseUrl) {
    function onGetSpriteSheet(spriteSheet) {
      Util.log('Sprite sheet loaded!');
      return spriteSheet;
    }

    function onGetSpriteSheetError() {
      Util.warn('sprite sheet not found at ' + spriteSheetUrl);
    }

    if(!spriteSheetUrl) {
      return;
    }

    if(!Common.isFullUrl(spriteSheetUrl)) {
      spriteSheetUrl = baseUrl + '/' + spriteSheetUrl;
    }

    return ImageLoader(spriteSheetUrl)
      .then(onGetSpriteSheet, onGetSpriteSheetError); 
  }

  // Make the given RGB value transparent in the given image.
  // Returns a new image.
  function getTransparentImage(transRGB, image) {
    var r, g, b, index, newImage, dataLength;
    var width = image.width;
    var height = image.height;
    var imageData = image
      .getContext('2d')
      .getImageData(0, 0, width, height);

    if(transRGB) {
      dataLength = width * height * 4;

      for(index = 0; index < dataLength; index+=4) {
        r = imageData.data[index];
        g = imageData.data[index + 1];
        b = imageData.data[index + 2];
        if(r === transRGB[0] && g === transRGB[1] && b === transRGB[2]) {
          imageData.data[index + 3] = 0;
        }
      }
    } 

    newImage = document.createElement('canvas');
    newImage.width  = width;
    newImage.height = height;
    newImage.getContext('2d').putImageData(imageData, 0, 0);

    return newImage;
  }

  // Returns a sequence of frame images given a frame set definition and a sprite sheet
  function getFrameSet(frameSetDefinition, spriteSheet, frameWidth, frameHeight) {
    var frames = frameSetDefinition.frames.map(function(frameDefinition) {
      var frame = document.createElement('canvas');

      frame.width  = frameWidth;
      frame.height = frameHeight;

      frame
        .getContext('2d')
        .drawImage(
          spriteSheet,
          frameDefinition.x, frameDefinition.y,
          frameWidth, frameHeight,
          0, 0,
          frameWidth, frameHeight
        );

      return frame;
    });

    return {
      rate: frameSetDefinition.rate || DEFAULT_RATE,
      frames: frames
    };
  }
  
  return {
    frameWidth: 48,
    frameHeight: 48,
    load: load 
  };
});
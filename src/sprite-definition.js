/**
 * Created by Shaun on 5/31/14.
 *
 */

register('SpriteDefinition', [
  'Util',
  'Http',
  'Merge',
  'ImageLoader',
  'Common',
  'Func'
],
function(Util, Http, Merge, ImageLoader, Common, Func) {
  'use strict';

  var DEFAULT_RATE = 5;
  var cache = {}; // maybe make this an injectable object

  function getSpriteDefinition(response) {
    var spriteDefinition = Merge(response.data, {
      frameWidth: 48,
      frameHeight: 48
    });

    return spriteDefinition;
  }

  // Download a spriteDefinition sheet
  function getSpriteSheet(baseUrl, spriteDefinition) {
    if(!spriteDefinition.spriteSheetUrl) {
      return null;
    }

    if(!Common.isFullUrl(spriteDefinition.spriteSheetUrl)) {
      spriteDefinition.spriteSheetUrl = baseUrl + '/' + spriteDefinition.spriteSheetUrl;
    }

    return ImageLoader(spriteDefinition.spriteSheetUrl)
      .then(function(spriteSheet) {
        Util.log('Sprite sheet loaded!');
        spriteDefinition.spriteSheet = spriteSheet;
        return spriteDefinition;
      }, function() {
        Util.warn('sprite sheet not found at ' + spriteDefinition.spriteSheetUrl);
      }); 
  }

  // FIXME: this should only happen once per sprite type...
  function setFrameSets(spriteDefinition) {
    if(!spriteDefinition) {
      return null;
    }

    spriteDefinition.frameSets = Object
      .keys(spriteDefinition.frameSetDefinitions)
      .reduce(function(frameSets, frameSetId) {
        var frameSet = buildFrameSet(
          spriteDefinition.frameSetDefinitions[frameSetId], 
          spriteDefinition
        );

        frameSet.frames = frameSet.frames
          .map(Func.partial(Common.getTransparentImage, spriteDefinition.transparentColor));

        frameSets[frameSetId] = frameSet;

        return frameSets;
      }, {});

    return spriteDefinition;
  }

  // Returns a sequence of frame images given a frame set definition and a sprite sheet
  function buildFrameSet(frameSetDefinition, spriteDefinition) {
    var frameWidth = spriteDefinition.frameWidth;
    var frameHeight = spriteDefinition.frameHeight;

    return {
      rate: frameSetDefinition.rate || DEFAULT_RATE,
      frames: frameSetDefinition.frames
        .map(function(frameDefinition) {
          var frame = Common.getCanvas(frameWidth, frameHeight);

          frame
            .getContext('2d')
            .drawImage(
              spriteDefinition.spriteSheet,
              frameDefinition.x, frameDefinition.y,
              frameWidth, frameHeight,
              0, 0,
              frameWidth, frameHeight
            );

          return frame;
        })
    };
  }

  // Main function. Gets sprite data and calls support functions to build frames.
  return function (spriteDefinitionUrl, baseUrl) {
    var fullSpriteDefinitionUrl;

    if(cache[spriteDefinitionUrl]) {
      return cache[spriteDefinitionUrl];
    }

    if(baseUrl && !Common.isFullUrl(spriteDefinitionUrl)) {
      fullSpriteDefinitionUrl = baseUrl + '/' + spriteDefinitionUrl;
    }

    return Http.get(fullSpriteDefinitionUrl)
      .then(getSpriteDefinition, function(response) {
        Util.warn('Error loading sprite at \'' + fullSpriteDefinitionUrl + '\'');
      })
      .then(Func.partial(getSpriteSheet, baseUrl))
      .then(setFrameSets)
      .then(function(spriteDefinition) {
        if(spriteDefinition) {
          spriteDefinition.url = fullSpriteDefinitionUrl;
        }
        cache[spriteDefinitionUrl] = spriteDefinition;
        return spriteDefinition;
      }, function() {
        return null;
      });
  }; 
});
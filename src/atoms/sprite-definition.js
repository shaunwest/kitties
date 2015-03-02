/**
 * Created by Shaun on 5/31/14.
 *
 */

register('SpriteDefinition', [
  'Util',
  'Http',
  'Merge',
  'SpriteSheet',
  'Common',
  'Func'
],
function(Util, Http, Merge, SpriteSheet, Common, Func) {
  'use strict';

  var DEFAULT_RATE = 5;
  var cache = {}; // maybe make this an injectable object OR see if browser cache can be used

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

    return SpriteSheet(spriteDefinition.spriteSheetUrl)
      .then(function(spriteSheet) {
        spriteDefinition.spriteSheet = spriteSheet;
        return spriteDefinition;
      });
  }

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

    fullSpriteDefinitionUrl = Common.normalizeUrl(spriteDefinitionUrl, baseUrl);

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
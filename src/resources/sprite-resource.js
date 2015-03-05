/**
 * Created by Shaun on 5/31/14.
 *
 */

register('SpriteResource', [
  'Util',
  'HttpResource',
  'Merge',
  'ImageResource',
  'FrameSet',
  'Common',
  'Func'
],
function(Util, HttpResource, Merge, ImageResource, FrameSet, Common, Func) {
  'use strict';

  var DEFAULT_RATE = 5;

  /*function getSpriteDefinition(response) {
    var spriteDefinition = Merge(response.data, {
      frameWidth: 48,
      frameHeight: 48
    });

    return spriteDefinition;
  }*/

  // Download a spriteDefinition sheet
  /*function getSpriteSheet(baseUrl, spriteDefinition) {
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
  }*/

  // Main function. Gets sprite data and calls support functions to build frames.
  return function (uri, baseUrl) {
    var fullSpriteDefinitionUrl = Common.normalizeUrl(uri, baseUrl);

    return HttpResource(fullSpriteDefinitionUrl)
      .ready(function(spriteDefinition) {
        var spriteSheetUri;

        spriteDefinition = Merge(spriteDefinition);
        spriteSheetUri = spriteDefinition.spriteSheetUrl;

        if(!Common.isFullUrl(spriteSheetUri)) {
          spriteSheetUri = baseUrl + '/' + spriteSheetUri;
        }

        return ImageResource(spriteSheetUri)
          .ready(function(spriteSheet) {
            spriteDefinition.frameSet = FrameSet(spriteDefinition, spriteSheet);
            return spriteDefinition;
          });

        //return spriteDefinition;
      });

    /*return Http.get(fullSpriteDefinitionUrl)
      .then(getSpriteDefinition, function(response) {
        Util.warn('Error loading sprite at \'' + fullSpriteDefinitionUrl + '\'');
      })
      .then(Func.partial(getSpriteSheet, baseUrl))
      .then(setFrameSets)
      .then(function(spriteDefinition) {
        if(spriteDefinition) {
          spriteDefinition.url = fullSpriteDefinitionUrl;
        }
        return spriteDefinition;
      }, function() {
        return null;
      });*/
  }; 
});
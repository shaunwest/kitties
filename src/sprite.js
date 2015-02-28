/**
 * Created by Shaun on 5/31/14.
 *
 */

register('Sprite', [
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

  function getSprite(response) {
    var sprite = Merge(response.data, {
      frameWidth: 48,
      frameHeight: 48
    });

    return sprite;
  }

  // Download a sprite sheet
  function getSpriteSheet(baseUrl, sprite) {
    if(!sprite.spriteSheetUrl) {
      return null;
    }

    if(!Common.isFullUrl(sprite.spriteSheetUrl)) {
      sprite.spriteSheetUrl = baseUrl + '/' + sprite.spriteSheetUrl;
    }

    return ImageLoader(sprite.spriteSheetUrl)
      .then(function(spriteSheet) {
        Util.log('Sprite sheet loaded!');
        sprite.spriteSheet = spriteSheet;
        return sprite;
      }, function() {
        Util.warn('sprite sheet not found at ' + sprite.spriteSheetUrl);
      }); 
  }

  // FIXME: this should only happen once per sprite type...
  function setFrameSets(sprite) {
    if(!sprite) {
      return null;
    }

    sprite.frameSets = Object
      .keys(sprite.frameSetDefinitions)
      .reduce(function(frameSets, frameSetId) {
        var frameSet = buildFrameSet(sprite.frameSetDefinitions[frameSetId], sprite);

        frameSet.frames = frameSet.frames
          .map(Func.partial(Common.getTransparentImage, sprite.transparentColor));

        frameSets[frameSetId] = frameSet;

        return frameSets;
      }, {});

    return sprite;
  }

  // Returns a sequence of frame images given a frame set definition and a sprite sheet
  function buildFrameSet(frameSetDefinition, sprite) {
    var frameWidth = sprite.frameWidth;
    var frameHeight = sprite.frameHeight;

    return {
      rate: frameSetDefinition.rate || DEFAULT_RATE,
      frames: frameSetDefinition.frames
        .map(function(frameDefinition) {
          var frame = Common.getCanvas(frameWidth, frameHeight);

          frame
            .getContext('2d')
            .drawImage(
              sprite.spriteSheet,
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
  return function (spriteUrl, baseUrl) {
    if(baseUrl && !Common.isFullUrl(spriteUrl)) {
      spriteUrl = baseUrl + '/' + spriteUrl;
    }

    return Http.get(spriteUrl)
      .then(getSprite, function(response) {
        Util.warn('Error loading sprite at \'' + spriteUrl + '\'');
      })
      .then(Func.partial(getSpriteSheet, baseUrl))
      .then(setFrameSets)
      .then(function(sprite) {
        if(sprite) {
          sprite.url = spriteUrl;
        }
        return sprite;
      }, function() {
        return null;
      });
  }; 
});
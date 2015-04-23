/**
 * Created by Shaun on 3/1/15
 *
 */

register('FrameSet', ['Common', '_'], function(Common, _) {
  'use strict';

  var DEFAULT_RATE = 5;

  function buildFrameSequence(frameSetDefinition, frameSize, spriteSheet) {
    var frameWidth = frameSize.width;
    var frameHeight = frameSize.height;

    return {
      rate: frameSetDefinition.rate || DEFAULT_RATE,
      frames: frameSetDefinition.frames
        .map(function(frameDefinition) {
          var frame = Common.getCanvas(frameWidth, frameHeight);

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
        })
    };
  }

  return function (spriteDefinition, spriteSheet) {
    return Object
      .keys(spriteDefinition.frameSet)
      .reduce(function(frameSet, frameSetId) {
        var frameSequence = buildFrameSequence(
          spriteDefinition.frameSet[frameSetId], 
          spriteDefinition.frameSize,
          spriteSheet
        );

        frameSequence.frames = frameSequence.frames
          .map(_.partial(Common.getTransparentImage, spriteDefinition.transparentColor));

        frameSet[frameSetId] = frameSequence;

        return frameSet;
      }, {});
  };
});
/**
 * Created by Shaun on 3/1/15
 *
 */

import {getCanvas, getTransparentImage} from '../common.js';

const DEFAULT_RATE = 5;

function buildFrameSequence(frameSetDefinition, frameSize, spriteSheet) {
  var frameWidth = frameSize.width;
  var frameHeight = frameSize.height;

  return {
    rate: frameSetDefinition.rate || DEFAULT_RATE,
    frames: frameSetDefinition.frames
      .map(function(frameDefinition) {
        var frame = getCanvas(frameWidth, frameHeight);

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

export default function (spriteDefinition, spriteSheet) {
  return Object
    .keys(spriteDefinition.frameSet)
    .reduce(function(frameSet, frameSetId) {
      var frameSequence = buildFrameSequence(
        spriteDefinition.frameSet[frameSetId],
        spriteDefinition.frameSize,
        spriteSheet
      );

      frameSequence.frames = frameSequence.frames
        .map(function(frame) {
          return getTransparentImage(spriteDefinition.transparentColor, frame);
        });

      frameSet[frameSetId] = frameSequence;

      return frameSet;
    }, {});
};

/**
 * Created by Shaun on 5/31/14.
 *
 */

import ImageResource from '../resources/image-resource.js';
import FrameSet from './frame-set.js';

export default function (spriteDefinition) {
  return ImageResource(spriteDefinition.spriteSheetUrl)
    .ready(function (spriteSheet) {
      return {
        spriteSheet: spriteSheet,
        definition: spriteDefinition,
        frameSet: FrameSet(spriteDefinition, spriteSheet)
      };
    });
};

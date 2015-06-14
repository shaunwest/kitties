/**
 * Created by shaunwest on 5/9/15.
 */

import frameSet from '../animation/frame-set.js';
import {registerValue} from '../engine/schema/register.js';
import fetchSchema from '../engine/schema/fetch-schema.js';
import getImage from '../engine/image-loader.js';
import Rx from 'rx';

function createAnimation(schema) {
  return function(data, container) {
    return {
      schema: schema,
      cb: function(uri) {
        container['spriteSheet'] = Rx.Observable
          .fromPromise(getImage(uri))
          .select(function(spriteSheet) {
            container['frameSet'] = frameSet(container, spriteSheet);
            return spriteSheet;
          });
      }
    }
  }
}

export default function getSpriteSchema(uri) {
  return fetchSchema(uri, registerValue('spriteTypes', {
    spriteSheetUrl: createAnimation()
  }));
}
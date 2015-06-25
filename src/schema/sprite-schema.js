/**
 * Created by shaunwest on 5/9/15.
 */

import frameSet from '../animation/frame-set.js';
//import {registerValue} from '../engine/schema/register.js';
import fetchSchema from '../engine/schema/fetch-schema.js';
import getImage from '../engine/image-loader.js';
import Valve from '../engine/valve.js';

function createAnimation(schema) {
  return function(data, container) {
    return {
      schema: schema,
      cb: function(uri) {
        var valve = new Valve(function (emit) {
          emit(getImage(uri));
        });

        valve
          .then(function(spriteSheet) {
            container['frameSet'] = frameSet(container, spriteSheet);
            return spriteSheet;
          });

        container['spriteSheet'] = valve;
      }
    }
  }
}

export default function getSpriteSchema(uri) {
  return fetchSchema(uri, {
    spriteSheetUrl: createAnimation()
  });
}
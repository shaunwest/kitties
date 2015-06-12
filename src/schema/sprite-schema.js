/**
 * Created by shaunwest on 5/9/15.
 */

import mapSchema from '../engine/schema/schema-mapper.js';
import frameSet from '../animation/frame-set.js';
import {registerValue} from '../engine/schema/helper.js';
import {requestGet} from '../engine/kjax.js';
import getImage from '../engine/resources/image-loader.js';
import Rx from 'rx';

export default function SpriteSchema(uri) {
  return Rx.Observable
    .fromPromise(requestGet(uri))
    .flatMap(function(response) {
      return getSpriteSchema(response.data);
    });
}

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

function getSpriteSchema(data) {
  var schema = registerValue('spriteTypes', {
    spriteSheetUrl: createAnimation()
  });

  return Rx.Observable.create(function(ob) {
    ob.onNext(mapSchema(data, schema));

    return function() {
      console.log('disposed');
    }
  });
}

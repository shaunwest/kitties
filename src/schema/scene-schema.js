/**
 * Created by shaunwest on 5/9/15.
 */

import {registerPromise, registerArray, registerObservable} from '../engine/schema/register.js';
import fetchSchema from '../engine/schema/fetch-schema.js';
import getImage from '../engine/image-loader.js';
import getSpriteSchema from '../schema/sprite-schema.js';
import spriteAnimation from '../animation/sprite-animation.js';
import Rx from 'rx';

function createSpritesObservable(sprites) {
  return Rx.Observable
    .create(function (observable) {
      sprites.forEach(function(sprite) {
        observable.onNext(sprite);
      })
    })
    .selectMany(function (sprite) {
      return getSpriteSchema(sprite.srcId)
        .flatMap(function(type) {
          sprite.type = type;
          return type.spriteSheet.select(function(spriteSheet) {
            sprite.animation = spriteAnimation(type.frameSet);
            return sprite;
          });
        });
    });
}

function registerSprites(id, schema) {
  return registerObservable(id, schema, function (subject, sprites) {
    createSpritesObservable(sprites).subscribe(subject);
  });
}

/*function getSprites(id, schema) {

}*/

export default function getSceneSchema(uri) {
  return fetchSchema(uri, {
    layerDefinitions: {
      background: {
        backgroundUrl: registerPromise('backgroundImage', getImage)
      },
      entities: {
        sprites: registerSprites('sprites')
      },
      collisions: {
        colliders: registerArray('colliders')
      }
    }
  });
}
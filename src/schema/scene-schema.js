/**
 * Created by shaunwest on 5/9/15.
 */

import mapSchema from '../engine/schema/schema-mapper.js';
import {registerObservable} from '../engine/schema/helper.js';
import {includeInstance, registerInstance} from '../engine/container.js';
import getImage from '../engine/resources/image-loader.js';
import {requestGet} from '../engine/kjax.js';
import SpriteSchema from '../schema/sprite-schema.js';
import spriteAnimation from '../animation/sprite-animation.js';
import Rx from 'rx';


export default function SceneSchema(uri) {
  return Rx.Observable
    .fromPromise(requestGet(uri))
    .flatMap(function(response) {
      return getSceneSchema(response.data);
    });
}

function createSpritesObservable(sprites) {
  return Rx.Observable
    .create(function (observable) {
      sprites.forEach(function(sprite) {
        observable.onNext(sprite);
      })
    })
    .selectMany(function (sprite) {
      return SpriteSchema(sprite.srcId)
        .flatMap(function(type) {
          sprite.type = type;
          return type.spriteSheet.select(function(spriteSheet) {
            sprite.animation = spriteAnimation(type.frameSet);
            return sprite;
          });
        });
    });
}

/*function registerSprites(id, schema) {
  return function () {
    return {
      schema: schema,
      cb: function (sprites) {
        var source = includeInstance(id);

        if(!source) {
          source = createSpritesObservable(sprites);
          registerInstance(id, source);
        }
      }
    };
  }
}*/

function registerSprites(id, schema) {
  return function () {
    return {
      schema: schema,
      cb: function (sprites) {
        var subject = includeInstance(id);
        var source = createSpritesObservable(sprites);
        source.subscribe(subject);
      }
    };
  }
}

function registerArray(id) {
  return function() {
    return {
      schema: null,
      cb: function (array) {
        var subject = includeInstance(id); // FIXME: assumes the subject is registered already
        var source = Rx.Observable.create(function(observable) {
          array.forEach(function(val) {
            observable.onNext(val);
          });
        });
        source.subscribe(subject);
      }
    };
  }
}

function registerPromise(id, promiseFactory, schema) {
  return function() {
    return {
      schema: schema,
      cb: function (val) {
        var subject = includeInstance(id);
        var source = Rx.Observable.fromPromise(promiseFactory(val));
        source.subscribe(subject);
      }
    }
  }
}

function getSceneSchema(data) {
  var schema = {
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
  };

  return Rx.Observable.create(function(ob) {
    ob.onNext(mapSchema(data, schema));

    return function() {
      console.log('disposed');
    }
  });
}
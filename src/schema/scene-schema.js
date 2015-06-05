/**
 * Created by shaunwest on 5/9/15.
 */

import mapSchema from '../engine/schema/observable-schema.js';
import ObservableResource from '../engine/resources/observable-resource.js';
//import ObservableImage from '../engine/resources/observable-image.js';
//import ObservableArray from '../engine/resources/observable-array.js';
import ResourceFactory from '../engine/resources/resource-factory.js';
import {registerObservable} from '../engine/schema/helper.js';
import {registerValue} from '../engine/schema/helper.js';
import {includeInstance, registerInstance} from '../engine/container.js';
import {getImage} from '../engine/resources/image-loader.js';
import {requestGet} from '../engine/kjax.js';
import SpriteSchema from '../schema/sprite-schema.js';
import Rx from 'rx';


export default function SceneSchema() {
  /*var resource = ResourceFactory('assets/kitty-world.json', requestGet);
  var observable = ObservableResource(resource);

  var subscription = observable.subscribe(function(response) {
    var sceneSchema = getSceneSchema(response.data);

    sceneSchema.subscribe(function(scene) {
      // can do stuff with scene here
      //console.log(scene);
    });

    return sceneSchema;
  }, function(statusText) {
    console.log(statusText);
  });

  return observable;*/

  /*var source = Rx.Observable.create(function (observable) {
    requestGet('assets/kitty-world.json')
      .then(function(response) {
        observable.onNext(response.data);
      });
  });*/

  return Rx.Observable.fromPromise(requestGet('assets/kitty-world.json'))
    .flatMap(function(response) {
      return getSceneSchema(response.data);
    });
}

/*function registerSprites(id, schema) {
  return function () {
    return {
      schema: schema,
      cb: function (val) {
        var observable = includeInstance(id);

        if(!observable) {
          //observable = ObservableArray();
          registerInstance(id, observable);
        }

        observable.subscribe(function(sprites) {
          return sprites;
        });

        observable.update(val);

        return observable;
      }
    }
  }
}*/

function registerSprites(id, method, schema) {
  return function () {
    return {
      schema: schema,
      cb: function (sprites) {
        var resource;
        var source = includeInstance(id);

        if(!source) {
          //resource = ResourceFactory(val, method);
          //observable = ObservableResource(resource);
          source = Rx.Observable.create(function (observable) {
            sprites.forEach(function(sprite) {
              observable.onNext(sprite);
            })
          });

          source = source.selectMany(function(sprite) {
            return SpriteSchema().select(function(type) {
              sprite.type = type;
              return sprite;
            });
          });

          registerInstance(id, source);
        }
      }
    }
  }
}

function passthru(val) {
  return val;
}

/*function getSprites(sprites) {
  sprites.forEach(function(sprite) {
    var observable = SpriteSchema();

    observable.subscribe(function(spriteType) {
      //sprite.spriteType = spriteType;
      //return sprite;
      console.log(spriteType);
    });

    //return observable;
    sprite.spriteType = observable;
    return sprite;
  });
  return sprites;
}*/

function getSceneSchema(data) {
  var schema = {
    layerDefinitions: {
      background: {
        //backgroundUrl: registerObservable('backgroundImage', ObservableImage)
        backgroundUrl: registerObservable('backgroundImage', getImage)
      },
      entities: {
        //sprites: registerObservable('sprites', getSprites)
        sprites: registerSprites('sprites', passthru)
      },
      collisions: {
        //colliders: registerObservable('colliders')
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
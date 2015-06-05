/**
 * Created by shaunwest on 5/9/15.
 */

//import SchemaMapper from '../engine/schema/schema-mapper.js';
import mapSchema from '../engine/schema/observable-schema.js';
import ObservableResource from '../engine/resources/observable-resource.js';
import ResourceFactory from '../engine/resources/resource-factory.js';
//import ImageResource from '../engine/resources/image-resource.js';
//import HttpResource from '../engine/resources/http-resource.js';
import frameSet from '../animation/frame-set.js';
import spriteAnimation from '../animation/sprite-animation.js';
import {attachResource, registerValue} from '../engine/schema/helper.js';
import {requestGet} from '../engine/kjax.js';
import {registerObservable} from '../engine/schema/helper.js';
import Rx from 'rx';
//var spriteSchema = SpriteSchema();

export default function SpriteSchema() {
  var source = Rx.Observable.create(function (observable) {
    requestGet('assets/kitty.json')
      .then(function(response) {
        observable.onNext(response.data);
      });
  });

  return source.selectMany(function(type) { // don't fully understand selectMany aka flatMap
    return getSpriteSchema(type);
  });

  /*var resource = ResourceFactory('assets/kitty.json', requestGet);
  var observable = ObservableResource(resource);

  observable.subscribe(function(response) {
    return getSpriteSchema(response.data);
  }, function(statusText) {
    console.log(statusText);
  });

  return observable;*/

  /*return HttpResource('kitty.json')
    .ready(function(spriteData) {
      var spriteSchema = getSpriteSchema();
      var sprite = spriteSchema.map(spriteData);
      console.log(sprite);
    });*/
}

/*function createAnimation(uri, container) {
  container['spriteSheet'] = ImageResource(uri).ready(function(spriteSheet) {
    container['animation'] = spriteAnimation(frameSet(container, spriteSheet));
  });
}*/

function getSpriteSchema(data) {
  /*return ObservableSchema(data, registerValue('spriteTypes', {
    '*': {
      //spriteSheetUrl: attachResource('spriteSheet', ImageResource)
      //spriteSheetUrl: createAnimation
    }
  }));*/
  var schema = registerValue('spriteTypes', {
    '*': {
      //spriteSheetUrl: attachResource('spriteSheet', ImageResource)
      //spriteSheetUrl: createAnimation
    }
  });

  return Rx.Observable.create(function(ob) {
    ob.onNext(mapSchema(data, schema));

    return function() {
      console.log('disposed');
    }
  });
}

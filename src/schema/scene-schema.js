/**
 * Created by shaunwest on 5/9/15.
 */

import ObservableSchema from '../engine/schema/observable-schema.js';
import ObservableResource from '../engine/resources/observable-resource.js';
import ObservableImage from '../engine/resources/observable-image.js';
import {registerValue, registerObservable} from '../engine/schema/helper.js';

export default function SceneSchema() {
  var resource = ObservableResource('assets/kitty-world.json');

  var subscription = resource.subscribe(function(data) {
    var sceneSchema = getSceneSchema(data);

    sceneSchema.subscribe(function(foo) {
      console.log(foo);
    });

    return sceneSchema;
  }, function(statusText) {
    console.log(statusText);
  });

  resource.fetch();

  return resource;
}

function getSceneSchema(data) {
  return ObservableSchema(data, {
    layerDefinitions: {
      background: {
        backgroundUrl: registerObservable('backgroundImage', ObservableImage)
      },
      entities: {
        sprites: registerValue('sprites')
      },
      collisions: {
        colliders: registerValue('colliders')
      }
    }
  });
}
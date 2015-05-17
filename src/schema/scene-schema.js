/**
 * Created by shaunwest on 5/9/15.
 */

import SchemaMapper from '../engine/schema/schema-mapper.js';
import ImageResource from '../engine/resources/image-resource.js';
import HttpResource from '../engine/resources/http-resource.js';
import {registerResource, registerValue} from '../engine/schema/helper.js';

export default function SceneSchema() {
  return HttpResource('kitty-world.json')
    .ready(function(sceneData) {
      var schema = getSceneSchema();
      var scene = schema.map(sceneData);
      console.log(scene);
      //Scene(scene);
    });
}


function getSceneSchema() {
  return new SchemaMapper({
    layerDefinitions: {
      background: {
        backgroundUrl: registerResource('backgroundImage', ImageResource)
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
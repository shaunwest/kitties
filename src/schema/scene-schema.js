/**
 * Created by shaunwest on 5/9/15.
 */

import SchemaMapper from '../engine/schema-mapper.js';
import ImageResource from '../engine/resources/image-resource.js';
import {includeInstance} from '../engine/container.js';

function setProp(prop, func) {
  return function(val, container) {
    container[prop] = func(val, container);
  }
}

/*function registerResource(id, resource) {
  register(id, resource);
  return function(val) {
    return resource.fetch(val);
  }
}*/

function includeResource(id) {
  return function(val) {
    var resource = includeInstance(id);
    resource.fetch(val);
  }
}

export default function SceneSchema() {
  return new SchemaMapper({
    layerDefinitions: {
      background: {
        //backgroundUrl: setProp('background', ImageResource)
        // register this resource so it can be injected
        //backgroundUrl: registerResource('background1', ImageResource())
        backgroundUrl: includeResource('background1')
      }
      /*entities: {
        sprites: [
          {
            src: SpriteSchema
          }
        ]
      }*/
    }
  });
}
/**
 * Created by shaunwest on 5/9/15.
 */

import SchemaMapper from '../engine/schema/schema-mapper.js';
import ImageResource from '../engine/resources/image-resource.js';
import {includeResource, registerValue, echo} from '../engine/schema/helper.js';
import HttpResource from '../engine/resources/http-resource.js';
import SpriteSchema from './sprite-schema.js';
import {getInstances} from '../engine/container.js';

/*function getSpriteSchema(val) {
  var spriteSchema = SpriteSchema();

  HttpResource(val)
    .ready(function(spriteData) {
      var sprite = spriteSchema.map(spriteData);
      console.log(getInstances());
    });
}*/

export default function SceneSchema() {
  return new SchemaMapper({
    layerDefinitions: {
      background: {
        backgroundUrl: includeResource('backgroundImage')
      },
      /*entities: {
        sprites: registerValue('sprites')
      }*/
      entities: {
        sprites: registerValue('sprites')
      }
    }
  });
}
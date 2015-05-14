/**
 * Created by shaunwest on 5/9/15.
 */

import SchemaMapper from '../engine/schema/schema-mapper.js';
import {includeResource, registerValue} from '../engine/schema/helper.js';

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
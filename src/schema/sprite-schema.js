/**
 * Created by shaunwest on 5/9/15.
 */

import SchemaMapper from '../engine/schema/schema-mapper.js';
import ImageResource from '../engine/resources/image-resource.js';
import {attachResource, registerValue} from '../engine/schema/helper.js';

export default function SpriteSchema() {
  return new SchemaMapper(registerValue('spriteTypes', {
    '*': {
      spriteSheetUrl: attachResource('spriteSheet', ImageResource)
    }
  }));
}

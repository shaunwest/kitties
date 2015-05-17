/**
 * Created by shaunwest on 5/9/15.
 */

import SchemaMapper from '../engine/schema/schema-mapper.js';
import ImageResource from '../engine/resources/image-resource.js';
import HttpResource from '../engine/resources/http-resource.js';
import frameSet from '../animation/frame-set.js';
import spriteAnimation from '../animation/sprite-animation.js';
import {attachResource, registerValue} from '../engine/schema/helper.js';

//var spriteSchema = SpriteSchema();

export default function SpriteSchema() {
  return HttpResource('kitty.json')
    .ready(function(spriteData) {
      var spriteSchema = getSpriteSchema();
      var sprite = spriteSchema.map(spriteData);
      console.log(sprite);
    });
}

function createAnimation(uri, container) {
  container['spriteSheet'] = ImageResource(uri).ready(function(spriteSheet) {
    container['animation'] = spriteAnimation(frameSet(container, spriteSheet));
  });
}

function getSpriteSchema() {
  return new SchemaMapper(registerValue('spriteTypes', {
    '*': {
      //spriteSheetUrl: attachResource('spriteSheet', ImageResource)
      spriteSheetUrl: createAnimation
    }
  }));
}

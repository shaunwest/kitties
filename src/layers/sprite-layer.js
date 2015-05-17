/**
 * Created by shaunwest on 5/4/15.
 */

import async from '../engine/decorators/async.js'
import fragment from '../engine/decorators/fragment.js'
import Scheduler from '../engine/scheduler.js'
import SpriteRenderer from '../engine/renderer/sprite-renderer.js'
import viewport from '../viewport.js'

@fragment('canvas-entities')
@async('sprites')
@async('spriteTypes')
export default class SpriteLayer {
  constructor(canvas, spritesPromise, spriteTypesPromise) {
    var renderer = new SpriteRenderer(canvas);

    Scheduler(function () {
      renderer.draw(viewport);
    });

    renderer.clear();

    // this stuff should probably be moved out of here
    spritesPromise.then(function(sprites) {
      sprites.forEach(function(sprite) {
        // not quite right... each individual sprite should have its own animation object
        spriteTypesPromise.then(function(spriteTypes) {
          var spriteType = spriteTypes[sprite.srcId];

          spriteType.spriteSheet.ready(function() {
            spriteType.animation.play('run');
            renderer.addEntity(spriteType);
          });
        });
      });
    });

    this.renderer = renderer;
  }
}


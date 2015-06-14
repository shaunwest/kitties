/**
 * Created by shaunwest on 5/4/15.
 */

import model from '../engine/decorators/model.js'
import fragment from '../engine/decorators/fragment.js'
import use from '../engine/decorators/use.js'
import Scheduler from '../engine/scheduler.js'
import SpriteRenderer from '../engine/renderer/sprite-renderer.js'
import Viewport from '../viewport.js'

@use(Viewport)
@fragment('canvas-entities')
@model('sprites')
export default class SpriteLayer {
  constructor(viewport, canvas, spritesSource) {
    var renderer = new SpriteRenderer(canvas);

    Scheduler(function () {
      renderer.draw(viewport);
    });

    spritesSource.subscribe(function(sprite) {
      renderer.clear();
      sprite.animation.play('run');
      renderer.addEntity(sprite);
    });
  }
}


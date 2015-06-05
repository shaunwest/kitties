/**
 * Created by shaunwest on 5/4/15.
 */

import model from '../engine/decorators/model.js'
import fragment from '../engine/decorators/fragment.js'
import Scheduler from '../engine/scheduler.js'
import SpriteRenderer from '../engine/renderer/sprite-renderer.js'
import viewport from '../viewport.js'

@model('sprites')
@fragment('canvas-entities')
export default class SpriteLayer {
  constructor(canvas, spritesObservable) {
    var renderer = new SpriteRenderer(canvas);

    Scheduler(function () {
      renderer.draw(viewport);
    });

    spritesObservable.subscribe(function(sprite) {
      renderer.clear();
      console.log(sprite);
      /*sprites.forEach(function(sprite) {
        console.log(sprite);
        // not quite right... each individual sprite should have its own animation object
        //spriteTypesPromise.then(function(spriteTypes) {
        //  var spriteType = spriteTypes[sprite.srcId];
        //
        //  spriteType.spriteSheet.ready(function() {
        //    spriteType.animation.play('run');
        //    renderer.addEntity(spriteType);
        //  });
        //});
      });*/
    });

    this.renderer = renderer;
  }
}


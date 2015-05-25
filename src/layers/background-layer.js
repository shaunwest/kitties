/**
 * Created by shaunwest on 5/4/15.
 */

import fragment from '../engine/decorators/fragment.js'
import model from '../engine/decorators/model.js'
import Scheduler from '../engine/scheduler.js'
import ImageRenderer from '../engine/renderer/image-renderer.js'
import viewport from '../viewport.js'

@model('backgroundImage')
@fragment('canvas-background')
class BackgroundLayer {
  constructor (canvas, backgroundImageObservable) {
    var renderer = new ImageRenderer(canvas);

    Scheduler(function () {
      renderer.draw(viewport);
    });

    backgroundImageObservable.subscribe(function(image) {
      renderer.setImage(image);
    });
  }
}
/**
 * Created by shaunwest on 5/4/15.
 */

import fragment from '../engine/decorators/fragment.js'
import async from '../engine/decorators/async.js'
import Scheduler from '../engine/scheduler.js'
import ImageRenderer from '../engine/renderer/image-renderer.js'
import viewport from '../viewport.js'
import ImageResource from '../engine/resources/image-resource.js'

@fragment('canvas-background')
//@create('backgroundImage', ImageResource) // maybe should be created elsewhere...
@async('backgroundImage')
export default class BackgroundLayer {
  constructor (canvas, backgroundImagePromise) {
    var renderer = new ImageRenderer(canvas);

    Scheduler(function () {
      renderer.draw(viewport);
    });

    backgroundImagePromise.then(function(backgroundImageResource) {
      backgroundImageResource.ready(function(backgroundImage) {
        renderer.setImage(backgroundImage);
      });
    });
  }
}
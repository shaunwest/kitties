/**
 * Created by shaunwest on 5/4/15.
 */

import fragment from '../engine/decorators/fragment.js';
import model from '../engine/decorators/model.js';
import use from '../engine/decorators/use.js';
import Scheduler from '../engine/scheduler.js';
import ImageRenderer from '../engine/renderer/image-renderer.js';
import Viewport from '../viewport.js';

@use(Viewport)
@fragment('canvas-background')
@model('backgroundImage')
export default class BackgroundLayer {
  constructor (viewport, canvas, backgroundImageSource) {
    var renderer = new ImageRenderer(canvas);

    Scheduler(function () {
      renderer.draw(viewport);
    });

    backgroundImageSource.subscribe(function(image) {
      renderer.setImage(image);
    });
  }
}
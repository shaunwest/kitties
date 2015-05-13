/**
 * Created by shaunwest on 5/4/15.
 */

import fragment from '../engine/decorators/fragment.js'
import create from '../engine/decorators/create.js'
import Scheduler from '../engine/scheduler.js'
import ImageLayer from '../engine/layers/image-layer.js'
import viewport from '../viewport.js'
import ImageResource from '../engine/resources/image-resource.js'

@fragment('canvas-background')
@create('backgroundImage', ImageResource)
export default class BackgroundLayer {
  constructor (canvasBackground, backgroundImage) {
    var backgroundLayer = new ImageLayer(canvasBackground);

    Scheduler(function () {
      backgroundLayer.draw(viewport);
    });

    backgroundImage.ready(function(background) {
      backgroundLayer.setBackground(background);
    });
  }
}
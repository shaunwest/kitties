/**
 * Created by shaunwest on 5/4/15.
 */

import {Fragment} from '../engine/fragments.js'
import create from '../engine/decorators/create.js'
import Scene from '../engine/world/scene.js'
import Scheduler from '../engine/scheduler.js'
import BackgroundLayer from '../engine/layers/background-layer.js'
import viewport from '../viewport.js'
import ImageResource from '../engine/resources/image-resource.js'

//@use('background1')
@create('background1', ImageResource)
export default class Background1 {
  constructor (background1) {
    var canvasBackground = Fragment('canvas-background');
    var backgroundLayer = new BackgroundLayer(canvasBackground);

    Scheduler(function () {
      backgroundLayer.draw(viewport);
    });

    /*scene.ready(function (scene1) {
      scene1.background.ready(function (background) {
        backgroundLayer.setBackground(background);
      });
    });*/

    background1.ready(function(background) {
      backgroundLayer.setBackground(background);
    });

    this.backgroundLayer = backgroundLayer;
  }

  get layer() {
    return this.backgroundLayer;
  }
}
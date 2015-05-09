/**
 * Created by shaunwest on 5/4/15.
 */

import {Fragment} from '../engine/fragments.js'
import {use} from '../engine/injector.js'
import Scene from '../engine/world/scene.js'
import Scheduler from '../engine/scheduler.js'
import BackgroundLayer from '../engine/layers/background-layer.js'
import viewport from '../viewport.js'

@use(Scene)
export default class Background1 {
  constructor(scene) {
    var canvasBackground = Fragment('canvas-background');
    var backgroundLayer = new BackgroundLayer(canvasBackground);

    Scheduler(function () {
      backgroundLayer.draw(viewport);
    });

    scene.ready(function (scene1) {
      scene1.background.ready(function (background) {
        backgroundLayer.setBackground(background);
      });
    });

    this.backgroundLayer = backgroundLayer;
  }

  get layer() {
    return this.backgroundLayer;
  }
}
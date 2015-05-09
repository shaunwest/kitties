/**
 * Created by shaunwest on 5/4/15.
 */

import {use} from '../engine/injector.js'
import {Fragment} from '../engine/fragments.js'
import Scene from '../engine/world/scene.js'
import Scheduler from '../engine/scheduler.js'
import EntityLayer from '../engine/layers/entity-layer.js'
import viewport from '../viewport.js'

@use(Scene)
export default class Entity1 {
  constructor(scene) {
    var canvasEntities = Fragment('canvas-entities');
    var entityLayer = new EntityLayer(canvasEntities);

    Scheduler(function () {
      entityLayer.draw(viewport);
    });

    entityLayer.clear();
    scene.ready(function(scene1) {
      scene1.sprite.ready(function (sprite) {
        sprite.animation.play('run');
        entityLayer.addEntity(sprite);
      }, function() {
        console.log('ERROR!!')
      });
    });

    this.entityLayer = entityLayer;
  }

  get layer() {
    return this.entityLayer;
  }
}


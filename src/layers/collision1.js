/**
 * Created by shaunwest on 5/4/15.
 */

import {Fragment} from '../engine/fragments.js'
import {use} from '../engine/injector.js'
import Scene from '../engine/world/scene.js'
import Scheduler from '../engine/scheduler.js'
import CollisionLayer from '../engine/layers/collision-layer.js'
import viewport from '../viewport.js'

@use(Scene)
export default class Collision1 {
  constructor(scene) {
    var canvasColliders = Fragment('canvas-colliders');
    var collisionLayer = new CollisionLayer(canvasColliders);

    Scheduler(function () {
      collisionLayer.draw(viewport);
    });

    scene.ready(function(scene) {
      collisionLayer.setColliders(scene.sceneData.layerDefinitions.collisions.colliders);
    });

    this.collisionLayer = collisionLayer;
  }

  get layer() {
    return this.collisionLayer;
  }
}
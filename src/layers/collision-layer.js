/**
 * Created by shaunwest on 5/4/15.
 */

import fragment from '../engine/decorators/fragment.js';
import model from '../engine/decorators/model.js';
import Scheduler from '../engine/scheduler.js';
import CollisionRenderer from '../engine/renderer/collision-renderer.js';
import viewport from '../viewport.js';

@fragment('canvas-colliders')
@model('colliders')
export default class CollisionLayer {
  constructor(canvas, collidersSource) {
    var renderer = new CollisionRenderer(canvas);

    Scheduler(function () {
      renderer.draw(viewport);
    });

    collidersSource.subscribe(function(collider) {
      console.log(collider);
    });

    /*collidersPromise.then(function(colliders) {
     renderer.setColliders(colliders);
    });*/
  }
}
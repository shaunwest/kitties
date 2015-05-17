/**
 * Created by shaunwest on 5/4/15.
 */

import fragment from '../engine/decorators/fragment.js';
import async from '../engine/decorators/async.js';
import Scheduler from '../engine/scheduler.js';
import CollisionRenderer from '../engine/renderer/collision-renderer.js';
import viewport from '../viewport.js';

@fragment('canvas-colliders')
@async('colliders')
export default class CollisionLayer {
  constructor(canvas, collidersPromise) {
    var renderer = new CollisionRenderer(canvas);

    Scheduler(function () {
      renderer.draw(viewport);
    });

    collidersPromise.then(function(colliders) {
     renderer.setColliders(colliders);
    });

    this.renderer = renderer;
  }
}
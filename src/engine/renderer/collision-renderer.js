/**
 * Created by Shaun on 2/28/15
 * 
 */

import {intersects} from '../common.js';

const COLLIDER_STROKE = '#ff00ff';
const ENTITY_STROKE = '#50ff68';

export default class CollisionRenderer  {
  constructor (canvas) {
    this.colliders = [];
    this.entities = [];
    this.canvas = canvas;
    this.context2d = canvas.getContext('2d');
  }

  // FIXME: change it to addEntity or something
  setEntities (value) {
    this.entities = value;
  }

  setColliders (value) {
    this.colliders = value;
  }

  draw (viewport) {
    var context2d = this.context2d;

    this.context2d.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context2d.strokeStyle = COLLIDER_STROKE;

    this.colliders.forEach(function(collider) {
      if(!intersects(collider, viewport)) {
        return;
      }
      context2d.strokeRect(
        collider.x - viewport.x,
        collider.y - viewport.y,
        collider.width,
        collider.height
      );
    });

    context2d.strokeStyle = ENTITY_STROKE;
    this.entities.forEach(function(entity) {
      if(!intersects(entity, viewport)) {
        return;
      }
      context2d.strokeRect(
        entity.x - viewport.x,
        entity.y - viewport.y,
        entity.width,
        entity.height
      );
    });
    return this;
  }

  getLayer () {
    return this.canvas;
  }
}

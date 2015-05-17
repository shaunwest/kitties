/**
 * Created by Shaun on 2/5/15
 * 
 */

import {intersects} from '../common.js';

export default class SpriteRenderer {
  constructor(canvas) {
    this.entities = [];
    this.context2d = canvas.getContext('2d');
    this.canvas = canvas;
  }

  addEntity (entity) {
    this.entities.push(entity);
    return this;
  }

  clear () {
    this.entities.length = 0;
    return this;
  }

  draw (viewport) {
    var entity, image;

    this.context2d.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for(var i = 0, numEntities = this.entities.length; i < numEntities; i++) {
      entity = this.entities[i];

      if(!entity.animation) {
        continue;
      }

      if(!intersects(entity, viewport)) {
        continue;
      }

      image = entity.animation.getImage();
      if(image) {
        this.context2d.drawImage(
          image,
          entity.x - viewport.x || 0,
          entity.y - viewport.y || 0
        );
      }
    }

    return this;
  }

  getLayer () {
    return this.canvas;
  }
}

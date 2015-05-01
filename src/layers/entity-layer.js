/**
 * Created by Shaun on 2/5/15
 * 
 */

import {intersects} from '../common.js';

export default function (canvas) {
  var entities = [];
  var context2d = canvas.getContext('2d');

  return {
    addEntity: function(entity) {
      entities.push(entity);
      return this;
    },
    clear: function() {
      entities.length = 0;
    },
    draw: function(viewport) {
      var entity, image;

      context2d.clearRect(0, 0, canvas.width, canvas.height);

      for(var i = 0, numEntities = entities.length; i < numEntities; i++) {
        entity = entities[i];

        if(!entity.animation) {
          continue;
        }

        if(!intersects(entity, viewport)) {
          continue;
        }

        image = entity.animation.getImage();
        if(image) {
          context2d.drawImage(
            image,
            entity.x - viewport.x || 0,
            entity.y - viewport.y || 0
          );
        }
      }

      return this;
    },
    getLayer: function() {
      return canvas;
    }
  };
}

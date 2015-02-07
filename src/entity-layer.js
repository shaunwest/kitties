/**
 * Created by Shaun on 2/5/15
 * 
 */

register('EntityLayer', [], function() {
  'use strict';

  return function(canvas) {
    var entities = [];
    var context2d = canvas.getContext('2d'); 

    return {
      addEntity: function(entity) {
        entities.push(entity);
        return this;
      },
      draw: function() {
        var entity, image;

        context2d.clearRect(0, 0, canvas.width, canvas.height);

        for(var i = 0, numEntities = entities.length; i < numEntities; i++) {
          entity = entities[i];

          if(!entity.getImage) {
            continue;
          }

          image = entity.getImage();
          if(image) {
            context2d.drawImage(image, entity.x || 0, entity.y || 0); 
          }
        }

        return this;
      },
      getLayer: function() {
        return canvas;
      }
    };
  }
});
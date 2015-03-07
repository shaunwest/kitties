/**
 * Created by Shaun on 2/28/15
 * 
 */

register('CollisionLayer', ['Common'], function(Common) {
  'use strict';

  var COLLIDER_STROKE = '#ff00ff';
  var ENTITY_STROKE = '#50ff68';

  return function(canvas) {
    var colliders = [], entities = [];
    var context2d = canvas.getContext('2d'); 

    return {
      // FIXME: change it to addEntity or something
      setEntities: function(value) {
        entities = value;
      },
      setColliders: function(value) {
        colliders = value;
      },
      draw: function(viewport) {
        context2d.clearRect(0, 0, canvas.width, canvas.height);
        context2d.strokeStyle = COLLIDER_STROKE;

        colliders.forEach(function(collider) {
          if(!Common.intersects(collider, viewport)) {
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
        entities.forEach(function(entity) {
          if(!Common.intersects(entity, viewport)) {
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
      },
      getLayer: function() {
        return canvas;
      }
    };
  }
});
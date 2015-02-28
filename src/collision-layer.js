/**
 * Created by Shaun on 2/28/15
 * 
 */

register('CollisionLayer', [], function() {
  'use strict';

  return function(canvas) {
    var colliders = [];
    var context2d = canvas.getContext('2d'); 

    return {
      setColliders: function(value) {
        colliders = value;
      },
      draw: function(viewport) {
        context2d.clearRect(0, 0, canvas.width, canvas.height);
        context2d.strokeStyle = '#ff00ff';
        colliders.forEach(function(collider) {
          context2d.strokeRect(collider.x, collider.y, collider.width, collider.height);
        }); 
        return this;
      },
      getLayer: function() {
        return canvas;
      }
    };
  }
});
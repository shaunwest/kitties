/**
 * Created by Shaun on 2/5/15
 * 
 */

register('BackgroundLayer', [], function() {
  'use strict';

  return function(canvas) {
    var background;
    var context2d = canvas.getContext('2d'); 

    return {
      setBackground: function(image) {
        background = image;
        return this;
      },
      draw: function(viewport) {
        if(!viewport) {
          return;
        }
        
        context2d.clearRect(0, 0, canvas.width, canvas.height);
        
        if(background) {
          context2d.drawImage(
            background, 
            viewport.x, viewport.y, 
            viewport.width, viewport.height, 
            0, 0, 
            viewport.width, viewport.height
          ); 
        }

        return this;
      },
      getLayer: function() {
        return canvas;
      }
    };
  }
});
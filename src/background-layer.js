/**
 * Created by Shaun on 2/5/15
 * 
 */

register('BackgroundLayer', ['Common'], function(Common) {
  'use strict';

  return function(width, height) {
    var background;
    var canvas = Common.getCanvas(width, height);
    var context2d = canvas.getContext('2d'); 

    return {
      setBackground: function(image) {
        background = image;
        return this;
      },
      draw: function() {
        context2d.clearRect(0, 0, canvas.width, canvas.height);
        
        if(background) {
          context2d.drawImage(background, 0, 0); 
        }

        return this;
      },
      getLayer: function() {
        return canvas;
      }
    }
  }
});
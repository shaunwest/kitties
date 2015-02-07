/**
 * Created by Shaun on 2/5/15
 * 
 */

register('SpriteLayer', ['Common'], function(Common) {
  'use strict';

  function SpriteLayer(width, height) {
    var sprites = [];
    var canvas = Common.getCanvas(width, height);
    var context2d = canvas.getContext('2d'); 

    return {
      addSprite: function(spriteAnimation) {
        sprites.push(spriteAnimation);
        return this;
      },
      draw: function() {
        var spriteAnimation, currentFrame;

        context2d.clearRect(0, 0, canvas.width, canvas.height);

        for(var i = 0, numSprites = sprites.length; i < numSprites; i++) {
          spriteAnimation = sprites[i];
          currentFrame = spriteAnimation.currentFrame();
          if(currentFrame) {
            context2d.drawImage(currentFrame, 0, 0); 
          }
        }

        return this;
      },
      getLayer: function() {
        return canvas;
      }
    }
  }

  return SpriteLayer;
});
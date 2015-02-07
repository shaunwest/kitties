register('SpriteAnimation', ['Scheduler', 'Obj'], function(Scheduler, Obj) {
  'use strict';

  return function (sprite) {
    var currentFrameSet = null,
      currentFrameIndex = 0,
      currentFrame = null,
      frameCallback = null;

    var schedulerId = Scheduler(function(deltaTime, setRate) {
      if(!currentFrameSet) {
        return;
      }

      if(!currentFrame) {
        setRate(currentFrameSet.rate);
      }
      
      currentFrame = currentFrameSet.frames[currentFrameIndex]
      if(frameCallback) {
        frameCallback(currentFrame);
      }

      if(++currentFrameIndex >= currentFrameSet.frames.length) {
        currentFrameIndex = 0;        
      }
    })
      .id();

    return {
      play: function(frameSetId) {
        currentFrameSet = sprite.frameSets[frameSetId];
        currentFrameIndex = 0;
        currentFrame = null;
        return this;
      },
      onFrame: function(cb) {
        frameCallback = cb;
        return this;
      },
      stop: function() {
        currentFrameSet = null;
        return this;
      },
      kill: function() {
        scheduler.unschedule(schedulerId);
        return this;
      },
      currentFrameIndex: function() {
        return currentFrameIndex;
      },
      getImage: function() {
        return currentFrame;
      }
    };
  }
});
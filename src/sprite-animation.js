register('SpriteAnimation', ['Scheduler', 'Obj'], function(Scheduler, Obj) {
  'use strict';

  function SpriteAnimation(sprite) {
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
        currentFrameSet = sprite.frameSet[frameSetId];
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
      currentFrame: function() {
        return currentFrame;
      }
    };
  }

  return SpriteAnimation;

  /*function play(frameSetId) {
    this.currentFrameSet = this.sprite.frameSet[frameSetId];
    this.currentFrame = 0;

    if(this.schedulerId) {
      return;
    }

    this.schedulerId = scheduler.schedule(frame.bind(this));
  }

  function frame(deltaTime) {
    if(this.currentFrame >= this.currentFrameSet.length) {
      this.currentFrame = 0;
    }


  }

  function kill() {

  }

  return {
    sprite: null,
    currentFrame: 0,
    schedulerId: 0,
    frameCallback: null,
    target: target,
    play: play
  };*/
});
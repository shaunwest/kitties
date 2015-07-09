
export default function (frameSet) {
  var currentFrameSequence = frameSet['run'], //null,
    currentFrameIndex = 0,
    currentFrame = null,
    frameCallback = null;

  return {
    play: function(frameSetId) {
      currentFrameSequence = frameSet[frameSetId];
      currentFrameIndex = 0;
      currentFrame = null;
      return this;
    },
    onFrame: function(cb) {
      frameCallback = cb;
      return this;
    },
    stop: function() {
      currentFrameSequence = null;
      return this;
    },
    kill: function() {
      Scheduler.unschedule(schedulerId);
      return this;
    },
    currentFrameIndex: function() {
      return currentFrameIndex;
    },
    getImage: function() {
      return currentFrame;
    },
    getNext: function() {
      currentFrame = currentFrameSequence.frames[currentFrameIndex];
      if(++currentFrameIndex >= currentFrameSequence.frames.length) {
        currentFrameIndex = 0;
      }
      return currentFrame;
    }
  };
}

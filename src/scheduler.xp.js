

register('Schedule', [], function() {
  'use strict';

  function Schedule(cb) {
    var actualFps = 0,
      ticks = 0,
      elapsedSeconds = 0,
      running = true;
    var lastUpdateTime = new Date();
    var oneSecondTimerId = window.setInterval(onOneSecond.bind(this), ONE_SECOND);

    function makeFrame() {
      var count = 1;
      var deltaTime = 0;
      return function(_deltaTime) {
        deltaTime += _deltaTime;
        if(count !== rate) {
          count++;
          return;
        }
        cb(deltaTime);
        count = 1;
        deltaTime = 0;
      };
    }

    if(!Util.isFunction(cb)) {
      Util.error('Scheduler: only functions can be scheduled.');
    }
    rate = rate || 1;

    this.scheduled.push(makeFrame());

    return this.scheduled.length;

  }

  return Schedule;    
});
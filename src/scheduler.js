/**
 * Created by Shaun on 2/1/15
 * Based on the jack2d Chrono object
 * 
 */

register('Scheduler', ['Util', '_'], function(Util, _) {
  'use strict';

  var instance;
  var ONE_SECOND = 1000;

  function Scheduler(cb, rate) {
    if(!instance) {
      instance = create();      
    }
    if(cb) {
      instance.schedule(cb, rate);
    }
    return instance;
  }

  Scheduler.instance = create;

  function create() {
    return _.assign({}, {
      scheduled: [],
      schedule: schedule,
      unschedule: unschedule,
      start: start,
      stop: stop,
      frame: frame,
      id: id
    }).start();
  }

  function schedule(cb, rate) {
    function setRate(newRate) {
      rate = newRate; 
    } 

    function makeFrame() {
      var count = 1,
        totalDeltaTime = 0;

      return function(deltaTime) {
        totalDeltaTime += deltaTime;
        if(count !== rate) {
          count++;
          return;
        }
        cb(totalDeltaTime, setRate);
        count = 1;
        totalDeltaTime = 0;
      };
    }

    if(!Util.isFunction(cb)) {
      Util.error('Scheduler: only functions can be scheduled.');
    }
    rate = rate || 1;

    this.scheduled.push(makeFrame());

    return this;
  }

  function id() {
    return this.scheduled.length;
  }

  function unschedule(id) {
    this.scheduled.splice(id - 1, 1);
    return this;
  }

  function start() {
    if(this.running) {
      return this;
    }

    _.assign(this, {
      actualFps: 0,
      ticks: 0,
      elapsedSeconds: 0,
      running: true,
      lastUpdateTime: new Date(),
      oneSecondTimerId: window.setInterval(onOneSecond.bind(this), ONE_SECOND)
    });

    return this.frame();
  }

  function stop() {
    this.running = false;
    window.clearInterval(this.oneSecondTimerId);
    window.cancelAnimationFrame(this.animationFrameId);

    return this;
  }

  function clear() {
    this.scheduled.length = 0;
    return this;
  }

  function frame() {
    executeFrameCallbacks.bind(this)(getDeltaTime.bind(this)());
    this.ticks++;

    if(this.running) {
      this.animationFrameId = window.requestAnimationFrame(frame.bind(this)); 
    }

    return this;
  }

  function onOneSecond() {
    this.actualFps = this.ticks;
    this.ticks = 0;
    this.elapsedSeconds++;
  }

  function executeFrameCallbacks(deltaTime) {
    var scheduled = this.scheduled;

    for(var i = 0, numScheduled = scheduled.length; i < numScheduled; i++) {
      scheduled[i](deltaTime);
    }
  }

  function getDeltaTime() {
    var now = +new Date();
    var deltaTime = (now - this.lastUpdateTime) / ONE_SECOND;

    this.lastUpdateTime = now;

    return deltaTime;
  }

  return Scheduler;
});
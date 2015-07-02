/**
 * Created by shaunwest on 6/20/15.
 */

/*export default function Scheduler() {
  let running = false, callbacks = [];

  function frameLoop() {
    if(!running) {
      return;
    }
    window.requestAnimationFrame(function () {
      callbacks.forEach(function (callback) {
        callback();
      });
      frameLoop();
    });
  }

  return {
    halt: function () {
      running = false;
      return this;
    },
    resume: function () {
      if(!running) {
        running = true;
        frameLoop();
      }

      return this;
    },
    frame: function (cb) {
      callbacks.push(cb);
      this.resume();
      return this;
    }
  };
}*/

export default function Frame() {
  var cbs = [];

  (function frameLoop() {
    window.requestAnimationFrame(function () {
      var fps = 30;
      cbs = cbs
        .map(function (cb) {
          return cb(fps) && cb;
        })
        .filter(function (cb) {
          return cb;
        });
      frameLoop();
    });
  })();

  return function (cb) {
    cbs.push(cb);
  }
}



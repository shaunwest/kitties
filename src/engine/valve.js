/**
 * Created by shaunwest on 6/20/15.
 *
 * TODO: dispose()
 */

/**
 *
var valve = Valve.create(function (emit, error) {
  setInterval(function () {
    error('hello');
  }, 500);
}).then(function (msg) {
  return msg + ' Shaun';
}).then(function (newMsg) {
  return new Promise(function (resolve) {
    setInterval(function () {
      resolve(newMsg + '!!!!');
    }, 500);
  });
}).then(
  function (newerMsg) {
    console.log(newerMsg);
  }, function (msg) {
    console.log(msg);
  });
*/

function cloneArray(array) {
  return array.slice(0);
}

function handleAll(thenables, doApply) {
  return Valve.create(function (emit) {
    var count = thenables.length;
    var values = [];

    function checkCount() {
      if(--count === 0) {
        (doApply) ?
          emit.apply(null, values) :
          emit(values);
      }
    }

    thenables.forEach(function (thenable, index) {
      if(!thenable) {
        throw 'Implement error scenario';
        return;
      }

      if(!thenable.then) {
        values[index] = thenable;
        checkCount();
        return;
      }

      thenable.then(function (value) {
        values[index] = value;
        checkCount();
      });
    });
  })
}

function iterate(iterator, value, attached, failed) {
  let item = iterator.next();
  if (item.done) {
    return;
  }

  let listener = (failed) ?
    item.value.fail :
    item.value.success;

  if (value && value.then) {
    if(value.attached) {
      attached = attached.concat(value.attached);
    }

    value.then(
      function (value) {
        iterate(iterator, listener.apply(null, [value].concat(attached)), attached, failed);
      },
      function (value) {
        iterate(iterator, listener.apply(null, [value].concat(attached)), attached, true);
      }
    );
    return;
  }
  iterate(iterator, listener.apply(null, [value].concat(attached)), attached, failed);
}

export default class Valve {
  constructor(executor) {
    this.started = false;
    this.attached = [];
    this.listeners = [];
    this.executor = executor;
  }

  execute() {
    // Iterate over listeners on next run of
    // the js event loop
    // TODO: node support
    setTimeout(() => {
      this.executor(
        // Emit
        (value) => {
          iterate(this.listeners[Symbol.iterator](), value, this.attached);
        },
        // Error
        (value) => {
          iterate(this.listeners[Symbol.iterator](), value, this.attached, true);
        }
      );
    }, 1);
  }

  //TODO: error scenario
  static create(executor) {
    if(executor.then) {
      return new Valve(function (emit) {
        executor.then(emit);
      });
    }
    return new Valve(executor);
  }

  //TODO: error scenario
  static all(thenables) {
    return handleAll(thenables);
  }

  static applyAll(thenables) {
    return handleAll(thenables, true);
  }

  clone(onSuccess, onFailure) {
    var newValve = new Valve(this.executor);
    newValve.listeners = cloneArray(this.listeners);
    newValve.attached = cloneArray(this.attached);
    newValve.started = this.started;
    return (onSuccess) ? newValve.then(onSuccess, onFailure) : newValve;
  }

  attach(value) {
    this.attached.push(value);
    return this;
  }

  then(onSuccess, onFailure) {
    if(typeof onSuccess !== 'function') {
      throw 'Valve: then() requires a function as first argument.'
    }
    this.listeners.push({
      success: onSuccess,
      fail: onFailure || function (value) { return value; }
    });

    if(!this.started) {
      this.execute();
      this.started = true;
    }

    return this;
  }
}
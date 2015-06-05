/**
 * Created by shaunwest on 5/25/15.
 */

import Rx from 'rx';

export default function ObservableArray(array) {
  var observers = [];

  var observable = Rx.Observable.create(function(observer) {
    observers.push(observer);

    return function() {
      array = null;
      observers.length = 0;
      console.log('ObservableArray: disposed');
    }
  });

  function update (newArray) {
    array = newArray;
    observers.forEach(function(observer) {
      observer.onNext(array);
    });
  }

  if(array) {
    update(array);
  }

  return {
    get items () {
      return array;
    },
    update: update,
    subscribe () {
      if (observable) {
        return observable.subscribe(...arguments);
      }
    }
  };
}

/*var arrayStream = ArrayStream();
arrayStream.subscribe(function(value) {
  console.log(value);
});

arrayStream.add('foo');
arrayStream.add('bar');*/
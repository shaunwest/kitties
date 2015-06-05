/**
 * Created by shaunwest on 5/23/15.
 */

import Rx from 'rx';

// This is an Observable factory
export default function ObservableResource (resource) {
  var observers = [], updated = false;

  resource.onUpdate(function() {
    var args = arguments;
    observers.forEach(function(observer) {
      observer.onNext.apply(observer, args);
    });
  }, function() {
    var args = arguments;
    observers.forEach(function(observer) {
      observer.onError.apply(observer, args);
    });
  });

  resource.onKill(function() {
    observers.forEach(function (observer) {
      observer.onCompleted();
    });
  });

  return Rx.Observable.create(function (observable) {
    observers.push(observable);

    if(!updated) {
      resource.update();
      updated = true;
    }

    // cleanup
    return function () {
      observers.length = 0;;
      console.log('ObservableResource: disposed');
    };
  });
}


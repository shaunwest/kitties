/**
 * Created by shaunwest on 5/11/15.
 */

import {registerInstance} from '../container.js';
import {lazyLoadSubject} from '../lazy.js';
import Rx from 'rx';

// do I want to keep this?
export function setProp(prop, func) {
  return function(val, container) {
    container[prop] = func(val, container);
  }
}

export function registerValue(id, schema) {
  return function() {
    return {
      schema: schema,
      cb: function (val) {
        registerInstance(id, val);
      }
    }
  };
}

export function registerObservable(id, schema, func) {
  return function(val, container) {
    return {
      schema: schema,
      cb: function (val) {
        func(lazyLoadSubject(id), val, container);
      }
    };
  }
}

export function registerArray(id, schema) {
  return registerObservable(id, schema, function(subject, array) {
    Rx.Observable.create(function(observable) {
      array.forEach(function(val) {
        observable.onNext(val);
      });
    }).subscribe(subject);
  });
}

export function registerPromise(id, promiseFactory, schema) {
  return registerObservable(id, schema, function(subject, val) {
    Rx.Observable
      .fromPromise(promiseFactory(val))
      .subscribe(subject);
  });
}



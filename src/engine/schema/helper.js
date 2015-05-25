/**
 * Created by shaunwest on 5/11/15.
 */

import Util from '../util.js';
import {includeInstance, registerInstance} from '../container.js';

export function setProp(prop, func) {
  return function(val, container) {
    container[prop] = func(val, container);
  }
}

export function includeResource(id) {
  return function (val) {
    var resource = includeInstance(id);
    if(resource) {
      resource.fetch(val);
    }
  }
}

export function registerResource(id, resourceFactory, schema) {
  return function () {
    return {
      schema: schema,
      cb: function (val) {
        var resource = resourceFactory();
        registerInstance(id, resource);
        resource.fetch(val);
      }
    }
  }
}

export function registerObservable(id, observableFactory, schema) {
  return function () {
    return {
      schema: schema,
      cb: function (val) {
        var observable = includeInstance(id);
        if(!observable) {
          observable = observableFactory(val);
          registerInstance(id, observable);
        }

        observable.subscribe(function(image) {
          console.log(image);
        }, function(err) {
          console.log(err);
        });

        observable.fetch(val);

        return observable;
      }
    }
  }
}

export function attachResource(key, resourceFactory) {
  return function(val, container) {
    container[key] = resourceFactory(val);
    return val;
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

export function echo() {
  return function(val) {
    console.log(val);
  }
}
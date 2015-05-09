/**
 * Created by shaunwest on 4/28/15.
 */
import {include, register, tryToInstantiate} from './container.js';

//var container = [];

/*function findInContainer(id) {
  var results = container.filter(function(singletonData) {
    if(id === singletonData.id) {
      return true;
    }
  });

  return (results.length) ? results[0].value : null;
}

function registerSingleton(constructor) {
  var instance = tryToInstantiate(constructor);
  if(instance) {
    register(constructor, instance);
    return instance;
  }

  return null;
}

function tryToInstantiate(constructor, msg) {
  try {
    return new constructor();
  } catch(e) {
    if(msg) {
      console.error(msg);
    }
    return null;
  }
}*/

function doInject(injected) {
  return function(target) {
    injected = (target._injected) ?
      injected.concat(target._injected) :
      injected;

    if(target._target) {
      target = target._target;
    }

    var newTarget = target.bind.apply(target, [null].concat(injected));
    newTarget._target = target;
    newTarget._injected = injected;
    return newTarget;
  };
}

function doUse(injectList) {
  injectList = Array.prototype.slice.call(injectList);

  return doInject(injectList.map(function(item) {
    var result = include(item);
    if(result) {
      return result;
    }
    if(typeof item !== 'string') {
      register(item);
      return include(item);
    }
  }));
}

function doInstance(injectList) {
  injectList = Array.prototype.slice.call(injectList);

  return doInject(injectList.map(function(item) {
    return tryToInstantiate(item) || item;
  }));
}

/*function doInject(args, instantiate) {
  args = Array.prototype.slice.call(args);
  var injected = args.map(function(injectable) {
    return (instantiate) ?
      tryToInstantiate(injectable, '"' + injectable + '" cannot be instantiated.') :
      findInContainer(injectable) || registerSingleton(injectable) || injectable;
  });

  return function(target) {
    injected = (target._injected) ?
      injected.concat(target._injected) :
      injected;

    if(target._target) {
      target = target._target;
    }

    var newTarget = target.bind.apply(target, [null].concat(injected));
    newTarget._target = target;
    newTarget._injected = injected;
    return newTarget;
  };
}*/

// Finds a saved value or singleton.
// Pass in a constructor to inject it as a singleton
// Pass in a string id to get a registered value
export function use() {
  return doUse(arguments);
}

// Creates a new instance of the provided constructors
// and injects them. Also accepts literal values, which
// will be directly injected.
export function instance() {
  //return doInject(arguments, true);
  return doInstance(arguments);
}

/*export function inject() {
  return doInject(arguments);
}*/





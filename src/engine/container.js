/**
 * Created by shaunwest on 4/30/15.
 */

var instances = {};
var singletons = [];
var callbacks = [];

// Use arrow => functions

function findSingleton (token) {
  var results = singletons.filter(function(singleton) {
    return (token === singleton.token);
  });

  return (results.length) ? results[0].instance : null;
}

function registerCallback (id, callback) {
  callbacks.push( {id: id, func: callback} );
}

function findCallbacks (id) {
  return callbacks.filter(function(callback) {
    return (id === callback.id);
  });
}

export function useFactory (id, factory) {
  return includeInstance(id) || registerFactory(id, factory);
}

export function useSingleton (token) {
  return includeSingleton(token) || registerSingleton(token);
}

/* I don't think this makes a whole lot of sense
export function useInstance(id, instance) {
  return includeInstance(id) || registerInstance(id, instance);
}*/

export function registerFactory (id, factory) {
  if(typeof factory == 'function') {
    return registerInstance(id, factory());
  }
  throw 'registerFactory: factory must be a function';
}


// some of these 'throw' calls could maybe be replaced with a "required" decorator
export function registerSingleton (token) {
  var instance;

  if(typeof token != 'function') {
    throw 'registerSingleton: argument must be a function';
  }

  instance = new token();
  if (instance) {
    singletons.push({
      token: token,
      instance: instance
    });
    return instance;
  }
}

export function registerInstance (id, instance) {
  if(typeof id != 'string' || typeof instance == 'undefined') {
    throw 'registerInstance: a string id and an instance are required';
  }
  instances[id] = instance;

  findCallbacks(id).forEach(function(callback) {
    callback.func(instance);
  });

  return instance;
}

export function includeSingleton (token) {
  return findSingleton(token);
}

export function includeInstance (id) {
  return instances[id];
}

export function includeInstanceAsync(id) {
  var instance;

  if(typeof id != 'string') {
    throw 'includeInstanceAsync: a string id is required';
  }

  instance = includeInstance(id);
  if(instance) {
    return Promise.resolve(instance);
  }

  return new Promise(function(resolve, reject) {
    registerCallback(id, function(instance) {
      resolve(instance);
    });
  });
}

export function getInstances () {
  return instances;
}
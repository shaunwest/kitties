/**
 * Created by shaunwest on 4/30/15.
 */

var instances = {};
var singletons = [];

function findSingleton (token) {
  var results = singletons.filter(function(singleton) {
    return (token === singleton.token);
  });

  return (results.length) ? results[0].instance : null;
}

export function useFactory (id, factory) {
  return includeInstance(id) || registerFactory(id, factory);
}

export function useSingleton (token, func) {
  return includeSingleton(token) || registerSingleton(token, func);
}

export function useInstance(id, instance) {
  return includeInstance(id) || registerInstance(id, instance);
}

export function registerFactory (id, factory) {
  if(typeof factory == 'function') {
    return registerInstance(id, factory());
  }
  throw 'registerFactory: factory must be a function';
}

export function registerSingleton (token) {
  var instance;

  if(typeof token != 'function') {
    throw 'registerSingleton: first argument must be a function';
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
  return instance;
}

export function includeSingleton (token) {
  return findSingleton(token);
}

export function includeInstance (id) {
  return instances[id];
}

export function getInstances () {
  return instances;
}
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
}

export function registerSingleton (token, func) {
  var instance;

  if(typeof token == 'string') {
    instance = new func();
  }

  if(typeof token == 'function') {
    instance = new token();
  }

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
    return;
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
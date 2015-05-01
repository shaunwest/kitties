/**
 * Created by shaunwest on 4/30/15.
 */

var container = {};
var singletons = [];

export function tryToInstantiate (constructor, msg) {
  try {
    return new constructor();
  } catch(e) {
    if(msg) {
      console.error(msg);
    }
    return null;
  }
}

function findSingleton (constructor) {
  var results = singletons.filter(function(singleton) {
    return (constructor === singleton.constructor);
  });

  return (results.length) ? results[0].instance : null;
}

export function register (idOrConstructor, value) {
  if(typeof idOrConstructor === 'string') {
    container[idOrConstructor] = value;
    return;
  }
  var instance = tryToInstantiate(idOrConstructor, 'Not a class');
  if (instance) {
    singletons.push({
      constructor: idOrConstructor,
      instance: instance
    });
  }
}

export function include (idOrConstructor) {
  if(typeof idOrConstructor === 'string') {
    return container[idOrConstructor];
  }
  return findSingleton(idOrConstructor);
}
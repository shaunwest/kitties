/**
 * Created by shaunwest on 4/30/15.
 */

var container = {};
var singletons = [];

export function tryToInstantiate (func, msg) {
  try {
    // Notes on 'new': If func returns an object, the object
    // will be used as the instance. If func does not return
    // an object, a new object is created based on func.prototype
    return new func();
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
  var instance;

  if(typeof idOrConstructor === 'string') {
    container[idOrConstructor] = value;
    return;
  }

  if(typeof idOrConstructor !== 'function') {
    return;
  }

  //instance = tryToInstantiate(idOrConstructor, '"' + idOrConstructor + '" not a class');
  instance = new idOrConstructor();

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
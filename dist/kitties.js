/**
 * Created by Shaun on 5/1/14.
 * TODO:
 * Cut down size
 * Add promise support to Injector
 */

(function(id) {
  var //gids = {},
    allElements, previousOwner;

  var Util = {
    isDefined: function(value) { return typeof value != 'undefined' },
    //isBoolean: function(value) { return typeof value == 'boolean' },
    def: function(value, defaultValue) { return (typeof value == 'undefined') ? defaultValue : value },
    error: function(message) { throw new Error(id + ': ' + message) },
    warn: function(message) { Util.log('Warning: ' + message) },
    log: function(message) { if(core.log) { console.log(id + ': ' + message) } },
    argsToArray: function(args) { return Array.prototype.slice.call(args) },
    //getGID: function(prefix) {
    //  prefix = Util.def(prefix, '');
    //  gids[prefix] = Util.def(gids[prefix], 0);
    //  return prefix + (++gids[prefix]);
    //},
    rand: function(max, min) { // move to extra?
      min = min || 0;
      if(min > max) { Util.error('rand: invalid range.'); }
      return Math.floor((Math.random() * (max - min + 1))) + (min);
    }
  };

  var types = ['Array', 'Object', 'Boolean', 'Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp']; //, 'HTMLImageElement'];
  for(var i = 0; i < types.length; i++) {
    Util['is' + types[i]] = (function(type) { 
      return function(obj) {
        return Object.prototype.toString.call(obj) == '[object ' + type + ']';
      }; 
    })(types[i]);
  }

  function getInterceptor(interceptors, matchString) {
    var matches;
    for(var i = 0; i < interceptors.length; i++) {
      var interceptor = interceptors[i];
      if(matches = matchString.match(interceptor.pattern)) {
        return {key: matches[1], cb: interceptor.cb};
      }
    }
    return {key: matchString};
  }

  function intercept(module, interceptorFunc) {
    if(interceptorFunc) {
      return interceptorFunc(module);
    }
    return module;
  }

  var Injector = {
    unresolved: {},
    modules: {
      'Util': Util,
      'element': getElement,
      'httpGet': httpGet
    },
    interceptors: [],
    register: function(key, deps, func, scope) {
      this.unresolve(key);
      this.unresolved[key] = {deps: deps, func: func, scope: scope};
      return this;
    },
    unresolve: function(key) {
      if(this.modules[key]) {
        delete this.modules[key];
      }
      return this;
    },
    // possible removal candidate (just use Injector.modules['myModule'] = ...)
    /*setModule: function(key, module) { // save a module without doing dependency resolution
      this.modules[key] = module;
      return this;
    },*/
    getDependency: function(key, cb) {
      var interceptor = getInterceptor(this.interceptors, key);
      key = interceptor.key;
      var modules = this.modules;
      var module = modules[key];

      if(module) {
        cb(intercept(module, interceptor.cb));
        return;
      }

      if(key.indexOf('/') > -1) {
        modules.httpGet(key, cb);
        return;
      }

      module = this.unresolved[key];
      if(!module) {
        getElement(key, 0, function(element) {
          (element) ?
            cb(element = intercept(element, interceptor.cb)) :
            Util.warn('\'' + key + '\' not found');
        });
        return;
      }

      Util.log('Resolving for \'' + key + '\'');
      this.resolveAndApply(module.deps, module.func, module.scope, function(module) {
        //if(Util.isObject(module)) { // doesn't work on mixins
        //  module.getType = function() { return key; };
        //}
        cb(modules[key] = intercept(module, interceptor.cb));
      });

      return;
    },
    resolve: function(deps, cb, index, results) {
      var that = this; // FIXME

      //index = Util.def(index, 0);

      var depName = deps[index];
      if(!depName) {
        cb(results);
        return;
      }
      
      this.getDependency(depName, function(dep) {
        if(dep) {
          results.push(dep);
        } else {
          Util.error('Can\'t resolve ' + depName);
        }

        that.resolve(deps, cb, index + 1, results);    
      });
    },
    apply: function(args, func, scope) {
      return func.apply(scope || core, args);
    },
    resolveAndApply: function(deps, func, scope, cb) {
      var that = this;
      this.resolve(deps, function(args) {
        var result = that.apply(args, func, scope);
        if(cb && Util.isFunction(cb)) {
          cb(result);
        }
      }, 0, []);
    },
    addInterceptor: function(pattern, cb) {
      this.interceptors.push({pattern: pattern, cb: cb});
    },
    // MOVE TO EXTRA?
    /*process: function(deps, cb) {
      var i, numDeps, obj;
      if(Util.isArray(deps)) {
        for(i = 0, numDeps = deps.length; i < numDeps; i++) {
          obj = deps[i]; 
          if(Util.isString(obj)) {
            this.getDependency(obj, function(obj) {
              cb(obj);
            });
          } else {
            cb(obj);
          }
        }
      } else {
        if(Util.isString(deps)) {
          this.getDependency(deps, function(deps) {
            cb(deps);
          });
        } else {
          cb(deps);
        }
      }
    }*/
  };

  /** run onReady when document readyState is 'complete' */
  // remove, require kilo to be included at bottom of document
  /*function onDocumentReady(onReady) {
    var readyStateCheckInterval;
    if(!onReady) return;
    if(document.readyState === 'complete') {
      onReady(document);
    } else {
      readyStateCheckInterval = setInterval(function () {
        if(document.readyState === 'complete') {
          onReady(document);
          clearInterval(readyStateCheckInterval);
        }
      }, 10);
    }
  }*/

  // move to Extra
  /*function registerDefinitionObject(result) {
    var key;
    if(Util.isObject(result)) {
      for(key in result) {
        if(result.hasOwnProperty(key)) {
          Injector.register(key, [], (
            function(func) {
              return function() { return func; };
            }
          )(result[key]));
        }
      }
    }
  }*/

  function findElements() {
    var container = document.getElementsByTagName('html');
    if(!container[0]) return;
    return container[0].querySelectorAll('*');
  }

  // TODO: performance
  function getElement(elementId, container, cb) {
    //onDocumentReady(function(document) {
      var results = [];
      var elements = (!container) ? findElements() : container.querySelectorAll('*');

      var bracketIndex = elementId.indexOf('[]');
      if(bracketIndex != -1) {
        elementId = elementId.substring(0, bracketIndex);
      }
      for(var i = 0, numElements = elements.length; i < numElements; i++) {
        var element = elements[i];
        if(element.hasAttribute('data-' + elementId)) {
          results.push(element);
        }
      }
      (bracketIndex === -1) ? cb(results[0]) : cb(results);
    //}); 
  }

  function parseResponse(contentType, responseText) {
    var appJson = 'application/json';
    switch(contentType) {
      case appJson:
      case appJson + '; charset=utf-8':
        return JSON.parse(responseText);
      default:
        return responseText;
    }
  }

  function httpGet(url, onComplete, contentType) {
    var req = new XMLHttpRequest();

    // REMOVE progress
    /*if(onProgress) {
      req.addEventListener('progress', function(event) {
        onProgress(event.loaded, event.total);
      }, false);
    }*/

    req.onerror = function(event) {
      Util.error('Network error.');
    };

    req.onload = function() {
      // ALWAYS check content type?
      var contentType = contentType || this.getResponseHeader('content-type');
      (this.status >= 400) ? onComplete(this.statusText, this.status) :
          onComplete(parseResponse(contentType, this.responseText), this.status);
    };

    req.open('get', url, true);
    req.send();
  }

  function register(key, depsOrFunc, funcOrScope, scope) {
    // register a new module (with dependencies)
    if(Util.isArray(depsOrFunc) && Util.isFunction(funcOrScope)) {
      Injector.register(key, depsOrFunc, funcOrScope, scope);
    } 
     // register a new module (without dependencies)
    else if(Util.isFunction(depsOrFunc)) {
      Injector.register(key, [], depsOrFunc, funcOrScope);
    }
  }

  var core = {
    use: function(depsOrFunc, funcOrScope, scope, cb) {
      var module;
      // no dependencies
      if(Util.isFunction(depsOrFunc)) {
        var result = Injector.apply([], depsOrFunc, funcOrScope);
        if(cb) {
          cb(result);
        }
      } 
      // one dependency
      if(Util.isString(depsOrFunc)) {
        depsOrFunc = [depsOrFunc]; 
      }
      // multiple dependencies
      if (Util.isArray(depsOrFunc)) {
        if(!funcOrScope) {
          Injector.resolveAndApply(depsOrFunc, function(_module) {
            module = _module;
          });
        } else {
          Injector.resolveAndApply(depsOrFunc, funcOrScope, scope, cb);
        }
      } 
      return module;
    },

    register: function(key, depsOrFunc, funcOrScope, scope) {
      if(Util.isFunction(depsOrFunc) || Util.isFunction(funcOrScope)) {
        return register(key, depsOrFunc, funcOrScope, scope);
      }
      /*return {
        depends: function() {
          depsOrFunc = Util.argsToArray(arguments);
          return this;
        },
        factory: function(func, scope) {
          register(key, depsOrFunc, func, scope)
        }
      };*/
    },

    unresolve: function(key) {
      Injector.unresolve(key);
    },

    noConflict: function() {
      window[id] = previousOwner;
      return core;
    }
  }

  /*core.use.defer = function(depsOrFunc, funcOrScope, scope) {
    return function(cb) {
      core.use(depsOrFunc, funcOrScope, scope, cb);
    };
  };*/

  // TODO: try to get rid of this
  /*core.use.run = function(dep, scope) {
    var cb, done, result;
    return function() {
      var args = arguments;

      core.use(dep, function(dep) {
        if(Util.isFunction(dep)) {
          result = dep.apply(null, args);
          if(cb) {
            cb(result);
          }
          done = true;
          return result;
        }
      }, scope);

      return { 
        on: function(_cb) {
          if(done) {
            _cb(result);
          } else {
            cb = _cb;
          }      
        }
      };
    };
  };*/

 
  //core.onDocumentReady = onDocumentReady;
  core.log = true;

  /** add these basic modules to the injector */
  Injector.modules['Injector'] = Injector;
    //.setModule('Util', Util)
    //.setModule('Injector', Injector);
    //.setModule('element', getElement)
    //.setModule('registerAll', registerDefinitionObject)
    //.setModule('httpGet', httpGet);

  /** create references to core */
  if(typeof window != 'undefined') {
    //if(window[id]) {
      //Util.warn('a preexisting value at namespace \'' + id + '\' has been overwritten.');
      previousOwner = window[id];
    //}
    window[id] = core;
    if(!window.register) window.register = core.register;
    if(!window.use) window.use = core.use;
  }

  if(typeof exports != 'undefined') {
    exports[id] = core; 
    exports['register'] = core.register;
    exports['use'] = core.use;   
  }

  return core;
})('kilo');
var kilo, use, register, CommonJS = false;
if(typeof exports === 'object' && typeof require === 'function') {
  kilo = require('kilo');
  if(kilo) {
    use = kilo.use;
    register = kilo.register;
    CommonJS = true;
  }
}

/**
 * Created by Shaun on 10/18/14.
 */

/* UP FOR REMOVAL!
register('Canvas', [], function() {
  'use strict';

  return {
    clearContext: function(context, width, height) {
      context.clearRect(0, 0, width, height);
    },
    drawBackground: function(context, width, height, x, y, color) {
      context.fillStyle = color || 'red';
      context.fillRect(x || 0, y || 0, width, height);
    },
    drawBorder: function(context, width, height, x, y, color) {
      context.beginPath();
      context.strokeStyle = color || 'black';
      context.rect(x || 0, y || 0, width, height);
      context.stroke();
      context.closePath();
    }
  };
});*/
/**
 * Created by Shaun on 8/3/14.
 */

// UP FOR REMOVAL
/*register('Factory', ['Obj', 'Pool'], function(Obj, Pool) {
  'use strict';

  return function(TypeObject) {
    //var newObject = Pool.getObject();
    //return Obj.mixin([TypeObject, newObject]); // FIXME: mixin still auto-creates an empty object
    var newObject = Obj.mixin([TypeObject]);
    return newObject;
  };
});*/
/**
 * Created by Shaun on 7/6/14.
 */

register('Func', [], function() {
  'use strict';

  function partial(f) {
    var boundArgs = Array.prototype.slice.call(arguments, 1);
    return function() {
      var defaultArgs = boundArgs.slice();
      for(var i = 0; i < arguments.length; i++) {
        defaultArgs.push(arguments[i]);
      }
      return f.apply(this, defaultArgs);
    };
  }

  function wrap(f, wrapper) {
    return partial(wrapper, f);
  }

  function fastPartial(f) {
    return function() {
      var boundArgs =  Array.prototype.slice.call(arguments);
      var lastIndex = boundArgs.length;
      return function(val) {
        boundArgs[lastIndex] = val;
        return f.apply(this, boundArgs);
      };
    };
  }

  return {
    partial: partial,
    fastPartial: fastPartial,
    wrap: wrap
  };
});
/**
 * Created by Shaun on 6/4/14.
 */

register('HashArray', function() {
  'use strict';

  function HashArray() {
    this.values = [];
    this.keyMap = {};
  }

  function realignDown(keyMap, removedIndex) {
    var key;
    for(key in keyMap) {
      if(keyMap.hasOwnProperty(key) && keyMap[key] > removedIndex) {
        keyMap[key]--;
      }
    }
  }

  function realignUp(keyMap, splicedIndex) {
    var key;
    for(key in keyMap) {
      if(keyMap.hasOwnProperty(key) && keyMap[key] >= splicedIndex) {
        keyMap[key]++;
      }
    }
  }

  HashArray.prototype.set = function(key, value) {
    if(this.keyMap[key]) {
      this.values[this.keyMap[key]] = value;
      return true;
    } else {
      this.values.push(value);
      this.keyMap[key] = this.values.length - 1;
      return false;
    }
  };

  HashArray.prototype.splice = function(targetId, key, value) {
    var index = this.keyMap[targetId] + 1;
    this.values.splice(index, 0, value);
    realignUp(this.keyMap, index);
    this.keyMap[key] = index;
  };

  HashArray.prototype.get = function(key) {
    return this.values[this.keyMap[key]];
  };

  HashArray.prototype.remove = function(key) {
    var index = this.keyMap[key];
    this.values.splice(index, 1);
    realignDown(this.keyMap, index);
    delete this.keyMap[key];
  };

  HashArray.prototype.removeAll = function() {
    var keyMap = this.keyMap, key;
    this.values.length = 0;
    for(key in keyMap) {
      delete keyMap[key];
    }
  };

  HashArray.prototype.getIdByIndex = function(index) {
    var keyMap = this.keyMap, key;
    for(key in keyMap) {
      if(keyMap[key] === index) {
        return key;
      }
    }
    return '';
  };

  HashArray.prototype.getKeys = function() {
    var i, numItems = this.size(), result = [];
    for(i = 0; i < numItems; i++) {
      result.push(this.getIdByIndex(i));
    }
    return result;
  };

  HashArray.prototype.getValues = function() {
    return this.values;
  };

  HashArray.prototype.size = function() {
    return this.values.length;
  };

  return HashArray;
});
/**
 * Created by Shaun on 5/3/14.
 */

if(CommonJS) {
  kilo.register('Http', ['Util'], function(Util) {
    function parseResponse(contentType, responseText) {
      switch(contentType) {
        case 'application/json':
        case 'application/json; charset=utf-8':
          return JSON.parse(responseText);
        default:
          return responseText;
      }
    }

    function get(url, contentTypeOrOnProgress, onProgress) {
      var promise = new Promise(function(resolve, reject) {
        var req = http.request(url, function(res) {
          var data = '';

          if(Util.isFunction(contentTypeOrOnProgress)) {
            onProgress = contentTypeOrOnProgress;
            contentTypeOrOnProgress = null;
          }

          res.setEncoding('utf8');

          res.on('data', function (chunk) {
            data += chunk;
            if(onProgress) {
              onProgress(chunk.length, data.length);
            }
          });

          res.on('end', function() {
            var contentType = res.headers['content-type'];
            switch(res.statusCode) {
              case 500:
                reject({statusText: '', status: res.statusCode});
                break;
              case 404:
                reject({statusText: '', status: res.statusCode});
                break;
              case 304:
                resolve({data: parseResponse(contentType, data), status: res.statusCode});
                break;
              default:
                resolve({data: parseResponse(contentType, data), status: res.statusCode});
            }
          });
        });

        req.on('error', function(e) {
          console.log('problem with request: ' + e.message);
          console.log('URL: ' + url);
          reject('Network error.');
        });

        req.end();
      });

      return promise;
    }

    return {
      get: get
    };
  });
} else {
  register('Http', ['Util'], function(Util) {
    'use strict';

    function parseResponse(contentType, responseText) {
      switch(contentType) {
        case 'application/json':
        case 'application/json; charset=utf-8':
          return JSON.parse(responseText);
        default:
          return responseText;
      }
    }

    function get(url, contentTypeOrOnProgress, onProgress) {
      return new Promise(function(resolve, reject) {
        var req = new XMLHttpRequest();

        if(Util.isFunction(contentTypeOrOnProgress)) {
          onProgress = contentTypeOrOnProgress;
          contentTypeOrOnProgress = null;
        }

        if(onProgress) {
          req.addEventListener('progress', function(event) {
            onProgress(event.loaded, event.total);
          }, false);
        }

        req.onerror = function(event) {
          reject(Util.error('Network error.'));
        };

        req.onload = function() {
          var contentType = contentTypeOrOnProgress || this.getResponseHeader('content-type');

          switch(this.status) {
            case 500:
              reject({statusText: this.statusText, status: this.status});
              break;
            case 404:
              reject({statusText: this.statusText, status: this.status});
              break;
            case 304:
              resolve({data: parseResponse(contentType, this.responseText), status: this.status});
              break;
            default:
              resolve({data: parseResponse(contentType, this.responseText), status: this.status});
          }
        };

        req.open('get', url, true);
        req.send();
      });
    }

    return {
      get: get
    };
  });
}


/**
 * Created by Shaun on 7/3/14.
 *
 * This is a decorator for HashArray. It adds automatic id management.
 */

register('KeyStore', ['HashArray', 'Util'], function(HashArray, Util) {
  'use strict';

  function KeyStore() {
    this.lastId = 0;
    this.store = new HashArray();
  }

  KeyStore.prototype.get = function(id) {
    return this.store.get(id);
  };

  KeyStore.prototype.set = function(valOrId, val) {
    var id;
    if(Util.isDefined(val)) {
      id = valOrId || this.lastId++;
    } else {
      id = this.lastId++;
      val = valOrId;
    }
    this.store.add(id, val);
    return id;
  };

  KeyStore.prototype.setGroup = function(valOrId, val) {
    var id, values;
    if(Util.isDefined(val)) {
      id = valOrId;
      if(Util.isDefined(id)) {
        values = this.get(id);
      } else {
        id = this.lastId++;
        values = [];
        this.store.add(id, values);
      }
    } else {
      id = this.lastId++;
      val = valOrId;
      values = [];
      this.store.add(id, values);
    }

    if(values) {
      values.push(val);
    } else {
      console.error('Jack2d: keyStore: id \''+ id + '\' not found.');
    }

    return id;
  };

  KeyStore.prototype.clear = function(id) {
    if(Util.isDefined(id)) {
      this.store.remove(id);
    } else {
      this.store.removeAll();
    }
  };

  KeyStore.prototype.getItems = function() {
    return this.store.items;
  };

  return KeyStore;
});
/**
 * Created by Shaun on 11/2/2014.
 */

register('Merge', ['Obj'], function(Obj) {
  'use strict';

  return Obj.merge.bind(Obj);
});

/**
 * Created by Shaun on 6/28/14.
 */

register('Obj', ['Injector', 'Util', 'Func', 'Pool'], function(Injector, Util, Func, Pool) {
  'use strict';

  function mergeObject(source, destination, allowWrap, exceptionOnCollisions) {
    source = source || Pool.getObject();
    destination = destination || Pool.getObject();

    Object.keys(source).forEach(function(prop) {
      assignProperty(source, destination, prop, allowWrap, exceptionOnCollisions);
    });

    return destination;
  }

  function assignProperty(source, destination, prop, allowWrap, exceptionOnCollisions) {
    if(destination.hasOwnProperty(prop)) {
      if(allowWrap) {
        destination[prop] = Func.wrap(destination[prop], source[prop]);
        Util.log('Merge: wrapped \'' + prop + '\'');
      } else if(exceptionOnCollisions) {
        Util.error('Failed to merge mixin. Method \'' +
          prop + '\' caused a name collision.');
      } else {
        destination[prop] = source[prop];
        Util.log('Merge: overwrote \'' + prop + '\'');
      }
    } else {
      destination[prop] = source[prop];
    }

    return destination;
  }

  function augmentMethods(targetObject, augmenter) {
    var newObject = {}; // FIXME: use pooling?

    Object.keys(targetObject).forEach(function(prop) {
      if(!Util.isFunction(targetObject[prop])) {
        return;
      }
      newObject[prop] = augmentMethod(targetObject[prop], targetObject, augmenter);
    });

    return newObject;
  }

  function augmentMethod(method, context, augmenter) {
    return function() {
      var args = Util.argsToArray(arguments);
      if(augmenter) {
        args.unshift(method);
        return augmenter.apply(context, args);
      } else {
        return method.apply(context, args);
      }
    };
  }

  function replaceMethod(context, oldMethod, newMethod, message) {
    Object.keys(context).forEach(function(prop) {
      if(context[prop] === oldMethod) {
        context[prop] = newMethod;
      }
    });
  }

  function augment(obj, augmenter) {
    return augmentMethods(obj, augmenter);
  }

  function quickClone(obj) {
    return quickMerge(obj);
  }

  function quickMerge(source, destination) {
    var prop;
    destination = destination || Pool.getObject();
    for(prop in source) {
      if(source.hasOwnProperty(prop)) {
        destination[prop] = source[prop];
      }
    }
    return destination;
  }

  function print(obj) {
    var prop, str = '';
    if(Util.isObject(obj)) {
      for(prop in obj) {
        if(obj.hasOwnProperty(prop) && !Util.isFunction(obj[prop])) {
          str += prop + ': ' + obj[prop] + '<br>';
        }
      }
    }
    return str;
  }

  function clear(obj) {
    var prop;
    for(prop in obj) {
      if(obj.hasOwnProperty(prop)) {
        delete obj[prop];
      }
    }
    return obj;
  }

  function clone(obj) {
    return merge(obj);
  }

  function merge(source, destination, exceptionOnCollisions) {
    Injector.process(source, function(sourceObj) {
      destination = mergeObject(sourceObj, destination, false, exceptionOnCollisions);
    });

    return destination;
  }

  function wrap(source, destination) {
    Injector.process(source, function(sourceObj) {
      destination = mergeObject(sourceObj, destination, true);
    });

    return destination;
  }

  return {
    print: print,
    clear: clear,
    clone: clone,
    quickClone: quickClone,
    merge: merge,
    quickMerge: quickMerge,
    wrap: wrap,
    augment: augment,
    replaceMethod: replaceMethod
  };
});
/**
 * Created by Shaun on 7/4/14.
 */

register('Pool', [], function() {
  'use strict';

  var objects = [];

  function getObject() {
    var newObject = objects.pop();
    if(!newObject) {
      newObject = {};
    }
    return newObject;
  }

  // FIXME: replace with Obj.clear()
  function clearObject(obj) {
    var prop;
    for(prop in obj) {
      if(obj.hasOwnProperty(prop)) {
        delete obj[prop];
      }
    }
    return obj;
  }

  function killObject(unusedObject) {
    objects.push(clearObject(unusedObject));
  }

  function available() {
    return objects.length;
  }

  return {
    getObject: getObject,
    killObject: killObject,
    available: available
  };
});
/**
 * Created by Shaun on 7/16/14.
 */

register('rect', [], function() {
  'use strict';

  function containsPoint(x, y, rect) {
    return !(x < rect.left || x > rect.right ||
      y < rect.top || y > rect.bottom);
  }

  function containsRect(inner, outer) {
    return !(inner.left < outer.left ||
      inner.right > outer.right ||
      inner.top < outer.top ||
      inner.bottom > outer.bottom);
  }

  // WTF?
  function containsRectX(inner, outer) {
    var contains = !(inner.left < outer.left || inner.right > outer.right);
    return (contains) ? false : inner.left - outer.left;
  }

  function containsX(x, outer) {
    return !(x < outer.left || x > outer.right);
  }

  // WTF?
  function containsRectY(inner, outer) {
    var contains = !(inner.top < outer.top || inner.bottom > outer.bottom);
    return (contains) ? false : inner.top - outer.top;
  }

  function containsY(y, outer) {
    return !(y < outer.top || y > outer.bottom);
  }

  function intersectsRectX(r1, r2) {
    var intersects = !(r2.left >= r1.right || r2.right <= r1.left);
    return (intersects) ? r1.left - r2.left : false;
  }

  function intersectsRectY(r1, r2) {
    var intersects = !(r2.top >= r1.bottom || r2.bottom <= r1.top);
    return (intersects) ? r1.top - r2.top : false;
  }

  return {
    setLeft: function(left) {
      this.left = left;
      return this;
    },
    setTop: function(top) {
      this.top = top;
      return this;
    },
    setRight: function(right) {
      this.right = right;
      return this;
    },
    setBottom: function(bottom) {
      this.bottom = bottom;
      return this;
    },
    containsPoint: containsPoint,
    containsRect: containsRect,
    containsX: containsX,
    containsY: containsY,
    containsRectX: containsRectX,
    containsRectY: containsRectY,
    intersectsRectX: intersectsRectX,
    intersectsRectY: intersectsRectY
  };
});
/**
 * Created by Shaun on 1/10/15.
 */

register('Str', [], function() {
  'use strict';

  function sprintf() {
    var str, replacements;

    str = arguments[0],
    replacements = Array.prototype.slice.call(arguments, 1);

    replacements.forEach(function(replacement) {
      str = str.replace('%%', replacement);
    });

    return str;
  }

  return {
    sprintf: sprintf
  };
});
/**
 * Created by Shaun on 11/2/2014.
 */

register('Wrap', ['Obj'], function(Obj) {
  'use strict';

  return Obj.wrap.bind(Obj);
});
use(['Injector', 'Util'], function(Injector, Util) {
  Injector.process = function(deps, cb) {
    var i, numDeps, obj;
    if(Util.isArray(deps)) {
      for(i = 0, numDeps = deps.length; i < numDeps; i++) {
        obj = deps[i]; 
        if(Util.isString(obj)) {
          this.getDependency(obj, function(obj) {
            cb(obj);
          });
        } else {
          cb(obj);
        }
      }
    } else {
      if(Util.isString(deps)) {
        this.getDependency(deps, function(deps) {
          cb(deps);
        });
      } else {
        cb(deps);
      }
    }
  }
});

// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.io/#x15.4.4.18
if (!Array.prototype.forEach) {

  Array.prototype.forEach = function(callback, thisArg) {

    var T, k;

    if (this == null) {
      throw new TypeError(' this is null or not defined');
    }

    // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If IsCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if (typeof callback !== "function") {
      throw new TypeError(callback + ' is not a function');
    }

    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    if (arguments.length > 1) {
      T = thisArg;
    }

    // 6. Let k be 0
    k = 0;

    // 7. Repeat, while k < len
    while (k < len) {

      var kValue;

      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {

        // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
        kValue = O[k];

        // ii. Call the Call internal method of callback with T as the this value and
        // argument list containing kValue, k, and O.
        callback.call(T, kValue, k, O);
      }
      // d. Increase k by 1.
      k++;
    }
    // 8. return undefined
  };
}
// Production steps of ECMA-262, Edition 5, 15.4.4.19
// Reference: http://es5.github.io/#x15.4.4.19
if (!Array.prototype.map) {

  Array.prototype.map = function(callback, thisArg) {

    var T, A, k;

    if (this == null) {
      throw new TypeError(' this is null or not defined');
    }

    // 1. Let O be the result of calling ToObject passing the |this| 
    //    value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get internal 
    //    method of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If IsCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if (typeof callback !== 'function') {
      throw new TypeError(callback + ' is not a function');
    }

    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    if (arguments.length > 1) {
      T = thisArg;
    }

    // 6. Let A be a new array created as if by the expression new Array(len) 
    //    where Array is the standard built-in constructor with that name and 
    //    len is the value of len.
    A = new Array(len);

    // 7. Let k be 0
    k = 0;

    // 8. Repeat, while k < len
    while (k < len) {

      var kValue, mappedValue;

      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty internal 
      //    method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {

        // i. Let kValue be the result of calling the Get internal 
        //    method of O with argument Pk.
        kValue = O[k];

        // ii. Let mappedValue be the result of calling the Call internal 
        //     method of callback with T as the this value and argument 
        //     list containing kValue, k, and O.
        mappedValue = callback.call(T, kValue, k, O);

        // iii. Call the DefineOwnProperty internal method of A with arguments
        // Pk, Property Descriptor
        // { Value: mappedValue,
        //   Writable: true,
        //   Enumerable: true,
        //   Configurable: true },
        // and false.

        // In browsers that support Object.defineProperty, use the following:
        // Object.defineProperty(A, k, {
        //   value: mappedValue,
        //   writable: true,
        //   enumerable: true,
        //   configurable: true
        // });

        // For best browser support, use the following:
        A[k] = mappedValue;
      }
      // d. Increase k by 1.
      k++;
    }

    // 9. return A
    return A;
  };
}
(function() {
    var root;

  if (typeof window === 'object' && window) {
    root = window;
  } else {
    root = global;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = root.Promise ? root.Promise : Promise;
  } else if (!root.Promise) {
    root.Promise = Promise;
  }

  // Use polyfill for setImmediate for performance gains
  var asap = root.setImmediate || function(fn) { setTimeout(fn, 1); };

  // Polyfill for Function.prototype.bind
  function bind(fn, thisArg) {
    return function() {
      fn.apply(thisArg, arguments);
    }
  }

  var isArray = Array.isArray || function(value) { return Object.prototype.toString.call(value) === "[object Array]" };

  function Promise(fn) {
    if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new');
    if (typeof fn !== 'function') throw new TypeError('not a function');
    this._state = null;
    this._value = null;
    this._deferreds = []

    doResolve(fn, bind(resolve, this), bind(reject, this))
  }

  function handle(deferred) {
    var me = this;
    if (this._state === null) {
      this._deferreds.push(deferred);
      return
    }
    asap(function() {
      var cb = me._state ? deferred.onFulfilled : deferred.onRejected
      if (cb === null) {
        (me._state ? deferred.resolve : deferred.reject)(me._value);
        return;
      }
      var ret;
      try {
        ret = cb(me._value);
      }
      catch (e) {
        deferred.reject(e);
        return;
      }
      deferred.resolve(ret);
    })
  }

  function resolve(newValue) {
    try { //Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
      if (newValue === this) throw new TypeError('A promise cannot be resolved with itself.');
      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
        var then = newValue.then;
        if (typeof then === 'function') {
          doResolve(bind(then, newValue), bind(resolve, this), bind(reject, this));
          return;
        }
      }
      this._state = true;
      this._value = newValue;
      finale.call(this);
    } catch (e) { reject.call(this, e); }
  }

  function reject(newValue) {
    this._state = false;
    this._value = newValue;
    finale.call(this);
  }

  function finale() {
    for (var i = 0, len = this._deferreds.length; i < len; i++) {
      handle.call(this, this._deferreds[i]);
    }
    this._deferreds = null;
  }

  function Handler(onFulfilled, onRejected, resolve, reject){
    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
    this.resolve = resolve;
    this.reject = reject;
  }

  /**
   * Take a potentially misbehaving resolver function and make sure
   * onFulfilled and onRejected are only called once.
   *
   * Makes no guarantees about asynchrony.
   */
  function doResolve(fn, onFulfilled, onRejected) {
    var done = false;
    try {
      fn(function (value) {
        if (done) return;
        done = true;
        onFulfilled(value);
      }, function (reason) {
        if (done) return;
        done = true;
        onRejected(reason);
      })
    } catch (ex) {
      if (done) return;
      done = true;
      onRejected(ex);
    }
  }

  Promise.prototype['catch'] = function (onRejected) {
    return this.then(null, onRejected);
  };

  Promise.prototype.then = function(onFulfilled, onRejected) {
    var me = this;
    return new Promise(function(resolve, reject) {
      handle.call(me, new Handler(onFulfilled, onRejected, resolve, reject));
    })
  };

  Promise.all = function () {
    var args = Array.prototype.slice.call(arguments.length === 1 && isArray(arguments[0]) ? arguments[0] : arguments);

    return new Promise(function (resolve, reject) {
      if (args.length === 0) return resolve([]);
      var remaining = args.length;
      function res(i, val) {
        try {
          if (val && (typeof val === 'object' || typeof val === 'function')) {
            var then = val.then;
            if (typeof then === 'function') {
              then.call(val, function (val) { res(i, val) }, reject);
              return;
            }
          }
          args[i] = val;
          if (--remaining === 0) {
            resolve(args);
          }
        } catch (ex) {
          reject(ex);
        }
      }
      for (var i = 0; i < args.length; i++) {
        res(i, args[i]);
      }
    });
  };

  Promise.resolve = function (value) {
    if (value && typeof value === 'object' && value.constructor === Promise) {
      return value;
    }

    return new Promise(function (resolve) {
      resolve(value);
    });
  };

  Promise.reject = function (value) {
    return new Promise(function (resolve, reject) {
      reject(value);
    });
  };

  Promise.race = function (values) {
    return new Promise(function (resolve, reject) {
      for(var i = 0, len = values.length; i < len; i++) {
        values[i].then(resolve, reject);
      }
    });
  };
})();
/**
 * Created by Shaun on 2/5/15
 * 
 */

register('BackgroundLayer', ['Common'], function(Common) {
  'use strict';

  return function(width, height) {
    var background;
    var canvas = Common.getCanvas(width, height);
    var context2d = canvas.getContext('2d'); 

    return {
      setBackground: function(image) {
        background = image;
        return this;
      },
      draw: function() {
        context2d.clearRect(0, 0, canvas.width, canvas.height);
        
        if(background) {
          context2d.drawImage(background, 0, 0); 
        }

        return this;
      },
      getLayer: function() {
        return canvas;
      }
    }
  }
});
register('CanvasViewport', [], function() {
  'use strict';

  function addLayer(layer) {

  }

  return {

  };



  //drawLayer(this.element, this.layers[index], this.viewDimensions);
  function drawLayer(canvas, layerData, viewDimensions) {
    var context = canvas.getContext('2d');

    if(layerData.visible) {
      layerData.layer.draw(context, viewDimensions);
    }
  }


  function draw(canvas) {
    var layer, i;
    var layers = this.layers;
    var context = canvas.getContext('2d');
    var dims = this.viewDimensions;
    var delta = this.viewDelta;
    var numLayers = layers.length;

    context.clearRect(0, 0, delta.width, delta.height);

    for(i = 0; i < numLayers; i++) {
      layer = layers[i];
      if(layer.renderMode === 1) {
        drawLayer(canvas, layer, delta);
      } else {
        drawLayer(canvas, layer, dims);
      }
    }

    /*if(this.hasBorder) {
      Canvas.drawBorder(context, dims.width, dims.height);
    }*/

    /*if(this.drawFocusRegion) {
      Canvas.drawBorder(
        context,
        this.focusRegion.right - this.focusRegion.left,
        this.focusRegion.bottom - this.focusRegion.top,
        this.focusRegion.left,
        this.focusRegion.top,
        'red'
      );
    }*/

    return this;
  }
});


register('Common', function() {
  'use strict';

  // Return everything before the last slash of a url
  // e.g. http://foo/bar/baz.json => http://foo/bar
  function getBaseUrl(url) {
    var n = url.lastIndexOf('/');
    return url.substring(0, n); 
  }

  function isFullUrl(url) {
    return (url.substring(0, 7) === 'http://' || 
      url.substring(0, 8) === 'https://');
  }

  function getCanvas(width, height) {
    var canvas = document.createElement('canvas');

    canvas.width = width || 500;
    canvas.height = height || 500;

    return canvas;
  }

  return {
    getBaseUrl: getBaseUrl,
    isFullUrl: isFullUrl,
    getCanvas: getCanvas
  };
});
/**
 * Created by Shaun on 1/25/15
 *
 */

register('ImageLayer', [
  'Util',
  'ImageLoader',
  'Common'
],
function(Util, ImageLoader, Common) {
  'use strict';

  function load(layerId, layerDefinition, baseUrl) {
    var layer = this;
    var backgroundUrl = layerDefinition.backgroundUrl;

    function setBackground(background) {
      layer.background = background;
      return layer;
    }

    function onGetBackgroundError() {
      Util.warn('Error loading background at \'' + backgroundUrl + '\'');
    }

    if(!backgroundUrl) {
      return;
    }

    if(!Common.isFullUrl(backgroundUrl)) {
      backgroundUrl = baseUrl + '/' + backgroundUrl;
    }

    layer.id = layerId;

    return ImageLoader(backgroundUrl)
      .then(setBackground, onGetBackgroundError);  
  }

  return {
    load: load
  };
});
/**
 * Created by Shaun on 5/1/14.
 */

register('ImageLoader', function() {
  'use strict';

  var IMAGE_WAIT_INTERVAL = 100;

  function loadPath(path) {
    var image, promise;

    image = new Image();
    image.src = path;

    promise = waitForImage(image);

    return promise;
  }

  function waitForImage(image) {
    return new Promise(function(resolve, reject) {
      var intervalId = setInterval(function() {
        if(image.complete) {
          clearInterval(intervalId);
          resolve(image);
        }
      }, IMAGE_WAIT_INTERVAL);

      image.onerror = function() {
        clearInterval(intervalId);
        reject();
      };
    });
  }

  return loadPath;
});
/**
 * Create by Shaun on 1/25/15
 *
 */

register('Scene', 
  ['Util',
   'Http',
   'Common',
   'Obj',
   'Func',
   'ImageLayer'],
function(Util, Http, Common, Obj, Func, ImageLayer) {
  'use strict';

  function createLayer(layerDefinitions, baseUrl, layerId) {
    var simpleLayer = Obj.clone(ImageLayer);
    return simpleLayer.load(layerId, layerDefinitions[layerId], baseUrl);
  }

  function getScene(response) {
    return response.data;
  }

  function getLayers(baseUrl, scene) {
    var layerDefinitions = scene.layerDefinitions;

    var layerPromises = Object.keys(layerDefinitions)
      .map(Func.partial(createLayer, layerDefinitions, baseUrl));

    return Promise.all(layerPromises)
      .then(function onGetLayers(layers) {
        scene.layers = layers.reduce(function(layers, layer) {
          layers[layer.id] = layer;
          return layers;
        }, {});

        return scene;
      });
  }

  function onGetSceneError(response) {
    Util.warn('Error loading scene at \'' + sceneUrl + '\'');
  }

  function load(sceneUrl) {
    var currentScene = this;
    var baseUrl = Common.getBaseUrl(sceneUrl);

    return Http.get(sceneUrl)
      .then(getScene, onGetSceneError)
      .then(Func.partial(getLayers, baseUrl))
      .then(function(scene) {
        var scene = Obj.merge(scene, currentScene);

        scene.url = sceneUrl;
        scene.baseUrl = baseUrl;

        return scene;
      });
  }

  return {
    sceneWidth: 500,
    sceneHeight: 500,
    sceneDepth: 500,
    load: load
  };
});
/**
 * Created by Shaun on 2/1/15
 * Based on the jack2d Chrono object
 * 
 */

register('Scheduler', ['Util', 'Obj'], function(Util, Obj) {
  'use strict';

  var instance;
  var ONE_SECOND = 1000;

  function Scheduler(cb, rate) {
    if(!instance) {
      instance = create();      
    }
    if(cb) {
      instance.schedule(cb, rate);
    }
    return instance;
  }

  Scheduler.instance = create;

  function create() {
    return Obj.clone({
      scheduled: [],
      schedule: schedule,
      unschedule: unschedule,
      start: start,
      stop: stop,
      frame: frame,
      id: id
    }).start();
  };

  function schedule(cb, rate) {
    function setRate(newRate) {
      rate = newRate; 
    } 

    function makeFrame() {
      var count = 1,
        totalDeltaTime = 0;

      return function(deltaTime) {
        totalDeltaTime += deltaTime;
        if(count !== rate) {
          count++;
          return;
        }
        cb(totalDeltaTime, setRate);
        count = 1;
        totalDeltaTime = 0;
      };
    }

    if(!Util.isFunction(cb)) {
      Util.error('Scheduler: only functions can be scheduled.');
    }
    rate = rate || 1;

    this.scheduled.push(makeFrame());

    return this;
  }

  function id() {
    return this.scheduled.length;
  }

  function unschedule(id) {
    this.scheduled.splice(id - 1, 1);
    return this;
  }

  function start() {
    if(this.running) {
      return this;
    }

    Obj.merge({
      actualFps: 0,
      ticks: 0,
      elapsedSeconds: 0,
      running: true,
      lastUpdateTime: new Date(),
      oneSecondTimerId: window.setInterval(onOneSecond.bind(this), ONE_SECOND)
    }, this);

    return this.frame();
  }

  function stop() {
    this.running = false;
    window.clearInterval(this.oneSecondTimerId);
    window.cancelAnimationFrame(this.animationFrameId);

    return this;
  }

  function clear() {
    this.scheduled.length = 0;
    return this;
  }

  function frame() {
    executeFrameCallbacks.bind(this)(getDeltaTime.bind(this)());
    this.ticks++;

    if(this.running) {
      this.animationFrameId = window.requestAnimationFrame(frame.bind(this)); 
    }

    return this;
  }

  function onOneSecond() {
    this.actualFps = this.ticks;
    this.ticks = 0;
    this.elapsedSeconds++;
  }

  function executeFrameCallbacks(deltaTime) {
    var scheduled = this.scheduled;

    for(var i = 0, numScheduled = scheduled.length; i < numScheduled; i++) {
      scheduled[i](deltaTime);
    }
  }

  function getDeltaTime() {
    var now = +new Date();
    var deltaTime = (now - this.lastUpdateTime) / ONE_SECOND;

    this.lastUpdateTime = now;

    return deltaTime;
  }

  return Scheduler;
});


register('Schedule', [], function() {
  'use strict';

  function Schedule(cb) {
    var actualFps = 0,
      ticks = 0,
      elapsedSeconds = 0,
      running = true;
    var lastUpdateTime = new Date();
    var oneSecondTimerId = window.setInterval(onOneSecond.bind(this), ONE_SECOND);

    function makeFrame() {
      var count = 1;
      var deltaTime = 0;
      return function(_deltaTime) {
        deltaTime += _deltaTime;
        if(count !== rate) {
          count++;
          return;
        }
        cb(deltaTime);
        count = 1;
        deltaTime = 0;
      };
    }

    if(!Util.isFunction(cb)) {
      Util.error('Scheduler: only functions can be scheduled.');
    }
    rate = rate || 1;

    this.scheduled.push(makeFrame());

    return this.scheduled.length;

  }

  return Schedule;    
});
register('SpriteAnimation', ['Scheduler', 'Obj'], function(Scheduler, Obj) {
  'use strict';

  function SpriteAnimation(sprite) {
    var currentFrameSet = null,
      currentFrameIndex = 0,
      currentFrame = null,
      frameCallback = null;

    var schedulerId = Scheduler(function(deltaTime, setRate) {
      if(!currentFrameSet) {
        return;
      }

      if(!currentFrame) {
        setRate(currentFrameSet.rate);
      }
      
      currentFrame = currentFrameSet.frames[currentFrameIndex]
      if(frameCallback) {
        frameCallback(currentFrame);
      }

      if(++currentFrameIndex >= currentFrameSet.frames.length) {
        currentFrameIndex = 0;        
      }
    })
      .id();

    return {
      play: function(frameSetId) {
        currentFrameSet = sprite.frameSet[frameSetId];
        currentFrameIndex = 0;
        currentFrame = null;
        return this;
      },
      onFrame: function(cb) {
        frameCallback = cb;
        return this;
      },
      stop: function() {
        currentFrameSet = null;
        return this;
      },
      kill: function() {
        scheduler.unschedule(schedulerId);
        return this;
      },
      currentFrameIndex: function() {
        return currentFrameIndex;
      },
      currentFrame: function() {
        return currentFrame;
      }
    };
  }

  return SpriteAnimation;

  /*function play(frameSetId) {
    this.currentFrameSet = this.sprite.frameSet[frameSetId];
    this.currentFrame = 0;

    if(this.schedulerId) {
      return;
    }

    this.schedulerId = scheduler.schedule(frame.bind(this));
  }

  function frame(deltaTime) {
    if(this.currentFrame >= this.currentFrameSet.length) {
      this.currentFrame = 0;
    }


  }

  function kill() {

  }

  return {
    sprite: null,
    currentFrame: 0,
    schedulerId: 0,
    frameCallback: null,
    target: target,
    play: play
  };*/
});
/**
 * Created by Shaun on 2/5/15
 * 
 */

register('SpriteLayer', ['Common'], function(Common) {
  'use strict';

  function SpriteLayer(width, height) {
    var sprites = [];
    var canvas = Common.getCanvas(width, height);
    var context2d = canvas.getContext('2d'); 

    return {
      addSprite: function(spriteAnimation) {
        sprites.push(spriteAnimation);
        return this;
      },
      draw: function() {
        var spriteAnimation, currentFrame;

        context2d.clearRect(0, 0, canvas.width, canvas.height);

        for(var i = 0, numSprites = sprites.length; i < numSprites; i++) {
          spriteAnimation = sprites[i];
          currentFrame = spriteAnimation.currentFrame();
          if(currentFrame) {
            context2d.drawImage(currentFrame, 0, 0); 
          }
        }

        return this;
      },
      getLayer: function() {
        return canvas;
      }
    }
  }

  return SpriteLayer;
});
/**
 * Created by Shaun on 5/31/14.
 *
 */

register('Sprite', [
  'Util',
  'Http',
  'Merge',
  'ImageLoader',
  'Common'
],
function(Util, Http, Merge, ImageLoader, Common) {
  'use strict';

  var DEFAULT_RATE = 5;

  // Main function. Gets sprite data and calls support functions to build frames.
  function load(spriteUrl) {
    var sprite = this;

    // Re-work to better use Promises, like scene.js
    function onGetSprite(response) {
      Merge(response.data, sprite);

      return getSpriteSheet(sprite.spriteSheetUrl, sprite.baseUrl)
        .then(function(spriteSheet) {
          return Object
            .keys(sprite.frameSetDefinitions)
            .reduce(compileFramesets.bind(undefined, spriteSheet, sprite), {});
        });
    }

    function onGetSpriteError(response) {
      Util.warn('Error loading sprite at \'' + spriteUrl + '\'');
    }

    sprite.url = spriteUrl;
    sprite.baseUrl = Common.getBaseUrl(spriteUrl);

    return new Promise(function(resolve) {
      Http.get(spriteUrl)
        .then(onGetSprite, onGetSpriteError)
        .then(function(frameSet) {
          sprite.frameSet = frameSet;
          resolve(sprite);
        });
    });
  } 

  // Build frame set and store it
  function compileFramesets(spriteSheet, sprite, frameSets, frameSetId) {
    var frameSet = getFrameSet(
        sprite.frameSetDefinitions[frameSetId],
        spriteSheet, 
        sprite.frameWidth, 
        sprite.frameHeight
      );

    frameSet.frames = frameSet.frames
      .map(getTransparentImage.bind(undefined, sprite.transparentColor));

    frameSets[frameSetId] = frameSet;
    
    return frameSets;
  }

  // Download a sprite sheet
  function getSpriteSheet(spriteSheetUrl, baseUrl) {
    function onGetSpriteSheet(spriteSheet) {
      Util.log('Sprite sheet loaded!');
      return spriteSheet;
    }

    function onGetSpriteSheetError() {
      Util.warn('sprite sheet not found at ' + spriteSheetUrl);
    }

    if(!spriteSheetUrl) {
      return;
    }

    if(!Common.isFullUrl(spriteSheetUrl)) {
      spriteSheetUrl = baseUrl + '/' + spriteSheetUrl;
    }

    return ImageLoader(spriteSheetUrl)
      .then(onGetSpriteSheet, onGetSpriteSheetError); 
  }

  // Make the given RGB value transparent in the given image.
  // Returns a new image.
  function getTransparentImage(transRGB, image) {
    var r, g, b, index, newImage, dataLength;
    var width = image.width;
    var height = image.height;
    var imageData = image
      .getContext('2d')
      .getImageData(0, 0, width, height);

    if(transRGB) {
      dataLength = width * height * 4;

      for(index = 0; index < dataLength; index+=4) {
        r = imageData.data[index];
        g = imageData.data[index + 1];
        b = imageData.data[index + 2];
        if(r === transRGB[0] && g === transRGB[1] && b === transRGB[2]) {
          imageData.data[index + 3] = 0;
        }
      }
    } 

    newImage = document.createElement('canvas');
    newImage.width  = width;
    newImage.height = height;
    newImage.getContext('2d').putImageData(imageData, 0, 0);

    return newImage;
  }

  // Returns a sequence of frame images given a frame set definition and a sprite sheet
  function getFrameSet(frameSetDefinition, spriteSheet, frameWidth, frameHeight) {
    var frames = frameSetDefinition.frames.map(function(frameDefinition) {
      var frame = document.createElement('canvas');

      frame.width  = frameWidth;
      frame.height = frameHeight;

      frame
        .getContext('2d')
        .drawImage(
          spriteSheet,
          frameDefinition.x, frameDefinition.y,
          frameWidth, frameHeight,
          0, 0,
          frameWidth, frameHeight
        );

      return frame;
    });

    return {
      rate: frameSetDefinition.rate || DEFAULT_RATE,
      frames: frames
    };
  }
  
  return {
    frameWidth: 48,
    frameHeight: 48,
    load: load 
  };
});
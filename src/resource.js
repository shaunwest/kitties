/**
 * Created by Shaun on 3/3/15
 *
 */

register('Resource', ['Util', 'ResourceRegistry', 'Obj'], function(Util, ResourceRegistry, Obj) {
  'use strict';

  function Resource (uri, method) {
    var successCallbacks = [],
      errorCallbacks = [],
      currentIndex = 0;

    var resource = {
      ready: ready,
      fetch: fetch,
      add: add,
      uri: uri
    };

    // could be a little wonky
    function add(resource) {
      if(!Util.isObject(resource) || !resource.ready) {
        return;
      }

      resource.ready(onSuccess, onError);
    }

    function ready(onSuccess, onError) {
      successCallbacks.push(onSuccess);
      errorCallbacks.push(onError);

      return resource;
    }

    function onSuccess(result) {
      var successCallback = successCallbacks[currentIndex++];

      if(successCallback) {
        result = successCallback(result);
        if(result && result.ready) {
          result.ready(function(result) {
            onSuccess(result);
          });
          return;
        }
        onSuccess(result);
      }
    }

    function onError(result) {
      var errorCallback = errorCallbacks[currentIndex++];

      if(errorCallback) {
        result = errorCallback(result);        
        if(result && result.ready) {
          result.ready(function(result) {
            onError(result);
          });
          return;
        }
        onError(result);
      }
    }

    function fetch() {
      var promise = method(uri);

      if(!Util.isObject(promise) || !promise.then) {
        Util.error('Provided resource method did not return a thenable object');
      }

      currentIndex = 0;

      return promise.then(onSuccess, onError);
    }

    if(Util.isFunction(method) && uri) {
      ResourceRegistry.register(resource);
      fetch();
    }

    return resource;
  }

  return Resource;
});
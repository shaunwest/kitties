/**
 * Created by Shaun on 3/3/15
 *
 */

register('Resource', ['Util', 'ResourceRegistry'], function(Util, ResourceRegistry) {
  'use strict';

  return function (uri, method) {
    var successCallbacks = [], errorCallbacks = [];
    var resource = {
      ready: ready,
      fetch: fetch,
      uri: uri
    };

    function ready(onSuccess, onError) {
      if(!onSuccess) {
        Util.error('Resource: ready requires a success callback');
      }
      successCallbacks.push(onSuccess);
      errorCallbacks.push(onError);

      return {
        ready: ready
      };
    }

    function onSuccess(result) {
      var successCallback = successCallbacks.shift();

      /*while(successCallback = successCallbacks.shift()) {
        result = successCallback(result);
      }*/
      if(successCallback) {
        result = successCallback(result);
        if(result && result.ready) {
          result.ready(function(result) {
            onSuccess(result);
          });
        } else {
          onSuccess(result);
        }
      }
    }

    function onError(result) {
      var errorCallback;

      while(errorCallback = errorCallbacks.shift()) {
        if(errorCallback) {
          result = errorCallback(result);        
        }
      }

      return result;
    }

    function fetch() {
      var promise = method(uri);
      if(!Util.isObject(promise) || !promise.then) {
        Util.error('Provided resource method did not return a thenable object');
      }
      return promise.then(onSuccess, onError);
    }

    if(!Util.isFunction(method)) {
      Util.error('Provided resource method must be a function');
    }

    ResourceRegistry.register(resource);

    fetch();

    return resource;
  };
});
/**
 * Created by Shaun on 3/3/15
 *
 */

register('resources.Resource', ['Util', 'ResourceRegistry', 'Common'], function(Util, ResourceRegistry, Common) {
  'use strict';

  // method must be asynchronous
  function Resource (source, method) {
    var successCallbacks = [],
      errorCallbacks = [],
      resource = {
        ready: ready,
        fetch: fetch,
        promise: null,
        source: source
      };

    function ready (onSuccess, onError) {
      if(Util.isArray(onSuccess)) {
        successCallbacks = successCallbacks.concat(onSuccess);
      } else {
        successCallbacks.push(onSuccess);
      }

      if(Util.isArray(onError)) {
        errorCallbacks = errorCallbacks.concat(onError);
      } else {
        errorCallbacks.push(onError);
      }

      return resource;
    }

    function onSuccess (result, index) {
      var successCallback = successCallbacks[index];
      if(!successCallback) {
        if(index < successCallbacks.length) { onError(result, index + 1); }
        return;
      }

      result = successCallback(result);
      if(result && result.ready) {
        result.ready(function (result) {
          onSuccess(result, index + 1);
        }, function (result) {
          onError(result, index + 1);
        });
        return;
      }
      onSuccess(result, index + 1);
    }

    function onError(result, index) {
      var errorCallback = errorCallbacks[index];
      if(!errorCallback) {
        if(index < errorCallbacks.length) { onError(result, index + 1); }
        return;
      }

      result = errorCallback(result);
      if(result && result.ready) {
        result.ready(function() {
          onSuccess(result, index + 1);
        }, function(result) {
          onError(result, index + 1);
        });
        return;
      }
      onError(result, index + 1);
    }

    function fetch () {
      var promise = method(source);

      if(!Util.isObject(promise) || !promise.then) {
        Util.error('Provided resource method did not return a thenable object');
      }

      resource.promise = promise.then(
        function(result) {
          onSuccess(result, 0);
        },
        function(result) {
          onError(result, 0);
        }
      );

      return resource;
    }

    if(!Util.isFunction(method) || !source) {
      return;
    }

    if(Resource.baseUri) {
      if(!Common.isFullUrl(source)) {
        source = Resource.baseUri + '/' + source;
      }
    }

    ResourceRegistry.register(resource);

    return fetch();
  }

  Resource.baseUri = '';

  return Resource;
});
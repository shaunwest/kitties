/**
 * Created by Shaun on 3/3/15
 *
 */

register('Resource', ['Util', 'ResourceRegistry', 'Common'], function(Util, ResourceRegistry, Common) {
  'use strict';

  function Resource (sources, method) {
    var successCallbacks = [],
      errorCallbacks = [],
      resource = {
        ready: ready,
        fetch: fetch,
        promise: null,
        sources: sources
      };

    function ready (onSuccess, onError) {
      successCallbacks.push(onSuccess);
      errorCallbacks.push(onError);

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
      resource.promise = sources.map(function(source, sourceIndex) {
        var promise = method(source);

        if(!Util.isObject(promise) || !promise.then) {
          Util.error('Provided resource method did not return a thenable object');
        }

        return promise.then(
          function(result) {
            onSuccess(result, 0);
          },
          function(result) {
            onError(result, 0);
          }
        );
      });

      return resource;
    }

    if(!Util.isFunction(method) || !sources) {
      return;
    }

    if(!Util.isArray(sources)) {
      sources = [sources];
    }

    if(Resource.baseUri) {
      sources = sources.map(function(source) {
        if(!Common.isFullUrl(source)) {
          return Resource.baseUri + '/' + source;
        }
        return source;
      });
    }

    ResourceRegistry.register(resource);

    return resource.fetch();
  }

  Resource.baseUri = '';

  return Resource;
});
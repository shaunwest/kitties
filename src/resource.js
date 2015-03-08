/**
 * Created by Shaun on 3/3/15
 *
 */

register('Resource', ['Util', 'ResourceRegistry', 'Common'], function(Util, ResourceRegistry, Common) {
  'use strict';

  function Resource (uri, method) {
    var successCallbacks = [],
      errorCallbacks = [],
      currentIndex = 0,
      resource;

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
        resource.result = result;
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
        resource.result = result;
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
      resource.promise = promise;

      return promise.then(onSuccess, onError);
    }

    resource = {
      ready: ready,
      fetch: fetch,
      add: add,
      result: null,
      promise: null,
      uri: ''
    };

    if(Util.isFunction(method) && uri) {
      if(!Common.isFullUrl(uri) && Resource.baseUri) {
        uri = Resource.baseUri + '/' + uri;
      }

      resource.uri = uri;
      ResourceRegistry.register(resource);

      fetch();
    }

    return resource;
  }

  Resource.baseUri = '';

  return Resource;
});
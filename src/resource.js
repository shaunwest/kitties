/**
 * Created by Shaun on 3/3/15
 *
 */

register('Resource', ['ResourceRegistry'], function(ResourceRegistry) {
  'use strict';

  return function (uri) {
    var successCallbacks = [], errorCallbacks = [];
    var resource = {
      ready: ready,
      uri: uri,
      fetch: fetch
    };

    function ready(onSuccess, onError) {
      successCallbacks.push(onSuccess);
      errorCallbacks.push(onError);

      return {
        ready: ready
      };
    }

    function onSuccess(result) {
      successCallbacks.forEach(function(successCallback) {
        result = successCallback(result);
      });
      return result;
    }

    function onError() {
      errorCallbacks.forEach(function(errorCallback) {
        errorCallback();
      });
      return null;
    }

    function fetch(cb) {
      if(cb) {
        cb(onSuccess, onError);
      } 
      return this;     
    }

    ResourceRegistry.register(resource);

    return resource;
  };
});
/**
 * Created by Shaun on 3/3/15
 *
 */

import Util from '../util.js';
import ResourceRegistry from './resource-registry.js';
import {isFullUrl} from '../common.js';

var resourcePool = {};

// method must be asynchronous
function Resource (method, source) {
  var successCallbacks = [],
    errorCallbacks = [],
    resource = {
      ready: ready,
      fetch: fetch,
      promise: null,
      source: source
    };

  if(!Util.isFunction(method)) {
    return;
  }

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

    var newResult = successCallback(result);
    if(newResult && newResult.ready) {
      newResult.ready(function (result) {
        onSuccess(result, index + 1);
      }, function (result) {
        onError(result, index + 1);
      });
      return;
    } else if(!newResult) {
      newResult = result;
    }
    onSuccess(newResult, index + 1);
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

  function fetch (source) {
    var promise;

    if(Resource.baseUri) {
      if(!isFullUrl(source)) {
        source = Resource.baseUri + '/' + source;
      }
    }

    promise = method(source);

    if(!Util.isObject(promise) || !promise.then) {
      Util.error('Provided resource method did not return a thenable object');
    }

    resource.source = source;
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

  // TODO: make better
  if(source) {
    var fullSource = source;
    if (Resource.baseUri) {
      if (!isFullUrl(source)) {
        fullSource = Resource.baseUri + '/' + source;
      }
    }
    var existingResource = resourcePool[fullSource];
    if (existingResource) {
      return existingResource.fetch(source);
    }
  }

  //ResourceRegistry.register(resource);
  resourcePool[fullSource] = resource;
  return (source) ? resource.fetch(source) : resource;
}

Resource.baseUri = '';
Resource.pool = resourcePool;

export default Resource;

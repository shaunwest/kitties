/**
 * Created by Shaun on 3/9/2015.
 */

register('MultiResource', ['Util'], function(Util) {
  'use strict';

  return function (sources) {
    var successCallbacks = [],
      errorCallbacks = [],
      multiResource = {
        ready: ready,
        each: each
      };

    function ready(onSuccess, onError) {
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

      return multiResource;
    }

    function each(callback) {
      setTimeout(function() { // needs to happen AFTER ready() calls
        sources.forEach(function(source) {
          var resource = callback(source);
          resource.ready(successCallbacks, errorCallbacks);
        });
      }, 1);

      return multiResource;
    }

    return multiResource;
  };
});
/**
 * Created by Shaun on 3/1/15
 *
 */

register('HttpResource', ['Http', 'Resource'], function(Http, Resource) {
  'use strict';

  return function (uri) {
    /*var successCallbacks = [], errorCallbacks = [];
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
    }*/

    /*function fetch() {
      return Http.get(uri)
        .then(function(response) {
          var result = response.data;
          successCallbacks.forEach(function(successCallback) {
            result = successCallback(result);
          });

        }, function() {
          console.log('stream error');
          errorCallbacks.forEach(function(errorCallback) {
            errorCallback();
          });
        });
    }

    ResourceRegistry.register(resource);
    fetch();*/

    return Resource(uri).fetch(function (onSuccess, onError) {
      Http.get(uri)
        .then(
          function(response) {
            onSuccess(response.data);
          }, 
          function() {
            console.log('stream error');
            onError();
          }
        );
    });

    //return resource;
  };
});
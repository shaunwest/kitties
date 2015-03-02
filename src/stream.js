/**
 * Created by Shaun on 3/1/15
 *
 */

register('HttpStream', ['Http', 'StreamManager'], function(Http, StreamManager) {
  'use strict';

  return function (uri) {
    var success, error;

    function go(onSuccess, onError) {
      success = onSuccess;
      error = onError;

      return fetch();
    }

    function fetch() {
      return Http.get(uri)
        .then(function(response) {
          if(!success) {
            return;
          }
          return success(response.data);
        }, function() {
          console.log('stream error');
          if(error) {
            error();
          }
        });
    }

    return {
      go: go,
      uri: uri,
      fetch: fetch
    };
  };
});
/**
 * Created by Shaun on 3/1/15
 *
 */

register('ResourceRegistry', [], function() {
  'use strict';

  var resources = {};

  /*function notify(uri) {
    if(!resources[uri]) {
      return;
    }

    resources[uri].forEach(function(resource) {
      resource.fetch();
    });
  }*/

  function register(resource) {
    var uri = resource.uri;
    if(!resources[uri]) {
      resources[uri] = [];
    }
    resources[uri].push(resource);
  }

  return {
    register: register,
    resources: resources
  };
});
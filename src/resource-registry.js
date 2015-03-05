/**
 * Created by Shaun on 3/1/15
 *
 */

register('ResourceRegistry', [], function() {
  'use strict';

  var resources = {};

  function register (resource) {
    var uri = resource.uri;

    if(!resources[uri]) {
      resources[uri] = [];
    }

    resources[uri].push(resource);
  }

  function getResources (uri) {
    if(!uri) {
      return resources;
    }

    return resources[uri];
  }

  return {
    register: register,
    getResources: getResources
  };
});
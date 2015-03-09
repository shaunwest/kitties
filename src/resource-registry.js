/**
 * Created by Shaun on 3/1/15
 *
 */

register('ResourceRegistry', [], function() {
  'use strict';

  var resources = {};

  function register (resource) {
    var source = resource.source;

    if(!resources[source]) {
      resources[source] = [];
    }

    resources[source].push(resource);
  }

  function getResources (source) {
    if(!source) {
      return resources;
    }

    return resources[source];
  }

  return {
    register: register,
    getResources: getResources
  };
});
/**
 * Created by Shaun on 3/1/15
 *
 */

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

export default {
  register: register,
  getResources: getResources
};

/**
 * Created by Shaun on 1/25/15
 *
 */

register('SceneResource',
  [
    'HttpResource',
    'Common',
    'Obj'
  ],
function(HttpResource, Common, Obj) {
  'use strict';
  // UP FOR REMOVAL!!
  return function(uri) {
    var baseUrl = Common.getBaseUrl(uri);

    return HttpResource(uri)
      .ready(function(scene) {
        return Obj.merge(scene, {
          sceneWidth: 500,
          sceneHeight: 500,
          sceneDepth: 500,
          url: uri,
          baseUrl: baseUrl
        });
      });
  };
});
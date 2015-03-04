/**
 * Created by Shaun on 1/25/15
 *
 */

register('Scene', 
  ['Util',
   'Http',
   'HttpResource',
   'Common',
   'Obj',
   'Func',
   ],
function(Util, Http, HttpResource, Common, Obj, Func) {
  'use strict';

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
      }, function() {
        Util.warn('Error loading scene at \'' + uri + '\''); 
      });
  };
});
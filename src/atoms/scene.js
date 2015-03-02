/**
 * Created by Shaun on 1/25/15
 *
 */

register('Scene', 
  ['Util',
   'Http',
   'Common',
   'Obj',
   'Func',
   ],
function(Util, Http, Common, Obj, Func) {
  'use strict';

  function getScene(response) {
    return response.data;
  }

  return function(sceneUrl) {
    var baseUrl = Common.getBaseUrl(sceneUrl);

    return Http.get(sceneUrl)
      .then(getScene, function(response) {
        Util.warn('Error loading scene at \'' + sceneUrl + '\''); 
      })
      .then(function(scene) {
        return Obj.merge(scene, {
          sceneWidth: 500,
          sceneHeight: 500,
          sceneDepth: 500,
          url: sceneUrl,
          baseUrl: baseUrl
        });
      }, function() {
        return null;        
      });
  }
});
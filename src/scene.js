/**
 * Create by Shaun on 1/25/15
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

  // Should this be moved out of scene just like sprites?
  /*function createLayer(layerDefinitions, baseUrl, layerId) {
    //var simpleLayer = Obj.clone(ImageLayer);
    //return simpleLayer.load(layerId, layerDefinitions[layerId], baseUrl);
    var layerDefinition = layerDefinitions[layerId];
    if(layerDefinition.backgroundUrl) {
      ImageLoader(layerDefinition.backgroundUrl)
        .then(setBackground, onGetBackgroundError);  
    }
  }*/

  function getScene(response) {
    return response.data;
  }

  /*function getLayers(baseUrl, scene) {
    var layerDefinitions = scene.layerDefinitions;

    var layerPromises = Object.keys(layerDefinitions)
      .map(Func.partial(createLayer, layerDefinitions, baseUrl));

    return Promise.all(layerPromises)
      .then(function (layers) {
        scene.layers = layers.reduce(function(layers, layer) {
          layers[layer.id] = layer;
          return layers;
        }, {});

        return scene;
      });
  }*/

  return function(sceneUrl) {
    var baseUrl = Common.getBaseUrl(sceneUrl);

    return Http.get(sceneUrl)
      .then(getScene, function(response) {
        Util.warn('Error loading scene at \'' + sceneUrl + '\''); 
      })
      //.then(Func.partial(getLayers, baseUrl))
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
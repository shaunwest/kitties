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
   'ImageLayer'],
function(Util, Http, Common, Obj, Func, ImageLayer) {
  'use strict';

  function createLayer(layerDefinitions, baseUrl, layerId) {
    var simpleLayer = Obj.clone(ImageLayer);
    return simpleLayer.load(layerId, layerDefinitions[layerId], baseUrl);
  }

  function getScene(response) {
    return response.data;
  }

  function getLayers(baseUrl, scene) {
    var layerDefinitions = scene.layerDefinitions;

    var layerPromises = Object.keys(layerDefinitions)
      .map(Func.partial(createLayer, layerDefinitions, baseUrl));

    return Promise.all(layerPromises)
      .then(function onGetLayers(layers) {
        scene.layers = layers.reduce(function(layers, layer) {
          layers[layer.id] = layer;
          return layers;
        }, {});

        return scene;
      });
  }

  function onGetSceneError(response) {
    Util.warn('Error loading scene at \'' + sceneUrl + '\'');
  }

  function load(sceneUrl) {
    var currentScene = this;
    var baseUrl = Common.getBaseUrl(sceneUrl);

    return Http.get(sceneUrl)
      .then(getScene, onGetSceneError)
      .then(Func.partial(getLayers, baseUrl))
      .then(function(scene) {
        var scene = Obj.merge(scene, currentScene);

        scene.url = sceneUrl;
        scene.baseUrl = baseUrl;

        return scene;
      });
  }

  return {
    sceneWidth: 500,
    sceneHeight: 500,
    sceneDepth: 500,
    load: load
  };
});
/**
 * Created by Shaun on 4/25/2015.
 */

import HttpResource from '../resources/http-resource.js';
import ImageResource from '../resources/image-resource.js';
import Sprites from './sprites.js';
import Resource from '../resources/resource.js';

export default function (sceneUri) {
  //Resource.baseUri = baseUri;

  return HttpResource(sceneUri).ready(function(sceneData) {
    var layerDefinitions = sceneData.layerDefinitions;

    return {
      sceneData: sceneData,
      background: ImageResource(layerDefinitions.background.backgroundUrl),
      sprite: Sprites(layerDefinitions.entities.sprites)
    };
  });
}

/*export default class Scene {
  constructor() {
    this.resource = HttpResource().ready(function(sceneData) {
      var layerDefinitions = sceneData.layerDefinitions;

      return {
        sceneData: sceneData,
        background: ImageResource().fetch(layerDefinitions.background.backgroundUrl)
        //sprite: Sprites(layerDefinitions.entities.sprites)
      };
    });
  }

  load(sceneUri, baseUri) {
    Resource.baseUri = baseUri;
    return this.resource.fetch(sceneUri);
  }

  ready(onSuccess, onError) {
    return this.resource.ready(onSuccess, onError);
  }
}*/

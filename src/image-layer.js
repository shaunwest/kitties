/**
 * Created by Shaun on 1/25/15
 *
 */

register('ImageLayer', [
  'Util',
  'ImageLoader',
  'Common'
],
function(Util, ImageLoader, Common) {
  'use strict';

  function load(layerId, layerDefinition, baseUrl) {
    var layer = this;
    var backgroundUrl = layerDefinition.backgroundUrl;

    function setBackground(background) {
      layer.background = background;
      return layer;
    }

    function onGetBackgroundError() {
      Util.warn('Error loading background at \'' + backgroundUrl + '\'');
    }

    if(!backgroundUrl) {
      return;
    }

    if(!Common.isFullUrl(backgroundUrl)) {
      backgroundUrl = baseUrl + '/' + backgroundUrl;
    }

    layer.id = layerId;

    return ImageLoader(backgroundUrl)
      .then(setBackground, onGetBackgroundError);  
  }

  return {
    load: load
  };
});
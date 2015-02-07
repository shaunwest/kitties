register('CanvasViewport', [], function() {
  'use strict';

  function addLayer(layer) {

  }

  return {

  };



  //drawLayer(this.element, this.layers[index], this.viewDimensions);
  function drawLayer(canvas, layerData, viewDimensions) {
    var context = canvas.getContext('2d');

    if(layerData.visible) {
      layerData.layer.draw(context, viewDimensions);
    }
  }


  function draw(canvas) {
    var layer, i;
    var layers = this.layers;
    var context = canvas.getContext('2d');
    var dims = this.viewDimensions;
    var delta = this.viewDelta;
    var numLayers = layers.length;

    context.clearRect(0, 0, delta.width, delta.height);

    for(i = 0; i < numLayers; i++) {
      layer = layers[i];
      if(layer.renderMode === 1) {
        drawLayer(canvas, layer, delta);
      } else {
        drawLayer(canvas, layer, dims);
      }
    }

    /*if(this.hasBorder) {
      Canvas.drawBorder(context, dims.width, dims.height);
    }*/

    /*if(this.drawFocusRegion) {
      Canvas.drawBorder(
        context,
        this.focusRegion.right - this.focusRegion.left,
        this.focusRegion.bottom - this.focusRegion.top,
        this.focusRegion.left,
        this.focusRegion.top,
        'red'
      );
    }*/

    return this;
  }
});


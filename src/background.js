/**
 * Created by shaunwest on 6/29/15.
 */

import {Fragment} from './engine/fragments.js';
import Viewport from './viewport.js';
import frame from './engine/frame.js';
import {clearContext} from './canvas-renderer.js';

export default function (world) {
  world.background.backgroundSource
    .then(function (backgroundImage) {
      var canvas = Fragment('canvas-background'),
        context2d = canvas.getContext('2d');

      frame(function (fps) {
        clearContext(context2d, canvas.width, canvas.height);
        renderBackground(backgroundImage, context2d);
      });
    });

  return world;
}

function renderBackground(backgroundImage, context2d) {
  context2d.drawImage(
    backgroundImage,
    Viewport.x, Viewport.y,
    Viewport.width, Viewport.height,
    0, 0,
    Viewport.width, Viewport.height
  );
}
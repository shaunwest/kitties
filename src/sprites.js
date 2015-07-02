/**
 * Created by shaunwest on 6/29/15.
 */
import {Fragment} from './engine/fragments.js';
import Viewport from './viewport.js';
import frame from './engine/frame.js';
import {clearContext} from './canvas-renderer.js';

export default function (sprites) {
  var canvas = Fragment('canvas-entities'),
    context2d = canvas.getContext('2d');

  frame(function (fps) {
    clearContext(context2d, canvas.width, canvas.height);

    sprites
      .forEach(function (sprite) {
        // calc AI
        // calc physics
        // calc collisions w/ entities
        // resolve collisions w/ entities
        // calc collisions w/ env
        // resolve collisions w/ env

        renderSprite(sprite, context2d);
      });
    return true;
  });

  return sprites;
}

function renderSprite(entity, context2d) {
  var image = entity.animation.getNext();

  if(image) {
    context2d.drawImage(
      image,
      entity.x - Viewport.x || 0,
      entity.y - Viewport.y || 0
    );
  }
}

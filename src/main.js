/**
 * Created by Shaun on 4/23/2015.
 */

import {cacheDataElements} from './engine/fragments.js';
import {getInstances} from './engine/container.js';
import getSceneSchema from './schema/scene-schema.js';
import BackgroundLayer from './layers/background-layer.js';
import SpriteLayer from './layers/sprite-layer.js';
import CollisionLayer from './layers/collision-layer.js';
import Interact from './interact.js';
import {Fragment} from './engine/fragments.js';
import Rx from 'rx';
import Viewport from './viewport.js';

cacheDataElements();

// DEBUG
window.getInstances = getInstances;

function frame(cb) {
  window.requestAnimationFrame(function () {
    cb('bar');
    frame(cb);
  });
}

/*var tick = Rx.Observable.fromEventPattern(
  frame,
  function remove(handler) {}
);*/

var tick = Rx.Observable.interval(33);

var sceneSource = getSceneSchema('assets/kitty-world.json');

var background = sceneSource
  .flatMap(function(scene) {
    return scene.layerDefinitions.background.backgroundSource;
  });

/*var backgroundLoop = tick.flatMap(function(count) {
  return background;
});*/

/*var backgroundLoop = background.flatMap(function (background) {
  return Rx.Observable
    .merge(tick)
    .scan(background, function(current, count) {
      return current;
    });
});*/

/*backgroundLoop.subscribe(function(background) {
  renderBackground(background);
});*/

var backgroundCanvas = Fragment('canvas-background');
var backgroundContext2d = backgroundCanvas.getContext('2d');

function renderBackground(background) {
  backgroundContext2d.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
  if(background) {
    backgroundContext2d.drawImage(
      background,
      Viewport.x, Viewport.y,
      Viewport.width, Viewport.height,
      0, 0,
      Viewport.width, Viewport.height
    );
  }
}

var sprites = sceneSource
  .flatMap(function(scene) {
    return scene.layerDefinitions.entities.spritesSource;
  });

//sprite.animation.play('run');
/*var spriteLoop = sprites.flatMap(function (sprite) {
  return Rx.Observable
    .merge(tick)
    .scan(sprite, function(current, count) {
      return current;
    });
});*/

var spriteLoop = tick.flatMap(function (count) {
  return sprites;
});

spriteLoop.subscribe(function(sprite) {
  renderSprite(sprite);
});

var entitiesCanvas = Fragment('canvas-entities');
var entitiesContext2d = entitiesCanvas.getContext('2d');

function renderSprite(entity) {
  entitiesContext2d.clearRect(0, 0, entitiesCanvas.width, entitiesCanvas.height);
  var image = entity.animation.getNext();
  console.log(entity.animation.currentFrameIndex());
  /*if(image) {
    entitiesContext2d.drawImage(
      image,
      entity.x - Viewport.x || 0,
      entity.y - Viewport.y || 0
    );
  }*/
}


/*new SpriteLayer();
new BackgroundLayer();
new CollisionLayer();
*/

/*var interactions = new Interact();

//interactions
//  .input
//  .subscribe(function(inputs) {
//    console.log('fooooo');
//  });


function frame(cb) {
  window.requestAnimationFrame(function () {
    cb();
    frame(cb);
  });
}

var source = Rx.Observable.fromEventPattern(
  function add(handler) {
    frame(handler);
  }, function remove(handler) {
  }
);

var merged = Rx.Observable.merge(source, interactions.input);

merged.subscribe(function (keyCode) {
  //console.log(keyCode);
});
*/

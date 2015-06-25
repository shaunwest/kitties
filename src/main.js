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
import Viewport from './viewport.js';
import Valve from './engine/valve.js';
import Scheduler from './engine/frame.js';

cacheDataElements();

// DEBUG
window.getInstances = getInstances;

var scheduler = Valve.create(function (emit) {
  function frameLoop() {
    window.requestAnimationFrame(function () {
      emit(30);
      frameLoop();
    });
  }
  frameLoop();
});

var keys = Valve.create(function (emit) {
  window.addEventListener('keydown', emit);
}).then(function (event) {
  return event.keyCode;
});

keys.then(function (keyCode) {
  console.log(keyCode);
});

//var scheduler = Scheduler();
//window.scheduler = scheduler;

var world = getSceneSchema('assets/kitty-world.json');
world
  .clone()
  .then(function (world) {
    return Valve.applyAll([
      world.layerDefinitions.entities.spritesSource,
      'foo' //world.layerDefinitions.collisions.colliders
    ]);
  })
  .then(function (sprites, colliders) {
    console.log(colliders);
    scheduler
      .clone()
      .then(function () {
        clearEntities();
        sprites.forEach(function (sprite) {
          // calc physics
          // calc collisions
          renderSprite(sprite);
        });
      });
  });
  /*.then(function (sprite) {
    return scheduler.attach(sprite);
  })
  .then(function (fps, sprite) {
    renderSprite(sprite);
  });*/


world
  .clone()
  .then(function (world) {
    return world.layerDefinitions.background.backgroundSource;
  })
  .then(function (backgroundImage) {
    scheduler
      .clone()
      .then(function () {
        renderBackground(backgroundImage);
      });
  });


var backgroundCanvas = Fragment('canvas-background');
var backgroundContext2d = backgroundCanvas.getContext('2d');

function renderBackground(backgroundImage) {
  backgroundContext2d.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);

  backgroundContext2d.drawImage(
    backgroundImage,
    Viewport.x, Viewport.y,
    Viewport.width, Viewport.height,
    0, 0,
    Viewport.width, Viewport.height
  );
}


var entitiesCanvas = Fragment('canvas-entities');
var entitiesContext2d = entitiesCanvas.getContext('2d');

function clearEntities() {
  entitiesContext2d.clearRect(0, 0, entitiesCanvas.width, entitiesCanvas.height);
}

function renderSprite(entity) {
  var image = entity.animation.getNext();

  if(image) {
    entitiesContext2d.drawImage(
      image,
      entity.x - Viewport.x || 0,
      entity.y - Viewport.y || 0
    );
  }
}

/*new SpriteLayer();
new BackgroundLayer();
new CollisionLayer();
*/


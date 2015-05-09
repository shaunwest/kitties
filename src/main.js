/**
 * Created by Shaun on 4/23/2015.
 */

import ResourceRegistry from './engine/resources/resource-registry.js';
/*import BackgroundLayer from './layers/background-layer.js';
import EntityLayer from './layers/entity-layer.js';
import CollisionLayer from './layers/collision-layer.js';
import Scheduler from './scheduler.js';
import Scene from './world/scene.js';*/
import {cacheDataElements, Fragment} from './engine/fragments.js';
//import {use, instance} from './injector.js';
//import {register} from './engine/container.js';
//import {log} from './logger.js';
import View from './view.js';
import Loader from './loader.js';

var refresh;

/*register('viewport', {
  x: 0,
  y: 0,
  width: 600,
  height: 400
});*/

/*class Data {
  setValue(value) {
    this.value = value;
  }
  getValue() {
    return this.value;
  }
}


@use(Data)
class Bar {
  constructor(data) {
    data.setValue('fuuuuuu');
  }
  baz() {
    return 'baz';
  }
}

@instance(Bar)
class Stupid {
  constructor(bar) {
    this.bar = bar;
  }
  @log('you called dumb!')
  dumb() {
    return this.bar.baz();
  }
}

@instance(Stupid)
@use(Data)
@instance('blah')
class Foo {
  constructor(stupid, data, blah) {
    console.log(stupid.dumb());
    console.log(data.getValue());
    console.log(blah);
  }

  foobar(bar) {
    return bar.baz();
  }
}

var foo = new Foo('hello!');*/

cacheDataElements();

/*var canvasBackground = Fragment('canvas-background');
var canvasEntities = Fragment('canvas-entities');
var canvasColliders = Fragment('canvas-colliders');*/

refresh = function() {
  return ResourceRegistry.getResources('assets/kitty.json');
};

//new View();

var loader = new Loader();
loader.getScene('kitty-world.json','assets');

/*
// VIEW STUFF

// Setup background layer
var backgroundLayer = BackgroundLayer(canvasBackground);
Scheduler(function () {
  backgroundLayer.draw(viewport);
});

// Setup entity layer
var entityLayer = EntityLayer(canvasEntities);
Scheduler(function () {
  entityLayer.draw(viewport);
});

// Setup collision debug layer
var collisionLayer = CollisionLayer(canvasColliders);
Scheduler(function () {
  collisionLayer.draw(viewport);
});
*/

/*Scene('kitty-world.json','assets').ready(function(scene) {
  scene.background.ready(function (background) {
    backgroundLayer.setBackground(background);
  });

  entityLayer.clear();
  scene.sprite.ready(function (sprite) {
    sprite.animation.play('run');
    entityLayer.addEntity(sprite);
  }, function() {
    console.log('ERROR!!')
  });

  collisionLayer.setColliders(scene.sceneData.layerDefinitions.collisions.colliders);
});*/

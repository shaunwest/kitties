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
import Rx from 'rx';

cacheDataElements();

// DEBUG
window.getInstances = getInstances;

getSceneSchema('assets/kitty-world.json')
  .subscribe(function(scene) {
    console.log('Got scene', scene);
  });


new SpriteLayer();
new BackgroundLayer();
new CollisionLayer();

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


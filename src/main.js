/**
 * Created by Shaun on 4/23/2015.
 */

import {cacheDataElements} from './engine/fragments.js';
import {getInstances, includeInstance} from './engine/container.js';
import SceneSchema from './schema/scene-schema.js';
import BackgroundLayer from './layers/background-layer.js';
import SpriteLayer from './layers/sprite-layer.js';
import CollisionLayer from './layers/collision-layer.js';

cacheDataElements();

// DEBUG
window.getInstances = getInstances;

var source = SceneSchema('assets/kitty-world.json');

source.subscribe(function(scene) {
  console.log('Got scene', scene);
});

new SpriteLayer();
new BackgroundLayer();
new CollisionLayer();


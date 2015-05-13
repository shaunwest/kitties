/**
 * Created by Shaun on 4/23/2015.
 */

//import ResourceRegistry from './engine/resources/resource-registry.js';
import {cacheDataElements} from './engine/fragments.js';
import Resource from './engine/resources/resource.js';
import {getInstances} from './engine/container.js';
import HttpResource from './engine/resources/http-resource.js';
//import Loader from './loader.js';
import SceneSchema from './schema/scene-schema.js';
import SpriteSchema from './schema/sprite-schema.js';
import Scene from './scene.js';

cacheDataElements();

/*window.refresh = function() {
  return ResourceRegistry.getResources('assets/kitty.json');
};*/

//var loader = new Loader();
//loader.getScene('kitty-world.json','assets');

Resource.baseUri = 'assets';

// DEBUG
window.Resource = Resource;
window.getInstances = getInstances;

var sceneSchema = SceneSchema();

HttpResource('kitty-world.json')
  .ready(function(sceneData) {
    var scene = sceneSchema.map(sceneData);
    console.log(scene);
    Scene(scene);
  });

var spriteSchema = SpriteSchema();

HttpResource('kitty.json')
  .ready(function(spriteData) {
    var sprite = spriteSchema.map(spriteData);
    console.log(sprite);
  });

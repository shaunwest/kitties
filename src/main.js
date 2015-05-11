/**
 * Created by Shaun on 4/23/2015.
 */

//import ResourceRegistry from './engine/resources/resource-registry.js';
import {cacheDataElements} from './engine/fragments.js';
import Resource from './engine/resources/resource.js';
import {register} from './engine/container.js';
import HttpResource from './engine/resources/http-resource.js';
//import Loader from './loader.js';
import SceneSchema from './schema/scene-schema.js';
import Scene from './scene.js';

var refresh;

cacheDataElements();

/*window.refresh = function() {
  return ResourceRegistry.getResources('assets/kitty.json');
};*/

//var loader = new Loader();
//loader.getScene('kitty-world.json','assets');

Resource.baseUri = 'assets';
window.Resource = Resource;

var sceneSchema = SceneSchema();

HttpResource('kitty-world.json')
  .ready(function(sceneData) {
    var scene = sceneSchema.map(sceneData);
    console.log(scene);
    Scene(scene);
  });

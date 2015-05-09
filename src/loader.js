/**
 * Created by shaunwest on 5/4/15.
 */

import {use} from './engine/injector.js'
import Scene from './engine/world/scene.js'
import Resource from './engine/resources/resource.js'
import Background1 from './layers/background1.js'
import Entity1 from './layers/entity1.js'
import Collision1 from './layers/collision1.js'

@use(Background1, Entity1, Collision1, Scene)
export default class Loader {
  constructor(backgroundLayer1, entityLayer1, collisionLayer1, scene) {
    this.backgroundLayer1 = backgroundLayer1;
    this.entityLayer1 = entityLayer1;
    this.collisionLayer1 = collisionLayer1;
    this.scene = scene;
  }

  getScene(sceneFile, baseDir) {
    Resource.baseUri = baseDir;
    //this.scene.load(sceneFile, baseDir);
    this.scene.fetch(sceneFile);
  }
}
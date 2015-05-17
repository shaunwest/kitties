/**
 * Created by shaunwest on 5/9/15.
 */

import BackgroundLayer from './layers/background-layer.js';
import CollisionLayer from './layers/collision-layer.js';
import SpriteLayer from './layers/sprite-layer.js';

export default function Scene () {
  new BackgroundLayer();
  new CollisionLayer();
  new SpriteLayer();
}
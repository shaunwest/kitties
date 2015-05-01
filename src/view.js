import BackgroundLayer from './layers/background-layer.js';
import {register} from './container.js';
import {use} from './injector.js';

register('background1', new BackgroundLayer('canvas-background'));

@use('background1')
class View {
  constructor(backgroundLayer) {

  }
}
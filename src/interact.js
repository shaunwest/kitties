/**
 * Created by shaunwest on 6/13/15.
 */

import Rx from 'rx';

var inputs;

export default class Interact {
  constructor() {
    this.inputs = {};
    this.inputsEnded = {};

    this.keydowns = Rx.Observable.fromEvent(window, 'keydown')
      .map(function(event) {
        return event.keyCode;
      });
      /*.reduce(function(inputs, keyCode) {
        inputs[keyCode] = true;
        return inputs;
      }, this.inputs);*/

    /*this.keydowns = Rx.Observable.fromEvent(window, 'keydown')
      .map(function(event) {
        return event.keyCode;
      });*/
  }

  get input() {
    return this.keydowns;
  }
}

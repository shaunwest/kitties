/**
 * Created by shaunwest on 5/11/15.
 */

//import {registerInstance} from '../container.js';

export function more(func, schema) {
  return function(val, container) {
    return {
      schema: schema,
      cb: function (newVal) {
        func(newVal, container);
      }
    }
  }
}

// TODO: up for removal
export function setProp(prop, func) {
  return function(val, container) {
    container[prop] = func(val, container);
  }
}

// TODO: up for removal
/*export function registerValue(id, schema) {
  return function() {
    return {
      schema: schema,
      cb: function (val) {
        registerInstance(id, val);
      }
    }
  };
}*/

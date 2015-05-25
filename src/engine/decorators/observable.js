/**
 * Created by shaunwest on 5/24/15.
 */

import Rx from 'rx';
import {includeInstanceAsync} from '../container.js';

export default function observable (id) {
  return function(target, name, descriptor) {
    var func = descriptor.set;

    includeInstanceAsync(id)
      .then(function(instance) {
        instance.subscribe(function(value) {
          func.call(target, value);
        });
      });
  };
}
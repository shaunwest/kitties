/**
 * Created by shaunwest on 5/16/15.
 */

import inject from '../injector.js';
import {includeWhenInstance} from '../container.js';

// instantiates the associated target class when
// a provided instance is added to the dependency container
export default function model (token) {
  return function(target) {
    includeWhenInstance(token, function(instance) {
      new target(instance);
    });
    return target;
  }
}
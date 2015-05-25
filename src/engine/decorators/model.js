/**
 * Created by shaunwest on 5/16/15.
 */

import inject from '../injector.js';
import {includeWhenInstance} from '../container.js';

export default function model (token) {
  return function(target) {
    includeWhenInstance(token, function(instance) {
      new target(instance);
    });
    return target;
  }
}
/**
 * Created by shaunwest on 5/9/15.
 */

import inject from '../injector.js';
import {includeInstance} from '../container.js';

export default function include () {
  var tokens = Array.prototype.slice.call(arguments);
  return inject(tokens.map(token => includeInstance(token)));
}
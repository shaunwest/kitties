/**
 * Created by shaunwest on 5/16/15.
 */

/**
 * Created by shaunwest on 5/9/15.
 */

import inject from '../injector.js';
import {includeInstanceAsync} from '../container.js';

export default function async () {
  var tokens = Array.prototype.slice.call(arguments);
  return inject(tokens.map(token => includeInstanceAsync(token)));
}
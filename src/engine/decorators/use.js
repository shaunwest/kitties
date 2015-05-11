/**
 * Created by shaunwest on 5/9/15.
 */

import inject from '../injector.js';
import {useSingleton} from '../container.js';

export default function () {
  var tokens = Array.prototype.slice.call(arguments);
  return inject(tokens.map(token => useSingleton(token)));
}
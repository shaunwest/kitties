/**
 * Created by shaunwest on 5/10/15.
 */

import inject from '../injector.js';
import {Fragment} from '../fragments.js';

export default function (element) {
  return inject([Fragment(element)])
}
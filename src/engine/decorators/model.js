/**
 * Created by shaunwest on 5/16/15.
 */

import inject from '../injector.js';
import {includeInstance, registerInstance} from '../container.js';
import {lazyLoadSubject} from '../lazy.js';
import Rx from 'rx';

export default function model () {
  var ids = Array.prototype.slice.call(arguments);
  var injectables = ids.map(id => lazyLoadSubject(id));

  return inject(injectables);
}

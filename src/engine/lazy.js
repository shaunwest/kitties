/**
 * Created by shaunwest on 6/11/15.
 */

import {includeInstance, registerInstance} from './container.js';
import Rx from 'rx';

export function lazyLoadSubject(id) {
  return includeInstance(id) || registerInstance(id, new Rx.Subject());
}
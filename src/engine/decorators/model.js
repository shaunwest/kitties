/**
 * Created by shaunwest on 5/16/15.
 */

import inject from '../injector.js';
import {includeInstance, registerInstance} from '../container.js';
import Rx from 'rx';

export default function model () {
  var ids = Array.prototype.slice.call(arguments);
  var injectables = ids.map(function(id) {
    var subject = includeInstance(id);

    if (subject) {
      return subject;
    }

    subject = new Rx.Subject();
    registerInstance(id, subject);

    return subject;
  });

  return inject(injectables);
}

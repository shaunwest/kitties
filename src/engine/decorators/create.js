/**
 * Created by shaunwest on 5/10/15.
 */

import inject from '../injector.js';
import {useFactory} from '../container.js';

// NOTE: Experimental. May not need this anymore.
export default function create (id, factory) {
  var result = useFactory(id, factory);

  if(result) {
    return inject([result]);
  }
}
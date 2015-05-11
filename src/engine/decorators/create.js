/**
 * Created by shaunwest on 5/10/15.
 */

import inject from '../injector.js';
import {useFactory} from '../container.js';

export default function create (id, factory) {
  var result = useFactory(id, factory);

  if(result) {
    return inject([result]);
  }
}
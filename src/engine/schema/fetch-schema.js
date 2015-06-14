/**
 * Created by shaunwest on 6/11/15.
 */

import mapSchema from './schema-mapper.js';
import Rx from 'rx';

export default function fetchSchema(uri, schema) {
  return Rx.Observable
    .fromPromise(fetch(uri).then(response => response.json()))
    .flatMap(function(json) {
      return Rx.Observable.create(function(ob) {
        ob.onNext(mapSchema(json, schema));

        return function() {
          console.log('disposed');
        }
      });
    });
}
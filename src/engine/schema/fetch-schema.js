/**
 * Created by shaunwest on 6/11/15.
 */

import mapSchema from './schema-mapper.js';
import Valve from '../valve.js';

export default function fetchSchema(uri, schema) {
  return new Valve(function(emit) {
    var promise = fetch(uri)
      .then(response => response.json())
      .then(json => {
        return mapSchema(json, schema);
      });

    emit(promise);
  });
   /* .flatMap(function(json) {
      return Rx.Observable.create(function(ob) {
        ob.onNext(mapSchema(json, schema));

        return function() {
          console.log('disposed');
        }
      });
    });*/
}
/**
 * Created by Shaun on 3/1/15
 *
 */

import Util from '../util.js';
import {requestGet} from '../kjax.js';
import Resource from './resource.js';

// Re-work Resources...
/*export default class HttpResource {
  constructor() {
    this.resource = Resource(requestGet);
  }

  fetch (uri) {
    return this.resource
      .fetch(uri)
      .ready(function(response) {
        return response.data;
      });
  }

  ready(onSuccess, onError) {
    this.resource.ready(onSuccess, onError);
  }
}*/

export default function(uri) {
  return Resource(requestGet, uri)
    .ready(function(response) {
      return response.data;
    });
};


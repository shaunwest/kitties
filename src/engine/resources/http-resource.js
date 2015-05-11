/**
 * Created by Shaun on 3/1/15
 *
 */

import Util from '../util.js';
import {requestGet} from '../kjax.js';
import Resource from './resource.js';

export default function(uri) {
  return Resource(requestGet, uri)
    .ready(function(response) {
      return response.data;
    });
};


/**
 * Created by shaunwest on 6/11/15.
 */


import Valve from '../valve.js';

export default function fetchJSON(uri) {
  //return Valve.create(fetch(uri).then(response => response.json()));
  return fetch(uri).then(response => response.json());
}
/**
 * Created by Shaun on 1/25/15
 *
 */

import Resource from './resource.js';
import {getImage} from './image-loader.js';

export default function (uri) {
  return Resource(getImage, uri);
};

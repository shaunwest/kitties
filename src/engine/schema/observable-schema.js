/**
 * Created by shaunwest on 5/23/15.
 */

import Util from '../util.js';
import {mergeObject} from '../common.js';
import Rx from 'rx';

export default function ObservableSchema(data, schema) {
  if(typeof schema != 'object' && typeof schema != 'function') {
    throw 'ObservableSchema: schema must be an object or function';
  }

  return Rx.Observable.create(function(ob) {
    ob.onNext(mapValue(data, schema));

    return function() {
      console.log('disposed');
    }
  });
}

function mapByType(data, schema) {
  switch(typeof data) {
    case 'object':
      return iterateKeys(data, schema);
    case 'array':
      return iterateArray(data, schema);
    default:
      return data;
  }
}

function clone(val) {
  if(Util.isObject(val)) {
    return mergeObject(val);
  }

  if(Util.isArray(val)) {
    return val.slice(0);
  }

  return val;
}

function mapValue(data, schemaOrFunc, container) {
  var mappedData, result;

  if(!schemaOrFunc) {
    return clone(data);
  }

  if(typeof schemaOrFunc == 'function') {
    mappedData = clone(data);
    result = schemaOrFunc(mappedData, container);
    if(typeof result == 'object' && result.cb) {
      mappedData = mapValue(data, result.schema, container);
      result.cb(mappedData);
    }
    return mappedData;
  }

  return mapByType(data, schemaOrFunc);
}

function iterateKeys (obj, schema) {
  return Object
    .keys(obj)
    .reduce(function(newObj, key) {
      newObj[key] = mapValue(
        obj[key],
        schema.hasOwnProperty('*') ?
          schema['*'] :
          schema[key],
        newObj
      );
      return newObj;
    }, {});
}

function iterateArray (arr, schema) {
  return arr
    .reduce(function(newArr, val, index) {
      newArr.push(mapValue(
        arr[index],
        schema[0],
        newArr
      ));
      return newArr;
    }, []);
}
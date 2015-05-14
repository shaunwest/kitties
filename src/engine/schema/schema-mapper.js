/**
 * Created by shaunwest on 5/9/15.
 */
import Util from '../util.js';
import {mergeObject} from '../common.js';

/*
There are 2 schema types: "function" and "not function"
With that in mind, this could possibly be refactored to be a
little more clear/readable
 */

export default class SchemaMapper {
  constructor (schema) {
    if(typeof schema != 'object' && typeof schema != 'function') {
      throw 'SchemaMapper: schema must be an object or function';
    }

    this.schema = schema;
  }

  map (data) {
    return mapValue(getConfig(data, this.schema));
  }
}

var typeMap = {
  'object': iterateKeys,
  'array': iterateArray
};

function getConfig(data, schema, container) {
  return (typeof schema == 'function') ?
    { data: data, schema: null, func: schema, container: container } :
    { data: data, schema: schema, func: null, container: container };
}

function mapByType(data, schema) {
  var mappingFunc = typeMap[typeof data];
  if (mappingFunc) {
    return mappingFunc(data, schema);
  }
  return data;
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

function mapValue(config) {
  var func = config.func,
    data = config.data,
    schema = config.schema,
    container = config.container,
    result,
    mappedValue;

  mappedValue = (schema) ? mapByType(data, schema) : clone(data);

  if(func) {
    result = func(mappedValue, container);
    if(typeof result == 'object' && result.cb) {
      mappedValue = mapValue({
        data: data,
        func: null,
        schema: result.schema,
        container: container
      });
      result.cb(mappedValue);
    }
  }

  return mappedValue;
}

function iterateKeys (obj, schema) {
  return Object.keys(obj).reduce(function(newObj, key) {
    var schemaVal = (schema.hasOwnProperty('*')) ? schema['*'] : schema[key];
    newObj[key] = mapValue(getConfig(obj[key], schemaVal, newObj));
    return newObj;
  }, {});
}

function iterateArray (arr, schema) {
  return arr.reduce(function(newArr, val, index) {
    newArr.push(mapValue(getConfig(arr[index], schema[0], newArr)));
    return newArr;
  }, []);
}

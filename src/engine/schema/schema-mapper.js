/**
 * Created by shaunwest on 5/9/15.
 */
import Util from '../util.js';

export default class SchemaMapper {
  constructor (schema) {
    if(typeof schema != 'object' && typeof schema != 'function') {
      throw 'SchemaMapper: schema must be an object or function';
    }

    this.schema = schema;
  }

  map (data) {
    var schema = (typeof this.schema == 'function') ? this.schema(data) : this.schema;
    return mapValue(data, schema);
  }
}

var typeMap = {
  'object': iterateKeys,
  'array': iterateArray
};

function mapValue (val, schema, container) {
  var mappingFunc, retVal;

  if(!schema) {
    return val;
  }

  if(typeof schema == 'function') {
    val = schema(val, container);
  } else if(typeof schema == 'object' && schema.hasOwnProperty('schema')) {
    val = mapValue(val, schema.schema);
    schema.cb(val);
    return val;
  }

  mappingFunc = typeMap[typeof val];
  if(mappingFunc) {
    val = mappingFunc(val, schema);
  }

  return val;
}

function iterateKeys (obj, schema) {
  return Object.keys(obj).reduce(function(newObj, key) {
    var schemaVal = (schema.hasOwnProperty('*')) ? schema['*'] : schema[key];
    newObj[key] = mapValue(obj[key], schemaVal, newObj);
    return newObj;
  }, {});
}

function iterateArray (arr, schema) {
  return arr.reduce(function(newArr, val, index) {
    newArr.push(mapValue(arr[index], schema[0], newArr));
    return newArr;
  }, []);
}


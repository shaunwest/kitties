/**
 * Created by shaunwest on 5/9/15.
 */

export default class SchemaMapper {
  constructor (schema) {
    if(typeof schema !== 'object') {
      throw 'SchemaMapper: schema must be an object';
    }

    this.schema = schema;
  }

  map (data) {
    return mapValue(data, this.schema);
  }
}

var typeMap = {
  'object': iterateKeys,
  'array': iterateArray
};

function mapValue (val, schema, container) {
  var mappingFunc;

  if(!schema) {
    return val;
  }

  mappingFunc = typeMap[typeof val];
  if(mappingFunc) {
    return mappingFunc(val, schema);
  }

  if(typeof schema === 'function') {
    schema(val, container);
  }
  return val;
}

function iterateKeys (obj, schema) {
  return Object.keys(obj).reduce(function(newObj, key) {
    newObj[key] = mapValue(obj[key], schema[key], newObj);
    return newObj;
  }, {});
}

function iterateArray (arr, schema) {
  return arr.reduce(function(newArr, val, index) {
    newArr.push(mapValue(arr[index], schema[0], newArr));
    return newArr;
  }, []);
}


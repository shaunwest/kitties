/**
 * Created by shaunwest on 5/11/15.
 */

import Util from '../util.js';
import {includeInstance, registerInstance} from '../container.js';
import ObservableResource from '../resources/observable-resource.js';
import ResourceFactory from '../resources/resource-factory.js';


export function setProp(prop, func) {
  return function(val, container) {
    container[prop] = func(val, container);
  }
}

export function includeResource(id) {
  return function (val) {
    var resource = includeInstance(id);
    if(resource) {
      resource.fetch(val);
    }
  }
}

export function registerResource (id, resourceFactory, schema) {
  return function () {
    return {
      schema: schema,
      cb: function (val) {
        var resource = resourceFactory();
        registerInstance(id, resource);
        //resource.fetch(val);
      }
    }
  }
}

/*export function registerObservable (id, observableFactory, schema) {
  return function () {
    return {
      schema: schema,
      cb: function (val) {
        var observable = includeInstance(id);
        if(!observable) {
          observable = observableFactory();
          registerInstance(id, observable);
        }

        observable.update(val);

        return observable;
      }
    }
  }
}*/


// is this even useful here?
/*export function registerObservable (id, resource, schema) {
  return function () {
    return {
      schema: schema,
      cb: function (val) {
        var observable = includeInstance(id);

        if(!observable) {
          observable = ObservableResource(resource);
          registerInstance(id, observable);
        }

        resource.update(); // should this be here?
        //observable.update(val);

        return observable;
      }
    }
  }
}*/

export function registerObservable(id, method, schema) {
  return function () {
    return {
      schema: schema,
      cb: function (val) {
        var resource;
        var observable = includeInstance(id);

        if(!observable) {
          resource = ResourceFactory(val, method);
          observable = ObservableResource(resource);
          registerInstance(id, observable);
        }

        //resource.update(); // should this be here? Who knows

        return observable;
      }
    }
  }
}

export function attachResource(key, resourceFactory) {
  return function(val, container) {
    container[key] = resourceFactory(val);
    return val;
  }
}

export function registerValue(id, schema) {
  return function() {
    return {
      schema: schema,
      cb: function (val) {
        registerInstance(id, val);
      }
    }
  };
}

export function echo() {
  return function(val) {
    console.log(val);
  }
}
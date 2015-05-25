/**
 * Created by Shaun on 4/23/2015.
 */

//import ResourceRegistry from './engine/resources/resource-registry.js';
import {cacheDataElements} from './engine/fragments.js';
import Resource from './engine/resources/resource.js';
import {getInstances} from './engine/container.js';
import HttpResource from './engine/resources/http-resource.js';
import SceneSchema from './schema/scene-schema.js';
import SpriteSchema from './schema/sprite-schema.js';
//import Scene from './scene.js';
import BackgroundLayer from './layers/background-layer.js';
//import ObservableResource from '../resources/observable-resource.js';
import Rx from 'rx';

cacheDataElements();

/*window.refresh = function() {
  return ResourceRegistry.getResources('assets/kitty.json');
};*/

Resource.baseUri = 'assets';

// DEBUG
//window.Resource = Resource;
window.getInstances = getInstances;

/*var oneSecond = Rx.Observable.interval(1000);

function getAsset() {
  return Rx.DOM.ajax({ url: 'assets/kitty.json', responseType: 'json'});
}

var assets = oneSecond.selectMany(getAsset).map(function(data) {
  return data.response;
});

assets.forEach(function(data) { // I guess forEach or Subscribe is needed for the whole thing to start...
  console.log(1, data);
});*/







/*function ArrayStream() {
  var observer;
  var observable = Rx.Observable.create(function(ob) {
    observer = ob;
    return function() {
      console.log('disposed');
    }
  });

  return {
    add: function(value) {
      observer.onNext(value);
      return this;
    },
    subscribe: function() {
      return observable.subscribe.apply(observable, arguments);
    }
  };
}


var arrayStream = ArrayStream();
arrayStream.subscribe(function(value) {
  console.log(value);
});

arrayStream.add('foo');
arrayStream.add('bar');*/

var obs = SceneSchema();

obs.subscribe(function(foo) {
  console.log(foo);
});


obs.fetch();
//new BackgroundLayer();
//SpriteSchema();



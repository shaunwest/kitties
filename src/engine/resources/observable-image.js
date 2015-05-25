/**
 * Created by Shaun on 5/1/14.
 */
import Rx from 'rx';

var IMAGE_WAIT_INTERVAL = 100;

function ImageLoader (image) {
  var onSuccess,
    onError;

  return {
    load: function(uri) {
      image.src = uri;

      var intervalId = setInterval(function() {
        if(image.complete) {
          clearInterval(intervalId);
          onSuccess(image);
        }
      }, IMAGE_WAIT_INTERVAL);

      image.onerror = function () {
        clearInterval(intervalId);
        onError();
      };
    },
    onLoad: function(success, error) {
      onSuccess = success;
      onError = error;
    }
  };
}

export default function ObservableImage (uri) {
  var observers = [];
  var imageLoader = ImageLoader(new Image());

  var observable = Rx.Observable.create(function (ob) {
    observers.push(ob);

    imageLoader.onLoad(function(image) {
      observers.forEach(function(observer) {
        observer.onNext(image);
      });
    }, function() {
      observers.forEach(function(observer) {
        observer.onError('Error loading image.');
      });
    });

    // cleanup
    return function () {
      observers.length = 0;
      observable = null;
      imageLoader = null;
      console.log('ObservableImage: disposed');
    };
  });

  return {
    fetch: function(newUri) {
      imageLoader.load(newUri || uri);
    },
    subscribe: function() {
      if(observable) {
        return observable.subscribe.apply(observable, arguments);
      }
    },
    kill: function() {
      observers.forEach(function(observer) {
        observer.onCompleted();
      });
    }
  }
}

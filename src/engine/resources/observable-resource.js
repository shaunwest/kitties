/**
 * Created by shaunwest on 5/23/15.
 */
import Rx from 'rx';

export default function ObservableResource (uri) {
  var observers = [],
    req = new XMLHttpRequest();

  req.onload = function () {
    var statusText = this.statusText,
      status = this.status,
      responseText = this.responseText,
      contentType = this.getResponseHeader('content-type') || '';

    if(this.status >= 300) {
      observers.forEach(function(observer) {
        observer.onError(statusText, status);
      });
    } else {
      observers.forEach(function(observer) {
        observer.onNext(parseResponse(contentType, responseText), status);
      });
    }
  };

  var observable = Rx.Observable.create(function (ob) {
    observers.push(ob);

    // cleanup
    return function () {
      observers.length = 0;;
      observable = null;
      req = null;
      console.log('ObservableResource: disposed');
    };
  });

  return {
    fetch: function () {
      if(req) {
        req.open('get', uri, true);
        req.send();
      }
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
  };
}

function parseResponse (contentType, responseText) {
  if(contentType.substr(0, 16) == 'application/json') {
    return JSON.parse(responseText);
  }
  return responseText;
}
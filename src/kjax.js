/**
 * Created by Shaun on 5/3/14.
 */

if(typeof CommonJS !== 'undefined') {
  kilo.register('Kjax', ['Util'], function(Util) {
    function parseResponse(contentType, responseText) {
      switch(contentType) {
        case 'application/json':
        case 'application/json; charset=utf-8':
          return JSON.parse(responseText);
        default:
          return responseText;
      }
    }

    function get(url, contentTypeOrOnProgress, onProgress) {
      var promise = new Promise(function(resolve, reject) {
        var req = http.request(url, function(res) {
          var data = '';

          if(Util.isFunction(contentTypeOrOnProgress)) {
            onProgress = contentTypeOrOnProgress;
            contentTypeOrOnProgress = null;
          }

          res.setEncoding('utf8');

          res.on('data', function (chunk) {
            data += chunk;
            if(onProgress) {
              onProgress(chunk.length, data.length);
            }
          });

          res.on('end', function() {
            var contentType = res.headers['content-type'];
            switch(res.statusCode) {
              case 500:
                reject({statusText: '', status: res.statusCode});
                break;
              case 404:
                reject({statusText: '', status: res.statusCode});
                break;
              case 304:
                resolve({data: parseResponse(contentType, data), status: res.statusCode});
                break;
              default:
                resolve({data: parseResponse(contentType, data), status: res.statusCode});
            }
          });
        });

        req.on('error', function(e) {
          console.log('problem with request: ' + e.message);
          console.log('URL: ' + url);
          reject('Network error.');
        });

        req.end();
      });

      return promise;
    }

    return {
      get: get
    };
  });
} else {
  register('Kjax', ['Util'], function(Util) {
    'use strict';

    function parseResponse (contentType, responseText) {
      if(contentType.substr(0, 16) == 'application/json') {
        return JSON.parse(responseText);
      }
      return responseText;
    }

    function get(url, contentTypeOrOnProgress, onProgress) {
      return new Promise(function(resolve, reject) {
        var req = new XMLHttpRequest();

        if(Util.isFunction(contentTypeOrOnProgress)) {
          onProgress = contentTypeOrOnProgress;
          contentTypeOrOnProgress = undefined;
        }

        if(onProgress) {
          req.addEventListener('progress', function(event) {
            onProgress(event.loaded, event.total);
          }, false);
        }

        req.onerror = function(event) {
          reject(Util.error('Network error.'));
        };

        req.onload = function() {
          var contentType = contentTypeOrOnProgress || this.getResponseHeader('content-type') || '';

          (this.status >= 300) ?
              reject({statusText: this.statusText, status: this.status}) :
              resolve({data: parseResponse(contentType, this.responseText), status: this.status});
        };

        req.open('get', url, true);
        req.send();
      });
    }

    return {
      get: get
    };
  });
}

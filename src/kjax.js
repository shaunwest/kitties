/**
 * Created by Shaun on 5/3/14.
 */
var promises = [],
  baseUrl = '';

function isFunction(obj) {
  return Object.prototype.toString.call(obj) == '[object Function]';
}

function parseResponse (contentType, responseText) {
  if(contentType.substr(0, 16) == 'application/json') {
    return JSON.parse(responseText);
  }
  return responseText;
}

export function requestGet(url, contentTypeOrOnProgress, onProgress) {
  var promise;

  if(url.substr(0, 7) !== 'http://' && url.substr(0, 8) !== 'https://') {
    url = baseUrl + url;
  }

  function getHandler(resolve, reject) {
    var req = new XMLHttpRequest();

    if (isFunction(contentTypeOrOnProgress)) {
      onProgress = contentTypeOrOnProgress;
      contentTypeOrOnProgress = undefined;
    }

    if (onProgress) {
      req.addEventListener('progress', function (event) {
        onProgress(event.loaded, event.total);
      }, false);
    }

    req.onerror = function (event) {
      reject('Network error.');
    };

    req.onload = function () {
      var contentType = contentTypeOrOnProgress || this.getResponseHeader('content-type') || '';
      (this.status >= 300) ?
        reject({statusText: this.statusText, status: this.status}) :
        resolve({data: parseResponse(contentType, this.responseText), status: this.status});
    };

    req.open('get', url, true);
    req.send();
  }

  promise = new Promise(getHandler);
  promises.push(promise);

  return promise;
}

export function purge() {
  promises.length = 0;
}

export function getPromises() {
  return promises;
}

function setBaseUrl(url) {
  baseUrl = url;
}

export default {
  requestGet: requestGet,
  purge: purge,
  setBaseUrl: setBaseUrl,
  getPromises: getPromises
};

/**
 * Created by Shaun on 3/1/15
 *
 */

register('StreamManager', [], function() {
  'use strict';

  var streams = {};

  function notify(uri) {
    if(!streams[uri]) {
      return;
    }

    streams[uri].forEach(function(stream) {
      stream.fetch();
    });
  }

  function attach(stream) {
    var uri = stream.uri;
    if(!streams[uri]) {
      streams[uri] = [];
    }
    streams[uri].push(stream);
  }

  return {
    notify: notify,
    attach: attach
  };
});
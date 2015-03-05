/**
 * Created by Shaun on 3/1/15
 *
 */

register('HttpResource', ['Util', 'Http', 'Resource'], function(Util, Http, Resource) {
  'use strict';

  return function (uri) {
    return Resource(uri, Http.get)
      .ready(
        function(response) {
          return response.data;
        }
      );
  };
});
/**
 * Created by Shaun on 3/1/15
 *
 */

register('resources.HttpResource', ['Util', 'Kjax', 'Resource'], function(Util, Kjax, Resource) {
  'use strict';

  return function (uri) {
    return Resource(uri, Kjax.get)
      .ready(
        function(response) {
          return response.data;
        }
      );
  };
});
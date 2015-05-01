/**
 * Created by shaunwest on 4/30/15.
 */

export function log() {
  var logValues = Array.prototype.slice.call(arguments);

  return function(target, name, descriptor) {
    var func = descriptor.value;

    descriptor.value = function() {
      var args = Array.prototype.slice.call(arguments);
      var result = func.apply(this, args);
      console.log.apply(console, logValues);
      return result;
    };
  };
}
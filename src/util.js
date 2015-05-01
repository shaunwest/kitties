/**
 * Created by Shaun on 4/23/2015.
 */

var types = ['Array', 'Object', 'Boolean', 'Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'];

var Util = {
  isDefined: function (value) { return typeof value != 'undefined' },
  def: function (value, defaultValue) { return (typeof value == 'undefined') ? defaultValue : value },
  error: function (message) { throw new Error(id + ': ' + message) },
  warn: function (message) { Util.log('Warning: ' + message) },
  log: function (message) { if(config.log) { console.log(id + ': ' + message) } },
  argsToArray: function (args) { return Array.prototype.slice.call(args) },
  rand: function (max, min) { // move to extra?
    min = min || 0;
    if(min > max) { Util.error('rand: invalid range.'); }
    return Math.floor((Math.random() * (max - min + 1))) + (min);
  }
};

for(var i = 0; i < types.length; i++) {
  Util['is' + types[i]] = (function(type) {
    return function(obj) {
      return Object.prototype.toString.call(obj) == '[object ' + type + ']';
    };
  })(types[i]);
}

export default Util;
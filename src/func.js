/**
 * Created by shaunwest on 7/8/15.
 */

export function flip (fn) {
  return function (...args) {
    return fn.apply(this, args.reverse());
  }
}

export function compose (...fns) {
  return function (result) {
    return fns.reduceRight(function (result, fn) {
      return fn.call(this, result);
    }, result);
  };
}

export var sequence = flip(compose);

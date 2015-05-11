/**
 * Created by shaunwest on 4/28/15.
 */

export default function (injected) {
  return function(target) {
    injected = (target._injected) ?
      injected.concat(target._injected) :
      injected;

    if(target._target) {
      target = target._target;
    }

    var newTarget = target.bind.apply(target, [null].concat(injected));
    newTarget._target = target;
    newTarget._injected = injected;
    return newTarget;
  };
}

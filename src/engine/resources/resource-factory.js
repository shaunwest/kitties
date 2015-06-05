/**
 * Created by shaunwest on 5/25/15.
 */

export default function ResourceFactory(val, resourceMethod) {
  var updateListener, store;

  function update() {
    store = resourceMethod(val);
    if(updateListener) {
      if(store.then) {
        store.then(function(data) {
          updateListener(data);
        });
      } else {
        updateListener(store);
      }
    }
  }

  return {
    get value() { return store; },
    update: update,
    onUpdate: function(cb) {
      updateListener = cb;
    },
    onKill: function(cb) {
      // IMPLEMENT ME
    }
  };
}
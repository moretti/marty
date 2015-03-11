var log = require('./logger');
var _ = require('./utils/mindash');

class StoreObserver {
  constructor(component, stores) {
    this.component = component;
    this.listeners = _.map(stores, (store) => {
      return this.listenToStore(store, component);
    });
  }

  dispose() {
    _.invoke(this.listeners, 'dispose');
  }

  listenToStore(store, component) {
    var storeDisplayName = store.displayName || store.id;

    log.trace(
      `The ${component.displayName} component  (${component.__id}) is listening to the ${storeDisplayName} store`
    );

    return store.for(component).addChangeListener((state, store) => {
      this.onStoreChanged(state, store, component);
    });
  }

  onStoreChanged(state, store, component) {
    var storeDisplayName = store.displayName || store.id;

    log.trace(
      `${storeDisplayName} store has changed. The ${component.displayName} component (${component.__id}) is updating`
    );

    if (component._lifeCycleState === 'UNMOUNTED') {
      log.warn(
        `Warning: Trying to set the state of ${component.displayName} component (${component.__id}) which is unmounted`
      );
    } else {
      component.setState(tryGetState(component, store));
    }
  }
}

function tryGetState(component, store) {
  var state = component.getState();
  var displayName = component.displayName || component.constructor.displayName;

  if (store && store.action) {
    store.action.addComponentHandler({
      displayName: displayName
    });
  }

  return state;
}

module.exports = StoreObserver;
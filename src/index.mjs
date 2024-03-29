import { createStore, applyMiddleware } from 'redux';
import _ from 'lodash';
import generateActions from './generateActions.mjs';

export default ({
  initialState,
  schemas = {},
  middlewares = [],
}) => {
  const actions = generateActions(initialState, schemas);

  const reducer = (state, action) => {
    if (actions[action.type]) {
      return actions[action.type](action.payload);
    }
    return state;
  };

  const store = createStore(
    reducer,
    initialState,
    applyMiddleware(...middlewares),
  );
  return {
    getState: () => store.getState(),
    dispatch: (key, value) => {
      if (!actions[key]) {
        throw new Error(`\`${key}\` unable dispatch`);
      }
      if (typeof value === 'function') {
        const pathList = key.split(/(?<!\\)\./).map((d) => d.replace(/\\\./g, '.'));
        store.dispatch({
          type: key,
          payload: value(_.get(store.getState(), pathList)),
        });
      } else {
        store.dispatch({
          type: key,
          payload: value,
        });
      }
    },
  };
};

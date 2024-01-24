import { createStore, applyMiddleware } from 'redux';
import generateDispatches from './generateDispatches.mjs';

export default ({
  initialState,
  schemas = {},
  middlewares = [],
}) => {
  const actions = generateDispatches(initialState, schemas);

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
      store.dispatch({
        type: key,
        payload: value,
      });
    },
  };
};

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
    dispatch: Object.keys(actions).reduce((acc, actionName) => ({
      ...acc,
      [actionName]: (value) => {
        store.dispatch({
          type: actionName,
          payload: value,
        });
      },
    }), {}),
  };
};

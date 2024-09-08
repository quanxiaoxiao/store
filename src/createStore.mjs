import { createStore, applyMiddleware } from 'redux';
import { getValueOfPathname } from '@quanxiaoxiao/utils';
import getReducer from './getReducer.mjs';

export default ({
  initialState,
  schemas = {},
  middlewares = [],
}) => {
  const [reducer, state] = getReducer(initialState, schemas);
  const store = createStore(
    reducer,
    state,
    applyMiddleware(...middlewares),
  );

  return {
    getState: () => store.getState(),
    dispatch: (key, value) => {
      if (typeof value === 'function') {
        const pre = getValueOfPathname(key)(store.getState());
        store.dispatch({
          type: key,
          payload: value(pre),
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

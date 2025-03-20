import {
  getValueOfPathname,
  hasDataKey,
} from '@quanxiaoxiao/utils';
import { applyMiddleware, createStore } from 'redux';

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
    getValue: (key) => {
      if (!hasDataKey(store.getStore(), key)) {
        throw new Error(`\`${key}\` unconfig`);
      }
      return getValueOfPathname(key)(store.getState());
    },
    getStore: () => store,
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

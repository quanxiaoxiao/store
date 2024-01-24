import { createStore, applyMiddleware } from 'redux';

const generateDispatch = (actions, store) => Object
  .keys(actions)
  .reduce((acc, actionName) => ({
    ...acc,
    [actionName]: (payload) => {
      if (typeof payload === 'function') {
        const ret = payload(store.getState());
        store.dispatch({
          type: actionName,
          payload: ret,
        });
      } else {
        store.dispatch({
          type: actionName,
          payload,
        });
      }
    },
  }), {});

export default ({
  initialState,
  actions,
  schemas = {},
  middlewares = [],
}) => {
  const reducer = (state, action) => {
    if (actions[action.type]) {
      return actions[action.type](state, action.payload);
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
    dispatch: generateDispatch(actions, store),
  };
};

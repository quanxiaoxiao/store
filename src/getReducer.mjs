import createStateDispatch from './createStateDispatch.mjs';

export default (initialState, schemas) => {
  const dispatch = createStateDispatch(initialState, schemas);
  const reducer = (state, action) => {
    return dispatch(action.type, action.payload);
  };
  return [reducer, initialState];
};

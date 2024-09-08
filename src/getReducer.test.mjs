import test from 'node:test';
import assert from 'node:assert';
import { createStore } from 'redux';
import getReducer from './getReducer.mjs';

test('getReducer', () => {
  const [reducer, state] = getReducer({ name: 'quan', obj: { foo: 'bar' } });
  const store = createStore(
    reducer,
    state,
  );
  store.dispatch({
    type: 'name',
    payload: 'cqq',
  });
  assert.deepEqual(
    store.getState(),
    {
       name: 'cqq', obj: { foo: 'bar' } ,
    },
  );
  store.dispatch({
    type: 'obj.foo',
    payload: 'ddd',
  });
  assert.deepEqual(
    store.getState(),
    {
       name: 'cqq', obj: { foo: 'ddd' } ,
    },
  );
  assert.throws(() => {
    store.dispatch({
      type: 'obj.aaa',
      payload: 'ddd',
    });
  });
  assert.deepEqual(
    store.getState(),
    {
       name: 'cqq', obj: { foo: 'ddd' } ,
    },
  );
});

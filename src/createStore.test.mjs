import test from 'node:test';
import assert from 'node:assert';
import createStore from './createStore.mjs';

test('createStore', () => {
  const store = createStore({
    initialState: { name: 'quan', obj: { foo: 'bar' } },
  });
  assert.deepEqual(
    { name: 'quan', obj: { foo: 'bar' } },
    store.getState(),
  );
  store.dispatch('obj.foo', 'abc');
  assert.deepEqual(
    { name: 'quan', obj: { foo: 'abc' } },
    store.getState(),
  );
  store.dispatch('obj.foo', (pre) => {
    assert.equal(pre, 'abc');
    return `${pre}${pre}`;
  });
  assert.deepEqual(
    { name: 'quan', obj: { foo: 'abcabc' } },
    store.getState(),
  );
});

test('createStore', () => {
  const store = createStore({
    initialState: { name: 'quan', age: 33 },
    schemas: {
      age: {
        type: 'integer',
        minimum: 18,
      },
    },
  });
  assert.throws(() => {
    store.dispatch('age', 17);
  });
  assert.deepEqual(
    { name: 'quan', age: 33 },
    store.getState(),
  );
  store.dispatch('age', (pre) => pre + 8);
  assert.deepEqual(
    { name: 'quan', age: 41 },
    store.getState(),
  );
  assert.throws(() => {
    store.dispatch('age', (pre) => pre - 30);
  });
  assert.deepEqual(
    { name: 'quan', age: 41 },
    store.getState(),
  );
});

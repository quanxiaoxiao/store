import assert from 'node:assert';
import test from 'node:test';

import createStateDispatch from './createStateDispatch.mjs';

test('createStateDispatch invalid schema invalid', () => {
  assert.throws(() => {
    createStateDispatch(
      {
        age: '33',
      },
      {
        age: {
          type: 'number',
        },
      },
    );
  }, (error) => /^`age`/.test(error.message));
  assert.throws(() => {
    createStateDispatch(
      {
        age: 33,
        obj: {
          big: 66,
        },
      },
      {
        'obj.big': {
          type: 'string',
        },
      },
    );
  }, (error) => /^`obj\.big`/.test(error.message));
});

test('createStateDispatch 1', () => {
  const dispatch = createStateDispatch({
    name: 'aaa',
    'a.b': 'ccc',
    a: {
      b: 'ddd',
    },
    age: 33,
  });
  assert.equal(typeof dispatch, 'function');
  let state = dispatch('name', 'cqq');
  assert.deepEqual(
    state,
    {
      name: 'cqq',
      'a.b': 'ccc',
      a: {
        b: 'ddd',
      },
      age: 33,
    },
  );
  state = dispatch('a.b', '0');
  assert.deepEqual(
    state,
    {
      name: 'cqq',
      'a.b': 'ccc',
      a: {
        b: '0',
      },
      age: 33,
    },
  );
  state = dispatch('a\\.b', '2');
  assert.deepEqual(
    state,
    {
      name: 'cqq',
      'a.b': '2',
      a: {
        b: '0',
      },
      age: 33,
    },
  );
  state = dispatch('age', 18);
  assert.deepEqual(
    state,
    {
      name: 'cqq',
      'a.b': '2',
      a: {
        b: '0',
      },
      age: 18,
    },
  );
  assert.throws(() => {
    dispatch('abcd', 'ccc');
  });
  assert.throws(() => {
    dispatch('name.bb', 'ccc');
  });
  state = dispatch('age', (pre) => {
    assert.equal(pre, 18);
    return pre + 2;
  });
  assert.deepEqual(
    state,
    {
      name: 'cqq',
      'a.b': '2',
      a: {
        b: '0',
      },
      age: 20,
    },
  );
  state = dispatch('a.b', (pre) => {
    assert.equal(pre, '0');
    return `aa${pre}cc`;
  });
  assert.deepEqual(
    state,
    {
      name: 'cqq',
      'a.b': '2',
      a: {
        b: 'aa0cc',
      },
      age: 20,
    },
  );
});

test('createStateDispatch 33', () => {
  const dispatch = createStateDispatch({
    name: 'aaa',
    age: 33,
    obj: {
      name: 'sub',
    },
  });
  let state = dispatch('obj.name', 'ccc');
  assert.deepEqual(
    state,
    {
      name: 'aaa',
      age: 33,
      obj: {
        name: 'ccc',
      },
    },
  );
  assert.throws(() => {
    dispatch('obj.age', 66);
  });
  state = dispatch('obj', { age: 66 });
  assert.deepEqual(
    state,
    {
      name: 'aaa',
      age: 33,
      obj: {
        age: 66,
      },
    },
  );
  assert.throws(() => {
    dispatch('obj.name', 'bbb');
  });
  state = dispatch('obj.age', 99);
  assert.deepEqual(
    state,
    {
      name: 'aaa',
      age: 33,
      obj: {
        age: 99,
      },
    },
  );
});

test('createStateDispatch 3', () => {
  const dispatch = createStateDispatch(
    {
      name: 'abc',
      age: 28,
    },
    {
      age: {
        type: 'integer',
        minimum: 26,
        maximum: 55,
      },
    },
  );
  let state = dispatch();
  assert.deepEqual(
    state,
    {
      name: 'abc',
      age: 28,
    },
  );
  state = dispatch('age', 44);
  assert.deepEqual(
    state,
    {
      name: 'abc',
      age: 44,
    },
  );
  assert.throws(
    () => {
      dispatch('age', 20);
    },
    (error) => /^`age`/.test(error.message),
  );
  state = dispatch('age', 31);
  assert.deepEqual(
    state,
    {
      name: 'abc',
      age: 31,
    },
  );
});

test('createStateDispatch deep state 1', () => {
  let state = {
    name: 'aaa',
    obj: {
      foo: {
        tt: 'cc',
        name: 'bbb',
      },
    },
  };
  const dispatch = createStateDispatch(state);
  state = dispatch('obj.foo.tt', 'jj');
  assert.equal(state.obj.foo.tt, 'jj');
  assert.equal(state.obj.foo.name, 'bbb');
  state = dispatch('obj', null);
  assert.equal(state.obj, null);
  assert.throws(
    () => {
      dispatch('obj.foo.tt', 'jj');
    },
    (error) => /^`obj\.foo\.tt`/.test(error.message),
  );
  assert.throws(
    () => {
      dispatch('obj.foo', 'xxx');
    },
    (error) => /^`obj\.foo`/.test(error.message),
  );
  state = dispatch('obj', 'ccc');
  assert.deepEqual(state, {
    name: 'aaa',
    obj: 'ccc',
  });
  assert.throws(
    () => {
      dispatch('obj.foo', 'xxx');
    },
    (error) => /^`obj\.foo`/.test(error.message),
  );
  state = dispatch('obj', {
    foo: 'bar',
  });
  assert.deepEqual(state, {
    name: 'aaa',
    obj: {
      foo: 'bar',
    },
  });
  assert.throws(() => {
    dispatch('obj.ding', '999');
  });
  state = dispatch('obj.foo', '999');
  assert.deepEqual(state, {
    name: 'aaa',
    obj: {
      foo: '999',
    },
  });
});

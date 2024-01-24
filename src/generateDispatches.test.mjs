import test from 'node:test';
import assert from 'node:assert';
import generateDispatches from './generateDispatches.mjs';

test('generateDispatches return empty', () => {
  assert.deepEqual(generateDispatches(null), {});
  assert.deepEqual(generateDispatches(1), {});
  assert.deepEqual(generateDispatches({}), {});
  assert.deepEqual(generateDispatches(['aaa']), {});
  assert.deepEqual(generateDispatches([{ name: 'aaa' }]), {});
  assert.deepEqual(generateDispatches('aaa'), {});
});

test('generateDispatches 1', () => {
  const state = {
    name: 'aaa',
    'a.b': 'ccc',
    a: {
      b: 'ddd',
    },
    age: 33,
  };
  const dispatches = generateDispatches(state);
  assert.equal(typeof dispatches.name, 'function');
  assert.equal(typeof dispatches.age, 'function');
  dispatches.name('cqq');
  assert.equal(state.name, 'cqq');
  assert.equal(state.age, 33);
  dispatches['a.b']('0');
  dispatches['a\\.b']('2');
  assert.equal(state.a.b, '0');
  assert.equal(state['a.b'], '2');
});

test('generateDispatches 2', () => {
  const state = {
    name: 'aaa',
    obj: {
      name: 'bbb',
    },
  };
  const dispatches = generateDispatches(state);
  dispatches['obj.name']('cqq');
  assert.equal(state.obj.name, 'cqq');
  assert.equal(state.name, 'aaa');
  dispatches.obj(null);
  assert.equal(state.obj, null);
  assert.equal(state.name, 'aaa');
  assert.equal(typeof dispatches['obj.name'], 'undefined');
  dispatches.obj({
    foo: 'bar',
  });
  assert.equal(typeof dispatches['obj.name'], 'undefined');
  assert.equal(typeof dispatches['obj.foo'], 'function');
  assert.equal(state.obj.foo, 'bar');
  dispatches['obj.foo']('cqqq');
  assert.equal(state.obj.foo, 'cqqq');
});

test('generateDispatches deep state 1', () => {
  const state = {
    name: 'aaa',
    obj: {
      foo: {
        tt: 'cc',
        name: 'bbb',
      },
    },
  };
  const dispatches = generateDispatches(state);
  assert.equal(typeof dispatches['obj.name'], 'undefined');
  assert.equal(typeof dispatches['obj.foo'], 'function');
  assert.equal(typeof dispatches['obj.foo.name'], 'function');
  dispatches['obj.foo.tt']('jj');
  assert.equal(state.obj.foo.tt, 'jj');
  assert.equal(state.obj.foo.name, 'bbb');
  dispatches.obj(null);
  assert.equal(typeof dispatches.obj, 'function');
  assert.equal(typeof dispatches['obj.foo'], 'undefined');
  assert.equal(typeof dispatches['obj.foo.tt'], 'undefined');
  assert.equal(typeof dispatches['obj.foo.name'], 'undefined');
});

test('generateDispatches deep state 2', () => {
  const state = {
    name: 'aaa',
    obj: {
      ding: 'xxx',
      foo: {
        tt: 'cc',
        name: 'bbb',
      },
    },
    big: null,
  };
  const dispatches = generateDispatches(state);
  dispatches.obj({ ding: 'eee', foo: null });
  assert.equal(state.obj.ding, 'eee');
  assert.equal(state.obj.foo, null);
  assert.equal(typeof dispatches['obj.foo.tt'], 'undefined');
  assert.equal(typeof dispatches['obj.foo.name'], 'undefined');
  dispatches.obj({ foo: { tt: '999', name: '888' } });
  assert.equal(typeof dispatches['obj.foo.tt'], 'function');
  assert.equal(typeof dispatches['obj.foo.name'], 'function');
  assert.equal(typeof dispatches['obj.ding'], 'undefined');
  dispatches.big({ cqq: { aa: 'bb', cc: 'dd' } });
  assert.equal(typeof dispatches['big.cqq'], 'function');
  assert.equal(typeof dispatches['big.cqq.aa'], 'function');
  assert.equal(typeof dispatches['big.cqq.cc'], 'function');
  assert.deepEqual(state.big.cqq, { aa: 'bb', cc: 'dd' });
});

test('generateDispatches schema', () => {
  const state = {
    name: 'aaa',
    obj: {
      name: 'aaa',
      age: 33,
    },
    arr1: [1, 2, 3],
  };
  assert.throws(() => {
    generateDispatches(state, {
      name: {
        type: 'number',
      },
    });
  });

  const dispatches = generateDispatches(state, {
    name: {
      type: 'string',
      nullable: true,
    },
    obj: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
        age: {
          type: 'integer',
          maximum: 99,
          minimum: 5,
        },
      },
      required: ['name'],
    },
  });
  assert.throws(() => {
    dispatches.name(1);
  });
  assert.equal(state.name, 'aaa');
  dispatches.name('bbb');
  assert.equal(state.name, 'bbb');
  dispatches.name(null);
  assert.equal(state.name, null);
  assert.throws(() => {
    dispatches.obj({
      name: 'aaa',
      age: 4,
    });
  });
  assert.throws(() => {
    dispatches.obj({
      age: 44,
    });
  });
  assert.throws(() => {
    dispatches.obj(null);
  });
  assert.throws(() => {
    dispatches.obj({
      name: 999,
    });
  });
  dispatches.obj({
    name: 'ccc',
  });
  assert.equal(state.obj.name, 'ccc');
  assert(state.obj.age == null);
  dispatches.obj({
    name: 'eee',
    age: 77,
  });
  assert.equal(state.obj.name, 'eee');
  assert.equal(state.obj.age, 77);
  assert.throws(() => {
    dispatches['obj.name'](999);
  });
});

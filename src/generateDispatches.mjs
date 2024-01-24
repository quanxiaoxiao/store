import _ from 'lodash';
import Ajv from 'ajv';

const removeChildrenDispatches = (dispatches, dispatchName) => {
  Object.keys(dispatches)
    .forEach((name) => {
      if (name !== dispatchName
        && name.indexOf(`${dispatchName}.`) === 0
      ) {
        delete dispatches[name];
      }
    });
};

const walk = (
  state,
  dispatches,
  pathList,
  schemas,
  root,
) => {
  const nameList = Object.keys(state);
  for (let i = 0; i < nameList.length; i++) {
    const name = nameList[i];
    const dispatchName = [...pathList, name.replace(/\./g, '\\.')].join('.');
    if (schemas[dispatchName]) {
      schemas[dispatchName](state[name]);
    }

    dispatches[dispatchName] = (valueNext) => {
      if (schemas[dispatchName]) {
        schemas[dispatchName](valueNext);
      } else {
        let j = pathList.length;
        while (j > 0) {
          const validateKey = pathList.slice(0, j).join('.');
          if (schemas[validateKey]) {
            console.log(_.get(root, pathList.slice(0, j)));
            schemas[validateKey](_.get(root, pathList.slice(0, j)));
            break;
          }
          j--;
        }
      }
      const valuePrev = state[name];
      state[name] = valueNext;
      if (_.isPlainObject(valuePrev)) {
        removeChildrenDispatches(dispatches, dispatchName);
      }
      if (_.isPlainObject(valueNext)) {
        walk(
          state,
          dispatches,
          pathList,
          schemas,
          root,
        );
      }
    };
    const value = state[name];
    if (_.isPlainObject(value)) {
      walk(
        value,
        dispatches,
        [...pathList, name],
        schemas,
        root,
      );
    }
  }
};

export default (
  state,
  schemas = {},
) => {
  if (!_.isPlainObject(state)) {
    return {};
  }
  const dispatches = {};
  const pathList = [];
  const validates = {};
  const validatePathnameList = Object.keys(schemas);

  for (let i = 0; i < validatePathnameList.length; i++) {
    const pathname = validatePathnameList[i];
    const schema = schemas[pathname];
    const ajv = new Ajv();
    const validate = ajv.compile(schema);
    validates[pathname] = (v) => {
      if (!validate(v)) {
        throw new Error(`\`${pathname}\` invalid, \`${JSON.stringify(validate.errors)}\``);
      }
    };
  }

  walk(
    state,
    dispatches,
    pathList,
    validates,
    state,
  );
  return dispatches;
};

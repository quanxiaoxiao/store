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
  schemas,
  pathList,
) => {
  const depth = _.isEmpty(pathList) ? 0 : pathList.length;
  const obj = _.isEmpty(pathList) ? state : _.get(state, pathList);
  const dataKeyList = Object.keys(obj);
  for (let i = 0; i < dataKeyList.length; i++) {
    const dataKey = dataKeyList[i];
    const value = obj[dataKey];
    const currentPathList = [...pathList || [], dataKey];
    const dispatchName = currentPathList.map((s) => s.replace(/\./g, '\\.')).join('.');
    if (schemas[dispatchName]) {
      schemas[dispatchName](value);
    }
    dispatches[dispatchName] = (valueNext) => {
      if (schemas[dispatchName]) {
        schemas[dispatchName](valueNext);
      }
      const valuePrev = _.get(state, currentPathList);
      if (_.isPlainObject(valuePrev)) {
        removeChildrenDispatches(dispatches, dispatchName);
      }
      if (!schemas[dispatchName]) {
        let j = depth;
        let temp = {
          ..._.get(state, currentPathList.slice(0, depth)),
          [dataKey]: valueNext,
        };
        while (j > 0) {
          const validateKey = currentPathList.slice(0, j).map((s) => s.replace(/\./g, '\\.')).join('.');
          if (j !== depth) {
            temp = {
              ...temp,
              [currentPathList[j]]: _.get(state, currentPathList.slice(0, j)),
            };
          }
          if (schemas[validateKey]) {
            schemas[validateKey](temp);
            break;
          }
          j--;
        }
      }
      _.set(state, currentPathList, valueNext);
      if (_.isPlainObject(valueNext)) {
        walk(
          state,
          dispatches,
          schemas,
          currentPathList,
        );
      }
    };
    if (_.isPlainObject(value)) {
      walk(
        state,
        dispatches,
        schemas,
        currentPathList,
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
    validates,
  );
  return dispatches;
};

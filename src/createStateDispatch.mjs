import _ from 'lodash';
import Ajv from 'ajv';

const checkValid = (validates) => (key, value) => {
  if (validates[key] && !validates[key](value)) {
    throw new Error(`\`${key}\` invalid, \`${JSON.stringify(validates[key].errors)}\``);
  }
};

const convertActionName = (arr) => arr.map((str) => str.replace(/\./g, '\\.')).join('.');

const setValue = (data, value, pathList) => {
  if (pathList.length === 0) {
    return value;
  }
  const [firstKey, ...other] = pathList;
  return {
    ...data,
    [firstKey]: setValue(data[firstKey], value, other),
  };
};

const generateActionHandlerList = (state, pathList = []) => {
  if (!_.isPlainObject(state)) {
    return [];
  }
  const result = [];
  const keys = Object.keys(state);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = state[key];
    const currentPathList = [...pathList, key];
    result.push({
      actionName: convertActionName(currentPathList),
      pathList: currentPathList,
    });
    if (_.isPlainObject(value)) {
      result.push(...generateActionHandlerList(value, currentPathList));
    }
  }
  return result;
};

export default (
  initialState,
  schemas,
) => {
  const validates = {};

  if (schemas) {
    const validatePathnameList = Object.keys(schemas);
    for (let i = 0; i < validatePathnameList.length; i++) {
      const pathname = validatePathnameList[i];
      const schema = schemas[pathname];
      validates[pathname] = new Ajv().compile(schema);
    }
  }

  let handlerList = generateActionHandlerList(initialState);

  let _state  = handlerList.reduce((acc, cur) => {
    const value = _.get(acc, cur.pathList);
    checkValid(validates)(cur.actionName, value);
    return setValue(acc, value, cur.pathList);
  }, initialState);

  return (actionName, dataNext) => {
    if (actionName == null) {
      return _state;
    }
    const handlerItem = handlerList.find((d) => d.actionName === actionName);
    if (!handlerItem) {
      if (/^@@redux\//.test(actionName)) {
        return _state;
      }
      throw new Error(`\`${actionName}\` unkonw action`);
    }
    const currentPathList = handlerItem.pathList;
    if (typeof dataNext === 'function') {
      const dataPrev = _.get(_state, currentPathList);
      const dataNextResult = dataNext(dataPrev);
      checkValid(validates)(handlerItem.actionName, dataNextResult);
      _state = setValue(_state, dataNextResult, currentPathList);
      handlerList = [
        ...handlerList.filter((d) => d.actionName.indexOf(`${actionName}.`) !== 0),
        ...generateActionHandlerList(dataNextResult, currentPathList),
      ];
      return _state;
    }
    checkValid(validates)(handlerItem.actionName, dataNext);
    _state = setValue(_state, dataNext, currentPathList);
    handlerList = [
      ...handlerList.filter((d) => d.actionName.indexOf(`${actionName}.`) !== 0),
      ...generateActionHandlerList(dataNext, currentPathList),
    ];
    return _state;
  };
};

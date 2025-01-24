import { getValueOfPathList } from '@quanxiaoxiao/utils';
import Ajv from 'ajv';
import _ from 'lodash';

const validateStateChange = (validates) => (key, value) => {
  if (validates[key] && !validates[key](value)) {
    throw new Error(`\`${key}\` invalid, \`${JSON.stringify(validates[key].errors)}\``);
  }
};

const convertActionName = (arr) => arr.map((str) => str.replace(/\./g, '\\.')).join('.');

const updateNestedState = (data, value, pathList) => {
  if (pathList.length === 0) {
    return value;
  }
  const [firstKey, ...other] = pathList;
  return {
    ...data,
    [firstKey]: updateNestedState(data[firstKey], value, other),
  };
};

const createActionHandlers = (state, pathList = []) => {
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
      result.push(...createActionHandlers(value, currentPathList));
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

  let actionHandlerList = createActionHandlers(initialState);

  let _state  = actionHandlerList.reduce((acc, cur) => {
    const value = getValueOfPathList(cur.pathList)(acc);
    validateStateChange(validates)(cur.actionName, value);
    return updateNestedState(acc, value, cur.pathList);
  }, initialState);

  return (actionName, dataNext) => {
    if (actionName == null) {
      return _state;
    }
    const handlerItem = actionHandlerList.find((d) => d.actionName === actionName);
    if (!handlerItem) {
      if (/^@@redux\//.test(actionName)) {
        return _state;
      }
      throw new Error(`\`${actionName}\` unkonw action`);
    }
    const currentPathList = handlerItem.pathList;
    if (typeof dataNext === 'function') {
      const dataPrev = getValueOfPathList(currentPathList)(_state);
      const dataNextResult = dataNext(dataPrev);
      if (dataPrev === dataNextResult) {
        return _state;
      }
      validateStateChange(validates)(handlerItem.actionName, dataNextResult);
      _state = updateNestedState(_state, dataNextResult, currentPathList);
      actionHandlerList = [
        ...actionHandlerList.filter((d) => d.actionName.indexOf(`${actionName}.`) !== 0),
        ...createActionHandlers(dataNextResult, currentPathList),
      ];
      return _state;
    }
    validateStateChange(validates)(handlerItem.actionName, dataNext);
    _state = updateNestedState(_state, dataNext, currentPathList);
    actionHandlerList = [
      ...actionHandlerList.filter((d) => d.actionName.indexOf(`${actionName}.`) !== 0),
      ...createActionHandlers(dataNext, currentPathList),
    ];
    return _state;
  };
};

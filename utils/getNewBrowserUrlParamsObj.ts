import { TStateToQsConverters } from 'frontendReact/hooks/useUrlSync/v1.0/useUrlSync';
import { TMapper, TPickRenameMulti } from 'frontendReact/types/object';
import { renameFieldInObject } from 'frontendReact/utils/object/renameFieldInObject';

export const getNewBrowserUrlParamsObj = <State, Mapper extends TMapper<State, Mapper>>(
  formStateInitial: State,
  storeToUrlConverters: TStateToQsConverters<State> = {},
  nameMapper: Partial<Mapper> = {}
): TPickRenameMulti<State, Mapper> => {
  let queryStringParamsObj = { ...formStateInitial };

  Object.keys(queryStringParamsObj).forEach((key) => {
    if (storeToUrlConverters[key]) {
      queryStringParamsObj[key] = storeToUrlConverters[key](queryStringParamsObj[key]);
    }
    if (nameMapper[key]) {
      queryStringParamsObj = renameFieldInObject(queryStringParamsObj, key, nameMapper[key]);
    }
  });

  return queryStringParamsObj as TPickRenameMulti<State, Mapper>;
};

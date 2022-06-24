import { getNewBrowserUrlParamsObj } from 'frontendReact/hooks/useUrlSync/v1.0/utils/getNewBrowserUrlParamsObj';
import { stringifyQS } from 'frontendReact/utils/qs/stringifyQS';
import { TStateToQsConverters } from 'frontendReact/hooks/useUrlSync/v1.0/useUrlSync';
import { TMapper } from 'frontendReact/types/object';
import { updateQS } from 'frontendReact/utils/qs/updateQS';
import { IBrowserUrlParams } from 'frontendReact/utils/url';

export const getUpdateUrlString = <State, Mapper extends TMapper<State, Mapper>>(
  formState: State,
  storeToUrlConverters: TStateToQsConverters<State> = {},
  stateNameToUrlParamNameMap: Partial<Mapper> = {},
  replaceQueryParams = true,
  stringifyConfig: any = {}
): string => {
  let locationSearch = `${window.location.pathname}?`;
  const newParams = getNewBrowserUrlParamsObj(
    formState,
    storeToUrlConverters,
    stateNameToUrlParamNameMap
  );

  if (replaceQueryParams) {
    locationSearch += stringifyQS(newParams);
  } else {
    locationSearch += updateQS(newParams as IBrowserUrlParams, undefined, stringifyConfig);
  }

  return locationSearch;
};

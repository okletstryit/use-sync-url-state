/**
 * @fileoverview
 *
 * update browser url using serialized form state
 * watch back and forward browser events and run callback with a new form state (from url)
 * returns object with 2 functions: urlUpdater and fillStoreFromUrl
 */
 import qs from 'qs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import invert from 'lodash/invert';
import { getUpdateUrlString } from './utils/getUpdateUrlString';
import {
  TMapper,
  TPickRenameMulti,
  TReversedMapper,
  TReverseObj,
} from './types';
import { useSetState } from 'react-use';

export const getParsedQueryString = () => {
  return qs.parse(window.location.search, {
    ignoreQueryPrefix: true,
  });
};

export const renameFieldInObject = (object: any, oldFieldName: string, newFieldName: string) => {
  const newItem = { ...object };
  newItem[newFieldName] = object[oldFieldName];
  delete newItem[oldFieldName];
  return newItem;
};

export const getStateFromQsAsync = async <State, Mapper extends TReversedMapper<State> = {}>(
  state: State,
  qsToStateConverters: TQsToStateConverters<State, TReverseObj<Mapper>> = {},
  urlParamNameToStateNameMap: Partial<Mapper> = {}
): Promise<State> => {
  const queryParams: Record<string, any> = getParsedQueryString();
  let result = await runConverters({ ...queryParams }, qsToStateConverters);
  result = renameKeys(
    result,
    urlParamNameToStateNameMap as { [key in keyof typeof result]: keyof State }
  ) as Partial<State>;
  result = castObjectToForm(result, state);
  return result as State;
};


export const renameKeys = <Data, Mapper extends TMapper<Data, Mapper>>(
  data: Data,
  namesMapFromTo: Mapper
): TPickRenameMulti<Data, Mapper> => {
  let result = { ...data };
  Object.keys(result).forEach((key) => {
    if (namesMapFromTo[key]) {
      result = renameFieldInObject(result, key, namesMapFromTo[key]);
    }
  });
  return result as TPickRenameMulti<Data, Mapper>;
};


const runConverters = async <QsState>(
  data: QsState,
  urlParamToStoreConverters: TQsToStateConverters<QsState>
): Promise<Partial<QsState>> => {
  const result = { ...data };
  await Promise.all(
    Object.keys(urlParamToStoreConverters).map(async (urlParamName) => {
      if (result[urlParamName] === undefined) {
        return true;
      }
      try {
        result[urlParamName] = await urlParamToStoreConverters[urlParamName](result[urlParamName]);
        return result[urlParamName];
      } catch (e) {
        console.warn(`Error in transformer for param ${urlParamName}: ${e.message}`, e);
        return true;
      }
    })
  );
  return result;
};

// It leaves only needed fields in object. It gets them from example object
export const castObjectToForm = <ObjectForm>(
  targetObj: ObjectForm,
  exampleObj: ObjectForm
): ObjectForm => {
  const newObj = { ...targetObj };
  const fieldsToSave = Object.keys(exampleObj);

  Object.keys(newObj).forEach((key) => {
    if (!fieldsToSave.includes(key)) {
      delete newObj[key];
    }
  });
  return newObj;
};

export type TQsToStateConverters<State, Mapper = {}> = {
  [key in keyof TPickRenameMulti<State, Mapper>]?: (
    stateField: string | string[]
  ) => TPickRenameMulti<State, Mapper>[key] | Promise<TPickRenameMulti<State, Mapper>[key]>;
};

export type TStateToQsConverters<State> = {
  [key in keyof State]?: (stateField: State[key]) => string | number | Array<string | number>;
};

interface IUrlSyncParams<State, Mapper extends TReversedMapper<State>> {
  initialState: State;
  qsToStateConverters?: TQsToStateConverters<State, TReverseObj<Mapper>>;
  stateToQsConverters?: TStateToQsConverters<State>;
  qsToStateMapper?: Partial<Mapper>;
  replaceQueryParams?: boolean;
}

export const useUrlSync = <State extends Object, Mapper extends TReversedMapper<State> = {}>({
  initialState,
  qsToStateConverters = {},
  stateToQsConverters = {},
  qsToStateMapper = {},
  replaceQueryParams = true,
}: IUrlSyncParams<State, Mapper>) => {
  const [urlState, setUrlState] = useSetState<State>({ ...initialState });
  const [isReady, setIsReady] = useState(false);

  const parseUrl = useCallback(async () => {
    const data = await getStateFromQsAsync(urlState, qsToStateConverters, qsToStateMapper);
    setUrlState({ ...data });
    setIsReady(true);
  }, [qsToStateConverters, qsToStateMapper]);

  useEffect(() => {
    parseUrl();
  }, []);

  const updateUrl = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-shadow
    (urlState) => {
      window.history.replaceState(
        {},
        document.title,
        getUpdateUrlString(
          urlState,
          stateToQsConverters,
          invert(qsToStateMapper),
          replaceQueryParams
        )
      );
    },
    [urlState, stateToQsConverters, qsToStateMapper]
  );

  return useMemo(
    () => ({
      isReady,
      updateUrl,
      setUrlState,
      urlState,
    }),
    [updateUrl, isReady]
  );
};

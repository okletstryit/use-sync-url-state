/**
 * @fileoverview
 *
 * update browser url using serialized form state
 * watch back and forward browser events and run callback with a new form state (from url)
 * returns object with 2 functions: urlUpdater and fillStoreFromUrl
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import invert from 'lodash/invert';
import { getUpdateUrlString } from 'frontendReact/hooks/useUrlSync/v1.0/utils/getUpdateUrlString';
import { getStateFromQsAsync } from 'frontendReact/utils/qs/getStateFromQsAsync';
import {
  TMapper,
  TPickRenameMulti,
  TReversedMapper,
  TReverseObj,
} from 'frontendReact/types/object';
import { useSetState } from 'react-use';

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

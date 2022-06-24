export type TObjToKeyValue<T> = { [K in keyof T]: [K, T[K]] }[keyof T];

export type TKeyValueToObj<KV extends [keyof any, any]> = {
  [K in KV[0]]: KV extends [K, infer V] ? V : never;
};

export type TReverseTuple<KV extends [any, any]> = KV extends [any, any]
  ? [KV[1], KV[0]]
  : never;

export type TReverseObj<T extends Record<keyof T, keyof any>> = TKeyValueToObj<
  TReverseTuple<TObjToKeyValue<T>>
>;

export type TUnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

export type TMapper<State, Mapper> = Partial<
  {
    [key in keyof Mapper]: key extends keyof State ? PropertyKey : never;
  }
>;

export type TPickRenameMulti<
  State,
  Mapper extends TMapper<State, Mapper>
> = Omit<State, keyof Mapper> &
  TUnionToIntersection<
    {
      [key in keyof Mapper & keyof State]: {
        [revertKey in Mapper[key]]: State[key];
      };
    }[keyof Mapper & keyof State]
  >;

export type TReversedMapper<State> = Partial<
  { [key in PropertyKey]: keyof State }
>;
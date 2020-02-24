export type SyncCondition = (() => boolean) | boolean;
export type AsyncCondition =
  | (() => Promise<boolean>)
  | Promise<boolean>
  | (() => boolean)
  | boolean;

export type SyncValue<V> = (() => V) | V;
export type AsyncValue<V> = (() => Promise<V>) | Promise<V> | (() => V) | V;

export interface BranchState<Cond, Val> {
  condition: Cond;
  value: Val;
}

export type SyncCondition = (() => boolean) | boolean;
export type AsyncCondition = (() => Promise<boolean>) | Promise<boolean>;

export type SyncValue<V> = (() => V) | V;
export type AsyncValue<V> = (() => Promise<V>) | Promise<V>;

export interface BranchState<Cond, Val> {
  condition: Cond;
  value: Val;
}

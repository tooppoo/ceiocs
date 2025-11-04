import type { MaybeAsync, MaybeCallable, MustSync } from "../../common/value-type";

export type SyncCondition = MaybeCallable<boolean>;
export type AsyncableCondition = MaybeCallable<MaybeAsync<boolean>>;

export type SyncValue<V> = MustSync<V, MaybeCallable<V>>;
export type AsyncableValue<V> = MaybeCallable<MaybeAsync<V>>;

export interface BranchState<Cond, Val> {
  condition: Cond;
  value: Val;
}

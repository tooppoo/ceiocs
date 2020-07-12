import { MaybeAsync, MaybeCallable } from '@common/value-type'

export type SyncCondition = MaybeCallable<boolean>;
export type AsyncableCondition = MaybeCallable<MaybeAsync<boolean>>

export type SyncValue<V> = (() => V) | V;
export type AsyncableValue<V> = SyncValue<MaybeAsync<V>>

export interface BranchState<Cond, Val> {
  condition: Cond;
  value: Val;
}

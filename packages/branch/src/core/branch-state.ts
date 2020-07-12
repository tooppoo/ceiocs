import { MaybeAsync } from '@common/value-type'

export type SyncCondition = (() => boolean) | boolean;
export type AsyncCondition = (() => Promise<boolean>) | Promise<boolean>;

export type SyncValue<V> = (() => V) | V;

export type AsyncableValue<V> = SyncValue<MaybeAsync<V>>

export interface BranchState<Cond, Val> {
  condition: Cond;
  value: Val;
}

import {
  SyncCondition,
  AsyncCondition,
  SyncValue,
  AsyncValue
} from "./branch-state";
import { SyncBranchBody, AsyncBranchBody } from "./branch-body";

interface AsyncIfThen {
  then<Val>(value: AsyncValue<Val>): AsyncBranchBody<Val>;
}
export class AsyncBranchHead {
  if(condition: AsyncCondition): AsyncIfThen;
  if<Val>(
    condition: AsyncCondition,
    value: AsyncValue<Val>
  ): AsyncBranchBody<Val>;
  if<Val>(
    condition: AsyncCondition,
    value?: AsyncValue<Val>
  ): AsyncBranchBody<Val> | AsyncIfThen {
    if (!value) {
      return {
        then: <V>(lazyVal: AsyncValue<V>): AsyncBranchBody<V> =>
          this.next(condition, lazyVal)
      };
    }

    return this.next(condition, value);
  }

  protected next<V>(
    condition: AsyncCondition,
    value: AsyncValue<V>
  ): AsyncBranchBody<V> {
    return new AsyncBranchBody([{ condition, value }]);
  }
}

interface SyncIfThen {
  then<Val>(value: SyncValue<Val>): SyncBranchBody<Val>;
}
export class SyncBranchHead {
  if(condition: SyncCondition): SyncIfThen;
  if<Val>(condition: SyncCondition, value: SyncValue<Val>): SyncBranchBody<Val>;
  if<Val>(
    condition: SyncCondition,
    value?: SyncValue<Val>
  ): SyncBranchBody<Val> | SyncIfThen {
    if (!value) {
      return {
        then: <V>(lazyVal: SyncValue<V>): SyncBranchBody<V> =>
          this.next(condition, lazyVal)
      };
    }

    return this.next(condition, value);
  }

  get async(): AsyncBranchHead {
    return new AsyncBranchHead();
  }

  protected next<V>(
    condition: SyncCondition,
    value: SyncValue<V>
  ): SyncBranchBody<V> {
    return new SyncBranchBody([{ condition, value }]);
  }
}

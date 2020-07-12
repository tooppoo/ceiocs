import {
  SyncCondition,
  SyncValue,
  AsyncableValue,
  AsyncableCondition,
} from "./branch-state";
import { SyncBranchBody, AsyncBranchBody } from "./branch-body";

interface SyncIfThen {
  then<Val>(value: SyncValue<Val>): SyncBranchBody<Val>;
}
interface AsyncIfThen {
  then<Val>(value: AsyncableValue<Val>): AsyncBranchBody<Val>;
}

class AsyncBranchHead {
  if(condition: AsyncableCondition): AsyncIfThen;
  if<Val>(
    condition: AsyncableCondition,
    value: AsyncableValue<Val>
  ): AsyncBranchBody<Val>;
  if<Val>(
    condition: AsyncableCondition,
    value?: AsyncableValue<Val>
  ): AsyncIfThen | AsyncBranchBody<Val> {
    if (!value) {
      return {
        then: <V>(lazyVal: AsyncableValue<V>): AsyncBranchBody<V> =>
          new AsyncBranchBody([{ condition, value: lazyVal }]),
      };
    }

    return new AsyncBranchBody([{ condition, value }]);
  }
}
export class SyncBranchHead {
  if(condition: SyncCondition): SyncIfThen;
  if<Val>(condition: SyncCondition, value: SyncValue<Val>): SyncBranchBody<Val>;
  if<Val>(
    condition: SyncCondition,
    value?: SyncValue<Val>
  ): SyncIfThen | SyncBranchBody<Val> {
    if (!value) {
      return {
        then: <V>(lazyVal: SyncValue<V>): SyncBranchBody<V> =>
          new SyncBranchBody([{ condition, value: lazyVal }]),
      };
    }

    return new SyncBranchBody([{ condition, value }]);
  }

  get async(): AsyncBranchHead {
    return new AsyncBranchHead();
  }
}

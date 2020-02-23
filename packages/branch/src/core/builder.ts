import {
  SyncBranchFactory,
  AsyncBranchFactory,
  Branch,
  SyncEachCondition,
  SyncElseifThen,
  SyncBranch,
  SyncAction,
  EachCondition,
  AsyncElseifThen,
  Action,
  AsyncBranch
} from "../type";

export const buildCondition = (
  syncCond: SyncBranchFactory,
  asyncCond: AsyncBranchFactory
): Branch => {
  function syncIf<T>(condition: SyncEachCondition): SyncElseifThen<T>;
  function syncIf<T>(
    condition: SyncEachCondition,
    action: SyncAction<T>
  ): SyncBranch<T>;
  function syncIf<T>(
    condition: SyncEachCondition,
    action?: SyncAction<T>
  ): SyncBranch<T> | SyncElseifThen<T> {
    if (action) {
      return syncCond.create(condition, action);
    } else {
      return {
        then(lazyAction: SyncAction<T>): SyncBranch<T> {
          return syncCond.create(condition, lazyAction);
        }
      };
    }
  }

  function asyncIf<T>(condition: EachCondition): AsyncElseifThen<T>;
  function asyncIf<T>(
    condition: EachCondition,
    action: Action<T>
  ): AsyncBranch<T>;
  function asyncIf<T>(
    condition: EachCondition,
    action?: Action<T>
  ): AsyncBranch<T> | AsyncElseifThen<T> {
    if (action) {
      return asyncCond.create(condition, action);
    } else {
      return {
        then(lazyAction: Action<T>): AsyncBranch<T> {
          return asyncCond.create(condition, lazyAction);
        }
      };
    }
  }

  return {
    if: syncIf,
    async: {
      if: asyncIf
    }
  };
};

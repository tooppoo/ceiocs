import {
  SyncEachCondition,
  AsyncIfThen,
  Action,
  AsyncBranch,
  SyncBranchFactory,
  AsyncBranchFactory,
  Branch,
  EachCondition,
  SyncAction,
  SyncBranch,
  SyncIfThen
} from "../type";

interface Builder {
  (factory: SyncBranchFactory): {
    if(c: SyncEachCondition): SyncIfThen;
    if<T>(c: SyncEachCondition, a: SyncAction<T>): SyncBranch<T>;
  };
  (factory: AsyncBranchFactory): {
    if(c: EachCondition): AsyncIfThen;
    if<T>(c: EachCondition, a: Action<T>): AsyncBranch<T>;
  };
}

const build: Builder = (factory: any) => ({
  if(condition: any, action?: any): any {
    if (action) {
      return factory.create(condition, action);
    } else {
      return {
        then: (lazyAction: any): any => factory.create(condition, lazyAction)
      };
    }
  }
});

export const buildCondition = (
  syncCond: SyncBranchFactory,
  asyncCond: AsyncBranchFactory
): Branch => ({
  ...build(syncCond),
  async: {
    ...build(asyncCond)
  }
});

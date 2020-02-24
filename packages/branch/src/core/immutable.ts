import {
  SyncBranch,
  SyncEachCondition,
  SyncAction,
  AsyncBranch,
  Branch,
  EachCondition,
  Action
} from "../type";
import { buildCondition } from "./builder";
import {
  BaseSyncBranch,
  BaseAsyncBranch,
  AsyncBranchConstructor
} from "./base";

class AsyncImmutableBranch<T> extends BaseAsyncBranch<T>
  implements AsyncBranch<T> {
  static create<T>(
    condition: EachCondition,
    action: Action<T>
  ): AsyncBranch<T> {
    return new this([[condition, action]]);
  }

  protected update(c: EachCondition, a: Action<T>): AsyncBranch<T> {
    return new AsyncImmutableBranch([...this.tuples, [c, a]]);
  }
}

class SyncImmutableBranch<T> extends BaseSyncBranch<T>
  implements SyncBranch<T> {
  static create<T>(
    condition: SyncEachCondition,
    action: SyncAction<T>
  ): SyncBranch<T> {
    return new this([[condition, action]]);
  }

  protected get toAsync(): AsyncBranchConstructor<T> {
    return AsyncImmutableBranch;
  }
  protected update(c: SyncEachCondition, a: SyncAction<T>): SyncBranch<T> {
    return new SyncImmutableBranch([...this.tuples, [c, a]]);
  }
}

export const branch: Branch = buildCondition(
  SyncImmutableBranch,
  AsyncImmutableBranch
);

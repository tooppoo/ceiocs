import {
  SyncBranch,
  SyncEachCondition,
  SyncAction,
  AsyncBranch,
  Branch,
  EachCondition,
  Action
} from "../type";
import { SyncTupleList, AsyncTupleList } from "../lib/tuple";
import { buildCondition } from "./builder";
import {
  BaseSyncBranch,
  BaseAsyncBranch,
  AsyncBranchConstructor
} from "./base";

class AsyncMutableBranch<T> extends BaseAsyncBranch<T>
  implements AsyncBranch<T> {
  static create<T>(
    condition: EachCondition,
    action: Action<T>
  ): AsyncBranch<T> {
    return new this([[condition, action]]);
  }

  constructor(protected tuples: AsyncTupleList<T>) {
    super(tuples);
  }

  protected update(c: EachCondition, a: Action<T>): AsyncBranch<T> {
    this.tuples = [...this.tuples, [c, a]];

    return this;
  }
}

class SyncMutableBranch<T> extends BaseSyncBranch<T> implements SyncBranch<T> {
  static create<T>(
    condition: SyncEachCondition,
    action: SyncAction<T>
  ): SyncBranch<T> {
    return new this([[condition, action]]);
  }
  protected constructor(protected tuples: SyncTupleList<T>) {
    super(tuples);
  }

  protected get toAsync(): AsyncBranchConstructor<T> {
    return AsyncMutableBranch;
  }
  protected update(c: SyncEachCondition, a: SyncAction<T>): SyncBranch<T> {
    this.tuples = [...this.tuples, [c, a]];

    return this;
  }
}

export const branch: Branch = buildCondition(
  SyncMutableBranch,
  AsyncMutableBranch
);

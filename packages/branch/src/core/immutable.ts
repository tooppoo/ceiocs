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
import { TupleList } from "../lib/tuple";
import {
  BranchConstructor,
  BaseSyncBranch,
  BaseAsyncBranch,
  AsyncBranchConstructor
} from "./base";

const createUpdatedBranch = <Cond, Act, Branch>(
  construct: BranchConstructor<Cond, Act, Branch>,
  prev: TupleList<Cond, Act>,
  c: Cond,
  a: Act
): Branch => new construct([...prev, [c, a]]);

class AsyncImmutableBranch<T> extends BaseAsyncBranch<T>
  implements AsyncBranch<T> {
  static create<T>(
    condition: EachCondition,
    action: Action<T>
  ): AsyncBranch<T> {
    return new this([[condition, action]]);
  }

  protected update(c: EachCondition, a: Action<T>): AsyncBranch<T> {
    return createUpdatedBranch(AsyncImmutableBranch, this.tuples, c, a);
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
    return createUpdatedBranch(SyncImmutableBranch, this.tuples, c, a);
  }
}

export const branch: Branch = buildCondition(
  SyncImmutableBranch,
  AsyncImmutableBranch
);

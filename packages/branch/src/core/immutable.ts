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
  construct: BranchConstructor<Cond, Act, Branch>
) => (prev: TupleList<Cond, Act>, c: Cond, a: Act): Branch => {
  return new construct([...prev, [c, a]]);
};

class AsyncImmutableBranch<T> extends BaseAsyncBranch<T>
  implements AsyncBranch<T> {
  static create<T>(
    condition: EachCondition,
    action: Action<T>
  ): AsyncBranch<T> {
    return new this([[condition, action]]);
  }

  private static updater = createUpdatedBranch(AsyncImmutableBranch);

  protected update(c: EachCondition, a: Action<T>): AsyncBranch<T> {
    return AsyncImmutableBranch.updater(this.tuples, c, a);
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

  private static updater = createUpdatedBranch(SyncImmutableBranch);

  protected get toAsync(): AsyncBranchConstructor<T> {
    return AsyncImmutableBranch;
  }
  protected update(c: SyncEachCondition, a: SyncAction<T>): SyncBranch<T> {
    return SyncImmutableBranch.updater(this.tuples, c, a);
  }
}

export const branch: Branch = buildCondition(
  SyncImmutableBranch,
  AsyncImmutableBranch
);

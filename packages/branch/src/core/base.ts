import {
  SyncBranch,
  SyncEachCondition,
  SyncAction,
  AsyncBranch,
  EachCondition,
  Action,
  SyncElseifThen,
  AsyncElseifThen
} from "../type";
import {
  ReadonlySyncTupleList,
  ReadonlyAsyncTupleList,
  AsyncTupleList
} from "../lib/tuple";
import { resolve } from "../lib/functions";

export interface AsyncBranchConstructor<T> {
  new (tuples: AsyncTupleList<T>): AsyncBranch<T>;
}

export abstract class BaseSyncBranch<T> implements SyncBranch<T> {
  protected constructor(protected readonly tuples: ReadonlySyncTupleList<T>) {}

  elseif(c: SyncEachCondition): SyncElseifThen<T>;
  elseif(c: SyncEachCondition, a: SyncAction<T>): SyncBranch<T>;
  elseif(
    c: SyncEachCondition,
    a?: SyncAction<T>
  ): SyncElseifThen<T> | SyncBranch<T> {
    if (!a) {
      return {
        then: (action: SyncAction<T>): SyncBranch<T> => this.update(c, action)
      };
    }

    return this.update(c, a);
  }

  else(otherAction: SyncAction<T>): T {
    const [, action] = this.tuples.find(([cond]) => resolve(cond)) || [];

    return action ? resolve<T>(action) : resolve<T>(otherAction);
  }

  get async(): AsyncBranch<T> {
    return new this.toAsync([...this.tuples]);
  }

  protected abstract update(
    c: SyncEachCondition,
    action: SyncAction<T>
  ): SyncBranch<T>;
  protected abstract readonly toAsync: AsyncBranchConstructor<T>;
}

export abstract class BaseAsyncBranch<T> implements AsyncBranch<T> {
  constructor(protected readonly tuples: ReadonlyAsyncTupleList<T>) {}

  elseif(c: EachCondition): AsyncElseifThen<T>;
  elseif(c: EachCondition, a: Action<T>): AsyncBranch<T>;
  elseif(c: EachCondition, a?: Action<T>): AsyncBranch<T> | AsyncElseifThen<T> {
    if (!a) {
      return {
        then: (a: Action<T>): AsyncBranch<T> => this.update(c, a)
      };
    }

    return this.update(c, a);
  }

  async else(otherAction: Action<T>): Promise<T> {
    let action: Action<T> = otherAction;

    for (const [cond, act] of this.tuples) {
      const satisfied = await resolve(cond);

      if (satisfied) {
        action = act;
        break;
      }
    }

    return resolve(action);
  }

  protected abstract update(
    c: EachCondition,
    action: Action<T>
  ): AsyncBranch<T>;
}

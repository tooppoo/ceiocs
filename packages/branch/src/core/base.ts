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

interface SwitchMaybeElseIf {
  <C, A, B>(update: Updater<C, A, B>): MaybeElseIf<C, A, B>;
}
type Updater<C, A, B> = (c: C, a: A) => B;
interface MaybeElseIf<C, A, B> {
  (c: C): { then(a: A): B };
  (c: C, a: A): B;
  (c: C, a?: A): B | { then(a: A): B };
}

const maybeElseIf: SwitchMaybeElseIf = <C, A, B>(update: Updater<C, A, B>) => (
  c: C,
  a?: A
): any => {
  if (!a) {
    return {
      then: (action: A): B => update(c, action)
    };
  }

  return update(c, a);
};

export abstract class BaseSyncBranch<T> implements SyncBranch<T> {
  protected constructor(protected readonly tuples: ReadonlySyncTupleList<T>) {}

  private readonly maybeElseIf = maybeElseIf<
    SyncEachCondition,
    SyncAction<T>,
    SyncBranch<T>
  >((c, a) => this.update(c, a));

  elseif(c: SyncEachCondition): SyncElseifThen<T>;
  elseif(c: SyncEachCondition, a: SyncAction<T>): SyncBranch<T>;
  elseif(
    condition: SyncEachCondition,
    action?: SyncAction<T>
  ): SyncElseifThen<T> | SyncBranch<T> {
    return this.maybeElseIf(condition, action);
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

  private readonly maybeElseIf = maybeElseIf<
    EachCondition,
    Action<T>,
    AsyncBranch<T>
  >((c, a) => this.update(c, a));

  elseif(c: EachCondition): AsyncElseifThen<T>;
  elseif(c: EachCondition, a: Action<T>): AsyncBranch<T>;
  elseif(c: EachCondition, a?: Action<T>): AsyncBranch<T> | AsyncElseifThen<T> {
    return this.maybeElseIf(c, a);
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

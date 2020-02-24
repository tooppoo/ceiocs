import {
  SyncBranch,
  SyncEachCondition,
  SyncAction,
  AsyncBranch,
  EachCondition,
  Action
} from "../type";
import { TupleList } from "../lib/tuple";
import { resolve } from "../lib/functions";

export interface BranchConstructor<Cond, Act, Branch> {
  new (tuples: TupleList<Cond, Act>): Branch;
}
export type SyncBranchConstructor<T> = BranchConstructor<
  SyncEachCondition,
  SyncAction<T>,
  SyncBranch<T>
>;
export type AsyncBranchConstructor<T> = BranchConstructor<
  EachCondition,
  Action<T>,
  AsyncBranch<T>
>;

type MaybeElseIf<Act, Branch> = Branch | { then(a: Act): Branch };

abstract class BaseBranch<Cond, Act, Branch> {
  constructor(protected tuples: TupleList<Cond, Act>) {}

  elseif(c: Cond): { then(a: Act): Branch };
  elseif(c: Cond, a: Act): Branch;
  elseif(c: Cond, a?: Act): MaybeElseIf<Act, Branch> {
    if (!a) {
      return { then: (action: Act): Branch => this.update(c, action) };
    }

    return this.update(c, a);
  }

  protected abstract update(c: Cond, action: Act): Branch;
}

export abstract class BaseSyncBranch<T>
  extends BaseBranch<SyncEachCondition, SyncAction<T>, SyncBranch<T>>
  implements SyncBranch<T> {
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

export abstract class BaseAsyncBranch<T>
  extends BaseBranch<EachCondition, Action<T>, AsyncBranch<T>>
  implements AsyncBranch<T> {
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

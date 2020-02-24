import {
  SyncValue,
  SyncCondition,
  BranchState,
  AsyncCondition,
  AsyncValue
} from "./branch-state";
import { resolveMaybeCallable } from "./resolve-maybe-callable";

interface ElseIf<Val, NextBranch> {
  then(value: Val): NextBranch;
}
abstract class BaseBranchBody<Cond, Val, LastVal> {
  constructor(protected readonly states: readonly BranchState<Cond, Val>[]) {}

  elseif(condition: Cond): ElseIf<Val, this>;
  elseif(condition: Cond, value: Val): this;
  elseif(condition: Cond, value?: Val): this | ElseIf<Val, this> {
    if (!value) {
      return {
        then: (lazyVal: Val): this => this.update(condition, lazyVal)
      };
    }

    return this.update(condition, value);
  }

  abstract else(otherwise: Val): LastVal;

  protected update(condition: Cond, value: Val): this {
    return new (this.constructor as any)([
      ...this.states,
      { condition, value }
    ]);
  }
}

export class AsyncBranchBody<Val> extends BaseBranchBody<
  AsyncCondition,
  AsyncValue<Val>,
  Promise<Val>
> {
  async else(otherwise: AsyncValue<Val>): Promise<Val> {
    let satisfied = otherwise;

    for (const { condition, value } of this.states) {
      const isSatisfied = await resolveMaybeCallable(condition);

      if (isSatisfied) {
        satisfied = value;
        break;
      }
    }

    return resolveMaybeCallable<(() => any) | any>(satisfied);
  }
}

export class SyncBranchBody<Val> extends BaseBranchBody<
  SyncCondition,
  SyncValue<Val>,
  Val
> {
  else(value: SyncValue<Val>): Val {
    const satisfied = this.states.find(({ condition }) =>
      resolveMaybeCallable(condition)
    );

    return satisfied
      ? resolveMaybeCallable(satisfied.value)
      : resolveMaybeCallable(value);
  }

  get async(): AsyncBranchBody<Val> {
    return new AsyncBranchBody<Val>(this.states);
  }
}

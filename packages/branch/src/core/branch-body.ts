import {
  SyncValue,
  SyncCondition,
  BranchState,
  AsyncCondition,
  AsyncableValue,
} from './branch-state'
import { resolveMaybeCallable } from "@common/resolve-maybe-callable";

interface ElseIf<Val, NextBranch> {
  then(value: Val): NextBranch;
}
abstract class BaseBranchBody<Cond, Val, LastVal> {
  constructor(protected readonly states: readonly BranchState<Cond, Val>[]) {}

  elseif(condition: any, value?: any): any {
    if (!value) {
      return {
        then: (lazyVal: Val): this => this.next(condition, lazyVal),
      };
    }

    return this.next(condition, value);
  }

  abstract else(otherwise: Val): LastVal;

  protected next(condition: Cond, value: Val): this {
    return new (this.constructor as any)([
      ...this.states,
      { condition, value },
    ]);
  }
}

interface AsyncBranchBodyMethod<Val> {
  elseif(
    condition: SyncCondition
  ): ElseIf<AsyncableValue<Val>, AsyncBranchBody<Val>>;
  elseif(
    condition: SyncCondition | AsyncCondition,
    value: AsyncableValue<Val>
  ): AsyncBranchBody<Val>;
  else(value: AsyncableValue<Val>): Promise<Val>;
}
export class AsyncBranchBody<Val> extends BaseBranchBody<
  SyncCondition | AsyncCondition,
  AsyncableValue<Val>,
  Promise<Val>
> {
  declare elseif: AsyncBranchBodyMethod<Val>["elseif"];

  async else(otherwise: AsyncableValue<Val>): Promise<Val> {
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

interface SyncBranchBodyMethod<Val> {
  elseif(
    condition: SyncCondition
  ): Val extends Promise<any>
    ? never
    : ElseIf<SyncValue<Val>, SyncBranchBodyMethod<Val>>;
  elseif(
    condition: SyncCondition,
    value: SyncValue<Val>
  ): Val extends Promise<any> ? never : SyncBranchBody<Val>;
  else(value: SyncValue<Val>): Val;
}
export class SyncBranchBody<Val> extends BaseBranchBody<
  SyncCondition,
  SyncValue<Val>,
  Val
> {
  declare elseif: SyncBranchBodyMethod<Val>["elseif"];

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

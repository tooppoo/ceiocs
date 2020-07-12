import { MaybeCallable } from "@common/value-type";
import {
  SyncValue,
  SyncCondition,
  BranchState,
  AsyncableValue,
  AsyncableCondition,
} from "./branch-state";
import { resolveMaybeCallable } from "@common/resolve-maybe-callable";

interface ElseIf<Val, NextBranch> {
  then(value: Val): NextBranch;
}

export class AsyncBranchBody<Val> {
  constructor(
    protected readonly states: readonly BranchState<
      AsyncableCondition,
      AsyncableValue<Val>
    >[]
  ) {}

  elseif(
    condition: AsyncableCondition
  ): ElseIf<AsyncableValue<Val>, AsyncBranchBody<Val>>;
  elseif(
    condition: AsyncableCondition,
    value?: AsyncableValue<Val>
  ): AsyncBranchBody<Val>;
  elseif(
    condition: AsyncableCondition,
    value?: AsyncableValue<Val>
  ): ElseIf<AsyncableValue<Val>, AsyncBranchBody<Val>> | AsyncBranchBody<Val> {
    if (!value) {
      return {
        then: (lazyVal: AsyncableValue<Val>): AsyncBranchBody<Val> =>
          new AsyncBranchBody<Val>([
            ...this.states,
            { condition, value: lazyVal },
          ]),
      };
    }

    return new AsyncBranchBody<Val>([...this.states, { condition, value }]);
  }
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

export class SyncBranchBody<Val> {
  constructor(
    protected readonly states: readonly BranchState<
      SyncCondition,
      SyncValue<Val>
    >[]
  ) {}

  elseif(condition: SyncCondition): ElseIf<SyncValue<Val>, SyncBranchBody<Val>>;
  elseif(condition: SyncCondition, value?: SyncValue<Val>): SyncBranchBody<Val>;
  elseif(
    condition: SyncCondition,
    value?: SyncValue<Val>
  ): ElseIf<SyncValue<Val>, SyncBranchBody<Val>> | SyncBranchBody<Val> {
    if (!value) {
      return {
        then: (lazyVal: SyncValue<Val>): SyncBranchBody<Val> =>
          new SyncBranchBody([...this.states, { condition, value: lazyVal }]),
      };
    }

    return new SyncBranchBody([...this.states, { condition, value }]);
  }

  else(value: SyncValue<Val>): Val {
    const satisfied = this.states.find(({ condition }) =>
      resolveMaybeCallable(condition)
    );

    return resolveMaybeCallable(
      (satisfied ? satisfied.value : value) as MaybeCallable<Val>
    );
  }

  get async(): AsyncBranchBody<Val> {
    return new AsyncBranchBody<Val>(this.states);
  }
}

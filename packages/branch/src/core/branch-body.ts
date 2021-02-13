import { MaybeCallable } from "@common/value-type";
import {
  SyncValue,
  SyncCondition,
  BranchState,
  AsyncableValue,
  AsyncableCondition,
} from "./branch-state";
import { resolveMaybeCallable } from "@common/resolve-maybe-callable";

export class AsyncBranchBody<Val> {
  constructor(
    protected readonly states: readonly BranchState<
      AsyncableCondition,
      AsyncableValue<Val>
    >[]
  ) {}

  elseif(condition: AsyncableCondition, value: AsyncableValue<Val>): AsyncBranchBody<Val> {
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

  elseif(condition: SyncCondition, value: SyncValue<Val>): SyncBranchBody<Val> {
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

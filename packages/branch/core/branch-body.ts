import type { MaybeCallable } from "../../common/value-type";
import type {
  SyncValue,
  SyncCondition,
  BranchState,
  AsyncableValue,
  AsyncableCondition,
} from "./branch-state";
import { resolveMaybeCallable } from "../../common/resolve-maybe-callable";

export class AsyncBranchBody<Val> {
  constructor(
    protected readonly states: readonly BranchState<
      AsyncableCondition,
      AsyncableValue<Val>
    >[]
  ) {}

  /**
   * Appends an asynchronous condition/value pair to the branch chain while keeping the recorded states immutable.
   * The returned body allows further chaining until an `else` clause resolves the value.
   *
   * @example
   * ```ts
   * const result = await branch.async
   *   .if(fetchIsAdmin, "admin")
   *   .elseif(() => Promise.resolve(true), "user")
   *   .else("guest");
   * ```
   */
  elseif(condition: AsyncableCondition, value: AsyncableValue<Val>): AsyncBranchBody<Val> {
    return new AsyncBranchBody<Val>([...this.states, { condition, value }]);
  }

  /**
   * Evaluates each recorded asynchronous condition sequentially and resolves the value of the first satisfied branch.
   * When no condition passes, the provided fallback is resolved instead, so expensive computations remain lazy until needed.
   *
   * @example
   * ```ts
   * const message = await branch.async
   *   .if(checkAuth, "authenticated")
   *   .else(() => getFallbackMessage());
   * ```
   */
  async else(otherwise: AsyncableValue<Val>): Promise<Val> {
    let satisfied = otherwise;

    for (const { condition, value } of this.states) {
      const isSatisfied = await resolveMaybeCallable(condition);

      if (isSatisfied) {
        satisfied = value;
        break;
      }
    }

    return resolveMaybeCallable(satisfied);
  }

  /**
   * Renders the asynchronous branch definition as an `if`/`else if`/`else` style string so the evaluation order can be inspected.
   * Helpful when dumping logs to confirm which conditions are currently registered.
   */
  toString(): string {
    return stringify(this.states);
  }
}

export class SyncBranchBody<Val> {
  constructor(
    protected readonly states: readonly BranchState<
      SyncCondition,
      SyncValue<Val>
    >[]
  ) {}

  /**
   * Adds another synchronous condition/value pair to the immutable chain and returns a new `SyncBranchBody`.
   * Every registered value must share the same type so evaluation later produces a consistent result.
   *
   * @example
   * ```ts
   * const result = branch
   *   .if(user.role === "admin", "allow")
   *   .elseif(user.role === "moderator", "allow")
   *   .else("deny");
   * ```
   */
  elseif(condition: SyncCondition, value: SyncValue<Val>): SyncBranchBody<Val> {
    return new SyncBranchBody([...this.states, { condition, value }]);
  }

  /**
   * Walks through the recorded synchronous conditions in order and returns the value of the first branch that succeeds.
   * If every branch fails, the fallback is resolved so deferred computations run only when necessary.
   *
   * @example
   * ```ts
   * const label = branch
   *   .if(false, "primary")
   *   .else(() => expensiveComputation());
   * ```
   */
  else(value: SyncValue<Val>): Val {
    const satisfied = this.states.find(({ condition }) =>
      resolveMaybeCallable(condition)
    );

    return resolveMaybeCallable<Val>(satisfied ? satisfied.value : value);
  }

  /**
   * Switches the chain to asynchronous evaluation while keeping all previously registered synchronous branches.
   * After calling this getter, only `AsyncBranchBody` APIs remain available to continue building the definition.
   */
  get async(): AsyncBranchBody<Val> {
    return new AsyncBranchBody<Val>(this.states);
  }

  /**
   * Formats the branch structure as a human-readable `if/else-if/else` snippet that mirrors the imperative control flow.
   *
   * @example
   * ```ts
   * const body = branch.if(true, "a").elseif(false, "b");
   * console.log(body.toString());
   * // =>
   * // if (true) {
   * //   return "a";
   * // }
   * // else if (false) {
   * //   return "b";
   * // }
   * ```
   */
  toString(): string {
    return stringify(this.states);
  }
}

function stringify(states: readonly BranchState<AsyncableCondition, AsyncableValue<any>>[]): string {
  const [head, ...rest] = states;
  const top = head ? `if (${head.condition}) {\n  return ${head.value};\n}\n` : "";

  return `${top}${rest.map(({ condition, value }) => `else if (${condition}) {\n  return ${value};\n}\n`).join("")}`;
}

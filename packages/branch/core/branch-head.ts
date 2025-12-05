import type {
  SyncCondition,
  SyncValue,
  AsyncableValue,
  AsyncableCondition,
} from "./branch-state";
import { SyncBranchBody, AsyncBranchBody } from "./branch-body";

class AsyncBranchHead {
  /**
   * Starts an asynchronous branch chain by registering the first condition/value pair and returning an `AsyncBranchBody`.
   * Additional `elseif`/`else` clauses can then be chained to mirror an `if`/`else if`/`else` control flow that supports promises.
   *
   * @example
   * ```ts
   * const result = await branch.async
   *   .if(loadFlag, "primary")
   *   .else("fallback");
   * ```
   */
  if<Val>(condition: AsyncableCondition, value: AsyncableValue<Val>): AsyncBranchBody<Val> {
    return new AsyncBranchBody([{ condition, value }]);
  }
}
export class SyncBranchHead {
  /**
   * Begins a synchronous branch chain by recording the first `if` condition and returning a `SyncBranchBody` for further chaining.
   *
   * @example
   * ```ts
   * const label = branch
   *   .if(user.role === "admin", "allow")
   *   .else("deny");
   * ```
   */
  if<Val>(condition: SyncCondition, value: SyncValue<Val>): SyncBranchBody<Val> {
    return new SyncBranchBody([{ condition, value }]);
  }

  /**
   * Exposes the asynchronous head so that a chain that started synchronously can continue with asynchronous conditions and values.
   */
  get async(): AsyncBranchHead {
    return new AsyncBranchHead();
  }
}

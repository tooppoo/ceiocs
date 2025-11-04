import type {
  SyncCondition,
  SyncValue,
  AsyncableValue,
  AsyncableCondition,
} from "./branch-state";
import { SyncBranchBody, AsyncBranchBody } from "./branch-body";

class AsyncBranchHead {
  if<Val>(condition: AsyncableCondition, value: AsyncableValue<Val>): AsyncBranchBody<Val> {
    return new AsyncBranchBody([{ condition, value }]);
  }
}
export class SyncBranchHead {
  if<Val>(condition: SyncCondition, value: SyncValue<Val>): SyncBranchBody<Val> {
    return new SyncBranchBody([{ condition, value }]);
  }

  get async(): AsyncBranchHead {
    return new AsyncBranchHead();
  }
}

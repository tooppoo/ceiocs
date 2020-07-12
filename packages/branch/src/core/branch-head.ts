import {
  SyncCondition,
  SyncValue,
  BranchState, AsyncableValue, AsyncableCondition,
} from './branch-state'
import { SyncBranchBody, AsyncBranchBody } from "./branch-body";

interface BodyConstructor<Cond = any, Val = any> {
  new (states: BranchState<Cond, Val>[]): any;
}

interface SyncBranchHeadMethod {
  if(condition: SyncCondition): SyncIfThen;
  if<Val>(
    condition: SyncCondition,
    value: SyncValue<Val>
  ): Val extends Promise<any> ? never : SyncBranchBody<Val>;
}
interface SyncIfThen {
  then<Val>(
    value: SyncValue<Val>
  ): Val extends Promise<any> ? never : SyncBranchBody<Val>;
}

interface AsyncBranchHeadMethod {
  if(condition: AsyncableCondition): AsyncIfThen;
  if<Val>(
    condition: AsyncableCondition,
    value: AsyncableValue<Val>
  ): AsyncBranchBody<Val>;
}
interface AsyncIfThen {
  then<Val>(value: AsyncableValue<Val>): AsyncBranchBody<Val>;
}
abstract class BaseBranchHead {
  if(condition: any, value?: any): any {
    if (!value) {
      return {
        then: <V>(lazyVal: V): any =>
          this.next(this.nextBranchBody, condition, lazyVal),
      };
    }

    return this.next(this.nextBranchBody, condition, value);
  }

  protected next<Cond, Val>(
    constructor: BodyConstructor<Cond, Val>,
    condition: Cond,
    value: Val
  ): any {
    return new constructor([{ condition, value }]);
  }

  protected abstract nextBranchBody: BodyConstructor;
}

class AsyncBranchHead extends BaseBranchHead implements AsyncBranchHeadMethod {
  declare if: AsyncBranchHeadMethod["if"];

  protected nextBranchBody = AsyncBranchBody;
}
export class SyncBranchHead extends BaseBranchHead
  implements SyncBranchHeadMethod {
  declare if: SyncBranchHeadMethod["if"];

  protected nextBranchBody = SyncBranchBody;

  get async(): AsyncBranchHead {
    return new AsyncBranchHead();
  }
}

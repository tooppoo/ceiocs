import {
  SyncCondition,
  AsyncCondition,
  SyncValue,
  AsyncValue,
  BranchState
} from "./branch-state";
import { SyncBranchBody, AsyncBranchBody } from "./branch-body";

interface BodyConstructor<Cond = any, Val = any> {
  new (states: BranchState<Cond, Val>[]): any;
}
interface SyncIfThen {
  then<Val>(value: AsyncValue<Val>): AsyncBranchBody<Val>;
  then<Val>(value: SyncValue<Val>): SyncBranchBody<Val>;
}
interface AsyncIfThen {
  then<Val>(value: AsyncValue<Val>): AsyncBranchBody<Val>;
}
abstract class BaseBranchHead {
  if(condition: AsyncCondition): AsyncIfThen;
  if(condition: SyncCondition): SyncIfThen;
  if<Val>(
    condition: AsyncCondition,
    value: AsyncValue<Val>
  ): AsyncBranchBody<Val>;
  if<Val>(
    condition: AsyncCondition,
    value: SyncValue<Val>
  ): AsyncBranchBody<Val>;
  if<Val>(
    condition: SyncCondition,
    value: AsyncValue<Val>
  ): AsyncBranchBody<Val>;
  if<Val>(condition: SyncCondition, value: SyncValue<Val>): SyncBranchBody<Val>;
  if<Val>(
    condition: any,
    value?: any
  ): AsyncBranchBody<Val> | SyncBranchBody<Val> | AsyncIfThen | SyncIfThen {
    if (!value) {
      return {
        then: <V>(lazyVal: V): any =>
          this.next(this.nextBranchBody, condition, lazyVal)
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

class AsyncBranchHead extends BaseBranchHead {
  protected nextBranchBody = AsyncBranchBody;
}
export class SyncBranchHead extends BaseBranchHead {
  protected nextBranchBody = SyncBranchBody;

  get async(): AsyncBranchHead {
    return new AsyncBranchHead();
  }
}

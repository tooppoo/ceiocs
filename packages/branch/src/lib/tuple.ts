import { SyncEachCondition, SyncAction, EachCondition, Action } from "../type";

export type SyncTuple<T> = [SyncEachCondition, SyncAction<T>];
export type AsyncTuple<T> = [EachCondition, Action<T>];

export type SyncTupleList<T> = Array<SyncTuple<T>>;
export type AsyncTupleList<T> = Array<AsyncTuple<T>>;

export type ReadonlySyncTupleList<T> = Readonly<Array<SyncTuple<T>>>;
export type ReadonlyAsyncTupleList<T> = Readonly<Array<AsyncTuple<T>>>;

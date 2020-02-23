export type EachCondition = AsyncEachCondition | SyncEachCondition;
export type Action<T> = AsyncAction<T> | (() => T) | T;

export type SyncEachCondition = boolean | (() => boolean);
export type SyncAction<T> = T extends Promise<any> ? never : T | (() => T);
export type AsyncEachCondition = Promise<boolean> | (() => Promise<boolean>);
export type AsyncAction<T> = Promise<T> | (() => Promise<T>);

export interface Branch {
  if(condition: SyncEachCondition): SyncIfThen;
  if<T>(condition: SyncEachCondition, action: SyncAction<T>): SyncBranch<T>;
  readonly async: {
    if(condition: EachCondition): AsyncIfThen;
    if<T>(condition: EachCondition, action: Action<T>): AsyncBranch<T>;
  };
}

export interface SyncIfThen {
  then<T>(action: SyncAction<T>): SyncBranch<T>;
}
export interface AsyncIfThen {
  then<T>(action: () => Promise<T>): AsyncBranch<T>;
  then<T>(action: Action<T>): AsyncBranch<T>;
}
export interface SyncElseifThen<T> {
  then(action: SyncAction<T>): SyncBranch<T>;
}
export interface AsyncElseifThen<T> {
  then(action: Action<T>): AsyncBranch<T>;
}

export interface SyncBranchFactory {
  create<T>(condition: SyncEachCondition, action: SyncAction<T>): SyncBranch<T>;
}
export interface AsyncBranchFactory {
  create<T>(condition: EachCondition, action: Action<T>): AsyncBranch<T>;
}

export interface SyncBranch<T> {
  elseif(condition: SyncEachCondition): SyncElseifThen<T>;
  elseif(c: SyncEachCondition, action: SyncAction<T>): SyncBranch<T>;
  else(action: SyncAction<T>): T;
  readonly async: AsyncBranch<T>;
}

export interface AsyncBranch<T> {
  elseif(condition: EachCondition): AsyncElseifThen<T>;
  elseif(c: EachCondition, action: Action<T>): AsyncBranch<T>;
  else(action: Action<T>): Promise<T>;
}

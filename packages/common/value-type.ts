export type MaybeAsync<T> = T | Promise<T>;

export type MaybeCallable<T> = (() => T) | T;

export type MustSync<T, R = T> = T extends
  | Promise<unknown>
  | PromiseLike<unknown>
  ? never
  : R;

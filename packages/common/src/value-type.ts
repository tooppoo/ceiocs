
export type MaybeAsync<T> = T | Promise<T>;

export type MaybeCallable<T> = (() => T) | T;

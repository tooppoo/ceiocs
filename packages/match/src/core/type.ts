import { MaybeAsync, MaybeCallable, MustSync } from '@common/value-type'

export type KeyLike<T> = MustSync<T, MaybeCallable<T>>;
export type AsyncableKeyLike<T> = MaybeCallable<MaybeAsync<T>>;

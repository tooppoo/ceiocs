import { MaybeAsync, MaybeCallable } from '@common/value-type'

export type KeyLike<T> = MaybeCallable<T>;
export type AsyncableKeyLike<T> = KeyLike<MaybeAsync<T>>;

import { resolveMaybeCallable } from "@common/resolve-maybe-callable";

type KeyLike<T> = (() => T) | T;
type ValueLike<T> = (() => T) | T;
type AsyncKeyLike<T> = (() => Promise<T>) | Promise<T>
type AsyncValueLike<T> = (() => Promise<T>) | Promise<T>
type MaybeAsyncKeyLike<T> = AsyncKeyLike<T> | KeyLike<T>
type MaybeAsyncValueLike<T> = AsyncValueLike<T> | ValueLike<T>

interface MatchState<Key, Val> {
  key: KeyLike<Key>;
  value: ValueLike<Val>;
}

export class PatternMatch {
  case<Key>(rootKey: KeyLike<Key>): HeadOfPatternWhen<Key> {
    return new HeadOfPatternWhen(rootKey);
  }

  get async(): AsyncPatternMatch {
    return new AsyncPatternMatch()
  }
}
class AsyncPatternMatch {
  match<Key>(rootKey: MaybeAsyncKeyLike<Key>): AsyncHeadOfPatternWhen<Key> {
    return new AsyncHeadOfPatternWhen(rootKey);
  }
}

class HeadOfPatternWhen<Key> {
  constructor(private readonly rootKey: KeyLike<Key>) {}

  when<Val>(key: KeyLike<Key>, value: ValueLike<Val>): PatternWhen<Key, Val> {
    return new PatternWhen<Key, Val>(this.rootKey, [{ key, value }]);
  }

  get async(): AsyncHeadOfPatternWhen<Key> {
    return new AsyncHeadOfPatternWhen<Key>(this.rootKey)
  }
}
class AsyncHeadOfPatternWhen<Key> {
  constructor(private readonly rootKey: MaybeAsyncKeyLike<Key>) {}

  when<Val>(key: MaybeAsyncKeyLike<Key>, value: MaybeAsyncValueLike<Val> | AsyncValueLike<Val>) {
    return new AsyncPatternWhen<Key, Val>(this.rootKey, [{ key, value }])
  }
}

class PatternWhen<Key, Val> {
  constructor(
    private readonly rootKey: KeyLike<Key>,
    private readonly states: Array<MatchState<Key, Val>>
  ) {}

  when(key: KeyLike<Key>, value: ValueLike<Val>): PatternWhen<Key, Val> {
    return new PatternWhen<Key, Val>(this.rootKey, [
      ...this.states,
      { key, value },
    ]);
  }
  otherwise(otherwise: ValueLike<Val>): Val {
    const matched = this.states.find(
      (s) => resolveMaybeCallable(s.key) === resolveMaybeCallable(this.rootKey)
    );

    return resolveMaybeCallable(matched ? matched.value : otherwise);
  }

  get async(): AsyncPatternWhen<Key, Val> {
    return new AsyncPatternWhen<Key, Val>(this.rootKey, this.states)
  }
}
class AsyncPatternWhen<Key, Val> {
  constructor(
    private readonly rootKey: MaybeAsyncKeyLike<Key>,
    private readonly states: Array<MatchState<Key | Promise<Key>, Val | Promise<Val>>>
  ) {}

  when(key: MaybeAsyncKeyLike<Key>, value: MaybeAsyncValueLike<Val>): AsyncPatternWhen<Key, Val> {
    return new AsyncPatternWhen<Key, Val>(this.rootKey, [
      ...this.states,
      { key, value }
    ])
  }
  async otherwise(otherwise: MaybeAsyncValueLike<Val>): Promise<Val> {
    let matched: MatchState<Key | Promise<Key>, Val | Promise<Val>> | null = null

    for (const s of this.states) {
      const rootKey = await resolveMaybeCallable(this.rootKey)
      const key = await resolveMaybeCallable(s.key)

      if (rootKey === key) {
        matched = s
        break;
      }
    }

    return resolveMaybeCallable(matched ? matched.value : otherwise)
  }
}

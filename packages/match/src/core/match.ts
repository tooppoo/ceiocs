import { resolveMaybeCallable } from "@common/resolve-maybe-callable";

type KeyLike<T> = (() => T) | T;
type ValueLike<T> = (() => T) | T;

interface MatchState<Key, Val> {
  key: KeyLike<Key>;
  value: ValueLike<Val>;
}

export class PatternMatch {
  match<Key>(rootKey: KeyLike<Key>): HeadOfPatternWhen<Key> {
    return new HeadOfPatternWhen(rootKey);
  }
}

class HeadOfPatternWhen<Key> {
  constructor(private readonly rootKey: KeyLike<Key>) {}

  when<Val>(key: KeyLike<Key>, value: ValueLike<Val>): PatternWhen<Key, Val> {
    return new PatternWhen<Key, Val>(this.rootKey, [{ key, value }]);
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
}

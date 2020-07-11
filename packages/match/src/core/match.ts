import { resolveMaybeCallable } from "@common/resolve-maybe-callable";

type KeyLike<T> = (() => T) | T;

interface MatchState<Key, Val> {
  key: KeyLike<Key>;
  value: Val;
}

export class PatternMatch {
  match<Key>(rootKey: KeyLike<Key>) {
    return {
      when<Val>(key: KeyLike<Key>, value: Val): PatternWhen<Key, Val> {
        return new PatternWhen<Key, Val>(rootKey, [{ key, value }]);
      },
    };
  }
}

class PatternWhen<Key, Val> {
  constructor(
    private readonly rootKey: KeyLike<Key>,
    private readonly states: Array<MatchState<Key, Val>>
  ) {}

  when(key: KeyLike<Key>, value: Val): PatternWhen<Key, Val> {
    return new PatternWhen<Key, Val>(this.rootKey, [
      ...this.states,
      { key, value },
    ]);
  }
  otherwise(otherwise: Val): Val {
    const matched = this.states.find(
      (s) => resolveMaybeCallable(s.key) === resolveMaybeCallable(this.rootKey)
    );

    return matched ? matched.value : otherwise;
  }
}

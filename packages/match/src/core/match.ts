interface MatchState<Key, Val> {
  key: Key;
  value: Val;
}

export class PatternMatch {
  match<Key>(rootKey: Key) {
    return {
      when<Val>(key: Key, value: Val): PatternWhen<Key, Val> {
        return new PatternWhen<Key, Val>(
          rootKey,
          [{ key, value }]
        )
      }
    }
  }
}

class PatternWhen<Key, Val> {
  constructor(
    private readonly rootKey: Key,
    private readonly states: Array<MatchState<Key, Val>>
  ) {}

  when(key: Key, value: Val): PatternWhen<Key, Val> {
    return new PatternWhen<Key, Val>(this.rootKey, [
      ...this.states,
      { key, value },
    ]);
  }
  otherwise(otherwise: Val): Val {
    const matched = this.states.find((s) => s.key === this.rootKey);

    return matched ? matched.value : otherwise;
  }
}

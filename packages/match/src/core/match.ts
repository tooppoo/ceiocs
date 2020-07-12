import { resolveMaybeCallable } from "@common/resolve-maybe-callable";
import { MaybeAsync, MaybeCallable } from '@common/value-type'
import { MatchConfig, Comparator } from "./config";

type KeyLike<T> = MaybeCallable<T>;
type ValueLike<T> = MaybeCallable<T>;

type AsyncableKeyLike<T> = KeyLike<MaybeAsync<T>>;
type AsyncableValueLike<T> = ValueLike<MaybeAsync<T>>;

interface MatchState<Key, Val> {
  key: Key;
  value: Val;
}

export class PatternMatch {
  constructor(private readonly config: MatchConfig = MatchConfig.default) {}

  case<Key>(rootKey: KeyLike<Key>): HeadOfPatternWhen<Key> {
    return new HeadOfPatternWhen(this.config, rootKey);
  }

  get async(): AsyncPatternMatch {
    return new AsyncPatternMatch(this.config);
  }

  compareBy<T>(matcher: Comparator<T>): PatternMatch {
    return new PatternMatch(this.config.changeMatcher(matcher));
  }
}
class AsyncPatternMatch {
  constructor(private readonly config: MatchConfig = MatchConfig.default) {}

  match<Key>(rootKey: AsyncableKeyLike<Key>): AsyncHeadOfPatternWhen<Key> {
    return new AsyncHeadOfPatternWhen(this.config, rootKey);
  }
}

class HeadOfPatternWhen<Key> {
  constructor(
    private readonly config: MatchConfig,
    private readonly rootKey: KeyLike<Key>
  ) {}

  when<Val>(key: KeyLike<Key>, value: ValueLike<Val>): PatternWhen<Key, Val> {
    return new PatternWhen<Key, Val>(this.config, this.rootKey, [
      { key, value },
    ]);
  }

  get async(): AsyncHeadOfPatternWhen<Key> {
    return new AsyncHeadOfPatternWhen<Key>(this.config, this.rootKey);
  }
}
class AsyncHeadOfPatternWhen<Key> {
  constructor(
    private readonly config: MatchConfig,
    private readonly rootKey: AsyncableKeyLike<Key>
  ) {}

  when<Val>(
    key: AsyncableKeyLike<Key>,
    value: AsyncableValueLike<Val>
  ) {
    return new AsyncPatternWhen<Key, Val>(this.config, this.rootKey, [
      { key, value },
    ]);
  }
}

class PatternWhen<Key, Val> {
  constructor(
    private readonly config: MatchConfig,
    private readonly rootKey: KeyLike<Key>,
    private readonly states: Array<MatchState<KeyLike<Key>, ValueLike<Val>>>
  ) {}

  when(key: KeyLike<Key>, value: ValueLike<Val>): PatternWhen<Key, Val> {
    return new PatternWhen<Key, Val>(this.config, this.rootKey, [
      ...this.states,
      { key, value },
    ]);
  }
  otherwise(otherwise: ValueLike<Val>): Val {
    const matched = this.states.find((s) =>
      this.config.compare(
        resolveMaybeCallable(s.key),
        resolveMaybeCallable(this.rootKey)
      )
    );

    return resolveMaybeCallable(matched ? matched.value : otherwise);
  }

  get async(): AsyncPatternWhen<Key, Val> {
    return new AsyncPatternWhen<Key, Val>(
      this.config,
      this.rootKey,
      this.states
    );
  }
}
class AsyncPatternWhen<Key, Val> {
  constructor(
    private readonly config: MatchConfig,
    private readonly rootKey: AsyncableKeyLike<Key>,
    private readonly states: Array<
      MatchState<AsyncableKeyLike<Key>, AsyncableValueLike<Val>>
    >
  ) {}

  when(
    key: AsyncableKeyLike<Key>,
    value: AsyncableValueLike<Val>
  ): AsyncPatternWhen<AsyncableKeyLike<Key>, AsyncableValueLike<Val>> {
    return new AsyncPatternWhen<Key, Val>(this.config, this.rootKey, [
      ...this.states,
      { key, value },
    ]);
  }
  async otherwise(otherwise: AsyncableValueLike<Val>): Promise<Val> {
    let matched: MatchState<
      AsyncableKeyLike<Key>,
      AsyncableValueLike<Val>
    > | null = null;

    for (const s of this.states) {
      const rootKey = await resolveMaybeCallable(this.rootKey);
      const key = await resolveMaybeCallable(s.key);

      if (this.config.compare(rootKey, key)) {
        matched = s;
        break;
      }
    }

    return resolveMaybeCallable(matched ? matched.value : otherwise);
  }
}

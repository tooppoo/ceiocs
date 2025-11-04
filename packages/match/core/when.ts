import { resolveMaybeCallable } from "../../common/resolve-maybe-callable";
import type { MaybeAsync, MaybeCallable, MustSync } from "../../common/value-type";
import type { MatchConfig } from "./config";
import type { AsyncableKeyLike, KeyLike } from "./type";

type ValueLike<T> = MustSync<T, MaybeCallable<T>>;
type AsyncableValueLike<T> = MaybeCallable<MaybeAsync<T>>;

interface MatchState<Key, Val> {
  key: Key;
  value: Val;
}

export class HeadOfWhen<Comparable, Key extends Comparable = Comparable> {
  constructor(
    private readonly config: MatchConfig<Comparable>,
    private readonly rootKey: KeyLike<Key>
  ) {}

  when<Val>(key: KeyLike<Key>, value: ValueLike<Val>): When<Comparable, Key, Val> {
    return new When<Comparable, Key, Val>(this.config, this.rootKey, [
      { key, value },
    ]);
  }

  get async(): AsyncHeadOfWhen<Comparable, Key> {
    return new AsyncHeadOfWhen<Comparable, Key>(this.config, this.rootKey);
  }
}

export class AsyncHeadOfWhen<Comparable, Key extends Comparable = Comparable> {
  constructor(
    private readonly config: MatchConfig<Comparable>,
    private readonly rootKey: AsyncableKeyLike<Key>
  ) {}

  when<Val>(
    key: AsyncableKeyLike<Key>,
    value: AsyncableValueLike<Val>
  ): AsyncWhen<Comparable, Key, Val> {
    return new AsyncWhen<Comparable, Key, Val>(this.config, this.rootKey, [
      { key, value },
    ]);
  }
}

class When<Comparable, Key extends Comparable, Val> {
  constructor(
    private readonly config: MatchConfig<Comparable>,
    private readonly rootKey: KeyLike<Key>,
    private readonly states: Array<MatchState<KeyLike<Key>, ValueLike<Val>>>
  ) {}

  when(key: KeyLike<Key>, value: ValueLike<Val>): When<Comparable, Key, Val> {
    return new When<Comparable, Key, Val>(this.config, this.rootKey, [
      ...this.states,
      { key, value },
    ]);
  }

  otherwise(otherwise: ValueLike<Val>): Val {
    const matched = this.states.find((s) =>
      this.config.compare(
        resolveMaybeCallable<Key>(s.key),
        resolveMaybeCallable<Key>(this.rootKey)
      )
    );

    return resolveMaybeCallable<Val>(matched ? matched.value : otherwise);
  }

  get async(): AsyncWhen<Comparable, Key, Val> {
    return new AsyncWhen<Comparable, Key, Val>(this.config, this.rootKey, this.states);
  }
}

class AsyncWhen<Comparable, Key extends Comparable, Val> {
  constructor(
    private readonly config: MatchConfig<Comparable>,
    private readonly rootKey: AsyncableKeyLike<Key>,
    private readonly states: Array<
      MatchState<AsyncableKeyLike<Key>, AsyncableValueLike<Val>>
    >
  ) {}

  when(
    key: AsyncableKeyLike<Key>,
    value: AsyncableValueLike<Val>
  ): AsyncWhen<Comparable, Key, Val> {
    return new AsyncWhen<Comparable, Key, Val>(this.config, this.rootKey, [
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

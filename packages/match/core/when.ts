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

  /**
   * Registers the first `when` clause that will be compared against the root key and returns a builder for additional clauses.
   *
   * @example
   * ```ts
   * const chain = match
   *   .case(code)
   *   .when(200, "OK");
   * ```
   */
  when<Val>(key: KeyLike<Key>, value: ValueLike<Val>): When<Comparable, Key, Val> {
    return new When<Comparable, Key, Val>(this.config, this.rootKey, [
      { key, value },
    ]);
  }

  /**
   * Switches to an asynchronous matching head so the same root key can be reused while conditions or values resolve from promises.
   */
  get async(): AsyncHeadOfWhen<Comparable, Key> {
    return new AsyncHeadOfWhen<Comparable, Key>(this.config, this.rootKey);
  }
}

export class AsyncHeadOfWhen<Comparable, Key extends Comparable = Comparable> {
  constructor(
    private readonly config: MatchConfig<Comparable>,
    private readonly rootKey: AsyncableKeyLike<Key>
  ) {}

  /**
   * Stores a key/value pair that may resolve asynchronously and returns an `AsyncWhen` builder for additional clauses.
   */
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

  /**
   * Adds another case to the existing `when` chain; evaluation always follows the order in which cases were appended.
   */
  when(key: KeyLike<Key>, value: ValueLike<Val>): When<Comparable, Key, Val> {
    return new When<Comparable, Key, Val>(this.config, this.rootKey, [
      ...this.states,
      { key, value },
    ]);
  }

  /**
   * Defines the fallback value when none of the registered `when` clauses match the root key.
   * Only the matching branch (or the provided fallback) is resolved, keeping every other lazy value untouched.
   *
   * @example
   * ```ts
   * const message = match
   *   .case(role)
   *   .when("admin", "administrator")
   *   .otherwise("unknown");
   * ```
   */
  otherwise(otherwise: ValueLike<Val>): Val {
    const matched = this.states.find((s) =>
      this.config.compare(
        resolveMaybeCallable<Key>(s.key),
        resolveMaybeCallable<Key>(this.rootKey)
      )
    );

    return resolveMaybeCallable<Val>(matched ? matched.value : otherwise);
  }

  /**
   * Converts the synchronous chain into an `AsyncWhen` builder while keeping every recorded case intact.
   */
  get async(): AsyncWhen<Comparable, Key, Val> {
    return new AsyncWhen<Comparable, Key, Val>(this.config, this.rootKey, this.states);
  }
  
  /**
   * Serializes the current `case`/`when` structure into a readable string for debugging evaluation order.
   */
  toString(): string {
    return stringifyMatch(this.rootKey, this.states as any);
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

  /**
   * Appends another asynchronous (or synchronous) `when` clause to the chain started by `AsyncHeadOfWhen`.
   */
  when(
    key: AsyncableKeyLike<Key>,
    value: AsyncableValueLike<Val>
  ): AsyncWhen<Comparable, Key, Val> {
    return new AsyncWhen<Comparable, Key, Val>(this.config, this.rootKey, [
      ...this.states,
      { key, value },
    ]);
  }

  /**
   * Evaluates each `when` clause asynchronously, resolving the first match and short-circuiting the rest.
   * If no case matches, the fallback is resolved so expensive work is performed only when required.
   *
   * @example
   * ```ts
   * const status = await match.async
   *   .match(loadStatus)
   *   .when("done", () => fetchMessage())
   *   .otherwise("pending");
   * ```
   */
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
  
  /**
   * Serializes the asynchronous `case`/`when` definition to highlight the current order of comparisons and their values.
   */
  toString(): string {
    return stringifyMatch(this.rootKey, this.states as any);
  }
}

function stringifyMatch(
  rootKey: unknown,
  states: ReadonlyArray<MatchState<unknown, unknown>>
): string {
  const top = `case (${rootKey})\x20{\n`;
  const lines = states
    .map(({ key, value }) => `  when ${key}: ${value};\n`)
    .join("");
  const end = `}\n`;
  return `${top}${lines}${end}`;
}
 

import { type Comparator, MatchConfig } from "./config";
import type { AsyncableKeyLike, KeyLike } from "./type";
import { AsyncHeadOfWhen, HeadOfWhen } from "./when";

export class Matcher<TComparable = unknown> {
  constructor(
    private readonly config: MatchConfig<TComparable> = MatchConfig.defaultFor<TComparable>()
  ) {}

  /**
   * Registers the root key to compare against and starts a synchronous matching chain.
   *
   * @example
   * ```ts
   * const result = match
   *   .case(status)
   *   .when("pending", "processing")
   *   .otherwise("unknown");
   * ```
   */
  case<Key extends TComparable = TComparable>(rootKey: KeyLike<Key>): HeadOfWhen<TComparable, Key> {
    return new HeadOfWhen<TComparable, Key>(this.config, rootKey);
  }

  /**
   * Returns an asynchronous matcher that reuses the same comparison configuration so keys or values may be resolved from promises.
   */
  get async(): AsyncMatcher<TComparable> {
    return new AsyncMatcher<TComparable>(this.config);
  }

  /**
   * Replaces the comparison function used to match keys so domain-specific equality rules (e.g., comparing IDs) can be applied.
   *
   * @example
   * ```ts
   * const byId = match.compareBy((a: User, b: User) => a.id === b.id);
   * const result = byId
   *   .case(currentUser)
   *   .when(candidateUser, "same user")
   *   .otherwise("others");
   * ```
   */
  compareBy<Next>(matcher: Comparator<Next>): Matcher<Next> {
    return new Matcher<Next>(this.config.changeMatcher(matcher));
  }
}

class AsyncMatcher<TComparable> {
  constructor(private readonly config: MatchConfig<TComparable>) {}

  /**
   * Accepts a key that may resolve asynchronously and returns a head that can build `when/otherwise` clauses using the same config.
   *
   * @example
   * ```ts
   * const message = await match.async
   *   .match(loadStatus())
   *   .when("success", "done")
   *   .otherwise("failed");
   * ```
   */
  match<Key extends TComparable = TComparable>(rootKey: AsyncableKeyLike<Key>): AsyncHeadOfWhen<TComparable, Key> {
    return new AsyncHeadOfWhen<TComparable, Key>(this.config, rootKey);
  }
}

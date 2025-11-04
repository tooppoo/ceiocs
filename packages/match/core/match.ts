import { type Comparator, MatchConfig } from "./config";
import type { AsyncableKeyLike, KeyLike } from "./type";
import { AsyncHeadOfWhen, HeadOfWhen } from "./when";

export class Matcher<TComparable = unknown> {
  constructor(
    private readonly config: MatchConfig<TComparable> = MatchConfig.defaultFor<TComparable>()
  ) {}

  case<Key extends TComparable = TComparable>(rootKey: KeyLike<Key>): HeadOfWhen<TComparable, Key> {
    return new HeadOfWhen<TComparable, Key>(this.config, rootKey);
  }

  get async(): AsyncMatcher<TComparable> {
    return new AsyncMatcher<TComparable>(this.config);
  }

  compareBy<Next>(matcher: Comparator<Next>): Matcher<Next> {
    return new Matcher<Next>(this.config.changeMatcher(matcher));
  }
}

class AsyncMatcher<TComparable> {
  constructor(private readonly config: MatchConfig<TComparable>) {}

  match<Key extends TComparable = TComparable>(rootKey: AsyncableKeyLike<Key>): AsyncHeadOfWhen<TComparable, Key> {
    return new AsyncHeadOfWhen<TComparable, Key>(this.config, rootKey);
  }
}

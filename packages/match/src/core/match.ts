import { Comparator, MatchConfig } from './config'
import { AsyncableKeyLike, KeyLike } from './type'
import { AsyncHeadOfWhen, HeadOfWhen } from './when'

export class Matcher {
  constructor(private readonly config: MatchConfig = MatchConfig.default) {}

  case<Key>(rootKey: KeyLike<Key>): HeadOfWhen<Key> {
    return new HeadOfWhen(this.config, rootKey);
  }

  get async(): AsyncMatcher {
    return new AsyncMatcher(this.config);
  }

  compareBy<T>(matcher: Comparator<T>): Matcher {
    return new Matcher(this.config.changeMatcher(matcher));
  }
}
class AsyncMatcher {
  constructor(private readonly config: MatchConfig = MatchConfig.default) {}

  match<Key>(rootKey: AsyncableKeyLike<Key>): AsyncHeadOfWhen<Key> {
    return new AsyncHeadOfWhen(this.config, rootKey);
  }
}

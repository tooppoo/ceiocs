export class MatchConfig<T = any> {
  static readonly default: MatchConfig = new MatchConfig((a, b) => a === b);

  constructor(readonly compare: Comparator<T>) {}

  changeMatcher(matcher: Comparator<T>): MatchConfig {
    return new MatchConfig(matcher);
  }
}

export type Comparator<T> = (a: T, b: T) => boolean;

export class MatchConfig<T = unknown> {
  static defaultFor<T>(): MatchConfig<T> {
    return new MatchConfig<T>((a, b) => a === b);
  }

  static readonly default: MatchConfig<unknown> = MatchConfig.defaultFor<unknown>();

  constructor(readonly compare: Comparator<T>) {}

  changeMatcher<Next>(matcher: Comparator<Next>): MatchConfig<Next> {
    return new MatchConfig<Next>(matcher);
  }
}

export type Comparator<T> = (a: T, b: T) => boolean;

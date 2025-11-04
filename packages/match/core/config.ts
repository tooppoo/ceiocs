export class MatchConfig<T = unknown> {
  static readonly default: MatchConfig<unknown> = new MatchConfig<unknown>(
    (a, b) => a === b
  );

  constructor(readonly compare: Comparator<T>) {}

  changeMatcher(matcher: Comparator<T>): MatchConfig<T> {
    return new MatchConfig<T>(matcher);
  }
}

export type Comparator<T> = (a: T, b: T) => boolean;

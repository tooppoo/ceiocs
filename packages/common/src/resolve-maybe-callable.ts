const isCallable = (val: any): val is Function =>
  val instanceof Function || (val.bind && val.call && val.apply);

export const resolveMaybeCallable = <T>(v: (() => T) | T): T =>
  isCallable(v) ? v() : v;

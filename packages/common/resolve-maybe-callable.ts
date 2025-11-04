import type { MaybeCallable } from "./src/value-type";

const isCallable = <T>(val: any): val is () => T =>
  val instanceof Function || (val.bind && val.call && val.apply);

export const resolveMaybeCallable = <T>(v: MaybeCallable<T>): T =>
  isCallable(v) ? v() : v;

import type { MaybeCallable } from "./value-type";

const isCallable = <T>(value: unknown): value is () => T =>
  typeof value === "function";

export const resolveMaybeCallable = <T>(value: MaybeCallable<T>): T =>
  isCallable(value) ? value() : value;

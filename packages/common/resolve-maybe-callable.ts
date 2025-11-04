import type { MaybeCallable, MustSync } from "./value-type";

const isCallable = <T>(value: unknown): value is () => T =>
  typeof value === "function";

export function resolveMaybeCallable<T>(value: MaybeCallable<T>): T;
export function resolveMaybeCallable<T>(
  value: MustSync<T, MaybeCallable<T>>
): T;
export function resolveMaybeCallable<T>(value: MaybeCallable<T>): T {
  return isCallable(value) ? value() : value;
}

const isCallable = (v: any): v is Function =>
  v instanceof Function ||
  (!!v && typeof v.call === "function" && typeof v.bind === "function");

export function resolve<T>(
  maybeFunc: Promise<T> | (() => Promise<T>)
): Promise<T>;
export function resolve<T>(maybeFunc: T | (() => T)): T;
export function resolve<T>(
  maybeFunc: Promise<T> | (() => Promise<T>) | T | (() => T)
): T | Promise<T> {
  return isCallable(maybeFunc) ? maybeFunc() : maybeFunc;
}

import { resolveMaybeCallable } from "./resolve-maybe-callable";

import { describe, expect, it } from "bun:test";

describe("resolveMaybeCallable", () => {
  describe.each([
    ["a"],
    [(): string => "a"],
    [
      function named(): string {
        return "a";
      },
    ],
  ])("%p", (funcOrVal) => {
    it("should resolved", () => {
      expect(resolveMaybeCallable<string>(funcOrVal)).toEqual("a");
    });
  });
});

import { resolveMaybeCallable } from "../src/resolve-maybe-callable";

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
      expect(resolveMaybeCallable(funcOrVal)).toStrictEqual("a");
    });
  });
});

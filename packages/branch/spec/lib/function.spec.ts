import { resolve } from "@branch/lib/functions";

describe(resolve, () => {
  describe.each([
    ["a"],
    [(): string => "a"],
    [
      function named(): string {
        return "a";
      }
    ]
  ])("%p", funcOrVal => {
    it("should resolved", () => {
      expect(resolve(funcOrVal)).toStrictEqual("a");
    });
  });
});

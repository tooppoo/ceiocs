import { pattern } from "../src";

describe("match", () => {
  describe("sync", () => {
    describe.each([
      [
        'pattern.match (a) case a => "pattern a" case b => "pattern b" otherwise => "default"',
        pattern
          .match("a")
          .when("a", "pattern a")
          .when("b", "pattern b")
          .otherwise("default"),
        "pattern a",
      ],
      [
        'pattern.match (b) case a => "pattern a" case b => "pattern b" otherwise => "default"',
        pattern
          .match("b")
          .when("a", "pattern a")
          .when("b", "pattern b")
          .otherwise("default"),
        "pattern b",
      ],
      [
        'pattern.match (x) case a => "pattern a" case b => "pattern b" otherwise => "default"',
        pattern
          .match("x")
          .when("a", "pattern a")
          .when("b", "pattern b")
          .otherwise("default"),
        "default",
      ],
      [
        'pattern.match (() => a) case a => "pattern a" case b => "pattern b" otherwise => "default"',
        pattern
          .match(() => "a")
          .when("a", "pattern a")
          .when("b", "pattern b")
          .otherwise("default"),
        "pattern a",
      ],
      [
        'pattern.match (b) case a => "pattern a" case () => b => "pattern b" otherwise => "default"',
        pattern
          .match("b")
          .when("a", "pattern a")
          .when(() => "b", "pattern b")
          .otherwise("default"),
        "pattern b",
      ],
    ])("when %s", (_case, actual, expected) => {
      it(`should return ${expected}`, () => {
        expect(actual).toBe(expected);
      });
    });
  });
});

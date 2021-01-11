import { match } from "@match/index";

describe("match", () => {
  describe("sync", () => {
    describe.each([
      [
        'match.case (a) case a => "case a" case b => "case b" otherwise => "default"',
        match
          .case<string>("a")
          .when<string>("a", "case a")
          .when("b", "case b")
          .otherwise("default"),
        "case a",
      ],
      [
        'match.case (b) case a => "case a" case b => "case b" otherwise => "default"',
        match
          .case<string>("b")
          .when<string>("a", "case a")
          .when("b", "case b")
          .otherwise("default"),
        "case b",
      ],
      [
        'match.case (x) case a => "case a" case b => "case b" otherwise => "default"',
        match
          .case<string>("x")
          .when<string>("a", "case a")
          .when("b", "case b")
          .otherwise("default"),
        "default",
      ],
      [
        'match.case (() => a) case a => "case a" case b => "case b" otherwise => "default"',
        match
          .case(() => "a")
          .when<string>("a", "case a")
          .when("b", "case b")
          .otherwise("default"),
        "case a",
      ],
      [
        'match.case (b) case a => "case a" case () => b => "case b" otherwise => "default"',
        match
          .case<string>("b")
          .when<string>("a", "case a")
          .when(() => "b", "case b")
          .otherwise("default"),
        "case b",
      ],
      [
        'match.case (a) case a => () => "case a" case b => "case b" otherwise => "default"',
        match
          .case<string>("a")
          .when("a", () => "case a")
          .when("b", "case b")
          .otherwise("default"),
        "case a",
      ],
      [
        'match.case (a) case a => "case a" case b => () => "case b" otherwise => "default"',
        match
          .case<string>("b")
          .when<string>("a", "case a")
          .when("b", () => "case b")
          .otherwise("default"),
        "case b",
      ],
      [
        'match.case (x) case a => "case a" case b => "case b" otherwise => () => "default"',
        match
          .case<string>("x")
          .when<string>("a", "case a")
          .when("b", "case b")
          .otherwise(() => "default"),
        "default",
      ],
      [
        'match.case (() => a) case () => a => () => "case a" case b => "case b" otherwise => () => "default"',
        match
          .case(() => "a")
          .when(
            () => "a",
            () => "case a"
          )
          .when("b", "case b")
          .otherwise("default"),
        "case a",
      ],
    ])("when %s", (_case, actual, expected) => {
      it(`should return ${expected}`, () => {
        expect(actual).toBe(expected);
      });
    });
  });
  describe("async", () => {
    describe.each([
      [
        'match.case (async a) case a => "case a" case b => "case b" otherwise => "default"',
        match.async
          .match(Promise.resolve("a"))
          .when("a", "case a")
          .when("b", "case b")
          .otherwise("default"),
        "case a",
      ],
      [
        'match.case (a) case a => async "case a" case b => async "case b" otherwise => "default"',
        match
          .case<string>("b")
          .async.when("a", Promise.resolve("case a"))
          .when("b", Promise.resolve("case b"))
          .otherwise("default"),
        "case b",
      ],
      [
        'match.case (x) case a => "case a" case b => async () => "case b" otherwise => "default"',
        match
          .case<string>("x")
          .when<string>("a", "case a")
          .async.when("b", Promise.resolve("case b"))
          .otherwise("default"),
        "default",
      ],
      [
        'match.case (x) case a => "case a" case b => "case b" otherwise => async "default"',
        match
          .case<string>("x")
          .when<string>("a", "case a")
          .when("b", "case b")
          .async.otherwise(Promise.resolve("default")),
        "default",
      ],
      [
        "use async callback on key",
        match.async
          .match(async () => "b")
          .when(async () => "a", "case a")
          .when(async () => "b", "case b")
          .otherwise("default"),
        "case b",
      ],
      [
        "use async callback on value",
        match.async
          .match(async () => "x")
          .when(
            async () => "a",
            async () => "case a"
          )
          .when(
            async () => "b",
            async () => "case b"
          )
          .otherwise("default"),
        "default",
      ],
      [
        "mix async callback",
        match.async
          .match(async () => "x")
          .when("a", async () => "case a")
          .when(
            () => "b",
            () => "case b"
          )
          .otherwise("default"),
        "default",
      ],
    ])("when %s", (_case, actual, expected) => {
      it(`should return ${expected}`, async () =>
        expect(actual).resolves.toBe(expected));
    });
  });
  describe("compareBy object", () => {
    interface TestObject {
      value: number;
    }

    describe("local", () => {
      const matchLocal = match.compareBy(
        (a: TestObject, b: TestObject) => a.value === b.value
      );

      describe.each([
        [
          "first matched",
          matchLocal
            .case({ value: 1 })
            .when<string>({ value: 1 }, "matched")
            .when({ value: 2 }, "not match")
            .otherwise("default"),
        ],
        [
          "second matched",
          matchLocal
            .case({ value: 1 })
            .when<string>({ value: 2 }, "not match")
            .when({ value: 1 }, "matched")
            .otherwise("default"),
        ],
        [
          "otherwise matched",
          matchLocal
            .case({ value: 1 })
            .when<string>({ value: 2 }, "not match")
            .when({ value: 2 }, "not match")
            .otherwise("matched"),
        ],
      ])("when %s", (_case, actual) => {
        it("should return matched", () => {
          expect(actual).toBe("matched");
        });
      });
    });
  });
});

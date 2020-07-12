import { match } from "../src";

describe("match", () => {
  describe("sync", () => {
    describe.each([
      [
        'case.case (a) case a => "case a" case b => "case b" otherwise => "default"',
        match
          .case("a")
          .when("a", "case a")
          .when("b", "case b")
          .otherwise("default"),
        "case a",
      ],
      [
        'case.case (b) case a => "case a" case b => "case b" otherwise => "default"',
        match
          .case("b")
          .when("a", "case a")
          .when("b", "case b")
          .otherwise("default"),
        "case b",
      ],
      [
        'case.case (x) case a => "case a" case b => "case b" otherwise => "default"',
        match
          .case("x")
          .when("a", "case a")
          .when("b", "case b")
          .otherwise("default"),
        "default",
      ],
      [
        'case.case (() => a) case a => "case a" case b => "case b" otherwise => "default"',
        match
          .case(() => "a")
          .when("a", "case a")
          .when("b", "case b")
          .otherwise("default"),
        "case a",
      ],
      [
        'case.case (b) case a => "case a" case () => b => "case b" otherwise => "default"',
        match
          .case("b")
          .when("a", "case a")
          .when(() => "b", "case b")
          .otherwise("default"),
        "case b",
      ],
      [
        'case.case (a) case a => () => "case a" case b => "case b" otherwise => "default"',
        match
          .case("a")
          .when("a", () => "case a")
          .when("b", "case b")
          .otherwise("default"),
        "case a",
      ],
      [
        'case.case (a) case a => "case a" case b => () => "case b" otherwise => "default"',
        match
          .case("b")
          .when("a", "case a")
          .when("b", () => "case b")
          .otherwise("default"),
        "case b",
      ],
      [
        'case.case (x) case a => "case a" case b => "case b" otherwise => () => "default"',
        match
          .case("x")
          .when("a", "case a")
          .when("b", "case b")
          .otherwise(() => "default"),
        "default",
      ],
      [
        'case.case (() => a) case () => a => () => "case a" case b => "case b" otherwise => () => "default"',
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
  describe('async', () => {
    describe.each([
      [
        'case.case (async a) case a => "case a" case b => "case b" otherwise => "default"',
        match.async
          .match(Promise.resolve('a'))
          .when('a', 'case a')
          .when('b', 'case b')
          .otherwise('default'),
        'case a'
      ],
      [
        'case.case (a) case a => async "case a" case b => async "case b" otherwise => "default"',
        match
          .case('b').async
          .when('a', Promise.resolve('case a'))
          .when('b', Promise.resolve('case b'))
          .otherwise('default'),
        'case b'
      ],
      [
        'case.case (x) case a => async "case a" case b => async () => "case b" otherwise => "default"',
        match
          .case('x').async
          .when('a', Promise.resolve('case a'))
          .when('b', Promise.resolve('case b'))
          .otherwise('default'),
        'default'
      ],
      [
        'use async callback on key',
        match.async
          .match(async () => 'b')
          .when(async () => 'a', 'case a')
          .when(async () => 'b', 'case b')
          .otherwise('default'),
        'case b'
      ],
      [
        'use async callback on value',
        match.async
          .match(async () => 'x')
          .when(async () => 'a', async () => 'case a')
          .when(async () => 'b', async () => 'case b')
          .otherwise('default'),
        'default'
      ],
      [
        'mix async callback',
        match.async
          .match(async () => 'x')
          .when('a', async () => 'case a')
          .when(() => 'b', () => 'case b')
          .otherwise('default'),
        'default'
      ],
    ])(
      'when %s',
      (_case, actual, expected) => {
        it(`should return ${expected}`, async () =>
          expect(actual).resolves.toBe(expected)
        )
      }
    )
  })
});

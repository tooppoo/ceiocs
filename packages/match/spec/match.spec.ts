import { cases } from "../src";

describe("match", () => {
  describe("sync", () => {
    describe.each([
      [
        'cases.match (a) case a => "cases a" case b => "cases b" otherwise => "default"',
        cases
          .match("a")
          .when("a", "cases a")
          .when("b", "cases b")
          .otherwise("default"),
        "cases a",
      ],
      [
        'cases.match (b) case a => "cases a" case b => "cases b" otherwise => "default"',
        cases
          .match("b")
          .when("a", "cases a")
          .when("b", "cases b")
          .otherwise("default"),
        "cases b",
      ],
      [
        'cases.match (x) case a => "cases a" case b => "cases b" otherwise => "default"',
        cases
          .match("x")
          .when("a", "cases a")
          .when("b", "cases b")
          .otherwise("default"),
        "default",
      ],
      [
        'cases.match (() => a) case a => "cases a" case b => "cases b" otherwise => "default"',
        cases
          .match(() => "a")
          .when("a", "cases a")
          .when("b", "cases b")
          .otherwise("default"),
        "cases a",
      ],
      [
        'cases.match (b) case a => "cases a" case () => b => "cases b" otherwise => "default"',
        cases
          .match("b")
          .when("a", "cases a")
          .when(() => "b", "cases b")
          .otherwise("default"),
        "cases b",
      ],
      [
        'cases.match (a) case a => () => "cases a" case b => "cases b" otherwise => "default"',
        cases
          .match("a")
          .when("a", () => "cases a")
          .when("b", "cases b")
          .otherwise("default"),
        "cases a",
      ],
      [
        'cases.match (a) case a => "cases a" case b => () => "cases b" otherwise => "default"',
        cases
          .match("b")
          .when("a", "cases a")
          .when("b", () => "cases b")
          .otherwise("default"),
        "cases b",
      ],
      [
        'cases.match (x) case a => "cases a" case b => "cases b" otherwise => () => "default"',
        cases
          .match("x")
          .when("a", "cases a")
          .when("b", "cases b")
          .otherwise(() => "default"),
        "default",
      ],
      [
        'cases.match (() => a) case () => a => () => "cases a" case b => "cases b" otherwise => () => "default"',
        cases
          .match(() => "a")
          .when(
            () => "a",
            () => "cases a"
          )
          .when("b", "cases b")
          .otherwise("default"),
        "cases a",
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
        'cases.match (async a) case a => "cases a" case b => "cases b" otherwise => "default"',
        cases.async
          .match(Promise.resolve('a'))
          .when('a', 'cases a')
          .when('b', 'cases b')
          .otherwise('default'),
        'cases a'
      ],
      [
        'cases.match (a) case a => async "cases a" case b => async "cases b" otherwise => "default"',
        cases
          .match('b').async
          .when('a', Promise.resolve('cases a'))
          .when('b', Promise.resolve('cases b'))
          .otherwise('default'),
        'cases b'
      ],
      [
        'cases.match (x) case a => async "cases a" case b => async () => "cases b" otherwise => "default"',
        cases
          .match('x').async
          .when('a', Promise.resolve('cases a'))
          .when('b', Promise.resolve('cases b'))
          .otherwise('default'),
        'default'
      ],
      [
        'use async callback on key',
        cases.async
          .match(async () => 'b')
          .when(async () => 'a', 'cases a')
          .when(async () => 'b', 'cases b')
          .otherwise('default'),
        'cases b'
      ],
      [
        'use async callback on value',
        cases.async
          .match(async () => 'x')
          .when(async () => 'a', async () => 'cases a')
          .when(async () => 'b', async () => 'cases b')
          .otherwise('default'),
        'default'
      ],
      [
        'mix async callback',
        cases.async
          .match(async () => 'x')
          .when('a', async () => 'cases a')
          .when(() => 'b', () => 'cases b')
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

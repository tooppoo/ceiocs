import { branch } from "./index";

import { beforeEach, describe, expect, it, mock } from "bun:test";

describe("branch", () => {
  describe("sync", () => {
    describe("if", () => {
      describe.each([
        [
          "if(true) { a } elseif(true) { b } else { c }",
          branch.if<string>(true, "a").elseif(true, "b").else("c"),
          "a",
        ],
        [
          "if(lazy true) { a } elseif(true) { b } else { c }",
          branch
            .if<string>(() => true, "a")
            .elseif(() => true, "b")
            .else("c"),
          "a",
        ],
        [
          "if(true) { lazy a } elseif(true) { b } else { c }",
          branch
            .if(true, () => "a")
            .elseif(() => true, "b")
            .else("c"),
          "a",
        ],
        [
          "if(lazy true) { lazy a } elseif(true) { b } else { c }",
          branch
            .if(
              () => true,
              () => "a"
            )
            .elseif(() => true, "b")
            .else("c"),
          "a",
        ],
      ])("%s", (_name, actual, expected) => {
        it(`should be ${expected}`, () => {
          expect(actual).toBe(expected);
        });
      });
    });
    describe("elseif", () => {
      describe.each([
        [
          "if(false) { a } elseif(true) { b } else { c }",
          branch.if<string>(false, "a").elseif(true, "b").else("c"),
          "b",
        ],
        [
          "if(false) { a } elseif(lazy true) { b } else { c }",
          branch
            .if<string>(false, "a")
            .elseif(() => true, "b")
            .else("c"),
          "b",
        ],
        [
          "if(false) { a } elseif(true) { lazy b } else { c }",
          branch
            .if<string>(false, "a")
            .elseif(true, () => "b")
            .else("c"),
          "b",
        ],
        [
          "if(false) { a } elseif(lazy true) { lazy b } else { c }",
          branch
            .if<string>(false, "a")
            .elseif(
              () => true,
              () => "b"
            )
            .else("c"),
          "b",
        ],
      ])("%s", (_name, actual, expected) => {
        it(`should be ${expected}`, () => {
          expect(actual).toBe(expected);
        });
      });
    });
    describe("else", () => {
      describe.each([
        [
          "if(false) { a } elseif(false) { b } else { c }",
          branch.if<string>(false, "a").elseif(false, "b").else("c"),
          "c",
        ],
        [
          "if(false) { a } elseif(false) { b } else { lazy c }",
          branch
            .if<string>(false, "a")
            .elseif(false, "b")
            .else(() => "c"),
          "c",
        ],
      ])("%s", (_name, actual, expected) => {
        it(`should be ${expected}`, () => {
          expect(actual).toStrictEqual(expected);
        });
      });
    });
  });
  describe("async", () => {
    describe("if", () => {
      describe.each([
        [
          "if(async true) { a } elseif(true) { b } else { c }",
          branch.async
            .if(Promise.resolve(true), "a")
            .elseif(true, "b")
            .else("c"),
          "a",
        ],
        [
          "if(true) { async a } elseif(true) { b } else { c }",
          branch.async
            .if(true, Promise.resolve("a"))
            .elseif(true, "b")
            .else("c"),
          "a",
        ],
        [
          "if(async lazy true) { a } elseif(true) { b } else { c }",
          branch.async
            .if(async () => true, "a")
            .elseif(true, "b")
            .else("c"),
          "a",
        ],
        [
          "if(true) { async lazy a } elseif(true) { b } else { c }",
          branch.async
            .if(async () => true, "a")
            .elseif(true, "b")
            .else("c"),
          "a",
        ],
        [
          "if(async lazy true) { async lazy a } elseif(true) { b } else { c }",
          branch.async
            .if(async () => true, "a")
            .elseif(true, "b")
            .else("c"),
          "a",
        ],
      ])("%s", (_name, actual, expected) => {
        it(`should be ${actual}`, () => {
          return expect(actual).resolves.toBe(expected);
        });
      });
    });
    describe("elseif", () => {
      describe.each([
        [
          "if(false) { a } elseif(async true) { b } else { c }",
          branch
            .if<string>(false, "a")
            .async.elseif(Promise.resolve(true), "b")
            .else("c"),
          "b",
        ],
        [
          "if(false) { a } elseif(async lazy true) { b } else { c }",
          branch
            .if<string>(false, "a")
            .async.elseif(async () => true, "b")
            .else("c"),
          "b",
        ],
        [
          "if(false) { a } elseif(true) { async b } else { c }",
          branch
            .if<string>(false, "a")
            .async.elseif(true, Promise.resolve("b"))
            .else("c"),
          "b",
        ],
        [
          "if(false) { a } elseif(true) { async lazy b } else { c }",
          branch
            .if<string>(false, "a")
            .async.elseif(true, async () => "b")
            .else("c"),
          "b",
        ],
        [
          "if(false) { a } elseif(async lazy true) { async lazy b } else { c }",
          branch
            .if<string>(false, "a")
            .async.elseif(
              async () => true,
              async () => "b"
            )
            .else("c"),
          "b",
        ],
      ])("%s", (_name, actual, expected) => {
        it(`should be ${actual}`, () => {
          return expect(actual).resolves.toBe(expected);
        });
      });
    });
    describe("else", () => {
      describe.each([
        [
          "if(false) { a } elseif(false) { b } else { async c }",
          branch
            .if<string>(false, "a")
            .async.elseif(false, "b")
            .else(Promise.resolve("c")),
          "c",
        ],
        [
          "if(false) { a } elseif(false) { b } else { async lazy c }",
          branch
            .if<string>(false, "a")
            .async.elseif(false, "b")
            .else(async () => "c"),
          "c",
        ],
      ])("%s", (_name, actual, expected) => {
        it(`should be ${expected}`, () => {
          return expect(actual).resolves.toStrictEqual(expected);
        });
      });
    });
  });

  describe("lazy call", () => {
    type Pair = { cond: () => boolean; act: () => boolean };
    let p1: Pair;
    let p2: Pair;
    let other: () => boolean;

    beforeEach(() => {
      p1 = {
        cond: mock(() => false),
        act: mock(() => true),
      };
      p2 = {
        cond: mock(() => false),
        act: mock(() => true),
      };
      other = mock(() => false);
    })

    describe.each([
      [
        () => {
          p1.cond = mock(() => true)
        },
        () =>
          branch.if(p1.cond, p1.act).elseif(p2.cond, p2.act).else(other),
        (): unknown[] => [p1.cond],
        (): unknown[] => [p2.cond, p2.act, other],
      ],
      [
        (): void => {
          p1.cond = mock(() => false);
          p2.cond = mock(() => true);
        },
        (): unknown =>
          branch.if(p1.cond, p1.act).elseif(p2.cond, p2.act).else(other),
        (): unknown[] => [p1.cond, p2.cond, p2.act],
        (): unknown[] => [p1.act, other],
      ],
      [
        (): void => {
          p1.cond = mock(() => false);
          p2.cond = mock(() => false);
        },
        (): unknown =>
          branch.if(p1.cond, p1.act).elseif(p2.cond, p2.act).else(other),
        (): unknown[] => [p1.cond, p2.cond, other],
        (): unknown[] => [p1.act, p2.act],
      ],
    ])("when condition is satisfied", (arrange, act, called, notCalled) => {
      it("only call function corresponding to the condigion", () => {
        arrange();

        act();

        called().forEach((f) => { expect(f).toBeCalled() });
        notCalled().forEach((f) => { expect(f).not.toBeCalled() });
      });
    });
  });
});

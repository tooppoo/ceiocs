import { branch } from "@branch/index";

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
    type Pair = { cond: jest.Mock; act: jest.Mock };
    let p1: Pair;
    let p2: Pair;
    let other: jest.Mock;

    beforeEach(() => {
      p1 = { cond: jest.fn(), act: jest.fn() };
      p2 = { cond: jest.fn(), act: jest.fn() };
      other = jest.fn();
    });

    describe.each([
      [
        (): unknown => p1.cond.mockReturnValue(true),
        (): any =>
          branch.if(p1.cond, p1.act).elseif(p2.cond, p2.act).else(other),
        (): any[] => [p1.cond],
        (): any[] => [p2.cond, p2.act, other],
      ],
      [
        (): void => {
          p1.cond.mockReturnValue(false);
          p2.cond.mockReturnValue(true);
        },
        (): any =>
          branch.if(p1.cond, p1.act).elseif(p2.cond, p2.act).else(other),
        (): any[] => [p1.cond, p2.cond, p2.act],
        (): any[] => [p1.act, other],
      ],
      [
        (): void => {
          p1.cond.mockReturnValue(false);
          p2.cond.mockReturnValue(false);
        },
        (): any =>
          branch.if(p1.cond, p1.act).elseif(p2.cond, p2.act).else(other),
        (): any[] => [p1.cond, p2.cond, other],
        (): any[] => [p1.act, p2.act],
      ],
    ])("when condition is satisfied", (arrange, act, called, notCalled) => {
      it("only call function corresponding to the condigion", () => {
        arrange();

        act();

        called().forEach((f) => expect(f).toBeCalled());
        notCalled().forEach((f) => expect(f).not.toBeCalled());
      });
    });
  });

  describe("then", () => {
    describe("sync", () => {
      describe("if then", () => {
        describe.each([
          [
            "if (true) then { a } elseif(true) then { b } else { c }",
            branch.if(true).then<string>("a").elseif(true).then("b").else("c"),
            "a",
          ],
          [
            "if (true) then { lazy a } elseif(true) then { b } else { c }",
            branch
              .if(true)
              .then(() => "a")
              .elseif(true)
              .then("b")
              .else("c"),
            "a",
          ],
        ])("%s", (_name, actual, expected) => {
          it(`should be ${expected}`, () => {
            expect(actual).toBe(expected);
          });
        });
      });
      describe("elseif then", () => {
        describe.each([
          [
            "if(false) then { a } elseif(true) then { b } else { c }",
            branch.if(false).then<string>("a").elseif(true).then("b").else("c"),
            "b",
          ],
          [
            "if(false) then { a } elseif(true) then { lazy b } else { c }",
            branch
              .if(false)
              .then<string>("a")
              .elseif(true)
              .then(() => "b")
              .else("c"),
            "b",
          ],
        ])("%s", (_name, actual, expected) => {
          it(`should be ${expected}`, () => {
            expect(actual).toBe(expected);
          });
        });
      });
    });
    describe("async", () => {
      describe("if then", () => {
        describe.each([
          [
            "if (true) then { async a } elseif(true) then { b } else { c }",
            branch.async
              .if(true)
              .then(Promise.resolve("a"))
              .elseif(true)
              .then("b")
              .else("c"),
            "a",
          ],
          [
            "if (true) then { lazy async a } elseif(true) then { b } else { c }",
            branch.async
              .if(true)
              .then(async () => "a")
              .elseif(true)
              .then("b")
              .else("c"),
            "a",
          ],
        ])("%s", (_name, actual, expected) => {
          it(`should be ${expected}`, () => {
            return expect(actual).resolves.toBe(expected);
          });
        });
      });
      describe("elseif then", () => {
        describe.each([
          [
            "if(false) then { a } elseif(true) then { async b } else { c }",
            branch
              .if(false)
              .then<string>("a")
              .async.elseif(true)
              .then(Promise.resolve("b"))
              .else("c"),
            "b",
          ],
          [
            "if(false) then { a } elseif(true) then { lazy async b } else { c }",
            branch
              .if(false)
              .then<string>("a")
              .async.elseif(true)
              .then(async () => "b")
              .else("c"),
            "b",
          ],
        ])("%s", (_name, actual, expected) => {
          it(`should be ${expected}`, () => {
            return expect(actual).resolves.toBe(expected);
          });
        });
      });
    });
  });
});

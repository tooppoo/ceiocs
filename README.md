# ceiocs
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)
[![npm version](https://badge.fury.io/js/ceiocs.svg)](https://badge.fury.io/js/ceiocs)
[![Test](https://github.com/tooppoo/ceiocs/actions/workflows/test.yml/badge.svg)](https://github.com/tooppoo/ceiocs/actions/workflows/test.yml)

## About
`ceiocs` is library that allows developers to use conditional 'expressions' instead of conditional 'statements'.

`ceiocs` means `Conditional Expression Instead Of Conditional Statements`.

## Usage
### Introduction
when you use `ceiocs`, you should import as following.
```typescript
import { branch, match } from "ceiocs";
```

you can use boolean as condition and anything as value.
```typescript
import { branch, match } from "ceiocs";

// like if-statement
branch
  .if(false, "a")
  .elseif(false, "b")
  .else("c"); // => "c"

// like switch-statement
match
  .case(123)
  .when(100, "a")
  .when(123, "b")
  .otherwise("c") // => "b"
```

when you want to delay evaluation, you can use function. it is allowed to use both of function and other at same time.

when you use function, each function is not evaluated until it is required.
on following code, `() => 3` is not evaluated.
```typescript
import { branch, match } from "ceiocs";

branch
  .if(() => false, 1)
  .elseif(true, () => 2)
  .else(() => 3); // => 2

match
  .case(() => 123)
  .when(100, () => "a")
  .when(() => 123, () => "b")
  .otherwise(() => "c") // => "b"
```

### Async
when you want to async condition or value, you must use `async` mode.

all you need is only pass `async` property wihtin method chain. if you use async value or function without `async` property, you can not compile.

you do not have to pass `async` at first. only when you need.

```typescript
import { branch, match } from "ceocis"

branch
  .async.if(async () => true, 100)
  .elseif(true, 50)
  .else(Promise.resolve(20)) // => Promise.resolve(100)

branch
  .if(false, 100)
  .async.elseif(true, async () => 50)
  .else(Promise.resolve(20)) // => Promise.resolve(50)

match
  .async
  .case(async () => 123)
  .when(100, Promise.resolve("a"))
  .when(Promise.resolve(123), async () => "b")
  .otherwise(async () => "c") // => Promise.resolve("b")

match
  .case(123)
  .when(100, "a")
  .async
  .when(Promise.resolve(123), async () => "b")
  .otherwise(async () => "c") // => Promise.resolve("b")
```

## License
MIT

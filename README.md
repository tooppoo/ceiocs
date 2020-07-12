# ceiocs
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)
[![npm version](https://badge.fury.io/js/ceiocs.svg)](https://badge.fury.io/js/ceiocs)
[![Build Status](https://travis-ci.org/tooppoo/ceiocs.svg?branch=master)](https://travis-ci.org/tooppoo/ceiocs)
[![Maintainability](https://api.codeclimate.com/v1/badges/cb4fb9bb0d149ac2d1c6/maintainability)](https://codeclimate.com/github/tooppoo/ceiocs/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/cb4fb9bb0d149ac2d1c6/test_coverage)](https://codeclimate.com/github/tooppoo/ceiocs/test_coverage)

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

### Style
you can use some coding style.

```typescript
// callback style
branch
  .if(() => false, 1)
  .elseif(true, () => 2)
  .else(() => 3); // => 3
```
```typescript
// if-then style
branch
  .if(() => false).then(1)
  .elseif(true).then(() => 2)
  .else(() => 3); // => 3
```
```typescript
// mix style
branch
  .if(() => false).then(1)
  .elseif(true, () => 2)
  .else(() => 3); // => 3
```

you can see "if-then style" as a curried "callback style"

## License
MIT

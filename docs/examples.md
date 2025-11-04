# ceiocs サンプルコード

## 目次

1. [Branch（分岐）](#branch分岐)
2. [Match（マッチング）](#matchマッチング)
3. [実践的なユースケース](#実践的なユースケース)

---

## Branch（分岐）

### 基本的な使用方法

```typescript
import { branch } from "ceiocs";

// if-elseif-else の代わり
const result = branch
  .if(false, "a")
  .elseif(false, "b")
  .else("c");

console.log(result); // => "c"
```

### 関数による遅延評価

```typescript
import { branch } from "ceiocs";

// 関数で値を遅延評価
const result = branch
  .if(true, () => "a")
  .else(() => "b");

console.log(result); // => "a"

// 条件も関数で遅延評価（呼び出し時に評価）
const result2 = branch
  .if(() => true, "a")
  .else("b");

console.log(result2); // => "a"

// 両方関数でも使用可能
const result3 = branch
  .if(() => false, () => "a")
  .elseif(() => true, () => "b")
  .else(() => "c");

console.log(result3); // => "b"
```

### 計算コストが高い値の評価回避

```typescript
import { branch } from "ceiocs";

function expensive(): string {
  console.log("expensive() が呼ばれた");
  // 重い計算処理
  return "result";
}

// expensive() は呼ばれない（条件が false なため）
const result = branch
  .if(true, "quick")
  .else(() => expensive());

console.log(result); // => "quick"
// コンソール: (expensive() が呼ばれた というログは出力されない)
```

### 型安全性

```typescript
import { branch } from "ceiocs";

// ✅ すべての値が同じ型なので OK
const result: string = branch
  .if(true, "a")
  .elseif(false, "b")
  .else("c");

// ❌ コンパイルエラー: 値の型が混在
// const result = branch
//   .if(true, "a")
//   .elseif(false, 123)  // ← 型エラー
//   .else("c");

// ❌ コンパイルエラー: Promise は同期ブランチに混入不可
// const result = branch
//   .if(true, Promise.resolve("a"))  // ← 型エラー
//   .else("b");
```

---

## 非同期 Branch

### 基本的な非同期処理

```typescript
import { branch } from "ceiocs";

// async プロパティで非同期モードへ
const result = await branch
  .async.if(true, Promise.resolve("a"))
  .elseif(false, "b")
  .else("c");

console.log(result); // => "a"
```

### 非同期条件

```typescript
import { branch } from "ceiocs";

async function checkAuth(): Promise<boolean> {
  // 認証チェック
  return true;
}

const result = await branch
  .async.if(checkAuth, "authenticated")
  .else("not authenticated");

console.log(result); // => "authenticated"
```

### 同期処理から非同期処理へ移行

```typescript
import { branch } from "ceiocs";

// 最初は同期処理で開始
const result = await branch
  .if(false, "sync")
  .async.elseif(true, Promise.resolve("async"))
  .else("sync");

console.log(result); // => "async"
```

### 関数の遅延評価（非同期版）

```typescript
import { branch } from "ceiocs";

async function heavyAsyncTask(): Promise<string> {
  console.log("heavyAsyncTask が呼ばれた");
  // 重い非同期処理
  return "result";
}

// heavyAsyncTask は呼ばれない（条件が false なため）
const result = await branch
  .async.if(false, () => heavyAsyncTask())
  .else(() => "fallback");

console.log(result); // => "fallback"
// コンソール: (heavyAsyncTask が呼ばれた というログは出力されない)
```

---

## Match（マッチング）

### 基本的な使用方法

```typescript
import { match } from "ceiocs";

// switch-case-default の代わり
const result = match
  .case(123)
  .when(100, "a")
  .when(123, "b")
  .otherwise("c");

console.log(result); // => "b"
```

### 関数による遅延評価

```typescript
import { match } from "ceiocs";

const result = match
  .case(() => 123)
  .when(100, () => "a")
  .when(() => 123, () => "b")
  .otherwise(() => "c");

console.log(result); // => "b"
```

### 文字列のマッチング

```typescript
import { match } from "ceiocs";

function getUserMessage(role: string): string {
  return match
    .case(role)
    .when("admin", "管理者権限でアクセス")
    .when("user", "ユーザー権限でアクセス")
    .when("guest", "ゲスト権限でアクセス")
    .otherwise("権限不明");
}

console.log(getUserMessage("admin"));  // => "管理者権限でアクセス"
console.log(getUserMessage("user"));   // => "ユーザー権限でアクセス"
console.log(getUserMessage("unknown")); // => "権限不明"
```

### 型安全性

```typescript
import { match } from "ceiocs";

// ✅ すべてのキーと値の型が統一されている
const result: string = match
  .case(1)
  .when(1, "one")
  .when(2, "two")
  .otherwise("other");

// ❌ コンパイルエラー: キーの型が混在
// const result = match
//   .case(1)
//   .when(1, "one")
//   .when("two", "two")  // ← 型エラー（string を number として期待）
//   .otherwise("other");

// ❌ コンパイルエラー: 値の型が混在
// const result = match
//   .case(1)
//   .when(1, "one")
//   .when(2, 123)  // ← 型エラー（number を string として期待）
//   .otherwise("other");
```

---

## 非同期 Match

### 基本的な非同期処理

```typescript
import { match } from "ceiocs";

const status = Promise.resolve("pending");

const result = await match
  .async.case(status)
  .when("pending", "処理中...")
  .when("success", "完了")
  .otherwise("失敗");

console.log(result); // => "処理中..."
```

### 非同期キーと値

```typescript
import { match } from "ceiocs";

async function getStatus(): Promise<string> {
  return "active";
}

async function getMessage(): Promise<string> {
  return "ユーザーはアクティブです";
}

const result = await match
  .async.case(getStatus)
  .when("active", getMessage)
  .when("inactive", "ユーザーは非アクティブです")
  .otherwise("不明なステータス");

console.log(result); // => "ユーザーはアクティブです"
```

### 複合条件の非同期評価

```typescript
import { match } from "ceiocs";

const result = await match
  .case(1)
  .when(1, async () => "one")
  .async.when(Promise.resolve(2), "two")
  .otherwise("other");

console.log(result); // => "one"
```

---

## 実践的なユースケース

### ユースケース 1: HTTP ステータスコードの処理

```typescript
import { match } from "ceiocs";

function getStatusMessage(code: number): string {
  return match
    .case(code)
    .when(200, "OK")
    .when(201, "作成された")
    .when(204, "コンテンツなし")
    .when(400, "不正なリクエスト")
    .when(401, "認証が必要です")
    .when(403, "アクセスが拒否されました")
    .when(404, "見つかりません")
    .when(500, "サーバーエラー")
    .otherwise("不明なステータス");
}

console.log(getStatusMessage(200));  // => "OK"
console.log(getStatusMessage(404));  // => "見つかりません"
console.log(getStatusMessage(999));  // => "不明なステータス"
```

### ユースケース 2: ユーザー権限に基づく条件分岐

```typescript
import { branch } from "ceiocs";

interface User {
  id: string;
  role: "admin" | "moderator" | "user";
  isActive: boolean;
}

function canDeletePost(user: User): boolean {
  return branch
    .if(user.role === "admin", true)
    .elseif(user.role === "moderator" && user.isActive, true)
    .else(false);
}

const admin: User = { id: "1", role: "admin", isActive: true };
const moderator: User = { id: "2", role: "moderator", isActive: true };
const user: User = { id: "3", role: "user", isActive: true };
const inactiveModerator: User = { id: "4", role: "moderator", isActive: false };

console.log(canDeletePost(admin));            // => true
console.log(canDeletePost(moderator));        // => true
console.log(canDeletePost(user));             // => false
console.log(canDeletePost(inactiveModerator)); // => false
```

### ユースケース 3: 非同期認証チェック

```typescript
import { branch } from "ceiocs";

interface AuthContext {
  token: string | null;
  user: { id: string; role: string } | null;
}

async function checkPermission(context: AuthContext): Promise<boolean> {
  return branch
    .async.if(() => !context.token, false)
    .elseif(() => context.user?.role === "admin", true)
    .elseif(async () => {
      // API でユーザー権限を確認
      const response = await fetch(`/api/users/${context.user?.id}/permissions`);
      return response.ok;
    }, true)
    .else(false);
}

// 使用例
const context: AuthContext = {
  token: "abc123",
  user: { id: "user1", role: "user" }
};

const hasPermission = await checkPermission(context);
console.log(hasPermission); // => true or false (API の結果に依存)
```

### ユースケース 4: バリデーション結果の処理

```typescript
import { match } from "ceiocs";

type ValidationResult = 
  | { status: "valid"; data: string }
  | { status: "invalid"; error: string }
  | { status: "pending" };

function handleValidationResult(result: ValidationResult): string {
  return match
    .case(result.status)
    .when("valid", () => {
      // バリデーション済み結果を取得可能
      const validResult = result as Extract<ValidationResult, { status: "valid" }>;
      return `データを処理: ${validResult.data}`;
    })
    .when("invalid", () => {
      const invalidResult = result as Extract<ValidationResult, { status: "invalid" }>;
      return `エラー: ${invalidResult.error}`;
    })
    .when("pending", "バリデーション中...")
    .otherwise("不明なステータス");
}

const validResult: ValidationResult = { status: "valid", data: "test" };
const invalidResult: ValidationResult = { status: "invalid", error: "値が空です" };
const pendingResult: ValidationResult = { status: "pending" };

console.log(handleValidationResult(validResult));    // => "データを処理: test"
console.log(handleValidationResult(invalidResult));  // => "エラー: 値が空です"
console.log(handleValidationResult(pendingResult));  // => "バリデーション中..."
```

### ユースケース 5: カスタム比較ロジック

```typescript
import { match } from "ceiocs";

interface Product {
  id: number;
  category: string;
}

// 商品カテゴリに基づくメッセージ
const product: Product = { id: 1, category: "electronics" };

const message = match
  .compareBy((a: string, b: string) => a.toLowerCase() === b.toLowerCase())
  .case(product.category)
  .when("ELECTRONICS", "電子機器")
  .when("Clothing", "衣料品")
  .when("Books", "書籍")
  .otherwise("その他");

console.log(message); // => "電子機器"（大文字小文字の区別なし）
```

### ユースケース 6: 複雑な条件の組み合わせ

```typescript
import { branch, match } from "ceiocs";

interface Order {
  total: number;
  customerType: "vip" | "regular" | "new";
  isPaidInFull: boolean;
}

function calculateDiscount(order: Order): number {
  return branch
    .if(order.customerType === "vip", () => {
      // VIP には自動的に 20% 割引
      return 20;
    })
    .elseif(order.customerType === "new" && order.total > 100, () => {
      // 新規顧客で購入額が 100 以上は 10% 割引
      return 10;
    })
    .elseif(order.isPaidInFull && order.total > 50, () => {
      // 全額支払いで 50 以上は 5% 割引
      return 5;
    })
    .else(0);
}

function getOrderMessage(order: Order): string {
  const discount = calculateDiscount(order);
  
  return match
    .case(discount)
    .when(20, "VIP 特典で 20% 割引を適用しました")
    .when(10, "新規顧客割引で 10% 割引を適用しました")
    .when(5, "全額支払い割引で 5% 割引を適用しました")
    .otherwise("割引は適用されません");
}

const vipOrder: Order = { total: 1000, customerType: "vip", isPaidInFull: true };
const newOrder: Order = { total: 150, customerType: "new", isPaidInFull: false };
const regularOrder: Order = { total: 30, customerType: "regular", isPaidInFull: false };

console.log(getOrderMessage(vipOrder));     // => "VIP 特典で 20% 割引を適用しました"
console.log(getOrderMessage(newOrder));     // => "新規顧客割引で 10% 割引を適用しました"
console.log(getOrderMessage(regularOrder)); // => "割引は適用されません"
```

---

## デバッグ: Branch の toString()

`branch` のメソッドチェーン（`if`/`elseif`）で構築されたオブジェクトは、`toString()` を呼ぶと対応する if/else if 形式の文字列を返します。デバッグやログ出力に便利です。

注意: 現行実装では、値が文字列であってもクォート無しで出力されます（例: `return a;`）。条件や値に関数や Promise を渡した場合も、その型に応じた素の表現が埋め込まれます。

### 同期ブランチ

```typescript
import { branch } from "ceiocs";

const body = branch
  .if(true, "a")
  .elseif(false, "b")
  .elseif(true, "c");

console.log(body.toString());
// 出力（改行・空行含む）:
// if (true) {
//   return a;
// }
// else if (false) {
//   return b;
// }
// else if (true) {
//   return c;
// }
//
```

### 非同期ブランチ

```typescript
import { branch } from "ceiocs";

const body = branch.async
  .if(true, "x")
  .elseif(false, "y");

console.log(body.toString());
// 出力（改行・空行含む）:
// if (true) {
//   return x;
// }
// else if (false) {
//   return y;
// }
//
```

### 空のチェーン

states が空の場合は空文字列になります（内部仕様）。

活用例（構造化ログ）:

```typescript
const logger = {
  debug: (message: string, context: Record<string, unknown> = {}) =>
    console.log(JSON.stringify({ level: "debug", timestamp: new Date().toISOString(), message, ...context })),
};

const body = branch.if(true, "a").elseif(false, "b");
logger.debug("条件式", { expr: body.toString() });
```

## まとめ

| 機能 | 特徴 |
|-----|------|
| **branch** | `if-elseif-else`の条件式版。複雑な条件分岐に便利 |
| **match** | `switch-case`の条件式版。値のマッチングに特化 |
| **遅延評価** | 関数で値をラップすることで不要な評価を回避 |
| **型安全性** | すべてのブランチ・マッチケースの型を統一 |
| **非同期対応** | `async`プロパティで非同期処理に対応 |
| **カスタム比較** | `compareBy()`でマッチング比較ロジックをカスタマイズ可能 |

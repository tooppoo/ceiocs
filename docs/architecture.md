# ceiocs アーキテクチャ

## 概要

`ceiocs`は条件式（conditional expression）を使用して条件ステートメントの代わりになるライブラリです。主に2つの機能を提供します：

- **branch**: `if-elseif-else`ステートメントの条件式版
- **match**: `switch`ステートメントの条件式版

## 設計原則

### 1. 型レベルでの同期・非同期の区別

ライブラリは型安全性を最大限活用し、実行時ではなく**コンパイル時**に以下を保証します：

- 同期処理では`Promise`を返してはいけない
- 非同期処理では必ず`async`プロパティを使用する必要がある
- 実装者が解決不可能な型エラーは発生させない（構文的に許可する）

**型定義（`value-type.ts`）**:

```typescript
export type MaybeAsync<T> = T | Promise<T>;
export type MaybeCallable<T> = (() => T) | T;
export type MustSync<T, R = T> = T extends
  | Promise<unknown>
  | PromiseLike<unknown>
  ? never
  : R;
```

`MustSync<T, R>`は`T`が`Promise`または`PromiseLike`型である場合に`never`を返し、型エラーとなります。

### 2. 遅延評価（Lazy Evaluation）

条件式および値として関数を受け入れることで、必要になるまで評価を遅延させます：

- 条件が満たされなかったブランチの値は評価されない
- 非同期評価中、条件が満たされた後のブランチは評価されない

### 3. ポリシーと実装の分離

#### ポリシー層

- `BranchState<Cond, Val>`: ブランチの状態定義
- `MatchState<Key, Val>`: マッチの状態定義
- 条件の評価ロジックは実装層に委譲

#### 実装層

- `SyncBranchBody<Val>` / `AsyncBranchBody<Val>`: ブランチの条件評価と値の解決
- `HeadOfWhen<Key>` / `When<Key, Val>`: マッチの初期化と条件評価
- `AsyncHeadOfWhen<Key>` / `AsyncWhen<Key, Val>`: 非同期版

### 4. 一方向の依存

```
branch/index.ts ← branch-head.ts ← branch-body.ts
                                  ↓
                          resolve-maybe-callable.ts

match/index.ts ← match.ts ← when.ts
                ↓            ↓
            config.ts   resolve-maybe-callable.ts
```

上位が下位へ依存し、相互依存は存在しません。

## アーキテクチャコンポーネント

### Branch（分岐）

#### 同期版フロー

```
SyncBranchHead.if()
    ↓
SyncBranchBody.elseif() / .else()
    ↓
条件を線形探索 → 最初にマッチした値を解決 → 返却
```

#### 非同期版フロー

```
SyncBranchHead.async.if()
    ↓
AsyncBranchBody.elseif() / .else()
    ↓
条件をループで非同期評価 → 最初にマッチした値を解決 → Promise返却
```

**特徴**：

- `async`プロパティで非同期モードへ移行
- 一度`async`に入ると、戻ることはできない
- 値が`Promise`でなくても非同期モードは使用可能

### Match（マッチング）

#### 同期版フロー

```
Matcher.case(rootKey)
    ↓
HeadOfWhen.when(key, value)
    ↓
When.when() / .otherwise()
    ↓
rootKeyとkeyをCompare → マッチした値を解決 → 返却
```

#### 非同期版フロー

```
Matcher.async.case(rootKey)  [Matcherではなくasync配下のメソッドを使用]
    ↓
AsyncHeadOfWhen.when(key, value)
    ↓
AsyncWhen.when() / .otherwise()
    ↓
rootKeyとkeyを非同期Compare → マッチした値を解決 → Promise返却
```

**特徴**：

- `compareBy(matcher)`でカスタム比較ロジックを定義可能
- デフォルトは`===`による比較
- 非同期モードでもカスタム比較は同期関数

### 共通ユーティリティ

#### `resolveMaybeCallable(value)`

```typescript
// 値が関数の場合は呼び出し、そうでなければそのまま返す
// 戻り値も関数の場合は、その関数を呼び出す
```

#### 型定義

```typescript
// 条件が満たされるまでの状態を保持
interface BranchState<Cond, Val> {
  condition: Cond;
  value: Val;
}

// マッチング対象のキーと返却値のペア
interface MatchState<Key, Val> {
  key: Key;
  value: Val;
}
```

## 型安全性の確保

### ジェネリクス戦略

1. **値の型統一**: 全ブランチの値は同じ型`Val`でなければならない
2. **キーの型統一**: マッチングのすべてのキーは同じ型`Key`でなければならない
3. **同期性の強制**: `MustSync<T, R>`で同期ブランチへの`Promise`混入を防止

### コンパイル時検証

```typescript
// ✅ OK: すべての値が string
branch.if(true, "a").elseif(false, "b").else("c");

// ❌ NG: 値の型が混在
branch.if(true, "a").elseif(false, 123).else("c"); 
// ↑ 型エラー: 123 は string に割り当て不可

// ❌ NG: Promiseが同期ブランチに混入
branch.if(true, Promise.resolve("a")).else("c");
// ↑ 型エラー: Promise<string> は MustSync<string> に割り当て不可
```

## パフォーマンス特性

### 時間計算量

- **Branch**: O(n) - n は条件ブランチ数（線形探索）
- **Match**: O(n) - n はマッチケース数（線形探索）

### メモリ特性

- **遅延評価**: 条件が満たされないブランチの値は評価されない
- **状態の保持**: 各`Body`/`When`クラスは状態配列を保持（イミュータブル）

## 拡張可能性

### Match の比較ロジック

```typescript
class MatchConfig<T = unknown> {
  constructor(readonly compare: Comparator<T>) {}

  static defaultFor<T>(): MatchConfig<T> {
    // デフォルト: === による比較
  }

  changeMatcher<Next>(matcher: Comparator<Next>): MatchConfig<Next> {
    // 新しい MatchConfig を返す
  }
}
```

カスタム比較を適用する場合：

```typescript
match.compareBy((a, b) => a.id === b.id).case(obj1).when(obj2, "match");
```

## まとめ

| 特性 | 説明 |
|-----|------|
| **型安全性** | 同期・非同期・値の型をコンパイル時に検証 |
| **遅延評価** | 不要なブランチ評価を回避 |
| **一方向依存** | モジュール間の結合度を低減 |
| **拡張性** | カスタム比較ロジックのサポート |
| **ポリシー分離** | ポリシーと実装の明確な分離 |

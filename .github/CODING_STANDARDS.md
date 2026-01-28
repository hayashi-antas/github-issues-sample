# Coding Standards

## 基本方針
- 読みやすさ > 賢さ
- 変更の理由が追えるように書く（PR説明・コメント歓迎）
- 迷ったら「一貫性」を優先

## 命名
- 変数/関数名は「目的」がわかる名前にする
- boolean は `is/has/can/should` で始める
- 略語は一般的なものだけ（例: `id`, `url`）

### 良い例 / 悪い例
**変数名:**
```javascript
// ✅ Good
const userAge = 25;
const isAuthenticated = true;
const hasPermission = false;

// ❌ Bad
const a = 25;           // 意味が不明
const flag = true;      // 何のフラグ？
const auth = false;     // 動詞か状態か不明
```

**関数名:**
```javascript
// ✅ Good
function calculateTotalPrice(items) { ... }
function validateEmail(email) { ... }
function shouldShowNotification(user) { ... }

// ❌ Bad
function calc(x) { ... }           // 何を計算？
function check(data) { ... }       // 何をチェック？
function process(input) { ... }    // 何を処理？
```

## 関数/メソッド
- 1つの関数は1つの責務
- 早期returnでネストを浅く
- 引数は増やしすぎない（3つ超えたらオブジェクト化検討）

## エラー処理
- 例外は握りつぶさない
- 失敗時のログには「何が起きたか」と「入力の概要」を入れる（機密は除く）

## コメント
- 「何を」より「なぜ」を書く
- TODO は issue へのリンク推奨

## テスト（ある場合）
- バグ修正は再現テストを優先
- ユニットテストは境界条件を意識

## コードフォーマット / Linting
このプロジェクトでは **ESLint** と **Prettier** を使用してコードスタイルを統一します。

- **ESLint**: コード品質・構文エラー・ベストプラクティスをチェック
- **Prettier**: コードフォーマット（インデント・改行・引用符など）を自動整形
- **EditorConfig**: エディタレベルでの基本設定（文字コード・改行コード・インデント）

### セットアップ
プロジェクトのルートで以下を実行してください：
```bash
npm install
```

### 使い方
```bash
# コードチェック
npm run lint

# 自動修正
npm run lint:fix

# フォーマット
npm run format
```

エディタに ESLint/Prettier の拡張機能をインストールすると、保存時に自動フォーマットされます。

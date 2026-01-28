# Shopping Website Project

React（フロントエンド）と Node.js（バックエンド）を使ったショッピングサイトプロジェクトです。

## プロジェクト概要

このプロジェクトは、モダンなショッピングウェブサイトを構築するためのフルスタックアプリケーションです。ユーザーは商品を閲覧、検索、カートに追加し、チェックアウトプロセスを完了することができます。

## 技術スタック

### フロントエンド
- **React**: UIコンポーネントライブラリ
- Create React App または Vite でのセットアップ
- ESLint & Prettier によるコード品質管理

### バックエンド
- **Node.js**: サーバーサイドランタイム
- **Express**: Webアプリケーションフレームワーク
- RESTful API エンドポイント

### 開発ツール
- **ESLint**: JavaScriptコードリンター
- **Prettier**: コードフォーマッター
- **GitHub Actions**: CI/CD パイプライン
- dotenv: 環境変数管理

## プロジェクト構成

```
├── frontend/           # Reactフロントエンドアプリケーション
│   ├── src/
│   │   ├── components/ # 再利用可能なUIコンポーネント
│   │   ├── pages/      # ページコンポーネント
│   │   └── ...
│   └── package.json
│
├── backend/            # Node.js/Expressバックエンド
│   ├── routes/         # APIルート定義
│   ├── controllers/    # ビジネスロジック
│   ├── models/         # データモデル
│   └── package.json
│
├── .gitignore
├── .eslintrc.js
├── .prettierrc
└── README.md
```

## セットアップ手順

### 前提条件
- Node.js (v14以上)
- npm / yarn / pnpm のいずれか

### フロントエンドのセットアップ

```bash
# frontendディレクトリに移動
cd frontend

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm start
```

### バックエンドのセットアップ

```bash
# backendディレクトリに移動
cd backend

# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
# .envファイルを編集して必要な環境変数を設定

# 開発サーバーの起動
npm run dev
```

## 開発フロー

1. **ブランチ作成**: 機能やバグ修正のために新しいブランチを作成
2. **開発**: コードの変更と適切なテストの追加
3. **Lint & Format**: `npm run lint` と `npm run format` を実行
4. **Pull Request**: mainブランチへのPRを作成
5. **CI チェック**: GitHub Actionsによる自動テスト・Lintの確認
6. **レビュー & マージ**: コードレビュー後にマージ

## 機能ロードマップ

### 🏗️ Epic 1: プロジェクトセットアップ
- [x] プロジェクトディレクトリ構成の確立
- [ ] Reactアプリの初期化 (#4)
- [ ] Node.js/Expressサーバの初期化 (#5)
- [ ] .gitignore, ESLint, Prettier設定 (#6)
- [ ] READMEの作成 (#7, #10)
- [ ] 環境設定とスクリプト構成 (#8)
- [ ] CI/CDパイプライン構築 (#9)

### 🔍 Epic 2: 商品検索・フィルター機能
- [ ] 商品検索機能の実装（UI/Backend）(#12)
- [ ] 商品カタログのフィルタリングオプション追加 (#13)

### 📦 Epic 3: 商品カタログ・閲覧機能
- [ ] カテゴリ別商品閲覧機能（UI & Backend）(#15)
- [ ] 商品詳細ページの表示 (#16)

### 🛒 Epic 4: ショッピングカート・チェックアウト
- [ ] ショッピングカート管理（フロントエンド/バックエンド）(#18)
- [ ] チェックアウト機能（注文、サマリー、決済）(#19)

## 環境設定

プロジェクトは以下の環境をサポートします：

- **開発環境**: ローカル開発用
- **ステージング環境**: テスト・検証用
- **本番環境**: プロダクション用

各環境の設定は `.env` ファイルで管理します。

## コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. Pull Requestを作成

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 問い合わせ

プロジェクトに関する質問や提案がある場合は、Issueを作成してください。

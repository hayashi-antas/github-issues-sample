# Shopping Website

React（フロントエンド）と Node.js（バックエンド）を使ったショッピングサイト

## プロジェクト構成

このプロジェクトはモノレポ構造で、フロントエンドとバックエンドを含んでいます：

```
shopping-website/
├── frontend/          # React + TypeScript + Vite
├── backend/           # Node.js + Express + TypeScript
├── package.json       # ワークスペース設定
└── README.md
```

## 必要環境

- Node.js >= 20.x
- npm >= 10.x

## セットアップ手順

### 1. 依存関係のインストール

```bash
npm install
```

これにより、フロントエンドとバックエンドの両方の依存関係がインストールされます。

### 2. 環境変数の設定

#### バックエンド
```bash
cd backend
cp .env.example .env
# .env ファイルを編集して必要な環境変数を設定
```

#### フロントエンド
```bash
cd frontend
cp .env.example .env.local
# .env.local ファイルを編集して必要な環境変数を設定
```

### 3. 開発サーバーの起動

#### バックエンドサーバー（ポート 5000）
```bash
npm run dev:backend
```

#### フロントエンドサーバー（ポート 3000）
別のターミナルで：
```bash
npm run dev:frontend
```

## 利用可能なスクリプト

### ワークスペース全体

- `npm run dev:frontend` - フロントエンド開発サーバー起動
- `npm run dev:backend` - バックエンド開発サーバー起動
- `npm run build` - 両方をビルド
- `npm run lint` - 両方をリント

### フロントエンドのみ

```bash
cd frontend
npm run dev      # 開発サーバー起動
npm run build    # プロダクションビルド
npm run preview  # ビルドをプレビュー
npm run lint     # TypeScriptチェック
```

### バックエンドのみ

```bash
cd backend
npm run dev      # 開発サーバー起動（nodemon）
npm run build    # プロダクションビルド
npm run start    # ビルド済みアプリを起動
npm run lint     # TypeScriptチェック
```

## 技術スタック

### フロントエンド
- **React 19** - UIライブラリ
- **TypeScript** - 型安全性
- **Vite** - ビルドツール
- **CSS** - スタイリング

### バックエンド
- **Node.js 20** - ランタイム
- **Express 5** - Webフレームワーク
- **TypeScript** - 型安全性
- **CORS** - クロスオリジンリクエスト対応

## プロジェクト構造

### フロントエンド (frontend/)
```
src/
├── components/    # 再利用可能なコンポーネント
├── pages/         # ページコンポーネント
├── types/         # TypeScript型定義
├── utils/         # ユーティリティ関数
├── App.tsx        # メインアプリコンポーネント
└── main.tsx       # エントリーポイント
```

### バックエンド (backend/)
```
src/
├── controllers/   # リクエストハンドラー
├── routes/        # APIルート定義
├── types/         # TypeScript型定義
├── utils/         # ユーティリティ関数
├── middleware/    # カスタムミドルウェア
└── index.ts       # サーバーエントリーポイント
```

## API エンドポイント

### ヘルスチェック
- `GET /api/health` - サーバーステータス確認

### 商品
- `GET /api/products` - 全商品取得
- `GET /api/products/:id` - 商品詳細取得

## 次のステップ

このプロジェクトは基本的なセットアップを提供しています。以下の機能を追加できます：

- データベース統合（PostgreSQL、MongoDB など）
- 認証・認可（JWT、OAuth など）
- 状態管理（Redux、Zustand など）
- テストフレームワーク（Jest、React Testing Library など）
- CI/CD パイプライン
- Docker化

## ライセンス

ISC


# github-issues-sample

このプロジェクトは、**GitHub ActionsとAIを活用した開発プロセスの自動化**を実現するサンプルプロジェクトです。

## 📚 主な機能

### 1. 🤖 AI PRレビュー
Pull Requestに `/ai-review` とコメントすると、OpenAI APIを使った自動レビューが投稿されます。
- GitHub Actionsとの統合
- セキュリティを考慮した設計
- AI Input Cleansingによる最適化

**詳細:** [docs/ai_review.md](docs/ai_review.md)

### 2. 📋 Issue一括管理
GitHub CLIを使って、複数のIssueを一括作成し、GitHub Projectsに自動登録します。
- Estimate / Priority の自動設定
- 再現性のあるタスク初期化
- プロジェクト立ち上げの効率化

**詳細:** [docs/gh-project-issue-batch.md](docs/gh-project-issue-batch.md)

### 3. 🧹 AI Input Cleansing
AIレビューの品質を向上させるため、入力を最適化します。
- lockfileの要約
- テストスナップショットの除外
- トークン消費の削減

**詳細:** [docs/ai_input_cleansing.md](docs/ai_input_cleansing.md)

## 🗂️ プロジェクト構成

```
github-issues-sample/
├── README.md                          # 本ファイル
├── docs/                              # ドキュメント
│   ├── ai_input_cleansing.md         # AI入力最適化の設計原則
│   ├── ai_review.md                  # AIレビュー実装ガイド
│   ├── gh-project-issue-batch.md     # Issue一括管理の解説
│   └── project_structure.md          # プロジェクト構成の詳細
└── scripts/
    └── create_issues_and_project_items.sh  # Issue一括作成スクリプト
```

**詳細な構成説明:** [docs/project_structure.md](docs/project_structure.md)

## 🚀 クイックスタート

### AIレビューを試す
1. OpenAI API Keyを取得し、GitHub Secretsに設定
2. Pull Requestを作成
3. コメントに `/ai-review` と入力

### Issue一括作成を試す
```bash
# スクリプトを編集
vim scripts/create_issues_and_project_items.sh

# 実行
chmod +x scripts/create_issues_and_project_items.sh
./scripts/create_issues_and_project_items.sh
```

## 📖 ドキュメント

| ドキュメント | 内容 |
|------------|------|
| [AI Input Cleansing](docs/ai_input_cleansing.md) | AI入力最適化の設計思想と実装詳細 |
| [AI Review](docs/ai_review.md) | AIレビュー機能の実装ガイド |
| [Issue Batch](docs/gh-project-issue-batch.md) | Issue一括管理の使い方 |
| [Project Structure](docs/project_structure.md) | プロジェクト構成の詳細説明 |

## 💡 想定利用シーン

- チーム開発におけるコードレビューの効率化
- プロジェクト立ち上げ時のタスク管理自動化
- 研修や教育目的でのGitHub Actions実装例の学習

## 🛠️ 使用技術

- GitHub Actions
- GitHub CLI
- OpenAI API
- Node.js / Bash

## 📝 ライセンス

MIT License

## 🤝 コントリビューション

Issue、Pull Request を歓迎します！
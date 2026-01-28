# 🤖 AI PR Review（/ai-review）導入まとめ

## これは何？
Pull Request に

```
/ai-review
```

とコメントすると、  
**GitHub Actions + OpenAI API** が PR の差分を読み取り、  
**自動でレビューコメントを投稿**する仕組み。

- 人間の意思で起動（自動暴走しない）
- fork PR / 権限 / セキュリティを考慮
- YAML 地獄を避けた **JS 分離設計**
- 無限ループ・Markdown崩壊対策済み

---

## 全体構成（最終形）

```
.github/
├─ workflows/
│  └─ ai_review_on_comment.yml
└─ scripts/
   └─ ai_review_comment.js
```

- **workflow**：起動条件と環境変数だけを管理
- **JS**：GitHub API / OpenAI API / フォーマット処理を担当

---

## 🔁 処理フロー

1. PR の Conversation に `/ai-review` コメント
2. `issue_comment` イベントで GitHub Actions 起動
3. PR 本文 + diff を GitHub API から取得
4. OpenAI Responses API にレビュー依頼
5. 出力を整形（コードフェンス対策）
6. PR に 🤖 AI Review コメントを投稿

---

## 🔐 セキュリティ設計のポイント

### ✔ 人間のコメントのみで起動
```yaml
github.event.comment.user.type == 'User'
```

### ✔ 自己再起動（無限ループ）防止
- AI コメントには `/ai-review` を含めない
- `startsWith('/ai-review')` で明示的起動のみ反応

### ✔ トークン管理
- **Classic PAT（scope: repo）** を使用
- 権限は workflow の `if` 条件で制御

---

## 📄 セットアップ手順（最短）

### ① OpenAI API Key を用意
- OpenAI Dashboard で API Key 発行
- GitHub Repo → Settings → Secrets → Actions
  - `OPENAI_API_KEY` に登録

---

### ② GitHub Classic PAT を作成
- scope: `repo`
- Repo Secrets に登録：
  - `AI_REVIEW_PAT`

---

### ③ workflow を追加
`.github/workflows/ai_review_on_comment.yml`

```yaml
name: AI Review on /ai-review

on:
  issue_comment:
    types: [created]

permissions:
  contents: read
  issues: write

jobs:
  ai-review:
    if: ${{ github.event.issue.pull_request != null && startsWith(github.event.comment.body, '/ai-review') && github.event.comment.user.type == 'User' }}
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Run AI reviewer
        env:
          GITHUB_TOKEN: ${{ secrets.AI_REVIEW_PAT }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          OPENAI_MODEL: gpt-4.1
          REPO: ${{ github.repository }}
          ISSUE_NUMBER: ${{ github.event.issue.number }}
        run: node .github/scripts/ai_review_comment.js
```

---

### ④ レビュースクリプトを追加
`.github/scripts/ai_review_comment.js`

- PR 本文・diff を取得
- OpenAI Responses API でレビュー生成
- 全体が ``` で囲まれて返ってきた場合は自動で除去
- PR に 🤖 AI Review コメントとして投稿

※ 本リポジトリで完成させた最新版をそのまま再利用すること。

---

### ⑤ 動作確認

PR にコメント：

```
/ai-review
```

→ 数十秒後、PR に **🤖 AI Review** コメントが付けば成功。

---

## 🧠 ハマりどころ & 学び（重要）

### ❌ fine-grained PAT はハマりやすい
- 見た目 OK でも `Resource not accessible by personal access token`
- **最初は classic PAT 一択**

---

### ❌ AI コメントで無限ループ
- `issue_comment` は「誰のコメントでも」発火
- **User 判定は必須**

---

### ❌ Markdown が ``` で囲まれる
- モデルが全体をコードブロックで返すことがある
- **投稿前に外側の ``` を自動除去**して安定化

---

## ✨ 拡張アイデア（今後）

- `/ai-review brief / deep / security`
- ラベル `ai-review` で GUI 起動
- diff 行数で自動 / 手動切替
- リポジトリごとの **AIレビュー指針.md** を読み込ませる

---

## 🎯 この設計の良いところ

- **人間主導**（AIに主導権を渡さない）
- PR文化に自然に馴染む
- 他リポジトリへ **丸ごとコピー可能**
- 「AIを道具として使えている」良い例

---

## 最後に
これは単なるサンプルではなく、  
**そのまま実務に使える AI レビュー基盤**です。

次の展開案：
- テンプレ化（Use this template）
- Organization 共通 Action 化
- GitHub App 化（より堅牢）

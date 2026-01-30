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

  
[![Image from Gyazo](https://i.gyazo.com/73266e29c6e31db8612df6082a9bf4d1.png)](https://gyazo.com/73266e29c6e31db8612df6082a9bf4d1)

## 全体構成

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
[.github/workflows/ai_review_on_comment.yml](../.github/workflows/ai_review_on_comment.yml)


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

### ❌ AI コメントで無限ループ
- `issue_comment` は「誰のコメントでも」発火
- **User 判定は必須**

### ❌ Markdown が ``` で囲まれる
- モデルが全体をコードブロックで返すことがある
- **投稿前に外側の ``` を自動除去**して安定化

---

## 🤖 使用しているAIモデルについて（gpt-5.1-codex-mini）

本仕組みでは、OpenAI API のモデルとして **gpt-5.1-codex-mini** を使用しています。

なお、本設計では **特定のモデルに依存しない構成**としており、  
環境変数（`OPENAI_MODEL`）の変更のみで、将来的に別モデルへ切り替えることが可能です。

現段階で gpt-5.1-codex-mini を採用している理由は以下の通りです。

- **PR の diff やコード構造の読解に強く、レビュー用途に向いている**
- 指摘内容が比較的 **簡潔かつ実務的**で、PR コメントとして読みやすい
- 高性能モデルと比較して **コストが低く、GitHub Actions 上で常用しやすい**
- レイテンシが短く、レビュー待ち時間がストレスになりにくい

精度最優先の場面では、より高性能なモデルを選択する余地もありますが、  
本用途では **「常時使えるコスト感」と「実用十分なレビュー精度」** のバランスを重視し、  
現時点では gpt-5.1-codex-mini を使用しています。

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


  
## 🔍 参考：CodeRabbit による自動 PR レビューという選択肢

GitHub 上での自動 PR レビューには、**CodeRabbit** のような専用サービスを利用する方法もあります。

CodeRabbit は、

- Pull Request 作成時に自動でレビューを実行
- リポジトリごとに **YAML ファイルで詳細なレビュー方針を設定可能**
- レビュー観点（設計 / 可読性 / セキュリティ など）を明示的に制御できる

といった特徴を持っています。

一方で、本リポジトリの `/ai-review` 方式は、

- **人間が明示的に起動する（コメントトリガー）**
- GitHub Actions + JavaScript による **完全に自前の制御**
- モデル選択やプロンプト設計を自由に調整可能

という点を重視しています。

用途やチーム文化に応じて、

- 「常時自動レビュー」→ CodeRabbit  
- 「必要なときだけAIレビュー」→ 本仕組み  

といった **使い分け・併用も現実的**だと考えています。

[![Image from Gyazo](https://i.gyazo.com/c8d0a839d0e3844b805e3084edeaddcc.png)](https://gyazo.com/c8d0a839d0e3844b805e3084edeaddcc)

### 参考リンク
- [CodeRabbit](https://www.coderabbit.ai/ja)

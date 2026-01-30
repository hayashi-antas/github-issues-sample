# gh CLI を用いた Issue 一括生成・Project 自動登録スクリプト

## 概要
本スクリプトは、GitHub CLI（`gh`）を用いて **複数の Issue を一括で作成**し、作成した Issue を **GitHub Projects（v2）へ自動で追加**、あわせて **Estimate / Priority といった Project のカスタムフィールドを自動設定**するための Bash スクリプトです。

Issue 作成、Project 登録、フィールド入力を一連の処理として自動化することで、プロジェクト立ち上げ時の初期作業を効率化することを目的としています。

## 自動化スクリプト
- [Issue一括生成スクリプト](../scripts/create_issues_and_project_items.sh)
---

## 背景・目的
GitHub Projects を用いたタスク管理では、

- Issue を1件ずつ作成する
- Project に追加する
- Estimate や Priority を手動で設定する

といった作業が発生します。  
これらを手作業で行うと、時間がかかるだけでなく、入力漏れや設定ミスが起こりやすくなります。

そこで本スクリプトでは、**CLI ベースでこれらの操作をまとめて自動化**し、再現性のある形でタスク初期化を行えるようにしました。

---

## 主な機能
- `gh issue create` による Issue の一括作成
- `gh project item-add` による Project への自動紐付け
- Project の数値フィールド（Estimate）の自動設定
- Project の単一選択フィールド（Priority）の自動設定
- Field 名や選択肢名ではなく **内部 ID を取得して操作**することで、確実にフィールドを更新

---

## 使い方（簡易）
1. スクリプト冒頭で `OWNER`（Organization / ユーザー名）と `PROJECT_NUMBER` を指定  
2. `issues` 配列に、作成したい Issue の情報（タイトル / 本文 / Estimate / Priority）を定義  
3. スクリプトを実行すると、Issue 作成から Project 登録、フィールド設定までが自動で行われます

---

## 工夫した点
- GitHub Projects（v2）の仕様に合わせ、Project / Field / Option の **内部 ID を事前に取得**してから操作している
- Issue 作成後に返却される URL / item_id を用いて、処理を一貫して紐付けている
- Issue 定義を配列として持たせることで、タスク一覧をコードとして管理できるようにしている

---

## 現時点での成果
- GitHub CLI と Projects（v2）を組み合わせた **実用的な自動化スクリプト**を作成できた
- Issue 管理と Project 管理を分断せず、一連の流れとして扱えるようになった
- プロジェクト初期構築時の作業時間を大幅に削減できる見通しが立った

---

## 今後の改善・実装予定
現時点では基本機能の実装を優先していますが、今後以下の改善を検討しています。

- OWNER / PROJECT_NUMBER の指定方法を分かりやすくする補助説明の追加
- 同一 Issue の二重作成を防ぐための事前チェック処理
- Issue 定義を CSV / TSV ファイルから読み込む形式への拡張（区切り文字問題の回避、表形式管理への対応）




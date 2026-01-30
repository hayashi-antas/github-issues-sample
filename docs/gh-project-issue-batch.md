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

時間を確保でき次第、実運用を想定した形へ段階的に拡張していく予定です。


```bash
# --- 設定項目 ---
OWNER="
"
PROJECT_NUMBER=





# 1. 内部IDを一括取得
FIELDS_JSON=$(gh project field-list "$PROJECT_NUMBER" --owner "$OWNER" --format json)
PROJECT_ID=$(gh project list --owner "$OWNER" --format json --jq ".projects[] | select(.number == $PROJECT_NUMBER) | .id")
ESTIMATE_FIELD_ID=$(echo "$FIELDS_JSON" | jq -r '.fields[] | select(.name == "Estimate") | .id')
PRIORITY_FIELD_ID=$(echo "$FIELDS_JSON" | jq -r '.fields[] | select(.name == "Priority") | .id')


# 2. Priority(P0, P1, P2) の各選択肢IDを取得
P0_ID=$(echo "$FIELDS_JSON" | jq -r '.fields[] | select(.name == "Priority") | .options[] | select(.name == "P0") | .id')
P1_ID=$(echo "$FIELDS_JSON" | jq -r '.fields[] | select(.name == "Priority") | .options[] | select(.name == "P1") | .id')
P2_ID=$(echo "$FIELDS_JSON" | jq -r '.fields[] | select(.name == "Priority") | .options[] | select(.name == "P2") | .id')


# デバッグしたければ一度だけ表示してもOK
echo "P0_ID=$P0_ID"
echo "P1_ID=$P1_ID"
echo "P2_ID=$P2_ID"


# データ定義 (タイトル:本文:見積:Priority)
issues=(
"[Issue 1] Bun Workspaces環境構築:モノレポの雛形作成:3:P1"
"[Issue 2] Hono API実装:GET /memosの実装:2:P1"
"[Issue 3] Next.js UI実装:一覧表示画面の作成:5:P2"
"[Issue 4] メモ登録機能:POST APIとフォームの実装:5:P0"
"[Issue 5] データ永続化:SQLite/Drizzleの導入:3:P1"
"[Issue 6] CI設定:GitHub Actionsの構築:2:P2"
"[Issue 7] 夜間自動実行フロー:Coding Agent連携:8:P0"
)


for issue in "${issues[@]}"; do
  # IFSをいじらず cut で分解
  title=$(echo "$issue" | cut -d: -f1)
  body=$(echo "$issue" | cut -d: -f2)
  estimate=$(echo "$issue" | cut -d: -f3)
  priority_label=$(echo "$issue" | cut -d: -f4)


  # 優先度ラベルに応じたID割り当て
  case "$priority_label" in
    "P0") p_id="$P0_ID" ;;
    "P1") p_id="$P1_ID" ;;
    "P2") p_id="$P2_ID" ;;
    *)    p_id="" ;;
  esac


  echo "Creating: $title"


  # Issue作成
  issue_url=$(gh issue create --title "$title" --body "$body")


  # プロジェクトに追加（GitHub側で自動追加していても、ここで明示的に紐付けしてしまう）
  item_id=$(gh project item-add "$PROJECT_NUMBER" --owner "$OWNER" --url "$issue_url" --format json | jq -r '.id')


  # Estimateのセット
  gh project item-edit --id "$item_id" --field-id "$ESTIMATE_FIELD_ID" --number "$estimate" --project-id "$PROJECT_ID" > /dev/null


  # Priorityのセット
  if [ -n "$p_id" ]; then
    gh project item-edit --id "$item_id" --field-id "$PRIORITY_FIELD_ID" --single-select-option-id "$p_id" --project-id "$PROJECT_ID" > /dev/null
  else
    echo "  Warning: option-id not found for $priority_label"
  fi


  echo "Success: $title (Estimate: $estimate, Priority: $priority_label)"
done

```

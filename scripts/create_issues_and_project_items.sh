#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# create_issues_and_project_items.sh
#
# GitHub CLI (gh) を使って Issue を一括作成し、
# GitHub Projects(v2) に追加したうえで、
# Estimate(数値) / Priority(単一選択) を自動設定するスクリプト
#
# 前提:
# - gh がインストール済み & 認証済み (gh auth login)
# - jq がインストール済み
# - 対象 Project(v2) に "Estimate" (Number) と "Priority" (Single select) が存在
# - Priority の選択肢として P0 / P1 / P2 が存在
#
# 実行例:
#   chmod +x scripts/create_issues_and_project_items.sh
#   scripts/create_issues_and_project_items.sh
# ============================================================


# --- 設定項目 ---
OWNER=""           # Organization名 or ユーザー名
PROJECT_NUMBER=    # Project v2 の番号（number）


# --- 事前チェック ---
if ! command -v gh >/dev/null 2>&1; then
  echo "Error: 'gh' が見つかりません。GitHub CLI をインストールしてください。" >&2
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "Error: 'jq' が見つかりません。jq をインストールしてください。" >&2
  exit 1
fi

if [ -z "${OWNER}" ] || [ -z "${PROJECT_NUMBER}" ]; then
  echo "Error: OWNER と PROJECT_NUMBER を設定してください。" >&2
  exit 1
fi


# 1. 内部IDを一括取得
FIELDS_JSON=$(gh project field-list "$PROJECT_NUMBER" --owner "$OWNER" --format json)
PROJECT_ID=$(gh project list --owner "$OWNER" --format json --jq ".projects[] | select(.number == $PROJECT_NUMBER) | .id")

ESTIMATE_FIELD_ID=$(echo "$FIELDS_JSON" | jq -r '.fields[] | select(.name == "Estimate") | .id')
PRIORITY_FIELD_ID=$(echo "$FIELDS_JSON" | jq -r '.fields[] | select(.name == "Priority") | .id')

if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "null" ]; then
  echo "Error: PROJECT_ID を取得できませんでした。OWNER/PROJECT_NUMBER を確認してください。" >&2
  exit 1
fi

if [ -z "$ESTIMATE_FIELD_ID" ] || [ "$ESTIMATE_FIELD_ID" = "null" ]; then
  echo "Error: Estimate フィールドが見つかりませんでした。Project のフィールド名を確認してください。" >&2
  exit 1
fi

if [ -z "$PRIORITY_FIELD_ID" ] || [ "$PRIORITY_FIELD_ID" = "null" ]; then
  echo "Error: Priority フィールドが見つかりませんでした。Project のフィールド名を確認してください。" >&2
  exit 1
fi


# 2. Priority(P0, P1, P2) の各選択肢IDを取得
P0_ID=$(echo "$FIELDS_JSON" | jq -r '.fields[] | select(.name == "Priority") | .options[] | select(.name == "P0") | .id')
P1_ID=$(echo "$FIELDS_JSON" | jq -r '.fields[] | select(.name == "Priority") | .options[] | select(.name == "P1") | .id')
P2_ID=$(echo "$FIELDS_JSON" | jq -r '.fields[] | select(.name == "Priority") | .options[] | select(.name == "P2") | .id')

# デバッグしたければ一度だけ表示してもOK
echo "P0_ID=$P0_ID"
echo "P1_ID=$P1_ID"
echo "P2_ID=$P2_ID"

# Option ID が取れていない場合は警告（処理は継続する）
if [ -z "$P0_ID" ] || [ "$P0_ID" = "null" ] || [ -z "$P1_ID" ] || [ "$P1_ID" = "null" ] || [ -z "$P2_ID" ] || [ "$P2_ID" = "null" ]; then
  echo "Warning: Priority の option-id を一部取得できていません。Priority フィールドの選択肢名(P0/P1/P2)を確認してください。" >&2
fi


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

  if [ -z "$item_id" ] || [ "$item_id" = "null" ]; then
    echo "Error: project item_id を取得できませんでした。issue_url=$issue_url" >&2
    exit 1
  fi

  # Estimateのセット
  gh project item-edit --id "$item_id" --field-id "$ESTIMATE_FIELD_ID" --number "$estimate" --project-id "$PROJECT_ID" > /dev/null

  # Priorityのセット
  if [ -n "$p_id" ] && [ "$p_id" != "null" ]; then
    gh project item-edit --id "$item_id" --field-id "$PRIORITY_FIELD_ID" --single-select-option-id "$p_id" --project-id "$PROJECT_ID" > /dev/null
  else
    echo "  Warning: option-id not found for $priority_label"
  fi

  echo "Success: $title (Estimate: $estimate, Priority: $priority_label)"
done

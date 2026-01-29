# github-issues-sample

## AI Input Cleansing Design Principles

このプロジェクトでは、PRのdiffをAIに渡す前に「入力コンテキスト制御」を行っています。  
目的はデータ削除ではなく、**AIが読むべき情報の最適化**です。

### 設計の核となる考え方

- **リポジトリ自体は変更しない**: `.gitignore`はビルド成果物やログを除外する責務。AIレビューのために既存の`.gitignore`を汚染しない。
- **lockfileは要約して渡す**: `package-lock.json`等は削除せず、依存追加・削除のサマリのみをAIに渡す。全行をAIに読ませてもレビュー品質は向上しない。
- **Validationではなく、Cleansing/Suggestion**: エラーで止めるのではなく、AIが読みやすい形に整形し、除外内容を可視化する。

### .gitignoreとの責務の違い

- `.gitignore`: リポジトリの管理対象外を定義（Git本来の責務）
- Cleansing: AIレビューに不要なファイルを**入力から除外**する（AI入力の責務）

lockfileやテストスナップショットは「Gitで管理すべき」だが「AIレビューで全文読む必要がない」ファイルの典型例です。  
この2つの責務を分離することで、リポジトリ設定に影響を与えずAI入力を制御できます。

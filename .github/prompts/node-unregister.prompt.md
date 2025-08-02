---
mode: 'agent'
tools: ['changes', 'codebase', 'editFiles', 'extensions', 'findTestFiles', 'new', 'problems', 'runCommands', 'runNotebooks', 'runTasks', 'runTests', 'search', 'searchResults', 'terminalLastCommand', 'terminalSelection', 'testFailure', 'usages', 'vscodeAPI']
description: Nodeの登録解除
---
# プロンプト: Nodeの登録解除

以下のステップに従って、該当するNodeの安全な解除手順とコード修正を実行してください。

### ステップ
1. `src/renderer/nodeEditor/nodes/Node/index.ts` からバニラインポートを削除またはコメントアウト
2. `src/renderer/nodeEditor/types/Schemes.ts` の `NodeTypes` から該当Nodeタイプを削除
3. `src/renderer/nodeEditor/nodes/nodeFactories.ts` からNodeコンストラクタ生成コードを削除
4. 該当Nodeに関連するユーティリティやコンポーネントを `src/renderer/nodeEditor/nodes/` 以下から削除または移動

---
mode: 'agent'
tools: ['changes', 'codebase', 'editFiles', 'extensions', 'findTestFiles', 'new', 'problems', 'runCommands', 'runNotebooks', 'runTasks', 'runTests', 'search', 'searchResults', 'terminalLastCommand', 'terminalSelection', 'testFailure', 'usages', 'vscodeAPI']
description: Nodeの登録
---
# プロンプト: Nodeの登録

以下のステップに従って、新しいNodeの実装と登録手順を生成し実行してください。

### ステップ
1. `src/renderer/nodeEditor/nodes/Node/index.ts` のバニラインポートに追加
2. `src/renderer/nodeEditor/types/Schemes.ts` の `NodeTypes` に新しいNodeタイプを追加
3. `src/renderer/nodeEditor/nodes/nodeFactories.ts` にNodeコンストラクタ生成を記述し、右クリックメニューに追加


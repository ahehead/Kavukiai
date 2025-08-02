---
mode: 'agent'
tools: ['changes', 'codebase', 'editFiles', 'extensions', 'findTestFiles', 'new', 'problems', 'runCommands', 'runNotebooks', 'runTasks', 'runTests', 'search', 'searchResults', 'terminalLastCommand', 'terminalSelection', 'testFailure', 'usages', 'vscodeAPI']
description: Controlの登録解除
---

# プロンプト: Controlの登録解除

以下のステップに従って、該当ファイルとコードを特定し、Controlを解除する手順を生成、実行してください。

### ステップ
1. `src/renderer/nodeEditor/types/NodeControl.ts` からControl型定義を削除またはコメントアウト
2. 該当するNodeコンポーネントから当該Controlのインポートと使用を削除
3. `src/renderer/nodeEditor/features/customReactPresets/customReactPresets.ts` からプリセットを削除


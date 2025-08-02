---
mode: 'agent'
tools: ['changes', 'codebase', 'editFiles', 'extensions', 'findTestFiles', 'new', 'problems', 'runCommands', 'runNotebooks', 'runTasks', 'runTests', 'search', 'searchResults', 'terminalLastCommand', 'terminalSelection', 'testFailure', 'usages', 'vscodeAPI']
description: Controlの登録
---
# プロンプト: Controlの登録

以下のステップに従って、必要なファイルと場所を特定し、Controlを登録してください。

### ステップ
1. `src/renderer/nodeEditor/types/NodeControl.ts` に新しいControlの型定義を追加
2. `src/renderer/nodeEditor/nodes/Node/Debug/TestNode.tsx` にControlを組み込む
3. `src/renderer/nodeEditor/features/customReactPresets/customReactPresets.ts` にプリセットを追加


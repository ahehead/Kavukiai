---
mode: 'agent'
tools: ['changes', 'codebase', 'editFiles', 'extensions', 'findTestFiles', 'new', 'problems', 'runCommands', 'runNotebooks', 'runTasks', 'runTests', 'search', 'searchResults', 'terminalLastCommand', 'terminalSelection', 'testFailure', 'usages', 'vscodeAPI']
description: Nodeの名前変更
---
# プロンプト: Nodeの名前変更

以下のステップに従って、既存Nodeの「名前変更」作業を安全に実施してください。

### ステップ
1. `src/renderer/nodeEditor/nodes/Node/index.ts` の該当Nodeのimport文・export名を新しい名前に修正
2. `src/renderer/nodeEditor/types/Schemes.ts` の `NodeTypes` で該当Nodeタイプ名を新しい名前に変更
3. `src/renderer/nodeEditor/nodes/nodeFactories.ts` で該当Nodeのコンストラクタ生成・右クリックメニュー表示名を新しい名前に修正
4. Node本体・関連ユーティリティ・コンポーネントのファイル名やクラス名・型名も新しい名前にリネーム
5. 既存のNode名で参照している箇所（import, 型, 生成処理など）をすべて新しい名前に置換
6. 動作確認・テストを実施し、問題がなければ完了

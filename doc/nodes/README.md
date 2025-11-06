# ノード開発ガイド

## 概要
- ノード関連のコードは `src/nodes` 配下に集約されています。
- ドメインごとにフォルダを分け (`Chat/`, `ComfyUI/`, `Primitive/` など)、各ノード固有の処理をその直下に配置します。
- レンダラー側では `@nodes/...` エイリアスで参照し、既存の Rete.js まわりの仕組み (`src/renderer/nodeEditor/**`) と連携します。

## 推奨ディレクトリ構成
```
src/nodes/
  <Group>/
    common/            # グループ横断の共通処理 (schema, renderer 共通部品など)
    <NodeName>/
      main/            # Electron main プロセス側の IPC ハンドラや永続化処理
      preload/         # preload ブリッジ経由で公開する API
      renderer/        # Rete ノードクラス・React コンポーネントなど UI 実装
      shared/          # main / preload / renderer から共有する型・ユーティリティ
```
- 必要に応じて `common/renderer` や `common/schema` のようにサブフォルダを増やしてください。
- 既存ノードの例: `src/nodes/Primitive/String/String/renderer/StringNode.ts`。

## Rete ノード (renderer) の追加手順
1. 対象グループ (`Primitive` など) の下に `<NodeName>/renderer/` を作成し、Rete ノードクラスを実装します。
2. 既存ノードを参照し、`SerializableInputsNode` などの基底クラスと `DataflowEngine` / `ControlFlowEngine` を利用してください。
3. Control や補助的な UI コンポーネントを共通化したい場合は、`src/nodes/<Group>/common/renderer/` に配置し、各ノードからインポートします。

## コントロールの登録
- 共有コントロールは引き続き `src/renderer/nodeEditor/nodes/Controls/registry.ts` で管理しています。
- 新しい Control を追加したら以下を実施してください。
  1. Control 実装を `src/nodes/<Group>/common/renderer/controls/<ControlName>.tsx` などに配置。
  2. `registry.ts` にエクスポートを追加し、`controlViews` へ登録します。
  3. 必要に応じて `src/nodes/Debug/Test/renderer/TestNode.tsx` でレンダリング確認を行います。

## ノードファクトリへの登録
- ノード一覧は `src/renderer/nodeEditor/nodes/nodeFactories.ts` の `factoryList` で定義しています。
- 追加手順:
  1. `factoryList` の適切なカテゴリ位置へ `define((deps) => new YourNode(...), { op, categories, label })` を追記。
  2. `op` は将来互換のために一意な識別子を付与します。`typeId` は自動で `"<namespace>:<op>"` 形式になります。
  3. メニューやシリアライズ挙動に関わるメタ情報を忘れずに設定してください。

## レイヤーをまたぐノードの注意点
- Electron main / preload を跨ぐ処理を行う際は以下の順で追加します。
  1. `shared/ApiType.ts` の `IpcChannel` に新しいチャネルを追加し、TypeBox でリクエスト/レスポンスの型を定義。
  2. `src/nodes/<Group>/<Node>/main/` に IPC ハンドラを実装し、`src/main/ipc/index.ts` から登録。
  3. `src/nodes/<Group>/<Node>/preload/` に preload API を作成し、`src/preload/index.ts` で `window.App` に公開。
  4. レンダラー側のノードから `window.App.<feature>` もしくは付随するサービス経由で呼び出します。
- 参考: `src/nodes/LMStudio/ListDownloadedModels` 系の実装。

## テストとドキュメント
- ノード固有のユーティリティは `test/renderer/nodeEditor/**` など既存テストの近くに追加してください。
- ドキュメント更新時は、このファイル (`doc/nodes/README.md`) を最新の状態に保ち、他ドキュメントからのリンクを更新します。
- ノードの長期的な再配置計画は `doc/plan/node-refactor-plan*.md` を参照してください。

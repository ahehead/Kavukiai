## フォルダ構成

- nodes/components/   -- ノード共通UIやソケット定義
- nodes/Controls/     -- カスタムコントロール
- nodes/Node/         -- オリジナルノード
- nodes/Node/Primitive/Object/ -- オブジェクト操作系ノード
- nodes/nodeFactories.ts -- ノードの生成関数
- nodes/util/         -- ノード用ユーティリティ
- nodes/README_node.md -- この文章

## Controlの追加後の登録方法
  1. [NodeControl.ts](../types/NodeControl.ts)に追加
  2. [TestNode.ts](Node/Debug/TestNode.tsx)のコントロールに追加
  3. [customReactPresets](../features/customReactPresets/customReactPresets.ts)に追加

## ノード追加手順 (factoryList 主導版)

1. [index.ts](Node/index.ts) のバニラインポート (export *) に新しい Node クラスを追加
2. [nodeFactories.ts](nodeFactories.ts) の `factoryList` 末尾 (カテゴリ適切な位置) に `define((deps) => new YourNode(...), { op, categories, label })` を追加
3. `op` は一意 & 将来互換用の安定キー。`typeId` は自動で `${namespace || "core"}:${op}` になります


### レイヤーをまたぐノード

メインプロセスで実行したい処理をもつノードを作る場合は、IPC チャンネルの追加から始
まるいくつかの手順が必要です。詳細は [`doc/newcomer_guide.ja.md`](../../../doc/newcomer_guide.ja.md#5-%E3%83%AC%E3%82%A4%E3%83%A4%E3%83%BC%E3%82%92%E3%81%BE%E3%81%9F%E3%81%90%E3%83%8E%E3%83%BC%E3%83%89%E3%81%AE%E4%BD%9C%E6%88%90%E6%89%8B%E9%A0%86) を参照してください。

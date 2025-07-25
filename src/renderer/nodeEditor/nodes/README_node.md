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

## ノードの追加後の登録方法

1. [index.ts](Node/index.ts)のバニラインポートに追加
2. [Schemes.ts](../types/Schemes.ts)のNodeTypesに追加
3. [nodeFactories.ts](nodeFactories.ts)にコンストラクタの生成を記述,右クリックに追加
4. LMStudioノードの場合は LMStudio カテゴリに追加する

### レイヤーをまたぐノード

メインプロセスで実行したい処理をもつノードを作る場合は、IPC チャンネルの追加から始
まるいくつかの手順が必要です。詳細は [`doc/newcomer_guide.ja.md`](../../../doc/newcomer_guide.ja.md#5-%E3%83%AC%E3%82%A4%E3%83%A4%E3%83%BC%E3%82%92%E3%81%BE%E3%81%9F%E3%81%90%E3%83%8E%E3%83%BC%E3%83%89%E3%81%AE%E4%BD%9C%E6%88%90%E6%89%8B%E9%A0%86) を参照してください。

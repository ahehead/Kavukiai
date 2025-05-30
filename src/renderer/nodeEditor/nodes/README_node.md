## フォルダ構成

- nodes/Controls -- カスタムコントロール

- nodes/Node  -- オリジナルノード

- nodes/nodeFactory.ts -- ノードの生成関数

- nodes/README.node.md -- この文章

## Controlの追加後
- [NodeControl.ts](../types/NodeControl.ts)に追加
- [TestNode.ts](Node/TestNode.tsx)のコントロールに追加
- [customReactPresets](../features/customReactPresets/customReactPresets.ts)に追加

## ノードの追加後

- [index.ts](Node/index.ts)のバニラインポートに追加
- [nodeFactories.ts](nodeFactories.ts)にコンストラクタの生成を記述,右クリックに追加
- [Schemes.ts](../types/Schemes.ts)のNodeTypesに追加

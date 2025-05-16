## フォルダ構成

- nodes/Controls -- カスタムコントロール

- nodes/Node  -- オリジナルノード

- nodes/nodeFactory.ts -- ノードの生成関数

- nodes/Sockets.ts -- ソケット

- nodes/README.node.md -- この文章

## Controlの追加後
- [types.ts](../types.ts)に追加
- [createNodeEditor.ts](../createNodeEditor.ts)に追加

## ノードの追加後

- [index.ts](Node/index.ts)のバニラインポートに追加
- [nodeFactories.ts](nodeFactories.ts)にコンストラクタの生成を記述
- [types.ts](../types.ts)のNodeTypesに追加

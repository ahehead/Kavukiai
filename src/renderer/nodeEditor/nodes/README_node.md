## フォルダ構成

- nodes/Controls -- カスタムコントロール

- nodes/Node  -- オリジナルノード

- nodes/nodeFactory.ts -- ノードの生成関数

- nodes/Sockets.ts -- ソケット

- nodes/README.node.md -- この文章

## ノードの追加後

- nodes/Node/index.tsのバニラインポートに追加
- nodeFactoryにコンストラクタの生成を記述
- ../types.tsのNodeTypesに追加

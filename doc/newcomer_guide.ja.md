# コードベース概要

このドキュメントは、新しくプロジェクトに参加する開発者向けに、リポジトリの大まかな構造や重要な知識、次に学ぶべきポイントをまとめたものです。

## 1. リポジトリの目的

このプロジェクトは Electron + React を基盤としたデスクトップアプリです。Rete.js を用いたノードベースの UI で、チャットや画像生成など複数の AI モデルを組み合わせられることを目指しています。

## 2. フォルダ構成

```
src/
├─ lib/                # Electron アプリ共通処理
├─ main/               # メインプロセス
│  ├─ features/        # 設定やファイル関連処理
│  ├─ ipc/             # IPC ハンドラ
│  └─ windows/         # ウィンドウ管理
├─ preload/            # レンダラーとの橋渡しをするスクリプト
├─ renderer/           # React ベースの UI
│  ├─ components/      # 汎用コンポーネント
│  ├─ hooks/           # React フック
│  ├─ nodeEditor/      # ノードエディタ
│  └─ screens/         # 画面コンポーネント
├─ resources/          # アイコン等の静的リソース
└─ shared/             # 型定義や共通ユーティリティ
```

- `lib/` : Electron アプリ起動やウィンドウ作成のラッパーを提供します。
- `main/` : `index.ts` がエントリーポイント。`ipc/` や `windows/` にウィンドウ生成や通信ハンドラを分割しています。
- `preload/` : contextBridge を通じて `window.App` へ公開される API を実装します。
- `renderer/` : React で構築されたフロントエンド。`components/` や `nodeEditor/` に UI 部品やノードエディタを配置しています。
- `shared/` : メイン・レンダラー両方で利用する型や定数をまとめています。

## 3. 主要スクリプト

- `pnpm dev` : 開発用のホットリロード環境でアプリを起動します。
- `pnpm start` : ビルド済みのアプリをプレビュー起動します。
- `pnpm build` : Electron 用にコンパイルします。
- `pnpm test` : `vitest` を用いたテストを実行します。
- `pnpm lint` : `biome` による静的解析を行います。

プロジェクトは Node.js `20` 系と `pnpm` を前提としています。初回セットアップでは `pnpm install` を実行してください。

## 4. 今後学ぶべきポイント

1. **Rete.js と React の連携**
   - `src/renderer/nodeEditor` 以下のコードを読むことで、ノードエディタのカスタムノード実装やプラグイン設定の方法を学べます。
2. **IPC 通信の追加方法**
   - `src/preload/README_ipc.md` に手順が簡潔にまとめられています。新しい通信チャンネルを追加する際は `shared/ApiType.ts` と `src/main/ipc` を中心に変更します。
3. **アプリ設定と状態管理**
   - `src/main/features/file/conf.ts` では `electron-conf` を利用した設定ファイル管理の実装例を見ることができます。レンダラー側では zustand を用いた状態管理 (`src/renderer/features/dirty-check` 等) を確認してください。
4. **ビルド・リリースフロー**
   - `electron-builder.ts` や `src/lib/electron-app/release` に、パッケージ生成や配布物作成用スクリプトがあります。リリース手順を理解する際の参考になります。

より詳細な仕様や機能一覧は `doc/README.ja.md` も参照してください。

## 5. レイヤーをまたぐノードの作成手順

OpenAI や LMStudio などメインプロセス側の機能を利用するノードを追加する場合は、以下の流れで実装します。

1. `shared/ApiType.ts` の `IpcChannel` に新しいチャンネルを定義する。
2. `src/main/ipc` にハンドラを作成し、`registerIpcHandlers` から登録する。
3. `src/preload` に対応 API を追加し、`index.ts` から `contextBridge` へ公開する。
4. レンダラーでは `electronApiService` を通じて呼び出し、ノード内で結果を処理する。

`ListDownloadedModelsNode` がこれらの手順を踏んだ実装例となっています。


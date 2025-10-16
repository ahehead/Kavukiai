# ノード単位再構成 計画書

## 背景
- Electron アプリの構造が `src/main`, `src/preload`, `src/renderer`, `src/shared` とレイヤ別に分かれているため、ある「ノード（機能）」に関する実装がディレクトリ横断で散在し、追跡・把握が難しい。
- 特に NodeEditor 系の schema/type、LMStudio や ComfyUI といったノード固有処理が遠く離れているため、保守性が下がっている。

## 目的
- ノード単位で main/preload/renderer/shared/schema type をまとめ、機能境界ごとにコードを見渡しやすくする。
- preload / ipc 登録処理をディレクトリ探索（ビルド時自動登録）に置き換え、ノード追加・削除時のメンテコストを下げる。
- 既存の型定義・schema をノードごとのサブディレクトリに整理しなおし、参照インポートをシンプルにする。

## 対応方針の概要
- `src/nodes/<nodeフォルダ>/<node>/` 配下に以下のように再配置する。
  - `main/` … IPC ハンドラや main プロセス専用ユーティリティを配置。
  - `preload/` … `contextBridge` で公開する API, schema, 型など。
  - `renderer/` … NodeEditor の UI, hooks, スキーマ等。
  - `shared/` … メイン・レンダラ双方から参照する pure TypeScript の型・定数。
  - `schema/` … ノード間でやり取りするデータ型をTypebox定義する
- `src/main/index.ts`, `src/preload/index.ts` からは `import.meta.glob` を利用した自動登録ロジックを呼び出し、ノードフォルダ内のエントリファイル（例: `main/register.ts`, `preload/api.ts`）を一括読み込みする。
- 当面は既存のトップレベル `src/main`, `src/preload` 等と併存させ、徐々に機能を移す。移行完了後にレガシーファイルを段階的に削除する。

## フェーズ別計画

## 進捗トラッカー
- [x] Phase 1: パイロットノード構築と基盤整備
- [ ] Phase 2: Preload 自動登録化
- [ ] Phase 3: Main(IPC) 自動登録化
- [ ] Phase 4: Renderer Schema/Types 再配置
- [ ] Phase 5: shared/type 全体整理

### Phase 1: 準備
- [x] `src/nodes/` ルートを作成し、`src/nodes/LMStudio/LMStudioStart` をパイロット対象に選定。
- [x] 共通ユーティリティ: `loadModules` 的なヘルパー（`import.meta.glob` ラッパー）を `src/lib` へ追加。
- [x] ビルド設定 (electron.vite.config.ts) のエイリアス設定確認・必要なら `@nodes` 等の alias を追加。

### Phase 2: preload 再構成
- [ ] `src/preload/index.ts` を `import.meta.glob("../nodes/**/preload/*Entry.ts")` のような自動登録へ書き換え。
- [ ] LMStudio/LMStudioStart から着手し、既存の api を `src/nodes/LMStudio/LMStudioStart/preload/api.ts` へ移動。
- [ ] LMStudio/LMStudioStart関連のAPI の型は `src/nodes/LMStudio/LMStudioStart/shared/types.ts` へ配置。
- [ ] 他ノードを順次移行。移行済みノードのレガシーファイルを削除。

### Phase 3: main (IPC) 再構成
- [ ] `src/main/ipc/index.ts` を `import.meta.glob("../nodes/**/main/ipc.ts")` からの自動登録へ切り替え。
- [ ] LMStudio 関連 (`registerLMStudioHandlers`, `registerLMStudioChatHandler`, `registerLMStudioLoadModelHandler`) からLMStudioStart関連を `src/nodes/LMStudio/LMStudioStart/main` に移動.LMStudio関連のノード全体に関係ありそうな部分は、`src/nodes/LMStudio/commn/main`へ。ひとつの `register` エントリから束ねる。
- [ ] 順次移行。`registerIpcHandlers` 内の個別呼び出しは段階的に廃止。

### Phase 4: Renderer NodeEditor Schema/Types
- [ ] `src/renderer/nodeEditor/types/Schemas` や `shared/type` のうちノード固有の要素を各ノード配下の `schema/` または `shared/` に移動。
- [ ] 共通 schema は `src/nodes/common/schema` または `src/nodes/commna/_shared` にまとめる案を検討。
- [ ] 最初の対象として `src/renderer/nodeEditor/nodes/Node/LMStudio/LMStudioStartNode.tsx` を `src/nodes/LMStudio/LMStudioStart/renderer/LMStudioStartNode.tsx` へ移設し、必要なら `src/nodes/LMStudio/LMStudioStart` 配下に `main/`, `preload/`, `shared/`, `schema/` を段階的に追加する。

### Phase 5: shared/type の整理
- [ ] `src/shared` 配下を棚卸しし、ノード固有の型は `src/nodes/<nodeフォルダ>/<node>/shared` へ移動。
- [ ] どのノードからも参照される純粋ユーティリティは `src/shared/core` などに再配置。
- [ ] 型の循環参照が発生する場合は `shared/core` に残す。

## モジュール自動登録の詳細案
- preload: `import.meta.glob("../nodes/**/preload/expose.ts", { eager: true })` で各モジュールの `default` もしくは `register(apiContext)` を実行。
- main: `import.meta.glob("../nodes/**/main/*.ipc.ts", { eager: true })` から `export const register = (ctx) => { ... }` を呼び出す。
- テスト: 単体で `pnpm vitest run -t "preload auto registration"` など追加し、登録対象が期待通りであることを検証。

## リスク・留意事項
- `import.meta.glob` は Vite ビルド時解決のため、ファイル命名規則を厳格化する必要がある。
- 境界移行中は循環参照や duplicate expose の検出が難しくなるため、段階毎に `pnpm lint`, `pnpm test` を必ず実行。
- Electron メインプロセス再起動時のパス解決が変わるため、`__dirname` 依存ロジックがないか確認。

## 次のアクション
- [x] `src/nodes/LMStudio/LMStudioStart` ディレクトリを作成し、`renderer/LMStudioStartNode.tsx` へ既存ノードを移動・再輸出できる状態に整える。
- [ ] LMStudio ノードの preload/main エントリファイルを `src/nodes/LMStudio/...` へ複製し、既存実装とリンクを張る。
- [ ] `src/preload/index.ts` に仮実装の自動登録関数（まだ LMStudio のみ）を導入し動作確認。
- [ ] 続いて `src/main/ipc/index.ts` でも同様の手法を適用。
- [ ] NodeEditor schema/type の移行規約を追加で定義し、別ドキュメント化する（必要に応じて）。

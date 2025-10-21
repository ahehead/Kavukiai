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

### Phase 1: 準備
- [x] `src/nodes/` ルートを作成し、`src/nodes/<group...>/<node>` をパイロット対象に選定。
- [x] 共通ユーティリティ: `loadModules` 的なヘルパー（`import.meta.glob` ラッパー）を `src/lib` へ追加。
- [x] ビルド設定 (electron.vite.config.ts) のエイリアス設定確認・必要なら `@nodes` 等の alias を追加。

### Phase 2: preload 再構成
- [x] `src/preload/index.ts` を `import.meta.glob("../nodes/**/preload/*Entry.ts")` ベースの自動登録に切り替え。
- [ ] パイロットノードの preload API を `src/nodes/<group>/<node>/preload/api.ts` へ移し、必要な型を `shared/types.ts` に整理。
- [ ] 移行済みの preload レガシーファイルを削除し、対応テストを更新。

### Phase 3: main (IPC) 再構成
- [x] `src/main/ipc/index.ts` で `import.meta.glob("../nodes/**/main/ipc.ts")` を用いた自動登録を導入。
- [ ] パイロットノードの IPC ハンドラを `src/nodes/<group>/<node>/main` に再配置し、共通処理は `src/nodes/<group>/common/main` へ集約。
- [ ] レガシーipcを削除して、対応テストを更新。

### Phase 4: Renderer NodeEditor Schema/Types
- [ ] `src/renderer/nodeEditor/types/Schemas` や `src/shared` からノード固有の要素を各ノード配下の `schema/` や `shared/` へ移動。
- [ ] 再利用する schema は `src/nodes/common/schema`（仮）などの横断ディレクトリに集約。
- [ ] 各ノードの UI / schema 実装を `src/nodes/<group>/<node>/renderer/` へ段階的に移し、既存 exports を維持。

### Phase 5: shared/type の整理
- [ ] `src/shared` 配下を棚卸しし、ノード固有の型は `src/nodes/<group>/<node>/shared` へ移動。
- [ ] 横断的に利用するユーティリティや型は `src/shared/core` などの共通ディレクトリへ再配置。
- [ ] 循環参照懸念があるものは段階的に抽出しつつ、必要に応じて共通ディレクトリに残す。


## モジュール自動登録の詳細案
- preload: `import.meta.glob("../nodes/**/preload/expose.ts", { eager: true })` で各モジュールの `default` もしくは `register(apiContext)` を実行。
- main: `import.meta.glob("../nodes/**/main/*.ipc.ts", { eager: true })` から `export const register = (ctx) => { ... }` を呼び出す。

## リスク・留意事項
- `import.meta.glob` は Vite ビルド時解決のため、ファイル命名規則を厳格化する必要がある。
- 境界移行中は循環参照や duplicate expose の検出が難しくなるため、段階毎に `pnpm lint`を必ず実行。またtestがあれば `pnpm test run -t "<node>"`を実行。確認。
- Electron メインプロセス再起動時のパス解決が変わるため、`__dirname` 依存ロジックがないか確認。

## ノード移行チェックリスト

### LMStudio
- [ ] FetchModelInfos
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] ListDownloadedModels
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] LLMPredictionConfig
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] LMStudioChat
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] LMStudioLoadModel
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [x] LMStudioStart
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] LMStudioStop
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [ ] ModelInfoToModelList
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] ServerStatus
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] UnLoadModel
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5

### ComfyUI
- [ ] ComfyDesktopStart
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] ComfyUIFreeMemory
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] ComfyUI
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] FetchCheckpoints
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] FetchTemplateWorkflows
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] FetchUserWorkflowList
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] LoadWorkflowFile
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] MergeWorkflowInputsDefaults
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] WorkflowInputs
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] WorkflowOutputs
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] WorkflowRefToApiWorkflow
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5

### Chat
- [ ] LMStudioToUChatCommand
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] OpenAIToUChatCommand
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] ReverseRole
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] UChatGetLastMessage
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] UChatMessageByString
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] UChatMessage
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] UChat
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] UChatRole
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] UChatToLMStudio
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] UChatToOpenAI
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] UChatToString
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] UPartText
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5

### OpenAI
- [ ] JsonSchemaFormat
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] OpenAI
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] ResponseCreateParamsBase
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] ResponseTextConfig
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5

### Debug
- [ ] Test
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] Unknown
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5

### Inspector
- [ ] Inspector
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5

### Primitive（基本）
- [ ] Bool
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] CreateSelect
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] Number
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5

### Primitive / Array
- [ ] Array
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] Join
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] ToArray
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5

### Primitive / Flow
- [ ] CounterLoop
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] IF
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] Run
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5

### Primitive / Image
- [ ] SelectImage
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] ShowImage
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5

### Primitive / Object
- [ ] JsonSchema
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] JsonSchemaToObject
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] ObjectPick
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] ParseJsonAndPick
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] ParseJsonToObject
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5

### Primitive / String
- [ ] AutoTemplateReplace
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] CodeFence
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] DefaultString
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] JsonFilePath
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] MultiLineString
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] NumberToString
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] ObjectToString
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] ObjectToYAMLString
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] StringForm
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] String
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] TemplateReplace
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5

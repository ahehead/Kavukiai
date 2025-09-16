# Features 概要

各 `features` フォルダに含まれる機能の概要と、現状の仕様および改善案をまとめる。

## src/main/features

### file
- `conf.ts` : アプリ設定および API キーを `electron-conf` で管理。API キーは `safeStorage` を利用して暗号化保存。
- `lastDirPath.ts` : 最終利用ディレクトリを設定／取得し、保存ダイアログ用パスも組み立てる。

### openFile.ts
- JSON ファイル選択ダイアログを開き、選択されたファイルを読み込んでパースする。

### window.ts
- `WebContents` から `BrowserWindow` を取得するユーティリティ。

改善アイデア
- アプリ設定のバックアップ／復元機能を提供する。

## src/renderer/features

### dirty-check
- `useIsFileDirty` : ファイルの履歴やグラフハッシュを比較し未保存状態を検出する React フック。
- `hash.ts` : `SHA-256` でハッシュを計算し、`isFileDirty` を提供。

改善アイデア
- 大きなファイルでも高速に判定できるよう Web Worker 化を検討。

### services
- `appService.ts` : `window.App` に公開された API を型安全に呼び出すラッパー。

### tab
- `TabBar.tsx` : 複数ファイルをタブ表示し、アクティブ切り替えや閉じる操作に対応。
- `getNewActiveFileId.ts` : タブ閉鎖時に次にアクティブにする ID を計算。

改善アイデア
- タブをドラッグして順序を変更できるようにする。

### toast-notice
- `useNoticeStore` : 通知を保持する Zustand ストア。最大 40 件をローカル保存。
- `notify.ts` : `sonner` を利用して即時トースト表示＋ストアに追加。
- `NoticeButton.tsx` : ベルアイコンをクリックすると通知一覧をポップオーバー表示。Esc キーで閉じる。
- `types.ts` : Notice 型定義。

改善アイデア
- 通知をカテゴリ別にフィルタリングできる UI を追加。

## src/renderer/nodeEditor/features

### contextMenu
- サブメニューは項目にホバーして 300ms 後に開く。
- メニュー位置はクリック位置とエディタサイズから計算。

改善アイデア
- キーボードの上下キーで項目選択・Enter で実行できるようにする。

### connection_drop_menu
- 接続線をドロップした位置に応じて候補ノードを提示し、素早くノード追加＋接続を行う。

### customReactPresets
- Rete.js の ReactPreset を拡張し、各種カスタムコントロールやソケット表示を提供。

改善アイデア
- ノードごとにテーマを切り替えられるようプリセットをパラメータ化。

### customClassicFlow
- 既定のエグゼキューションフローとデータフローの見た目／当たり判定を調整。

### disable_double_click_zoom
- ダブルクリックによるズーム操作を無効化するパイプ。

改善アイデア
- ユーザー設定で有効／無効を切り替えられるようにする。

### dragPan
- 中・右クリック、もしくは Space + 左ドラッグでエディタをパン可能。

改善アイデア
- タッチデバイス向けに二本指ドラッグにも対応する。

### deleteSelectedNodes
- Delete キー押下で選択中のノードをまとめて削除する。

改善アイデア
- Undo/Redo に対応した削除履歴の記録を追加する。

### editor_state
- エディタの履歴やノード状態を取得・復元するユーティリティを提供。

改善アイデア
- 履歴をセッションごとに自動保存し、クラッシュ時に復元できるようにする。

### gridLineSnap
- ノード移動後にグリッド幅へスナップさせる。ズームに応じて線幅や色を調整。

改善アイデア
- スナップ間隔や色を設定画面から変更可能にする。

### deserializeGraph
- JSON からノードを生成し位置・接続を復元する。

改善アイデア
- 不明なノードタイプを検出した際、ユーザーに警告を表示する。

### nodeSelection
- Shift や Ctrl/Meta を用いた複数選択。矩形ドラッグによる範囲選択に対応。

改善アイデア
- 選択ノードを一括でグループ化する機能を追加する。

### group
- ノード群をグループ化し、見通しと移動・管理を容易にする。

### nodeFactory
- ノード生成のエントリポイント。ファクトリリストからノードを解決し、配置や初期化を担当。

### safe-dataflow
- ノードのデータフロー評価をセーフに実行する補助。型や存在チェックを強化。

### serializeGraph
- エディタ状態を JSON 形式にシリアライズする。

改善アイデア
- バージョン管理システム連携のため差分のみ出力できるオプションを検討。

### socket_type_restriction
- 接続前にソケットの互換性を検証し、接続可否を判定する。

改善アイデア
- 非互換時にツールチップで理由を表示する。

### updateConnectionState
- 接続／切断時にソケット状態を更新し、関連ノードを再描画。データフローのキャッシュもリセット。

改善アイデア
- 変更履歴に接続イベントを記録し Undo/Redo 対応を強化する。

### pasteWorkflow
- コンテキストメニューからノードのコピー／ペーストに対応。
	- コピー時は選択ノードをバウンディングボックス原点に正規化して `GraphJsonData`（`shared/JsonType.ts`）としてクリップボードへ保存。
	- ペースト時は新規IDに再割り当てし、ペースト位置（ワールド座標）へ平行移動して復元。
	- 現状、最小限の構造検証のみ（配列存在チェック）。

今後の実装TODO
- 履歴（Undo/Redo）に追加する（1ペースト操作を1トランザクションとして記録）。
- ペースト直後に貼り付けたノード群を選択状態にする（ズーム/パン調整も検討）。
- キーボードショートカットに対応する：Ctrl + C / Ctrl + V（macOS は Cmd も考慮）。
- TypeBox で `GraphJsonData` のスキーマを定義し、貼り付け前にバリデーションする（バージョンも検証）。
- 親子関係（`parentId`）の扱いを設計する（今は未対応・不要）。親が同時にコピーされていない場合の処理方針（親解除/警告/追随）を決める。

## src/renderer/features（抜粋の補足）

### dragdrop_workflow
- OS からのファイルドロップなどを受け、ワークフローに取り込む導線を提供。

### file / png
- ファイル保存・読み込み、PNG スナップショットの入出力ユーティリティ。

### main-store
- アプリ全体設定や UI 設定の Zustand ストア。

### setting_view
- 設定モーダル（API キー入力・ロード）と関連ストア。

### templatesSidebar / titlebar / ui
- テンプレート一覧サイドバー、タイトルバー、UI 共通コンポーネント群。

## src/main/ipc

- `apikeys.ts` : API キーの保存・ロード。`electron-conf` と `safeStorage` を利用。
- `close-confirm.ts` : 終了確認ダイアログの制御。
- `export-png.ts` / `import-png.ts` : PNG へのスナップショット書き出し・読み込み。
- `filepath.ts` : パス選択や解決補助。
- `load-file.ts` / `save.ts` : JSON ワークフローの読み込み／保存。
- `openai.ts` : OpenAI 連携（API キー読み出し含む）。
- `read-json-by-path.ts` : 任意パスの JSON 読み込み。
- `snapshot.ts` : スナップショット用メタ情報の保持・取得。

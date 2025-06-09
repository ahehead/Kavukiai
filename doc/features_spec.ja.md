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

改善アイデア
- 型定義を自動生成し、メイン側との整合性を保つ仕組みを追加する。

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

### customReactPresets
- Rete.js の ReactPreset を拡張し、各種カスタムコントロールやソケット表示を提供。

改善アイデア
- ノードごとにテーマを切り替えられるようプリセットをパラメータ化。

### disable_double_click_zoom
- ダブルクリックによるズーム操作を無効化するパイプ。

改善アイデア
- ユーザー設定で有効／無効を切り替えられるようにする。

### dragPan
- 中・右クリック、もしくは Space + 左ドラッグでエディタをパン可能。

改善アイデア
- タッチデバイス向けに二本指ドラッグにも対応する。

### editor_state
- エディタの履歴やノード状態を取得・復元するユーティリティを提供。

改善アイデア
- 履歴をセッションごとに自動保存し、クラッシュ時に復元できるようにする。

### gridLineSnap
- ノード移動後にグリッド幅へスナップさせる。ズームに応じて線幅や色を調整。

改善アイデア
- スナップ間隔や色を設定画面から変更可能にする。

### loadGraphFromJson
- JSON からノードを生成し位置・接続を復元する。

改善アイデア
- 不明なノードタイプを検出した際、ユーザーに警告を表示する。

### nodeSelection
- Shift や Ctrl/Meta を用いた複数選択。矩形ドラッグによる範囲選択に対応。

改善アイデア
- 選択ノードを一括でグループ化する機能を追加する。

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

# チャットから始まるNode-LocalAI-Flow

LLMとAI画像生成モデルをノードベースUIで組み合わせ実行することができる。特にチャットUIを持ったノードを起点としている。ノードを組み合わせることで、プロンプトで絵を生成、絵からキャラストーリーをLLMで作成、チャットから風景を画像生成で作成、ストーリの進行で画像が変わる、などの処理を組める。
というのをコンセプトにしたデスクトップアプリです。

## 開発環境

[Electron App](https://github.com/daltonmenezes/electron-app)というテンプレートを使用。

```
* Electron
* ReactJS v19
* React Router DOM v7 and Electron Router DOM v2
* React Developer Tools
* Code inspector (holding Alt or Option key on DOM element and clicking on it)
* TypeScript v5
* Electron Vite
* TailwindCSS v4
* shadcn/ui
* lucide-icons
* Biome / EditorConfig
* Electron Builder
* action-electron-builder
```

```
Structure Overview

## src/lib
A folder containing lib configurations/instances.

## src/main
A folder containing the main process files and folders.

## src/renderer
A folder containing the renderer process files and folders. ReactJS lives here!

## src/preload
A folder containing the preload script that expose the API connection between main and renderer world by IPC in the context bridge.

## src/resources
A folder containing public assets and assets for the build process like icons.

> **Note**: all the content inside the **public** folder will be copied to the builded version as its.

## src/shared
A folder containing data shared between one or more processes, such as constants, utilities, types, etc.
```

### 追加のライブラリ

* "rete": "^2.0.5",
* "electron-conf": "^1.3.0", (electron-store互換https://github.com/alex8088/electron-conf)

## 機能要件・仕様
### デスクトップアプリ

### ノードUI

ノードでコネクションを繋いで、Runノードのボタンを押すと、Runノードからexecソケットでつながったノードが実行される。

comfyuiのようにワークフローをjsonでエクスポート、インポートできるようにしたい。(chat historyノードのようなデータをexportするかどうかを選べるノードもある。)

comfyuiのようなノードのプラグインシステムは大変なので、今回考えない。

各ノードの実行状況がわかるように、なにかしらリアクションをつける。

#### ノード操作

ソケットの右横、socket titleの左に型を薄く表示、同じ型にしか繋げないようにする。

基本的なノード操作をできるだけ実装する。
shiftで複数選択、
Ctrlで選択個別解除、
複数選択を削除、コピー、デュプリケート、
ノードのソケットからコネクションを伸ばして離すとその、ソケットの型のノードが一覧で出る。
基本的なショートカットキー、ctrl+s ctrl+c ctrl+p, ctrl+dなどを実現

テンプレートをいくつか作ってあって、menuのテンプレートから新規作成、またはクリップボードにコピーできる。

#### ファイル操作

vs codeのように、ファイルは未保存でも、そのままの状態で復帰。
保存済みかどうかを管理。

複数のファイルをタブで並べる。タブを選択すると、rete.jsのeditorのノードデータを切り替えて、表示を変える。



### 設定画面

menuから設定画面を呼び出せる。設定画面は、画面上にオーバーフローして出てくる、背景はぼかされる。

openai api keyは設定UIで管理する。裏では、electron safeStorageを使い暗号化する。

### UI、見た目
スタイリッシュ、業務的。色はトリコロールカラーガンダムをアクセントに、赤、青(データフロー)、黄色(コントロールフロー)、背景は白系

ノードのコントロールフローのソケットは、右向き三角のアイコンを使う。

ノードのデータフローのソケットは、小さな丸、つなげると大きくなり色が明るく。

実装は主にrete.jsに用意されたカスタム機能を使う。または、githubから中のコードをコピペ改変してオーバーロードする

### ノード種類
- **stringノード**
  - 説明: 短い文字列のフィールドをもち、入力文字列をそのまま次ノードへ渡す  
  - 出力: string  
- **multi line stringノード**
  - 説明: 長文プロンプトを入力するテキストボックスをもつ  
  - 出力: string  
- **テンプレートノード**
  - 説明: テンプレート文字列内の特定文字を置換用文字列で置き換える  
  - 入力:  
    - template: string (置換対象含む)  
    - targetString: string
    - insertString: string 
  - 出力: string  
- **キャラクターノード**
  - 説明: キャラ設定項目を自由に追加できるフィールドをもつ  
  - 出力: string  
- **Run Node**
  - 説明: execを起動するボタン
  - 出力:
    - exec: トリガー
- **Chatノード**
  - 説明: メッセージフィールドと、sendボタンがあり、chat context(user,assistantのメッセージのリスト)を表示するノード。このノードはAIには基本的な部分を作ってもらって、人が作る  
  - 入力:  
    - exec: any (トリガー)  
    - message: string (ユーザー入力)  
    - context: context
  - 出力:  
    - exec: any (次実行トリガー)  
    - exec: history (histroyノードへのアクション)  
    - context: chat context (チャットコンテキスト)  
- **chat historyノード**
  - 説明: chat contextのリストを持つ。contextを選択すると、そcontextを流す
  - 入力:  
    - exec: any (トリガー)  
    - context: chat context 
  - 出力:
    - context: chat context

- **通信ノード**
  - 説明: 設定に基づいてAPIへチャットを送信する  
  - 入力:  
    - exec: any (トリガー)  
    - setting: chat setting (チャット設定)  
    - context: chat context (チャットコンテキスト)  
  - 出力: any (API呼び出し結果を次へ転送)  
- **ComgyUIノード**
  - 説明: ローカルのComfyUIのapiに投げて画像を生成、取得
  - 入力:
    - prompt : string
    - image : image | null  
  - 出力
    - image

- **画像表示**
  - 説明: 画像を表示する
  - 入力:  
    - exec: any (トリガー)  
    - image: image    
  
## 検索
rete.jsまわりを書くときはなるべく[Doc](https://retejs.org/docs)や[Exsamples](https://retejs.org/examples)を確認して考える。

rete.js + react 
https://retejs.org/docs/guides/renderers/react
https://retejs.org/examples/customization/react

rete.jsのカスタマイズ時は、なるべくgithubのコードを確認する。
https://github.com/retejs/react-plugin/tree/next/src/presets/classic/components

データベース側、開発時では固まるまで直接jsonを編集する。"C:\Users\segawa\AppData\Roaming\my-electron-app\config.json"などのjsonを直接クリアするなどして、開発する。 

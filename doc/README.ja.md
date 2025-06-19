# チャットから始まるNode-LocalAI-Flow


## 背景

LMstudioやComfyUIやOpenAI APIのようなAIを組み合わせて、検証できるツールが欲しかった。例えば、チャットをして、チャットの履歴から絵を生成させたい場合、どれくらいの範囲を含めるのか、要約を挟むのか、などを気軽に試したい。

このアプリはLLMとAI画像生成モデルをノードベースUIで組み合わせ実行することができる。ノードを組み合わせることで、プロンプトで絵を生成、絵からキャラストーリーをLLMで作成、チャットから風景を画像生成で作成、ストーリの進行で画像が変わる、などの処理を組める。

## 開発環境の作成

[Electron App](https://github.com/daltonmenezes/electron-app)というテンプレートを使用。

## 主なライブラリ
| ライブラリ                       | 用途                    |
| -------------------------------- | ----------------------- |
| Electron                          | デスクトップアプリ基盤  |
| ReactJS v19                       | UI レンダリング         |
| TypeScript v5                     | 型安全な開発            |
| TailwindCSS v4                    | ユーティリティファーストCSS |
| rete v2.0.5                       | ノードベースUI          |
| (その他) shadcn/ui, lucide-icons  | 補助コンポーネント      |
| zustand 　　　　　　　　　　　　　　| storeライブラリ         |
| typebox                           | json schema            |

## フォルダ構成
```
src/
├─ lib/                # 共通設定・ユーティリティ
├─ main/               # メインプロセス
│  ├─ features/        # 設定ファイル管理など
│  ├─ ipc/             # IPC ハンドラ
│  ├─ menu/            # アプリメニュー
│  └─ windows/         # ブラウザウィンドウ生成
├─ preload/            # IPC ブリッジ
├─ renderer/           # React レンダラー
│  ├─ components/      # 共有UIコンポーネント
│  ├─ hooks/           # React フック
│  ├─ lib/             # フロント共通ユーティリティ
│  ├─ nodeEditor/      # ノードUI全体
│  └─ screens/         # 画面コンポーネント
├─ resources/          # 画像・アイコン等
└─ shared/             # mainプロセスとrenderプロセス共通要素。アプリ全体の型がここ。
```

### nodeEditorフォルダ
Rete.js + React で実装したノードベースUI
- CreateNodeEditor.ts   : エディタとプラグイン設定
- features/             : コンテキストメニューなど拡張機能
- nodes/                : ノード実装やカスタムコントロールを含む
- types/                : `Schemes`, `AreaExtra` 型定義
## 機能要件・仕様
### デスクトップアプリ

・OpenAIや、ローカルLLMに通信を行うため、ブラウザツールより、デスクトップアプリのほうが都合が良いのでデスクトップアプリにする。

・ノードエディタなど画面を作るのが、Reactなら個人的に書きやすいので、Electronにする。ただPythonとの親和性は落ちると思われる。

・electron-viteでホットリロード。electorn-viteとelectorn-storeが今のバージョンだと環境設定が合わないので、electron-store互換のライブラリを今のところは使う。

### ノードUI

・ノードでコネクションを繋いで、Runノードのボタンを押すと、Runノードからexecソケットでつながったノードが実行される。(ComfyUI + Unity VisualScriptingのイメージ、だけどコンセプトを提示する程度までが目標なので、簡単に。)

・（ComfyUiのように）ノードの状態をjsonでエクスポート、インポートできるようにしたい。(また、chat historyノードのようなデータをexportするかどうかを選べるノードもある。)

・comfyuiのようなノードのプラグインシステムは大変なので、今回考えない。
・各ノードの実行状況がわかるように、なにかしらリアクションをつける。

#### ノード操作

・ソケットの右横、socket titleの左に型を薄く表示、同じ型にしか繋げないようにする。

・基本的なノード操作をできるだけ実装する。
shiftで複数選択、
Ctrlで選択個別解除、
複数選択を削除、コピー、デュプリケート、
ノードのソケットからコネクションを伸ばして離すとその、ソケットの型のノードが一覧で出る。
基本的なショートカットキー、ctrl+s ctrl+c ctrl+p, ctrl+dなどを実現

・テンプレートをいくつか作ってあって、テンプレートから新規作成、またはクリップボードにコピーできる。

#### ファイル操作

・history機能がある。
・急にアプリが落ちても復帰できるように、編集中に状態を保存しておく。zustand persist
・未保存かどうかを管理する。（historyの状態やhashを使う）。


・複数のファイルをタブで並べる。タブを選択すると、rete.jsのeditorの状態を切り替えて表示を変える。

### 設定画面

・menuから設定画面を呼び出せる。設定画面は、画面上にオーバーフローして出てくる、背景はぼかされる。
・openai api keyは設定UIで管理する。裏では、electron safeStorageを使い暗号化する。

### UI、見た目
・スタイリッシュ、業務的。、背景は白系。

・ノードのコントロールフローのソケットは、右向き三角のアイコンを使う。

・ノードのデータフローのソケットは、小さな丸、つなげると大きくなり色が明るく。

・見た目実装はrete.jsに用意されたカスタム機能を使う。または、githubから中のコードをコピペ改変してオーバーロードする

・shadcn/uiをベースに使う

### 通知

・エラーなど通知を右下に表示する。表示は一定時間で消える。右下のベルマークを押すことで一覧で確認できる。

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
- **View String Node**
  - 説明: 画面にstringを表示するボタン
  - 入力:
    - exec: トリガー
    - string: string
  - 出力:
    - exec: トリガー
    - string: string
- **Chatノード**
  - 説明: メッセージフィールドと、sendボタンがあり、chat context(user,assistantのメッセージのリスト)を表示するノード。
  - 入力:  
    - exec: any (トリガー)  
    - message: string (ユーザー入力)  
    - context: context
  - 出力:  
    - exec: any (次実行トリガー)  
    - exec: history (histroyノードへのアクション)  
    - context: chat context (チャットコンテキスト)  

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

#### その他のノード構想
文字処理系ノード
リスト処理系のーど
ifノード, execをdataで分岐
counterノード、Loopをn回す
Webhookノード、なにかのwebhookで発火
folderノード、ファイルを順番に取り出す
watchノード、フォルダやファイルを監視


## アドレス

rete.js
[Doc](https://retejs.org/docs)
[Exsamples](https://retejs.org/examples)

rete.js + react 
https://retejs.org/docs/guides/renderers/react
https://retejs.org/examples/customization/react

rete.js react pluginのgithub、特にコンポーネント部分
https://github.com/retejs/react-plugin/tree/next/src/presets/classic/components

データベース側、開発時では固まるまで直接jsonを編集する。
"C:\Users\{{userName}}\AppData\Roaming\my-electron-app\config.json"などのjsonを直接クリアするなどして、開発する。

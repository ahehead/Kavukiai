## プロセス間通信を実装する
- [ApiType.ts](../shared/ApiType.ts)にChannel名を登録する。
- [ipc](../main/ipc)フォルダに新しいipcを作成する
- [index.ts](../main/ipc/index.ts)に追加する
- [index.ts](index.ts)に追加する

```
//以下には型を書かない。（面倒なので）
declare global {
  interface Window {
    App: typeof API; // This will infer the types from the API object
  }
}
// 以下の関数に型を書く
App = {
  ...
}
```



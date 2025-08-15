/**
 * main 側の Launch から返る型（成功 or 失敗メッセージ）
 */
export type LaunchComfyDesktopResult =
  | { status: "success"; port: number }
  | { status: "error"; message: string };

/** ComfyUI Desktop 起動オプション */
export type LaunchOpts = {
  /** ユーザーが選んだ .exe / .app の絶対パス。未指定なら既定場所を探索 */
  appPath?: string;
  /** 期待するサーバーポート（Desktop の既定は 8000） */
  port?: number;
  /**
   * ヘルスチェックのタイムアウト(ms)。
   * ComfyUI Desktop の起動確認で待つ最大時間。
   * 例: 120_000 (2分)
   * 既定: 90_000 (90秒)
   */
  timeoutMs?: number;
  /** 既に同ポートで起動済みなら spawn せず成功扱いにする (renderer ノード追加用) */
  autoDetect?: boolean;
};

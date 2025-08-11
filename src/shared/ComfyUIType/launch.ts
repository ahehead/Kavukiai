/**
 * main 側の Launch から返る型（成功 or 失敗メッセージ）
 */
export type LaunchComfyDesktopResult =
  | { status: "success"; port: number }
  | { status: "error"; message: string };

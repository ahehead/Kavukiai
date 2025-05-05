import { BrowserWindow, type WebContents } from "electron";

/**
 * WebContents から BrowserWindow を取得。なければ例外を投げる
 */
export function getWindow(sender: WebContents): BrowserWindow {
  const win = BrowserWindow.fromWebContents(sender);
  if (!win) {
    throw new Error("No window found for dialog");
  }
  return win;
}

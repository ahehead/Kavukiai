import os from "node:os";
import path from "node:path";
import type { Conf } from "electron-conf/main";
import type { ApplicationSettings } from "main/types";

export function setLastDir(conf: Conf<ApplicationSettings>, dir: string): void {
  conf.set("systemSettings.lastDir", dir);
}

/**
 * 設定から lastDir を取得し、null ならユーザーのホームディレクトリを返す
 */
export function getLastDir(conf: Conf<ApplicationSettings>): string {
  const lastDir = conf.get("systemSettings.lastDir") as string | null;
  return lastDir ?? os.homedir();
}

/**
 * 保存ダイアログ用の既定パスを組み立てる
 */
export function getDefaultSavePath(
  conf: Conf<ApplicationSettings>,
  title: string
): string {
  return path.join(getLastDir(conf), `${title}.json`);
}

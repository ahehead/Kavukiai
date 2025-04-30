import type { File as AppFile } from "shared/AppType";

/** 閉じたファイルID から、新しいアクティブなファイルID を決定 */
export function getNewActiveFileId(
  files: AppFile[],
  closedId: string,
  currentActiveId: string | null
): string | null {
  const idx = files.findIndex((f) => f.id === closedId);
  const newFiles = files.filter((f) => f.id !== closedId);
  // 閉じたファイル以外がアクティブならそのまま返す
  if (currentActiveId !== closedId) {
    return currentActiveId;
  }
  // ファイルがなくなったら null
  if (newFiles.length === 0) {
    return null;
  }
  // 左隣を選択
  const leftIdx = idx - 1 < 0 ? 0 : idx - 1;
  return newFiles[leftIdx].id;
}

import { useCallback } from "react";
import { importWorkflowFromPng } from "renderer/features/png/importPng";
import { notify } from "renderer/features/toast-notice/notify";
import { createFile } from "shared/AppType";
import type { DropInfo } from "./useDragDrop";

interface Deps {
  dropInfo: DropInfo | null;
  setDropInfo: (info: DropInfo | null) => void;
  setImportDialogOpen: (open: boolean) => void;
  addFile: (file: any) => void;
  pasteWorkflowAtPosition: (
    workflow: any,
    pointer: { x: number; y: number }
  ) => Promise<void>;
  setCurrentFileState: () => void;
}

export function usePngImportWorkflow({
  dropInfo,
  setDropInfo,
  setImportDialogOpen,
  addFile,
  pasteWorkflowAtPosition,
  setCurrentFileState,
}: Deps) {
  // 単体PNGからワークフロー部分を抽出
  const runImportFromPng = useCallback(async () => {
    if (!dropInfo) return null;
    return await importWorkflowFromPng(dropInfo.filePath);
  }, [dropInfo]);

  // 新規ファイルとして読み込み
  const handleImportAsNew = useCallback(async () => {
    setCurrentFileState();
    const data = await runImportFromPng();
    if (!data) return;
    const { fileName, workflow } = data;
    addFile(await createFile(fileName, workflow));
    setImportDialogOpen(false);
    setDropInfo(null);
    notify("success", `新規ファイルを作成しました: ${fileName}`);
  }, [
    addFile,
    runImportFromPng,
    setCurrentFileState,
    setImportDialogOpen,
    setDropInfo,
  ]);

  // 現在のエディタへ挿入
  const handleImportToCurrent = useCallback(async () => {
    const data = await runImportFromPng();
    if (!data || !dropInfo) return;
    const { workflow } = data;
    await pasteWorkflowAtPosition(workflow, dropInfo.pointer);
    setImportDialogOpen(false);
    setDropInfo(null);
    notify("success", "ワークフローを現在のエディタに貼り付けました");
  }, [
    dropInfo,
    pasteWorkflowAtPosition,
    runImportFromPng,
    setImportDialogOpen,
    setDropInfo,
  ]);

  return {
    runImportFromPng,
    handleImportAsNew,
    handleImportToCurrent,
  };
}

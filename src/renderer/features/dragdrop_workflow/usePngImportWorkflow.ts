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
  const closeDialog = useCallback(() => {
    setImportDialogOpen(false);
    setDropInfo(null);
  }, [setDropInfo, setImportDialogOpen]);

  // PNG or JSON からワークフロー部分を抽出 (従来PNGのみだった処理を拡張)
  const runImportFromPngAndJSON = useCallback(async () => {
    if (!dropInfo) return null;
    if (dropInfo.type === "png") {
      if (!dropInfo.filePath) return null;
      return await importWorkflowFromPng(dropInfo.filePath);
    }
    // JSON の場合は既に dropInfo に workflow オブジェクトがある前提
    if (dropInfo.type === "json") {
      if (!dropInfo.jsonWorkflow) return null;
      const fileName = `${dropInfo.fileName || "imported"}.json`;
      return { fileName, workflow: dropInfo.jsonWorkflow };
    }
    return null;
  }, [dropInfo]);

  // 新規ファイルとして読み込み
  const handleImportAsNew = useCallback(async () => {
    setCurrentFileState();
    const data = await runImportFromPngAndJSON();
    if (!data) return;
    addFile(await createFile(data.fileName, data.workflow));
    closeDialog();
    notify("success", `新規ファイルを作成しました: ${data.fileName}`);
  }, [
    addFile,
    runImportFromPngAndJSON,
    setCurrentFileState,
    setImportDialogOpen,
    setDropInfo,
  ]);

  // 現在のエディタへ挿入
  const handleImportToCurrent = useCallback(async () => {
    const data = await runImportFromPngAndJSON();
    if (!data || !dropInfo) return;
    await pasteWorkflowAtPosition(data.workflow, dropInfo.pointer);
    closeDialog();
    notify("success", "ワークフローを現在のエディタに貼り付けました");
  }, [
    dropInfo,
    pasteWorkflowAtPosition,
    runImportFromPngAndJSON,
    setImportDialogOpen,
    setDropInfo,
  ]);

  return {
    runImportFromPng: runImportFromPngAndJSON,
    handleImportAsNew,
    handleImportToCurrent,
  };
}

import { useCallback, useState } from "react";
import { getTemplateById } from "renderer/features/templatesSidebar/data/templates";
import { notify } from "renderer/features/toast-notice/notify";
import { importWorkflowFromPngUrl } from "../png/importPng";
import { electronApiService } from "../services/appService";

export interface DropInfo {
  filePath: string;
  pointer: { x: number; y: number };
}

export function useDragDrop(
  pasteWorkflowAtPosition: (
    workflow: any,
    pointer: { x: number; y: number }
  ) => Promise<void>
) {
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [dropInfo, setDropInfo] = useState<DropInfo | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pointer = { x: e.clientX, y: e.clientY };

    // 1) Custom MIME from template sidebar
    const custom = e.dataTransfer.getData("application/x-workflow-template");
    if (custom) {
      try {
        const { id } = JSON.parse(custom) as { id: string };
        const t = getTemplateById(id);
        if (!t) return;
        if (t.type !== "PNGWorkflow") {
          notify("error", "このテンプレートタイプはまだドロップに未対応です");
          return;
        }
        // Fetch → temp 保存 → インポート を共通関数で実行
        const data = await importWorkflowFromPngUrl(
          t.src,
          `${t.title || t.id}.png`
        );
        if (!data) return;
        await pasteWorkflowAtPosition(data.workflow, pointer);
        setDropInfo(null);
        notify("success", "ワークフローを現在のエディタに貼り付けました");
        return;
      } catch {
        // fallthrough to file-based handling
      }
    }

    // 2) Native file drop
    const item = e.dataTransfer.files?.[0];
    if (!item) return;
    const isPng = item.type === "image/png" || /\.png$/i.test(item.name);

    if (!isPng) {
      notify("error", "PNG画像をドロップしてください");
      return;
    }
    let filePath = electronApiService.getPathForFile(item) || "";
    if (!filePath) {
      filePath = await electronApiService.ensurePathForFile(item);
    }
    if (!filePath.toLowerCase().endsWith(".png")) {
      notify("error", "PNG画像をドロップしてください");
      return;
    }

    setDropInfo({ filePath, pointer });
    setImportDialogOpen(true);
  }, []);

  return {
    importDialogOpen,
    setImportDialogOpen,
    dropInfo,
    setDropInfo,
    handleDragOver,
    handleDrop,
  };
}

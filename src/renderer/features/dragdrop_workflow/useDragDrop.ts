import { useCallback, useState } from "react";
import { getTemplateById } from "renderer/features/templatesSidebar/data/templates";
import { notify } from "renderer/features/toast-notice/notify";
import { type GraphJsonData, parseGraphJson } from "shared/JsonType";
import { importWorkflowFromPngUrl } from "../png/importPng";
import { electronApiService } from "../services/appService";

// DropInfo は PNG と JSON のどちらのワークフローインポートにも対応
export interface DropInfo {
  type: "png" | "json";
  pointer: { x: number; y: number };
  // PNG 専用: 一時保存されたファイルパス
  filePath?: string;
  // JSON 専用: 直接パースされた workflow オブジェクト
  jsonWorkflow?: GraphJsonData;
  // 新規ファイル作成用のベース名 (拡張子除外)
  fileName?: string;
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

  // テンプレート(DnD)処理
  const processTemplateDrop = useCallback(
    async (customJson: string, pointer: { x: number; y: number }) => {
      try {
        const { id } = JSON.parse(customJson) as { id: string };
        const t = getTemplateById(id);
        if (!t) return true; // 処理済み (何もせず終了)
        if (t.type !== "PNGWorkflow") {
          notify("error", "このテンプレートタイプはまだドロップに未対応です");
          return true; // 分岐としては処理完了
        }
        const data = await importWorkflowFromPngUrl(
          t.src,
          `${t.title || t.id}.png`
        );
        if (!data) return true;
        await pasteWorkflowAtPosition(data.workflow, pointer);
        setDropInfo(null);
        notify("success", "ワークフローを現在のエディタに貼り付けました");
        return true; // handled
      } catch {
        // JSON.parse失敗など: 他処理へフォールスルー
        return false;
      }
    },
    [pasteWorkflowAtPosition]
  );

  // JSONファイル(DnD)処理
  const processJsonFileDrop = useCallback(
    async (file: File, pointer: { x: number; y: number }) => {
      const lower = file.name.toLowerCase();
      if (!lower.endsWith(".json")) return false;
      try {
        const text = await file.text();
        const workflow = JSON.parse(text);
        if (!workflow) {
          notify("error", "JSON内にworkflowが見つかりません");
          return true; // 処理済み (エラー)
        }
        const result = parseGraphJson(workflow);
        const baseName = file.name.replace(/\.json$/i, "");
        setDropInfo({
          type: "json",
          pointer,
          jsonWorkflow: result,
          fileName: baseName,
        });
        setImportDialogOpen(true);
        return true;
      } catch (e) {
        const message =
          typeof e === "object" && e !== null && "message" in e
            ? (e as { message: string }).message
            : String(e);
        notify("error", `JSONの解析に失敗しました: ${message}`);
        return true;
      }
    },
    []
  );

  // PNGファイル(DnD)処理
  const processPngFileDrop = useCallback(
    async (file: File, pointer: { x: number; y: number }) => {
      const isPng = file.type === "image/png" || /\.png$/i.test(file.name);
      if (!isPng) return false;
      let filePath = electronApiService.getPathForFile(file) || "";
      if (!filePath) {
        filePath = await electronApiService.ensurePathForFile(file);
      }
      if (!filePath.toLowerCase().endsWith(".png")) {
        notify("error", "PNG画像をドロップしてください");
        return true; // エラーだが処理済み
      }
      const baseName = file.name.replace(/\.png$/i, "");
      setDropInfo({ type: "png", filePath, pointer, fileName: baseName });
      setImportDialogOpen(true);
      return true;
    },
    []
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const pointer = { x: e.clientX, y: e.clientY };

      // 1) カスタム MIME (テンプレート)
      const custom = e.dataTransfer.getData("application/x-workflow-template");
      if (custom) {
        const handled = await processTemplateDrop(custom, pointer);
        if (handled) return;
      }

      // 2) ネイティブファイル
      const file = e.dataTransfer.files?.[0];
      if (!file) return;

      // JSON → PNG の順で判定 (両方 false ならエラー表示)
      if (await processJsonFileDrop(file, pointer)) return;
      if (await processPngFileDrop(file, pointer)) return;

      notify("error", "PNG または JSON ワークフローをドロップしてください");
    },
    [processTemplateDrop, processJsonFileDrop, processPngFileDrop]
  );

  return {
    importDialogOpen,
    setImportDialogOpen,
    dropInfo,
    setDropInfo,
    handleDragOver,
    handleDrop,
  };
}

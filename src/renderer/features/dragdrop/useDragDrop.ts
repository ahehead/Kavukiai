import { useCallback, useState } from "react";
import { notify } from "renderer/features/toast-notice/notify";
import { electronApiService } from "../services/appService";

export interface DropInfo {
  filePath: string;
  pointer: { x: number; y: number };
}

export function useDragDrop(ref?: React.RefObject<HTMLDivElement | null>) {
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [dropInfo, setDropInfo] = useState<DropInfo | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      let pointer = { x: e.clientX, y: e.clientY };
      // refが渡されていれば、エディタ領域の座標に変換
      if (ref?.current) {
        const rect = ref.current.getBoundingClientRect();
        pointer = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
      }
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
    },
    [ref]
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

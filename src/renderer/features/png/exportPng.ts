import type { RefObject } from "react";
import { electronApiService } from "renderer/features/services/appService";
import { notify } from "renderer/features/toast-notice/notify";
import type { File } from "shared/AppType";

export async function exportPngWithData(
  ref: RefObject<null>,
  activeFileId: string | null,
  getFileById: (id: string) => File | undefined
) {
  if (!ref.current || !activeFileId) return;
  try {
    const file = getFileById(activeFileId);
    if (!file) return;
    const rect = (ref.current as HTMLElement).getBoundingClientRect();
    const res = await electronApiService.exportPngWithData({
      initialFileName: file.title,
      graph: file.graph,
      rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
    });
    if (res.status === "error") {
      notify("error", `Failed to export PNG: ${res.message}`);
    } else if (res.status === "success") {
      notify("success", `Saved: ${res.data.filePath}`);
    }
  } catch (err) {
    notify("error", `Failed to save image: ${(err as any).message}`);
  }
}

import { electronApiService } from "renderer/features/services/appService";
import { notify } from "renderer/features/toast-notice/notify";

export async function importWorkflowFromPng(filePath: string) {
  const res = await electronApiService.importWorkflowFromPng(filePath);
  if (res.status === "error") {
    notify("error", `PNGの読み込みに失敗: ${res.message}`);
    return null;
  }
  if (res.status === "cancel") return null;
  return res.data;
}

/** Fetch a PNG from renderer-resolvable URL, write to temp, then import via main. */
export async function importWorkflowFromPngUrl(url: string, fileName?: string) {
  try {
    const resp = await fetch(url);
    const blob = await resp.blob();
    const safeName = (fileName || "template.png").replace(/[^\w.-]/g, "_");
    const file = new File([blob], safeName, { type: "image/png" });
    let filePath = electronApiService.getPathForFile(file) || "";
    if (!filePath) {
      filePath = await electronApiService.ensurePathForFile(file);
    }
    return await importWorkflowFromPng(filePath);
  } catch (e: any) {
    notify("error", `PNGの取得に失敗: ${e?.message ?? String(e)}`);
    return null;
  }
}

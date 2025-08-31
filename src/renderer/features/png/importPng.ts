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

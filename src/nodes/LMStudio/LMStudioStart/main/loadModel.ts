import { type IpcMainEvent, ipcMain } from "electron";
import { IpcChannel } from "shared/ApiType";
import type {
  LMStudioLoadRequestArgs,
  LMStudioPortEvent,
} from "shared/LMStudioType";
import { getLoadedModel } from "../../common/main/modelClient";

export function registerLMStudioLoadModelHandler(): void {
  ipcMain.on(IpcChannel.PortLMStudioLoadModel, handleLoadModel);
}

async function handleLoadModel(
  evt: IpcMainEvent,
  data: unknown
): Promise<void> {
  const { id, modelKey } = data as LMStudioLoadRequestArgs;
  const port = evt.ports[0];
  const controller = new AbortController();
  port.start();
  console.log("LMStudio load model:", id, modelKey);
  port.postMessage({ type: "start" } as LMStudioPortEvent);
  port.on("message", (e) => {
    if (e.data?.type === "abort") controller.abort();
  });
  try {
    await getLoadedModel(modelKey, {
      signal: controller.signal,
      onProgress: (p) => port.postMessage({ type: "progress", progress: p }),
    });
    port.postMessage({ type: "finish" } as LMStudioPortEvent);
  } catch (err: any) {
    port.postMessage({ type: "error", message: String(err?.message ?? err) });
  } finally {
    port.close();
  }
}

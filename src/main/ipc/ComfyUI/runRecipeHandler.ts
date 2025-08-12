import { CallWrapper } from "@saintno/comfyui-sdk";
import { type IpcMainEvent, ipcMain } from "electron";
import { IpcChannel } from "shared/ApiType";
import type { ComfyUIRunRequestArgs } from "shared/ComfyUIType";
import type { ComfyUIPortEvent } from "shared/ComfyUIType/port-events";
import { getComfyApiClient } from "./comfyApiClient";

export function registerComfyUIRunRecipeHandler(): void {
  ipcMain.on(IpcChannel.PortComfyUIRunRecipe, handleRunRecipe);
}

async function handleRunRecipe(
  evt: IpcMainEvent,
  data: unknown
): Promise<void> {
  const { id, recipe } = data as ComfyUIRunRequestArgs;
  const port = evt.ports[0];
  port.start();

  const send = (msg: ComfyUIPortEvent) => port.postMessage(msg);
  const api = await getComfyApiClient(recipe.endpoint);

  try {
    console.log("ComfyUI run recipe:", id);
    api.init();

    // Note: we assume recipe.workflow is a ready-to-run prompt graph compatible with CallWrapper
    const builder = recipe.workflow as any;
    const runner = await new CallWrapper(api, builder)
      .onPending((promptId?: string) => send({ type: "pending", promptId }))
      .onStart((promptId?: string) => send({ type: "start", promptId }))
      .onPreview(async (blob: Blob, promptId?: string) => {
        const ab = await blob.arrayBuffer();
        send({ type: "preview", data: ab, promptId });
      })
      .onOutput((key: string, data: unknown, promptId?: string) =>
        send({ type: "output", key, data, promptId })
      )
      .onProgress((info: any, promptId?: string) => {
        const progress = info?.max ? info.value / info.max : 0;
        send({
          type: "progress",
          progress,
          detail: String(info?.node ?? ""),
          promptId,
        });
      })
      .onFinished(async (data: any, promptId?: string) => {
        try {
          const images = data?.images?.images ?? [];
          if (images.length > 0) {
            const paths = images.map((img: any) => api.getPathImage(img));
            send({ type: "finish", result: { paths }, promptId });
          } else {
            send({ type: "finish", result: { paths: [] }, promptId });
          }
        } catch (e) {
          send({ type: "error", message: String(e), promptId });
        }
      })
      .onFailed((err: any) => {
        const message = err?.data?.exception_message ?? String(err);
        send({ type: "error", message });
      });

    port.on("message", (e) => {
      if (e.data?.type === "abort") {
        try {
          api.interrupt();
          api.freeMemory(true, true);
          api.destroy();
        } catch {
          /* ignore */
        }
      }
    });

    await runner.run();
  } catch (err: any) {
    send({ type: "error", message: String(err?.message ?? err) });
  } finally {
    api.freeMemory(true, true);
    api.destroy();
    port.close();
  }
}

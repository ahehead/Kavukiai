import { CallWrapper, PromptBuilder } from "@saintno/comfyui-sdk";
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
  const api = getComfyApiClient(recipe.endpoint, {
    forceWs: recipe.opts?.forceWs,
    wsTimeout: recipe.opts?.wsTimeout,
  });

  try {
    console.log("ComfyUI run recipe:", id);
    api.init();

    // Build PromptBuilder from PromptRecipe's inputs/outputs definition
    // - inputs: Record<name, { path, default? }>
    // - outputs: Record<name, { path }>
    const inputKeys = Object.keys(recipe.inputs ?? {});
    const outputKeys = Object.keys(recipe.outputs ?? {});

    const builder = new PromptBuilder(
      recipe.workflow as any,
      inputKeys,
      outputKeys
    );

    // Map variable names to graph paths
    for (const key of inputKeys) {
      const inp = recipe.inputs[key];
      if (!inp) continue;
      builder.setInputNode(key, inp.path);
    }
    for (const key of outputKeys) {
      const out = recipe.outputs[key];
      if (!out) continue;
      builder.setOutputNode(key, out.path);
    }

    // Apply defaults unless bypassed
    const bypass = new Set(recipe.bypass ?? []);
    for (const key of inputKeys) {
      if (bypass.has(key)) continue;
      const def = recipe.inputs[key]?.default;
      if (typeof def !== "undefined") {
        // Pass-through value as provided in recipe
        builder.input(key, def as unknown as any);
      }
    }
    const runner = new CallWrapper(api, builder)
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

    // Basic retry using recipe.opts.maxTries / delayTime
    const maxTries = Math.max(1, recipe.opts?.maxTries ?? 1);
    const delayTime = Math.max(0, recipe.opts?.delayTime ?? 0);
    let attempt = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        await runner.run();
        break;
      } catch (e) {
        attempt++;
        if (attempt >= maxTries) throw e;
        if (delayTime > 0) await new Promise((r) => setTimeout(r, delayTime));
      }
    }
  } catch (err: any) {
    send({ type: "error", message: String(err?.message ?? err) });
  } finally {
    api.freeMemory(true, true);
    api.destroy();
    port.close();
  }
}

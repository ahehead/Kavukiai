import { CallWrapper, PromptBuilder } from "@saintno/comfyui-sdk";
import { type IpcMainEvent, ipcMain } from "electron";
import { IpcChannel } from "shared/ApiType";
import type { ComfyUIRunRequestArgs } from "shared/ComfyUIType";
import type { ComfyUIPortEvent } from "shared/ComfyUIType/port-events";
import { getComfyApiClient, getWorkflow } from "./comfyApiClient";
import { launchComfyDesktop } from "./comfyDesktop";
import { ComfyTemplatesClient } from "./comfyTemplatesClient";

export function registerComfyUIRunRecipeHandler(): void {
  ipcMain.on(IpcChannel.PortComfyUIRunRecipe, handleRunRecipe);
}

async function handleRunRecipe(
  evt: IpcMainEvent,
  data: unknown
): Promise<void> {
  const { id, recipe } = data as ComfyUIRunRequestArgs;
  console.log("comfy recipe", id, recipe);
  const port = evt.ports[0];
  port.start();

  const send = (msg: ComfyUIPortEvent) => port.postMessage(msg);
  const api = getComfyApiClient(recipe.endpoint, {
    forceWs: recipe.opts?.forceWs,
    wsTimeout: recipe.opts?.wsTimeout,
  });

  try {
    await api.pollStatus();
  } catch (_error) {
    try {
      await launchComfyDesktop();
    } catch (error) {
      console.error("Failed to launch Comfy Desktop:", error);
      send({
        type: "error",
        message: `Failed to launch Comfy Desktop: ${String(error)}`,
      });
    }
  }

  try {
    console.log("ComfyUI run recipe:", id);
    api.init(recipe.opts?.maxTries, recipe.opts?.delayTime);

    const inputKeys = Object.keys(recipe.inputs ?? {});
    const outputKeys = Object.keys(recipe.outputs ?? {});

    // workflowRef から実体の workflow JSON を取得
    const workflowJson = await resolveWorkflowJson(
      recipe.endpoint,
      recipe.workflowRef
    );

    const builder = new PromptBuilder(
      workflowJson as any,
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
      const out = recipe.outputs?.[key];
      if (!out) continue;
      builder.setOutputNode(key, out.path);
    }

    // Apply defaults unless bypassed
    for (const key of inputKeys) {
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
        const buffers: ArrayBuffer[] = [];
        for (const key of outputKeys) {
          const out = (await Promise.all(
            data[key].images.map((img: any) => api.getImage(img))
          )) as Blob[];
          if (out) {
            buffers.push(
              ...(await Promise.all(out.map((blob) => blob.arrayBuffer())))
            );
          }
        }
        send({ type: "finish", result: { buffers }, promptId });
      })
      .onFailed(async (err: Error) => {
        send({ type: "error", message: err.message });
      });

    port.on("message", async (e) => {
      if (e.data?.type === "abort") {
        console.log("Aborting ComfyUI run");
        await api.interrupt();
      }
    });

    const _result = await runner.run();
  } catch (err: any) {
    console.log(err);
    send({ type: "error", message: String(err?.message ?? err) });
  } finally {
    port.close();
  }
}

/** workflowRef から実際の workflow JSON を取得する簡易解決関数 */
async function resolveWorkflowJson(
  endpoint: string,
  workflowRef: { source: "userData" | "template"; name: string }
): Promise<any> {
  if (workflowRef.source === "template") {
    const client = new ComfyTemplatesClient(endpoint);
    return client.getTemplate(workflowRef.name);
  }
  const api = getComfyApiClient(endpoint);
  return getWorkflow(api, workflowRef.name);
}

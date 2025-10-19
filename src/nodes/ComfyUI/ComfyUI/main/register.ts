import {
  CallWrapper,
  type ImageInfo,
  PromptBuilder,
} from "@saintno/comfyui-sdk";
import { type IpcMainEvent, ipcMain } from "electron";
import { IpcChannel } from "shared/ApiType";
import type { ComfyUIRunRequestArgs } from "shared/ComfyUIType";
import type { ComfyUIPortEvent } from "shared/ComfyUIType/port-events";
import { getComfyApiClient } from "../../common/main/comfyApiClient";
import { launchComfyDesktop } from "../../common/main/comfyDesktop";

type ComfyFinishData = Record<string, { images?: ImageInfo[] }>;

export const register = (): void => {
  ipcMain.on(IpcChannel.PortComfyUIRunRecipe, handleRunRecipe);
};

async function handleRunRecipe(
  evt: IpcMainEvent,
  data: unknown
): Promise<void> {
  const { id, recipe } = data as ComfyUIRunRequestArgs;
  console.log("comfy recipe", id, recipe);
  const port = evt.ports[0];
  port.start();
  const send = (msg: ComfyUIPortEvent) => {
    console.log(`[ComfyUI][send] type=${msg.type}`);
    port.postMessage(msg);
  };
  const api = getComfyApiClient(recipe.endpoint, {
    forceWs: recipe.opts?.forceWs,
    wsTimeout: recipe.opts?.wsTimeout ?? 5000,
  });
  // finish イベントで受け取った raw data / promptId を保持しておき、run() 後にまとめて result を送信するよう修正
  let finishedRawData: ComfyFinishData | null = null;
  let finishedPromptId: string | undefined;

  try {
    await api.pollStatus();
  } catch (_error) {
    try {
      // Comfy Desktop が起動していない場合は起動する
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
    await api
      .init(recipe.opts?.maxTries, recipe.opts?.delayTime)
      .waitForReady();
    console.log("[ComfyUI][run] ready.");
    await api.uploadWorkflow(recipe.workflow);
    const builder = new PromptBuilder(recipe.workflow);
    builder.applyInputs(recipe.inputs ?? {});
    const outputKeys =
      Array.isArray(recipe.outputKeys) && recipe.outputKeys.length
        ? recipe.outputKeys
        : (recipe.workflow as any)?.workflow?.output?.order ?? [];
    console.log("[ComfyUI][run] output keys", outputKeys);
    builder.registerOutputs(outputKeys);
    const prompt = builder.createPrompt(recipe.opts?.operation);
    const runner = await new CallWrapper(api)
      .prepare(prompt, recipe.opts?.workflow)
      .setProgressInterval(recipe.opts?.progressInterval ?? 3000)
      .onQueued((promptId) => {
        console.log("[ComfyUI][run] queued", promptId);
        send({ type: "queued", promptId });
      })
      .onRunning((info, promptId) => {
        const frac = logProgress(info, promptId);
        send({
          type: "progress",
          progress: frac,
          promptId,
        });
      })
      .onPending((info, promptId) => {
        const frac = logProgress(info, promptId);
        send({
          type: "progress",
          progress: frac,
          promptId,
        });
      })
      .onFinished((data: ComfyFinishData, promptId?: string) => {
        // 最後に finish 通知とデータの保持のみ行い、後続で画像取得→result をまとめて返す
        send({ type: "finish", promptId });
        try {
          finishedRawData = data;
          finishedPromptId = promptId;
          const keys = Object.keys(data || {});
          console.log("[ComfyUI][finished] stored keys", { promptId, keys });
        } catch (e) {
          console.log("[ComfyUI][finished][store-error]", e);
          send({ type: "error", message: String((e as any)?.message ?? e) });
        }
      })
      .onFailed((err: any) => {
        // 失敗時は詳細な error を送信
        console.log("ComfyUI run failed:", err);
        try {
          const cache = new Set<any>();
          const json = JSON.stringify(
            err,
            (_k, v) => {
              if (typeof v === "object" && v !== null) {
                if (cache.has(v)) return "[Circular]";
                cache.add(v);
              }
              return v;
            },
            2
          );
          console.log("[ComfyUI][failed] serialized", json);
        } catch (e) {
          console.log("[ComfyUI][failed] serialization error", e);
        }
        const message = extractComfyErrorMessage(err);
        send({ type: "error", message });
        api.interrupt();
      });

    port.on("message", async (e) => {
      if (e.data?.type === "abort") {
        console.log("Aborting ComfyUI run");
        await api.interrupt();
        await api.freeMemory(false, true);
        send({ type: "error", message: "Aborted by user" });
      }
    });

    console.log("[ComfyUI][run] starting", { nodeId: id });
    const runResult = await runner.run();
    console.log("[ComfyUI][run] completed", {
      nodeId: id,
      hasRunResult: runResult !== undefined && runResult !== false,
    });

    console.log(runResult);

    // run() の戻り値を利用 & onFinished で保持したデータから result を送信
    if (runResult !== false && runResult !== undefined) {
      try {
        const raw: ComfyFinishData | null =
          finishedRawData ??
          (typeof runResult === "object" && runResult
            ? (runResult as any)
            : null);
        if (raw) {
          console.log("[ComfyUI][run] building result from raw data", { raw });
          const buffers = await collectOutputBuffers(raw, outputKeys, api);
          send({
            type: "result",
            result: { buffers },
            promptId: finishedPromptId,
          });
        } else {
          console.log(
            "[ComfyUI][run] no raw finish data available to build result"
          );
        }
      } catch (e) {
        console.log("[ComfyUI][run][result-build-error]", e);
        send({ type: "error", message: String((e as any)?.message ?? e) });
      }
    } else {
      console.log(
        "[ComfyUI][run] runResult indicates failure or absence (false/undefined)"
      );
    }
  } catch (err: any) {
    console.log("[ComfyUI][run] caught error before finish", err);
    send({ type: "error", message: String(err?.message ?? err) });
  } finally {
    console.log("[ComfyUI][run] finally closing port", {
      nodeId: id,
    });
    port.close();
  }
}

async function collectOutputBuffers(
  data: ComfyFinishData,
  outputKeys: string[],
  api: ReturnType<typeof getComfyApiClient>
): Promise<ArrayBuffer[]> {
  const buffers: ArrayBuffer[] = [];
  for (const key of outputKeys) {
    const nodeOut = data[key];
    if (!nodeOut) {
      console.log("[ComfyUI][finished] missing output key", key);
      continue;
    }
    const imageRefs = nodeOut.images;
    if (!Array.isArray(imageRefs) || imageRefs.length === 0) {
      console.log("[ComfyUI][finished] no images for key", key);
      continue;
    }
    try {
      console.log("[ComfyUI][finished] fetching images", {
        key,
        count: imageRefs.length,
      });
      const blobs: Blob[] = [];
      for (const ref of imageRefs) {
        if (!ref || !ref.filename) {
          console.log("[ComfyUI][finished][skip-ref] missing filename", ref);
          continue;
        }
        try {
          const blob = (await api.getImage(ref)) as Blob;
          blobs.push(blob);
        } catch (e) {
          console.log("[ComfyUI][finished][getImage-failed]", {
            key,
            ref,
            error: e,
          });
        }
      }
      if (blobs.length) {
        const arrBufs = await Promise.all(blobs.map((b) => b.arrayBuffer()));
        buffers.push(...arrBufs);
      }
    } catch (e) {
      console.log("[ComfyUI][finished][images-process-failed]", {
        key,
        error: e,
      });
    }
  }
  console.log("[ComfyUI][finished] total buffers", buffers.length);
  return buffers;
}

function logProgress(info: any, promptId?: string): number {
  const value: number = typeof info?.value === "number" ? info.value : 0;
  const max: number = typeof info?.max === "number" ? info.max : 0;
  const node = info?.node ?? "";
  const frac = max > 0 ? value / max : 0;
  const pct = max > 0 ? (frac * 100).toFixed(1) : "";
  console.log(
    `[ComfyUI][progress] ${value}/${max}${
      pct ? ` (${pct}%)` : ""
    } node=${node} prompt=${promptId ?? "-"}`
  );
  return frac;
}

function extractComfyErrorMessage(err: unknown): string {
  const e: any = err as any;
  const causeError = e?.cause?.error;
  const nestedMessage: string | undefined = causeError?.message;
  const nestedDetails: string | undefined = causeError?.details;
  if (nestedMessage) {
    return nestedDetails && nestedDetails !== nestedMessage
      ? `${nestedMessage} (${nestedDetails})`
      : nestedMessage;
  }
  if (typeof e?.message === "string") return e.message;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

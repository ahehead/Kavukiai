import {
  CallWrapper,
  type ImageInfo,
  PromptBuilder,
} from "@saintno/comfyui-sdk";
import { type IpcMainEvent, ipcMain } from "electron";
import { IpcChannel } from "shared/ApiType";
import type { ComfyUIRunRequestArgs } from "shared/ComfyUIType";
import type { ComfyUIPortEvent } from "shared/ComfyUIType/port-events";
import { getComfyApiClient } from "./comfyApiClient";
import { launchComfyDesktop } from "./comfyDesktop";

// ==== Helper-level shared types (推定構造) ====

type ComfyFinishData = Record<string, { images?: ImageInfo[] }>;

// ==== Helper functions ====
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
  const send = (msg: ComfyUIPortEvent) => {
    console.log(`[ComfyUI][send] type=${msg.type}`);
    port.postMessage(msg);
  };
  const api = getComfyApiClient(recipe.endpoint, {
    forceWs: recipe.opts?.forceWs,
    wsTimeout: recipe.opts?.wsTimeout,
  });
  // finish イベントで受け取った raw data / promptId を保持し、run() 完了後にまとめて result を送信する方式へ変更
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
    api.init(recipe.opts?.maxTries, recipe.opts?.delayTime);

    const inputKeys = Object.keys(recipe.inputs ?? {});
    const outputKeys = Object.keys(recipe.outputs ?? {});

    // renderer から直接渡された workflow オブジェクトを使用
    const workflowJson = recipe.workflow;

    const builder = new PromptBuilder(
      workflowJson as any,
      inputKeys,
      outputKeys
    );

    // Map variable names to graph paths
    if (recipe.inputs) {
      for (const key of inputKeys) {
        const inp = recipe.inputs[key];
        if (!inp) continue;
        builder.setInputNode(key, inp.path);
      }
    }
    if (recipe.outputs) {
      for (const key of outputKeys) {
        const out = recipe.outputs?.[key];
        if (!out) continue;
        builder.setOutputNode(key, out.path);
      }
    }

    // Apply defaults unless bypassed
    if (recipe.inputs) {
      for (const key of inputKeys) {
        const def = recipe.inputs[key]?.default;
        if (typeof def !== "undefined") {
          // Pass-through value as provided in recipe
          builder.input(key, def as unknown as any);
        }
      }
    }
    console.log("ComfyUI run recipe:", builder);

    const runner = new CallWrapper(api, builder)
      // ここから各イベント毎に受け取る引数を調査するためのログを追加
      .onPending((promptId?: string) => {
        console.log("[ComfyUI][pending]", { promptId });
        send({ type: "pending", promptId });
      })
      .onStart((promptId?: string) => {
        console.log("[ComfyUI][start]", { promptId });
        send({ type: "start", promptId });
      })
      .onPreview(async (blob: Blob, promptId?: string) => {
        try {
          // Blob の size / type だけでも把握できると便利
          console.log("[ComfyUI][preview]", {
            promptId,
            blob: { size: blob.size, type: blob.type },
          });
        } catch (e) {
          console.log("[ComfyUI][preview][log-failed]", e);
        }
        const ab = await blob.arrayBuffer();
        send({ type: "preview", data: ab, promptId });
      })
      .onOutput((key: string, data: unknown, promptId?: string) => {
        console.log("[ComfyUI][output]", { key, data, promptId });
        send({ type: "output", key, data, promptId });
      })
      .onProgress((info: any, promptId?: string) => {
        const progress = logProgress(info, promptId);
        send({
          type: "progress",
          progress,
          detail: String(info?.node ?? ""),
          promptId,
        });
      })
      .onFinished((data: ComfyFinishData, promptId?: string) => {
        // ここでは finish 通知とデータの保持のみ行い、重い画像取得は runner.run() 完了後に一括処理する
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
        // 失敗時は即座に error を送信
        // err.cause?.error?.message に Comfy 側詳細がある可能性
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
      });

    port.on("message", async (e) => {
      if (e.data?.type === "abort") {
        console.log("Aborting ComfyUI run");
        await api.interrupt();
      }
    });

    console.log("[ComfyUI][run] starting", { nodeId: id });
    const runResult = await runner.run();
    console.log("[ComfyUI][run] completed", {
      nodeId: id,
      hasRunResult: runResult !== undefined && runResult !== false,
    });

    console.log(runResult);

    // run() の返却値利用 & onFinished で保持したデータを基に result を送信
    if (runResult !== false && runResult !== undefined) {
      try {
        // onFinished で保持したデータが優先。なければ runResult を ComfyFinishData 互換とみなして処理 (ベストエフォート)
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
    try {
      port.close();
    } catch (e) {
      console.log("[ComfyUI][run] port.close error", e);
    }
  }
}

/**
 * ComfyUI のエラーオブジェクトから人間向けの message を抽出するヘルパー。
 * 例:
 * Error: Failed to queue prompt
 *   cause: { error: { type: 'invalid_prompt', message: 'Cannot execute ...', details: 'Node ID ...' }}
 */
function extractComfyErrorMessage(err: unknown): string {
  // 型ガード的に any へ
  const e: any = err as any;
  const causeError = e?.cause?.error;
  const nestedMessage: string | undefined = causeError?.message;
  const nestedDetails: string | undefined = causeError?.details;
  // ネストされた詳細メッセージがあればそれを優先し、details があれば括弧付きで追加
  if (nestedMessage) {
    return nestedDetails && nestedDetails !== nestedMessage
      ? `${nestedMessage} (${nestedDetails})`
      : nestedMessage;
  }
  // Fallback: 通常のエラーメッセージ
  if (typeof e?.message === "string") return e.message;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

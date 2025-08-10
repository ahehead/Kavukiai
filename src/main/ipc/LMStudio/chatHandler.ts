import { Chat } from "@lmstudio/sdk";
import { type IpcMainEvent, ipcMain } from "electron";
import { IpcChannel } from "shared/ApiType";
import type {
  LMStudioChatPortEvent,
  LMStudioChatRequestArgs,
} from "shared/LMStudioType";
import { findLoadedModel, getLMStudioClient } from "./modelClient";

/**
 * Registers the IPC handler for LMStudio chat requests.
 */
export function registerLMStudioChatHandler(): void {
  ipcMain.on(IpcChannel.LMStudioChatRequest, handleChat);
}

async function handleChat(evt: IpcMainEvent, data: unknown): Promise<void> {
  const { id, modelKey, chatHistoryData, config } =
    data as LMStudioChatRequestArgs;
  const port = evt.ports[0];
  const controller = new AbortController();
  port.start();
  console.log("LMStudio chat:", id, modelKey);

  // Listen for abort messages
  port.on("message", (e) => {
    if (e.data?.type === "abort") controller.abort();
  });

  try {
    const client = await getLMStudioClient();
    let model = modelKey
      ? await findLoadedModel(modelKey)
      : await client.llm.model();
    if (!modelKey && !model) {
      throw new Error("No modelNameKey and no default model loaded");
    }
    if (!model && modelKey) {
      console.log(`Model ${modelKey} not loaded. Loading...`);
      model = await client.llm.load(modelKey, {
        signal: controller.signal,
      });
      console.log(`Model loaded: ${model.modelKey}`);
    }
    if (!model) {
      throw new Error("Model not found or could not be loaded");
    }

    const chat = Chat.from(chatHistoryData);

    // Stream response events
    const prediction = model.respond(chat, {
      ...config,
      signal: controller.signal,
    });
    // Start Streaming
    port.postMessage({ type: "start" } as LMStudioChatPortEvent);
    for await (const { content } of prediction) {
      port.postMessage({
        type: "stream",
        delta: content,
      } as LMStudioChatPortEvent);
    }

    // Final prediction result
    const sdkResult = await prediction;
    // とりあえず、必要な分だけ
    // Map SDK prediction to LMStudioChatPortEvent result shape
    const { content, reasoningContent, stats, modelInfo } = sdkResult;
    const portResult = { content, reasoningContent, status: stats, modelInfo };
    port.postMessage({
      type: "finish",
      result: portResult,
    } as LMStudioChatPortEvent);
  } catch (error: any) {
    console.error("LMStudio chat error:", error);
    port.postMessage({
      type: "error",
      message: error.message ?? String(error),
    } as LMStudioChatPortEvent);
  } finally {
    port.close();
  }
}

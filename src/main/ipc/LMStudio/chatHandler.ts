import { Chat } from "@lmstudio/sdk";
import { type IpcMainEvent, ipcMain } from "electron";
import {
  IpcChannel,
  type LMStudioChatPortEvent,
  type LMStudioChatRequestArgs,
} from "shared/ApiType";
import { findLoadedModel, getLMStudioClient } from "./modelClient";

/**
 * Registers the IPC handler for LMStudio chat requests.
 */
export function registerLMStudioChatHandler(): void {
  ipcMain.on(IpcChannel.LMStudioChatRequest, handleChat);
}

async function handleChat(evt: IpcMainEvent, data: unknown): Promise<void> {
  const { id, modelKey, chatHistoryData } = data as LMStudioChatRequestArgs;
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
    let model = await findLoadedModel(modelKey);
    if (!model) {
      console.log(`Model ${modelKey} not loaded. Loading...`);
      model = await client.llm.load(modelKey, { signal: controller.signal });
      console.log(`Model loaded: ${model.modelKey}`);
    }

    const chat = Chat.from(chatHistoryData);

    // Stream response events
    const prediction = model.respond(chat, { signal: controller.signal });
    for await (const { content } of prediction) {
      const event: LMStudioChatPortEvent = { type: "stream", delta: content };
      port.postMessage(event);
    }

    // Final prediction result
    const sdkResult = await prediction;
    // Map SDK prediction to LMStudioChatPortEvent result shape
    const { content, reasoningContent, stats, modelInfo } = sdkResult;
    const portResult = { content, reasoningContent, status: stats, modelInfo };
    const doneEvent: LMStudioChatPortEvent = {
      type: "done",
      result: portResult,
    };
    port.postMessage(doneEvent);
  } catch (error: any) {
    console.error("LMStudio chat error:", error);
    const message = error.message ?? String(error);
    const errorEvent: LMStudioChatPortEvent = { type: "error", message };
    port.postMessage(errorEvent);
  } finally {
    port.close();
  }
}

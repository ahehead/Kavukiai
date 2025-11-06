import type { ResponseStreamEvent } from "@nodes/OpenAI/common/schema/EventsSchemas";
import type { Response } from "@nodes/OpenAI/common/schema/ResponseSchemas";
import { type IpcMainEvent, ipcMain } from "electron";
import { ApiKeyConf, getApiKeyConf } from "main/features/file/conf";
import OpenAI from "openai";
import {
  IpcChannel,
  type OpenAIPortEventType,
  type OpenAIRequestArgs,
} from "shared/ApiType";

export const register = (): void => {
  ipcMain.on(IpcChannel.PortChatGpt, handlePortChatGpt);
};

async function handlePortChatGpt(
  evt: IpcMainEvent,
  data: unknown
): Promise<void> {
  const { id, param } = data as OpenAIRequestArgs;
  const port = evt.ports[0];
  const abortController = setupAbortController(port);
  startPort(port, id, param);
  try {
    const client = createOpenAIClient();
    if (param.stream)
      await handleStreamingResponse(client, param, abortController, port);
    else await handleNonStreamingResponse(client, param, abortController, port);
  } catch (error: any) {
    postMessageToPort(port, { type: "error", message: error.message });
  } finally {
    port.close();
  }
}

function setupAbortController(port: Electron.MessagePortMain): AbortController {
  const controller = new AbortController();
  port.on("message", (e) => {
    if (e.data?.type === "abort") controller.abort();
  });
  return controller;
}

function startPort(
  port: Electron.MessagePortMain,
  id: string,
  param: OpenAIRequestArgs["param"]
): void {
  port.start();
  console.log("PortChatGPT start:", id, param);
}

function createOpenAIClient(): OpenAI {
  const apiKeysConfig = ApiKeyConf();
  return new OpenAI({ apiKey: getApiKeyConf(apiKeysConfig, "openai") });
}

async function handleNonStreamingResponse(
  client: OpenAI,
  param: OpenAIRequestArgs["param"],
  controller: AbortController,
  port: Electron.MessagePortMain
): Promise<void> {
  const response = (await client.responses.create(param, {
    signal: controller.signal,
  })) as Response;
  console.log("PortChatGPT response:", response);
  postMessageToPort(port, { type: "openai", data: response });
}

async function handleStreamingResponse(
  client: OpenAI,
  param: OpenAIRequestArgs["param"],
  controller: AbortController,
  port: Electron.MessagePortMain
): Promise<void> {
  const stream = (await client.responses.create(param, {
    signal: controller.signal,
  })) as AsyncIterable<ResponseStreamEvent>;
  for await (const event of stream) {
    postMessageToPort(port, { type: "openai", data: event });
  }
}

function postMessageToPort(
  port: Electron.MessagePortMain,
  msg: OpenAIPortEventType
): void {
  port.postMessage(msg);
  if (msg.type === "error") console.error("PortChatGPT Error:", msg.message);
}

import { type IpcMainEvent, ipcMain } from "electron";
import { ApiKeyConf, getApiKeyConf } from "main/features/file/conf";
import OpenAI from "openai";
import type { ResponseStreamEvent } from "renderer/nodeEditor/types/Schemas/openai/EventsSchemas";
import type { Response } from "renderer/nodeEditor/types/Schemas/openai/ResponseSchemas";
import {
  IpcChannel,
  type OpenAIRequestArgs,
  type PortEventType,
} from "shared/ApiType";

// openaiリクエストを処理するハンドラを登録
export function registerOpenAIHandlers(): void {
  ipcMain.on(IpcChannel.PortChatGpt, handlePortChatGpt);
}

/** * ポートを介してOpenAIリクエストを処理する関数
 * @param evt - IpcMainEvent イベントオブジェクト
 * @param data - OpenAIRequestArgs データ
 */
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

// ポートからのメッセージを監視し、abortイベントを処理
function setupAbortController(port: Electron.MessagePortMain): AbortController {
  const controller = new AbortController();
  port.on("message", (e) => {
    if (e.data?.type === "abort") controller.abort();
  });
  return controller;
}

// ポートを開始
function startPort(
  port: Electron.MessagePortMain,
  id: string,
  param: OpenAIRequestArgs["param"]
): void {
  port.start();
  console.log("PortChatGPT start:", id, param);
}

// OpenAIクライアントを作成
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
  // 非ストリーミングはResponse型として取得
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
  // 非同期イテレータとして型アサーション
  const stream = (await client.responses.create(param, {
    signal: controller.signal,
  })) as AsyncIterable<ResponseStreamEvent>;
  for await (const event of stream) {
    postMessageToPort(port, { type: "openai", data: event });
  }
}

function postMessageToPort(
  port: Electron.MessagePortMain,
  msg: PortEventType
): void {
  port.postMessage(msg);
  if (msg.type === "error") console.error("PortChatGPT Error:", msg.message);
}

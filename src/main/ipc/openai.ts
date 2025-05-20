import { ipcMain } from "electron";
import OpenAI from "openai";
import {
  IpcChannel,
  type OpenAIRequestArgs,
  type OpenAIParams,
  type PortEventType,
} from "shared/ApiType";
import { ApiKeyConf, getApiKeyConf } from "main/features/file/conf";

// openaiリクエストを処理するハンドラを登録
export function registerOpenAIHandlers(): void {
  // OpenAI APIキーをconfから取得してリクエストを処理
  ipcMain.handle(
    IpcChannel.OpenAIRequest,
    async (_evt, params: OpenAIParams) => {
      const apiKeysConf = ApiKeyConf();
      const openai = new OpenAI({
        apiKey: getApiKeyConf(apiKeysConf, "openai"),
      });
      const completion = await openai.chat.completions.create(params);
      return completion.choices[0]?.message?.content;
    }
  );

  // chatgptと通信する
  ipcMain.on(IpcChannel.PortChatGpt, async (evt, data) => {
    const { id, param } = data as OpenAIRequestArgs;
    const messagePort = evt.ports[0];

    // abort controllerを作成
    const abortController = new AbortController();
    messagePort.on("message", (e) => {
      if (e.data?.type === "abort") abortController.abort();
    });

    // port を開始
    messagePort.start();
    console.log("PortChatGPT start:", id, param);

    // chatgptと通信
    try {
      const apiKeysConfig = ApiKeyConf();

      const openaiClient = new OpenAI({
        apiKey: getApiKeyConf(apiKeysConfig, "openai"),
      });
      // 非ストリーム対応
      if (param.stream === false) {
        const response = await openaiClient.responses.create(param, {
          signal: abortController.signal,
        });
        postMessageToPort(messagePort, {
          type: "done",
          text: response.output_text,
        });
        messagePort.close();
      }

      // ストリーミング対応
      // 型チェックのため、明示的にtrueを指定
      if (param.stream === true) {
        const stream = await openaiClient.responses.create(param, {
          signal: abortController.signal,
        });

        for await (const event of stream) {
          if (event.type === "error") {
            postMessageToPort(messagePort, {
              type: "error",
              message: event.message,
            });
          }
          if (event.type === "response.output_text.delta") {
            postMessageToPort(messagePort, {
              type: "delta",
              value: event.delta,
            });
          }
          if (event.type === "response.output_text.done") {
            postMessageToPort(messagePort, { type: "done", text: event.text });
          }
        }
        messagePort.close();
      }
    } catch (error: any) {
      postMessageToPort(messagePort, { type: "error", message: error.message });
    } finally {
      messagePort.close();
    }
  });
}

function postMessageToPort(
  port: Electron.MessagePortMain,
  msg: PortEventType
): void {
  port.postMessage(msg);
  if (msg.type === "done") console.log("PortChatGPT Done", msg.text);
  if (msg.type === "error") console.error("PortChatGPT Error:", msg.message);
}

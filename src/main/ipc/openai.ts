import { ipcMain } from "electron";
import OpenAI from "openai";
import { IpcChannel, type StreamArgs, type OpenAIParams } from "shared/ApiType";
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

  // streamでchatgptを実行する
  ipcMain.on(IpcChannel.StreamChatGpt, async (evt, data) => {
    const { id, param } = data as StreamArgs;
    const port = evt.ports[0];

    // abort
    const ctrl = new AbortController();
    port.on("message", (e) => {
      if (e.data?.type === "abort") ctrl.abort();
    });

    port.start();

    console.log("start stream", id, param);
    // chatgptと通信
    try {
      const apiKeysConf = ApiKeyConf();

      const openai = new OpenAI({
        apiKey: getApiKeyConf(apiKeysConf, "openai"),
      });
      const stream = await openai.responses.create(param);
      for await (const event of stream) {
        if (event.type === "error") {
          port.postMessage({ type: "error", message: event.message });
          console.error("Error:", event.message);
        }
        if (event.type === "response.output_text.delta") {
          console.log("delta", event.delta);
          port.postMessage({ type: "delta", value: event.delta });
        }
        if (event.type === "response.output_text.done") {
          port.postMessage({ type: "done", text: event.text });
        }
      }
      port.close();
    } catch (error: any) {
      port.postMessage({ type: "error", message: error.message });
      console.error("Error:", error.message);
    } finally {
      port.close();
    }
  });
}

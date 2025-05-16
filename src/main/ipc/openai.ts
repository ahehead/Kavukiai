import { ipcMain, safeStorage } from "electron";
import OpenAI from "openai";
import { IpcChannel, type OpenAIParams } from "shared/ApiType";
import { ApiKeysConf } from "main/features/file/conf";

function getApiKey(): string {
  const apiKeysConf = ApiKeysConf();
  const encrypted = apiKeysConf.get("keys.openai") as Buffer | null;
  const apiKey = encrypted ? safeStorage.decryptString(encrypted) : null;
  if (!apiKey) throw new Error("APIキー未設定");
  return apiKey;
}

// openaiリクエストを処理するハンドラを登録
export function registerOpenAIHandlers(): void {
  // OpenAI APIキーをconfから取得してリクエストを処理
  ipcMain.handle(
    IpcChannel.OpenAIRequest,
    async (_evt, params: OpenAIParams) => {
      const openai = new OpenAI({ apiKey: getApiKey() });
      const completion = await openai.chat.completions.create(params);
      return completion.choices[0]?.message?.content;
    }
  );

  ipcMain.on(IpcChannel.StreamChatGpt, async (evt, data) => {
    const { id, params } = data as {
      id: string;
      params: OpenAI.Chat.ChatCompletionCreateParams;
    };
    const port = evt.ports[0];

    // abort
    const ctrl = new AbortController();
    port.on("message", (e) => {
      if (e.data?.type === "abort") ctrl.abort();
    });

    port.start();

    try {
      const openai = new OpenAI({ apiKey: getApiKey() });
      const stream = await openai.chat.completions.create(
        { ...params, stream: true },
        { signal: ctrl.signal }
      );
      for await (const chunk of stream) {
        console.log("chunk", chunk);
        port.postMessage({
          type: "delta",
          value: chunk.choices[0].delta?.content ?? "",
        });
      }
      port.postMessage({ type: "done" });
      port.close();
    } catch (error: any) {
      port.postMessage({ type: "error", message: error.message });
      console.error("Error:", error.message);
    } finally {
      port.close();
    }
  });
}

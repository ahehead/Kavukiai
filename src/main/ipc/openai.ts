import { ipcMain, safeStorage } from "electron";
import OpenAI from "openai";
import { Conf } from "electron-conf/main";
import { IpcChannel, type OpenAIParams } from "shared/ApiType";

const conf = new Conf();

// openaiリクエストを処理するハンドラを登録
export function registerOpenAIHandlers(): void {
  // OpenAI APIキーをconfから取得してリクエストを処理
  ipcMain.handle(
    IpcChannel.OpenAIRequest,
    async (_evt, params: OpenAIParams) => {
      const encrypted = conf.get("openai") as Buffer | null;
      const apiKey = encrypted ? safeStorage.decryptString(encrypted) : null;
      if (!apiKey) throw new Error("APIキー未設定");
      const openai = new OpenAI({ apiKey });
      const completion = await openai.chat.completions.create(params);
      return completion.choices[0]?.message?.content;
    }
  );
}

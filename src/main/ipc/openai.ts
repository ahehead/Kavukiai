import { ipcMain, safeStorage } from "electron";
import OpenAI from "openai";
import { Conf } from "electron-conf/main";

const conf = new Conf();

export function registerOpenAIHandlers(): void {
  ipcMain.handle("openai-request", async (_evt, params) => {
    const encrypted = conf.get("openai") as Buffer | null;
    const apiKey = encrypted ? safeStorage.decryptString(encrypted) : null;
    if (!apiKey) throw new Error("APIキー未設定");
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create(params);
    return completion.choices[0]?.message?.content;
  });
}

import { ipcRenderer } from "electron";
import type { ApiKeysFlags } from "shared/ApiKeysType";
import { IpcChannel, type IpcResult } from "shared/ApiType";

export const apiKeyApi = {
  // apiキーを保存
  saveApiKey: (
    service: keyof ApiKeysFlags,
    key: string
  ): Promise<IpcResult<ApiKeysFlags>> =>
    ipcRenderer.invoke(IpcChannel.SaveApiKey, service, key),

  // APIキーを読み込む
  loadApiKeys: (): Promise<IpcResult<ApiKeysFlags>> =>
    ipcRenderer.invoke(IpcChannel.LoadApiKeys),
};

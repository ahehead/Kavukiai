import { ComfyApi } from "@saintno/comfyui-sdk";

let comfyApiInstance: ComfyApi | null = null;

/**
 * ComfyApi クライアントのシングルトンインスタンスを取得
 * @param url ComfyUIサーバーのURL
 */
export async function getComfyApiClient(
  url: string,
  opts?: {
    forceWs?: boolean;
    wsTimeout?: number;
    listenTerminal?: boolean;
  }
): Promise<ComfyApi> {
  if (!comfyApiInstance) {
    comfyApiInstance = new ComfyApi(url, undefined, opts);
  }
  return comfyApiInstance;
}

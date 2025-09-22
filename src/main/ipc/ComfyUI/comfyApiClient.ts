import { ComfyApi } from "@saintno/comfyui-sdk";

let comfyApiInstance: ComfyApi | null = null;

/**
 * ComfyApi クライアントのシングルトンインスタンスを取得
 * @param url ComfyUIサーバーのURL
 */
export function getComfyApiClient(
  url: string,
  opts?: {
    forceWs?: boolean;
    wsTimeout?: number;
  }
): ComfyApi {
  if (!comfyApiInstance || comfyApiInstance.apiHost !== url) {
    comfyApiInstance = new ComfyApi(url, undefined, opts);
  }

  return comfyApiInstance;
}

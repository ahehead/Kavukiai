import { ComfyApi } from "@saintno/comfyui-sdk";
/**
 * ComfyApi クライアントを取得
 * @param url ComfyUIサーバーのURL
 */
export function getComfyApiClient(
  url: string,
  opts?: {
    forceWs?: boolean;
    wsTimeout?: number;
  }
): ComfyApi {
  return new ComfyApi(url, undefined, opts);
}

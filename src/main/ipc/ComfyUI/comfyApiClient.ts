import { ComfyApi } from "@saintno/comfyui-sdk";

const comfyApiClientCache = new Map<string, ComfyApi>();

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
  const cacheKey = JSON.stringify({ url, opts: opts ?? {} });
  const cachedClient = comfyApiClientCache.get(cacheKey);

  if (cachedClient) {
    return cachedClient;
  }

  const client = new ComfyApi(url, undefined, opts);
  comfyApiClientCache.set(cacheKey, client);
  return client;
}

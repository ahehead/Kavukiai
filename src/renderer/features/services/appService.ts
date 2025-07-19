// src/renderer/features/services/appService.ts
type ElectronApi = typeof window.App;

/** Node 環境で呼ばれたらテスト漏れを即発見できるダミー */
function createThrowingStub(): ElectronApi {
  const handler: ProxyHandler<object> = {
    get(_t, prop) {
      throw new Error(
        `electronApiService.${String(prop)}() は Electron 環境でのみ使用可`
      );
    },
  };
  return new Proxy({}, handler) as unknown as ElectronApi;
}

/** 本番では preload から注入、なければ安全なスタブを返す */
export const electronApiService: ElectronApi =
  typeof window !== "undefined" && (window as any).App
    ? ((window as any).App as ElectronApi)
    : createThrowingStub();

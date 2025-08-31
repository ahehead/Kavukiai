import { promises as fs } from "node:fs";
import path from "node:path";
import { dialog, ipcMain, type Rectangle } from "electron";
import { ApplicationSettingsConf } from "main/features/file/conf";
import { getLastDir, setLastDir } from "main/features/file/lastDirPath";
import { getWindow } from "main/features/window";
import { encodeSync } from "png-chunk-itxt";
import encode from "png-chunks-encode";
import extract from "png-chunks-extract";
import {
  type ExportPngArgs,
  IpcChannel,
  type IpcResultDialog,
} from "shared/ApiType";

export function registerExportPngHandler(): void {
  ipcMain.handle(
    IpcChannel.ExportPngWithData,
    async (
      event,
      args: ExportPngArgs
    ): Promise<IpcResultDialog<{ filePath: string }>> => {
      try {
        const win = getWindow(event.sender);
        const appConf = ApplicationSettingsConf();

        // 保存先ダイアログ表示
        const saveDialogResult = await showSavePngDialog(
          win,
          appConf,
          args.initialFileName
        );
        if (saveDialogResult.canceled || !saveDialogResult.filePath)
          return { status: "cancel" };

        // PNGバッファ生成（キャプチャ＋iTXt埋め込み）
        const outBuffer = await createPngBufferWithITXt(
          win,
          args.rect,
          args.graph
        );

        // ファイル保存とディレクトリ更新
        const ensurePngPath = await savePngFileAndUpdateDir(
          appConf,
          saveDialogResult.filePath,
          outBuffer
        );

        return { status: "success", data: { filePath: ensurePngPath } };
      } catch (error: any) {
        console.error("Export PNG failed:", error);
        return { status: "error", message: error.message };
      }
    }
  );

  /**
   * PNG保存ダイアログを表示し、保存先パスを返す
   */
  async function showSavePngDialog(
    win: Electron.BrowserWindow,
    appConf: any,
    initialFileName?: string
  ): Promise<{ canceled: boolean; filePath?: string }> {
    const lastDir = getLastDir(appConf);
    // lastDirが空の場合はホームディレクトリを使う
    const baseDir =
      lastDir && typeof lastDir === "string" && lastDir.length > 0
        ? lastDir
        : process.env.HOME || process.env.USERPROFILE || "";
    // ファイル名生成
    const fileName = initialFileName
      ? `${initialFileName}.png`
      : "untitled.png";
    const defaultPath = path.resolve(baseDir, fileName);
    // PNG保存ダイアログ
    return await dialog.showSaveDialog(win, {
      filters: [{ name: "PNG Image", extensions: ["png"] }],
      defaultPath,
      properties: ["showOverwriteConfirmation"],
    });
  }

  /**
   * ページキャプチャ＋iTXtチャンク埋め込みPNGバッファ生成
   */
  async function createPngBufferWithITXt(
    win: Electron.BrowserWindow,
    rect: Rectangle | undefined,
    graph: any
  ): Promise<Buffer> {
    // rectがあれば整数化
    const captureRect = rect
      ? {
          x: Math.floor(rect.x),
          y: Math.floor(rect.y),
          width: Math.ceil(rect.width),
          height: Math.ceil(rect.height),
        }
      : undefined;
    const image = await win.capturePage(captureRect);
    const pngBuffer = image.toPNG();
    const chunks = extract(pngBuffer);
    const iTxtChunk = {
      name: "iTXt",
      data: encodeSync({
        keyword: "Workflow",
        compressionFlag: false,
        compressionMethod: 0,
        languageTag: "",
        translatedKeyword: "",
        text: JSON.stringify(graph),
      }),
    };
    // 最初のIDAT前に挿入
    chunks.splice(
      chunks.findIndex((p) => p.name === "IDAT"),
      0,
      iTxtChunk
    );
    return Buffer.from(encode(chunks));
  }

  /**
   * PNGファイル保存とディレクトリ更新
   */
  async function savePngFileAndUpdateDir(
    appConf: any,
    filePath: string,
    outBuffer: Buffer
  ): Promise<string> {
    // 拡張子保証
    const ensurePngPath = filePath.endsWith(".png")
      ? filePath
      : `${filePath}.png`;
    await fs.writeFile(ensurePngPath, outBuffer);
    setLastDir(appConf, path.dirname(ensurePngPath));
    return ensurePngPath;
  }
}

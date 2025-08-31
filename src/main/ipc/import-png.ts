import { promises as fs } from "node:fs";
import path from "node:path";
import { ipcMain } from "electron";
import { decodeSync } from "png-chunk-itxt";
import extract from "png-chunks-extract";
import {
  type ImportPngResult,
  IpcChannel,
  type IpcResultDialog,
} from "shared/ApiType";

export function registerImportPngHandler(): void {
  ipcMain.handle(
    IpcChannel.ImportWorkflowFromPng,
    async (
      _event,
      filePath: string
    ): Promise<IpcResultDialog<ImportPngResult>> => {
      try {
        if (!filePath || !filePath.toLowerCase().endsWith(".png")) {
          return { status: "error", message: "PNG file path is required" };
        }
        const buffer = await fs.readFile(filePath);
        const chunks = extract(buffer);
        // Find iTXt chunk with keyword "Workflow"
        const iTXt = chunks.find((c) => c.name === "iTXt");
        if (!iTXt) {
          return {
            status: "error",
            message: "No embedded workflow found in PNG",
          };
        }
        const decoded = decodeSync(iTXt.data);
        if (!decoded || decoded.keyword !== "Workflow") {
          return {
            status: "error",
            message: "iTXt chunk does not contain Workflow data",
          };
        }
        const text = decoded.text?.toString?.() ?? decoded.text;
        const workflow = JSON.parse(text);
        const fileName = path.basename(filePath, path.extname(filePath));
        return { status: "success", data: { filePath, fileName, workflow } };
      } catch (e: any) {
        return { status: "error", message: e?.message ?? String(e) };
      }
    }
  );
}

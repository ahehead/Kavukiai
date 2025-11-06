import { type ChildProcess, spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import type { LaunchOpts } from "@nodes/ComfyUI/common/shared";

let child: ChildProcess | null = null;

export async function launchComfyDesktop(opts: LaunchOpts = {}) {
  const port = opts.port ?? 8000;
  const resolved = opts.appPath ?? (await findDesktopApp());
  if (!resolved) throw new Error("ComfyUI Desktop の場所が見つかりません");

  if (process.platform === "darwin") {
    // macOS: .app を open で起動（引数伝達は基本想定しない）
    child = spawn("open", ["-n", resolved], {
      detached: true,
      stdio: "ignore",
    });
  } else if (process.platform === "win32") {
    // Windows: .exe を直接起動
    child = spawn(resolved, [], { detached: true, stdio: "ignore" });
  } else {
    // Linux: 現状 Desktop 未対応（Portable/CLI 推奨）
    // ここに AppImage などの起動処理を入れるなら分岐
    throw new Error("Linux の ComfyUI Desktop は現状サポート外です");
  }
  // 子プロセスの終了を検知して参照を解放
  // 注意: macOS の "open" はすぐ終了するため、mac では stop 連携は元々非対応（退行ではない）
  const current = child;
  current.once("exit", () => {
    if (child === current) child = null;
  });
  child.unref();

  // ヘルスチェック（:8000 が応答するまで待機）
  await waitUntilReady(port, opts.timeoutMs ?? 90_000);
  return { port };
}

// --------- helpers ---------

async function waitUntilReady(port: number, timeoutMs = 90_000) {
  const start = Date.now();
  return new Promise<void>((resolve, reject) => {
    const tryOnce = () => {
      const req = http.get({ host: "127.0.0.1", port, path: "/" }, (res) => {
        res.resume();
        if ((res.statusCode ?? 500) < 500) resolve();
        else retry();
      });
      req.on("error", retry);
    };
    const retry = () => {
      if (Date.now() - start > timeoutMs)
        reject(new Error("ComfyUI Desktop の起動を確認できませんでした"));
      else setTimeout(tryOnce, 600);
    };
    tryOnce();
  });
}

async function findDesktopApp(): Promise<string | undefined> {
  if (process.platform === "win32") {
    // 公式README/フォーラム情報: NSIS で %LOCALAPPDATA%\\Programs 配下にインストール
    // 例: %LOCALAPPDATA%\\Programs\\comfyui-electron
    const base =
      process.env.LOCALAPPDATA ?? path.join(os.homedir(), "AppData", "Local");
    const candidates = [
      path.join(base, "Programs", "comfyui-electron"),
      path.join(base, "Programs", "@comfyorgcomfyui-electron"), // バリアントがある報告
    ];
    for (const dir of candidates) {
      if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
        const exes = fs
          .readdirSync(dir)
          .filter((f) => f.toLowerCase().endsWith(".exe"));
        // それっぽいものを優先
        const preferred =
          exes.find((f) => /comfyui|desktop/i.test(f)) ?? exes[0];
        if (preferred) return path.join(dir, preferred);
      }
      const exe = path.join(dir, "ComfyUI Desktop.exe");
      if (fs.existsSync(exe)) return exe;
    }
    return undefined;
  }
  if (process.platform === "darwin") {
    // /Applications にドラッグ&ドロップ
    const macCandidates = [
      "/Applications/ComfyUI.app",
      "/Applications/ComfyUI Desktop.app",
      path.join(os.homedir(), "Applications", "ComfyUI.app"),
    ];
    return macCandidates.find((p) => fs.existsSync(p));
  }
  return undefined;
}

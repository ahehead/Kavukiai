// =============================================
// Comfy Launcher — Unified Desktop & Python Starter
// Electron (main) + preload + renderer example
// ---------------------------------------------
// 目的:
//  - ユーザーが自分の環境に合わせて「Desktop 版」または
//    「Python の ComfyUI(main.py)」のどちらでも起動できるようにする
//  - ポート/パス等をユーザーが設定可能
//  - 既に起動済みのサーバがあれば検出して再起動しない
//  - 最小限の依存（外部 npm なし）
// =============================================

// ─────────────────────────────────────────────
// 1) main/comfy/ComfyManager.ts
// ─────────────────────────────────────────────

import { type ChildProcess, execFile, spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { app, dialog } from "electron";

export type LaunchMode = "desktop" | "python";

export interface ComfyConfig {
  mode: LaunchMode; // 'desktop' | 'python'
  port: number; // Desktop 既定: 8000 / Python 既定: 8188 推奨
  listen?: "127.0.0.1" | "0.0.0.0"; // python モード時のみ有効
  desktopPath?: string; // ComfyUI Desktop の .exe or .app path
  pythonPath?: string; // python 実行ファイルパス
  comfyDir?: string; // ComfyUI の main.py があるディレクトリ
  extraArgs?: string[]; // 例: ['--lowvram', '--force-fp16'] (python モード)
}

export interface LaunchResult {
  port: number;
  mode: LaunchMode;
  attached: boolean; // 既存プロセスへ接続しただけ（spawn せず）
  pid?: number;
}

export class ComfyManager {
  // spawn の stdio 設定が 'ignore' など可変なため WithoutNullStreams ではなく汎用 ChildProcess を使用
  private proc: ChildProcess | null = null;
  private cfg: ComfyConfig;
  private cfgPath: string;

  constructor(initial?: Partial<ComfyConfig>) {
    this.cfgPath = path.join(app.getPath("userData"), "comfy-launcher.json");
    this.cfg = this.loadConfig(initial);
  }

  // 設定のロード/セーブ
  loadConfig(overrides?: Partial<ComfyConfig>): ComfyConfig {
    let base: Partial<ComfyConfig> = {};
    if (fs.existsSync(this.cfgPath)) {
      try {
        base = JSON.parse(fs.readFileSync(this.cfgPath, "utf8"));
      } catch {}
    }
    const def: ComfyConfig = {
      mode: "desktop",
      port: 8000,
      listen: "127.0.0.1",
      extraArgs: [],
    } as ComfyConfig;
    this.cfg = { ...def, ...base, ...overrides } as ComfyConfig;
    return this.cfg;
  }

  saveConfig(next?: Partial<ComfyConfig>) {
    if (next) this.cfg = { ...this.cfg, ...next };
    fs.mkdirSync(path.dirname(this.cfgPath), { recursive: true });
    fs.writeFileSync(this.cfgPath, JSON.stringify(this.cfg, null, 2), "utf8");
    return this.cfg;
  }

  getConfig() {
    return this.cfg;
  }

  // 起動
  async start(options?: Partial<ComfyConfig>): Promise<LaunchResult> {
    if (options) this.saveConfig(options);
    const cfg = this.cfg;

    // 既にポートが応答していれば attach とみなす
    if (await this.isServerReady(cfg.port)) {
      return { port: cfg.port, mode: cfg.mode, attached: true };
    }

    if (cfg.mode === "desktop") return this.startDesktop();
    return this.startPython();
  }

  // 停止
  async stop(): Promise<void> {
    if (!this.proc) {
      // Desktop を macOS で閉じたい場合、osascript で終了を試みる
      if (process.platform === "darwin" && this.cfg.mode === "desktop") {
        await this.tryQuitMacDesktop();
      }
      return;
    }

    try {
      if (process.platform === "win32") {
        // Windows: SIGINT より taskkill が確実
        await new Promise<void>((resolve) => {
          const pid = this.proc ? String(this.proc.pid) : undefined;
          if (!pid) return resolve();
          const killer = spawn("taskkill", ["/PID", pid, "/T", "/F"]);
          killer.on("close", () => resolve());
          killer.on("error", () => resolve());
        });
      } else {
        // Unix: 親だけで十分なケースが多い
        this.proc.kill("SIGTERM");
      }
    } finally {
      this.proc = null;
    }
  }

  status() {
    return {
      running: !!this.proc,
      pid: this.proc?.pid,
      mode: this.cfg.mode,
      port: this.cfg.port,
    };
  }

  // ── Desktop モード ──────────────────────────
  private async startDesktop(): Promise<LaunchResult> {
    const port = this.cfg.port || 8000;
    const appPath = this.cfg.desktopPath || (await this.autoFindDesktop());

    if (!appPath) {
      const picked = await this.pickDesktopPath();
      if (!picked) throw new Error("ComfyUI Desktop のパスが未設定です");
      this.saveConfig({ desktopPath: picked });
    }

    const target = this.cfg.desktopPath || (await this.autoFindDesktop());
    if (!target) throw new Error("ComfyUI Desktop のパスが見つかりません");

    if (process.platform === "darwin") {
      // .app は open 経由
      this.proc = spawn("open", ["-n", target], {
        detached: true,
        stdio: "ignore",
      });
      this.proc.unref();
    } else if (process.platform === "win32") {
      this.proc = spawn(target, [], { detached: true, stdio: "ignore" });
      this.proc.unref();
    } else {
      throw new Error(
        "Linux は Desktop 未対応。python モードを使用してください"
      );
    }

    await this.waitUntilReady(port);
    return { port, mode: "desktop", attached: false, pid: this.proc?.pid };
  }

  // ── Python モード ───────────────────────────
  private async startPython(): Promise<LaunchResult> {
    const port = this.cfg.port || 8188;
    const listen = this.cfg.listen || "127.0.0.1";
    const python = this.cfg.pythonPath || (await this.autoFindPython());
    const comfyDir = this.cfg.comfyDir || (await this.autoFindComfyDir());

    if (!python) {
      const picked = await this.pickPythonPath();
      if (!picked) throw new Error("Python 実行ファイルのパスが未設定です");
      this.saveConfig({ pythonPath: picked });
    }
    if (!comfyDir) {
      const picked = await this.pickComfyDir();
      if (!picked) throw new Error("ComfyUI(main.py) のフォルダが未設定です");
      this.saveConfig({ comfyDir: picked });
    }

    const py = this.cfg.pythonPath || (await this.autoFindPython());
    const dir = this.cfg.comfyDir || (await this.autoFindComfyDir());
    if (!py || !dir) throw new Error("Python or ComfyUI path missing");

    const mainPy = path.join(dir, "main.py");
    if (!fs.existsSync(mainPy))
      throw new Error(`main.py が見つかりません: ${mainPy}`);

    const args = [
      "main.py",
      "--listen",
      listen,
      "--port",
      String(port),
      ...(this.cfg.extraArgs || []),
    ];

    this.proc = spawn(py, args, {
      cwd: dir,
      stdio: ["ignore", "pipe", "pipe"],
    });
    this.proc.stdout?.on("data", (d) => console.log("[comfy]", d.toString()));
    this.proc.stderr?.on("data", (d) =>
      console.error("[comfy:err]", d.toString())
    );
    this.proc.on("exit", (code) => {
      console.log("comfy exited", code);
      this.proc = null;
    });

    await this.waitUntilReady(port);
    return { port, mode: "python", attached: false, pid: this.proc?.pid };
  }

  // ── ユーティリティ ──────────────────────────
  private async isServerReady(port: number): Promise<boolean> {
    try {
      const ok = await this.httpProbe(port);
      return ok;
    } catch {
      return false;
    }
  }

  private async waitUntilReady(port: number, timeoutMs = 30_000) {
    const start = Date.now();
    return new Promise<void>((resolve, reject) => {
      const tryOnce = () => {
        this.httpProbe(port)
          .then((ok) => (ok ? resolve() : retry()))
          .catch(retry);
      };
      const retry = () => {
        if (Date.now() - start > timeoutMs)
          reject(new Error("ComfyUI の起動確認に失敗しました"));
        else setTimeout(tryOnce, 600);
      };
      tryOnce();
    });
  }

  private httpProbe(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const req = http.get({ host: "127.0.0.1", port, path: "/" }, (res) => {
        res.resume();
        resolve((res.statusCode ?? 500) < 500);
      });
      req.on("error", () => resolve(false));
    });
  }

  // 自動探索（ラフ）
  private async autoFindDesktop(): Promise<string | undefined> {
    if (process.platform === "win32") {
      const base =
        process.env.LOCALAPPDATA ?? path.join(os.homedir(), "AppData", "Local");
      const dirs = [
        path.join(base, "Programs", "comfyui-electron"),
        path.join(base, "Programs", "ComfyUI Desktop"),
      ];
      for (const d of dirs) {
        if (!fs.existsSync(d)) continue;
        const exes = fs
          .readdirSync(d)
          .filter((f) => f.toLowerCase().endsWith(".exe"));
        const pick = exes.find((f) => /comfy|desktop/i.test(f)) ?? exes[0];
        if (pick) return path.join(d, pick);
      }
      return undefined;
    }
    if (process.platform === "darwin") {
      const cands = [
        "/Applications/ComfyUI.app",
        "/Applications/ComfyUI Desktop.app",
        path.join(os.homedir(), "Applications", "ComfyUI.app"),
      ];
      return cands.find((p) => fs.existsSync(p));
    }
    return undefined;
  }

  private async autoFindPython(): Promise<string | undefined> {
    // 1) 明示設定優先。2) PATH 探索（最低限）
    const names =
      process.platform === "win32"
        ? ["python.exe", "py.exe"]
        : ["python3", "python"];
    for (const n of names) {
      try {
        const cand = await this.which(n);
        if (cand) return cand;
      } catch {}
    }
    return undefined;
  }

  private which(bin: string): Promise<string | undefined> {
    return new Promise((resolve) => {
      const cmd = process.platform === "win32" ? "where" : "which";
      const p = spawn(cmd, [bin]);
      let out = "";
      p.stdout.on("data", (d) => {
        out += d.toString();
      });
      p.on("close", () => {
        const line = out.split(/\r?\n/).find(Boolean);
        resolve(line && fs.existsSync(line) ? line : undefined);
      });
      p.on("error", () => resolve(undefined));
    });
  }

  private async autoFindComfyDir(): Promise<string | undefined> {
    // よくある配置: ユーザーが git clone したディレクトリ
    // 自動特定は難しいので userData に覚えたものがあればそれ
    const prev = this.cfg.comfyDir;
    if (prev && fs.existsSync(path.join(prev, "main.py"))) return prev;
    return undefined;
  }

  // パス選択ダイアログ
  async pickDesktopPath(): Promise<string | undefined> {
    const res = await dialog.showOpenDialog({
      title: "ComfyUI Desktop のアプリを選択",
      properties: ["openFile", "dontAddToRecent"],
      filters:
        process.platform === "darwin"
          ? [{ name: "Application", extensions: ["app"] }]
          : [{ name: "Executable", extensions: ["exe"] }],
    });
    return res.canceled ? undefined : res.filePaths[0];
  }

  async pickPythonPath(): Promise<string | undefined> {
    const res = await dialog.showOpenDialog({
      title: "Python 実行ファイルを選択",
      properties: ["openFile", "dontAddToRecent"],
      filters:
        process.platform === "win32"
          ? [{ name: "Python", extensions: ["exe"] }]
          : [{ name: "Unix Executable", extensions: [""] }],
    });
    return res.canceled ? undefined : res.filePaths[0];
  }

  async pickComfyDir(): Promise<string | undefined> {
    const res = await dialog.showOpenDialog({
      title: "ComfyUI のフォルダ (main.py がある場所) を選択",
      properties: ["openDirectory", "dontAddToRecent"],
    });
    return res.canceled ? undefined : res.filePaths[0];
  }

  private async tryQuitMacDesktop() {
    if (process.platform !== "darwin") return;
    const applescripts = [
      'tell application "ComfyUI" to quit',
      'tell application "ComfyUI Desktop" to quit',
    ];
    for (const script of applescripts) {
      try {
        await new Promise<void>((resolve, reject) => {
          execFile("osascript", ["-e", script], (err) =>
            err ? reject(err) : resolve()
          );
        });
        break;
      } catch {}
    }
  }
}

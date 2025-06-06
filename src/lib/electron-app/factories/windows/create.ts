import { BrowserWindow, shell } from "electron";
import { join } from "node:path";

import type { WindowProps } from "shared/types";

import { registerRoute } from "lib/electron-router-dom";

export function createWindow({ id, ...settings }: WindowProps) {
  const window = new BrowserWindow(settings);

  registerRoute({
    id,
    browserWindow: window,
    htmlFile: join(__dirname, "../renderer/index.html"),
  });

  window.on("closed", window.destroy);

  window.webContents.setWindowOpenHandler(({ url }) => {
    if (isHttp(url)) {
      // Allow HTTP(S) URLs to open in the system's default browser
      shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });

  window.webContents.on("will-navigate", (e, url) => {
    if (isHttp(url)) {
      e.preventDefault();
      shell.openExternal(url);
    }
  });

  return window;
}

function isHttp(url: string) {
  return /^https?:\/\//.test(url);
}

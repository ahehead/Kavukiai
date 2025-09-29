import { join } from "node:path";
import { BrowserWindow, shell } from "electron";
import {
  registerRoute,
  settings as routerSettings,
} from "lib/electron-router-dom";
import type { WindowProps } from "shared/types";

export function createWindow({ id, ...settings }: WindowProps) {
  const window = new BrowserWindow(settings);

  registerRoute({
    id,
    browserWindow: window,
    htmlFile: join(__dirname, "../renderer/index.html"),
  });

  window.on("closed", window.destroy);

  window.webContents.setWindowOpenHandler(({ url }) => {
    if (isInternalUrl(url)) {
      return { action: "allow" };
    }

    shell.openExternal(url);
    return { action: "deny" };
  });

  window.webContents.on("will-navigate", (event, url) => {
    if (isInternalUrl(url)) {
      return;
    }

    event.preventDefault();
    shell.openExternal(url);
  });

  return window;
}

function isInternalUrl(rawUrl: string) {
  if (rawUrl === "about:blank") {
    return true;
  }

  try {
    const url = new URL(rawUrl);

    if (INTERNAL_PROTOCOLS.has(url.protocol)) {
      return true;
    }

    if (!HTTP_PROTOCOLS.has(url.protocol)) {
      return false;
    }

    if (!INTERNAL_HOSTNAMES.has(url.hostname)) {
      return false;
    }

    const port = getEffectivePort(url);
    return allowedPorts.has(port);
  } catch {
    return false;
  }
}

const HTTP_PROTOCOLS = new Set(["http:", "https:"]);
const INTERNAL_PROTOCOLS = new Set(["file:", "devtools:"]);
const INTERNAL_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
  "0.0.0.0",
]);

const allowedPorts = new Set<number>([routerSettings.port]);

if (
  typeof routerSettings.devServerUrl === "string" &&
  routerSettings.devServerUrl
) {
  try {
    const devServerUrl = new URL(routerSettings.devServerUrl);
    INTERNAL_HOSTNAMES.add(devServerUrl.hostname);
    allowedPorts.add(getEffectivePort(devServerUrl));
  } catch {
    // ignore malformed devServerUrl values
  }
}

function getEffectivePort(url: URL) {
  if (url.port) {
    return Number.parseInt(url.port, 10);
  }

  if (url.protocol === "https:") {
    return 443;
  }

  return 80;
}

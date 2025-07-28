import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { ModelInfo } from "@lmstudio/sdk";

const execFileAsync = promisify(execFile);

/**
 * --quiet: suppress extra logs, --json: machine-readable output
 * CLI's JSON format is compatible with ModelInfo
 */
export async function listModelsViaCli(): Promise<ModelInfo[] | null> {
  try {
    const { stdout } = await execFileAsync("lms", ["ls", "--json", "--quiet"], {
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024,
    });
    return JSON.parse(stdout) as ModelInfo[];
  } catch {
    return null;
  }
}

/**
 * Starts the LMStudio server via CLI
 */
export async function startServerViaCli(): Promise<string> {
  const { stdout, stderr } = await execFileAsync("lms", ["server", "start"], {
    encoding: "utf8",
  });
  return (stderr || stdout).trim();
}

/**
 * Stops the LMStudio server via CLI
 */
export async function stopServerViaCli(): Promise<string> {
  const { stdout, stderr } = await execFileAsync("lms", ["server", "stop"], {
    encoding: "utf8",
  });
  return (stderr || stdout).trim();
}

export interface StatusInfo {
  server: "ON" | "OFF";
  port?: number;
  loadedModels: string[];
}

/**
 * Gets the status of the LMStudio server via CLI
 */
export async function getStatusViaCli(): Promise<StatusInfo | null> {
  try {
    const { stdout } = await execFileAsync("lms", ["status"], {
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024,
    });
    const text = stdout.trim();

    const serverMatch = text.match(
      /Server:\s*(ON|OFF)(?:\s*\(Port:\s*(\d+)\))?/i
    );
    if (!serverMatch) {
      return null;
    }
    const server = serverMatch[1].toUpperCase() as "ON" | "OFF";
    const port =
      server === "ON" && serverMatch[2]
        ? parseInt(serverMatch[2], 10)
        : undefined;

    const lines = text.split(/\r?\n/);
    const loadedModels: string[] = [];
    const idx = lines.findIndex((line) => /Loaded Models/i.test(line));
    if (idx !== -1) {
      for (let i = idx + 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || /^[└─]/.test(line)) {
          break;
        }
        const match = line.match(/[·•]\s*(.+)/);
        if (match) {
          const modelName = match[1].trim();
          if (!/No Models Loaded/i.test(modelName)) {
            loadedModels.push(modelName);
          }
        }
      }
    }

    return { server, port, loadedModels };
  } catch {
    return null;
  }
}

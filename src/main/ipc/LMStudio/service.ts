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
    return null; // CLI not found or failed
  }
}

/**
 * Starts the LMStudio server via CLI
 */
export async function startServerViaCli(): Promise<string> {
  const { stdout, stderr } = await execFileAsync("lms", ["server", "start"], {
    encoding: "utf8",
  });
  return (stderr || stdout).trim(); // stderr preferred
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

/// <reference path="./types/png2icons.d.ts" />

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as png2icons from "png2icons";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const sourceSvg = path.resolve(
  rootDir,
  "src",
  "resources",
  "build",
  "iconsvg",
  "icon4.svg"
);
const outDir = path.resolve(rootDir, "src", "resources", "build", "icons");

const TARGET_SIZE = 1024;
const OUTPUT_FILES = {
  png: path.join(outDir, "icon.png"),
  ico: path.join(outDir, "icon.ico"),
  icns: path.join(outDir, "icon.icns"),
};

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");

async function fileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

async function writeIfChanged(filePath: string, data: Buffer, label: string) {
  if (dryRun) {
    if (!(await fileExists(filePath))) {
      console.log(`${label}: would create (${formatSize(data.length)})`);
      return true;
    }
    const current = await fs.readFile(filePath);
    const changed = !current.equals(data);
    console.log(`${label}: ${changed ? "would update" : "unchanged"}`);
    return changed;
  }

  if (await fileExists(filePath)) {
    const current = await fs.readFile(filePath);
    if (current.equals(data)) {
      console.log(`${label}: unchanged`);
      return false;
    }
  }

  await fs.writeFile(filePath, data);
  console.log(`${label}: written (${formatSize(data.length)})`);
  return true;
}

function formatSize(bytes: number) {
  return `${(bytes / 1024).toFixed(1)} KiB`;
}

async function buildBasePng() {
  return sharp(sourceSvg)
    .resize(TARGET_SIZE, TARGET_SIZE, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function ensureSourceSvg() {
  if (await fileExists(sourceSvg)) return;
  throw new Error(`Source SVG not found: ${path.relative(rootDir, sourceSvg)}`);
}

async function ensureOutDir() {
  if (dryRun) return;
  await fs.mkdir(outDir, { recursive: true });
}

async function main() {
  await ensureSourceSvg();
  await ensureOutDir();

  console.log(`Generating icons from ${path.relative(rootDir, sourceSvg)}`);

  const basePng = await buildBasePng();
  await writeIfChanged(OUTPUT_FILES.png, basePng, "PNG");

  const ico = png2icons.createICO(basePng);
  if (!ico) throw new Error("ICO generation failed");
  await writeIfChanged(OUTPUT_FILES.ico, ico, "ICO");

  const icns = png2icons.createICNS(basePng);
  if (!icns) throw new Error("ICNS generation failed");
  await writeIfChanged(OUTPUT_FILES.icns, icns, "ICNS");

  console.log(
    dryRun ? "Dry run complete" : "Icon assets generated successfully"
  );
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  if (error instanceof Error && error.stack) {
    console.error(error.stack);
  }
  process.exitCode = 1;
});

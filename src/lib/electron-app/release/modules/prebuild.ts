import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import packageJSON from "../../../../../package.json";
import trustedDependencies from "../../../../../trusted-dependencies-scripts.json";
import { getDevFolder } from "../utils/path";

async function createPackageJSONDistVersion() {
  const { main, pnpm, scripts = {}, ...rest } = packageJSON;

  // ★ postinstall をダミー化して二重ビルドを防ぐ
  const scriptsPatched = { ...scripts, postinstall: "echo skip" };

  const packageJSONDistVersion = {
    main: "./main/index.js",
    ...rest,
    scripts: scriptsPatched,
  };

  try {
    await Promise.all([
      writeFile(
        resolve(getDevFolder(main), "package.json"),
        JSON.stringify(packageJSONDistVersion, null, 2)
      ),

      writeFile(
        resolve(getDevFolder(main), pnpm.onlyBuiltDependenciesFile),
        JSON.stringify(trustedDependencies, null, 2)
      ),
    ]);
  } catch ({ message }: any) {
    console.log(`
    🛑 Something went wrong!\n
      🧐 There was a problem creating the package.json dist version...\n
      👀 Error: ${message}
    `);
  }
}

createPackageJSONDistVersion();

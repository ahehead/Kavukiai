import { dirname, normalize, resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import reactPlugin from "@vitejs/plugin-react";
import { codeInspectorPlugin } from "code-inspector-plugin";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import injectProcessEnvPlugin from "rollup-plugin-inject-process-env";
import svgr from "vite-plugin-svgr";
import tsconfigPathsPlugin from "vite-tsconfig-paths";
import { main, resources } from "./package.json";
import { settings } from "./src/lib/electron-router-dom";

const [nodeModules, devFolder] = normalize(dirname(main)).split(/\/|\\/g);
const devPath = [nodeModules, devFolder].join("/");

const tsconfigPaths = tsconfigPathsPlugin({
  projects: [resolve("tsconfig.json")],
});

console.log("🚀 using config file:", __filename);

export default defineConfig({
  main: {
    plugins: [tsconfigPaths, externalizeDepsPlugin({ exclude: ["arktype"] })],

    build: {
      lib: {
        entry: resolve(__dirname, "src/main/index.ts"),
      },
      outDir: resolve(devPath, "main"),
    },
  },

  preload: {
    plugins: [tsconfigPaths, externalizeDepsPlugin({ exclude: ["arktype"] })],

    build: {
      outDir: resolve(devPath, "preload"),
    },
  },

  renderer: {
    define: {
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
      "process.platform": JSON.stringify(process.platform),
    },

    server: {
      port: settings.port,
    },

    plugins: [
      tsconfigPaths,
      reactPlugin({
        babel: {
          plugins: ["babel-plugin-react-compiler"],
        },
      }),
      tailwindcss(),
      svgr(),

      codeInspectorPlugin({
        bundler: "vite",
        hotKeys: ["altKey"],
        hideConsole: true,
      }),
    ],

    publicDir: resolve(resources, "public"),

    build: {
      outDir: resolve(devPath, "renderer"),

      rollupOptions: {
        plugins: [
          injectProcessEnvPlugin({
            NODE_ENV: "production",
            platform: process.platform,
          }),
        ],

        input: {
          index: resolve("src/renderer/index.html"),
        },

        output: {
          dir: resolve(devPath, "renderer"),
        },
      },
    },
  },
});

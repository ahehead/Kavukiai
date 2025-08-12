# Copilot Developer Instructions

Quick-start guidance for AI coding agents working in this Electron + React + TypeScript monorepo (electron-vite based).

## Architecture in one look

- Three processes under `src/`:
  - `main/` (Node): app entry (`main/index.ts`), IPC handlers (`main/ipc/**`), menus and windows (`main/windows/**`).
  - `preload/` (Bridge): exposes safe APIs on `window.App` by composing modules (`preload/index.ts`). See `preload/README_ipc.md` for how to add channels.
  - `renderer/` (React 19 + Vite): UI, routing via `electron-router-dom` (`renderer/routes.tsx`). Node editor is under `renderer/nodeEditor/**` using Rete v2.
- Shared types live in `src/shared/**` and are consumed from both main/renderer (e.g., `shared/ApiType.ts`, TypeBox schemas).
- Resources (icons, images, sample workflows) are under `src/resources/**`.

## Development workflow

- Setup: pnpm install
- Run (dev, hot-reload): pnpm dev
- Preview (prod build preview): pnpm start
- Build app: pnpm build (uses electron-builder)
- Lint/format: pnpm lint (auto-fix: pnpm lint:fix)
- Tests (Vitest): pnpm test run, or pnpm vitest run -t "<name>"
- Prebuild packaging metadata: pnpm compile:packageJSON
 - Editor/terminal: VS Code with PowerShell terminal (pwsh)

### Change verification (run in PowerShell)

```powershell
pnpm lint
npx tsc --noEmit
pnpm test run
```

## IPC pattern (canonical)

1) Add channel in `shared/ApiType.ts` (enum IpcChannel)
2) Implement handler in `main/ipc/**` and register in `main/ipc/index.ts` via `registerIpcHandlers()`
3) Add API wrapper in `preload/**` and export from `preload/index.ts` into `window.App`
4) Call from renderer using the preload API. Example: ComfyUI run recipe
   - Channel: `IpcChannel.PortComfyUIRunRecipe`
   - Handler: `main/ipc/ComfyUI/runRecipeHandler.ts` streams structured events over a MessagePort
   - Port event types: `shared/ComfyUIType/port-events.ts`

## Node editor conventions (Rete v2)

- Entry: `renderer/nodeEditor/CreateNodeEditor.ts` wires plugins: area, connection, react render, history, grid snapping, selection.
- Control vs Data flow: `ExecList` in `renderer/nodeEditor/types` distinguishes exec sockets from data sockets. Dataflow via `features/safe-dataflow/dataflowEngin` and control via `rete-engine`.
- UI presets: custom context menu and react presets under `renderer/nodeEditor/features/**`.
- Keep logic separate from presentation; prefer Class Variance Authority for style variants.

## ComfyUI and LMStudio integrations

- ComfyUI: using `@saintno/comfyui-sdk`.
  - Main handler builds a `PromptBuilder` from a `PromptRecipe` (TypeBox in `renderer/nodeEditor/types/Schemas/comfyui/prompt.schema.ts`):
    - Map `recipe.inputs[key].path` via `setInputNode(key, path)`, `recipe.outputs[key].path` via `setOutputNode(key, path)`
    - Apply `default` values unless listed in `recipe.bypass`
    - Stream progress/preview/output via MessagePort events
  - API client singleton in `main/ipc/ComfyUI/comfyApiClient.ts`.
- LMStudio: IPC handlers under `main/ipc/LMStudio/**`; preload API in `preload/lmstudio.ts`.

## State, settings, persistence

- Renderer state via Zustand stores under `renderer/hooks/**`.
- Persist app/user settings with `electron-conf` on main side; renderer-side persistence uses `localStorage` when applicable.

## Code conventions for this repo

- TypeScript + Biome. Keep types strict; avoid non-null assertions.
- Follow `.github/instructions/ts.instructions.md` for TS/TSX/JS/CSS generation. Preserve comments; don’t reformat unrelated code in patches.
- JSON schema: prefer TypeBox (`@sinclair/typebox`) in `src/shared/**` and generate types where needed.

## Useful paths and examples

- Routing: `renderer/routes.tsx`
- IPC registry: `main/ipc/index.ts`
- Preload export surface: `preload/index.ts`
- Shared channels and types: `shared/ApiType.ts`, `shared/ComfyUIType/**`
- Tests: `test/**` (Vitest). Example: `test/preload/lmstudio.test.ts`
- Scripts: type extraction (`scripts/extract-types.ts`), ComfyUI sample runner (`scripts/run-comfyui-sample.ts`)

## PR and CI expectations

- Run pnpm test run and pnpm lint before pushing (see AGENTS.md). Ensure green tests and no type/lint errors.
 - Also run a type-check locally: `npx tsc --noEmit` (PowerShell terminal)

If anything is unclear or missing, point to the file/area and we’ll refine this guide.

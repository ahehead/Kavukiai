# Copilot Developer Instructions
## System Overview
- Electron + Vite desktop app split into main (`src/main/**`), preload (`src/preload/**`), and React renderer (`src/renderer/**`).
- `main/index.ts` boots windows from `main/windows/**`; file/OS helpers live in `main/features/**`.
- Shared contracts and TypeBox schemas are centralized in `src/shared/**`; path aliases include `@nodes/*` and `~/*` (see `tsconfig.json`).
## IPC & Process Boundaries
- Declare new IPC channels and payloads in `shared/ApiType.ts` (`IpcChannel` enum plus request/response schemas).
- Implement handlers under `main/ipc/**` and register them in `main/ipc/index.ts` via `registerIpcHandlers()`.
- Mirror every handler with a preload wrapper (e.g., `preload/appState.ts`) and re-export in `preload/index.ts` so renderer code calls `window.App.<feature>`.
- For streaming/message-port flows (ComfyUI, etc.), follow the patterns documented in `preload/README_ipc.md` and `shared/ComfyUIType/port-events.ts`.
## Renderer & Node Editor
- Routing starts in `renderer/index.tsx` → `renderer/routes.tsx`; global UI utilities reside in `renderer/components/**` and `renderer/features/**` (toasts, dirty-check, tab manager).
- Rete integration is orchestrated by `renderer/nodeEditor/CreateNodeEditor.ts`; sockets live in `renderer/nodeEditor/types/ExecList`, safe dataflow helpers under `renderer/nodeEditor/features/safe-dataflow/**`.
- Styling uses Tailwind + Class Variance Authority; reuse existing variants rather than inline styles.
## Node Authoring Pattern
- Domain folders in `src/nodes/**` (Chat, LMStudio, ComfyUI, Primitive, etc.) share the layout described in `doc/nodes/README.md` (`common/`, per-node `renderer/`, `main/`, `preload/`, `shared/`).
- When a node crosses processes, add its shared type to `src/nodes/<Group>/<Node>/shared/`, hook IPC via the workflow above, and surface UI inside `renderer/nodeEditor/nodes/nodeFactories.ts`.
- Register new controls in `renderer/nodeEditor/nodes/Controls/registry.ts`; leverage existing components before introducing bespoke UI.
## State, Persistence & Assets
- Renderer state uses Zustand stores in `renderer/hooks/**`; async effects belong inside store actions to avoid race conditions.
- Persistent app settings live in the main process via `electron-conf`; renderer-side preferences fall back to local storage helpers.
- Workflow templates/assets come from `src/resources/public/**` and `scripts/sample/**`; keep PNG/JSON variants in sync when adding new examples.
## Tooling & Quality Gates
- Install deps with `pnpm install`; dev server via `pnpm dev`, packaged preview `pnpm start`, bundling with `pnpm build` (electron-builder).
- Static checks: `pnpm lint` (auto-fix `pnpm lint:fix`), Biome enforces formatting, and `npx tsc --noEmit` guards type safety.
- Tests run with `pnpm test run`; narrow scope using `pnpm vitest run -t "<name>"`. Key suites live in `test/preload/lmstudio.test.ts` and `test/lib/loadModules.test.ts`.
- Use `scripts/extract-types.ts` and fixtures in `scripts/data/*.data.ts` when syncing shared schema snapshots.
## Reference Docs
- Architectural discussions: `doc/workflow.md`, `doc/plan/node-refactor-plan*.md`.
- Contributor expectations and CI contract: `AGENTS.md`.
- Review `AGENTS.md` + `.github/instructions/ts.instructions.md` before touching TS/TSX/CSS to stay aligned with project conventions.

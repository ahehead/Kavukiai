# Copilot Developer Instructions
**Core Layout**
- Electron + Vite app with three processes: Node main (`src/main/**`), preload bridge (`src/preload/**`), and React renderer (`src/renderer/**`).
- `main/index.ts` boots windows declared in `main/windows/**`; IPC handlers stay under `main/ipc/**` and register via `registerIpcHandlers()` in `main/ipc/index.ts`.
- `preload/index.ts` exposes vetted APIs on `window.App`; modules like `preload/fileOperations.ts` or `preload/lmstudio.ts` wrap IPC calls using shared types.
- Routing lives in `renderer/routes.tsx`; node editor UI is concentrated in `renderer/nodeEditor/**` (Rete v2 + React renderer).
- Shared contracts stay in `src/shared/**` (TypeBox schemas + TS types) so both main and renderer compile against the same shapes.
**Renderer Patterns**
- `renderer/nodeEditor/CreateNodeEditor.ts` wires area, connection, history, selection, and custom plugin setup for Rete.
- Exec sockets are enumerated in `renderer/nodeEditor/types/ExecList`; data flow logic sits in `renderer/nodeEditor/features/safe-dataflow/**`.
- Context menu, grid snapping, and node chrome customizations live in `renderer/nodeEditor/features/**`; keep visual components using Class Variance Authority patterns already in place.
- Cross-cutting UI sits under `renderer/components/**` and `renderer/features/**` (e.g., dirty-check, tab manager, toast notices).
**IPC Workflow**
- Declare new channels in `shared/ApiType.ts` (enum `IpcChannel`) and extend related TypeBox payloads there.
- Implement handlers in `main/ipc/<feature>.ts` (or nested folders) and register them inside `main/ipc/index.ts`'s `registerIpcHandlers()`.
- Mirror the handler with a preload wrapper (e.g., `preload/appState.ts`) and re-export through `preload/index.ts` to surface on `window.App`.
- Renderer code calls `window.App.<feature>`; refer to `preload/README_ipc.md` for MessagePort patterns (ComfyUI streaming, etc.).
**Integrations**
- ComfyUI flows: `main/ipc/ComfyUI/runRecipeHandler.ts` builds a `PromptBuilder` from `renderer/nodeEditor/types/Schemas/comfyui/prompt.schema.ts`; events stream over MessagePort types defined in `shared/ComfyUIType/port-events.ts`.
- `main/ipc/ComfyUI/comfyApiClient.ts` caches the SDK client—reuse instead of instantiating per request.
- LMStudio endpoints reside in `main/ipc/LMStudio/**`, with preload access via `preload/lmstudio.ts` and Vitest coverage in `test/preload/lmstudio.test.ts` for expected payloads.
**State & Persistence**
- Renderer state stores use Zustand under `renderer/hooks/**`; async effects should live in store actions for predictable updates.
- Persistent app settings leverage `electron-conf` on the main process; renderer-level preferences fall back to `localStorage` or store-level hydration helpers.
- Workflow templates and assets live under `src/resources/public/**` and `scripts/sample/**`; keep new assets mirrored there if surfaced in UI.
**Tooling & Commands**
- Install deps with `pnpm install`; run hot reload via `pnpm dev`, production preview with `pnpm start`, and package with `pnpm build` (electron-builder).
- Run linting using `pnpm lint` (auto-fix: `pnpm lint:fix`); static type checks via `npx tsc --noEmit`.
- Execute tests with `pnpm test run`; target a single case using `pnpm vitest run -t "<name>"`.
- Follow `.github/instructions/ts.instructions.md` for TS/TSX/JS/CSS edits; formatting is enforced by Biome.
- Type extraction utilities live in `scripts/extract-types.ts`; data fixtures in `scripts/data/*.data.ts` document expected schema shapes.
**Useful References**
- `main/features/**` contains OS integrations (file dialogs, window sizing) reused by IPC handlers.
- `renderer/features/**` aggregates reusable logic like file IO, PNG export, and drag/drop workflow handling.
- Documentation for flows sits in `doc/workflow.md`; architectural notes and refactor plans under `doc/plan/*.md` provide rationale before editing core modules.
- `AGENTS.md` summarizes contributor expectations (lint, type-check, Vitest) before opening PRs—treat as CI contract.

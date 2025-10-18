# Node-Level Recomposition Plan

## Background
- The Electron app structure is split across `src/main`, `src/preload`, `src/renderer`, and `src/shared`, so implementations for a single node (feature) end up scattered across layers and are hard to follow.
- This is especially painful for NodeEditor schemas/types and node-specific logic such as LMStudio or ComfyUI, which live far apart and drag down maintainability.

## Goals
- Gather the main/preload/renderer/shared/schema pieces for each node so the functional boundary is easy to scan.
- Replace preload and IPC registration with directory discovery (auto-registration at build time) to cut the maintenance cost of adding or removing nodes.
- Reorganize existing type definitions and schemas into node-specific subdirectories to simplify imports.

## High-Level Approach
- Rehome code under `src/nodes/<node group>/<node>/` laid out as:
  - `main/` — IPC handlers and main-process-only utilities.
  - `preload/` — APIs, schemas, and types exposed via `contextBridge`.
  - `renderer/` — NodeEditor UI, hooks, and schemas.
  - `shared/` — Pure TypeScript types/constants referenced by both main and renderer.
  - `schema/` — TypeBox definitions for the data exchanged between nodes.
- Invoke auto-registration logic from `src/main/index.ts` and `src/preload/index.ts`, using `import.meta.glob` to eagerly load entry files in each node folder (for example `main/register.ts`, `preload/api.ts`).
- For now, keep the legacy top-level `src/main`, `src/preload`, etc. alongside the new layout and retire legacy files gradually after each migration step.

## Phase-by-Phase Plan

## Progress Tracker
- [x] Phase 1: Build the pilot node and lay the groundwork
- [x] Phase 2: Automate preload registration
- [ ] Phase 3: Automate main (IPC) registration
- [ ] Phase 4: Rehome renderer schemas/types
- [ ] Phase 5: Clean up shared/types overall

### Phase 1: Preparation
- [x] Create the `src/nodes/` root and select `src/nodes/LMStudio/LMStudioStart` as the pilot target.
- [x] Add a shared helper such as `loadModules` (an `import.meta.glob` wrapper) under `src/lib`.
- [x] Review alias settings in `electron.vite.config.ts` and add one like `@nodes` if necessary.

### Phase 2: Preload Recomposition
- [x] Rewrite `src/preload/index.ts` to use auto-registration, for example `import.meta.glob("../nodes/**/preload/*Entry.ts")`.
- [x] Start with LMStudio/LMStudioStart and move the existing APIs into `src/nodes/LMStudio/LMStudioStart/preload/api.ts`.
- [x] Place LMStudio/LMStudioStart API types under `src/nodes/LMStudio/LMStudioStart/shared/types.ts`.
- [x] Delete migrated preload legacy files. Rewriting or adding tests.

### Phase 3: Main (IPC) Recomposition
- [x] Switch `src/main/ipc/index.ts` to auto-register handlers via `import.meta.glob("../nodes/**/main/ipc.ts")`.
- [x] Move LMStudio handlers (`registerLMStudioHandlers`, `registerLMStudioChatHandler`, `registerLMStudioLoadModelHandler`) into `src/nodes/LMStudio/LMStudioStart/main`, and gather logic used across LMStudio nodes in `src/nodes/LMStudio/common/main`, exposed through a single `register` entry.
- [ ] Continue migrating other nodes and phase out the explicit calls inside `registerIpcHandlers`.

### Phase 4: Renderer NodeEditor Schemas/Types
- [ ] Move node-specific pieces from `src/renderer/nodeEditor/types/Schemas` and node-specific items in `src/shared/type` into each node's `schema/` or `shared/` directory.
- [ ] Consider consolidating shared schemas under `src/nodes/common/schema` or `src/nodes/common/_shared`.
- [ ] Start by relocating `src/renderer/nodeEditor/nodes/Node/LMStudio/LMStudioStartNode.tsx` to `src/nodes/LMStudio/LMStudioStart/renderer/LMStudioStartNode.tsx`, adding `main/`, `preload/`, `shared/`, and `schema/` subdirectories as needed.

### Phase 5: Shared/Type Cleanup
- [ ] Review `src/shared` and move node-specific types into `src/nodes/<node group>/<node>/shared`.
- [ ] Relocate utilities referenced by multiple nodes to `src/shared/core` or a similar shared location.
- [ ] If circular dependencies arise, keep the types under `shared/core`.

## Auto-Registration Proposal
- Preload: call `import.meta.glob("../nodes/**/preload/expose.ts", { eager: true })` and execute each module's default export or `register(apiContext)`.
- Main: call `import.meta.glob("../nodes/**/main/*.ipc.ts", { eager: true })` and execute each module's `export const register = (ctx) => { ... }`.
- Testing: add Vitest coverage (for example `pnpm vitest run -t "preload auto registration"`) to confirm the discovered modules match expectations.

## Risks and Considerations
- Because `import.meta.glob` resolves at build time, we must enforce strict file-naming conventions.
- During migration, circular references or duplicate exposures become harder to spot, so run `pnpm lint` and `pnpm test` at each stage.
- Electron main-process restarts will resolve paths differently; confirm no logic depends on `__dirname`.

## Next Actions
- [x] Create the `src/nodes/LMStudio/LMStudioStart` directory and move the existing node implementation to `renderer/LMStudioStartNode.tsx`, keeping exports wired up.
- [x] Duplicate the LMStudio preload/main entry files into `src/nodes/LMStudio/...` and connect them to the existing implementations.
- [x] Add a provisional auto-registration helper (LMStudio only for now) to `src/preload/index.ts` and verify it runs.
- [x] Apply the same technique to `src/main/ipc/index.ts`.
- [ ] Define migration rules for NodeEditor schemas/types and document them separately if needed.

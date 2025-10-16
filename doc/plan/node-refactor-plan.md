# Node-Level Recomposition Plan

## Background
- The Electron app structure is split across `src/main`, `src/preload`, `src/renderer`, and `src/shared`, so implementations for a single "node" (feature) are scattered across directories, making them hard to trace and understand.
- This is especially problematic for NodeEditor schemas/types and node-specific logic such as LMStudio or ComfyUI, which live far apart and reduce maintainability.

## Goals
- Group the main/preload/renderer/shared/schema code for each node under a single node boundary to improve discoverability.
- Replace manual preload/IPC registration with directory discovery (auto-registration at build time) to lower maintenance cost when adding or removing nodes.
- Reorganize existing type definitions and schemas into node-specific subdirectories to simplify import references.

## High-Level Approach
- Rehome code under `src/nodes/<node group>/<node>/` with the following layout:
	- `main/` — IPC handlers and main-process utilities.
	- `preload/` — APIs exposed via `contextBridge`, schemas, and types.
	- `renderer/` — NodeEditor UI, hooks, and schemas.
	- `shared/` — Pure TypeScript types/constants referenced by both main and renderer.
	- `schema/` — TypeBox definitions for data exchanged between nodes.
- Update `src/main/index.ts` to load window/IPC modules via `import.meta.glob`, targeting entry files such as `main/register.ts`. `src/main/ipc/index.ts` should likewise auto-register handlers.
- Update `src/preload/index.ts` to expose preload APIs via `import.meta.glob`, targeting entries like `preload/api.ts`.
- Renderer code should import from these centralized entries so all node concerns reside under `src/nodes`.
- During migration, keep the legacy `src/main`, `src/preload`, etc. alongside the new structure and remove old files once each node moves over.

## Phase Plan

### Phase 1: Preparation
- Create the `src/nodes/` root and select `src/nodes/LMStudio/LMStudioStart` as the pilot target.
- Add a shared helper such as `loadModules` (an `import.meta.glob` wrapper) under `src/lib`.
- Check `electron.vite.config.ts` aliases and add one (for example `@nodes`) if helpful.

### Phase 2: Preload Recomposition
- Refactor `src/preload/index.ts` to auto-register modules via `import.meta.glob("../nodes/**/preload/*Entry.ts")`.
- Start with LMStudio/LMStudioStart: move existing APIs into `src/nodes/LMStudio/LMStudioStart/preload/api.ts`.
- Place LMStudio/LMStudioStart-related types in `src/nodes/LMStudio/LMStudioStart/shared/types.ts`.
- Migrate other nodes in turn and delete legacy files after each move.

### Phase 3: Main (IPC) Recomposition
- Refactor `src/main/ipc/index.ts` to auto-register handlers via `import.meta.glob("../nodes/**/main/ipc.ts")`.
- Move LMStudio handlers such as `registerLMStudioHandlers`, `registerLMStudioChatHandler`, and `registerLMStudioLoadModelHandler` into `src/nodes/LMStudio/LMStudioStart/main`. Place logic shared across LMStudio nodes in `src/nodes/LMStudio/common/main`, exposed from a single `register` entry point.
- Continue migrating other nodes and phase out explicit registrations inside `registerIpcHandlers`.

### Phase 4: Renderer NodeEditor Schemas/Types
- Move node-specific schemas from `src/renderer/nodeEditor/types/Schemas` and node-specific types from `src/shared/type` into each node's `schema/` or `shared/` directory.
- Keep cross-node schemas under `src/nodes/common/schema` (or `src/nodes/common/_shared`) as needed.
- Begin by relocating `src/renderer/nodeEditor/nodes/Node/LMStudio/LMStudioStartNode.tsx` to `src/nodes/LMStudio/LMStudioStart/renderer/LMStudioStartNode.tsx`, adding `main/`, `preload/`, `shared/`, and `schema/` subdirectories as necessary.

### Phase 5: Shared Type Cleanup
- Audit `src/shared` and move node-specific types into `src/nodes/<node group>/<node>/shared`.
- Keep utilities referenced by multiple nodes under `src/shared/core` or a similar location.
- If circular dependencies appear, leave the types in `shared/core`.

## Auto-Registration Details
- Preload: use `import.meta.glob("../nodes/**/preload/expose.ts", { eager: true })` to load each module and call its default export or `register(apiContext)`.
- Main: use `import.meta.glob("../nodes/**/main/*.ipc.ts", { eager: true })` to load modules and call `export const register = (ctx) => { ... }`.
- Testing: add Vitest coverage (e.g., `pnpm vitest run -t "preload auto registration"`) to verify the discovered modules match expectations.

## Risks and Considerations
- `import.meta.glob` resolves at build time, so we must standardize file naming conventions.
- During migration there is higher risk of circular references or duplicate API exposures, so run `pnpm lint` and `pnpm test` at each step.
- Electron main-process path resolution will change; verify no logic depends on `__dirname`.

## Next Actions
1. Create `src/nodes/LMStudio/LMStudioStart` and move the existing node implementation to `renderer/LMStudioStartNode.tsx`, ensuring exports remain intact.
2. Copy the LMStudio preload/main entry files into `src/nodes/LMStudio/...` and link them with the existing implementations.
3. Add a provisional auto-registration function to `src/preload/index.ts` (for LMStudio only) and confirm it works.
4. Apply the same approach to `src/main/ipc/index.ts`.
5. Define schema/type migration rules for the NodeEditor and document them separately as needed.

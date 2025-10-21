# Node-Level Reconstruction Plan

## Background
- Because the Electron app structure is split by layers (`src/main`, `src/preload`, `src/renderer`, `src/shared`), the implementation for a single “node (feature)” ends up scattered across directories, making it hard to track and grasp.
- This is especially problematic for NodeEditor schemas/types and node-specific processing such as LMStudio or ComfyUI, which live far apart and reduce maintainability.

## Objective
- Group the main/preload/renderer/shared/schema types around each node so that code can be scanned by functional boundary.
- Replace preload/IPCs registration with directory scanning (auto-registration during build) to reduce maintenance when adding or removing nodes.
- Reorganize existing type definitions/schemas into node-specific subdirectories to simplify references/imports.

## Overview of the Approach
- Rehome content under `src/nodes/<node folder>/<node>/` with the following layout:
  - `main/`: place IPC handlers and utilities exclusive to the main process.
  - `preload/`: place APIs, schemas, and types exposed through `contextBridge`.
  - `renderer/`: place NodeEditor UI, hooks, schemas, etc.
  - `shared/`: place pure TypeScript types/constants referenced by both main and renderer.
  - `schema/`: define TypeBox models for data exchanged between nodes.
- From `src/main/index.ts` and `src/preload/index.ts`, call auto-registration logic using `import.meta.glob` (for example, loading entry files like `main/register.ts` and `preload/api.ts` within each node folder).
- For the time being, keep the existing top-level `src/main`, `src/preload`, etc. alongside the new layout and gradually remove legacy files once migration is complete.

## Phase-by-Phase Plan

### Phase 1: Preparation
- [x] Create the `src/nodes/` root and select a pilot target `src/nodes/<group...>/<node>`.
- [x] Add common utilities such as a `loadModules` helper (`import.meta.glob` wrapper) under `src/lib`.
- [x] Confirm alias settings in `electron.vite.config.ts` and add an alias like `@nodes` if needed.

### Phase 2: Preload Recomposition
- [x] Switch `src/preload/index.ts` to auto-registration with `import.meta.glob("../nodes/**/preload/*Entry.ts")`.
- [ ] Move the pilot node’s preload API into `src/nodes/<group>/<node>/preload/api.ts` and organize necessary types under `shared/types.ts`.
- [ ] Delete migrated preload legacy files and update relevant tests.

### Phase 3: Main (IPC) Recomposition
- [x] Introduce auto-registration in `src/main/ipc/index.ts` via `import.meta.glob("../nodes/**/main/ipc.ts")`.
- [ ] Relocate the pilot node’s IPC handlers to `src/nodes/<group>/<node>/main`, centralizing shared logic in `src/nodes/<group>/common/main`.
- [ ] Delete legacy IPC code and update relevant tests.

### Phase 4: Renderer NodeEditor Schema/Types
- [ ] Move node-specific items from `src/renderer/nodeEditor/types/Schemas` and `src/shared` into each node’s `schema/` or `shared/`.
- [ ] For reusable schemas, consolidate under something like `src/nodes/common/schema`.
- [ ] Gradually move each node’s UI/schema implementation into `src/nodes/<group>/<node>/renderer/`, while preserving existing exports.

### Phase 5: Shared/Type Cleanup
- [ ] Inventory `src/shared` and move node-specific types into `src/nodes/<group>/<node>/shared`.
- [ ] Rehome cross-node utilities/types into a directory such as `src/shared/core`.
- [ ] Where circular dependencies are a concern, extract carefully and keep items shared as needed.

## Auto-Registration Detailed Proposal
- Preload: use `import.meta.glob("../nodes/**/preload/expose.ts", { eager: true })` to execute each module’s `default` export or `register(apiContext)`.
- Main: use `import.meta.glob("../nodes/**/main/*.ipc.ts", { eager: true })` to call each module’s `export const register = (ctx) => { ... }`.

## Risks / Notes
- `import.meta.glob` resolves at build time, so file naming conventions must be enforced.
- During migration, it becomes harder to spot circular references or duplicate entries, so run `pnpm lint` at each stage. If there is another test, run `pnpm test run -t "<node>"`. Confirmation.
- Since Electron main-process restarts will resolve paths differently, check for logic depending on `__dirname`.

## Node Migration Checklist

### LMStudio
- [ ] FetchModelInfos
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] ListDownloadedModels
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] LLMPredictionConfig
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] LMStudioChat
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] LMStudioLoadModel
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [x] LMStudioStart
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] LMStudioStop
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] ModelInfoToModelList
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [ ] ServerStatus
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] UnLoadModel
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5

### ComfyUI
- [ ] ComfyDesktopStart
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] ComfyUIFreeMemory
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] ComfyUI
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] FetchCheckpoints
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] FetchTemplateWorkflows
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] FetchUserWorkflowList
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] LoadWorkflowFile
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] MergeWorkflowInputsDefaults
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] WorkflowInputs
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] WorkflowOutputs
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] WorkflowRefToApiWorkflow
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5

### Chat
- [ ] LMStudioToUChatCommand
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] OpenAIToUChatCommand
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] ReverseRole
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] UChatGetLastMessage
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] UChatMessageByString
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] UChatMessage
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] UChat
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] UChatRole
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] UChatToLMStudio
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] UChatToOpenAI
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] UChatToString
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] UPartText
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5

### OpenAI
- [ ] JsonSchemaFormat
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] OpenAI
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] ResponseCreateParamsBase
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] ResponseTextConfig
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5

### Debug
- [ ] Test
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] Unknown
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5

### Inspector
- [ ] Inspector
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5

### Primitive (Basics)
- [ ] Bool
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] CreateSelect
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] Number
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5

### Primitive / Array
- [ ] Array
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] Join
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] ToArray
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5

### Primitive / Flow
- [ ] CounterLoop
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] IF
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] Run
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5

### Primitive / Image
- [ ] SelectImage
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] ShowImage
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5

### Primitive / Object
- [ ] JsonSchema
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] JsonSchemaToObject
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] ObjectPick
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] ParseJsonAndPick
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] ParseJsonToObject
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5

### Primitive / String
- [ ] AutoTemplateReplace
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] CodeFence
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] DefaultString
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] JsonFilePath
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] MultiLineString
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] NumberToString
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] ObjectToString
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] ObjectToYAMLString
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] StringForm
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] String
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5
- [ ] TemplateReplace
  - [ ] Phase 2
  - [ ] Phase 3
  - [ ] Phase 4
  - [ ] Phase 5

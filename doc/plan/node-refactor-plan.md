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
- [x] Move the pilot node's preload API into `src/nodes/<group>/<node>/preload/api.ts` and organize necessary types under `shared/types.ts`.
- [x] Delete migrated preload legacy files and update relevant tests.

### Phase 3: Main (IPC) Recomposition
- [x] Introduce auto-registration in `src/main/ipc/index.ts` via `import.meta.glob("../nodes/**/main/ipc.ts")`.
- [x] Relocate the pilot node's IPC handlers to `src/nodes/<group>/<node>/main`, centralizing shared logic in `src/nodes/<group>/common/main`.
- [x] Delete legacy IPC code and update relevant tests.

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
- [x] FetchModelInfos
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] ListDownloadedModels
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] LLMPredictionConfig
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] LMStudioChat
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] LMStudioLoadModel
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
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
- [x] ServerStatus
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] UnLoadModel
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5

### ComfyUI
- [x] ComfyDesktopStart
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] ComfyUIFreeMemory
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] ComfyUI
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] FetchCheckpoints
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] FetchTemplateWorkflows
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] FetchUserWorkflowList
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] LoadWorkflowFile
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] MergeWorkflowInputsDefaults
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] WorkflowInputs
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] WorkflowOutputs
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] WorkflowRefToApiWorkflow
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5

### Chat
- [x] LMStudioToUChatCommand
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] OpenAIToUChatCommand
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] ReverseRole
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] UChatGetLastMessage
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] UChatMessageByString
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] UChatMessage
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] UChat
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] UChatRole
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] UChatToLMStudio
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] UChatToOpenAI
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] UChatToString
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] UPartText
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5

### OpenAI
- [x] JsonSchemaFormat
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] OpenAI
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] ResponseCreateParamsBase
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] ResponseTextConfig
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5

### Debug
- [x] Test
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] Unknown
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5

### Inspector
- [x] Inspector
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5

### Primitive (Basics)
- [x] Bool
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] CreateSelect
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] Number
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5

### Primitive / Array
- [x] Array
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] Join
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] ToArray
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5

### Primitive / Flow
- [x] CounterLoop
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] IF
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] Run
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5

### Primitive / Image
- [x] SelectImage
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] ShowImage
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5

### Primitive / Object
- [x] JsonSchema
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] JsonSchemaToObject
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] ObjectPick
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] ParseJsonAndPick
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] ParseJsonToObject
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5

### Primitive / String
- [x] AutoTemplateReplace
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] CodeFence
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] DefaultString
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] JsonFilePath
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] MultiLineString
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] NumberToString
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] ObjectToString
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] ObjectToYAMLString
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] StringForm
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] String
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5
- [x] TemplateReplace
  - [x] Phase 2
  - [x] Phase 3
  - [x] Phase 4
  - [x] Phase 5

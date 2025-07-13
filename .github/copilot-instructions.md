# Copilot Developer Instructions

Welcome! These instructions help AI coding agents (Copilot, AI assistants) get up to speed quickly on this Electron–React–TypeScript codebase.

## 1. Project Overview

- **Platform**: Electron app (`electron-vite`) with separate **main**, **preload**, and **renderer** processes under `src/`
  - `src/main/`: Node-based entry (`index.ts`), defines windows (`windows/main.ts`), menus, and feature modules (`features/`).
  - `src/preload/`: Exposes IPC APIs via `@zubridge/electron` for secure renderer access (e.g., fileOperations, openAI, settings).
  - `src/renderer/`: React 19 + Vite UI; uses `electron-router-dom` for in-app routing (`routes.tsx`).
- **State**: Managed with `zustand` stores under `src/hooks/`; persisted via `electron-conf` and `localStorage` patterns.
- **Node Editor**: Rete v2-based graph editor lives in `src/renderer/nodeEditor/`; follow Rete v2 API for logic components, and use Class Variance Authority & shadcn/ui for presentation.
- **Shared**: Common types and utilities in `src/shared/` (TypeBox schemas, constants, helper functions).

## 2. Development Workflow

- Install & bootstrap: `pnpm install`
- **Development**: `pnpm dev` (starts Electron + Vite in watch-mode)
- **Preview**: `pnpm start` (production preview via `electron-vite preview`)
- **Build & Release**:
  - Build: `pnpm build` (runs `electron-builder`)
  - Package JSON prebuild: `pnpm compile:packageJSON`
  - Release: `pnpm release` (publishes via `electron-builder --publish always`)
- **Lint**: `pnpm lint`, autofix with `pnpm lint:fix`
- **Tests**: `pnpm test run` (Vitest). To focus: `pnpm vitest run -t "<test name>"`.

## 3. Code Conventions & Generation Guidance

- Follow rules in `.github/instructions/ts.instructions.md` for all `.ts`, `.tsx`, `.js`, `.jsx`, `.css` files:
  - Preserve comments
  - Use `zustand` patterns for stores
  - Separate presentational vs logic via Class Variance Authority
  - Node editor code adheres to Rete v2 API
- Use `#fetch` and `#githubRepo` lookups for external docs (e.g., Rete.js core & React plugin) when assisting.

## 4. Key Patterns & Examples

- **IPC Channels**: Defined under `src/ipc/*.ts` (e.g., `openai.ts`, `load-file.ts`); consumed in preload (`apiKeys.ts`, `fileOperations.ts`), and exposed as hooks (`useFileOperations.ts`).
- **Routing**: `electron-router-dom` in `src/renderer/routes.tsx`, linking screens in `src/renderer/screens/`.
- **Node Editor Setup**: Entry at `CreateNodeEditor.ts`, feature modules in `src/renderer/nodeEditor/features/`, custom nodes in `.../nodes/`.
- **JSON Schema**: Defined via TypeBox in `src/shared/constants.ts` & `src/shared/utils.ts`; codegen via `@sinclair/typebox-codegen`.

## 5. CI & Release

- GitHub Actions workflows in `.github/workflows/ci.yml` and `release.yml` enforce lint, tests, and packaging steps.
- Ensure all tests & lint checks pass before committing.

---

*Need clarification on any section? Let me know to refine these instructions.*

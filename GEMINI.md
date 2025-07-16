# AI Developer Instructions

Welcome! These instructions help AI coding agents (Copilot, AI assistants) get up to speed quickly on this Electron–React–TypeScript codebase.

## 1. Project Overview

- **Platform**: Electron app (`electron-vite`) with separate **main**, **preload**, and **renderer** processes under `src/`
  - `src/main/`: Node-based entry (`index.ts`), defines windows (`windows/main.ts`), menus, and feature modules (`features/`).
  - `src/preload/`: Exposes IPC APIs via `@zubridge/electron` for secure renderer access (e.g., fileOperations, openAI, settings).
  - `src/renderer/`: React 19 + Vite UI; uses `electron-router-dom` for in-app routing (`routes.tsx`).
- **State**: Managed with `zustand` stores under `src/hooks/`; persisted via `electron-conf` and `localStorage` patterns.
- **Node Editor**: Rete v2-based graph editor lives in `src/renderer/nodeEditor/`; follow Rete v2 API for logic components, and use Class Variance Authority & shadcn/ui for presentation.
- **Shared**: Common types and utilities in `src/shared/` (TypeBox schemas, constants, helper functions).


## Testing Instructions
- From the package root you can just call pnpm test run. The commit should pass all tests before you merge.
- To focus on one step, add the Vitest pattern: pnpm vitest run -t "<test name>".
- Fix any test or type errors until the whole suite is green.
- After moving files or changing imports, run pnpm lint .
- Add or update tests for the code you change, even if nobody asked.

## 言語
思考は英語で行い、ユーザーへの報告は日本語で行って

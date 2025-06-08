# Contributor Guide

## Dev Environment Tips
- [doc](doc)folderにフォルダ構造など開発者向け文章あり

## Testing Instructions
- From the package root you can just call pnpm test. The commit should pass all tests before you merge.
- To focus on one step, add the Vitest pattern: pnpm vitest run -t "<test name>".
- Fix any test or type errors until the whole suite is green.
- After moving files or changing imports, run pnpm lint .
- Add or update tests for the code you change, even if nobody asked.


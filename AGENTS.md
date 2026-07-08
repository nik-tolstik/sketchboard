# AGENTS.md

## Project Rules

- Use `pnpm` for all package-manager actions.
- Use interactive `zsh` for shell commands.
- Write code comments in English.
- Keep the app framework-free: HTML, CSS, TypeScript, Vite, Vitest, ESLint, and Prettier.
- Do not add React, Angular, Vue, or similar UI frameworks.
- Prefer small domain helpers and tests over adding UI-specific logic directly to `main.ts`.

## Architecture Pointers

- Read `docs/ARCHITECTURE.md` before changing editor behavior.
- Domain logic belongs in `src/domain`.
- State/history/autosave belongs in `src/application/SceneStore.ts`.
- IndexedDB details belong in `src/infrastructure/indexedDbSceneRepository.ts`.
- Canvas drawing belongs in `src/ui/CanvasRenderer.ts`.
- Pointer/tool behavior belongs in `src/ui/EditorController.ts`.
- DOM composition and global keyboard wiring belong in `src/main.ts`.

## Workflow

- Keep changes scoped to the requested behavior.
- Use `apply_patch` for manual edits.
- Run `pnpm exec prettier --write ...` on changed files or `pnpm format`.
- Before handoff, run:

```bash
pnpm test
pnpm build
pnpm lint
pnpm format:check
```

## Interaction Expectations

- Element mutations should go through `SceneStore` methods so undo/redo remains correct.
- Viewport panning should not create undo history entries.
- Selection state is UI-only and should not be persisted.
- Browser persistence is IndexedDB; keep persisted scene data normalized through `src/domain/scene.ts`.
- Temporary QA scripts and screenshots should stay outside the repository unless explicitly requested.

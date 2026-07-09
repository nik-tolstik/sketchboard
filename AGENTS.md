# AGENTS.md

## Project Rules

- Use `pnpm` for all package-manager actions.
- Use interactive `zsh` for shell commands.
- Write code comments in English.
- Keep the app on React + Vite with TypeScript, shadcn/ui, Tailwind CSS, Vitest, ESLint, and Prettier.
- Do not add Angular, Vue, or another UI framework unless explicitly requested.
- Use shadcn/ui components from `src/shared/ui` for standard controls such as buttons, toggles, sliders, badges, separators, and tooltips; add missing shadcn components through the CLI instead of hand-rolling equivalent markup.
- Prefer small domain helpers and tests over adding editor behavior directly to React components.

## Architecture Pointers

- Read `docs/ARCHITECTURE.md` before changing editor behavior.
- Use Feature-Sliced Design layers: `app`, `pages`, `widgets`, `features` when needed, `entities`, and `shared`.
- Higher layers may import only lower layers; avoid imports from sibling or higher layers.
- Keep public slice APIs in `index.ts` files and prefer importing through them.
- App entry, providers, and global styles belong in `src/app`.
- Route-level page composition belongs in `src/pages/board`.
- Editor shell, canvas runtime, renderer, controller, icons, and editor config belong in `src/widgets/editor`.
- Scene domain logic, state/history/autosave, and IndexedDB persistence belong in `src/entities/scene`.
- shadcn/ui components belong in `src/shared/ui`; shared helpers belong in `src/shared/lib`.

## Workflow

- Keep changes scoped to the requested behavior.
- Use `apply_patch` for manual edits.
- When a dev server is already running, reuse its existing URL for QA instead of starting another server on a different port.
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
- Browser persistence is IndexedDB; keep persisted scene data normalized through `src/entities/scene/model/scene.ts`.
- Temporary QA scripts and screenshots should stay outside the repository unless explicitly requested.

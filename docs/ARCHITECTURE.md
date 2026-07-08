# Architecture

SketchBoard is a framework-free TypeScript whiteboard editor. The app is intentionally split into small layers so canvas behavior, persistence, and UI wiring can evolve independently.

## Runtime Flow

1. `src/main.ts` builds the static DOM shell, wires toolbar controls, keyboard shortcuts, IndexedDB persistence, and the canvas controller.
2. `EditorController` receives pointer and keyboard-driven commands, translates screen coordinates into world coordinates, and decides which domain operation should happen.
3. `SceneStore` owns the current scene, undo/redo stacks, and autosave scheduling.
4. `CanvasRenderer` draws the latest scene snapshot and transient UI overlays onto the `<canvas>`.
5. `IndexedDbSceneRepository` persists the normalized scene into browser IndexedDB.

## Layers

### Domain

Files under `src/domain` define editor data and geometry helpers:

- `elements.ts`: canonical element types, tools, styles, constructors, and scene types.
- `geometry.ts`: coordinate conversion, rectangle normalization, arrow heads, distances, and shape constraints.
- `selection.ts`: bounds, hit-testing, area selection, translation, cloning, and style application.
- `scene.ts`: empty-scene creation and persisted-scene normalization/migration.

Domain modules should not depend on DOM APIs. Keep them testable with Vitest.

### Application

`src/application/SceneStore.ts` is the state boundary:

- Holds the active `SceneSnapshot`.
- Emits immutable snapshots to subscribers.
- Persists changes with a small debounce.
- Tracks undo/redo for element changes.
- Does not put viewport panning into undo history.

Use `addElements`, `replaceElements`, `removeElements`, and `updateElementsStyle` for user-visible element changes so history remains coherent.

### Infrastructure

`src/infrastructure/indexedDbSceneRepository.ts` is the IndexedDB adapter. It stores one default scene record in the `sketchboard-db` database.

### UI

Files under `src/ui` are browser-facing:

- `CanvasRenderer.ts`: imperative canvas drawing for grid, elements, previews, selection outlines, and selection boxes.
- `EditorController.ts`: tool state, pointer interactions, selection drag, copy/paste, text creation, panning, and export.
- `icons.ts`: inline SVG icon registry for toolbar buttons.

`src/main.ts` is composition glue. Keep business rules out of it unless they are purely about DOM wiring.

## Interaction Model

- Middle mouse drag pans the viewport.
- Select tool supports click selection, Shift-click additive toggling, area selection, and dragging selected elements.
- `Ctrl+C` copies selected elements into an in-memory clipboard.
- `Ctrl+V` pastes copies at the last cursor world position.
- `Delete` and `Backspace` remove selected elements.
- Text uses a temporary inline textarea positioned on the canvas. Committing creates a `text` element.
- `Ctrl+Z` and `Ctrl+Shift+Z` undo/redo element changes.
- Number shortcuts `1` through `6` select the first six toolbar tools; letter shortcuts remain available.

## Testing

Unit tests live next to the code they exercise:

- `*.test.ts` under `src/domain` cover geometry, scene migration, and selection logic.
- `SceneStore.test.ts` covers state/history behavior.

Run:

```bash
pnpm test
pnpm build
pnpm lint
pnpm format:check
```

Rendered UI checks are done with temporary Playwright scripts outside the repository when needed.

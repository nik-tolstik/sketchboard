import type { DrawingElement, ElementStyle, SceneSnapshot, Viewport } from "../domain/elements";
import { createEmptyScene } from "../domain/scene";
import { applyElementStyle } from "../domain/selection";
import type { IndexedDbSceneRepository } from "../infrastructure/indexedDbSceneRepository";

type Listener = (scene: SceneSnapshot) => void;
type SaveStateListener = (state: SaveState) => void;
type SceneRepository = Pick<IndexedDbSceneRepository, "load" | "save" | "clear">;

export type SaveState = "idle" | "loading" | "saving" | "saved" | "error";

const SAVE_DELAY_MS = 250;
const MAX_HISTORY_DEPTH = 100;

const cloneElements = (elements: DrawingElement[]): DrawingElement[] =>
  elements.map((element) => structuredClone(element));

export class SceneStore {
  private scene = createEmptyScene();
  private listeners = new Set<Listener>();
  private saveStateListeners = new Set<SaveStateListener>();
  private saveTimer: ReturnType<typeof globalThis.setTimeout> | undefined;
  private undoStack: DrawingElement[][] = [];
  private redoStack: DrawingElement[][] = [];

  constructor(private readonly repository: SceneRepository) {}

  getSnapshot(): SceneSnapshot {
    return {
      ...this.scene,
      elements: this.scene.elements.map((element) => structuredClone(element)),
      viewport: { ...this.scene.viewport },
    };
  }

  async hydrate(): Promise<void> {
    this.emitSaveState("loading");

    try {
      this.scene = await this.repository.load();
      this.undoStack = [];
      this.redoStack = [];
      this.emit();
      this.emitSaveState("saved");
    } catch {
      this.scene = createEmptyScene();
      this.undoStack = [];
      this.redoStack = [];
      this.emit();
      this.emitSaveState("error");
    }
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getSnapshot());

    return () => this.listeners.delete(listener);
  }

  subscribeSaveState(listener: SaveStateListener): () => void {
    this.saveStateListeners.add(listener);
    listener("idle");

    return () => this.saveStateListeners.delete(listener);
  }

  addElement(element: DrawingElement): void {
    this.addElements([element]);
  }

  addElements(elements: DrawingElement[]): void {
    if (elements.length === 0) {
      return;
    }

    this.pushHistory();
    this.scene = {
      ...this.scene,
      elements: [...this.scene.elements, ...elements],
      updatedAt: Date.now(),
    };
    this.commit();
  }

  replaceElement(element: DrawingElement): void {
    this.replaceElements([element]);
  }

  replaceElements(elements: DrawingElement[]): void {
    if (elements.length === 0) {
      return;
    }

    const replacements = new Map(elements.map((element) => [element.id, element]));
    const hasMatchingElements = this.scene.elements.some((element) => replacements.has(element.id));

    if (!hasMatchingElements) {
      return;
    }

    this.pushHistory();
    this.scene = {
      ...this.scene,
      elements: this.scene.elements.map((current) => replacements.get(current.id) ?? current),
      updatedAt: Date.now(),
    };
    this.commit();
  }

  updateElementsStyle(elementIds: Set<string>, stylePatch: Partial<ElementStyle>): void {
    if (elementIds.size === 0 || Object.keys(stylePatch).length === 0) {
      return;
    }

    const hasMatchingElements = this.scene.elements.some((element) => elementIds.has(element.id));

    if (!hasMatchingElements) {
      return;
    }

    this.pushHistory();
    this.scene = {
      ...this.scene,
      elements: this.scene.elements.map((element) =>
        elementIds.has(element.id) ? applyElementStyle(element, stylePatch) : element,
      ),
      updatedAt: Date.now(),
    };
    this.commit();
  }

  removeElements(elementIds: Set<string>): void {
    if (elementIds.size === 0) {
      return;
    }

    const elements = this.scene.elements.filter((element) => !elementIds.has(element.id));

    if (elements.length === this.scene.elements.length) {
      return;
    }

    this.pushHistory();
    this.scene = {
      ...this.scene,
      elements,
      updatedAt: Date.now(),
    };
    this.commit();
  }

  updateViewport(viewport: Viewport): void {
    this.scene = {
      ...this.scene,
      viewport,
      updatedAt: Date.now(),
    };
    this.commit();
  }

  clear(): void {
    if (this.scene.elements.length === 0) {
      return;
    }

    this.pushHistory();
    this.scene = createEmptyScene();
    this.commit();
  }

  undo(): boolean {
    const previousElements = this.undoStack.pop();

    if (!previousElements) {
      return false;
    }

    this.redoStack.push(cloneElements(this.scene.elements));
    this.scene = {
      ...this.scene,
      elements: previousElements,
      updatedAt: Date.now(),
    };
    this.commit();

    return true;
  }

  redo(): boolean {
    const nextElements = this.redoStack.pop();

    if (!nextElements) {
      return false;
    }

    this.undoStack.push(cloneElements(this.scene.elements));
    this.scene = {
      ...this.scene,
      elements: nextElements,
      updatedAt: Date.now(),
    };
    this.commit();

    return true;
  }

  private commit(): void {
    this.emit();
    this.scheduleSave();
  }

  private emit(): void {
    const snapshot = this.getSnapshot();

    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }

  private emitSaveState(state: SaveState): void {
    for (const listener of this.saveStateListeners) {
      listener(state);
    }
  }

  private pushHistory(): void {
    this.undoStack.push(cloneElements(this.scene.elements));
    this.redoStack = [];

    if (this.undoStack.length > MAX_HISTORY_DEPTH) {
      this.undoStack.shift();
    }
  }

  private scheduleSave(): void {
    globalThis.clearTimeout(this.saveTimer);
    this.emitSaveState("saving");
    this.saveTimer = globalThis.setTimeout(() => void this.persist(), SAVE_DELAY_MS);
  }

  private async persist(): Promise<void> {
    try {
      await this.repository.save(this.scene);
      this.emitSaveState("saved");
    } catch {
      this.emitSaveState("error");
    }
  }
}

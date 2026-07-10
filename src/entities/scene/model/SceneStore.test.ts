import { describe, expect, it, vi } from "vitest";
import { createShapeElement, createTextElement, type SceneSnapshot } from "./elements";
import { createEmptyScene } from "./scene";
import type { SceneRepository } from "./sceneRepository";
import { SceneStore } from "./SceneStore";

type TestSceneRepository = SceneRepository & {
  saved: SceneSnapshot[];
};

const createRepository = (
  initialScene: SceneSnapshot = createEmptyScene(),
): TestSceneRepository => {
  const saved: SceneSnapshot[] = [];

  return {
    saved,
    async load() {
      return initialScene;
    },
    async save(scene: SceneSnapshot) {
      saved.push(structuredClone(scene));
    },
  };
};

const createStore = async (
  initialScene: SceneSnapshot = createEmptyScene(),
): Promise<{ repository: TestSceneRepository; store: SceneStore }> => {
  const repository = createRepository(initialScene);
  const store = new SceneStore(repository);

  await store.hydrate();

  return { repository, store };
};

const getElementTexts = (store: SceneStore): string[] =>
  store
    .getSnapshot()
    .elements.filter((element) => element.type === "text")
    .map((element) => element.text);

describe("SceneStore", () => {
  it("undoes and redoes element changes", async () => {
    const { store } = await createStore();

    store.addElement(createTextElement({ x: 10, y: 10 }, "first"));
    store.addElement(createTextElement({ x: 20, y: 20 }, "second"));

    expect(getElementTexts(store)).toEqual(["first", "second"]);
    expect(store.undo()).toBe(true);
    expect(getElementTexts(store)).toEqual(["first"]);
    expect(store.redo()).toBe(true);
    expect(getElementTexts(store)).toEqual(["first", "second"]);
  });

  it("does not add viewport updates to the undo history", async () => {
    const { store } = await createStore();

    store.addElement(createTextElement({ x: 10, y: 10 }, "first"));
    store.updateViewport({ x: 100, y: 50, zoom: 2 });

    expect(store.undo()).toBe(true);
    expect(store.getSnapshot().elements).toHaveLength(0);
    expect(store.getSnapshot().viewport).toEqual({ x: 100, y: 50, zoom: 2 });
  });

  it("removes elements as one undoable change", async () => {
    const { store } = await createStore();
    const first = createTextElement({ x: 10, y: 10 }, "first");
    const second = createTextElement({ x: 20, y: 20 }, "second");

    store.addElement(first);
    store.addElement(second);
    store.removeElements(new Set([first.id, second.id]));

    expect(getElementTexts(store)).toEqual([]);
    expect(store.undo()).toBe(true);
    expect(getElementTexts(store)).toEqual(["first", "second"]);
  });

  it("adds pasted elements and applies selected styles as undoable changes", async () => {
    const { store } = await createStore();
    const first = createTextElement({ x: 10, y: 10 }, "first");
    const second = createTextElement({ x: 20, y: 20 }, "second");

    store.addElements([first, second]);
    store.updateElementsStyle(new Set([first.id]), { stroke: "#ff0000", fill: "#00ff00" });

    expect(store.getSnapshot().elements[0]?.style.stroke).toBe("#ff0000");
    expect(store.undo()).toBe(true);
    expect(store.getSnapshot().elements[0]?.style.stroke).not.toBe("#ff0000");
    expect(store.undo()).toBe(true);
    expect(store.getSnapshot().elements).toHaveLength(0);
  });

  it("persists border radius style changes through undo and redo", async () => {
    const { store } = await createStore();
    const rectangle = createShapeElement("rectangle", { x: 0, y: 0 }, { x: 80, y: 40 });

    store.addElement(rectangle);
    store.updateElementsStyle(new Set([rectangle.id]), { borderRadius: 16 });

    expect(store.getSnapshot().elements[0]?.style.borderRadius).toBe(16);
    expect(store.undo()).toBe(true);
    expect(store.getSnapshot().elements[0]?.style.borderRadius).toBe(0);
    expect(store.redo()).toBe(true);
    expect(store.getSnapshot().elements[0]?.style.borderRadius).toBe(16);
  });

  it("assigns new elements to increasing top layers", async () => {
    const { store } = await createStore();
    const first = createTextElement({ x: 10, y: 10 }, "first");
    const second = createTextElement({ x: 20, y: 20 }, "second");

    store.addElement(first);
    store.addElement(second);

    expect(store.getSnapshot().elements.map((element) => element.layer)).toEqual([0, 1]);
  });

  it("moves selected elements through layer order", async () => {
    const { store } = await createStore();
    const first = createTextElement({ x: 10, y: 10 }, "first");
    const second = createTextElement({ x: 20, y: 20 }, "second");
    const third = createTextElement({ x: 30, y: 30 }, "third");

    store.addElements([first, second, third]);

    expect(store.updateElementsLayer(new Set([second.id]), "backward")).toBe(true);
    expect(store.getSnapshot().elements.map((element) => element.layer)).toEqual([1, 0, 2]);

    expect(store.updateElementsLayer(new Set([second.id]), "forward")).toBe(true);
    expect(store.getSnapshot().elements.map((element) => element.layer)).toEqual([0, 1, 2]);

    expect(store.updateElementsLayer(new Set([first.id]), "front")).toBe(true);
    expect(store.getSnapshot().elements.map((element) => element.layer)).toEqual([2, 0, 1]);

    expect(store.updateElementsLayer(new Set([first.id]), "back")).toBe(true);
    expect(store.getSnapshot().elements.map((element) => element.layer)).toEqual([0, 1, 2]);
  });

  it("keeps layer changes undoable", async () => {
    const { store } = await createStore();
    const first = createTextElement({ x: 10, y: 10 }, "first");
    const second = createTextElement({ x: 20, y: 20 }, "second");

    store.addElements([first, second]);
    store.updateElementsLayer(new Set([first.id]), "front");

    expect(store.getSnapshot().elements.map((element) => element.layer)).toEqual([1, 0]);
    expect(store.undo()).toBe(true);
    expect(store.getSnapshot().elements.map((element) => element.layer)).toEqual([0, 1]);
  });

  it("updates text alignment as an undoable change", async () => {
    const { store } = await createStore();
    const element = createTextElement({ x: 10, y: 10 }, "first");

    store.addElement(element);

    expect(store.updateTextElementsAlign(new Set([element.id]), "center")).toBe(true);
    expect(store.getSnapshot().elements[0]).toMatchObject({ textAlign: "center" });
    expect(store.undo()).toBe(true);
    expect(store.getSnapshot().elements[0]).toMatchObject({ textAlign: "left" });
  });

  it("replaces moved elements as one undoable change", async () => {
    const { store } = await createStore();
    const element = createTextElement({ x: 10, y: 10 }, "first");

    store.addElement(element);
    store.replaceElements([{ ...element, x: 80, y: 90 }]);

    expect(store.getSnapshot().elements[0]).toMatchObject({ x: 80, y: 90 });
    expect(store.undo()).toBe(true);
    expect(store.getSnapshot().elements[0]).toMatchObject({ x: 10, y: 10 });
  });

  it("debounces saves and persists the latest scene snapshot", async () => {
    vi.useFakeTimers();

    try {
      const { repository, store } = await createStore();

      store.addElement(createTextElement({ x: 10, y: 10 }, "first"));
      store.addElement(createTextElement({ x: 20, y: 20 }, "second"));

      expect(repository.saved).toEqual([]);

      await vi.advanceTimersByTimeAsync(250);

      expect(repository.saved).toHaveLength(1);
      expect(
        repository.saved[0]?.elements
          .filter((element) => element.type === "text")
          .map((element) => element.text),
      ).toEqual(["first", "second"]);
    } finally {
      vi.useRealTimers();
    }
  });

  it("clears redo history after a new edit", async () => {
    const { store } = await createStore();

    store.addElement(createTextElement({ x: 10, y: 10 }, "first"));
    store.addElement(createTextElement({ x: 20, y: 20 }, "second"));

    expect(store.undo()).toBe(true);
    store.addElement(createTextElement({ x: 30, y: 30 }, "replacement"));

    expect(store.redo()).toBe(false);
    expect(getElementTexts(store)).toEqual(["first", "replacement"]);
  });
});

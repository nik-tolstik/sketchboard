import { describe, expect, it } from "vitest";
import { createTextElement, type SceneSnapshot } from "../domain/elements";
import { createEmptyScene } from "../domain/scene";
import { SceneStore } from "./SceneStore";

const createRepository = (initialScene: SceneSnapshot = createEmptyScene()) => {
  const saved: SceneSnapshot[] = [];

  return {
    saved,
    async load() {
      return initialScene;
    },
    async save(scene: SceneSnapshot) {
      saved.push(scene);
    },
    async clear() {
      saved.length = 0;
    },
  };
};

describe("SceneStore", () => {
  it("undoes and redoes element changes", async () => {
    const repository = createRepository();
    const store = new SceneStore(repository);
    await store.hydrate();

    store.addElement(createTextElement({ x: 10, y: 10 }, "first"));
    store.addElement(createTextElement({ x: 20, y: 20 }, "second"));

    expect(store.getSnapshot().elements).toHaveLength(2);
    expect(store.undo()).toBe(true);
    expect(store.getSnapshot().elements.map((element) => element.type)).toEqual(["text"]);
    expect(store.redo()).toBe(true);
    expect(store.getSnapshot().elements).toHaveLength(2);
  });

  it("does not add viewport updates to the undo history", async () => {
    const repository = createRepository();
    const store = new SceneStore(repository);
    await store.hydrate();

    store.addElement(createTextElement({ x: 10, y: 10 }, "first"));
    store.updateViewport({ x: 100, y: 50, zoom: 1 });

    expect(store.undo()).toBe(true);
    expect(store.getSnapshot().elements).toHaveLength(0);
    expect(store.getSnapshot().viewport).toEqual({ x: 100, y: 50, zoom: 1 });
  });

  it("removes elements as one undoable change", async () => {
    const repository = createRepository();
    const store = new SceneStore(repository);
    await store.hydrate();
    const first = createTextElement({ x: 10, y: 10 }, "first");
    const second = createTextElement({ x: 20, y: 20 }, "second");

    store.addElement(first);
    store.addElement(second);
    store.removeElements(new Set([first.id, second.id]));

    expect(store.getSnapshot().elements).toHaveLength(0);
    expect(store.undo()).toBe(true);
    expect(store.getSnapshot().elements).toHaveLength(2);
  });

  it("adds pasted elements and applies selected styles as undoable changes", async () => {
    const repository = createRepository();
    const store = new SceneStore(repository);
    await store.hydrate();
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

  it("replaces moved elements as one undoable change", async () => {
    const repository = createRepository();
    const store = new SceneStore(repository);
    await store.hydrate();
    const element = createTextElement({ x: 10, y: 10 }, "first");

    store.addElement(element);
    store.replaceElements([{ ...element, x: 80, y: 90 }]);

    expect(store.getSnapshot().elements[0]).toMatchObject({ x: 80, y: 90 });
    expect(store.undo()).toBe(true);
    expect(store.getSnapshot().elements[0]).toMatchObject({ x: 10, y: 10 });
  });
});

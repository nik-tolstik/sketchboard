import { describe, expect, it } from "vitest";
import { DEFAULT_VIEWPORT, getTextElementWidth } from "./elements";
import { MAX_VIEWPORT_ZOOM, MIN_VIEWPORT_ZOOM } from "./geometry";
import { createEmptyScene, normalizeScene } from "./scene";

describe("scene", () => {
  it("creates an empty v1 scene", () => {
    const scene = createEmptyScene();

    expect(scene.version).toBe(1);
    expect(scene.elements).toEqual([]);
    expect(scene.viewport).toEqual(DEFAULT_VIEWPORT);
  });

  it("falls back to an empty scene for invalid data", () => {
    expect(normalizeScene(null).elements).toEqual([]);
    expect(normalizeScene({ version: 99 } as never).viewport).toEqual(DEFAULT_VIEWPORT);
  });

  it("repairs missing viewport values", () => {
    expect(
      normalizeScene({
        version: 1,
        elements: [],
        viewport: { x: Number.NaN, y: 12, zoom: Number.NaN },
        updatedAt: Number.NaN,
      }).viewport,
    ).toEqual({
      x: DEFAULT_VIEWPORT.x,
      y: 12,
      zoom: DEFAULT_VIEWPORT.zoom,
    });
  });

  it("clamps persisted viewport zoom values", () => {
    expect(
      normalizeScene({
        version: 1,
        elements: [],
        viewport: { x: 0, y: 0, zoom: 0 },
      }).viewport.zoom,
    ).toBe(MIN_VIEWPORT_ZOOM);
    expect(
      normalizeScene({
        version: 1,
        elements: [],
        viewport: { x: 0, y: 0, zoom: 10 },
      }).viewport.zoom,
    ).toBe(MAX_VIEWPORT_ZOOM);
  });

  it("normalizes shape element types", () => {
    const scene = normalizeScene({
      version: 1,
      elements: [
        { id: "1", type: "square" },
        { id: "2", type: "rectangle" },
        { id: "3", type: "circle" },
        { id: "4", type: "ellipse" },
      ] as never,
      viewport: DEFAULT_VIEWPORT,
      updatedAt: Date.now(),
    });

    expect(scene.elements.map((element) => element.type)).toEqual([
      "rectangle",
      "rectangle",
      "ellipse",
      "ellipse",
    ]);
  });

  it("adds layers to old persisted elements", () => {
    const scene = normalizeScene({
      version: 1,
      elements: [
        { id: "1", type: "text" },
        { id: "2", type: "text", layer: 8 },
        { id: "3", type: "text" },
      ] as never,
      viewport: DEFAULT_VIEWPORT,
      updatedAt: Date.now(),
    });

    expect(scene.elements.map((element) => element.layer)).toEqual([0, 8, 9]);
  });

  it("repairs missing styles and text alignment", () => {
    const scene = normalizeScene({
      version: 1,
      elements: [
        {
          id: "1",
          type: "text",
          textAlign: "diagonal",
          style: { opacity: 1.8, lineWidth: -4 },
        },
        {
          id: "2",
          type: "rectangle",
          style: { opacity: -0.2 },
        },
      ] as never,
      viewport: DEFAULT_VIEWPORT,
      updatedAt: Date.now(),
    });

    const [text, rectangle] = scene.elements;

    expect(text?.style.opacity).toBe(1);
    expect(text?.style.lineWidth).toBe(2);
    expect(text?.type === "text" ? text.textAlign : undefined).toBe("left");
    expect(rectangle?.style.opacity).toBe(0);
  });

  it("widens old persisted text elements to the current computed width", () => {
    const text = "123456789123456789123456789123456789";
    const scene = normalizeScene({
      version: 1,
      elements: [{ id: "1", type: "text", text, fontSize: 24, width: 460 }] as never,
      viewport: DEFAULT_VIEWPORT,
      updatedAt: Date.now(),
    });
    const [element] = scene.elements;

    expect(element?.type).toBe("text");
    expect(element?.type === "text" ? element.width : undefined).toBe(getTextElementWidth(text));
  });

  it("migrates old persisted arrows to points", () => {
    const scene = normalizeScene({
      version: 1,
      elements: [
        {
          id: "1",
          type: "arrow",
          start: { x: 10, y: 20 },
          end: { x: 50, y: 60 },
        },
      ] as never,
      viewport: DEFAULT_VIEWPORT,
      updatedAt: Date.now(),
    });
    const [arrow] = scene.elements;

    expect(arrow?.type).toBe("arrow");
    expect(arrow?.type === "arrow" ? arrow.points : undefined).toEqual([
      { x: 10, y: 20 },
      { x: 30, y: 40 },
      { x: 50, y: 60 },
    ]);
  });

  it("keeps persisted arrows at the minimum of three points", () => {
    const scene = normalizeScene({
      version: 1,
      elements: [
        {
          id: "1",
          type: "arrow",
          points: [
            { x: 10, y: 20 },
            { x: 50, y: 60 },
          ],
        },
      ] as never,
      viewport: DEFAULT_VIEWPORT,
      updatedAt: Date.now(),
    });
    const [arrow] = scene.elements;

    expect(arrow?.type === "arrow" ? arrow.points : undefined).toEqual([
      { x: 10, y: 20 },
      { x: 30, y: 40 },
      { x: 50, y: 60 },
    ]);
  });
});

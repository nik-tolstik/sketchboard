import { describe, expect, it } from "vitest";
import {
  createArrowElement,
  createBrushElement,
  createShapeElement,
  createTextElement,
} from "./elements";
import {
  cloneElementsAt,
  getElementAtPoint,
  getElementBounds,
  getElementsInLayerOrder,
  getElementsIntersectingRect,
} from "./selection";

describe("selection", () => {
  it("finds the latest element at a point when layers match", () => {
    const rectangle = createShapeElement("rectangle", { x: 0, y: 0 }, { x: 80, y: 80 });
    const text = createTextElement({ x: 10, y: 10 }, "note");

    expect(getElementAtPoint([rectangle, text], { x: 20, y: 20 })?.id).toBe(text.id);
  });

  it("uses higher layers for hit-test priority", () => {
    const lowerText = { ...createTextElement({ x: 10, y: 10 }, "lower"), layer: 1 };
    const higherText = { ...createTextElement({ x: 10, y: 10 }, "higher"), layer: 5 };

    expect(getElementAtPoint([higherText, lowerText], { x: 20, y: 20 })?.id).toBe(higherText.id);
    expect(getElementsInLayerOrder([higherText, lowerText]).map((element) => element.id)).toEqual([
      lowerText.id,
      higherText.id,
    ]);
  });

  it("selects an unfilled rectangle only by its border", () => {
    const rectangle = createShapeElement("rectangle", { x: 0, y: 0 }, { x: 80, y: 60 });

    expect(getElementAtPoint([rectangle], { x: 40, y: 30 })).toBeUndefined();
    expect(getElementAtPoint([rectangle], { x: 2, y: 30 })?.id).toBe(rectangle.id);
  });

  it("selects a filled rectangle by its full area", () => {
    const rectangle = createShapeElement("rectangle", { x: 0, y: 0 }, { x: 80, y: 60 });
    const filledRectangle = {
      ...rectangle,
      style: {
        ...rectangle.style,
        fill: "#ffffff",
      },
    };

    expect(getElementAtPoint([filledRectangle], { x: 40, y: 30 })?.id).toBe(rectangle.id);
  });

  it("hit-tests a transparent rounded rectangle only along its rounded border", () => {
    const rectangle = createShapeElement("rectangle", { x: 0, y: 0 }, { x: 80, y: 60 });
    const roundedRectangle = {
      ...rectangle,
      style: { ...rectangle.style, borderRadius: 16 as const },
    };

    expect(getElementAtPoint([roundedRectangle], { x: 0, y: 0 }, 1)).toBeUndefined();
    expect(getElementAtPoint([roundedRectangle], { x: 4, y: 4 }, 1)?.id).toBe(rectangle.id);
    expect(getElementAtPoint([roundedRectangle], { x: 40, y: 30 }, 1)).toBeUndefined();
  });

  it("excludes clipped corners from filled rounded rectangles", () => {
    const rectangle = createShapeElement("rectangle", { x: 0, y: 0 }, { x: 80, y: 60 });
    const roundedRectangle = {
      ...rectangle,
      style: { ...rectangle.style, fill: "#ffffff", borderRadius: 16 as const },
    };

    expect(getElementAtPoint([roundedRectangle], { x: 0, y: 0 }, 0)).toBeUndefined();
    expect(getElementAtPoint([roundedRectangle], { x: 5, y: 5 }, 0)?.id).toBe(rectangle.id);
    expect(getElementAtPoint([roundedRectangle], { x: 40, y: 30 }, 0)?.id).toBe(rectangle.id);
  });

  it("hit-tests rounded diamonds while preserving their selectable interior", () => {
    const diamond = createShapeElement("diamond", { x: 0, y: 0 }, { x: 100, y: 60 });
    const roundedDiamond = {
      ...diamond,
      style: { ...diamond.style, borderRadius: 16 as const },
    };

    expect(getElementAtPoint([roundedDiamond], { x: 50, y: 0 }, 1)).toBeUndefined();
    expect(getElementAtPoint([roundedDiamond], { x: 50, y: 30 }, 0)?.id).toBe(diamond.id);
  });

  it("hit-tests ellipses by their curved geometry", () => {
    const ellipse = createShapeElement("ellipse", { x: 0, y: 0 }, { x: 120, y: 60 });

    expect(getElementAtPoint([ellipse], { x: 60, y: 30 })?.id).toBe(ellipse.id);
    expect(getElementAtPoint([ellipse], { x: 60, y: 0 })?.id).toBe(ellipse.id);
    expect(getElementAtPoint([ellipse], { x: 0, y: 0 })).toBeUndefined();
  });

  it("selects elements that intersect an area", () => {
    const rectangle = createShapeElement("rectangle", { x: 0, y: 0 }, { x: 80, y: 80 });
    const arrow = createArrowElement([
      { x: 160, y: 160 },
      { x: 210, y: 160 },
      { x: 260, y: 160 },
    ]);

    expect(
      getElementsIntersectingRect([rectangle, arrow], {
        x: -10,
        y: -10,
        width: 120,
        height: 120,
      }).map((element) => element.id),
    ).toEqual([rectangle.id]);
  });

  it("hit-tests multi-point arrows through their line segments", () => {
    const arrow = createArrowElement([
      { x: 0, y: 0 },
      { x: 50, y: 50 },
      { x: 100, y: 0 },
      { x: 140, y: 40 },
    ]);

    expect(getElementAtPoint([arrow], { x: 50, y: 50 }, 4)?.id).toBe(arrow.id);
    expect(getElementAtPoint([arrow], { x: 50, y: 0 }, 4)).toBeUndefined();
  });

  it("hit-tests the visible arrow curve instead of its old straight chords", () => {
    const arrow = createArrowElement([
      { x: 0, y: 0 },
      { x: 50, y: 100 },
      { x: 100, y: 0 },
    ]);

    expect(getElementAtPoint([arrow], { x: 21.875, y: 56.25 }, 2)?.id).toBe(arrow.id);
    expect(getElementAtPoint([arrow], { x: 25, y: 50 }, 2)).toBeUndefined();
  });

  it("includes arrow points in bounds and clones", () => {
    const arrow = createArrowElement([
      { x: 0, y: 0 },
      { x: 50, y: 50 },
      { x: 100, y: 0 },
    ]);
    const [clone] = cloneElementsAt([arrow], { x: 10, y: 20 });

    expect(getElementBounds(arrow).height).toBeGreaterThanOrEqual(50);
    expect(clone?.type === "arrow" ? clone.points[1] : undefined).toEqual({ x: 60, y: 70 });
  });

  it("clones selected elements to the target cursor position", () => {
    const brush = createBrushElement({ x: 10, y: 10 });
    brush.points = [
      { x: 10, y: 10 },
      { x: 30, y: 20 },
    ];

    const [clone] = cloneElementsAt([brush], { x: 100, y: 100 });

    expect(clone?.id).not.toBe(brush.id);
    expect(getElementBounds(clone!)).toEqual({ x: 100, y: 100, width: 20, height: 10 });
  });
});

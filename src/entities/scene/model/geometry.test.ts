import { describe, expect, it } from "vitest";
import {
  constrainToSquareDelta,
  getArrowHead,
  getArrowHeadSegment,
  getDiamondPoints,
  normalizeRect,
  screenToWorld,
  shouldAppendPoint,
} from "./geometry";

describe("geometry", () => {
  it("converts screen coordinates to world coordinates", () => {
    expect(screenToWorld({ x: 140, y: 90 }, { x: 40, y: -10, zoom: 2 })).toEqual({
      x: 50,
      y: 50,
    });
  });

  it("normalizes rectangles with negative dimensions", () => {
    expect(normalizeRect({ x: 20, y: 30, width: -10, height: -15 })).toEqual({
      x: 10,
      y: 15,
      width: 10,
      height: 15,
    });
  });

  it("builds diamond points from a normalized rectangle", () => {
    expect(getDiamondPoints({ x: 0, y: 0, width: 20, height: 10 })).toEqual([
      { x: 10, y: 0 },
      { x: 20, y: 5 },
      { x: 10, y: 10 },
      { x: 0, y: 5 },
    ]);
  });

  it("skips dense brush points", () => {
    expect(shouldAppendPoint([{ x: 0, y: 0 }], { x: 1, y: 1 }, 3)).toBe(false);
    expect(shouldAppendPoint([{ x: 0, y: 0 }], { x: 3, y: 4 }, 3)).toBe(true);
  });

  it("keeps constrained shapes square in every drag direction", () => {
    expect(constrainToSquareDelta(120, 80)).toEqual({ width: 120, height: 120 });
    expect(constrainToSquareDelta(-30, 50)).toEqual({ width: -50, height: 50 });
  });

  it("creates two arrowhead points", () => {
    expect(getArrowHead({ x: 0, y: 0 }, { x: 40, y: 0 })).toHaveLength(2);
  });

  it("uses the last non-zero arrow segment for the arrowhead", () => {
    expect(
      getArrowHeadSegment([
        { x: 0, y: 0 },
        { x: 40, y: 20 },
        { x: 40, y: 20 },
      ]),
    ).toEqual([
      { x: 0, y: 0 },
      { x: 40, y: 20 },
    ]);
  });
});

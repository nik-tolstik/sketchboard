import { describe, expect, it } from "vitest";
import {
  MAX_VIEWPORT_ZOOM,
  MIN_VIEWPORT_ZOOM,
  clampViewportZoom,
  clampShapeBorderRadius,
  constrainToSquareDelta,
  getArrowCurveBounds,
  getArrowCurvePoints,
  getArrowCurveSegments,
  getArrowHead,
  getArrowHeadSegment,
  getDiamondPoints,
  getPointOnCubicBezier,
  getRoundedContourPoints,
  getRoundedShapeContour,
  normalizeRect,
  screenToWorld,
  shouldAppendPoint,
  worldToScreen,
  zoomViewportAtScreenPoint,
} from "./geometry";

describe("geometry", () => {
  it("converts screen coordinates to world coordinates", () => {
    expect(screenToWorld({ x: 140, y: 90 }, { x: 40, y: -10, zoom: 2 })).toEqual({
      x: 50,
      y: 50,
    });
  });

  it("clamps viewport zoom to the supported range", () => {
    expect(clampViewportZoom(0)).toBe(MIN_VIEWPORT_ZOOM);
    expect(clampViewportZoom(0.1)).toBe(MIN_VIEWPORT_ZOOM);
    expect(clampViewportZoom(8)).toBe(MAX_VIEWPORT_ZOOM);
    expect(clampViewportZoom(Number.NaN)).toBe(1);
  });

  it("zooms a viewport around a fixed screen point", () => {
    const viewport = { x: 40, y: -10, zoom: 2 };
    const screenPoint = { x: 140, y: 90 };
    const worldPoint = screenToWorld(screenPoint, viewport);
    const nextViewport = zoomViewportAtScreenPoint(viewport, screenPoint, 3);

    expect(nextViewport.zoom).toBe(3);
    expect(worldToScreen(worldPoint, nextViewport)).toEqual(screenPoint);
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

  it("keeps zero-radius rectangle and diamond contours sharp", () => {
    const rectangle = getRoundedShapeContour(
      "rectangle",
      { x: 20, y: 10, width: -20, height: 10 },
      0,
    );
    const diamond = getRoundedShapeContour("diamond", { x: 0, y: 0, width: 20, height: 10 }, 0);

    expect(getRoundedContourPoints(rectangle)).toEqual([
      { x: 0, y: 10 },
      { x: 20, y: 10 },
      { x: 20, y: 20 },
      { x: 0, y: 20 },
    ]);
    expect(getRoundedContourPoints(diamond)).toEqual(
      getDiamondPoints({ x: 0, y: 0, width: 20, height: 10 }),
    );
    expect(rectangle.segments.every((segment) => segment.type === "line")).toBe(true);
    expect(diamond.segments.every((segment) => segment.type === "line")).toBe(true);
  });

  it("builds rounded rectangle and diamond contours from line and quadratic segments", () => {
    const rectangle = getRoundedShapeContour(
      "rectangle",
      { x: 0, y: 0, width: 100, height: 60 },
      16,
    );
    const diamond = getRoundedShapeContour("diamond", { x: 0, y: 0, width: 100, height: 60 }, 16);

    expect(rectangle.start).toEqual({ x: 16, y: 0 });
    expect(rectangle.segments.slice(0, 2)).toEqual([
      { type: "line", end: { x: 84, y: 0 } },
      { type: "quadratic", control: { x: 100, y: 0 }, end: { x: 100, y: 16 } },
    ]);
    expect(diamond.segments.filter((segment) => segment.type === "quadratic")).toHaveLength(4);
    expect(getRoundedContourPoints(diamond)).not.toContainEqual({ x: 50, y: 0 });
  });

  it("clamps border radius to the available shape size", () => {
    const smallRectangle = getRoundedShapeContour(
      "rectangle",
      { x: 0, y: 0, width: 12, height: 8 },
      16,
    );

    expect(clampShapeBorderRadius({ x: 0, y: 0, width: 12, height: 8 }, 16)).toBe(4);
    expect(clampShapeBorderRadius({ x: 0, y: 0, width: -12, height: -8 }, 16)).toBe(4);
    expect(clampShapeBorderRadius({ x: 0, y: 0, width: 12, height: 8 }, Number.NaN)).toBe(0);
    expect(smallRectangle.radius).toBe(4);
    expect(smallRectangle.start).toEqual({ x: 4, y: 0 });
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

  it("builds a smooth arrow curve that passes through every point", () => {
    const points = [
      { x: 0, y: 0 },
      { x: 50, y: 100 },
      { x: 100, y: 0 },
    ];
    const segments = getArrowCurveSegments(points);
    const sampledPoints = getArrowCurvePoints(points);

    expect(segments).toHaveLength(2);
    expect(sampledPoints).toContainEqual(points[0]);
    expect(sampledPoints).toContainEqual(points[1]);
    expect(sampledPoints).toContainEqual(points[2]);
    expect(getPointOnCubicBezier(segments[0]!, 0.5)).toEqual({ x: 21.875, y: 56.25 });
    expect(segments[0]?.control2.y).toBe(segments[1]?.control1.y);
  });

  it("keeps collinear arrows straight", () => {
    const sampledPoints = getArrowCurvePoints([
      { x: 0, y: 20 },
      { x: 40, y: 20 },
      { x: 100, y: 20 },
    ]);

    for (const point of sampledPoints) {
      expect(point.y).toBeCloseTo(20);
    }
  });

  it("ignores repeated arrow points without producing invalid geometry", () => {
    const segments = getArrowCurveSegments([
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 50, y: 40 },
      { x: 50, y: 40 },
      { x: 100, y: 0 },
    ]);

    expect(segments).toHaveLength(2);
    expect(
      segments.every((segment) =>
        Object.values(segment).every(
          (point) => Number.isFinite(point.x) && Number.isFinite(point.y),
        ),
      ),
    ).toBe(true);
  });

  it("uses the final curve tangent for the arrowhead", () => {
    const points = [
      { x: 0, y: 0 },
      { x: 50, y: 100 },
      { x: 100, y: 0 },
    ];
    const finalSegment = getArrowCurveSegments(points).at(-1)!;

    expect(getArrowHeadSegment(points)).toEqual([finalSegment.control2, finalSegment.end]);
  });

  it("includes curved extrema in arrow bounds", () => {
    const points = [
      { x: 0, y: 0 },
      { x: 40, y: 100 },
      { x: 80, y: -100 },
      { x: 120, y: 0 },
    ];
    const bounds = getArrowCurveBounds(points);
    const sampledPoints = getArrowCurvePoints(points);

    expect(
      sampledPoints.every((point) => point.x >= bounds.x && point.x <= bounds.x + bounds.width),
    ).toBe(true);
    expect(
      sampledPoints.every((point) => point.y >= bounds.y && point.y <= bounds.y + bounds.height),
    ).toBe(true);
  });
});

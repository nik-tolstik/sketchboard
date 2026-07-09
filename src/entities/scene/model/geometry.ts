import type { Point, Viewport } from "./elements";

export const MIN_VIEWPORT_ZOOM = 0.25;
export const MAX_VIEWPORT_ZOOM = 4;
export const ZOOM_STEP = 1.2;

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const clampViewportZoom = (zoom: number): number => {
  if (!Number.isFinite(zoom)) {
    return 1;
  }

  return Math.min(MAX_VIEWPORT_ZOOM, Math.max(MIN_VIEWPORT_ZOOM, zoom));
};

export const screenToWorld = (point: Point, viewport: Viewport): Point => ({
  x: (point.x - viewport.x) / viewport.zoom,
  y: (point.y - viewport.y) / viewport.zoom,
});

export const worldToScreen = (point: Point, viewport: Viewport): Point => ({
  x: point.x * viewport.zoom + viewport.x,
  y: point.y * viewport.zoom + viewport.y,
});

export const zoomViewportAtScreenPoint = (
  viewport: Viewport,
  screenPoint: Point,
  nextZoom: number,
): Viewport => {
  const currentViewport = {
    ...viewport,
    zoom: clampViewportZoom(viewport.zoom),
  };
  const worldPoint = screenToWorld(screenPoint, currentViewport);
  const zoom = clampViewportZoom(nextZoom);

  return {
    x: screenPoint.x - worldPoint.x * zoom,
    y: screenPoint.y - worldPoint.y * zoom,
    zoom,
  };
};

export const normalizeRect = (rect: Rect): Rect => {
  const x = rect.width < 0 ? rect.x + rect.width : rect.x;
  const y = rect.height < 0 ? rect.y + rect.height : rect.y;

  return {
    x,
    y,
    width: Math.abs(rect.width),
    height: Math.abs(rect.height),
  };
};

export const distance = (a: Point, b: Point): number => Math.hypot(a.x - b.x, a.y - b.y);

export const distanceToSegment = (point: Point, start: Point, end: Point): number => {
  const segmentLengthSquared = (end.x - start.x) ** 2 + (end.y - start.y) ** 2;

  if (segmentLengthSquared === 0) {
    return distance(point, start);
  }

  const rawProjection =
    ((point.x - start.x) * (end.x - start.x) + (point.y - start.y) * (end.y - start.y)) /
    segmentLengthSquared;
  const projection = Math.max(0, Math.min(1, rawProjection));
  const closest = {
    x: start.x + projection * (end.x - start.x),
    y: start.y + projection * (end.y - start.y),
  };

  return distance(point, closest);
};

export const shouldAppendPoint = (points: Point[], candidate: Point, minDistance = 2): boolean => {
  const previous = points.at(-1);

  return previous === undefined || distance(previous, candidate) >= minDistance;
};

export const constrainToSquareDelta = (
  width: number,
  height: number,
): { width: number; height: number } => {
  const side = Math.max(Math.abs(width), Math.abs(height));

  return {
    width: Math.sign(width || 1) * side,
    height: Math.sign(height || 1) * side,
  };
};

export const getDiamondPoints = (rect: Rect): Point[] => {
  const normalized = normalizeRect(rect);
  const centerX = normalized.x + normalized.width / 2;
  const centerY = normalized.y + normalized.height / 2;

  return [
    { x: centerX, y: normalized.y },
    { x: normalized.x + normalized.width, y: centerY },
    { x: centerX, y: normalized.y + normalized.height },
    { x: normalized.x, y: centerY },
  ];
};

export const getArrowHeadSegment = (points: Point[]): [Point, Point] | undefined => {
  const end = points.at(-1);

  if (!end) {
    return undefined;
  }

  for (let index = points.length - 2; index >= 0; index -= 1) {
    const start = points[index];

    if (start && distance(start, end) > 0.001) {
      return [start, end];
    }
  }

  return undefined;
};

export const getArrowHead = (
  start: Point,
  end: Point,
  length = 18,
  angle = Math.PI / 7,
): Point[] => {
  const direction = Math.atan2(end.y - start.y, end.x - start.x);

  return [
    {
      x: end.x - length * Math.cos(direction - angle),
      y: end.y - length * Math.sin(direction - angle),
    },
    {
      x: end.x - length * Math.cos(direction + angle),
      y: end.y - length * Math.sin(direction + angle),
    },
  ];
};

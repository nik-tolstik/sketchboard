import {
  DEFAULT_LAYER,
  DEFAULT_VIEWPORT,
  MIN_ARROW_POINTS,
  type DrawingElement,
  type Point,
  type SceneSnapshot,
} from "./elements";
import { clampViewportZoom } from "./geometry";

const finiteOrDefault = (value: unknown, fallback: number): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const pointOrDefault = (value: unknown, fallback: Point): Point => {
  if (!value || typeof value !== "object") {
    return fallback;
  }

  const record = value as Record<string, unknown>;

  return {
    x: finiteOrDefault(record.x, fallback.x),
    y: finiteOrDefault(record.y, fallback.y),
  };
};

const getMiddlePoint = (start: Point, end: Point): Point => ({
  x: (start.x + end.x) / 2,
  y: (start.y + end.y) / 2,
});

const normalizeArrowPoints = (element: Record<string, unknown>): Point[] => {
  const rawPoints = element.points;

  if (Array.isArray(rawPoints) && rawPoints.length > 0) {
    const points = rawPoints.map((point, index) =>
      pointOrDefault(
        point,
        index > 0 ? pointOrDefault(rawPoints[index - 1], { x: 0, y: 0 }) : { x: 0, y: 0 },
      ),
    );

    return ensureMinimumArrowPoints(points);
  }

  const start = pointOrDefault(element.start, { x: 0, y: 0 });
  const end = pointOrDefault(element.end, start);
  const middle = pointOrDefault(element.middle, getMiddlePoint(start, end));

  return [start, middle, end];
};

const ensureMinimumArrowPoints = (points: Point[]): Point[] => {
  if (points.length >= MIN_ARROW_POINTS) {
    return points;
  }

  if (points.length === 2) {
    const [start, end] = points;

    if (start && end) {
      return [start, getMiddlePoint(start, end), end];
    }
  }

  const fallback = points[0] ?? { x: 0, y: 0 };

  return Array.from({ length: MIN_ARROW_POINTS }, () => ({ ...fallback }));
};

const normalizeElement = (
  element: DrawingElement | Record<string, unknown>,
  layerFallback: number,
): DrawingElement => {
  const migratedElement =
    element.type === "rectangle"
      ? { ...element, type: "square" }
      : element.type === "ellipse"
        ? { ...element, type: "circle" }
        : element;

  if (migratedElement.type === "arrow") {
    const migratedArrow = migratedElement as Record<string, unknown>;
    const arrowElement = { ...migratedArrow };

    delete arrowElement.start;
    delete arrowElement.middle;
    delete arrowElement.end;

    return {
      ...arrowElement,
      points: normalizeArrowPoints(migratedArrow),
      layer: finiteOrDefault(migratedArrow.layer, layerFallback),
    } as DrawingElement;
  }

  return {
    ...migratedElement,
    layer: finiteOrDefault(migratedElement.layer, layerFallback),
  } as DrawingElement;
};

const normalizeElements = (elements: Array<DrawingElement | Record<string, unknown>>) => {
  let nextLayer = DEFAULT_LAYER;

  return elements.map((element) => {
    const normalizedElement = normalizeElement(element, nextLayer);
    nextLayer = Math.max(nextLayer, normalizedElement.layer + 1);

    return normalizedElement;
  });
};

export const createEmptyScene = (): SceneSnapshot => ({
  version: 1,
  elements: [],
  viewport: { ...DEFAULT_VIEWPORT },
  updatedAt: Date.now(),
});

export const normalizeScene = (scene: Partial<SceneSnapshot> | null | undefined): SceneSnapshot => {
  if (!scene || scene.version !== 1 || !Array.isArray(scene.elements)) {
    return createEmptyScene();
  }

  const viewport = scene.viewport;

  return {
    version: 1,
    elements: normalizeElements(scene.elements as Array<Record<string, unknown>>),
    viewport: {
      x: finiteOrDefault(viewport?.x, DEFAULT_VIEWPORT.x),
      y: finiteOrDefault(viewport?.y, DEFAULT_VIEWPORT.y),
      zoom: clampViewportZoom(finiteOrDefault(viewport?.zoom, DEFAULT_VIEWPORT.zoom)),
    },
    updatedAt: finiteOrDefault(scene.updatedAt, Date.now()),
  };
};

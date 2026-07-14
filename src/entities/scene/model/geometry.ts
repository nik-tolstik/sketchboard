import { TEXT_CONTENT_INSET_Y, type Point, type ShapeElement, type Viewport } from "./elements";

export const MIN_VIEWPORT_ZOOM = 0.25;
export const MAX_VIEWPORT_ZOOM = 4;
export const ZOOM_STEP = 1.2;

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CubicBezierSegment = {
  start: Point;
  control1: Point;
  control2: Point;
  end: Point;
};

export type RoundedContourSegment =
  | {
      type: "line";
      end: Point;
    }
  | {
      type: "quadratic";
      control: Point;
      end: Point;
    };

export type RoundedContour = {
  start: Point;
  segments: RoundedContourSegment[];
  radius: number;
};

export type RoundedShapeType = "rectangle" | "diamond";

const ARROW_CURVE_SAMPLE_STEP = 8;

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

export const getShapeTextBox = (element: ShapeElement): Rect => {
  const rect = normalizeRect(element);
  const widthScale =
    element.type === "diamond" ? 0.5 : element.type === "ellipse" ? Math.SQRT1_2 : 1;
  const heightScale = widthScale;
  const width = Math.max(1, rect.width * widthScale);
  const height = Math.max(1, rect.height * heightScale);

  return {
    x: rect.x + (rect.width - width) / 2,
    y: rect.y + (rect.height - height) / 2,
    width,
    height,
  };
};

export const getVerticallyCenteredTextTop = (textBox: Rect, textHeight: number): number =>
  textBox.y + Math.max(TEXT_CONTENT_INSET_Y, (textBox.height - Math.max(0, textHeight)) / 2);

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

export const clampShapeBorderRadius = (rect: Rect, radius: number): number => {
  if (!Number.isFinite(radius) || radius <= 0) {
    return 0;
  }

  const normalized = normalizeRect(rect);

  return Math.min(radius, normalized.width / 2, normalized.height / 2);
};

const getRectanglePoints = (rect: Rect): Point[] => {
  const normalized = normalizeRect(rect);

  return [
    { x: normalized.x, y: normalized.y },
    { x: normalized.x + normalized.width, y: normalized.y },
    { x: normalized.x + normalized.width, y: normalized.y + normalized.height },
    { x: normalized.x, y: normalized.y + normalized.height },
  ];
};

const moveTowards = (start: Point, target: Point, amount: number): Point => {
  const length = distance(start, target);

  if (length === 0) {
    return { ...start };
  }

  const progress = Math.min(1, amount / length);

  return {
    x: start.x + (target.x - start.x) * progress,
    y: start.y + (target.y - start.y) * progress,
  };
};

export const getRoundedShapeContour = (
  type: RoundedShapeType,
  rect: Rect,
  radius: number,
): RoundedContour => {
  const normalized = normalizeRect(rect);
  const vertices =
    type === "diamond" ? getDiamondPoints(normalized) : getRectanglePoints(normalized);
  const clampedRadius = clampShapeBorderRadius(normalized, radius);
  const firstVertex = vertices[0] ?? { x: normalized.x, y: normalized.y };

  if (clampedRadius === 0) {
    return {
      start: firstVertex,
      segments: vertices.slice(1).map((end) => ({ type: "line", end })),
      radius: 0,
    };
  }

  const corners = vertices.map((vertex, index) => {
    const previous = vertices[(index - 1 + vertices.length) % vertices.length] ?? vertex;
    const next = vertices[(index + 1) % vertices.length] ?? vertex;
    const inset = Math.min(
      clampedRadius,
      distance(previous, vertex) / 2,
      distance(vertex, next) / 2,
    );

    return {
      vertex,
      entry: moveTowards(vertex, previous, inset),
      exit: moveTowards(vertex, next, inset),
    };
  });
  const firstCorner = corners[0];

  if (!firstCorner) {
    return { start: firstVertex, segments: [], radius: clampedRadius };
  }

  const orderedCorners = [...corners.slice(1), firstCorner];

  return {
    start: firstCorner.exit,
    segments: orderedCorners.flatMap<RoundedContourSegment>((corner) => [
      { type: "line", end: corner.entry },
      { type: "quadratic", control: corner.vertex, end: corner.exit },
    ]),
    radius: clampedRadius,
  };
};

export const getRoundedContourPoints = (
  contour: RoundedContour,
  curveSubdivisions = 8,
): Point[] => {
  const points: Point[] = [{ ...contour.start }];
  let current = contour.start;
  const subdivisions = Math.max(1, Math.floor(curveSubdivisions));

  for (const segment of contour.segments) {
    if (segment.type === "line") {
      points.push({ ...segment.end });
    } else {
      for (let step = 1; step <= subdivisions; step += 1) {
        const progress = step / subdivisions;
        const remaining = 1 - progress;

        points.push({
          x:
            remaining ** 2 * current.x +
            2 * remaining * progress * segment.control.x +
            progress ** 2 * segment.end.x,
          y:
            remaining ** 2 * current.y +
            2 * remaining * progress * segment.control.y +
            progress ** 2 * segment.end.y,
        });
      }
    }

    current = segment.end;
  }

  if (points.length > 1 && distance(points[0]!, points.at(-1)!) < 0.001) {
    points.pop();
  }

  return points;
};

const getUniqueConsecutivePoints = (points: Point[]): Point[] =>
  points.reduce<Point[]>((uniquePoints, point) => {
    const previous = uniquePoints.at(-1);

    if (!previous || distance(previous, point) > 0.001) {
      uniquePoints.push(point);
    }

    return uniquePoints;
  }, []);

export const getArrowCurveSegments = (points: Point[]): CubicBezierSegment[] => {
  const curvePoints = getUniqueConsecutivePoints(points);

  return curvePoints.slice(0, -1).map((start, index) => {
    const previous = curvePoints[index - 1] ?? start;
    const end = curvePoints[index + 1] ?? start;
    const next = curvePoints[index + 2] ?? end;

    return {
      start,
      control1: {
        x: start.x + (end.x - previous.x) / 6,
        y: start.y + (end.y - previous.y) / 6,
      },
      control2: {
        x: end.x - (next.x - start.x) / 6,
        y: end.y - (next.y - start.y) / 6,
      },
      end,
    };
  });
};

export const getPointOnCubicBezier = (segment: CubicBezierSegment, t: number): Point => {
  const progress = Math.min(1, Math.max(0, t));
  const remaining = 1 - progress;

  return {
    x:
      remaining ** 3 * segment.start.x +
      3 * remaining ** 2 * progress * segment.control1.x +
      3 * remaining * progress ** 2 * segment.control2.x +
      progress ** 3 * segment.end.x,
    y:
      remaining ** 3 * segment.start.y +
      3 * remaining ** 2 * progress * segment.control1.y +
      3 * remaining * progress ** 2 * segment.control2.y +
      progress ** 3 * segment.end.y,
  };
};

export const getArrowCurvePoints = (points: Point[]): Point[] => {
  const segments = getArrowCurveSegments(points);
  const firstSegment = segments[0];

  if (!firstSegment) {
    return points[0] ? [{ ...points[0] }] : [];
  }

  const sampledPoints: Point[] = [{ ...firstSegment.start }];

  for (const segment of segments) {
    const controlPolygonLength =
      distance(segment.start, segment.control1) +
      distance(segment.control1, segment.control2) +
      distance(segment.control2, segment.end);
    const subdivisions = Math.max(4, Math.ceil(controlPolygonLength / ARROW_CURVE_SAMPLE_STEP));

    for (let step = 1; step <= subdivisions; step += 1) {
      sampledPoints.push(getPointOnCubicBezier(segment, step / subdivisions));
    }
  }

  return sampledPoints;
};

const getCubicBezierExtrema = (
  start: number,
  control1: number,
  control2: number,
  end: number,
): number[] => {
  const a = -start + 3 * control1 - 3 * control2 + end;
  const b = 2 * (start - 2 * control1 + control2);
  const c = control1 - start;

  if (Math.abs(a) < 0.000001) {
    if (Math.abs(b) < 0.000001) {
      return [];
    }

    const t = -c / b;
    return t > 0 && t < 1 ? [t] : [];
  }

  const discriminant = b ** 2 - 4 * a * c;

  if (discriminant < 0) {
    return [];
  }

  const root = Math.sqrt(discriminant);

  return [(-b + root) / (2 * a), (-b - root) / (2 * a)].filter((t) => t > 0 && t < 1);
};

export const getArrowCurveBounds = (points: Point[]): Rect => {
  const segments = getArrowCurveSegments(points);

  if (segments.length === 0) {
    const point = points[0] ?? { x: 0, y: 0 };
    return { x: point.x, y: point.y, width: 0, height: 0 };
  }

  const boundsPoints = segments.flatMap((segment) => {
    const xExtrema = getCubicBezierExtrema(
      segment.start.x,
      segment.control1.x,
      segment.control2.x,
      segment.end.x,
    );
    const yExtrema = getCubicBezierExtrema(
      segment.start.y,
      segment.control1.y,
      segment.control2.y,
      segment.end.y,
    );

    return [
      segment.start,
      segment.end,
      ...xExtrema.map((t) => getPointOnCubicBezier(segment, t)),
      ...yExtrema.map((t) => getPointOnCubicBezier(segment, t)),
    ];
  });
  const minX = Math.min(...boundsPoints.map((point) => point.x));
  const minY = Math.min(...boundsPoints.map((point) => point.y));
  const maxX = Math.max(...boundsPoints.map((point) => point.x));
  const maxY = Math.max(...boundsPoints.map((point) => point.y));

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
};

export const getArrowHeadSegment = (points: Point[]): [Point, Point] | undefined => {
  const finalSegment = getArrowCurveSegments(points).at(-1);

  return finalSegment ? [finalSegment.control2, finalSegment.end] : undefined;
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

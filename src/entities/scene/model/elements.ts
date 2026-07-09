export type DrawingElementType = "brush" | "text" | "rectangle" | "diamond" | "ellipse" | "arrow";
export type Tool = "pan" | "select" | DrawingElementType;

export type Point = {
  x: number;
  y: number;
};

export type Viewport = {
  x: number;
  y: number;
  zoom: number;
};

export type ElementStyle = {
  stroke: string;
  fill: string;
  lineWidth: number;
  roughness: number;
};

export type BaseElement = {
  id: string;
  type: DrawingElementType;
  layer: number;
  createdAt: number;
  updatedAt: number;
  style: ElementStyle;
};

export type BrushElement = BaseElement & {
  type: "brush";
  points: Point[];
};

export type TextElement = BaseElement & {
  type: "text";
  x: number;
  y: number;
  text: string;
  fontSize: number;
  width: number;
};

export type ShapeElement = BaseElement & {
  type: "rectangle" | "diamond" | "ellipse";
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ArrowElement = BaseElement & {
  type: "arrow";
  points: Point[];
};

export type DrawingElement = BrushElement | TextElement | ShapeElement | ArrowElement;

export type SceneSnapshot = {
  version: 1;
  elements: DrawingElement[];
  viewport: Viewport;
  updatedAt: number;
};

export const DEFAULT_STYLE: ElementStyle = {
  stroke: "#171717",
  fill: "rgba(255, 255, 255, 0)",
  lineWidth: 2,
  roughness: 0.55,
};

export const DEFAULT_VIEWPORT: Viewport = {
  x: 0,
  y: 0,
  zoom: 1,
};

export const DEFAULT_LAYER = 0;
export const MIN_ARROW_POINTS = 3;
export const DEFAULT_TEXT_FONT_SIZE = 24;
export const TEXT_CONTENT_INSET_X = 3;
export const TEXT_CONTENT_INSET_Y = 5;
export const TEXT_LINE_HEIGHT = 1.3;
export const TEXT_MIN_WIDTH = 120;
export const TEXT_WIDTH_RATIO = 0.62;
export const TEXT_WIDTH_PADDING = 14;

export const getTextElementWidth = (text: string, fontSize = DEFAULT_TEXT_FONT_SIZE): number => {
  const longestLineLength = Math.max(1, ...text.split("\n").map((line) => line.length));

  return Math.max(
    TEXT_MIN_WIDTH,
    longestLineLength * fontSize * TEXT_WIDTH_RATIO + TEXT_WIDTH_PADDING,
  );
};

export const getTextElementHeight = (text: string, fontSize = DEFAULT_TEXT_FONT_SIZE): number =>
  text.split("\n").length * fontSize * TEXT_LINE_HEIGHT + TEXT_CONTENT_INSET_Y;

export const createElementId = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `element-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const now = (): number => Date.now();

export const createBrushElement = (point: Point, layer = DEFAULT_LAYER): BrushElement => {
  const timestamp = now();

  return {
    id: createElementId(),
    type: "brush",
    layer,
    points: [point],
    createdAt: timestamp,
    updatedAt: timestamp,
    style: { ...DEFAULT_STYLE, lineWidth: 2.25 },
  };
};

export const createTextElement = (
  point: Point,
  text: string,
  layer = DEFAULT_LAYER,
): TextElement => {
  const timestamp = now();

  return {
    id: createElementId(),
    type: "text",
    layer,
    x: point.x,
    y: point.y,
    text,
    fontSize: DEFAULT_TEXT_FONT_SIZE,
    width: getTextElementWidth(text),
    createdAt: timestamp,
    updatedAt: timestamp,
    style: { ...DEFAULT_STYLE },
  };
};

export const updateTextElementText = (element: TextElement, text: string): TextElement => ({
  ...element,
  text,
  width: getTextElementWidth(text, element.fontSize),
  updatedAt: now(),
});

export const updateArrowPoint = (
  element: ArrowElement,
  pointIndex: number,
  point: Point,
): ArrowElement => ({
  ...element,
  points: element.points.map((currentPoint, index) =>
    index === pointIndex ? point : currentPoint,
  ),
  updatedAt: now(),
});

export const createShapeElement = (
  type: ShapeElement["type"],
  origin: Point,
  target: Point,
  layer = DEFAULT_LAYER,
): ShapeElement => {
  const timestamp = now();

  return {
    id: createElementId(),
    type,
    layer,
    x: origin.x,
    y: origin.y,
    width: target.x - origin.x,
    height: target.y - origin.y,
    createdAt: timestamp,
    updatedAt: timestamp,
    style: { ...DEFAULT_STYLE, lineWidth: 2 },
  };
};

export const createArrowElement = (points: Point[], layer = DEFAULT_LAYER): ArrowElement => {
  const timestamp = now();

  return {
    id: createElementId(),
    type: "arrow",
    layer,
    points: points.map((point) => ({ ...point })),
    createdAt: timestamp,
    updatedAt: timestamp,
    style: { ...DEFAULT_STYLE, lineWidth: 2.2 },
  };
};

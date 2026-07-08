export type Tool = "select" | "brush" | "text" | "square" | "diamond" | "circle" | "arrow";

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
  type: Tool;
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
  type: "square" | "diamond" | "circle";
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ArrowElement = BaseElement & {
  type: "arrow";
  start: Point;
  end: Point;
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

const MIN_TEXT_WIDTH = 120;
const TEXT_WIDTH_RATIO = 14 / 24;

export const getTextElementWidth = (text: string, fontSize = 24): number => {
  const longestLineLength = Math.max(1, ...text.split("\n").map((line) => line.length));

  return Math.max(MIN_TEXT_WIDTH, longestLineLength * fontSize * TEXT_WIDTH_RATIO);
};

export const createElementId = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `element-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const now = (): number => Date.now();

export const createBrushElement = (point: Point): BrushElement => {
  const timestamp = now();

  return {
    id: createElementId(),
    type: "brush",
    points: [point],
    createdAt: timestamp,
    updatedAt: timestamp,
    style: { ...DEFAULT_STYLE, lineWidth: 2.25 },
  };
};

export const createTextElement = (point: Point, text: string): TextElement => {
  const timestamp = now();

  return {
    id: createElementId(),
    type: "text",
    x: point.x,
    y: point.y,
    text,
    fontSize: 24,
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

export const createShapeElement = (
  type: ShapeElement["type"],
  origin: Point,
  target: Point,
): ShapeElement => {
  const timestamp = now();

  return {
    id: createElementId(),
    type,
    x: origin.x,
    y: origin.y,
    width: target.x - origin.x,
    height: target.y - origin.y,
    createdAt: timestamp,
    updatedAt: timestamp,
    style: { ...DEFAULT_STYLE, lineWidth: 2 },
  };
};

export const createArrowElement = (origin: Point, target: Point): ArrowElement => {
  const timestamp = now();

  return {
    id: createElementId(),
    type: "arrow",
    start: origin,
    end: target,
    createdAt: timestamp,
    updatedAt: timestamp,
    style: { ...DEFAULT_STYLE, lineWidth: 2.2 },
  };
};

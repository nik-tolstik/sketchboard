import { DEFAULT_VIEWPORT, type DrawingElement, type SceneSnapshot } from "./elements";

const finiteOrDefault = (value: unknown, fallback: number): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const normalizeElement = (element: DrawingElement | Record<string, unknown>): DrawingElement => {
  if (element.type === "rectangle") {
    return { ...element, type: "square" } as DrawingElement;
  }

  if (element.type === "ellipse") {
    return { ...element, type: "circle" } as DrawingElement;
  }

  return element as DrawingElement;
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
    elements: scene.elements.map((element) => normalizeElement(element as Record<string, unknown>)),
    viewport: {
      x: finiteOrDefault(viewport?.x, DEFAULT_VIEWPORT.x),
      y: finiteOrDefault(viewport?.y, DEFAULT_VIEWPORT.y),
      zoom: finiteOrDefault(viewport?.zoom, DEFAULT_VIEWPORT.zoom),
    },
    updatedAt: finiteOrDefault(scene.updatedAt, Date.now()),
  };
};

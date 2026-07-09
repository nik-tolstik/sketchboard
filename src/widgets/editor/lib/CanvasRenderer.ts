import type {
  ArrowElement,
  BrushElement,
  DrawingElement,
  SceneSnapshot,
  ShapeElement,
  TextElement,
  Viewport,
} from "@/entities/scene";
import {
  getArrowHead,
  getArrowHeadSegment,
  getDiamondPoints,
  getElementBounds,
  getElementsInLayerOrder,
  normalizeRect,
  type Rect,
} from "@/entities/scene";

export type CanvasRenderOptions = {
  preview?: DrawingElement;
  previews?: DrawingElement[];
  hiddenElementIds?: Set<string>;
  selectedElementIds?: Set<string>;
  selectionBox?: Rect;
};

const CANVAS_BACKGROUND = "#ffffff";
const TEXT_CONTENT_INSET_X = 3;
const TEXT_CONTENT_INSET_Y = 4;
const TEXT_LINE_HEIGHT = 1.3;

export class CanvasRenderer {
  private context: CanvasRenderingContext2D;
  private width = 0;
  private height = 0;
  private pixelRatio = 1;

  constructor(private readonly canvas: HTMLCanvasElement) {
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas 2D context is not available.");
    }

    this.context = context;
  }

  resize(): void {
    const { width, height } = this.canvas.getBoundingClientRect();
    this.pixelRatio = Math.max(1, window.devicePixelRatio || 1);
    this.width = Math.floor(width);
    this.height = Math.floor(height);
    this.canvas.width = Math.floor(width * this.pixelRatio);
    this.canvas.height = Math.floor(height * this.pixelRatio);
    this.context.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
  }

  render(scene: SceneSnapshot, options: CanvasRenderOptions = {}): void {
    this.clear();

    this.context.save();
    this.applyViewport(scene.viewport);

    const renderedElements: DrawingElement[] = [];

    for (const element of getElementsInLayerOrder(scene.elements)) {
      if (options.hiddenElementIds?.has(element.id)) {
        continue;
      }

      this.drawElement(element);
      renderedElements.push(element);
    }

    if (options.preview) {
      this.drawElement(options.preview);
      renderedElements.push(options.preview);
    }

    for (const preview of options.previews ?? []) {
      this.drawElement(preview);
      renderedElements.push(preview);
    }

    if (options.selectedElementIds && options.selectedElementIds.size > 0) {
      this.drawSelectedElements(renderedElements, options.selectedElementIds, scene.viewport.zoom);
    }

    if (options.selectionBox) {
      this.drawSelectionBox(options.selectionBox, scene.viewport.zoom);
    }

    this.context.restore();
  }

  private clear(): void {
    this.context.save();
    this.context.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
    this.context.fillStyle = CANVAS_BACKGROUND;
    this.context.fillRect(0, 0, this.width, this.height);
    this.context.restore();
  }

  private applyViewport(viewport: Viewport): void {
    this.context.translate(viewport.x, viewport.y);
    this.context.scale(viewport.zoom, viewport.zoom);
  }

  private drawElement(element: DrawingElement): void {
    this.context.save();
    this.context.strokeStyle = element.style.stroke;
    this.context.fillStyle = element.style.fill;
    this.context.lineWidth = element.style.lineWidth;
    this.context.lineJoin = "round";
    this.context.lineCap = "round";

    if (element.type === "brush") {
      this.drawBrush(element);
    } else if (element.type === "text") {
      this.drawText(element);
    } else if (element.type === "arrow") {
      this.drawArrow(element);
    } else {
      this.drawShape(element);
    }

    this.context.restore();
  }

  private drawBrush(element: BrushElement): void {
    const [firstPoint, ...points] = element.points;

    if (!firstPoint) {
      return;
    }

    this.context.beginPath();
    this.context.moveTo(firstPoint.x, firstPoint.y);

    for (const point of points) {
      this.context.lineTo(point.x, point.y);
    }

    this.context.stroke();
  }

  private drawText(element: TextElement): void {
    this.context.font = `${element.fontSize}px "Virgil", "Comic Sans MS", "Segoe Print", sans-serif`;
    this.context.textBaseline = "top";
    this.context.fillStyle = element.style.stroke;

    const lines = element.text.split("\n");

    for (let index = 0; index < lines.length; index += 1) {
      this.context.fillText(
        lines[index] ?? "",
        element.x + TEXT_CONTENT_INSET_X,
        element.y + TEXT_CONTENT_INSET_Y + index * element.fontSize * TEXT_LINE_HEIGHT,
      );
    }
  }

  private drawShape(element: ShapeElement): void {
    const rect = normalizeRect({
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
    });

    if (rect.width < 2 || rect.height < 2) {
      return;
    }

    if (element.type === "rectangle") {
      this.context.fillRect(rect.x, rect.y, rect.width, rect.height);
      this.context.strokeRect(rect.x, rect.y, rect.width, rect.height);
      return;
    }

    if (element.type === "ellipse") {
      this.context.beginPath();
      this.context.ellipse(
        rect.x + rect.width / 2,
        rect.y + rect.height / 2,
        rect.width / 2,
        rect.height / 2,
        0,
        0,
        Math.PI * 2,
      );
      this.context.fill();
      this.context.stroke();
      return;
    }

    const [top, right, bottom, left] = getDiamondPoints(rect);

    if (!top || !right || !bottom || !left) {
      return;
    }

    this.context.beginPath();
    this.context.moveTo(top.x, top.y);
    this.context.lineTo(right.x, right.y);
    this.context.lineTo(bottom.x, bottom.y);
    this.context.lineTo(left.x, left.y);
    this.context.closePath();
    this.context.fill();
    this.context.stroke();
  }

  private drawArrow(element: ArrowElement): void {
    const [firstPoint, ...points] = element.points;

    if (!firstPoint) {
      return;
    }

    this.context.beginPath();
    this.context.moveTo(firstPoint.x, firstPoint.y);

    for (const point of points) {
      this.context.lineTo(point.x, point.y);
    }

    this.context.stroke();

    const arrowHeadSegment = getArrowHeadSegment(element.points);

    if (!arrowHeadSegment) {
      return;
    }

    const [, end] = arrowHeadSegment;
    const [left, right] = getArrowHead(...arrowHeadSegment);

    if (!left || !right) {
      return;
    }

    this.context.beginPath();
    this.context.moveTo(left.x, left.y);
    this.context.lineTo(end.x, end.y);
    this.context.lineTo(right.x, right.y);
    this.context.stroke();
  }

  private drawSelectedElements(
    elements: DrawingElement[],
    selectedElementIds: Set<string>,
    zoom: number,
  ): void {
    const scale = Math.max(zoom, 0.01);
    const outlinePadding = 6 / scale;

    this.context.save();
    this.context.strokeStyle = "rgba(75, 111, 255, 0.95)";
    this.context.lineWidth = 1.5 / scale;
    this.context.setLineDash([6 / scale, 4 / scale]);

    for (const element of elements) {
      if (!selectedElementIds.has(element.id)) {
        continue;
      }

      if (element.type === "arrow") {
        this.drawArrowPointHandles(element, zoom);
        continue;
      }

      const bounds = normalizeRect(getElementBounds(element));
      this.context.strokeRect(
        bounds.x - outlinePadding,
        bounds.y - outlinePadding,
        bounds.width + outlinePadding * 2,
        bounds.height + outlinePadding * 2,
      );
    }

    this.context.restore();
  }

  private drawArrowPointHandles(element: ArrowElement, zoom: number): void {
    const scale = Math.max(zoom, 0.01);
    const radius = 5 / scale;

    this.context.save();
    this.context.setLineDash([]);
    this.context.lineWidth = 1.5 / scale;
    this.context.strokeStyle = "rgba(75, 111, 255, 0.98)";
    this.context.fillStyle = "#ffffff";

    for (const point of element.points) {
      this.context.beginPath();
      this.context.arc(point.x, point.y, radius, 0, Math.PI * 2);
      this.context.fill();
      this.context.stroke();
    }

    this.context.restore();
  }

  private drawSelectionBox(selectionBox: Rect, zoom: number): void {
    const rect = normalizeRect(selectionBox);
    const scale = Math.max(zoom, 0.01);

    this.context.save();
    this.context.strokeStyle = "rgba(75, 111, 255, 0.9)";
    this.context.fillStyle = "rgba(75, 111, 255, 0.08)";
    this.context.lineWidth = 1.5 / scale;
    this.context.setLineDash([6 / scale, 5 / scale]);
    this.context.beginPath();
    this.context.rect(rect.x, rect.y, rect.width, rect.height);
    this.context.fill();
    this.context.stroke();
    this.context.restore();
  }
}

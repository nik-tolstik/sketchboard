import type {
  ArrowElement,
  BrushElement,
  DrawingElement,
  SceneSnapshot,
  ShapeElement,
  TextAlign,
  TextElement,
  Viewport,
} from "@/entities/scene";
import {
  TEXT_CONTENT_INSET_X,
  TEXT_CONTENT_INSET_Y,
  TEXT_LINE_HEIGHT,
  getArrowCurveSegments,
  getArrowHead,
  getArrowHeadSegment,
  getElementBounds,
  getElementsInLayerOrder,
  getResizeHandlePoints,
  getRoundedShapeContour,
  getShapeTextBox,
  getVerticallyCenteredTextTop,
  isResizableElement,
  normalizeRect,
  type Rect,
} from "@/entities/scene";

import { getCanvasTextFont, measureTextElementLayout } from "./textMeasurement";

export type CanvasRenderOptions = {
  preview?: DrawingElement;
  previews?: DrawingElement[];
  hiddenElementIds?: Set<string>;
  hiddenElementTextIds?: Set<string>;
  selectedElementIds?: Set<string>;
  selectionBox?: Rect;
};

const CANVAS_BACKGROUND = "#ffffff";

const clampOpacity = (opacity: number): number => Math.min(Math.max(opacity, 0), 1);

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

      this.drawElement(element, options.hiddenElementTextIds?.has(element.id) !== true);
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

  private drawElement(element: DrawingElement, showShapeText = true): void {
    this.context.save();
    this.context.strokeStyle = element.style.stroke;
    this.context.fillStyle = element.style.fill;
    this.context.lineWidth = element.style.lineWidth;
    this.context.globalAlpha = clampOpacity(element.style.opacity);
    this.context.lineJoin = "round";
    this.context.lineCap = "round";

    if (element.type === "brush") {
      this.drawBrush(element);
    } else if (element.type === "text") {
      this.drawText(element);
    } else if (element.type === "arrow") {
      this.drawArrow(element);
    } else {
      this.drawShape(element, showShapeText);
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
    this.context.fillStyle = element.style.stroke;
    this.drawTextBlock(
      element.text,
      element.textAlign,
      element.fontSize,
      {
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height,
      },
      false,
    );
  }

  private drawTextBlock(
    text: string,
    textAlign: TextAlign,
    fontSize: number,
    textBox: Rect,
    verticallyCentered: boolean,
  ): void {
    this.context.font = getCanvasTextFont(fontSize);
    this.context.textBaseline = "top";
    this.context.textAlign = textAlign;
    const textX = this.getTextLineX(textBox, textAlign);

    const { height, lines } = measureTextElementLayout(this.context, text, textBox.width, fontSize);
    const textTop = verticallyCentered
      ? getVerticallyCenteredTextTop(textBox, height) + TEXT_CONTENT_INSET_Y
      : textBox.y + TEXT_CONTENT_INSET_Y;

    for (let index = 0; index < lines.length; index += 1) {
      this.context.fillText(
        lines[index] ?? "",
        textX,
        textTop + index * fontSize * TEXT_LINE_HEIGHT,
      );
    }
  }

  private getTextLineX(textBox: Rect, textAlign: TextAlign): number {
    if (textAlign === "center") {
      return textBox.x + textBox.width / 2;
    }

    if (textAlign === "right") {
      return textBox.x + textBox.width - TEXT_CONTENT_INSET_X;
    }

    return textBox.x + TEXT_CONTENT_INSET_X;
  }

  private drawShape(element: ShapeElement, showText: boolean): void {
    const rect = normalizeRect({
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
    });

    if (rect.width < 2 || rect.height < 2) {
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
    } else {
      const contour = getRoundedShapeContour(element.type, rect, element.style.borderRadius ?? 0);

      this.context.beginPath();
      this.context.moveTo(contour.start.x, contour.start.y);

      for (const segment of contour.segments) {
        if (segment.type === "line") {
          this.context.lineTo(segment.end.x, segment.end.y);
        } else {
          this.context.quadraticCurveTo(
            segment.control.x,
            segment.control.y,
            segment.end.x,
            segment.end.y,
          );
        }
      }

      this.context.closePath();
      this.context.fill();
      this.context.stroke();
    }

    if (showText && element.text.length > 0) {
      this.context.fillStyle = element.style.stroke;
      this.drawTextBlock(
        element.text,
        element.textAlign,
        element.fontSize,
        getShapeTextBox(element),
        true,
      );
    }
  }

  private drawArrow(element: ArrowElement): void {
    const segments = getArrowCurveSegments(element.points);
    const firstSegment = segments[0];

    if (!firstSegment) {
      return;
    }

    this.context.beginPath();
    this.context.moveTo(firstSegment.start.x, firstSegment.start.y);

    for (const segment of segments) {
      this.context.bezierCurveTo(
        segment.control1.x,
        segment.control1.y,
        segment.control2.x,
        segment.control2.y,
        segment.end.x,
        segment.end.y,
      );
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
    const canResizeSelection = selectedElementIds.size === 1;

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
      const isResizable = isResizableElement(element);
      const elementOutlinePadding = isResizable ? 0 : outlinePadding;

      this.context.strokeRect(
        bounds.x - elementOutlinePadding,
        bounds.y - elementOutlinePadding,
        bounds.width + elementOutlinePadding * 2,
        bounds.height + elementOutlinePadding * 2,
      );

      if (canResizeSelection && isResizable) {
        this.drawResizeHandles(bounds, zoom);
      }
    }

    this.context.restore();
  }

  private drawResizeHandles(bounds: Rect, zoom: number): void {
    const scale = Math.max(zoom, 0.01);
    const size = 9 / scale;
    const halfSize = size / 2;

    this.context.save();
    this.context.setLineDash([]);
    this.context.lineWidth = 1.5 / scale;
    this.context.strokeStyle = "rgba(75, 111, 255, 0.98)";
    this.context.fillStyle = "#ffffff";

    for (const point of Object.values(getResizeHandlePoints(bounds))) {
      this.context.fillRect(point.x - halfSize, point.y - halfSize, size, size);
      this.context.strokeRect(point.x - halfSize, point.y - halfSize, size, size);
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

import { describe, expect, it } from "vitest";
import {
  createArrowElement,
  createTextElement,
  getTextElementWidth,
  updateTextElementText,
} from "./elements";

describe("elements", () => {
  it("expands long uninterrupted text beyond the legacy editor cap", () => {
    expect(getTextElementWidth("123456789123456789123456789123456789")).toBeGreaterThan(460);
  });

  it("updates text content while preserving element identity", () => {
    const element = createTextElement({ x: 10, y: 20 }, "old");
    const updated = updateTextElementText(element, "new content");

    expect(updated.id).toBe(element.id);
    expect(updated.text).toBe("new content");
    expect(updated.x).toBe(10);
    expect(updated.y).toBe(20);
    expect(updated.width).toBe(getTextElementWidth("new content", element.fontSize));
    expect(updated.updatedAt).toBeGreaterThanOrEqual(element.updatedAt);
  });

  it("estimates multiline text width from the longest line", () => {
    expect(getTextElementWidth("short\nlonger line")).toBe(getTextElementWidth("longer line"));
  });

  it("creates arrows with draggable points", () => {
    const arrow = createArrowElement([
      { x: 10, y: 20 },
      { x: 30, y: 30 },
      { x: 50, y: 40 },
      { x: 70, y: 35 },
    ]);

    expect(arrow.points).toEqual([
      { x: 10, y: 20 },
      { x: 30, y: 30 },
      { x: 50, y: 40 },
      { x: 70, y: 35 },
    ]);
  });
});

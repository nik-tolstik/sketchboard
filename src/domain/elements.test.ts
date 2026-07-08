import { describe, expect, it } from "vitest";
import { createTextElement, getTextElementWidth, updateTextElementText } from "./elements";

describe("elements", () => {
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
});

import { describe, expect, it } from "vitest";

import { DEFAULT_STYLE, createShapeElement, createTextElement } from "@/entities/scene";

import { getObjectSettingsSnapshot } from "./objectSettings";

describe("getObjectSettingsSnapshot", () => {
  it("uses drawing defaults when there is no selection", () => {
    expect(
      getObjectSettingsSnapshot({
        currentStyle: { stroke: "#ff0000" },
        currentTextAlign: "right",
        selectedElements: [],
      }),
    ).toMatchObject({
      hasSelection: false,
      selectionCount: 0,
      style: {
        borderRadius: DEFAULT_STYLE.borderRadius,
        fill: DEFAULT_STYLE.fill,
        lineWidth: DEFAULT_STYLE.lineWidth,
        opacity: DEFAULT_STYLE.opacity,
        stroke: "#ff0000",
      },
      textAlign: "right",
    });
  });

  it("projects shared and mixed settings from the selection", () => {
    const first = createTextElement({ x: 0, y: 0 }, "first");
    const second = createTextElement({ x: 20, y: 20 }, "second");
    second.style = { ...second.style, stroke: "#ff0000" };
    second.textAlign = "center";

    const settings = getObjectSettingsSnapshot({
      currentStyle: DEFAULT_STYLE,
      currentTextAlign: "left",
      selectedElements: [first, second],
    });

    expect(settings).toMatchObject({
      hasSelection: true,
      hasBorderRadiusSelection: false,
      hasTextSelection: true,
      selectionCount: 2,
      mixed: {
        fill: false,
        lineWidth: false,
        opacity: false,
        stroke: true,
        textAlign: true,
      },
    });
  });

  it("keeps text settings inactive for shape-only selections", () => {
    const shape = createShapeElement("rectangle", { x: 0, y: 0 }, { x: 40, y: 30 });

    expect(
      getObjectSettingsSnapshot({
        currentStyle: DEFAULT_STYLE,
        currentTextAlign: "right",
        selectedElements: [shape],
      }),
    ).toMatchObject({
      hasBorderRadiusSelection: true,
      hasTextSelection: false,
      textAlign: "right",
      mixed: { textAlign: false },
    });
  });

  it("projects mixed border radius only from supported shapes", () => {
    const rectangle = createShapeElement("rectangle", { x: 0, y: 0 }, { x: 40, y: 30 });
    const diamond = createShapeElement("diamond", { x: 50, y: 0 }, { x: 90, y: 30 });
    const ellipse = createShapeElement("ellipse", { x: 100, y: 0 }, { x: 140, y: 30 });
    rectangle.style = { ...rectangle.style, borderRadius: 4 };
    diamond.style = { ...diamond.style, borderRadius: 16 };

    expect(
      getObjectSettingsSnapshot({
        currentStyle: DEFAULT_STYLE,
        currentTextAlign: "left",
        selectedElements: [ellipse, rectangle, diamond],
      }),
    ).toMatchObject({
      hasBorderRadiusSelection: true,
      style: { borderRadius: 4 },
      mixed: { borderRadius: true },
    });
  });
});

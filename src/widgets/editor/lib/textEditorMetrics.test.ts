import { describe, expect, it } from "vitest";

import { getInlineTextEditorMetrics } from "./textEditorMetrics";

describe("getInlineTextEditorMetrics", () => {
  it("keeps text at its logical font size at 100% zoom", () => {
    const metrics = getInlineTextEditorMetrics({
      text: "Note",
      fontSize: 24,
      viewportZoom: 1,
    });

    expect(metrics.fontSize).toBe(24);
    expect(metrics.scale).toBe(1);
    expect(metrics.visualFontSize).toBe(24);
  });

  it("scales visible text size at minimum viewport zoom", () => {
    const metrics = getInlineTextEditorMetrics({
      text: "Tiny note",
      fontSize: 24,
      viewportZoom: 0.25,
    });

    expect(metrics.fontSize).toBe(24);
    expect(metrics.scale).toBe(0.25);
    expect(metrics.visualFontSize).toBe(6);
  });

  it("grows the editor height for multiline text", () => {
    const singleLineMetrics = getInlineTextEditorMetrics({
      text: "One line",
      fontSize: 24,
      viewportZoom: 1,
    });
    const multilineMetrics = getInlineTextEditorMetrics({
      text: "One line\nSecond line",
      fontSize: 24,
      viewportZoom: 1,
    });

    expect(multilineMetrics.height).toBeGreaterThan(singleLineMetrics.height);
  });

  it("includes the canvas text inset in editor height", () => {
    const metrics = getInlineTextEditorMetrics({
      text: "One line",
      fontSize: 24,
      viewportZoom: 1,
    });

    expect(metrics.height).toBeCloseTo(36.2, 4);
  });

  it("does not cap long single-line editor width", () => {
    const metrics = getInlineTextEditorMetrics({
      text: "123456789123456789123456789123456789",
      fontSize: 24,
      viewportZoom: 1,
    });

    expect(metrics.width).toBeGreaterThan(460);
  });
});

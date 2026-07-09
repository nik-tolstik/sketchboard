import {
  DEFAULT_TEXT_FONT_SIZE,
  getTextElementHeight,
  getTextElementWidth,
} from "@/entities/scene";

type InlineTextEditorMetricsOptions = {
  text: string;
  fontSize?: number;
  viewportZoom: number;
  measureTextWidth?: (text: string, fontSize: number) => number;
};

export type InlineTextEditorMetrics = {
  fontSize: number;
  scale: number;
  width: number;
  height: number;
  visualFontSize: number;
};

const positiveOrDefault = (value: number | undefined, fallback: number): number => {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return fallback;
  }

  return value;
};

export const getInlineTextEditorMetrics = ({
  text,
  fontSize,
  viewportZoom,
  measureTextWidth,
}: InlineTextEditorMetricsOptions): InlineTextEditorMetrics => {
  const normalizedFontSize = positiveOrDefault(fontSize, DEFAULT_TEXT_FONT_SIZE);
  const scale = positiveOrDefault(viewportZoom, 1);
  const width =
    text.length > 0 && measureTextWidth
      ? measureTextWidth(text, normalizedFontSize)
      : getTextElementWidth(text, normalizedFontSize);
  const height = getTextElementHeight(text, normalizedFontSize);

  return {
    fontSize: normalizedFontSize,
    scale,
    width,
    height,
    visualFontSize: normalizedFontSize * scale,
  };
};

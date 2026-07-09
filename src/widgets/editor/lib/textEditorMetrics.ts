const DEFAULT_TEXT_EDITOR_FONT_SIZE = 24;
const TEXT_EDITOR_MIN_WIDTH = 120;
const TEXT_EDITOR_MAX_WIDTH = 460;
const TEXT_EDITOR_WIDTH_RATIO = 0.62;
const TEXT_EDITOR_HORIZONTAL_PADDING = 14;
const TEXT_EDITOR_MIN_HEIGHT = 32;
const TEXT_EDITOR_LINE_HEIGHT = 1.3;
const TEXT_EDITOR_VERTICAL_PADDING = 6;

type InlineTextEditorMetricsOptions = {
  text: string;
  fontSize?: number;
  viewportZoom: number;
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
}: InlineTextEditorMetricsOptions): InlineTextEditorMetrics => {
  const normalizedFontSize = positiveOrDefault(fontSize, DEFAULT_TEXT_EDITOR_FONT_SIZE);
  const scale = positiveOrDefault(viewportZoom, 1);
  const lines = text.split("\n");
  const longestLineLength = Math.max(1, ...lines.map((line) => line.length));
  const width = Math.min(
    Math.max(
      longestLineLength * normalizedFontSize * TEXT_EDITOR_WIDTH_RATIO +
        TEXT_EDITOR_HORIZONTAL_PADDING,
      TEXT_EDITOR_MIN_WIDTH,
    ),
    TEXT_EDITOR_MAX_WIDTH,
  );
  const height = Math.max(
    lines.length * normalizedFontSize * TEXT_EDITOR_LINE_HEIGHT + TEXT_EDITOR_VERTICAL_PADDING,
    TEXT_EDITOR_MIN_HEIGHT,
  );

  return {
    fontSize: normalizedFontSize,
    scale,
    width,
    height,
    visualFontSize: normalizedFontSize * scale,
  };
};

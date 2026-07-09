import { DEFAULT_TEXT_FONT_SIZE, TEXT_CONTENT_INSET_X } from "@/entities/scene";

export const getCanvasTextFont = (fontSize = DEFAULT_TEXT_FONT_SIZE): string =>
  `${fontSize}px "Virgil", "Comic Sans MS", "Segoe Print", sans-serif`;

export const measureTextElementWidth = (
  context: CanvasRenderingContext2D,
  text: string,
  fontSize = DEFAULT_TEXT_FONT_SIZE,
): number => {
  const lines = text.split("\n");

  context.save();
  context.font = getCanvasTextFont(fontSize);

  const longestLineWidth = Math.max(0, ...lines.map((line) => context.measureText(line).width));

  context.restore();

  return longestLineWidth + TEXT_CONTENT_INSET_X * 2;
};

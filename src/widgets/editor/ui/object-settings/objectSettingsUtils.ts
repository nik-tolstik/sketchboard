export const clampOpacityPercent = (opacity: number): number =>
  Math.round(Math.min(Math.max(opacity, 0), 1) * 100);

export const getSelectionLabel = (selectionCount: number): string =>
  selectionCount === 1 ? "1 object" : `${selectionCount} objects`;

export const getSliderPercentValue = (value: number | readonly number[]): number | undefined => {
  const nextValue = Array.isArray(value) ? value[0] : value;

  return Number.isFinite(nextValue) ? nextValue : undefined;
};

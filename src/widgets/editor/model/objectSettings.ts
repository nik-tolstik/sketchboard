import {
  DEFAULT_STYLE,
  type DrawingElement,
  type ElementStyle,
  type TextAlign,
  type TextElement,
} from "@/entities/scene";

export type ObjectSettingsSnapshot = {
  selectionCount: number;
  hasBorderRadiusSelection: boolean;
  hasSelection: boolean;
  hasTextSelection: boolean;
  style: Pick<ElementStyle, "borderRadius" | "fill" | "lineWidth" | "opacity" | "stroke">;
  textAlign: TextAlign;
  mixed: {
    borderRadius: boolean;
    fill: boolean;
    lineWidth: boolean;
    opacity: boolean;
    stroke: boolean;
    textAlign: boolean;
  };
};

type ObjectSettingsInput = {
  currentStyle: Partial<ElementStyle>;
  currentTextAlign: TextAlign;
  selectedElements: DrawingElement[];
};

type ObjectStyle = ObjectSettingsSnapshot["style"];

const getCurrentStyle = (style: Partial<ElementStyle>): ObjectStyle => ({
  borderRadius: style.borderRadius ?? DEFAULT_STYLE.borderRadius,
  fill: style.fill ?? DEFAULT_STYLE.fill,
  lineWidth: style.lineWidth ?? DEFAULT_STYLE.lineWidth,
  opacity: style.opacity ?? DEFAULT_STYLE.opacity,
  stroke: style.stroke ?? DEFAULT_STYLE.stroke,
});

const getCommonStyleValue = <Key extends keyof ObjectStyle>(
  elements: DrawingElement[],
  key: Key,
): ObjectStyle[Key] | undefined => {
  const firstElement = elements[0];

  if (!firstElement) {
    return undefined;
  }

  const firstValue = firstElement.style[key];

  return elements.every((element) => element.style[key] === firstValue) ? firstValue : undefined;
};

const getCommonTextAlign = (elements: TextElement[]): TextAlign | undefined => {
  const firstElement = elements[0];

  if (!firstElement) {
    return undefined;
  }

  return elements.every((element) => element.textAlign === firstElement.textAlign)
    ? firstElement.textAlign
    : undefined;
};

const isBorderRadiusElement = (element: DrawingElement): boolean =>
  element.type === "rectangle" || element.type === "diamond";

export const getObjectSettingsSnapshot = ({
  currentStyle,
  currentTextAlign,
  selectedElements,
}: ObjectSettingsInput): ObjectSettingsSnapshot => {
  if (selectedElements.length === 0) {
    return {
      selectionCount: 0,
      hasBorderRadiusSelection: false,
      hasSelection: false,
      hasTextSelection: false,
      style: getCurrentStyle(currentStyle),
      textAlign: currentTextAlign,
      mixed: {
        borderRadius: false,
        fill: false,
        lineWidth: false,
        opacity: false,
        stroke: false,
        textAlign: false,
      },
    };
  }

  const textElements = selectedElements.filter(
    (element): element is TextElement => element.type === "text",
  );
  const borderRadiusElements = selectedElements.filter(isBorderRadiusElement);
  const firstElement = selectedElements[0];
  const firstBorderRadiusElement = borderRadiusElements[0];
  const firstTextElement = textElements[0];
  const commonTextAlign = getCommonTextAlign(textElements);
  const commonBorderRadius = getCommonStyleValue(borderRadiusElements, "borderRadius");

  return {
    selectionCount: selectedElements.length,
    hasBorderRadiusSelection: borderRadiusElements.length > 0,
    hasSelection: true,
    hasTextSelection: textElements.length > 0,
    style: {
      borderRadius:
        commonBorderRadius ??
        firstBorderRadiusElement?.style.borderRadius ??
        getCurrentStyle(currentStyle).borderRadius,
      fill: getCommonStyleValue(selectedElements, "fill") ?? firstElement.style.fill,
      lineWidth: getCommonStyleValue(selectedElements, "lineWidth") ?? firstElement.style.lineWidth,
      opacity: getCommonStyleValue(selectedElements, "opacity") ?? firstElement.style.opacity,
      stroke: getCommonStyleValue(selectedElements, "stroke") ?? firstElement.style.stroke,
    },
    textAlign: commonTextAlign ?? firstTextElement?.textAlign ?? currentTextAlign,
    mixed: {
      borderRadius: borderRadiusElements.length > 0 && commonBorderRadius === undefined,
      fill: getCommonStyleValue(selectedElements, "fill") === undefined,
      lineWidth: getCommonStyleValue(selectedElements, "lineWidth") === undefined,
      opacity: getCommonStyleValue(selectedElements, "opacity") === undefined,
      stroke: getCommonStyleValue(selectedElements, "stroke") === undefined,
      textAlign: textElements.length > 0 && commonTextAlign === undefined,
    },
  };
};

import type { TextAlign } from "@/entities/scene";

import type { IconName } from "../icons";

export type ColorPreset = {
  label: string;
  transparent?: boolean;
  value: string;
};

export type StrokeWidthPreset = {
  label: string;
  previewHeight: number;
  value: number;
};

export type TextAlignControl = {
  icon: Extract<IconName, "alignCenter" | "alignLeft" | "alignRight">;
  label: string;
  value: TextAlign;
};

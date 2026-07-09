import { DEFAULT_STYLE } from "@/entities/scene";

import type { ColorPreset, StrokeWidthPreset, TextAlignControl } from "./objectSettingsTypes";

const TRANSPARENT_COLOR = DEFAULT_STYLE.fill;

export const STROKE_PRESETS: ColorPreset[] = [
  { label: "Ink", value: "#171717" },
  { label: "Slate", value: "#5f6368" },
  { label: "Moss", value: "#61746b" },
  { label: "Plum", value: "#6f6685" },
  { label: "Clay", value: "#8b6763" },
  { label: "Ochre", value: "#8a735c" },
  { label: "Transparent", transparent: true, value: TRANSPARENT_COLOR },
];

export const FILL_PRESETS: ColorPreset[] = [
  { label: "Linen", value: "#f3f0e8" },
  { label: "Mist", value: "#e8eef3" },
  { label: "Sage", value: "#e8f1ec" },
  { label: "Blush", value: "#f1e8e5" },
  { label: "Lavender", value: "#eee9f4" },
  { label: "Transparent", transparent: true, value: TRANSPARENT_COLOR },
];

export const STROKE_WIDTH_PRESETS: StrokeWidthPreset[] = [
  { label: "Thin", previewHeight: 1, value: 1 },
  { label: "Medium", previewHeight: 2, value: 2 },
  { label: "Thick", previewHeight: 4, value: 4 },
];

export const TEXT_ALIGN_CONTROLS: TextAlignControl[] = [
  { icon: "alignLeft", label: "Align left", value: "left" },
  { icon: "alignCenter", label: "Align center", value: "center" },
  { icon: "alignRight", label: "Align right", value: "right" },
];

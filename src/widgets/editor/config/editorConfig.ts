import type { LayerOrderCommand, Tool } from "@/entities/scene";

import type { IconName } from "../ui/icons";

export type ToolDefinition = {
  id: Tool;
  label: string;
  shortcut: string;
  numericShortcut?: string;
};

export type LayerControlDefinition = {
  action: LayerOrderCommand;
  label: string;
  icon: IconName;
};

export const TOOLS: ToolDefinition[] = [
  { id: "select", label: "Select", shortcut: "V", numericShortcut: "1" },
  { id: "brush", label: "Brush", shortcut: "B", numericShortcut: "2" },
  { id: "text", label: "Text", shortcut: "T", numericShortcut: "3" },
  { id: "square", label: "Square", shortcut: "S", numericShortcut: "4" },
  { id: "diamond", label: "Diamond", shortcut: "D", numericShortcut: "5" },
  { id: "circle", label: "Circle", shortcut: "C", numericShortcut: "6" },
  { id: "arrow", label: "Arrow", shortcut: "A" },
];

export const LAYER_CONTROLS: LayerControlDefinition[] = [
  { action: "backward", label: "Назад", icon: "layerBackward" },
  { action: "forward", label: "Вперёд", icon: "layerForward" },
  { action: "front", label: "Полностью вперёд", icon: "layerToFront" },
  { action: "back", label: "Полностью назад", icon: "layerToBack" },
];

export const getToolTitle = (tool: ToolDefinition): string =>
  `${tool.label} (${[tool.numericShortcut, tool.shortcut].filter(Boolean).join(", ")})`;

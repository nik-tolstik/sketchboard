import type { LayerOrderCommand, Tool } from "@/entities/scene";

import type { IconName } from "./editorIcon";

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
  { id: "pan", label: "Pan", shortcut: "H", numericShortcut: "1" },
  { id: "select", label: "Select", shortcut: "V", numericShortcut: "2" },
  { id: "brush", label: "Brush", shortcut: "B", numericShortcut: "3" },
  { id: "text", label: "Text", shortcut: "T", numericShortcut: "4" },
  { id: "rectangle", label: "Rectangle", shortcut: "S", numericShortcut: "5" },
  { id: "diamond", label: "Diamond", shortcut: "D", numericShortcut: "6" },
  { id: "ellipse", label: "Ellipse", shortcut: "C", numericShortcut: "7" },
  { id: "arrow", label: "Arrow", shortcut: "A", numericShortcut: "8" },
];

const OBJECT_TOOLS = new Set<Tool>(["brush", "text", "rectangle", "diamond", "ellipse", "arrow"]);
const TEXT_CAPABLE_TOOLS = new Set<Tool>(["text", "rectangle", "diamond", "ellipse"]);

export const LAYER_CONTROLS: LayerControlDefinition[] = [
  { action: "backward", label: "Назад", icon: "layerBackward" },
  { action: "forward", label: "Вперёд", icon: "layerForward" },
  { action: "front", label: "Полностью вперёд", icon: "layerToFront" },
  { action: "back", label: "Полностью назад", icon: "layerToBack" },
];

export const getToolTitle = (tool: ToolDefinition): string =>
  `${tool.label} (${[tool.numericShortcut, tool.shortcut].filter(Boolean).join(", ")})`;

export const isObjectTool = (tool: Tool): boolean => OBJECT_TOOLS.has(tool);
export const isTextCapableTool = (tool: Tool): boolean => TEXT_CAPABLE_TOOLS.has(tool);

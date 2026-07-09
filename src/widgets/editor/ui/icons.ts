import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowRight,
  BringToFront,
  Circle,
  Copy,
  Diamond,
  Download,
  Hand,
  MousePointer2,
  MoveDown,
  MoveUp,
  Paintbrush,
  RectangleHorizontal,
  SendToBack,
  Trash2,
  Type,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";
import { createElement, type ReactElement } from "react";

import type { Tool } from "@/entities/scene";

export type IconName =
  | Tool
  | "alignCenter"
  | "alignLeft"
  | "alignRight"
  | "clear"
  | "copy"
  | "delete"
  | "export"
  | "layerBackward"
  | "layerForward"
  | "layerToBack"
  | "layerToFront";

const icons: Record<IconName, LucideIcon> = {
  pan: Hand,
  select: MousePointer2,
  brush: Paintbrush,
  text: Type,
  rectangle: RectangleHorizontal,
  diamond: Diamond,
  ellipse: Circle,
  arrow: ArrowRight,
  alignCenter: AlignCenter,
  alignLeft: AlignLeft,
  alignRight: AlignRight,
  clear: Trash2,
  copy: Copy,
  delete: Trash2,
  export: Download,
  layerBackward: MoveDown,
  layerForward: MoveUp,
  layerToFront: BringToFront,
  layerToBack: SendToBack,
};

const iconProps = {
  "aria-hidden": true,
  focusable: "false",
  size: 20,
  strokeWidth: 1.9,
} satisfies LucideProps;

export const getIcon = (name: IconName): ReactElement => createElement(icons[name], iconProps);

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowRight,
  BringToFront,
  Circle,
  ClipboardPaste,
  Copy,
  Diamond,
  Download,
  Hand,
  Layers3,
  MousePointer2,
  MoveDown,
  MoveUp,
  Paintbrush,
  RectangleHorizontal,
  Scissors,
  SendToBack,
  Trash2,
  Type,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";
import { createElement, type ReactElement } from "react";

import type { IconName } from "../config/editorIcon";

export type { IconName } from "../config/editorIcon";

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
  cut: Scissors,
  delete: Trash2,
  export: Download,
  layerBackward: MoveDown,
  layerForward: MoveUp,
  layerToFront: BringToFront,
  layerToBack: SendToBack,
  layers: Layers3,
  paste: ClipboardPaste,
};

const iconProps = {
  "aria-hidden": true,
  focusable: "false",
  size: 20,
  strokeWidth: 1.9,
} satisfies LucideProps;

export const getIcon = (name: IconName): ReactElement => createElement(icons[name], iconProps);

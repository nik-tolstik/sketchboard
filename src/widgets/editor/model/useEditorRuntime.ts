import type { RefObject } from "react";
import { createContext, useContextSelector } from "use-context-selector";

import type { BorderRadius, LayerOrderCommand, SaveState, TextAlign, Tool } from "@/entities/scene";

import type { ObjectSettingsSnapshot } from "./objectSettings";

export type EditorRuntime = {
  activeTool: Tool;
  borderRadius: BorderRadius;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  clearScene: () => void;
  copySelection: () => void;
  deleteSelection: () => void;
  exportPng: () => void;
  fillColor: string;
  hasSelection: boolean;
  hasBorderRadiusSelection: boolean;
  hasTextSelection: boolean;
  isPanning: boolean;
  lineWidth: number;
  mixedObjectSettings: ObjectSettingsSnapshot["mixed"];
  opacity: number;
  resetZoom: () => void;
  saveState: SaveState;
  selectionCount: number;
  setFillColor: (color: string) => void;
  setBorderRadius: (borderRadius: BorderRadius) => void;
  setLineWidth: (lineWidth: number) => void;
  setOpacity: (opacity: number) => void;
  setStrokeColor: (color: string) => void;
  setTextAlign: (textAlign: TextAlign) => void;
  setTool: (tool: Tool) => void;
  strokeColor: string;
  textAlign: TextAlign;
  textEditorRef: RefObject<HTMLTextAreaElement | null>;
  updateSelectionLayer: (command: LayerOrderCommand) => void;
  zoom: number;
  zoomIn: () => void;
  zoomOut: () => void;
};

export const EditorRuntimeContext = createContext<EditorRuntime | null>(null);

export function useEditorRuntime<Selected>(
  selector: (runtime: EditorRuntime) => Selected,
): Selected {
  return useContextSelector(EditorRuntimeContext, (runtime) => {
    if (!runtime) {
      throw new Error("useEditorRuntime must be used within EditorRuntimeProvider.");
    }

    return selector(runtime);
  });
}

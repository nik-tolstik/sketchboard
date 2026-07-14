import type { Tool } from "@/entities/scene";

import { TOOLS } from "../config/editorConfig";

export type EditorShortcut =
  | { type: "copy-selection" }
  | { type: "cut-selection" }
  | { type: "delete-selection" }
  | { type: "paste-selection" }
  | { type: "redo" }
  | { type: "reset-zoom" }
  | { type: "select-all" }
  | { type: "set-tool"; tool: Tool }
  | { type: "undo" }
  | { type: "zoom-in" }
  | { type: "zoom-out" };

type KeyboardShortcutEvent = Pick<
  KeyboardEvent,
  "code" | "ctrlKey" | "key" | "metaKey" | "shiftKey"
>;

export const getEditorShortcut = (event: KeyboardShortcutEvent): EditorShortcut | undefined => {
  if (event.key === "Delete" || event.key === "Backspace") {
    return { type: "delete-selection" };
  }

  const hasModifier = event.ctrlKey || event.metaKey;

  if (hasModifier) {
    const key = event.key.toLowerCase();

    if (key === "z" || event.code === "KeyZ") {
      return { type: event.shiftKey ? "redo" : "undo" };
    }

    if (key === "a" || event.code === "KeyA") {
      return { type: "select-all" };
    }

    if (key === "c" || event.code === "KeyC") {
      return { type: "copy-selection" };
    }

    if (key === "x" || event.code === "KeyX") {
      return { type: "cut-selection" };
    }

    if (key === "v" || event.code === "KeyV") {
      return { type: "paste-selection" };
    }

    if (
      event.key === "+" ||
      event.key === "=" ||
      event.code === "Equal" ||
      event.code === "NumpadAdd"
    ) {
      return { type: "zoom-in" };
    }

    if (
      event.key === "-" ||
      event.key === "_" ||
      event.code === "Minus" ||
      event.code === "NumpadSubtract"
    ) {
      return { type: "zoom-out" };
    }

    if (event.key === "0" || event.code === "Digit0" || event.code === "Numpad0") {
      return { type: "reset-zoom" };
    }

    return undefined;
  }

  const tool = TOOLS.find(
    (candidate) =>
      candidate.shortcut.toLowerCase() === event.key.toLowerCase() ||
      candidate.numericShortcut === event.key,
  );

  return tool ? { type: "set-tool", tool: tool.id } : undefined;
};

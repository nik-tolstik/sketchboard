import { describe, expect, it } from "vitest";

import { getEditorShortcut } from "./editorShortcuts";

const createEvent = (
  overrides: Partial<Parameters<typeof getEditorShortcut>[0]> = {},
): Parameters<typeof getEditorShortcut>[0] => ({
  code: "",
  ctrlKey: false,
  key: "",
  metaKey: false,
  shiftKey: false,
  ...overrides,
});

describe("getEditorShortcut", () => {
  it("maps editing shortcuts for control and command keys", () => {
    expect(getEditorShortcut(createEvent({ ctrlKey: true, key: "z" }))).toEqual({
      type: "undo",
    });
    expect(getEditorShortcut(createEvent({ key: "z", metaKey: true, shiftKey: true }))).toEqual({
      type: "redo",
    });
    expect(getEditorShortcut(createEvent({ ctrlKey: true, key: "c" }))).toEqual({
      type: "copy-selection",
    });
    expect(getEditorShortcut(createEvent({ code: "KeyX", metaKey: true }))).toEqual({
      type: "cut-selection",
    });
    expect(getEditorShortcut(createEvent({ ctrlKey: true, key: "v" }))).toEqual({
      type: "paste-selection",
    });
  });

  it("maps zoom shortcuts by key or physical code", () => {
    expect(getEditorShortcut(createEvent({ code: "NumpadAdd", ctrlKey: true }))).toEqual({
      type: "zoom-in",
    });
    expect(getEditorShortcut(createEvent({ ctrlKey: true, key: "-" }))).toEqual({
      type: "zoom-out",
    });
    expect(getEditorShortcut(createEvent({ ctrlKey: true, key: "0" }))).toEqual({
      type: "reset-zoom",
    });
  });

  it("maps tool shortcuts only without a command modifier", () => {
    expect(getEditorShortcut(createEvent({ key: "4" }))).toEqual({
      type: "set-tool",
      tool: "text",
    });
    expect(getEditorShortcut(createEvent({ key: "b" }))).toEqual({
      type: "set-tool",
      tool: "brush",
    });
    expect(getEditorShortcut(createEvent({ ctrlKey: true, key: "b" }))).toBeUndefined();
  });

  it("maps deletion independently of modifiers", () => {
    expect(getEditorShortcut(createEvent({ key: "Backspace", metaKey: true }))).toEqual({
      type: "delete-selection",
    });
  });
});

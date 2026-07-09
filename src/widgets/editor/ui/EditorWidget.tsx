import { useEffect, useRef } from "react";

import type { SaveState, Tool } from "@/entities/scene";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";

import { LAYER_CONTROLS, TOOLS, getToolTitle } from "../config/editorConfig";
import { useEditorRuntime } from "../model/useEditorRuntime";
import { EditorIcon } from "./EditorIcon";

const saveStateLabels: Record<SaveState, string> = {
  idle: "Ready",
  loading: "Loading",
  saving: "Saving",
  saved: "Saved",
  error: "Storage error",
};

export function EditorWidget() {
  const {
    activeTool,
    canvasRef,
    clearScene,
    exportPng,
    fillColor,
    hasSelection,
    isPanning,
    saveState,
    setFillColor,
    setStrokeColor,
    setTool,
    strokeColor,
    textEditorRef,
    updateSelectionLayer,
    zoom,
    zoomIn,
    zoomOut,
    resetZoom,
  } = useEditorRuntime();
  const strokeColorInputRef = useRef<HTMLInputElement>(null);
  const fillColorInputRef = useRef<HTMLInputElement>(null);
  const zoomPercent = `${Math.round(zoom * 100)}%`;

  useEffect(() => {
    const input = strokeColorInputRef.current;

    if (!input) {
      return undefined;
    }

    const updateStrokeColor = (): void => setStrokeColor(input.value);

    input.addEventListener("change", updateStrokeColor);
    input.addEventListener("input", updateStrokeColor);

    return () => {
      input.removeEventListener("change", updateStrokeColor);
      input.removeEventListener("input", updateStrokeColor);
    };
  }, [setStrokeColor]);

  useEffect(() => {
    const input = fillColorInputRef.current;

    if (!input) {
      return undefined;
    }

    const updateFillColor = (): void => setFillColor(input.value);

    input.addEventListener("change", updateFillColor);
    input.addEventListener("input", updateFillColor);

    return () => {
      input.removeEventListener("change", updateFillColor);
      input.removeEventListener("input", updateFillColor);
    };
  }, [setFillColor]);

  return (
    <main className="app-shell">
      <header className="top-bar" aria-label="Whiteboard controls">
        <section className="brand" aria-label="Application">
          <img className="brand__mark" src="/logo.svg" alt="" aria-hidden="true" />
          <span className="brand__name">SketchBoard</span>
        </section>

        <ToggleGroup
          aria-label="Drawing tools"
          className="toolbar"
          onValueChange={(value) => {
            const [nextTool] = value as Tool[];

            if (nextTool) {
              setTool(nextTool);
            }
          }}
          spacing={1}
          value={[activeTool]}
          variant="outline"
        >
          {TOOLS.map((tool) => (
            <ToggleGroupItem
              key={tool.id}
              aria-label={tool.label}
              className="icon-button editor-tool-button"
              data-tool={tool.id}
              title={getToolTitle(tool)}
              value={tool.id}
            >
              <EditorIcon name={tool.id} />
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <section className="actions" aria-label="Scene actions">
          <Badge
            className="save-state"
            data-save-state
            data-state={saveState}
            variant={saveState === "error" ? "destructive" : "secondary"}
          >
            {saveStateLabels[saveState]}
          </Badge>
          <Separator orientation="vertical" />
          <label className="color-control" title="Stroke color">
            <span>Stroke</span>
            <input
              ref={strokeColorInputRef}
              data-stroke-color
              onChange={(event) => setStrokeColor(event.target.value)}
              type="color"
              value={strokeColor}
            />
          </label>
          <label className="color-control" title="Fill color">
            <span>Fill</span>
            <input
              ref={fillColorInputRef}
              data-fill-color
              onChange={(event) => setFillColor(event.target.value)}
              type="color"
              value={fillColor}
            />
          </label>
          <Button
            className="text-button"
            data-clear
            onClick={clearScene}
            type="button"
            variant="ghost"
          >
            <EditorIcon iconPosition="inline-start" name="clear" />
            <span>Clear</span>
          </Button>
          <Button
            className="text-button text-button--primary"
            data-export
            onClick={exportPng}
            type="button"
          >
            <EditorIcon iconPosition="inline-start" name="export" />
            <span>PNG</span>
          </Button>
        </section>
      </header>

      <div className="canvas-frame">
        <canvas
          ref={canvasRef}
          aria-label="Drawing canvas"
          className="drawing-canvas"
          data-canvas
          data-panning={String(isPanning)}
          data-tool={activeTool}
        />
        <textarea
          ref={textEditorRef}
          className="inline-text-editor"
          data-text-editor
          rows={1}
          spellCheck={false}
        />
        <aside className="help-panel" aria-label="Canvas tips">
          <span>Wheel moves, Ctrl/Cmd wheel or pinch zooms</span>
        </aside>
        <section aria-label="Zoom controls" className="zoom-panel">
          <Button
            aria-label="Zoom out"
            className="icon-button zoom-panel__button"
            data-zoom-out
            onClick={zoomOut}
            title="Zoom out"
            type="button"
            variant="ghost"
          >
            <span aria-hidden="true">-</span>
          </Button>
          <Button
            aria-label={`Reset zoom to 100%. Current zoom ${zoomPercent}`}
            className="zoom-panel__value"
            data-zoom-reset
            onClick={resetZoom}
            title="Reset zoom"
            type="button"
            variant="ghost"
          >
            {zoomPercent}
          </Button>
          <Button
            aria-label="Zoom in"
            className="icon-button zoom-panel__button"
            data-zoom-in
            onClick={zoomIn}
            title="Zoom in"
            type="button"
            variant="ghost"
          >
            <span aria-hidden="true">+</span>
          </Button>
        </section>
        <section
          aria-label="Layer controls"
          className="layer-panel"
          data-layer-panel
          hidden={!hasSelection}
        >
          {LAYER_CONTROLS.map((control) => (
            <Button
              key={control.action}
              aria-label={control.label}
              className="icon-button"
              data-layer-action={control.action}
              disabled={!hasSelection}
              onClick={() => updateSelectionLayer(control.action)}
              title={control.label}
              type="button"
              variant="ghost"
            >
              <EditorIcon name={control.icon} />
            </Button>
          ))}
        </section>
      </div>
    </main>
  );
}

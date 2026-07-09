import type { SaveState, Tool } from "@/entities/scene";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";

import { TOOLS, getToolTitle, isObjectTool } from "../config/editorConfig";
import { useEditorRuntime } from "../model/useEditorRuntime";
import { EditorIcon } from "./EditorIcon";
import { ObjectSettingsPanel } from "./ObjectSettingsPanel";

const saveStateLabels: Record<SaveState, string> = {
  idle: "Ready",
  loading: "Loading",
  saving: "Saving",
  saved: "Saved",
  error: "Storage error",
};

const glassPanelClassName =
  "border border-border bg-[var(--editor-surface)] shadow-[var(--editor-shadow)] backdrop-blur-[18px]";

const compactGlassPanelClassName =
  "border border-border bg-[var(--editor-surface)] shadow-[0_12px_30px_rgba(16,16,16,0.1)] backdrop-blur-[18px]";

const iconButtonClassName =
  "inline-grid h-9 min-w-9 cursor-pointer place-items-center rounded-[7px] border-0 bg-transparent text-[var(--editor-text)] transition-[background-color,color,transform] duration-150 hover:bg-[rgba(22,22,22,0.07)] active:translate-y-px";

const textButtonClassName =
  "inline-grid h-9 min-w-[72px] grid-flow-col place-items-center gap-[7px] rounded-[7px] border border-transparent px-[11px] text-[13px] font-bold text-[var(--editor-text)] transition-[background-color,color,transform] duration-150 hover:bg-[rgba(22,22,22,0.07)] active:translate-y-px";

export function EditorWidget() {
  const {
    activeTool,
    canvasRef,
    clearScene,
    copySelection,
    deleteSelection,
    exportPng,
    fillColor,
    hasSelection,
    hasTextSelection,
    isPanning,
    lineWidth,
    mixedObjectSettings,
    opacity,
    saveState,
    setFillColor,
    setLineWidth,
    setOpacity,
    setStrokeColor,
    setTextAlign,
    setTool,
    selectionCount,
    strokeColor,
    textAlign,
    textEditorRef,
    updateSelectionLayer,
    zoom,
    zoomIn,
    zoomOut,
    resetZoom,
  } = useEditorRuntime();
  const zoomPercent = `${Math.round(zoom * 100)}%`;
  const showObjectSettings = isObjectTool(activeTool) || hasSelection;

  return (
    <main className="relative h-screen w-screen [background:radial-gradient(circle_at_20%_15%,rgba(75,111,255,0.08),transparent_28%),linear-gradient(180deg,#f6f6f3_0%,#ecece8_100%)]">
      <header
        className="pointer-events-none fixed top-[14px] right-[14px] left-[14px] z-10 grid grid-cols-[minmax(140px,1fr)_auto_minmax(190px,1fr)] items-center gap-3 max-[760px]:top-2.5 max-[760px]:right-2.5 max-[760px]:left-2.5 max-[760px]:grid-cols-1 max-[760px]:justify-items-center"
        aria-label="Whiteboard controls"
      >
        <section
          className={cn(
            "pointer-events-auto inline-flex min-h-11 items-center gap-2.5 justify-self-start rounded-lg py-2 pr-3 pl-[9px] max-[760px]:hidden",
            glassPanelClassName,
          )}
          aria-label="Application"
        >
          <img
            className="block size-[27px] rounded-[7px]"
            src="/logo.svg"
            alt=""
            aria-hidden="true"
          />
          <span className="text-sm font-bold tracking-normal text-[var(--editor-text)]">
            SketchBoard
          </span>
        </section>

        <ToggleGroup
          aria-label="Drawing tools"
          className={cn(
            "pointer-events-auto inline-flex justify-self-center gap-[3px] rounded-lg p-[5px] max-[760px]:max-w-[calc(100vw-20px)] max-[760px]:overflow-x-auto",
            glassPanelClassName,
          )}
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
            <Tooltip key={tool.id}>
              <TooltipTrigger
                delay={0}
                render={
                  <ToggleGroupItem
                    aria-label={tool.label}
                    className={cn(
                      iconButtonClassName,
                      "editor-tool-button relative data-[active=true]:bg-[#171717] data-[active=true]:text-white data-[state=on]:bg-[#171717] data-[state=on]:text-white aria-pressed:bg-[#171717] aria-pressed:text-white",
                    )}
                    data-tool={tool.id}
                    value={tool.id}
                  />
                }
              >
                <EditorIcon name={tool.id} />
                <span
                  aria-hidden="true"
                  className="editor-tool-button__shortcut pointer-events-none absolute right-1 bottom-[3px] inline-grid size-2.5 place-items-center rounded-full text-[8px] leading-none font-extrabold text-current"
                >
                  {tool.numericShortcut}
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom">{getToolTitle(tool)}</TooltipContent>
            </Tooltip>
          ))}
        </ToggleGroup>

        <section
          className={cn(
            "pointer-events-auto inline-flex min-h-11 items-center gap-2 justify-self-end rounded-lg p-[5px] max-[760px]:max-w-[calc(100vw-20px)] max-[760px]:flex-wrap max-[760px]:justify-center max-[760px]:justify-self-center",
            glassPanelClassName,
          )}
          aria-label="Scene actions"
        >
          <Badge
            className="min-w-[76px] px-2 text-center text-xs font-[650] text-[var(--editor-muted)] data-[state=error]:text-[#c4372d]"
            data-save-state
            data-state={saveState}
            variant={saveState === "error" ? "destructive" : "secondary"}
          >
            {saveStateLabels[saveState]}
          </Badge>
          <Separator orientation="vertical" />
          <Button
            className={textButtonClassName}
            data-clear
            onClick={clearScene}
            type="button"
            variant="ghost"
          >
            <EditorIcon iconPosition="inline-start" name="clear" />
            <span>Clear</span>
          </Button>
          <Button
            className={cn(
              textButtonClassName,
              "bg-[var(--editor-accent)] text-[var(--editor-accent-contrast)] hover:bg-[var(--editor-accent-hover)] hover:text-[var(--editor-accent-contrast)]",
            )}
            data-export
            onClick={exportPng}
            type="button"
          >
            <EditorIcon iconPosition="inline-start" name="export" />
            <span>PNG</span>
          </Button>
        </section>
      </header>

      <div className="canvas-frame relative h-full w-full">
        <canvas
          ref={canvasRef}
          aria-label="Drawing canvas"
          className={cn(
            "block h-full w-full cursor-crosshair touch-none",
            activeTool === "pan" && "cursor-grab",
            activeTool === "select" && "cursor-default",
            isPanning && "cursor-grabbing",
          )}
          data-canvas
          data-panning={String(isPanning)}
          data-tool={activeTool}
        />
        <textarea
          ref={textEditorRef}
          className="absolute z-20 box-border m-0 resize-none overflow-hidden rounded-none border-0 bg-transparent py-0 pr-0 pl-[3px] text-[var(--editor-text)] outline-none origin-top-left whitespace-pre break-normal focus:shadow-none [&:not([data-open=true])]:hidden"
          data-text-editor
          rows={1}
          spellCheck={false}
          wrap="off"
        />
        <ObjectSettingsPanel
          copySelection={copySelection}
          deleteSelection={deleteSelection}
          fillColor={fillColor}
          hasSelection={hasSelection}
          lineWidth={lineWidth}
          mixedObjectSettings={mixedObjectSettings}
          opacity={opacity}
          selectionCount={selectionCount}
          setFillColor={setFillColor}
          setLineWidth={setLineWidth}
          setOpacity={setOpacity}
          setStrokeColor={setStrokeColor}
          setTextAlign={setTextAlign}
          showTextAlignment={activeTool === "text" || hasTextSelection}
          strokeColor={strokeColor}
          textAlign={textAlign}
          updateSelectionLayer={updateSelectionLayer}
          visible={showObjectSettings}
        />
        <aside
          className={cn(
            "fixed bottom-4 left-4 z-[8] max-w-[min(300px,calc(100vw-32px))] rounded-lg px-3 py-[9px] text-xs font-[650] text-[var(--editor-muted)] max-[760px]:right-2.5 max-[760px]:bottom-2.5 max-[760px]:left-2.5 max-[760px]:text-center",
            compactGlassPanelClassName,
          )}
          aria-label="Canvas tips"
        >
          <span>Wheel moves, Ctrl/Cmd wheel or pinch zooms</span>
        </aside>
        <section
          aria-label="Zoom controls"
          className={cn(
            "fixed right-4 bottom-4 z-[9] inline-flex items-center gap-[3px] rounded-lg p-[5px] max-[760px]:right-2.5 max-[760px]:bottom-[58px]",
            compactGlassPanelClassName,
          )}
        >
          <Button
            aria-label="Zoom out"
            className={cn(iconButtonClassName, "text-lg leading-none font-extrabold")}
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
            className="inline-grid h-9 min-w-16 cursor-pointer place-items-center rounded-[7px] bg-[rgba(22,22,22,0.05)] px-2.5 text-xs leading-none font-extrabold text-[var(--editor-text)] transition-[background-color,transform] duration-150 hover:bg-[rgba(22,22,22,0.08)] active:translate-y-px"
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
            className={cn(iconButtonClassName, "text-lg leading-none font-extrabold")}
            data-zoom-in
            onClick={zoomIn}
            title="Zoom in"
            type="button"
            variant="ghost"
          >
            <span aria-hidden="true">+</span>
          </Button>
        </section>
      </div>
    </main>
  );
}

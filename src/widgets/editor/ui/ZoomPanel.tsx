import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

import { useEditorRuntime } from "../model/useEditorRuntime";
import { compactGlassPanelClassName, iconButtonClassName } from "./editorPanelClasses";

export function ZoomPanel() {
  const resetZoom = useEditorRuntime((runtime) => runtime.resetZoom);
  const zoom = useEditorRuntime((runtime) => runtime.zoom);
  const zoomIn = useEditorRuntime((runtime) => runtime.zoomIn);
  const zoomOut = useEditorRuntime((runtime) => runtime.zoomOut);

  const zoomPercent = `${Math.round(zoom * 100)}%`;

  return (
    <section
      aria-label="Zoom controls"
      className={cn(
        "fixed right-4 bottom-4 z-[9] inline-flex items-center gap-[3px] rounded-lg p-[5px] max-[760px]:right-2.5 max-[760px]:bottom-[58px]",
        compactGlassPanelClassName,
      )}
    >
      <Button
        aria-label="Zoom out"
        className={cn(iconButtonClassName, "text-lg leading-none font-semibold")}
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
        className="inline-grid h-9 min-w-16 cursor-pointer place-items-center rounded-[7px] bg-muted px-2.5 text-xs leading-none font-semibold text-foreground transition-[background-color,transform] duration-150 hover:bg-accent active:translate-y-px"
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
        className={cn(iconButtonClassName, "text-lg leading-none font-semibold")}
        data-zoom-in
        onClick={zoomIn}
        title="Zoom in"
        type="button"
        variant="ghost"
      >
        <span aria-hidden="true">+</span>
      </Button>
    </section>
  );
}

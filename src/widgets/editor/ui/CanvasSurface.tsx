import { cn } from "@/shared/lib/utils";
import { ContextMenu, ContextMenuTrigger } from "@/shared/ui/context-menu";

import { useEditorRuntime } from "../model/useEditorRuntime";
import { CanvasContextMenuContent } from "./CanvasContextMenu";

export function CanvasSurface() {
  const activeTool = useEditorRuntime((runtime) => runtime.activeTool);
  const canvasRef = useEditorRuntime((runtime) => runtime.canvasRef);
  const isPanning = useEditorRuntime((runtime) => runtime.isPanning);
  const prepareContextMenuAt = useEditorRuntime((runtime) => runtime.prepareContextMenuAt);
  const textEditorRef = useEditorRuntime((runtime) => runtime.textEditorRef);

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger
          className={cn(
            "block h-full w-full cursor-crosshair touch-none",
            activeTool === "pan" && "cursor-grab",
            activeTool === "select" && "cursor-default",
            isPanning && "cursor-grabbing",
          )}
          onContextMenu={(event) => prepareContextMenuAt(event.clientX, event.clientY)}
          render={
            <canvas
              ref={canvasRef}
              aria-label="Drawing canvas"
              data-canvas
              data-panning={String(isPanning)}
              data-tool={activeTool}
            />
          }
        />
        <CanvasContextMenuContent />
      </ContextMenu>
      <textarea
        ref={textEditorRef}
        className="absolute z-20 box-border m-0 resize-none overflow-hidden rounded-none border-0 bg-transparent px-[3px] py-0 text-foreground outline-none origin-top-left focus:shadow-none [&:not([data-open=true])]:hidden"
        data-text-editor
        rows={1}
        spellCheck={false}
        wrap="off"
      />
    </>
  );
}

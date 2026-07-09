import { cn } from "@/shared/lib/utils";

import { useEditorRuntime } from "../model/useEditorRuntime";

export function CanvasSurface() {
  const activeTool = useEditorRuntime((runtime) => runtime.activeTool);
  const canvasRef = useEditorRuntime((runtime) => runtime.canvasRef);
  const isPanning = useEditorRuntime((runtime) => runtime.isPanning);
  const textEditorRef = useEditorRuntime((runtime) => runtime.textEditorRef);

  return (
    <>
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
        className="absolute z-20 box-border m-0 resize-none overflow-hidden rounded-none border-0 bg-transparent py-0 pr-0 pl-[3px] text-foreground outline-none origin-top-left whitespace-pre break-normal focus:shadow-none [&:not([data-open=true])]:hidden"
        data-text-editor
        rows={1}
        spellCheck={false}
        wrap="off"
      />
    </>
  );
}

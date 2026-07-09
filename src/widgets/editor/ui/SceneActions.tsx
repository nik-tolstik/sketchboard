import type { SaveState } from "@/entities/scene";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";

import { useEditorRuntime } from "../model/useEditorRuntime";
import { EditorIcon } from "./EditorIcon";
import { textButtonClassName } from "./editorPanelClasses";

const saveStateLabels: Record<SaveState, string> = {
  idle: "Ready",
  loading: "Loading",
  saving: "Saving",
  saved: "Saved",
  error: "Storage error",
};

export function SceneActions() {
  const clearScene = useEditorRuntime((runtime) => runtime.clearScene);
  const exportPng = useEditorRuntime((runtime) => runtime.exportPng);
  const saveState = useEditorRuntime((runtime) => runtime.saveState);

  return (
    <section
      className={
        "pointer-events-auto inline-flex min-h-11 items-center gap-2 justify-self-end rounded-lg p-[5px] max-[760px]:max-w-[calc(100vw-20px)] max-[760px]:flex-wrap max-[760px]:justify-center max-[760px]:justify-self-center"
      }
      aria-label="Scene actions"
    >
      <Badge
        className="min-w-[76px] px-2 text-center text-xs font-[650] text-muted-foreground data-[state=error]:text-destructive"
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
          "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
        )}
        data-export
        onClick={exportPng}
        type="button"
      >
        <EditorIcon iconPosition="inline-start" name="export" />
        <span>PNG</span>
      </Button>
    </section>
  );
}

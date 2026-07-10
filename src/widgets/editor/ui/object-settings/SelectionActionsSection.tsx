import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

import { useEditorRuntime } from "../../model/useEditorRuntime";
import { EditorIcon } from "../EditorIcon";
import { iconButtonClassName } from "./objectSettingsClasses";

export function SelectionActionsSection() {
  const copySelection = useEditorRuntime((runtime) => runtime.copySelection);
  const deleteSelection = useEditorRuntime((runtime) => runtime.deleteSelection);
  const hasSelection = useEditorRuntime((runtime) => runtime.hasSelection);
  const selectionCount = useEditorRuntime((runtime) => runtime.selectionCount);

  return (
    <div
      className={cn(
        "col-span-full flex justify-end gap-1.5 px-3 py-2.5",
        !hasSelection && "hidden",
      )}
      data-selection-actions
      hidden={!hasSelection}
    >
      <Button
        aria-label={selectionCount === 1 ? "Copy object" : "Copy objects"}
        className={cn(
          iconButtonClassName,
          "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground",
        )}
        data-copy-selection
        disabled={!hasSelection}
        onClick={copySelection}
        title={selectionCount === 1 ? "Copy object" : "Copy objects"}
        type="button"
        variant="ghost"
      >
        <EditorIcon name="copy" />
      </Button>
      <Button
        aria-label={selectionCount === 1 ? "Delete object" : "Delete objects"}
        className={cn(
          iconButtonClassName,
          "bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive",
        )}
        data-delete-selection
        disabled={!hasSelection}
        onClick={deleteSelection}
        title={selectionCount === 1 ? "Delete object" : "Delete objects"}
        type="button"
        variant="ghost"
      >
        <EditorIcon name="delete" />
      </Button>
    </div>
  );
}

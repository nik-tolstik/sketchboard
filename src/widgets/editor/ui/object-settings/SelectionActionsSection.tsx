import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

import { useEditorRuntime } from "../../model/useEditorRuntime";
import { EditorIcon } from "../EditorIcon";
import { actionButtonClassName } from "./objectSettingsClasses";

export function SelectionActionsSection() {
  const copySelection = useEditorRuntime((runtime) => runtime.copySelection);
  const deleteSelection = useEditorRuntime((runtime) => runtime.deleteSelection);
  const hasSelection = useEditorRuntime((runtime) => runtime.hasSelection);
  const selectionCount = useEditorRuntime((runtime) => runtime.selectionCount);

  return (
    <div
      className={cn(
        "col-span-full grid grid-cols-2 gap-1.5 px-3 py-2.5",
        !hasSelection && "hidden",
      )}
      data-selection-actions
      hidden={!hasSelection}
    >
      <Button
        aria-label={selectionCount === 1 ? "Copy object" : "Copy objects"}
        className={cn(
          actionButtonClassName,
          "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground",
        )}
        data-copy-selection
        disabled={!hasSelection}
        onClick={copySelection}
        type="button"
        variant="ghost"
      >
        <EditorIcon iconPosition="inline-start" name="copy" />
        <span>Copy</span>
      </Button>
      <Button
        aria-label={selectionCount === 1 ? "Delete object" : "Delete objects"}
        className={cn(
          actionButtonClassName,
          "bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive",
        )}
        data-delete-selection
        disabled={!hasSelection}
        onClick={deleteSelection}
        type="button"
        variant="ghost"
      >
        <EditorIcon iconPosition="inline-start" name="delete" />
        <span>Delete</span>
      </Button>
    </div>
  );
}

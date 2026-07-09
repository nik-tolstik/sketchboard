import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

import { LAYER_CONTROLS } from "../../config/editorConfig";
import { useEditorRuntime } from "../../model/useEditorRuntime";
import { EditorIcon } from "../EditorIcon";
import { iconButtonClassName } from "./objectSettingsClasses";
import { getSelectionLabel } from "./objectSettingsUtils";
import { ObjectSettingsSection } from "./ObjectSettingsSection";

export function LayerControlsSection() {
  const hasSelection = useEditorRuntime((runtime) => runtime.hasSelection);
  const selectionCount = useEditorRuntime((runtime) => runtime.selectionCount);
  const updateSelectionLayer = useEditorRuntime((runtime) => runtime.updateSelectionLayer);

  return (
    <ObjectSettingsSection
      className={cn(!hasSelection && "hidden")}
      data-layer-panel
      headerEnd={
        <span className="text-[11px] leading-none font-bold">
          {getSelectionLabel(selectionCount)}
        </span>
      }
      hidden={!hasSelection}
      title="Layer"
      titleId="object-settings-layer"
    >
      <div className="grid grid-cols-4 gap-1.5">
        {LAYER_CONTROLS.map((control) => (
          <Button
            key={control.action}
            aria-label={control.label}
            className={iconButtonClassName}
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
      </div>
    </ObjectSettingsSection>
  );
}

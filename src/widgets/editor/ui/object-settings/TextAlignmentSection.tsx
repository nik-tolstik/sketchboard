import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

import { useEditorRuntime } from "../../model/useEditorRuntime";
import { EditorIcon } from "../EditorIcon";
import { segmentButtonClassName } from "./objectSettingsClasses";
import { TEXT_ALIGN_CONTROLS } from "./objectSettingsPresets";
import { ObjectSettingsSection } from "./ObjectSettingsSection";

export function TextAlignmentSection() {
  const activeTool = useEditorRuntime((runtime) => runtime.activeTool);
  const hasSelection = useEditorRuntime((runtime) => runtime.hasSelection);
  const hasTextSelection = useEditorRuntime((runtime) => runtime.hasTextSelection);
  const mixedTextAlign = useEditorRuntime((runtime) => runtime.mixedObjectSettings.textAlign);
  const setTextAlign = useEditorRuntime((runtime) => runtime.setTextAlign);
  const textAlign = useEditorRuntime((runtime) => runtime.textAlign);

  const showTextAlignment = activeTool === "text" || hasTextSelection;

  return (
    <ObjectSettingsSection
      className={cn(!showTextAlignment && "hidden", !hasSelection && "border-b-0")}
      data-text-align-panel
      hidden={!showTextAlignment}
      title="Align"
      titleId="object-settings-text"
    >
      <div className="grid grid-cols-3 gap-1.5">
        {TEXT_ALIGN_CONTROLS.map((control) => (
          <Button
            key={control.value}
            aria-label={control.label}
            aria-pressed={!mixedTextAlign && textAlign === control.value}
            className={segmentButtonClassName}
            data-text-align={control.value}
            onClick={() => setTextAlign(control.value)}
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

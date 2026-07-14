import { cn } from "@/shared/lib/utils";
import { Slider } from "@/shared/ui/slider";

import { useEditorRuntime } from "../../model/useEditorRuntime";
import { isTextCapableTool } from "../../config/editorConfig";
import { clampOpacityPercent, getSliderPercentValue } from "./objectSettingsUtils";
import { ObjectSettingsSection } from "./ObjectSettingsSection";

export function OpacitySection() {
  const activeTool = useEditorRuntime((runtime) => runtime.activeTool);
  const hasSelection = useEditorRuntime((runtime) => runtime.hasSelection);
  const hasTextSelection = useEditorRuntime((runtime) => runtime.hasTextSelection);
  const mixedOpacity = useEditorRuntime((runtime) => runtime.mixedObjectSettings.opacity);
  const opacity = useEditorRuntime((runtime) => runtime.opacity);
  const setOpacity = useEditorRuntime((runtime) => runtime.setOpacity);

  const opacityPercent = clampOpacityPercent(opacity);
  const showTextAlignment = isTextCapableTool(activeTool) || hasTextSelection;

  const commitOpacity = (value: number | readonly number[]): void => {
    const nextOpacityPercent = getSliderPercentValue(value);

    if (nextOpacityPercent !== undefined) {
      setOpacity(nextOpacityPercent / 100);
    }
  };

  return (
    <ObjectSettingsSection
      className={cn(!showTextAlignment && !hasSelection && "border-b-0")}
      headerEnd={
        <span className="text-[11px] leading-none font-bold" data-opacity-value>
          {mixedOpacity ? "Mixed" : `${opacityPercent}%`}
        </span>
      }
      title="Opacity"
      titleId="object-settings-opacity"
    >
      <Slider
        aria-label="Opacity"
        className="py-1"
        data-opacity-control
        defaultValue={[opacityPercent]}
        key={opacityPercent}
        max={100}
        min={0}
        onValueCommitted={commitOpacity}
        step={1}
      />
    </ObjectSettingsSection>
  );
}

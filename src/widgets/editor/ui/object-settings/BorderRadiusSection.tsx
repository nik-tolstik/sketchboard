import { cn } from "@/shared/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";

import { useEditorRuntime } from "../../model/useEditorRuntime";
import { BORDER_RADIUS_PRESETS } from "./objectSettingsPresets";
import { ObjectSettingsSection } from "./ObjectSettingsSection";

export function BorderRadiusSection() {
  const activeTool = useEditorRuntime((runtime) => runtime.activeTool);
  const borderRadius = useEditorRuntime((runtime) => runtime.borderRadius);
  const hasBorderRadiusSelection = useEditorRuntime((runtime) => runtime.hasBorderRadiusSelection);
  const mixedBorderRadius = useEditorRuntime((runtime) => runtime.mixedObjectSettings.borderRadius);
  const setBorderRadius = useEditorRuntime((runtime) => runtime.setBorderRadius);

  const visible =
    activeTool === "rectangle" || activeTool === "diamond" || hasBorderRadiusSelection;
  const selectedValues = mixedBorderRadius ? [] : [String(borderRadius)];

  const handleValueChange = (values: string[]): void => {
    const selectedValue = values.at(-1);
    const preset = BORDER_RADIUS_PRESETS.find(
      (candidate) => String(candidate.value) === selectedValue,
    );

    if (preset) {
      setBorderRadius(preset.value);
    }
  };

  return (
    <ObjectSettingsSection
      className={cn(!visible && "hidden")}
      data-border-radius-panel
      hidden={!visible}
      title="Border radius"
      titleId="object-settings-border-radius"
    >
      <ToggleGroup
        aria-label="Border radius"
        className="w-full flex-wrap max-[760px]:flex-nowrap"
        onValueChange={handleValueChange}
        size="sm"
        value={selectedValues}
        variant="outline"
      >
        {BORDER_RADIUS_PRESETS.map((preset) => (
          <ToggleGroupItem
            key={preset.value}
            aria-label={preset.label}
            className="basis-[calc(50%-4px)] grow px-1 text-[11px] data-[state=on]:bg-primary data-[state=on]:text-primary-foreground aria-pressed:bg-primary aria-pressed:text-primary-foreground max-[760px]:min-w-0 max-[760px]:basis-auto max-[760px]:text-[12px]"
            data-border-radius
            data-radius={preset.value}
            value={String(preset.value)}
          >
            {preset.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </ObjectSettingsSection>
  );
}

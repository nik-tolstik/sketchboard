import { useEditorRuntime } from "../../model/useEditorRuntime";
import { ColorPresetSection } from "./ColorPresetSection";
import { FILL_PRESETS } from "./objectSettingsPresets";

export function FillColorSection() {
  const fillColor = useEditorRuntime((runtime) => runtime.fillColor);
  const mixedFill = useEditorRuntime((runtime) => runtime.mixedObjectSettings.fill);
  const setFillColor = useEditorRuntime((runtime) => runtime.setFillColor);

  return (
    <ColorPresetSection
      currentColor={fillColor}
      isMixed={mixedFill}
      marker="fill"
      onColorChange={setFillColor}
      presets={FILL_PRESETS}
      title="Fill"
      titleId="object-settings-fill"
    />
  );
}

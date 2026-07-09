import { useEditorRuntime } from "../../model/useEditorRuntime";
import { STROKE_PRESETS } from "./objectSettingsPresets";
import { ColorPresetSection } from "./ColorPresetSection";

export function StrokeColorSection() {
  const mixedStroke = useEditorRuntime((runtime) => runtime.mixedObjectSettings.stroke);
  const setStrokeColor = useEditorRuntime((runtime) => runtime.setStrokeColor);
  const strokeColor = useEditorRuntime((runtime) => runtime.strokeColor);

  return (
    <ColorPresetSection
      currentColor={strokeColor}
      isMixed={mixedStroke}
      marker="stroke"
      onColorChange={setStrokeColor}
      presets={STROKE_PRESETS}
      title="Stroke"
      titleId="object-settings-stroke"
    />
  );
}

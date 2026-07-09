import { useEditorRuntime } from "../../model/useEditorRuntime";
import { strokeWidthOptionClassName } from "./objectSettingsClasses";
import { STROKE_WIDTH_PRESETS } from "./objectSettingsPresets";
import { ObjectSettingsSection } from "./ObjectSettingsSection";

export function StrokeWidthSection() {
  const lineWidth = useEditorRuntime((runtime) => runtime.lineWidth);
  const mixedLineWidth = useEditorRuntime((runtime) => runtime.mixedObjectSettings.lineWidth);
  const setLineWidth = useEditorRuntime((runtime) => runtime.setLineWidth);

  return (
    <ObjectSettingsSection title="Width" titleId="object-settings-width">
      <div className="grid grid-cols-3 gap-1.5">
        {STROKE_WIDTH_PRESETS.map((preset) => (
          <button
            key={preset.value}
            aria-label={`${preset.label} stroke`}
            aria-pressed={!mixedLineWidth && lineWidth === preset.value}
            className={strokeWidthOptionClassName}
            data-stroke-width
            data-width={preset.value}
            onClick={() => setLineWidth(preset.value)}
            type="button"
          >
            <span
              aria-hidden="true"
              className="min-h-px w-3.5 rounded-full bg-current"
              style={{ height: `${preset.previewHeight}px` }}
            />
          </button>
        ))}
      </div>
    </ObjectSettingsSection>
  );
}

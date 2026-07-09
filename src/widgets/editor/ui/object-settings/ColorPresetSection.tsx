import { cn } from "@/shared/lib/utils";

import type { ColorPreset } from "./objectSettingsTypes";
import {
  colorSwatchesClassName,
  swatchClassName,
  transparentSwatchClassName,
} from "./objectSettingsClasses";
import { ObjectSettingsSection } from "./ObjectSettingsSection";

type ColorPresetSectionProps = {
  currentColor: string;
  isMixed: boolean;
  marker: "fill" | "stroke";
  onColorChange: (color: string) => void;
  presets: ColorPreset[];
  title: string;
  titleId: string;
};

export function ColorPresetSection({
  currentColor,
  isMixed,
  marker,
  onColorChange,
  presets,
  title,
  titleId,
}: ColorPresetSectionProps) {
  const markerProps =
    marker === "stroke" ? { "data-stroke-color": true } : { "data-fill-color": true };

  return (
    <ObjectSettingsSection title={title} titleId={titleId}>
      <div className={colorSwatchesClassName}>
        {presets.map((preset) => (
          <button
            key={preset.value}
            aria-label={`${title} ${preset.label}`}
            aria-pressed={!isMixed && currentColor === preset.value}
            className={cn(swatchClassName, preset.transparent && transparentSwatchClassName)}
            data-color={preset.value}
            onClick={() => onColorChange(preset.value)}
            style={{ backgroundColor: preset.value }}
            type="button"
            {...markerProps}
          />
        ))}
      </div>
    </ObjectSettingsSection>
  );
}

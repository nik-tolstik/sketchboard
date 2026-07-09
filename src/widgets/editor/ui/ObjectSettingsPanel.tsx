import { DEFAULT_STYLE, type LayerOrderCommand } from "@/entities/scene";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

import { LAYER_CONTROLS } from "../config/editorConfig";
import { EditorIcon } from "./EditorIcon";

type ObjectSettingsPanelProps = {
  fillColor: string;
  hasSelection: boolean;
  lineWidth: number;
  setFillColor: (color: string) => void;
  setLineWidth: (lineWidth: number) => void;
  setStrokeColor: (color: string) => void;
  strokeColor: string;
  updateSelectionLayer: (command: LayerOrderCommand) => void;
  visible: boolean;
};

type ColorPreset = {
  label: string;
  transparent?: boolean;
  value: string;
};

type StrokeWidthPreset = {
  label: string;
  previewHeight: number;
  value: number;
};

const TRANSPARENT_COLOR = DEFAULT_STYLE.fill;

const STROKE_PRESETS: ColorPreset[] = [
  { label: "Ink", value: "#171717" },
  { label: "Slate", value: "#5f6368" },
  { label: "Moss", value: "#61746b" },
  { label: "Plum", value: "#6f6685" },
  { label: "Clay", value: "#8b6763" },
  { label: "Ochre", value: "#8a735c" },
  { label: "Transparent", transparent: true, value: TRANSPARENT_COLOR },
];

const FILL_PRESETS: ColorPreset[] = [
  { label: "White", value: "#ffffff" },
  { label: "Linen", value: "#f3f0e8" },
  { label: "Mist", value: "#e8eef3" },
  { label: "Sage", value: "#e8f1ec" },
  { label: "Blush", value: "#f1e8e5" },
  { label: "Lavender", value: "#eee9f4" },
  { label: "Transparent", transparent: true, value: TRANSPARENT_COLOR },
];

const STROKE_WIDTH_PRESETS: StrokeWidthPreset[] = [
  { label: "Thin", previewHeight: 1, value: 1 },
  { label: "Medium", previewHeight: 2, value: 2 },
  { label: "Thick", previewHeight: 4, value: 4 },
];

const colorControlClassName =
  "m-0 grid min-h-9 w-full gap-[7px] rounded-[7px] border-0 bg-[rgba(22,22,22,0.05)] p-[7px] text-xs font-bold text-[var(--editor-muted)]";

const colorSwatchesClassName =
  "grid grid-cols-[repeat(3,22px)] gap-1.5 max-[760px]:grid-cols-[repeat(7,22px)]";

const swatchClassName =
  "relative size-[22px] cursor-pointer overflow-hidden rounded-[7px] border border-[var(--editor-border-strong)] p-0 transition-[box-shadow,transform] duration-150 hover:shadow-[0_0_0_3px_rgba(22,22,22,0.08)] active:translate-y-px aria-pressed:shadow-[0_0_0_2px_var(--editor-surface),0_0_0_4px_var(--editor-accent)]";

const transparentSwatchClassName =
  "[background-image:linear-gradient(135deg,transparent_calc(50%_-_1px),rgba(196,62,62,0.8)_calc(50%_-_1px),rgba(196,62,62,0.8)_calc(50%_+_1px),transparent_calc(50%_+_1px)),repeating-conic-gradient(rgb(255,255,255)_0%_25%,rgb(223,227,234)_0%_50%)] [background-position:0_0] [background-size:100%_100%,8px_8px]";

const strokeWidthOptionClassName =
  "grid size-6 cursor-pointer place-items-center rounded-[7px] border border-[var(--editor-border-strong)] bg-[var(--editor-surface)] p-0 text-[var(--editor-text)] transition-[box-shadow,transform] duration-150 hover:shadow-[0_0_0_3px_rgba(22,22,22,0.08)] active:translate-y-px aria-pressed:shadow-[0_0_0_2px_var(--editor-surface),0_0_0_4px_var(--editor-accent)]";

const iconButtonClassName =
  "inline-grid h-9 min-w-9 cursor-pointer place-items-center rounded-[7px] border-0 bg-transparent text-[var(--editor-text)] transition-[background-color,color,transform] duration-150 hover:bg-[rgba(22,22,22,0.07)] active:translate-y-px disabled:cursor-default disabled:text-[rgba(22,22,22,0.3)] disabled:opacity-100";

export function ObjectSettingsPanel({
  fillColor,
  hasSelection,
  lineWidth,
  setFillColor,
  setLineWidth,
  setStrokeColor,
  strokeColor,
  updateSelectionLayer,
  visible,
}: ObjectSettingsPanelProps) {
  return (
    <section
      aria-label="Object settings"
      className={cn(
        "fixed top-[76px] left-4 z-[9] inline-flex w-[104px] flex-col gap-1.5 rounded-lg border border-border bg-[var(--editor-surface)] p-1.5 shadow-[0_12px_30px_rgba(16,16,16,0.1)] backdrop-blur-[18px] max-[760px]:top-[124px] max-[760px]:right-2.5 max-[760px]:left-2.5 max-[760px]:w-auto max-[760px]:max-w-[calc(100vw-20px)]",
        !visible && "hidden",
      )}
      data-object-settings-panel
      hidden={!visible}
    >
      <fieldset className={colorControlClassName} title="Stroke color">
        <legend className="p-0">Stroke</legend>
        <div className={colorSwatchesClassName}>
          {STROKE_PRESETS.map((preset) => (
            <button
              key={preset.value}
              aria-label={`Stroke ${preset.label}`}
              aria-pressed={strokeColor === preset.value}
              className={cn(swatchClassName, preset.transparent && transparentSwatchClassName)}
              data-color={preset.value}
              data-stroke-color
              onClick={() => setStrokeColor(preset.value)}
              style={{ backgroundColor: preset.value }}
              type="button"
            />
          ))}
        </div>
      </fieldset>
      <fieldset className={colorControlClassName} title="Stroke width">
        <legend className="p-0">Width</legend>
        <div className="grid grid-cols-[repeat(3,24px)] gap-1.5">
          {STROKE_WIDTH_PRESETS.map((preset) => (
            <button
              key={preset.value}
              aria-label={`${preset.label} stroke`}
              aria-pressed={lineWidth === preset.value}
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
      </fieldset>
      <fieldset className={colorControlClassName} title="Fill color">
        <legend className="p-0">Fill</legend>
        <div className={colorSwatchesClassName}>
          {FILL_PRESETS.map((preset) => (
            <button
              key={preset.value}
              aria-label={`Fill ${preset.label}`}
              aria-pressed={fillColor === preset.value}
              className={cn(swatchClassName, preset.transparent && transparentSwatchClassName)}
              data-color={preset.value}
              data-fill-color
              onClick={() => setFillColor(preset.value)}
              style={{ backgroundColor: preset.value }}
              type="button"
            />
          ))}
        </div>
      </fieldset>
      <fieldset
        className={cn(colorControlClassName, !hasSelection && "hidden")}
        data-layer-panel
        hidden={!hasSelection}
        title="Layer controls"
      >
        <legend className="p-0">Layer</legend>
        <div className="grid grid-cols-[repeat(2,36px)] gap-1 max-[760px]:grid-cols-[repeat(4,36px)]">
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
      </fieldset>
    </section>
  );
}

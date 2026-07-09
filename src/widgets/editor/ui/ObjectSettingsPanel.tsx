import type { KeyboardEvent } from "react";

import { DEFAULT_STYLE, type LayerOrderCommand, type TextAlign } from "@/entities/scene";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

import { LAYER_CONTROLS } from "../config/editorConfig";
import { EditorIcon } from "./EditorIcon";

type MixedObjectSettings = {
  fill: boolean;
  lineWidth: boolean;
  opacity: boolean;
  stroke: boolean;
  textAlign: boolean;
};

type ObjectSettingsPanelProps = {
  copySelection: () => void;
  deleteSelection: () => void;
  fillColor: string;
  hasSelection: boolean;
  lineWidth: number;
  mixedObjectSettings: MixedObjectSettings;
  opacity: number;
  selectionCount: number;
  setFillColor: (color: string) => void;
  setLineWidth: (lineWidth: number) => void;
  setOpacity: (opacity: number) => void;
  setStrokeColor: (color: string) => void;
  setTextAlign: (textAlign: TextAlign) => void;
  showTextAlignment: boolean;
  strokeColor: string;
  textAlign: TextAlign;
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

type TextAlignControl = {
  icon: "alignCenter" | "alignLeft" | "alignRight";
  label: string;
  value: TextAlign;
};

const TRANSPARENT_COLOR = DEFAULT_STYLE.fill;
const OPACITY_KEYS = new Set(["ArrowLeft", "ArrowRight", "Home", "End", "PageDown", "PageUp"]);

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

const TEXT_ALIGN_CONTROLS: TextAlignControl[] = [
  { icon: "alignLeft", label: "Align left", value: "left" },
  { icon: "alignCenter", label: "Align center", value: "center" },
  { icon: "alignRight", label: "Align right", value: "right" },
];

const controlClassName =
  "m-0 grid min-w-0 gap-2 rounded-[7px] border-0 bg-[rgba(22,22,22,0.045)] p-2 text-xs font-bold text-[var(--editor-muted)]";

const legendClassName =
  "flex w-full items-center justify-between p-0 text-[11px] leading-none font-extrabold tracking-normal text-[var(--editor-muted)]";

const colorSwatchesClassName = "grid grid-cols-[repeat(5,22px)] gap-1.5";

const swatchClassName =
  "relative size-[22px] cursor-pointer overflow-hidden rounded-[7px] border border-[var(--editor-border-strong)] p-0 transition-[box-shadow,transform] duration-150 hover:shadow-[0_0_0_3px_rgba(22,22,22,0.08)] active:translate-y-px aria-pressed:shadow-[0_0_0_2px_var(--editor-surface),0_0_0_4px_var(--editor-accent)]";

const transparentSwatchClassName =
  "[background-image:linear-gradient(135deg,transparent_calc(50%_-_1px),rgba(196,62,62,0.8)_calc(50%_-_1px),rgba(196,62,62,0.8)_calc(50%_+_1px),transparent_calc(50%_+_1px)),repeating-conic-gradient(rgb(255,255,255)_0%_25%,rgb(223,227,234)_0%_50%)] [background-position:0_0] [background-size:100%_100%,8px_8px]";

const strokeWidthOptionClassName =
  "grid h-8 min-w-0 cursor-pointer place-items-center rounded-[7px] border border-[var(--editor-border-strong)] bg-[var(--editor-surface)] p-0 text-[var(--editor-text)] transition-[box-shadow,transform] duration-150 hover:shadow-[0_0_0_3px_rgba(22,22,22,0.08)] active:translate-y-px aria-pressed:shadow-[0_0_0_2px_var(--editor-surface),0_0_0_4px_var(--editor-accent)]";

const iconButtonClassName =
  "inline-grid h-9 min-w-9 cursor-pointer place-items-center rounded-[7px] border-0 bg-transparent text-[var(--editor-text)] transition-[background-color,color,transform] duration-150 hover:bg-[rgba(22,22,22,0.07)] active:translate-y-px disabled:cursor-default disabled:text-[rgba(22,22,22,0.3)] disabled:opacity-100";

const segmentButtonClassName =
  "inline-grid h-8 min-w-0 cursor-pointer place-items-center rounded-[7px] border-0 bg-transparent text-[var(--editor-text)] transition-[background-color,color,transform] duration-150 hover:bg-[rgba(22,22,22,0.07)] active:translate-y-px aria-pressed:bg-[#171717] aria-pressed:text-white";

const actionButtonClassName =
  "inline-grid h-9 min-w-0 grid-flow-col place-items-center gap-1.5 rounded-[7px] px-2 text-[13px] font-bold";

const clampOpacityPercent = (opacity: number): number =>
  Math.round(Math.min(Math.max(opacity, 0), 1) * 100);

const getSelectionLabel = (selectionCount: number): string =>
  selectionCount === 1 ? "1 object" : `${selectionCount} objects`;

export function ObjectSettingsPanel({
  copySelection,
  deleteSelection,
  fillColor,
  hasSelection,
  lineWidth,
  mixedObjectSettings,
  opacity,
  selectionCount,
  setFillColor,
  setLineWidth,
  setOpacity,
  setStrokeColor,
  setTextAlign,
  showTextAlignment,
  strokeColor,
  textAlign,
  updateSelectionLayer,
  visible,
}: ObjectSettingsPanelProps) {
  const opacityPercent = clampOpacityPercent(opacity);

  const commitOpacity = (value: string): void => {
    const nextOpacityPercent = Number.parseInt(value, 10);

    if (Number.isFinite(nextOpacityPercent)) {
      setOpacity(nextOpacityPercent / 100);
    }
  };

  const handleOpacityKeyUp = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (OPACITY_KEYS.has(event.key)) {
      commitOpacity(event.currentTarget.value);
    }
  };

  return (
    <section
      aria-label="Object settings"
      className={cn(
        "fixed top-[76px] left-4 z-[9] grid w-[176px] gap-2 rounded-lg border border-border bg-[var(--editor-surface)] p-2 shadow-[0_18px_45px_rgba(16,16,16,0.13)] backdrop-blur-[18px] max-[760px]:top-[124px] max-[760px]:right-2.5 max-[760px]:left-2.5 max-[760px]:grid-cols-[repeat(auto-fit,minmax(150px,1fr))] max-[760px]:w-auto max-[760px]:max-w-[calc(100vw-20px)]",
        !visible && "hidden",
      )}
      data-object-settings-panel
      hidden={!visible}
    >
      <fieldset className={controlClassName} title="Stroke color">
        <legend className={legendClassName}>Stroke</legend>
        <div className={colorSwatchesClassName}>
          {STROKE_PRESETS.map((preset) => (
            <button
              key={preset.value}
              aria-label={`Stroke ${preset.label}`}
              aria-pressed={!mixedObjectSettings.stroke && strokeColor === preset.value}
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
      <fieldset className={controlClassName} title="Fill color">
        <legend className={legendClassName}>Fill</legend>
        <div className={colorSwatchesClassName}>
          {FILL_PRESETS.map((preset) => (
            <button
              key={preset.value}
              aria-label={`Fill ${preset.label}`}
              aria-pressed={!mixedObjectSettings.fill && fillColor === preset.value}
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
      <fieldset className={controlClassName} title="Stroke width">
        <legend className={legendClassName}>Width</legend>
        <div className="grid grid-cols-3 gap-1.5">
          {STROKE_WIDTH_PRESETS.map((preset) => (
            <button
              key={preset.value}
              aria-label={`${preset.label} stroke`}
              aria-pressed={!mixedObjectSettings.lineWidth && lineWidth === preset.value}
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
      <fieldset className={controlClassName} title="Opacity">
        <legend className={legendClassName}>
          <span>Opacity</span>
          <span data-opacity-value>
            {mixedObjectSettings.opacity ? "Mixed" : `${opacityPercent}%`}
          </span>
        </legend>
        <input
          aria-label="Opacity"
          aria-valuetext={`${opacityPercent}%`}
          className="h-5 w-full cursor-pointer accent-[var(--editor-accent)]"
          data-opacity-control
          defaultValue={opacityPercent}
          key={opacityPercent}
          max={100}
          min={0}
          onBlur={(event) => commitOpacity(event.currentTarget.value)}
          onKeyUp={handleOpacityKeyUp}
          onPointerUp={(event) => commitOpacity(event.currentTarget.value)}
          type="range"
        />
      </fieldset>
      <fieldset
        className={cn(controlClassName, !showTextAlignment && "hidden")}
        data-text-align-panel
        hidden={!showTextAlignment}
        title="Text alignment"
      >
        <legend className={legendClassName}>Text</legend>
        <div className="grid grid-cols-3 gap-1 rounded-[7px] bg-[rgba(255,255,255,0.65)] p-1">
          {TEXT_ALIGN_CONTROLS.map((control) => (
            <Button
              key={control.value}
              aria-label={control.label}
              aria-pressed={!mixedObjectSettings.textAlign && textAlign === control.value}
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
      </fieldset>
      <fieldset
        className={cn(controlClassName, !hasSelection && "hidden")}
        data-layer-panel
        hidden={!hasSelection}
        title="Layer controls"
      >
        <legend className={legendClassName}>
          <span>Layer</span>
          <span>{getSelectionLabel(selectionCount)}</span>
        </legend>
        <div className="grid grid-cols-4 gap-1">
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
      <div
        className={cn(
          "grid grid-cols-2 gap-1.5 border-t border-[rgba(22,22,22,0.09)] pt-2 max-[760px]:col-span-full",
          !hasSelection && "hidden",
        )}
        data-selection-actions
        hidden={!hasSelection}
      >
        <Button
          aria-label={selectionCount === 1 ? "Copy object" : "Copy objects"}
          className={cn(
            actionButtonClassName,
            "bg-[rgba(22,22,22,0.06)] text-[var(--editor-text)] hover:bg-[rgba(22,22,22,0.1)]",
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
            "bg-[#fff1ef] text-[#b3261e] hover:bg-[#ffe0dc] hover:text-[#8f1d18]",
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
    </section>
  );
}

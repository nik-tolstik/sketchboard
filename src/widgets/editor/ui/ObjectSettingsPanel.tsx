import { useEffect, useRef } from "react";

type ObjectSettingsPanelProps = {
  fillColor: string;
  setFillColor: (color: string) => void;
  setStrokeColor: (color: string) => void;
  strokeColor: string;
  visible: boolean;
};

export function ObjectSettingsPanel({
  fillColor,
  setFillColor,
  setStrokeColor,
  strokeColor,
  visible,
}: ObjectSettingsPanelProps) {
  const strokeColorInputRef = useRef<HTMLInputElement>(null);
  const fillColorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const input = strokeColorInputRef.current;

    if (!input) {
      return undefined;
    }

    const updateStrokeColor = (): void => setStrokeColor(input.value);

    input.addEventListener("change", updateStrokeColor);
    input.addEventListener("input", updateStrokeColor);

    return () => {
      input.removeEventListener("change", updateStrokeColor);
      input.removeEventListener("input", updateStrokeColor);
    };
  }, [setStrokeColor]);

  useEffect(() => {
    const input = fillColorInputRef.current;

    if (!input) {
      return undefined;
    }

    const updateFillColor = (): void => setFillColor(input.value);

    input.addEventListener("change", updateFillColor);
    input.addEventListener("input", updateFillColor);

    return () => {
      input.removeEventListener("change", updateFillColor);
      input.removeEventListener("input", updateFillColor);
    };
  }, [setFillColor]);

  return (
    <section
      aria-label="Object settings"
      className="object-settings-panel"
      data-object-settings-panel
      hidden={!visible}
    >
      <label className="color-control" title="Stroke color">
        <span>Stroke</span>
        <input
          ref={strokeColorInputRef}
          data-stroke-color
          onChange={(event) => setStrokeColor(event.target.value)}
          type="color"
          value={strokeColor}
        />
      </label>
      <label className="color-control" title="Fill color">
        <span>Fill</span>
        <input
          ref={fillColorInputRef}
          data-fill-color
          onChange={(event) => setFillColor(event.target.value)}
          type="color"
          value={fillColor}
        />
      </label>
    </section>
  );
}

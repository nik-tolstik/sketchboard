import { cn } from "@/shared/lib/utils";

import { isObjectTool } from "../config/editorConfig";
import { useEditorRuntime } from "../model/useEditorRuntime";
import { BorderRadiusSection } from "./object-settings/BorderRadiusSection";
import { FillColorSection } from "./object-settings/FillColorSection";
import { LayerControlsSection } from "./object-settings/LayerControlsSection";
import { OpacitySection } from "./object-settings/OpacitySection";
import { SelectionActionsSection } from "./object-settings/SelectionActionsSection";
import { StrokeColorSection } from "./object-settings/StrokeColorSection";
import { StrokeWidthSection } from "./object-settings/StrokeWidthSection";
import { TextAlignmentSection } from "./object-settings/TextAlignmentSection";

export function ObjectSettingsPanel() {
  const activeTool = useEditorRuntime((runtime) => runtime.activeTool);
  const hasSelection = useEditorRuntime((runtime) => runtime.hasSelection);

  const visible = isObjectTool(activeTool) || hasSelection;

  return (
    <section
      aria-label="Object settings"
      className={cn(
        "fixed top-19 left-4 z-[9] grid max-h-[calc(100vh-96px)] w-[200px] overflow-y-auto rounded-lg border border-border bg-popover/95 shadow-xl backdrop-blur-[18px] max-[760px]:top-[124px] max-[760px]:right-2.5 max-[760px]:left-2.5 max-[760px]:max-h-[calc(100vh-140px)] max-[760px]:w-auto max-[760px]:max-w-[calc(100vw-20px)] max-[760px]:grid-cols-[repeat(auto-fit,minmax(204px,1fr))]",
        !visible && "hidden",
      )}
      data-object-settings-panel
      hidden={!visible}
    >
      <StrokeColorSection />
      <FillColorSection />
      <StrokeWidthSection />
      <BorderRadiusSection />
      <OpacitySection />
      <TextAlignmentSection />
      <LayerControlsSection />
      <SelectionActionsSection />
    </section>
  );
}

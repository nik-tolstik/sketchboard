import type { Tool } from "@/entities/scene";
import { cn } from "@/shared/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";

import { TOOLS, getToolTitle } from "../config/editorConfig";
import { useEditorRuntime } from "../model/useEditorRuntime";
import { EditorIcon } from "./EditorIcon";
import { iconButtonClassName } from "./editorPanelClasses";

const toolIds: ReadonlySet<string> = new Set(TOOLS.map((tool) => tool.id));

const isTool = (value: string | undefined): value is Tool =>
  value !== undefined && toolIds.has(value);

export function ToolPalette() {
  const activeTool = useEditorRuntime((runtime) => runtime.activeTool);
  const setTool = useEditorRuntime((runtime) => runtime.setTool);

  const handleToolChange = (value: string[]): void => {
    const [nextTool] = value;

    if (isTool(nextTool)) {
      setTool(nextTool);
    }
  };

  return (
    <ToggleGroup
      aria-label="Drawing tools"
      className={
        "pointer-events-auto inline-flex justify-self-center gap-[3px] rounded-lg p-[5px] max-[760px]:max-w-[calc(100vw-20px)] max-[760px]:overflow-x-auto"
      }
      onValueChange={handleToolChange}
      spacing={1}
      value={[activeTool]}
      variant="outline"
    >
      {TOOLS.map((tool) => (
        <Tooltip key={tool.id}>
          <TooltipTrigger
            delay={0}
            render={
              <ToggleGroupItem
                aria-label={tool.label}
                className={cn(
                  iconButtonClassName,
                  "editor-tool-button relative data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground aria-pressed:bg-primary aria-pressed:text-primary-foreground",
                )}
                data-tool={tool.id}
                value={tool.id}
              />
            }
          >
            <EditorIcon name={tool.id} />
            <span
              aria-hidden="true"
              className="editor-tool-button__shortcut pointer-events-none absolute right-1 bottom-[3px] inline-grid size-2.5 place-items-center rounded-full text-[8px] leading-none font-semibold text-current"
            >
              {tool.numericShortcut}
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom">{getToolTitle(tool)}</TooltipContent>
        </Tooltip>
      ))}
    </ToggleGroup>
  );
}

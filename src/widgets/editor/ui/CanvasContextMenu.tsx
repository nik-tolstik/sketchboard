import {
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@/shared/ui/context-menu";

import { LAYER_CONTROLS } from "../config/editorConfig";
import { useEditorRuntime } from "../model/useEditorRuntime";

export function CanvasContextMenuContent() {
  const canPaste = useEditorRuntime((runtime) => runtime.canPaste);
  const clearScene = useEditorRuntime((runtime) => runtime.clearScene);
  const copySelection = useEditorRuntime((runtime) => runtime.copySelection);
  const cutSelection = useEditorRuntime((runtime) => runtime.cutSelection);
  const deleteSelection = useEditorRuntime((runtime) => runtime.deleteSelection);
  const hasSceneElements = useEditorRuntime((runtime) => runtime.hasSceneElements);
  const hasSelection = useEditorRuntime((runtime) => runtime.hasSelection);
  const pasteSelection = useEditorRuntime((runtime) => runtime.pasteSelection);
  const updateSelectionLayer = useEditorRuntime((runtime) => runtime.updateSelectionLayer);

  return (
    <ContextMenuContent data-canvas-context-menu>
      <ContextMenuGroup>
        <ContextMenuItem
          data-context-action="copy"
          disabled={!hasSelection}
          onClick={copySelection}
        >
          Копировать
          <ContextMenuShortcut>Ctrl/Cmd+C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem data-context-action="cut" disabled={!hasSelection} onClick={cutSelection}>
          Вырезать
          <ContextMenuShortcut>Ctrl/Cmd+X</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem data-context-action="paste" disabled={!canPaste} onClick={pasteSelection}>
          Вставить
          <ContextMenuShortcut>Ctrl/Cmd+V</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuGroup>

      <ContextMenuSeparator />

      {hasSelection ? (
        <>
          <ContextMenuSub>
            <ContextMenuSubTrigger data-context-action="layers">Слои</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuGroup>
                {LAYER_CONTROLS.map((control) => (
                  <ContextMenuItem
                    key={control.action}
                    data-context-layer-action={control.action}
                    onClick={() => updateSelectionLayer(control.action)}
                  >
                    {control.label}
                  </ContextMenuItem>
                ))}
              </ContextMenuGroup>
            </ContextMenuSubContent>
          </ContextMenuSub>

          <ContextMenuSeparator />
        </>
      ) : null}

      <ContextMenuGroup>
        <ContextMenuItem
          data-context-action="delete"
          disabled={!hasSelection}
          onClick={deleteSelection}
          variant="destructive"
        >
          Удалить
          <ContextMenuShortcut>Del</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem
          data-context-action="delete-all"
          disabled={!hasSceneElements}
          onClick={clearScene}
          variant="destructive"
        >
          Удалить всё
        </ContextMenuItem>
      </ContextMenuGroup>
    </ContextMenuContent>
  );
}

import { AppIdentity } from "./AppIdentity";
import { SceneActions } from "./SceneActions";
import { ToolPalette } from "./ToolPalette";

export function EditorHeader() {
  return (
    <header
      className="pointer-events-none fixed top-[14px] right-[14px] left-[14px] z-10 grid grid-cols-[minmax(140px,1fr)_auto_minmax(190px,1fr)] items-center gap-3 max-[760px]:top-2.5 max-[760px]:right-2.5 max-[760px]:left-2.5 max-[760px]:grid-cols-1 max-[760px]:justify-items-center"
      aria-label="Whiteboard controls"
    >
      <AppIdentity />
      <ToolPalette />
      <SceneActions />
    </header>
  );
}

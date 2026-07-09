import { CanvasSurface } from "./CanvasSurface";
import { EditorHeader } from "./EditorHeader";
import { ObjectSettingsPanel } from "./ObjectSettingsPanel";
import { ZoomPanel } from "./ZoomPanel";

export function EditorRuntimeView() {
  return (
    <main className="relative h-screen w-screen bg-background">
      <EditorHeader />

      <div className="canvas-frame relative h-full w-full">
        <CanvasSurface />
        <ObjectSettingsPanel />
        <ZoomPanel />
      </div>
    </main>
  );
}

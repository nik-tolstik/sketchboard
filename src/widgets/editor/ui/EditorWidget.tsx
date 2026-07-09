import { EditorRuntimeProvider } from "../model/EditorRuntimeProvider";
import { EditorRuntimeView } from "./EditorRuntimeView";

export function EditorWidget() {
  return (
    <EditorRuntimeProvider>
      <EditorRuntimeView />
    </EditorRuntimeProvider>
  );
}

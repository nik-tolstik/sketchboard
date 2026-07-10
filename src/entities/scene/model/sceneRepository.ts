import type { SceneSnapshot } from "./elements";

export interface SceneRepository {
  load(): Promise<SceneSnapshot>;
  save(scene: SceneSnapshot): Promise<void>;
}

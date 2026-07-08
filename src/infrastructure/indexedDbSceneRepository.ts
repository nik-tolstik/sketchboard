import type { SceneSnapshot } from "../domain/elements";
import { createEmptyScene, normalizeScene } from "../domain/scene";

const DB_NAME = "sketchboard-db";
const STORE_NAME = "scenes";
const SCENE_KEY = "default-scene";
const DB_VERSION = 1;

type StoredScene = SceneSnapshot & {
  key: typeof SCENE_KEY;
};

const openDatabase = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };
  });

const runTransaction = async <T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> => {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    const request = operation(store);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };
  });
};

export class IndexedDbSceneRepository {
  async load(): Promise<SceneSnapshot> {
    if (!("indexedDB" in window)) {
      return createEmptyScene();
    }

    const stored = await runTransaction<StoredScene | undefined>("readonly", (store) =>
      store.get(SCENE_KEY),
    );

    return normalizeScene(stored);
  }

  async save(scene: SceneSnapshot): Promise<void> {
    if (!("indexedDB" in window)) {
      return;
    }

    await runTransaction<IDBValidKey>("readwrite", (store) =>
      store.put({ ...scene, key: SCENE_KEY } satisfies StoredScene),
    );
  }

  async clear(): Promise<void> {
    if (!("indexedDB" in window)) {
      return;
    }

    await runTransaction<undefined>("readwrite", (store) => store.delete(SCENE_KEY));
  }
}

import { expect, test, type Page } from "@playwright/test";

type PersistedElement = {
  layer?: number;
  text?: string;
  type?: string;
  x?: number;
  y?: number;
};

type PersistedScene = {
  elements?: PersistedElement[];
};

const readPersistedElements = async (page: Page): Promise<PersistedElement[]> =>
  page.evaluate(
    () =>
      new Promise<PersistedElement[]>((resolve, reject) => {
        const request = indexedDB.open("sketchboard-db", 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const database = request.result;
          const transaction = database.transaction("scenes", "readonly");
          const store = transaction.objectStore("scenes");
          const getRequest = store.get("default-scene");

          getRequest.onerror = () => {
            database.close();
            reject(getRequest.error);
          };
          getRequest.onsuccess = () => {
            database.close();
            const scene = getRequest.result as PersistedScene | undefined;
            resolve(scene?.elements ?? []);
          };
        };
      }),
  );

const addText = async (
  page: Page,
  position: { x: number; y: number },
  text: string,
): Promise<void> => {
  const previousCount = (await readPersistedElements(page)).length;

  await page.getByRole("button", { name: "Text", exact: true }).click();
  await page.locator("[data-canvas]").click({ position });
  await page.locator("[data-text-editor]").fill(text);
  await page.locator("[data-text-editor]").press("Control+Enter");
  await expect.poll(() => readPersistedElements(page)).toHaveLength(previousCount + 1);
};

const openContextMenu = async (page: Page, position: { x: number; y: number }) => {
  await page.locator("[data-canvas]").click({ button: "right", position });

  const menu = page.locator("[data-canvas-context-menu]");
  await expect(menu).toBeVisible();

  return menu;
};

const applyLayerAction = async (
  page: Page,
  position: { x: number; y: number },
  action: "back" | "backward" | "forward" | "front",
): Promise<void> => {
  const menu = await openContextMenu(page, position);

  await menu.locator('[data-context-action="layers"]').hover();

  const layerAction = page.locator(`[data-context-layer-action="${action}"]`);
  await expect(layerAction).toBeVisible();
  await layerAction.click();
};

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Text", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await expect.poll(() => readPersistedElements(page)).toEqual([]);
});

test("opens on secondary click without starting a canvas interaction", async ({ page }) => {
  await page.getByRole("button", { name: "Rectangle", exact: true }).click();

  const menu = await openContextMenu(page, { x: 360, y: 280 });

  await expect(page.locator("[data-canvas]")).toHaveAttribute("data-tool", "rectangle");
  await expect(menu.locator('[data-context-action="copy"]')).toBeDisabled();
  await expect(menu.locator('[data-context-action="cut"]')).toBeDisabled();
  await expect(menu.locator('[data-context-action="paste"]')).toBeDisabled();
  await expect(menu.locator('[data-context-action="layers"]')).toHaveCount(0);
  await expect(menu.locator('[data-context-action="delete"]')).toBeDisabled();
  await expect(menu.locator('[data-context-action="delete-all"]')).toBeDisabled();

  await page.keyboard.press("Escape");
  await expect.poll(() => readPersistedElements(page)).toEqual([]);
});

test("targets the clicked selection and supports copy, paste, cut, and undo", async ({ page }) => {
  const firstPosition = { x: 280, y: 260 };
  const secondPosition = { x: 420, y: 260 };
  const pastePosition = { x: 540, y: 380 };

  await addText(page, firstPosition, "First");
  await addText(page, secondPosition, "Second");

  let menu = await openContextMenu(page, firstPosition);
  await expect(page.locator("[data-layer-panel]")).toContainText("1 object");
  await menu.locator('[data-context-action="copy"]').click();

  await page.locator("[data-canvas]").click({ modifiers: ["Shift"], position: secondPosition });
  await expect(page.locator("[data-layer-panel]")).toContainText("2 objects");

  menu = await openContextMenu(page, secondPosition);
  await expect(page.locator("[data-layer-panel]")).toContainText("2 objects");
  await menu.locator('[data-context-action="copy"]').click();

  menu = await openContextMenu(page, pastePosition);
  await expect(page.locator("[data-layer-panel]")).toBeHidden();
  await expect(menu.locator('[data-context-action="copy"]')).toBeDisabled();
  await expect(menu.locator('[data-context-action="paste"]')).toBeEnabled();
  await menu.locator('[data-context-action="paste"]').click();

  await expect.poll(() => readPersistedElements(page)).toHaveLength(4);
  await expect(page.locator("[data-layer-panel]")).toContainText("2 objects");

  const elementsAfterPaste = await readPersistedElements(page);
  expect(elementsAfterPaste[2]).toMatchObject({
    text: "First",
    x: pastePosition.x,
    y: pastePosition.y,
  });
  expect(elementsAfterPaste[3]?.text).toBe("Second");

  menu = await openContextMenu(page, pastePosition);
  await menu.locator('[data-context-action="cut"]').click();
  await expect.poll(() => readPersistedElements(page)).toHaveLength(2);

  await page.keyboard.press("Control+Z");
  await expect.poll(() => readPersistedElements(page)).toHaveLength(4);

  menu = await openContextMenu(page, { x: 760, y: 500 });
  await expect(menu.locator('[data-context-action="paste"]')).toBeEnabled();
  await menu.locator('[data-context-action="paste"]').click();
  await expect.poll(() => readPersistedElements(page)).toHaveLength(6);
});

test("deletes one object or the whole scene as undoable actions", async ({ page }) => {
  const firstPosition = { x: 300, y: 260 };

  await addText(page, firstPosition, "Keep me");
  await addText(page, { x: 470, y: 260 }, "Second");

  let menu = await openContextMenu(page, firstPosition);
  await menu.locator('[data-context-action="delete"]').click();
  await expect.poll(() => readPersistedElements(page)).toHaveLength(1);

  await page.keyboard.press("Control+Z");
  await expect.poll(() => readPersistedElements(page)).toHaveLength(2);

  menu = await openContextMenu(page, { x: 760, y: 500 });
  await expect(menu.locator('[data-context-action="delete"]')).toBeDisabled();
  await expect(menu.locator('[data-context-action="delete-all"]')).toBeEnabled();
  await menu.locator('[data-context-action="delete-all"]').click();
  await expect.poll(() => readPersistedElements(page)).toEqual([]);

  await page.keyboard.press("Control+Z");
  await expect.poll(() => readPersistedElements(page)).toHaveLength(2);
});

test("runs all layer-order actions from the submenu", async ({ page }) => {
  const firstPosition = { x: 300, y: 260 };
  const secondPosition = { x: 500, y: 260 };
  const readLayers = async (): Promise<number[]> =>
    (await readPersistedElements(page)).map((element) => element.layer ?? -1);

  await addText(page, firstPosition, "First layer");
  await addText(page, secondPosition, "Second layer");
  await expect.poll(readLayers).toEqual([0, 1]);

  await applyLayerAction(page, secondPosition, "backward");
  await expect.poll(readLayers).toEqual([1, 0]);

  await applyLayerAction(page, secondPosition, "forward");
  await expect.poll(readLayers).toEqual([0, 1]);

  await applyLayerAction(page, firstPosition, "front");
  await expect.poll(readLayers).toEqual([1, 0]);

  await applyLayerAction(page, firstPosition, "back");
  await expect.poll(readLayers).toEqual([0, 1]);

  await page.keyboard.press("Control+Z");
  await expect.poll(readLayers).toEqual([1, 0]);
});

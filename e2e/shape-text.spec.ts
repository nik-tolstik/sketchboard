import { expect, test, type Page } from "@playwright/test";

type ShapeType = "rectangle" | "diamond" | "ellipse";

type Point = {
  x: number;
  y: number;
};

type CanvasRegion = Point & {
  height: number;
  width: number;
};

type PixelBounds = {
  maxX: number;
  maxY: number;
  minX: number;
  minY: number;
};

type PersistedShape = {
  fontSize?: number;
  height?: number;
  text?: string;
  textAlign?: string;
  type?: string;
  width?: number;
  x?: number;
  y?: number;
};

type PersistedScene = {
  elements?: PersistedShape[];
};

const readPersistedShapes = async (page: Page): Promise<PersistedShape[]> =>
  page.evaluate(
    () =>
      new Promise<PersistedShape[]>((resolve, reject) => {
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
            const scene = getRequest.result as PersistedScene | undefined;

            database.close();
            resolve(scene?.elements ?? []);
          };
        };
      }),
  );

const dragCanvas = async (page: Page, start: Point, end: Point): Promise<void> => {
  const canvas = page.locator("[data-canvas]");
  const bounds = await canvas.boundingBox();

  expect(bounds).not.toBeNull();
  await page.mouse.move(bounds!.x + start.x, bounds!.y + start.y);
  await page.mouse.down();
  await page.mouse.move(bounds!.x + end.x, bounds!.y + end.y, { steps: 5 });
  await page.mouse.up();
};

const countNonWhiteCanvasPixels = async (page: Page, region: CanvasRegion): Promise<number> =>
  page.locator("[data-canvas]").evaluate((element, currentRegion) => {
    const canvas = element as HTMLCanvasElement;
    const context = canvas.getContext("2d");

    if (!context) {
      return 0;
    }

    const bounds = canvas.getBoundingClientRect();
    const scaleX = canvas.width / bounds.width;
    const scaleY = canvas.height / bounds.height;
    const image = context.getImageData(
      Math.floor(currentRegion.x * scaleX),
      Math.floor(currentRegion.y * scaleY),
      Math.max(1, Math.ceil(currentRegion.width * scaleX)),
      Math.max(1, Math.ceil(currentRegion.height * scaleY)),
    );
    let count = 0;

    for (let index = 0; index < image.data.length; index += 4) {
      const red = image.data[index] ?? 255;
      const green = image.data[index + 1] ?? 255;
      const blue = image.data[index + 2] ?? 255;

      if (red < 245 || green < 245 || blue < 245) {
        count += 1;
      }
    }

    return count;
  }, region);

const getDarkScreenshotPixelBounds = async (
  page: Page,
  region: CanvasRegion,
): Promise<PixelBounds> => {
  const screenshot = await page.screenshot({ clip: region });
  const dataUrl = `data:image/png;base64,${screenshot.toString("base64")}`;

  return page.evaluate(
    async ({ height, imageUrl, width }) => {
      const image = new Image();
      image.src = imageUrl;
      await image.decode();

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Screenshot canvas context is unavailable");
      }

      context.drawImage(image, 0, 0);
      const pixels = context.getImageData(0, 0, width, height).data;
      let minX = width;
      let minY = height;
      let maxX = -1;
      let maxY = -1;

      for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
          const index = (y * width + x) * 4;
          const red = pixels[index] ?? 255;
          const green = pixels[index + 1] ?? 255;
          const blue = pixels[index + 2] ?? 255;

          if (red < 100 && green < 100 && blue < 100) {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        }
      }

      if (maxX < 0 || maxY < 0) {
        throw new Error("Screenshot contains no dark text pixels");
      }

      return { minX, minY, maxX, maxY };
    },
    { height: region.height, imageUrl: dataUrl, width: region.width },
  );
};

const createShape = async (
  page: Page,
  type: ShapeType,
  start: Point,
  end: Point,
): Promise<void> => {
  await page.getByRole("button", { name: new RegExp(`^${type}$`, "i") }).click();
  await dragCanvas(page, start, end);
  await expect(page.locator('[data-tool="select"][aria-pressed="true"]')).toBeVisible();
};

const setShapeText = async (page: Page, point: Point, text: string): Promise<void> => {
  const editor = page.locator("[data-text-editor]");

  await page.locator("[data-canvas]").dblclick({ position: point });
  await expect(editor).toBeVisible();
  await editor.fill(text);
  await editor.press("Control+Enter");
  await expect(editor).toBeHidden();
};

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Clear" })).toBeVisible();
  await page.getByRole("button", { name: "Clear" }).click();
  await expect.poll(() => readPersistedShapes(page)).toEqual([]);
});

test("adds centered persisted text to rectangle, diamond, and ellipse", async ({ page }) => {
  const cases: Array<{
    end: Point;
    label: string;
    start: Point;
    type: ShapeType;
  }> = [
    {
      type: "rectangle",
      start: { x: 260, y: 180 },
      end: { x: 440, y: 280 },
      label: "Rectangle label",
    },
    {
      type: "diamond",
      start: { x: 500, y: 180 },
      end: { x: 680, y: 280 },
      label: "Diamond label",
    },
    {
      type: "ellipse",
      start: { x: 740, y: 180 },
      end: { x: 920, y: 280 },
      label: "Ellipse label",
    },
  ];

  for (const currentCase of cases) {
    await createShape(page, currentCase.type, currentCase.start, currentCase.end);
    const center = {
      x: (currentCase.start.x + currentCase.end.x) / 2,
      y: (currentCase.start.y + currentCase.end.y) / 2,
    };

    await page.locator("[data-canvas]").dblclick({ position: center });
    const editor = page.locator("[data-text-editor]");

    await expect(editor).toBeVisible();
    await expect(page.locator("[data-text-align-panel]")).toBeVisible();
    await expect(page.locator('[data-text-align="center"]')).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await editor.fill(currentCase.label);
    await editor.press("Control+Enter");
  }

  await expect
    .poll(() => readPersistedShapes(page))
    .toMatchObject(
      cases.map((currentCase) => ({
        type: currentCase.type,
        text: currentCase.label,
        textAlign: "center",
        fontSize: 24,
      })),
    );

  await page.reload();
  await expect
    .poll(() => readPersistedShapes(page).then((shapes) => shapes.map((shape) => shape.text)))
    .toEqual(cases.map((currentCase) => currentCase.label));
});

test("keeps the shape visible while editing and supports cancel, clear, align, and undo", async ({
  page,
}) => {
  const start = { x: 300, y: 200 };
  const end = { x: 520, y: 320 };
  const center = { x: 410, y: 260 };
  const editor = page.locator("[data-text-editor]");

  await createShape(page, "rectangle", start, end);
  await setShapeText(page, center, "Original label");

  await page.locator("[data-canvas]").dblclick({ position: center });
  await expect(editor).toBeVisible();
  await expect
    .poll(() =>
      countNonWhiteCanvasPixels(page, {
        x: start.x,
        y: start.y - 3,
        width: end.x - start.x,
        height: 7,
      }),
    )
    .toBeGreaterThan(80);
  await editor.fill("Cancelled label");
  await editor.press("Escape");
  await expect.poll(() => readPersistedShapes(page)).toMatchObject([{ text: "Original label" }]);

  await page.locator('[data-text-align="right"]').click();
  await expect.poll(() => readPersistedShapes(page)).toMatchObject([{ textAlign: "right" }]);

  await page.locator("[data-canvas]").dblclick({ position: center });
  await editor.fill("");
  await editor.press("Control+Enter");
  await expect.poll(() => readPersistedShapes(page)).toMatchObject([{ text: "" }]);

  await page.keyboard.press("Control+z");
  await expect.poll(() => readPersistedShapes(page)).toMatchObject([{ text: "Original label" }]);
});

test("reflows shape text after resize without scaling its font", async ({ page }) => {
  const start = { x: 300, y: 220 };
  const end = { x: 580, y: 340 };
  const center = { x: 440, y: 280 };

  await createShape(page, "rectangle", start, end);
  await setShapeText(
    page,
    center,
    "A long label that should wrap after the rectangle gets narrower",
  );

  await dragCanvas(page, { x: end.x, y: center.y }, { x: 430, y: center.y });

  await expect
    .poll(async () => {
      const [shape] = await readPersistedShapes(page);

      return { fontSize: shape?.fontSize, text: shape?.text, width: shape?.width };
    })
    .toMatchObject({
      fontSize: 24,
      text: "A long label that should wrap after the rectangle gets narrower",
      width: 130,
    });

  await page.locator("[data-canvas]").dblclick({ position: { x: 365, y: center.y } });
  const editor = page.locator("[data-text-editor]");

  await expect(editor).toBeVisible();
  const editorBox = await editor.boundingBox();
  expect(editorBox?.width).toBeCloseTo(130, 0);
});

test("keeps shape text at the same visual position while editing", async ({ page }) => {
  const start = { x: 320, y: 220 };
  const end = { x: 620, y: 380 };
  const center = { x: 470, y: 300 };
  const textRegion = { x: 340, y: 240, width: 260, height: 120 };

  await createShape(page, "rectangle", start, end);
  await setShapeText(page, center, "Nikita");
  const readBounds = await getDarkScreenshotPixelBounds(page, textRegion);

  await page.locator("[data-canvas]").dblclick({ position: center });
  const editor = page.locator("[data-text-editor]");
  await expect(editor).toBeVisible();
  await editor.evaluate((element) => {
    element.style.caretColor = "transparent";
  });
  const editBounds = await getDarkScreenshotPixelBounds(page, textRegion);

  expect(editBounds.minY).toBeCloseTo(readBounds.minY, 0);
  expect(editBounds.maxY).toBeCloseTo(readBounds.maxY, 0);
});

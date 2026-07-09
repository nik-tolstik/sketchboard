import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  DEFAULT_TEXT_ALIGN,
  DEFAULT_STYLE,
  IndexedDbSceneRepository,
  SceneStore,
  getTextElementWidth,
  type SaveState,
  type TextAlign,
  type Tool,
} from "@/entities/scene";

import { TOOLS } from "../config/editorConfig";
import { CanvasRenderer, type CanvasRenderOptions } from "../lib/CanvasRenderer";
import { getInlineTextEditorMetrics } from "../lib/textEditorMetrics";
import { measureTextElementWidth } from "../lib/textMeasurement";
import { EditorController, type ObjectSettingsSnapshot } from "./EditorController";
import { EditorRuntimeContext, type EditorRuntime } from "./useEditorRuntime";

const DEFAULT_STROKE_COLOR = DEFAULT_STYLE.stroke;
const DEFAULT_FILL_COLOR = DEFAULT_STYLE.fill;
const DEFAULT_LINE_WIDTH = DEFAULT_STYLE.lineWidth;
const DEFAULT_OPACITY = DEFAULT_STYLE.opacity;

type EditorRuntimeProviderProps = {
  children: ReactNode;
};

type TextEditorOptions = {
  initialText?: string;
  fontSize?: number;
  textColor?: string;
  textAlign?: TextAlign;
  onCommit: (text: string) => void;
  onCancel?: () => void;
};

const initialMixedObjectSettings: ObjectSettingsSnapshot["mixed"] = {
  fill: false,
  lineWidth: false,
  opacity: false,
  stroke: false,
  textAlign: false,
};

const isTextInputTarget = (target: EventTarget | null): boolean => {
  const element = target as HTMLElement | null;

  return element?.tagName === "TEXTAREA" || element?.tagName === "INPUT";
};

export function EditorRuntimeProvider({ children }: EditorRuntimeProviderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textEditorRef = useRef<HTMLTextAreaElement>(null);
  const controllerRef = useRef<EditorController | null>(null);
  const storeRef = useRef<SceneStore | null>(null);

  const [activeTool, setActiveTool] = useState<Tool>("select");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [isPanning, setIsPanning] = useState(false);
  const [strokeColor, setStrokeColorState] = useState(DEFAULT_STROKE_COLOR);
  const [fillColor, setFillColorState] = useState(DEFAULT_FILL_COLOR);
  const [lineWidth, setLineWidthState] = useState(DEFAULT_LINE_WIDTH);
  const [opacity, setOpacityState] = useState(DEFAULT_OPACITY);
  const [textAlign, setTextAlignState] = useState<TextAlign>(DEFAULT_TEXT_ALIGN);
  const [hasSelection, setHasSelection] = useState(false);
  const [hasTextSelection, setHasTextSelection] = useState(false);
  const [selectionCount, setSelectionCount] = useState(0);
  const [mixedObjectSettings, setMixedObjectSettings] = useState(initialMixedObjectSettings);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    const textEditor = textEditorRef.current;

    if (!canvas || !textEditor) {
      return undefined;
    }

    const repository = new IndexedDbSceneRepository();
    const store = new SceneStore(repository);
    const renderer = new CanvasRenderer(canvas);
    let latestScene = store.getSnapshot();
    let latestRenderOptions: CanvasRenderOptions = {};
    let closeOpenTextEditor: (() => void) | undefined;

    const renderWithPreview = (options: CanvasRenderOptions = {}): void => {
      latestRenderOptions = options;
      renderer.render(latestScene, options);
    };

    const updateObjectSettingsState = (): void => {
      const settings = controller.getObjectSettings();

      setHasSelection(settings.hasSelection);
      setHasTextSelection(settings.hasTextSelection);
      setSelectionCount(settings.selectionCount);
      setStrokeColorState(settings.style.stroke);
      setFillColorState(settings.style.fill);
      setLineWidthState(settings.style.lineWidth);
      setOpacityState(settings.style.opacity);
      setTextAlignState(settings.textAlign);
      setMixedObjectSettings(settings.mixed);
    };

    const openTextEditor = (
      screenPoint: { x: number; y: number },
      options: TextEditorOptions,
    ): void => {
      closeOpenTextEditor?.();

      const viewportZoom = latestScene.viewport.zoom;
      const baseFontSize = options.fontSize ?? 24;
      let isOpen = true;
      let shouldCommit = true;

      const measureTextWidth = (text: string, fontSize: number): number => {
        const context = canvas.getContext("2d");

        return context
          ? measureTextElementWidth(context, text, fontSize)
          : getTextElementWidth(text, fontSize);
      };

      const resizeEditor = (): void => {
        const metrics = getInlineTextEditorMetrics({
          text: textEditor.value,
          fontSize: baseFontSize,
          viewportZoom,
          measureTextWidth,
        });

        textEditor.style.width = `${metrics.width}px`;
        textEditor.style.height = `${metrics.height}px`;
        textEditor.style.fontSize = `${metrics.fontSize}px`;
        textEditor.style.transform = `scale(${metrics.scale})`;
      };

      const close = (): void => {
        if (!isOpen) {
          return;
        }

        isOpen = false;
        textEditor.removeAttribute("data-open");
        textEditor.removeEventListener("input", resizeEditor);
        textEditor.onblur = null;
        textEditor.onkeydown = null;
        closeOpenTextEditor = undefined;

        if (shouldCommit) {
          options.onCommit(textEditor.value);
        } else {
          options.onCancel?.();
        }
      };

      const cancel = (): void => {
        shouldCommit = false;
        close();
      };

      closeOpenTextEditor = close;
      textEditor.value = options.initialText ?? "";
      textEditor.dataset.open = "true";
      textEditor.style.left = `${screenPoint.x}px`;
      textEditor.style.top = `${screenPoint.y}px`;
      textEditor.style.color = options.textColor ?? "var(--text)";
      textEditor.style.textAlign = options.textAlign ?? DEFAULT_TEXT_ALIGN;
      textEditor.addEventListener("input", resizeEditor);
      textEditor.onblur = close;
      textEditor.onkeydown = (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          cancel();
          return;
        }

        if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
          event.preventDefault();
          close();
        }
      };
      resizeEditor();
      window.setTimeout(() => {
        if (isOpen) {
          textEditor.focus();
          textEditor.setSelectionRange(textEditor.value.length, textEditor.value.length);
        }
      }, 0);
    };

    const controller = new EditorController(
      canvas,
      store,
      renderWithPreview,
      (nextIsPanning) => {
        canvas.dataset.panning = String(nextIsPanning);
        setIsPanning(nextIsPanning);
      },
      openTextEditor,
      updateObjectSettingsState,
      setActiveTool,
    );

    controllerRef.current = controller;
    storeRef.current = store;
    setActiveTool(controller.getTool());
    updateObjectSettingsState();

    const resizeObserver = new ResizeObserver(() => {
      renderer.resize();
      renderer.render(latestScene, latestRenderOptions);
    });

    resizeObserver.observe(canvas);
    renderer.resize();

    const unsubscribeScene = store.subscribe((scene) => {
      latestScene = scene;
      setZoom(scene.viewport.zoom);
      renderer.render(scene, latestRenderOptions);
      controller.refreshSelection();
    });

    const unsubscribeSaveState = store.subscribeSaveState(setSaveState);

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (isTextInputTarget(event.target)) {
        return;
      }

      const currentController = controllerRef.current;
      const currentStore = storeRef.current;

      if (!currentController || !currentStore) {
        return;
      }

      const isModifierShortcut = event.ctrlKey || event.metaKey;
      const isZKey = event.key.toLowerCase() === "z" || event.code === "KeyZ";
      const isAKey = event.key.toLowerCase() === "a" || event.code === "KeyA";
      const isCKey = event.key.toLowerCase() === "c" || event.code === "KeyC";
      const isVKey = event.key.toLowerCase() === "v" || event.code === "KeyV";
      const isZoomInKey =
        event.key === "+" ||
        event.key === "=" ||
        event.code === "Equal" ||
        event.code === "NumpadAdd";
      const isZoomOutKey =
        event.key === "-" ||
        event.key === "_" ||
        event.code === "Minus" ||
        event.code === "NumpadSubtract";
      const isResetZoomKey =
        event.key === "0" || event.code === "Digit0" || event.code === "Numpad0";

      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        currentController.deleteSelection();
        return;
      }

      if (isModifierShortcut && isZKey) {
        event.preventDefault();

        if (event.shiftKey) {
          currentStore.redo();
        } else {
          currentStore.undo();
        }

        currentController.refreshSelection();
        return;
      }

      if (isModifierShortcut && isAKey) {
        event.preventDefault();
        currentController.selectAll();
        return;
      }

      if (isModifierShortcut && isCKey) {
        event.preventDefault();
        currentController.copySelection();
        return;
      }

      if (isModifierShortcut && isVKey) {
        event.preventDefault();
        currentController.pasteSelection();
        return;
      }

      if (isModifierShortcut && isZoomInKey) {
        event.preventDefault();
        currentController.zoomIn();
        return;
      }

      if (isModifierShortcut && isZoomOutKey) {
        event.preventDefault();
        currentController.zoomOut();
        return;
      }

      if (isModifierShortcut && isResetZoomKey) {
        event.preventDefault();
        currentController.resetZoom();
        return;
      }

      if (isModifierShortcut) {
        return;
      }

      const nextTool = TOOLS.find(
        (candidate) =>
          candidate.shortcut.toLowerCase() === event.key.toLowerCase() ||
          candidate.numericShortcut === event.key,
      );

      if (!nextTool) {
        return;
      }

      currentController.setTool(nextTool.id);
    };

    window.addEventListener("keydown", handleKeyDown);
    void store.hydrate();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      unsubscribeScene();
      unsubscribeSaveState();
      resizeObserver.disconnect();
      closeOpenTextEditor?.();
      controller.destroy();
      controllerRef.current = null;
      storeRef.current = null;
      setIsPanning(false);
      setHasSelection(false);
      setHasTextSelection(false);
      setSelectionCount(0);
      setMixedObjectSettings(initialMixedObjectSettings);
      setZoom(1);
    };
  }, []);

  const setTool = useCallback((tool: Tool): void => {
    controllerRef.current?.setTool(tool);
  }, []);

  const setStrokeColor = useCallback((color: string): void => {
    setStrokeColorState(color);
    controllerRef.current?.setStyle({ stroke: color });
  }, []);

  const setFillColor = useCallback((color: string): void => {
    setFillColorState(color);
    controllerRef.current?.setStyle({ fill: color });
  }, []);

  const setLineWidth = useCallback((nextLineWidth: number): void => {
    setLineWidthState(nextLineWidth);
    controllerRef.current?.setStyle({ lineWidth: nextLineWidth });
  }, []);

  const setOpacity = useCallback((nextOpacity: number): void => {
    const opacityValue = Math.min(Math.max(nextOpacity, 0), 1);

    setOpacityState(opacityValue);
    controllerRef.current?.setStyle({ opacity: opacityValue });
  }, []);

  const setTextAlign = useCallback((nextTextAlign: TextAlign): void => {
    setTextAlignState(nextTextAlign);
    controllerRef.current?.setTextAlign(nextTextAlign);
  }, []);

  const clearScene = useCallback((): void => {
    storeRef.current?.clear();
    controllerRef.current?.refreshSelection();
  }, []);

  const exportPng = useCallback((): void => {
    controllerRef.current?.exportPng();
  }, []);

  const copySelection = useCallback((): void => {
    controllerRef.current?.copySelection();
  }, []);

  const deleteSelection = useCallback((): void => {
    controllerRef.current?.deleteSelection();
  }, []);

  const zoomIn = useCallback((): void => {
    controllerRef.current?.zoomIn();
  }, []);

  const zoomOut = useCallback((): void => {
    controllerRef.current?.zoomOut();
  }, []);

  const resetZoom = useCallback((): void => {
    controllerRef.current?.resetZoom();
  }, []);

  const updateSelectionLayer = useCallback<EditorRuntime["updateSelectionLayer"]>((command) => {
    controllerRef.current?.updateSelectionLayer(command);
  }, []);

  const runtime = useMemo<EditorRuntime>(
    () => ({
      activeTool,
      canvasRef,
      clearScene,
      copySelection,
      deleteSelection,
      exportPng,
      fillColor,
      hasSelection,
      hasTextSelection,
      isPanning,
      lineWidth,
      mixedObjectSettings,
      opacity,
      saveState,
      setFillColor,
      setLineWidth,
      setOpacity,
      setStrokeColor,
      setTextAlign,
      setTool,
      selectionCount,
      strokeColor,
      textAlign,
      textEditorRef,
      updateSelectionLayer,
      zoom,
      zoomIn,
      zoomOut,
      resetZoom,
    }),
    [
      activeTool,
      clearScene,
      copySelection,
      deleteSelection,
      exportPng,
      fillColor,
      hasSelection,
      hasTextSelection,
      isPanning,
      lineWidth,
      mixedObjectSettings,
      opacity,
      resetZoom,
      saveState,
      selectionCount,
      setFillColor,
      setLineWidth,
      setOpacity,
      setStrokeColor,
      setTextAlign,
      setTool,
      strokeColor,
      textAlign,
      updateSelectionLayer,
      zoom,
      zoomIn,
      zoomOut,
    ],
  );

  return <EditorRuntimeContext.Provider value={runtime}>{children}</EditorRuntimeContext.Provider>;
}

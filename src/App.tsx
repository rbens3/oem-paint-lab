import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import AppShell from "./components/AppShell";
import { paints } from "./data/paints";
import useMyColors from "./hooks/useMyColors";
import { normalizeHex } from "./lib/color";
import { DEFAULT_LIBRARY_STATE, type LibraryState } from "./lib/paint";
import type {
  AppRoute,
  AppView,
  ColorTarget,
  CustomColor,
  CustomColorInput,
  HexColor,
  PaintRecord,
  PaintSelection,
} from "./types";
import Compare from "./views/Compare";
import CustomColorDetail from "./views/CustomColorDetail";
import Lab from "./views/Lab";
import Library from "./views/Library";
import Methodology from "./views/Methodology";
import MyColors from "./views/MyColors";
import PaintDetail from "./views/PaintDetail";

const DEFAULT_PAINT = paints.find((paint) => paint.id === 2) ?? paints[0];

type PrimaryView = Exclude<AppView, "paint" | "custom">;

const isPrimaryView = (value: string): value is PrimaryView =>
  ["library", "my-colors", "lab", "compare", "methodology"].includes(value);

const getRouteKey = (route: AppRoute) => {
  if (route.view === "paint") {
    return `paint/${route.paintId}`;
  }
  if (route.view === "custom") {
    return `my-colors/custom/${route.customId}`;
  }
  return route.view;
};

const setWindowScrollImmediately = (top: number) => {
  const root = document.documentElement;
  const previousScrollBehavior = root.style.scrollBehavior;

  root.style.scrollBehavior = "auto";
  window.scrollTo({ top, left: 0, behavior: "auto" });
  root.style.scrollBehavior = previousScrollBehavior;
};

const getRouteFromHash = (): AppRoute => {
  const value = window.location.hash.replace(/^#\/?/, "").toLowerCase();
  const [view, segment, id] = value.split("/");

  if (view === "paint" && segment) {
    const paintId = Number(segment);
    if (Number.isInteger(paintId) && paints.some((paint) => paint.id === paintId)) {
      return { view: "paint", paintId };
    }
    return { view: "library" };
  }

  if (view === "my-colors" && segment === "custom" && id) {
    try {
      return { view: "custom", customId: decodeURIComponent(id) };
    } catch {
      return { view: "my-colors" };
    }
  }

  return { view: isPrimaryView(view) ? view : "library" };
};

export default function App() {
  const [route, setRoute] = useState<AppRoute>(getRouteFromHash);
  const [libraryState, setLibraryState] = useState<LibraryState>(() => ({
    ...DEFAULT_LIBRARY_STATE,
  }));
  const previousRouteRef = useRef<AppRoute | null>(null);
  const libraryScrollRef = useRef<number | null>(null);
  const myColorsScrollRef = useRef<number | null>(null);
  const paintDetailOriginRef = useRef<"library" | "my-colors">("library");
  const [selection, setSelection] = useState<PaintSelection>({
    hex: DEFAULT_PAINT.hex || "#6B8BC0",
    paint: DEFAULT_PAINT,
    customColor: null,
  });
  const myColors = useMyColors();
  const savedPaints = useMemo(
    () =>
      myColors.data.savedPaints.flatMap((saved) => {
        const paint = paints.find((item) => item.id === saved.paintId);
        return paint ? [paint] : [];
      }),
    [myColors.data.savedPaints],
  );

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    if (!window.location.hash) {
      window.history.replaceState(null, "", "#/library");
    }

    const handleHashChange = () => setRoute(getRouteFromHash());
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useLayoutEffect(() => {
    const previousRoute = previousRouteRef.current;
    const isDuplicateRoute =
      previousRoute && getRouteKey(previousRoute) === getRouteKey(route);

    if (isDuplicateRoute) {
      return;
    }

    if (route.view === "paint" || route.view === "custom") {
      setWindowScrollImmediately(0);
    } else if (
      route.view === "library" &&
      previousRoute?.view === "paint" &&
      paintDetailOriginRef.current === "library" &&
      libraryScrollRef.current !== null
    ) {
      setWindowScrollImmediately(libraryScrollRef.current);
    } else if (
      route.view === "my-colors" &&
      (previousRoute?.view === "custom" ||
        (previousRoute?.view === "paint" &&
          paintDetailOriginRef.current === "my-colors")) &&
      myColorsScrollRef.current !== null
    ) {
      setWindowScrollImmediately(myColorsScrollRef.current);
    } else if (previousRoute) {
      setWindowScrollImmediately(0);

      if (route.view === "library") {
        libraryScrollRef.current = null;
      }
      if (route.view === "my-colors") {
        myColorsScrollRef.current = null;
      }
    }

    previousRouteRef.current = route;
  }, [route]);

  useEffect(() => {
    const detailPaint =
      route.view === "paint"
        ? paints.find((paint) => paint.id === route.paintId)
        : null;
    const detailCustom =
      route.view === "custom"
        ? myColors.data.customColors.find((color) => color.id === route.customId)
        : null;
    const label = detailPaint
      ? detailPaint.name
      : detailCustom
        ? detailCustom.name
        : route.view === "my-colors"
          ? "My Colors"
          : route.view.charAt(0).toUpperCase() + route.view.slice(1);
    document.title = `${label} — OEM Paint Lab`;
  }, [myColors.data.customColors, route]);

  useEffect(() => {
    if (route.view === "paint") {
      const paint = paints.find((item) => item.id === route.paintId);
      if (paint) {
        setSelection({ hex: paint.hex, paint, customColor: null });
      }
    } else if (route.view === "custom") {
      const color = myColors.data.customColors.find(
        (item) => item.id === route.customId,
      );
      if (color) {
        setSelection({ hex: color.hex, paint: null, customColor: color });
      }
    }
  }, [myColors.data.customColors, route]);

  const navigate = (view: AppView) => {
    const nextView =
      view === "paint" ? "library" : view === "custom" ? "my-colors" : view;
    setRoute({ view: nextView });
    const nextHash = `#/${nextView}`;
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
    }
  };

  const selectHex = (hex: HexColor) => {
    const normalized = normalizeHex(hex);
    if (!normalized) {
      return;
    }

    setSelection((current) => {
      const exactPaint = current.customColor
        ? null
        : paints.find((paint) => paint.hex.toUpperCase() === normalized) ?? null;
      return {
        hex: normalized,
        paint: exactPaint,
        customColor: current.customColor,
      };
    });
  };

  const selectPaint = (paint: PaintRecord) => {
    const normalized = normalizeHex(paint.hex);
    if (!normalized) {
      return;
    }
    setSelection({ hex: normalized, paint, customColor: null });
  };

  const selectCustomColor = (color: CustomColor) => {
    const normalized = normalizeHex(color.hex);
    if (!normalized) {
      return;
    }
    setSelection({ hex: normalized, paint: null, customColor: color });
  };

  const analyzePaint = (paint: PaintRecord) => {
    selectPaint(paint);
    navigate("lab");
  };

  const analyzeCustomColor = (color: CustomColor) => {
    selectCustomColor(color);
    navigate("lab");
  };

  const inspectPaint = (paint: PaintRecord) => {
    if (route.view === "library") {
      libraryScrollRef.current = window.scrollY;
      paintDetailOriginRef.current = "library";
    } else if (route.view === "my-colors") {
      myColorsScrollRef.current = window.scrollY;
      paintDetailOriginRef.current = "my-colors";
    } else if (route.view === "custom") {
      paintDetailOriginRef.current = "my-colors";
    } else if (route.view !== "paint") {
      libraryScrollRef.current = null;
      paintDetailOriginRef.current = "library";
    }

    selectPaint(paint);
    setRoute({ view: "paint", paintId: paint.id });
    const nextHash = `#/paint/${paint.id}`;
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
    }
  };

  const comparePaint = (paint: PaintRecord) => {
    selectPaint(paint);
    navigate("compare");
  };

  const compareCustomColor = (color: CustomColor) => {
    selectCustomColor(color);
    navigate("compare");
  };

  const inspectCustomColor = (color: CustomColor) => {
    if (route.view === "my-colors") {
      myColorsScrollRef.current = window.scrollY;
    }
    selectCustomColor(color);
    setRoute({ view: "custom", customId: color.id });
    const nextHash = `#/my-colors/custom/${encodeURIComponent(color.id)}`;
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
    }
  };

  const saveCustomColor = (input: CustomColorInput) => {
    const color = myColors.createCustomColor(input);
    selectCustomColor(color);
    return color;
  };

  const updateCustomColor = (id: string, input: CustomColorInput) => {
    const updated = myColors.updateCustomColor(id, input);
    if (updated) {
      selectCustomColor(updated);
    }
    return updated;
  };

  const deleteCustomColor = (color: CustomColor) => {
    myColors.deleteCustomColor(color.id);
    if (selection.customColor?.id === color.id) {
      setSelection({ hex: color.hex, paint: null, customColor: null });
    }
    navigate("my-colors");
  };

  const selectedTarget: ColorTarget | null = selection.customColor
    ? { kind: "custom", color: selection.customColor }
    : selection.paint
      ? { kind: "archive", paint: selection.paint }
      : null;

  const view = (() => {
    switch (route.view) {
      case "library":
        return (
          <Library
            onInspectPaint={inspectPaint}
            state={libraryState}
            onStateChange={setLibraryState}
          />
        );
      case "my-colors":
        return (
          <MyColors
            savedPaints={savedPaints}
            customColors={myColors.data.customColors}
            initialHex={selection.hex}
            storageStatus={myColors.storageStatus}
            onOpenLibrary={() => navigate("library")}
            onInspectPaint={inspectPaint}
            onOpenPaintInLab={analyzePaint}
            onComparePaint={comparePaint}
            onRemovePaint={(paint) => myColors.removeArchivePaint(paint.id)}
            onCreateCustom={saveCustomColor}
            onInspectCustom={inspectCustomColor}
            onOpenCustomInLab={analyzeCustomColor}
            onCompareCustom={compareCustomColor}
          />
        );
      case "compare":
        return (
          <Compare
            selectedTarget={selectedTarget}
            customColors={myColors.data.customColors}
            onAnalyzeTarget={(target) =>
              target.kind === "archive"
                ? analyzePaint(target.paint)
                : analyzeCustomColor(target.color)
            }
          />
        );
      case "methodology":
        return <Methodology />;
      case "paint": {
        const paint = paints.find((item) => item.id === route.paintId) ?? paints[0];
        return (
          <PaintDetail
            paint={paint}
            backLabel={
              paintDetailOriginRef.current === "my-colors"
                ? "Back to My Colors"
                : "Back to Library"
            }
            onBack={() => navigate(paintDetailOriginRef.current)}
            onOpenInLab={analyzePaint}
            onComparePaint={comparePaint}
            onInspectPaint={inspectPaint}
            isSaved={myColors.isArchivePaintSaved(paint.id)}
            onToggleSaved={() =>
              myColors.isArchivePaintSaved(paint.id)
                ? myColors.removeArchivePaint(paint.id)
                : myColors.saveArchivePaint(paint.id)
            }
          />
        );
      }
      case "custom": {
        const color = myColors.data.customColors.find(
          (item) => item.id === route.customId,
        );
        if (!color) {
          return (
            <div className="view missing-color-view">
              <section className="view-intro">
                <div>
                  <h1>Color not found</h1>
                  <p>This custom color is not available in local browser storage.</p>
                </div>
              </section>
              <button
                type="button"
                className="button button--primary"
                onClick={() => navigate("my-colors")}
              >
                Back to My Colors
              </button>
            </div>
          );
        }
        return (
          <CustomColorDetail
            color={color}
            onBack={() => navigate("my-colors")}
            onOpenInLab={analyzeCustomColor}
            onCompare={compareCustomColor}
            onEdit={updateCustomColor}
            onDelete={deleteCustomColor}
            onInspectPaint={inspectPaint}
            onOpenPaintInLab={analyzePaint}
          />
        );
      }
      case "lab":
      default:
        return (
          <Lab
            selectedHex={selection.hex}
            selectedPaint={selection.paint}
            selectedCustomColor={selection.customColor}
            onHexChange={selectHex}
            onAnalyzePaint={analyzePaint}
            onInspectPaint={inspectPaint}
            onCreateCustomColor={saveCustomColor}
            onUpdateCustomColor={updateCustomColor}
          />
        );
    }
  })();

  return (
    <AppShell
      activeView={route.view}
      selectedHex={selection.hex}
      onNavigate={navigate}
      onSelectPaint={selectPaint}
    >
      {view}
    </AppShell>
  );
}

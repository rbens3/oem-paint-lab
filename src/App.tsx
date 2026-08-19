import { useEffect, useLayoutEffect, useRef, useState } from "react";
import AppShell from "./components/AppShell";
import { paints } from "./data/paints";
import { normalizeHex } from "./lib/color";
import { DEFAULT_LIBRARY_STATE, type LibraryState } from "./lib/paint";
import type { AppRoute, AppView, HexColor, PaintRecord } from "./types";
import Compare from "./views/Compare";
import Lab from "./views/Lab";
import Library from "./views/Library";
import Methodology from "./views/Methodology";
import PaintDetail from "./views/PaintDetail";

const DEFAULT_PAINT = paints.find((paint) => paint.id === 2) ?? paints[0];

const isPrimaryView = (value: string): value is Exclude<AppView, "paint"> =>
  ["lab", "library", "compare", "methodology"].includes(value);

const getRouteKey = (route: AppRoute) =>
  route.view === "paint" ? `paint/${route.paintId}` : route.view;

const setWindowScrollImmediately = (top: number) => {
  const root = document.documentElement;
  const previousScrollBehavior = root.style.scrollBehavior;

  root.style.scrollBehavior = "auto";
  window.scrollTo({ top, left: 0, behavior: "auto" });
  root.style.scrollBehavior = previousScrollBehavior;
};

const getRouteFromHash = (): AppRoute => {
  const value = window.location.hash.replace(/^#\/?/, "").toLowerCase();
  const [view, id] = value.split("/");

  if (view === "paint" && id) {
    const paintId = Number(id);
    if (Number.isInteger(paintId) && paints.some((paint) => paint.id === paintId)) {
      return { view: "paint", paintId };
    }
    return { view: "library" };
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
  const [selection, setSelection] = useState<{
    hex: HexColor;
    paint: PaintRecord | null;
  }>({
    hex: DEFAULT_PAINT.hex || "#6B8BC0",
    paint: DEFAULT_PAINT,
  });

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

    if (route.view === "paint") {
      setWindowScrollImmediately(0);
    } else if (
      route.view === "library" &&
      previousRoute?.view === "paint" &&
      libraryScrollRef.current !== null
    ) {
      setWindowScrollImmediately(libraryScrollRef.current);
    } else if (previousRoute) {
      setWindowScrollImmediately(0);

      if (route.view === "library" || previousRoute.view === "paint") {
        libraryScrollRef.current = null;
      }
    }

    previousRouteRef.current = route;
  }, [route]);

  useEffect(() => {
    const detailPaint =
      route.view === "paint"
        ? paints.find((paint) => paint.id === route.paintId)
        : null;
    const label = detailPaint
      ? detailPaint.name
      : route.view.charAt(0).toUpperCase() + route.view.slice(1);
    document.title = `${label} — OEM Paint Lab`;
  }, [route]);

  useEffect(() => {
    if (route.view !== "paint") {
      return;
    }

    const paint = paints.find((item) => item.id === route.paintId);
    if (paint) {
      setSelection({ hex: paint.hex, paint });
    }
  }, [route]);

  const navigate = (view: AppView) => {
    const nextView = view === "paint" ? "library" : view;
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

    const exactPaint =
      paints.find((paint) => paint.hex.toUpperCase() === normalized) ?? null;
    setSelection({ hex: normalized, paint: exactPaint });
  };

  const selectPaint = (paint: PaintRecord) => {
    const normalized = normalizeHex(paint.hex);
    if (!normalized) {
      return;
    }
    setSelection({ hex: normalized, paint });
  };

  const analyzePaint = (paint: PaintRecord) => {
    selectPaint(paint);
    navigate("lab");
  };

  const inspectPaint = (paint: PaintRecord) => {
    if (route.view === "library") {
      libraryScrollRef.current = window.scrollY;
    } else if (route.view !== "paint") {
      libraryScrollRef.current = null;
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
      case "compare":
        return (
          <Compare
            selectedPaint={selection.paint}
            onAnalyzePaint={analyzePaint}
          />
        );
      case "methodology":
        return <Methodology />;
      case "paint": {
        const paint = paints.find((item) => item.id === route.paintId) ?? paints[0];
        return (
          <PaintDetail
            paint={paint}
            onBackToLibrary={() => navigate("library")}
            onOpenInLab={analyzePaint}
            onComparePaint={comparePaint}
            onInspectPaint={inspectPaint}
          />
        );
      }
      case "lab":
      default:
        return (
          <Lab
            selectedHex={selection.hex}
            selectedPaint={selection.paint}
            onHexChange={selectHex}
            onAnalyzePaint={analyzePaint}
            onInspectPaint={inspectPaint}
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

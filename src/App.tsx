import { useEffect, useState } from "react";
import AppShell from "./components/AppShell";
import { paints } from "./data/paints";
import { normalizeHex } from "./lib/color";
import type { AppRoute, AppView, HexColor, PaintRecord } from "./types";
import Compare from "./views/Compare";
import Lab from "./views/Lab";
import Library from "./views/Library";
import Methodology from "./views/Methodology";
import PaintDetail from "./views/PaintDetail";

const DEFAULT_PAINT = paints.find((paint) => paint.id === 2) ?? paints[0];

const isPrimaryView = (value: string): value is Exclude<AppView, "paint"> =>
  ["lab", "library", "compare", "methodology"].includes(value);

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

  return { view: isPrimaryView(view) ? view : "lab" };
};

export default function App() {
  const [route, setRoute] = useState<AppRoute>(getRouteFromHash);
  const [selection, setSelection] = useState<{
    hex: HexColor;
    paint: PaintRecord | null;
  }>({
    hex: DEFAULT_PAINT.hex || "#6B8BC0",
    paint: DEFAULT_PAINT,
  });

  useEffect(() => {
    if (!window.location.hash) {
      window.history.replaceState(null, "", "#/lab");
    }

    const handleHashChange = () => setRoute(getRouteFromHash());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

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
    window.scrollTo({ top: 0, behavior: "auto" });
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
    selectPaint(paint);
    setRoute({ view: "paint", paintId: paint.id });
    const nextHash = `#/paint/${paint.id}`;
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
    }
    window.scrollTo({ top: 0, behavior: "auto" });
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
            onAnalyzePaint={analyzePaint}
            onInspectPaint={inspectPaint}
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

import { useEffect, useState } from "react";
import AppShell from "./components/AppShell";
import { paints } from "./data/paints";
import { normalizeHex } from "./lib/color";
import type { AppView, HexColor, PaintRecord } from "./types";
import Compare from "./views/Compare";
import Lab from "./views/Lab";
import Library from "./views/Library";
import Methodology from "./views/Methodology";

const DEFAULT_PAINT = paints.find((paint) => paint.id === 2) ?? paints[0];

const isAppView = (value: string): value is AppView =>
  ["lab", "library", "compare", "methodology"].includes(value);

const getViewFromHash = (): AppView => {
  const value = window.location.hash.replace(/^#\/?/, "").toLowerCase();
  return isAppView(value) ? value : "lab";
};

export default function App() {
  const [activeView, setActiveView] = useState<AppView>(getViewFromHash);
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

    const handleHashChange = () => setActiveView(getViewFromHash());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    const label = activeView.charAt(0).toUpperCase() + activeView.slice(1);
    document.title = `${label} — OEM Paint Lab`;
  }, [activeView]);

  const navigate = (view: AppView) => {
    setActiveView(view);
    const nextHash = `#/${view}`;
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

  const view = (() => {
    switch (activeView) {
      case "library":
        return <Library onAnalyzePaint={analyzePaint} />;
      case "compare":
        return (
          <Compare selectedPaint={selection.paint} onAnalyzePaint={analyzePaint} />
        );
      case "methodology":
        return <Methodology />;
      case "lab":
      default:
        return (
          <Lab
            selectedHex={selection.hex}
            selectedPaint={selection.paint}
            onHexChange={selectHex}
            onSelectPaint={selectPaint}
          />
        );
    }
  })();

  return (
    <AppShell
      activeView={activeView}
      selectedHex={selection.hex}
      onNavigate={navigate}
      onSelectPaint={selectPaint}
    >
      {view}
    </AppShell>
  );
}

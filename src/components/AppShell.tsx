import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { paints } from "../data/paints";
import { isLightHex } from "../lib/color";
import {
  getPaintDisplayGroup,
  getPaintDisplayName,
  getPaintSearchText,
} from "../lib/paint";
import type { AppView, HexColor, PaintRecord } from "../types";

const NAV_ITEMS: { id: AppView; label: string; description: string }[] = [
  { id: "library", label: "Library", description: "Browse the paint archive" },
  { id: "my-colors", label: "My Colors", description: "Open saved colors" },
  { id: "lab", label: "Lab", description: "Analyze a color" },
  { id: "compare", label: "Compare", description: "Measure two paints" },
  { id: "methodology", label: "Methodology", description: "Review the method" },
];

type ShellStyle = CSSProperties & {
  "--color-paint": string;
  "--color-paint-ink": string;
};

interface AppShellProps {
  activeView: AppView;
  selectedHex: HexColor;
  onNavigate: (view: AppView) => void;
  onSelectPaint: (paint: PaintRecord) => void;
  children: ReactNode;
}

interface CommandItem {
  id: string;
  label: string;
  meta: string;
  action: () => void;
}

export default function AppShell({
  activeView,
  selectedHex,
  onNavigate,
  onSelectPaint,
  children,
}: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [activeCommand, setActiveCommand] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const navigate = (view: AppView) => {
    setMobileMenuOpen(false);
    onNavigate(view);
  };

  const closeCommandPalette = () => {
    dialogRef.current?.close();
    setCommandQuery("");
    setActiveCommand(0);
  };

  const openCommandPalette = () => {
    if (!dialogRef.current?.open) {
      dialogRef.current?.showModal();
      window.requestAnimationFrame(() => searchRef.current?.focus());
    }
  };

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openCommandPalette();
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  const commands = useMemo<CommandItem[]>(() => {
    const query = commandQuery.trim().toLocaleLowerCase();
    const viewCommands = NAV_ITEMS.filter(
      (item) =>
        !query ||
        item.label.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query),
    ).map((item) => ({
      id: `view-${item.id}`,
      label: item.label,
      meta: item.description,
      action: () => {
        navigate(item.id);
        closeCommandPalette();
      },
    }));

    const paintCommands = paints
      .filter(
        (paint) =>
          query && getPaintSearchText(paint).includes(query),
      )
      .slice(0, 8)
      .map((paint) => ({
        id: `paint-${paint.id}`,
        label: getPaintDisplayName(paint),
        meta: `${getPaintDisplayGroup(paint)} · ${paint.hex}`,
        action: () => {
          onSelectPaint(paint);
          navigate("lab");
          closeCommandPalette();
        },
      }));

    return [...viewCommands, ...paintCommands];
  }, [commandQuery, onSelectPaint]);

  useEffect(() => {
    setActiveCommand(0);
  }, [commandQuery]);

  const handleCommandKeys = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveCommand((current) =>
        commands.length ? (current + 1) % commands.length : 0,
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveCommand((current) =>
        commands.length ? (current - 1 + commands.length) % commands.length : 0,
      );
    } else if (event.key === "Enter" && commands[activeCommand]) {
      event.preventDefault();
      commands[activeCommand].action();
    }
  };

  const shellStyle: ShellStyle = {
    "--color-paint": selectedHex,
    "--color-paint-ink": isLightHex(selectedHex)
      ? "var(--color-ink)"
      : "var(--color-graphite-ink)",
  };

  return (
    <div className="app-shell" style={shellStyle}>
      <header className="app-header">
        <div className="app-header__inner">
          <a
            href="#/library"
            className="wordmark"
            aria-label="OEM Paint Lab home"
            onClick={() => navigate("library")}
          >
            <span className="wordmark__signal" aria-hidden="true" />
            <span>OEM Paint Lab</span>
          </a>

          <nav className="primary-nav" aria-label="Primary navigation">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#/${item.id}`}
                className="primary-nav__link"
                aria-current={
                  activeView === item.id ||
                  (activeView === "custom" && item.id === "my-colors")
                    ? "page"
                    : undefined
                }
                onClick={() => navigate(item.id)}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="app-header__actions">
            <button
              type="button"
              className="command-trigger"
              onClick={openCommandPalette}
              aria-label="Search pages and paint records"
            >
              <span>Search</span>
              <kbd>⌘ K</kbd>
            </button>
            <button
              type="button"
              className="mobile-menu-trigger"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              {mobileMenuOpen ? "Close" : "Menu"}
            </button>
          </div>
        </div>

        <nav
          id="mobile-navigation"
          className="mobile-nav"
          aria-label="Mobile navigation"
          data-open={mobileMenuOpen}
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#/${item.id}`}
              className="mobile-nav__link"
              aria-current={
                activeView === item.id ||
                (activeView === "custom" && item.id === "my-colors")
                  ? "page"
                  : undefined
              }
              onClick={() => navigate(item.id)}
            >
              <span>{item.label}</span>
              <span>{item.description}</span>
            </a>
          ))}
        </nav>
      </header>

      <main className="app-main">{children}</main>

      <footer className="app-footer">
        <div className="app-footer__inner">
          <span>OEM Paint Lab</span>
          <span>{paints.length} paint records · CIELAB D65 · CIEDE2000</span>
          <span>Digital color reference tool</span>
        </div>
      </footer>

      <dialog
        ref={dialogRef}
        className="command-dialog"
        aria-labelledby="command-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            closeCommandPalette();
          }
        }}
        onClose={() => {
          setCommandQuery("");
          setActiveCommand(0);
        }}
      >
        <div className="command-dialog__surface">
          <div className="command-dialog__header">
            <div>
              <h2 id="command-title">Open a view or paint</h2>
              <p>
                Search all {paints.length} records by paint, code, manufacturer,
                team, series, or HEX.
              </p>
            </div>
            <button
              type="button"
              className="icon-button"
              onClick={closeCommandPalette}
              aria-label="Close search"
            >
              Esc
            </button>
          </div>
          <label className="field-label" htmlFor="command-search">
            Search
          </label>
          <input
            ref={searchRef}
            id="command-search"
            className="text-input command-dialog__input"
            type="search"
            value={commandQuery}
            onChange={(event) => setCommandQuery(event.target.value)}
            onKeyDown={handleCommandKeys}
            placeholder="Riviera Blue or #018ADA"
            autoComplete="off"
            aria-controls="command-results"
            aria-activedescendant={commands[activeCommand]?.id}
          />
          <div
            id="command-results"
            className="command-results"
            role="listbox"
            aria-label="Search results"
          >
            {commands.length ? (
              commands.map((command, index) => (
                <button
                  key={command.id}
                  id={command.id}
                  type="button"
                  role="option"
                  aria-selected={index === activeCommand}
                  className="command-result"
                  onMouseEnter={() => setActiveCommand(index)}
                  onClick={command.action}
                >
                  <span>{command.label}</span>
                  <span>{command.meta}</span>
                </button>
              ))
            ) : (
              <p className="command-results__empty">
                No matching paint or view. Search by a shorter name or a six-digit HEX.
              </p>
            )}
          </div>
          <p className="command-dialog__hint">
            ↑ ↓ move · Enter open · Esc close
          </p>
        </div>
      </dialog>
    </div>
  );
}

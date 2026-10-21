import { useTheme } from "../context/ThemeContext";
import { ACCENTS, APP_NAME } from "../lib/constants";
import { cn } from "../lib/utils";
import { CheckIcon, XIcon } from "./icons";

/** "Accent theme" picker modal — 11 accent colors in a 4-column grid. */
export default function AccentThemeModal({ open, onClose }) {
  const { accentId, setAccentId } = useTheme();

  if (!open) return null;

  return (
    <div
      className="animate-fade fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="animate-pop w-full max-w-[470px] rounded-2xl border border-line bg-panel p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Accent theme"
      >
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-bold text-ink">Accent theme</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 -mt-1 grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-surface hover:text-ink"
          >
            <XIcon className="h-[18px] w-[18px]" />
          </button>
        </div>

        <div className="mt-4 border-t border-line pt-4">
          <p className="mb-5 text-sm leading-relaxed text-muted">
            Primary actions, focus rings and your sent messages use the accent color —
            pick the one that fits {APP_NAME} best.
          </p>

          <div className="grid grid-cols-4 gap-2">
            {ACCENTS.map((accent) => {
              const selected = accent.id === accentId;
              return (
                <button
                  key={accent.id}
                  type="button"
                  onClick={() => setAccentId(accent.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl p-2 transition hover:bg-surface",
                    selected && "ring-2 ring-accent",
                  )}
                >
                  <span className="relative">
                    <span
                      className="block h-14 w-14 rounded-full"
                      style={{
                        background: `linear-gradient(145deg, color-mix(in srgb, ${accent.hex} 55%, white), ${accent.hex})`,
                      }}
                    />
                    {selected && (
                      <span className="absolute -right-0.5 -top-0.5 grid h-5 w-5 place-items-center rounded-full bg-accent text-accent-ink ring-2 ring-panel">
                        <CheckIcon className="h-3 w-3" />
                      </span>
                    )}
                  </span>
                  <span className="text-xs font-medium text-ink">{accent.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useTheme } from "../context/ThemeContext";
import { cn } from "../lib/utils";
import { MoonIcon, SunIcon } from "./icons";

/** Segmented sun / moon control from the UI reference. */
export default function ThemeToggle() {
  const { mode, setMode } = useTheme();

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-line bg-input p-1">
      <button
        type="button"
        onClick={() => setMode("light")}
        title="Light mode"
        aria-label="Light mode"
        className={cn(
          "grid h-7 w-7 place-items-center rounded-full transition",
          mode === "light"
            ? "bg-accent text-accent-ink shadow"
            : "text-muted hover:text-ink",
        )}
      >
        <SunIcon className="h-[15px] w-[15px]" />
      </button>
      <button
        type="button"
        onClick={() => setMode("dark")}
        title="Dark mode"
        aria-label="Dark mode"
        className={cn(
          "grid h-7 w-7 place-items-center rounded-full transition",
          mode === "dark"
            ? "bg-accent text-accent-ink shadow"
            : "text-muted hover:text-ink",
        )}
      >
        <MoonIcon className="h-[15px] w-[15px]" />
      </button>
    </div>
  );
}

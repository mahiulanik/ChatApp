import { useState } from "react";
import AccentThemeModal from "./AccentThemeModal";
import IconButton from "./IconButton";
import ThemeToggle from "./ThemeToggle";
import { cn } from "../lib/utils";
import { PaletteIcon } from "./icons";

/**
 * Accent + theme controls shared by the landing top bar
 * and the chat header (wallpaper toggle removed on purpose).
 */
export default function AppActions({ className = "" }) {
  const [accentOpen, setAccentOpen] = useState(false);

  return (
    <>
      <div className={cn("flex items-center gap-1", className)}>
        <IconButton label="Accent theme" onClick={() => setAccentOpen(true)}>
          <PaletteIcon />
        </IconButton>
        <ThemeToggle />
      </div>

      <AccentThemeModal open={accentOpen} onClose={() => setAccentOpen(false)} />
    </>
  );
}

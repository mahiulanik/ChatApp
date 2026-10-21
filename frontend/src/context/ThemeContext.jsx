import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ACCENTS } from "../lib/constants";

const ThemeContext = createContext(null);

const STORAGE_KEYS = {
  mode: "mx-theme",
  accent: "mx-accent",
  wallpaper: "mx-wallpaper",
  sound: "mx-sound",
};

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private mode etc. — persistence is optional.
  }
}

export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState(() => readStorage(STORAGE_KEYS.mode, "dark"));
  const [accentId, setAccentIdState] = useState(() =>
    readStorage(STORAGE_KEYS.accent, "default"),
  );
  const [wallpaper, setWallpaperState] = useState(
    () => readStorage(STORAGE_KEYS.wallpaper, "on") !== "off",
  );
  const [sound, setSoundState] = useState(
    () => readStorage(STORAGE_KEYS.sound, "on") !== "off",
  );

  // Dark / light
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = mode;
    root.style.colorScheme = mode;
    writeStorage(STORAGE_KEYS.mode, mode);
  }, [mode]);

  // Accent color (drives --accent + derived tokens in index.css)
  useEffect(() => {
    const accent = ACCENTS.find((a) => a.id === accentId) || ACCENTS[0];
    const root = document.documentElement;
    root.style.setProperty("--accent", accent.hex);
    root.style.setProperty("--accent-ink", accent.ink);
    writeStorage(STORAGE_KEYS.accent, accentId);
  }, [accentId]);

  useEffect(() => writeStorage(STORAGE_KEYS.wallpaper, wallpaper ? "on" : "off"), [wallpaper]);
  useEffect(() => writeStorage(STORAGE_KEYS.sound, sound ? "on" : "off"), [sound]);

  const setMode = useCallback((next) => setModeState(next === "light" ? "light" : "dark"), []);
  const toggleMode = useCallback(
    () => setModeState((prev) => (prev === "dark" ? "light" : "dark")),
    [],
  );
  const setAccentId = useCallback((id) => setAccentIdState(id), []);
  const toggleWallpaper = useCallback(() => setWallpaperState((p) => !p), []);
  const toggleSound = useCallback(() => setSoundState((p) => !p), []);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      toggleMode,
      accentId,
      setAccentId,
      accent: ACCENTS.find((a) => a.id === accentId) || ACCENTS[0],
      wallpaper,
      toggleWallpaper,
      sound,
      toggleSound,
    }),
    [mode, setMode, toggleMode, accentId, setAccentId, wallpaper, toggleWallpaper, sound, toggleSound],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- context hook
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}

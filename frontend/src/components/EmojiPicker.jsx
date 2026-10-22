import { useEffect, useMemo, useRef, useState } from "react";
import { EMOJI_GROUPS, searchEmojis } from "../lib/emojis";
import { cn } from "../lib/utils";
import { SearchIcon, XIcon } from "./icons";

/**
 * Lightweight curated emoji picker (no heavy dependency).
 * Enter picks the first visible emoji; Escape closes.
 */
export default function EmojiPicker({ onPick, onClose }) {
  const [query, setQuery] = useState("");
  const [activeGroupId, setActiveGroupId] = useState(EMOJI_GROUPS[0].id);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const searching = query.trim().length > 0;
  const results = useMemo(
    () => (searching ? searchEmojis(query) : []),
    [query, searching],
  );
  const activeGroup = useMemo(
    () => EMOJI_GROUPS.find((g) => g.id === activeGroupId) || EMOJI_GROUPS[0],
    [activeGroupId],
  );
  const visible = searching ? results : activeGroup.emojis;

  const onSearchKeyDown = (e) => {
    if (e.key === "Enter" && visible[0]) {
      e.preventDefault();
      onPick(visible[0].emoji);
    }
  };

  return (
    <div
      role="dialog"
      aria-label="Emoji picker"
      className="flex h-72 flex-col bg-panel"
    >
      {/* Search */}
      <div className="relative shrink-0 border-b border-line">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onSearchKeyDown}
          placeholder="Search emoji"
          aria-label="Search emoji"
          className="w-full bg-transparent py-2.5 pl-9 pr-9 text-sm text-ink placeholder:text-faint focus:outline-none"
        />
        {searching && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear emoji search"
            className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md text-muted transition hover:bg-surface hover:text-ink"
          >
            <XIcon className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex shrink-0 items-center justify-between gap-1 border-b border-line px-2 py-1.5">
        {EMOJI_GROUPS.map((group) => (
          <button
            key={group.id}
            type="button"
            onClick={() => {
              setActiveGroupId(group.id);
              setQuery("");
            }}
            aria-label={group.label}
            title={group.label}
            className={cn(
              "grid h-7 w-7 place-items-center rounded-lg text-base leading-none transition hover:bg-surface",
              !searching && activeGroupId === group.id && "bg-accent-soft",
            )}
          >
            {group.icon}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {visible.length === 0 ? (
          <p className="px-2 py-8 text-center text-xs text-muted">
            No emoji found
          </p>
        ) : (
          <div className="grid grid-cols-8 gap-0.5">
            {visible.map((item, i) => (
              <button
                key={`${item.emoji}-${i}`}
                type="button"
                onClick={() => onPick(item.emoji)}
                title={item.keywords.replaceAll("_", " ")}
                className="grid h-9 w-full place-items-center rounded-lg text-[22px] leading-none transition hover:bg-surface"
              >
                {item.emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

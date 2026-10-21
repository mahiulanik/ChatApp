import { cn } from "../lib/utils";

/** Round icon button used across the top bars. */
export default function IconButton({
  label,
  onClick,
  active = false,
  className = "",
  children,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-lg text-muted transition hover:bg-surface hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent",
        active && "text-ink",
        className,
      )}
    >
      {children}
    </button>
  );
}

import { cn, formatTime } from "../lib/utils";

/**
 * Single chat bubble. Text messages sit inside a pill; media messages get a
 * padded frame (gray for incoming, accent for outgoing) like the reference.
 */
export default function MessageBubble({ message, mine }) {
  const media = message.media;
  const hasText = Boolean(message.text?.trim());

  return (
    <div className={cn("msg-in flex", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[78%] rounded-2xl shadow-sm transition-opacity dark:shadow-none",
          media
            ? cn("p-1.5", mine ? "bg-accent" : "bg-surface")
            : cn(
                "px-3.5 py-2",
                mine ? "bg-accent text-accent-ink" : "bg-surface text-ink",
              ),
          message.pending && "opacity-70",
        )}
      >
        {media?.url &&
          (media.resourceType === "video" ? (
            <video
              src={media.url}
              controls
              preload="metadata"
              className="max-h-[320px] w-full max-w-[360px] rounded-xl bg-black"
            />
          ) : (
            <img
              src={media.url}
              alt=""
              className="max-h-[320px] max-w-full rounded-xl object-cover"
              loading="lazy"
            />
          ))}

        {hasText && (
          <p
            className={cn(
              "whitespace-pre-wrap break-words text-[15px] leading-snug",
              media ? "px-2 pb-1 pt-1.5" : "",
              mine ? "text-accent-ink" : "text-ink",
            )}
          >
            {message.text}
          </p>
        )}

        <div
          className={cn(
            "text-[11px]",
            media ? "px-2 pb-0.5" : "mt-0.5",
            mine ? "text-onaccent-muted" : "text-muted",
          )}
        >
          {formatTime(message.createdAt)}
        </div>
      </div>
    </div>
  );
}

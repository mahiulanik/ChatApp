import { useEffect, useMemo, useRef } from "react";
import { useChat } from "../context/ChatContext";
import { formatDayLabel } from "../lib/utils";
import MessageBubble from "./MessageBubble";

/** Scrollable message area grouped by day with a "TODAY" separator. */
export default function MessageList({ myId }) {
  const { messages, messagesLoading, selectedId } = useChat();
  const scrollRef = useRef(null);

  const groups = useMemo(() => {
    const result = [];
    for (const message of messages) {
      const label = formatDayLabel(message.createdAt);
      const last = result[result.length - 1];
      if (last && last.label === label) {
        last.items.push(message);
      } else {
        result.push({ label, items: [message] });
      }
    }
    return result;
  }, [messages]);

  // Stick to the newest message.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, selectedId, messagesLoading]);

  if (messagesLoading) {
    return (
      <div className="grid min-h-0 flex-1 place-items-center">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-transparent" />
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
        {groups.map((group) => (
          <div key={group.label} className="flex flex-col gap-3">
            <div className="py-2 text-center text-[11px] font-medium tracking-[0.18em] text-faint">
              {group.label}
            </div>
            {group.items.map((message) => (
              <MessageBubble
                key={message._id}
                message={message}
                mine={String(message.senderId) === String(myId)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

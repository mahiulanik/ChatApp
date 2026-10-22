import { useEffect, useMemo, useRef } from "react";
import { useChat } from "../context/ChatContext";
import { formatDayLabel } from "../lib/utils";
import MessageBubble from "./MessageBubble";

/** Scrollable message area grouped by day with a "TODAY" separator. */
export default function MessageList({ myId }) {
  const { messages, messagesLoading, selectedId, isTyping } = useChat();
  const scrollRef = useRef(null);
  const peerTyping = selectedId ? isTyping(selectedId) : false;

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

  // Stick to the newest message (also when the typing bubble appears).
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, selectedId, messagesLoading, peerTyping]);

  if (messagesLoading) {
    return (
      <div className="grid min-h-0 flex-1 place-items-center">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-transparent" />
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-9 py-4 sm:px-14">
      <div className="flex w-full flex-col gap-3">
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

        {peerTyping && (
          <div className="mt-3 flex justify-start">
            <div className="flex items-center gap-1.5 rounded-2xl bg-surface px-4 py-3 shadow-sm dark:shadow-none">
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted [animation-delay:0ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted [animation-delay:150ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted [animation-delay:300ms]" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

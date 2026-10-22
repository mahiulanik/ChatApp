import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "../context/ChatContext";
import { APP_NAME } from "../lib/constants";
import { cn } from "../lib/utils";
import EmojiPicker from "./EmojiPicker";
import { ImageIcon, SendIcon, SmileyIcon, XIcon } from "./icons";

const ACCEPTED = "image/*,video/*";

/** Composer: attach image/video, type, send (Enter = send, Shift+Enter = newline). */
export default function MessageInput() {
  const { selectedId, sendMessage, sendTyping } = useChat();
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const fileRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimerRef = useRef(null);
  const typingTargetRef = useRef(null);

  // One object URL per chosen file, revoked when it changes/unmounts.
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const canSend = Boolean(text.trim() || file) && !sending;

  const grow = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  };

  const pickFile = (e) => {
    const chosen = e.target.files?.[0] || null;
    setFile(chosen);
    e.target.value = "";
  };

  const clearFile = () => {
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  /** Insert an emoji at the caret (or at the end) and keep focus in the box. */
  const insertEmoji = (emoji) => {
    const el = textareaRef.current;
    const start = el?.selectionStart ?? text.length;
    const end = el?.selectionEnd ?? start;
    setText(text.slice(0, start) + emoji + text.slice(end));
    requestAnimationFrame(() => {
      el?.focus();
      const pos = start + emoji.length;
      el?.setSelectionRange(pos, pos);
      grow();
    });
  };

  /** Ping the peer while typing; auto-clears ~1.5s after the last keystroke. */
  const notifyTyping = () => {
    if (!selectedId) return;
    typingTargetRef.current = selectedId;
    sendTyping(selectedId, true);
    window.clearTimeout(typingTimerRef.current);
    typingTimerRef.current = window.setTimeout(() => {
      sendTyping(typingTargetRef.current, false);
      typingTargetRef.current = null;
    }, 1500);
  };

  const stopTypingNow = () => {
    window.clearTimeout(typingTimerRef.current);
    if (typingTargetRef.current) {
      sendTyping(typingTargetRef.current, false);
      typingTargetRef.current = null;
    }
  };

  // Best-effort cleanup when the composer unmounts (chat closed/switched).
  useEffect(
    () => () => {
      window.clearTimeout(typingTimerRef.current);
      if (typingTargetRef.current) sendTyping(typingTargetRef.current, false);
    },
    [sendTyping],
  );

  const submit = async () => {
    if (!canSend) return;
    stopTypingNow();
    const messageText = text;
    const attachment = file;
    setSending(true);
    setText("");
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    try {
      await sendMessage({ text: messageText, file: attachment });
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="relative shrink-0 border-t border-line bg-panel p-3">
      {file && (
        <div className="mb-2 flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2">
          {file.type.startsWith("image/") ? (
            <img
              src={previewUrl}
              alt=""
              className="h-10 w-10 rounded-lg object-cover"
            />
          ) : (
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-input text-muted">
              <ImageIcon className="h-5 w-5" />
            </span>
          )}
          <span className="min-w-0 flex-1 truncate text-sm text-ink">{file.name}</span>
          <button
            type="button"
            onClick={clearFile}
            aria-label="Remove attachment"
            className="grid h-7 w-7 place-items-center rounded-lg text-muted transition hover:bg-input hover:text-ink"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex items-start gap-2.5">
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPTED}
          className="hidden"
          onChange={pickFile}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          aria-label="Attach photo or video"
          title="Attach photo or video"
          className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line text-accent transition hover:bg-surface"
        >
          <ImageIcon />
        </button>

        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              grow();
              notifyTyping();
            }}
            onKeyDown={onKeyDown}
            placeholder={APP_NAME}
            aria-label="Message"
            className={cn(
              "max-h-[140px] min-h-10 w-full resize-none rounded-full border border-line bg-input px-5 py-2.5 pr-12 text-[15px] leading-6 text-ink placeholder:text-faint",
              "focus:outline-none focus:ring-2 focus:ring-accent",
            )}
          />

          {/* Emoji toggle — inside the field's right corner */}
          <button
            type="button"
            onClick={() => setEmojiOpen((o) => !o)}
            aria-label="Emoji"
            aria-expanded={emojiOpen}
            title="Emoji"
            className="absolute bottom-3 right-4 grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-surface hover:text-ink"
          >
            <SmileyIcon />
          </button>

          {emojiOpen && (
            <>
              {/* Click-away layer */}
              <div
                className="fixed inset-0 z-20"
                aria-hidden="true"
                onClick={() => setEmojiOpen(false)}
              />
              <div className="absolute bottom-full right-0 z-30 mb-2 w-[min(21rem,100%)] overflow-hidden rounded-2xl border border-line bg-panel shadow-2xl">
                <EmojiPicker
                  onPick={insertEmoji}
                  onClose={() => setEmojiOpen(false)}
                />
              </div>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={!canSend}
          aria-label="Send message"
          className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-accent-ink transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
}

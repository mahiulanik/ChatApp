import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "../context/ChatContext";
import { APP_NAME } from "../lib/constants";
import { cn } from "../lib/utils";
import { ImageIcon, SendIcon, XIcon } from "./icons";

const ACCEPTED = "image/*,video/*";

/** Composer: attach image/video, type, send (Enter = send, Shift+Enter = newline). */
export default function MessageInput() {
  const { sendMessage } = useChat();
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);
  const fileRef = useRef(null);
  const textareaRef = useRef(null);

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

  const submit = async () => {
    if (!canSend) return;
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
    <div className="shrink-0 border-t border-line bg-panel p-3">
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

      <div className="flex items-end gap-2.5">
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
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line text-accent transition hover:bg-surface"
        >
          <ImageIcon />
        </button>

        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            grow();
          }}
          onKeyDown={onKeyDown}
          placeholder={APP_NAME}
          aria-label="Message"
          className={cn(
            "max-h-[140px] min-h-10 flex-1 resize-none rounded-full border border-line bg-input px-5 py-2.5 text-[15px] leading-6 text-ink placeholder:text-faint",
            "focus:outline-none focus:ring-2 focus:ring-accent",
          )}
        />

        <button
          type="button"
          onClick={submit}
          disabled={!canSend}
          aria-label="Send message"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-accent-ink transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
}

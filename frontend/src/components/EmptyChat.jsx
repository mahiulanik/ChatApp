import { MessageIcon } from "./icons";

/** Placeholder shown when no conversation is open (Home Page.png). */
export default function EmptyChat() {
  return (
    <div className="grid min-h-0 flex-1 place-items-center px-6">
      <div className="flex flex-col items-center text-center">
        <div className="grid h-20 w-20 place-items-center rounded-2xl bg-accent-soft">
          <MessageIcon className="h-9 w-9 text-accent" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-ink">Select a chat to start</h2>
        <p className="mt-1.5 max-w-[290px] text-sm leading-relaxed text-muted">
          Pick a conversation from the list on the left to read messages and reply.
        </p>
      </div>
    </div>
  );
}

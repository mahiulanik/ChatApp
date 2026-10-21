import { useChat } from "../context/ChatContext";
import { useTheme } from "../context/ThemeContext";
import { cn } from "../lib/utils";
import AppActions from "./AppActions";
import Avatar from "./Avatar";
import IconButton from "./IconButton";
import Logo from "./Logo";
import { ChevronLeftIcon, VolumeIcon, VolumeOffIcon, XIcon } from "./icons";

/** Top bar of the conversation pane (Chat Page.png / Home Page.png). */
export default function ChatHeader({ user }) {
  const { isOnline, closeChat } = useChat();
  const { sound, toggleSound } = useTheme();
  const online = user ? isOnline(user._id) : false;

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-line bg-panel px-3 sm:px-4">
      {user && (
        <button
          type="button"
          onClick={closeChat}
          aria-label="Back to chats"
          className="-ml-1 grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted transition hover:bg-surface hover:text-ink md:hidden"
        >
          <ChevronLeftIcon />
        </button>
      )}

      {user ? (
        <>
          <Avatar user={user} size={40} online={online} />
          <div className="min-w-0 leading-tight">
            <div className="truncate text-[15px] font-bold text-ink">{user.fullName}</div>
            <div className={cn("text-xs", online ? "text-emerald-500" : "text-muted")}>
              {online ? "Online" : "Offline"}
            </div>
          </div>
        </>
      ) : (
        <>
          <Logo size={34} />
          <span className="truncate text-[15px] font-medium text-muted">
            Select a conversation
          </span>
        </>
      )}

      <div className="ml-auto flex items-center gap-1">
        <AppActions />
        <IconButton
          label={sound ? "Mute sounds" : "Unmute sounds"}
          onClick={toggleSound}
          active={sound}
        >
          {sound ? <VolumeIcon /> : <VolumeOffIcon />}
        </IconButton>
        {user && (
          <span className="hidden md:block">
            <IconButton label="Close chat" onClick={closeChat}>
              <XIcon />
            </IconButton>
          </span>
        )}
      </div>
    </header>
  );
}
